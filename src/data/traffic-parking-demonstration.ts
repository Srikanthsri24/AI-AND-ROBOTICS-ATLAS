import {trafficParkingSessionInitial,trafficParkingSessionAdvance,trafficParkingSessionOutputs,type TrafficParkingSession,type TrafficParkingSettings} from './traffic-parking-session';
import {trafficParkingCars,trafficParkingCarPath,trafficParkingCarParked,type ParkingCarPose} from './traffic-parking-vehicles';
import {gateMs} from './traffic-parking';
export type ParkingDemoSettings=Omit<TrafficParkingSettings,'entry'|'exit'>;
export type ParkingVehicleStage='offstage'|'waiting'|'reserved'|'entering'|'parked'|'leaving'|'awaiting-exit';
export type ParkingDemoVehicle={stage:ParkingVehicleStage;bay:number|null;progress:number};
export type TrafficParkingDemonstration={hardware:TrafficParkingSession;cars:readonly ParkingDemoVehicle[];request:'entry'|'exit'|null;pulseMs:number;releaseMs:number;exitCar:number|null;remainderMs:number;notice:string};
/** Authored hand movement at 120 mm/s. This is not a motor/vehicle sensor. */
export const trafficParkingModelMmPerMs=.12;
export function trafficParkingDemonstrationInitial():TrafficParkingDemonstration{return {hardware:trafficParkingSessionInitial(),cars:trafficParkingCars.map((_,n)=>({stage:n===0?'waiting':'offstage',bay:null,progress:0})),request:null,pulseMs:0,releaseMs:0,exitCar:null,remainderMs:0,notice:'Start with empty bays. Connect USB and complete the barrier checks before requesting Entry.'};}
const settingsWithButtons=(settings:ParkingDemoSettings,s:TrafficParkingDemonstration):TrafficParkingSettings=>({...settings,entry:s.request==='entry'&&s.pulseMs>0,exit:s.request==='exit'&&s.pulseMs>0});
const live=(s:TrafficParkingDemonstration,settings:ParkingDemoSettings)=>trafficParkingSessionOutputs(s.hardware,settingsWithButtons(settings,s)).powered;
const reservedCount=(s:TrafficParkingDemonstration)=>s.cars.filter(c=>!['offstage','waiting'].includes(c.stage)).length;
const consistent=(s:TrafficParkingDemonstration)=>s.hardware.controller?.occupied===reservedCount(s);
const busy=(s:TrafficParkingDemonstration)=>s.pulseMs>0||s.releaseMs>0||s.cars.some(c=>['reserved','entering','leaving','awaiting-exit'].includes(c.stage));
function blocked(s:TrafficParkingDemonstration,message:string){return {...s,notice:message};}
export function trafficParkingDemonstrationEntry(s:TrafficParkingDemonstration,settings:ParkingDemoSettings):TrafficParkingDemonstration{
 if(!live(s,settings))return blocked(s,'The Uno is off. Connect USB before an Entry request.');
 if(!consistent(s))return blocked(s,'The counter and physical cars differ after a reset. Clear the model and reset the empty trial.');
 if(busy(s)||s.hardware.controller!.open)return blocked(s,'Finish the current car movement, release both buttons and wait for the gate to close.');
 if(!s.cars.some(c=>c.stage==='waiting'))return blocked(s,'Bring one model car to the waiting point first.');
 return {...s,request:'entry',pulseMs:80,notice:'Operator presses Entry for 80 ms. The sketch must accept the debounced request.'};
}
export function trafficParkingDemonstrationDeparture(s:TrafficParkingDemonstration,bay:number,settings:ParkingDemoSettings):TrafficParkingDemonstration{
 if(!Number.isInteger(bay)||bay<0||bay>2)throw new RangeError('Invalid departure bay');
 if(!live(s,settings)||!consistent(s))return blocked(s,'Check USB and the reservation count before starting a departure. Reset the empty trial if the counter was lost.');
 if(busy(s)||s.hardware.controller!.open)return blocked(s,'Finish the current movement and wait for the gate to close.');
 const index=s.cars.findIndex(c=>c.stage==='parked'&&c.bay===bay);if(index<0)return blocked(s,'Choose a bay containing a parked model car.');
 return {...s,cars:s.cars.map((c,n)=>n===index?{...c,stage:'leaving',progress:0}:c),notice:`Move ${trafficParkingCars[index].label.toLowerCase()} along the perimeter to the separate exit. The counter stays unchanged until Exit is confirmed.`};
}
export function trafficParkingDemonstrationConfirmExit(s:TrafficParkingDemonstration,settings:ParkingDemoSettings):TrafficParkingDemonstration{
 const index=s.cars.findIndex(c=>c.stage==='awaiting-exit');
 if(index<0)return blocked(s,'Move a parked car all the way through the separate exit before confirming Exit.');
 if(!live(s,settings)||!consistent(s))return blocked(s,'The reservation counter is unavailable or was reset. Clear the model and reset the empty trial.');
 if(s.pulseMs>0||s.releaseMs>0||s.hardware.controller!.open)return blocked(s,'Release both buttons and wait for the gate to close before confirming Exit.');
 return {...s,request:'exit',pulseMs:80,exitCar:index,notice:'Car clear of the exit. Operator presses Exit for 80 ms to free one reservation.'};
}
/** Explicit operator reset removes the tabletop cars; USB loss alone never does. */
export function trafficParkingDemonstrationReset(s:TrafficParkingDemonstration){const fresh=trafficParkingDemonstrationInitial();return {...fresh,hardware:{...fresh.hardware,angle:s.hardware.angle},notice:'Operator cleared the bays and reset the empty trial. The physical barrier pose is retained.'};}
function tick(previous:TrafficParkingDemonstration,settings:ParkingDemoSettings):TrafficParkingDemonstration{
 const hardware=trafficParkingSessionAdvance(previous.hardware,settingsWithButtons(settings,previous),1),before=previous.hardware.controller,after=hardware.controller;
 let s:TrafficParkingDemonstration={...previous,hardware};
 if(!live(s,settings))return {...s,request:null,pulseMs:0,releaseMs:0,exitCar:null,notice:'USB logic power is off. Cars and barrier stay where they are; reconnecting restarts the counter, not the physical model.'};
 if(before&&after&&after.admissions>before.admissions){const index=s.cars.findIndex(c=>c.stage==='waiting'),bay=[0,1,2].find(b=>!s.cars.some(c=>c.bay===b));if(index>=0&&bay!==undefined)s={...s,cars:s.cars.map((c,n)=>n===index?{stage:'reserved',bay,progress:0}:c),notice:'Entry accepted: one bay is reserved. Wait for the actual arm to clear the car.'};}
 if(before&&after&&after.denials>before.denials)s={...s,notice:'FULL: Entry denied. The waiting car stays before the barrier; no fourth bay is invented.'};
 if(before&&after&&after.departures>before.departures&&s.exitCar!==null){const index=s.exitCar;s={...s,cars:s.cars.map((c,n)=>n===index?{stage:'offstage',bay:null,progress:0}:c),exitCar:null,notice:'Exit accepted: one reservation is free. The remaining cars stay in their bays.'};}
 if(!consistent(s))return {...s,request:null,pulseMs:0,releaseMs:0,exitCar:null,notice:'The counter reset while physical cars remained. Clear the model and reset the empty trial before continuing.'};
 let parked=false,notice=s.notice;
 const cars:ParkingDemoVehicle[]=s.cars.map((car,index):ParkingDemoVehicle=>{
  if(car.bay===null)return car;
  let c=car;
  if(c.stage==='reserved'){
   const elapsed=after?(((hardware.millis-1)>>>0)-after.gateSince)>>>0:gateMs;
   if(after?.open&&hardware.angle>=85&&gateMs-elapsed>=800)c={...c,stage:'entering'};
   else {if(!after?.open)notice='The request was counted, but the arm did not clear in time. No car entered. Check servo power/reference, then clear and reset the trial.';return c;}
  }
  if(c.stage==='entering'){
   const pose=trafficParkingCarPath(c.bay!,'entry',c.progress),rearClear=pose.position[2]+18.3<15;
   if(!rearClear&&hardware.angle<85){notice='Keep the model still: the actual barrier has not cleared its roof.';return c;}
   const progress=Math.min(1,c.progress+trafficParkingModelMmPerMs/trafficParkingCarPath(c.bay!,'entry',1).distance);
   if(progress===1){parked=true;notice=`${trafficParkingCars[index].label} parked in bay ${c.bay!+1}. The sketch counted the earlier button press, not this arrival.`;return {...c,stage:'parked',progress};}
   return {...c,progress};
  }
  if(c.stage==='leaving'){
   const progress=Math.min(1,c.progress+trafficParkingModelMmPerMs/trafficParkingCarPath(c.bay!,'exit',1).distance);
   if(progress===1){notice='Car is clear of the separate exit. Confirm Exit now to free its reservation.';return {...c,stage:'awaiting-exit',progress};}
   return {...c,progress};
  }
  return c;
 });
 s={...s,cars,notice};
 if(parked&&!s.cars.some(c=>c.stage==='waiting')){const next=s.cars.findIndex(c=>c.stage==='offstage');if(next>=0)s={...s,cars:s.cars.map((c,n)=>n===next?{stage:'waiting',bay:null,progress:0}:c)};}
 if(s.pulseMs>0){const pulseMs=s.pulseMs-1;if(pulseMs===0&&((s.request==='entry'&&!settings.entryWired)||(s.request==='exit'&&s.exitCar!==null)))s={...s,notice:'No debounced switch event was accepted. Check the named input and common-ground connections; the reservation and car stay unchanged.'};s={...s,pulseMs,...(pulseMs===0?{request:null,releaseMs:80}:{})};}else if(s.releaseMs>0)s={...s,releaseMs:s.releaseMs-1};
 return s;
}
export function trafficParkingDemonstrationAdvance(previous:TrafficParkingDemonstration,settings:ParkingDemoSettings,elapsedMs:number):TrafficParkingDemonstration{
 if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid parking demonstration elapsed time');let s=previous,left=previous.remainderMs+elapsedMs;while(left>=1-1e-9){s=tick(s,settings);left-=1;}return {...s,remainderMs:Math.max(0,Math.round(left*1e9)/1e9)};
}
export function trafficParkingDemonstrationPoses(s:TrafficParkingDemonstration):ParkingCarPose[]{return s.cars.map(c=>{
 if(c.stage==='offstage')return {position:[116,0,44],yaw:0,distance:0,visible:false};
 if(c.stage==='waiting'||c.stage==='reserved')return {position:[116,0,44],yaw:0,distance:0,visible:true};
 if(c.stage==='parked')return trafficParkingCarParked(c.bay!);
 const exit=c.stage==='leaving'||c.stage==='awaiting-exit',pose=trafficParkingCarPath(c.bay!,exit?'exit':'entry',c.progress);return exit?{...pose,distance:pose.distance+trafficParkingCarPath(c.bay!,'entry',1).distance}:pose;
 });}
