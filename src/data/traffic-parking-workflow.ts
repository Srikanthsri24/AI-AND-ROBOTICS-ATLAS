import {trafficParkingAssemblyTotalMs,trafficParkingAssemblyProgress,trafficParkingAssemblyElapsed} from './traffic-parking-assembly';
import {trafficParkingUsbRequestedAdvance,trafficParkingUsbMated,type TrafficParkingUsbMotion} from './traffic-parking-usb';
import {trafficParkingCalibrationInitial,trafficParkingCalibrationLoop,trafficParkingCalibrationCommand,trafficParkingCalibrationProgram,type TrafficParkingCalibrationController} from './traffic-parking-calibration';
import {trafficParkingServoDegreesPerMs,trafficParkingSessionOutputs} from './traffic-parking-session';
import {trafficParkingDemonstrationInitial,trafficParkingDemonstrationAdvance,trafficParkingDemonstrationEntry,trafficParkingDemonstrationDeparture,trafficParkingDemonstrationConfirmExit,trafficParkingDemonstrationReset,type TrafficParkingDemonstration} from './traffic-parking-demonstration';
export type TrafficParkingWorkflow={assembly:number;assemblyMs:number;fitting:number;horn:number;usb:TrafficParkingUsbMotion;requestedUsb:boolean;servoPower:boolean;sketch:'none'|'calibration'|'working';angle:number;calibration:TrafficParkingCalibrationController|null;calMillis:number;seenDown:boolean;seenUp:boolean;demo:TrafficParkingDemonstration;playing:'assembly'|'wiring'|'horn'|null;paused:boolean;remainderMs:number;notice:string};
export type TrafficParkingWorkflowAction={type:'assembly'|'wiring';value:number}|{type:'play-assembly'|'play-wiring'|'play-horn'|'upload-calibration'|'reset-calibration'|'upload-working'|'entry'|'confirm-exit'|'clear-trial'|'reset-workbench'}|{type:'usb'|'servo'|'pause';value:boolean}|{type:'depart';value:number};
export function trafficParkingWorkflowInitial():TrafficParkingWorkflow{return {assembly:0,assemblyMs:0,fitting:0,horn:0,usb:{unoWithdrawal:12,hostWithdrawal:12},requestedUsb:false,servoPower:false,sketch:'none',angle:20,calibration:null,calMillis:0,seenDown:false,seenUp:false,demo:trafficParkingDemonstrationInitial(),playing:null,paused:false,remainderMs:0,notice:'Begin with the unpowered workbench. Place the components, then connect each named wire end.'};}
export const trafficParkingWorkflowWired=(s:TrafficParkingWorkflow)=>s.assembly===17&&s.fitting===66;
export const trafficParkingWorkflowUsb=(s:TrafficParkingWorkflow)=>trafficParkingWorkflowWired(s)&&trafficParkingUsbMated(s.requestedUsb,s.usb);
export const trafficParkingWorkflowDisconnected=(s:TrafficParkingWorkflow)=>!s.requestedUsb&&s.usb.unoWithdrawal===12&&s.usb.hostWithdrawal===12&&!s.servoPower;
export const trafficParkingWorkflowReady=(s:TrafficParkingWorkflow)=>trafficParkingWorkflowWired(s)&&s.horn===2&&s.sketch==='working';
export function trafficParkingWorkflowSettings(s:TrafficParkingWorkflow){return {assembled:trafficParkingWorkflowReady(s),usb:trafficParkingWorkflowUsb(s),servoPower:s.servoPower,servoGround:true,servoSignal:true,entryWired:true,exitWired:true};}
const block=(s:TrafficParkingWorkflow,notice:string)=>({...s,notice});
function clearProgram(s:TrafficParkingWorkflow):TrafficParkingWorkflow{const demo=trafficParkingDemonstrationInitial();return {...s,horn:0,sketch:'none',calibration:null,calMillis:0,seenDown:false,seenUp:false,demo:{...demo,hardware:{...demo.hardware,angle:s.angle}},playing:null};}
export function trafficParkingWorkflowAction(s:TrafficParkingWorkflow,action:TrafficParkingWorkflowAction):TrafficParkingWorkflow{
 switch(action.type){
  case 'reset-workbench':return trafficParkingWorkflowInitial();
  case 'pause':return {...s,paused:action.value};
  case 'assembly':
   if(!Number.isFinite(action.value)||action.value<0||action.value>17)throw new RangeError('Invalid mounting chapter');
   if(!trafficParkingWorkflowDisconnected(s))return block(s,'Switch servo power off and fully withdraw both USB plugs before changing the assembly.');
   return {...clearProgram(s),assembly:action.value,assemblyMs:trafficParkingAssemblyElapsed(action.value),fitting:0,notice:'Assembly inspection resets the wiring and removes the horn. Both supplies remain off.'};
  case 'wiring':
   if(!Number.isFinite(action.value)||action.value<0||action.value>66)throw new RangeError('Invalid wiring chapter');
   if(s.assembly!==17||!trafficParkingWorkflowDisconnected(s))return block(s,'Finish mounting, switch servo power off and fully disconnect USB before changing the wires.');
   return {...clearProgram(s),fitting:action.value,notice:'Wiring inspection removes the horn and clears the loaded sketch. Calibrate again before fitting the arm.'};
  case 'play-assembly':
   if(!trafficParkingWorkflowDisconnected(s))return block(s,'Fully disconnect both supplies before playing the mounting sequence.');
   return s.playing==='assembly'?{...s,playing:null}:{...clearProgram(s),assembly:s.assembly===17?0:s.assembly,assemblyMs:s.assembly===17?0:s.assemblyMs,fitting:0,playing:'assembly',paused:false,notice:'Watch each component approach its own mounting location.'};
  case 'play-wiring':
   if(s.assembly!==17||!trafficParkingWorkflowDisconnected(s))return block(s,'Finish mounting and fully disconnect both supplies before playing wiring.');
   return s.playing==='wiring'?{...s,playing:null}:{...clearProgram(s),fitting:s.fitting===66?0:s.fitting,playing:'wiring',paused:false,notice:'Follow the connector labels. Each end seats before its connection is complete.'};
  case 'usb':
   if(action.value&&!trafficParkingWorkflowWired(s))return block(s,'Finish the component mounting and all 66 wire ends before connecting USB.');
   return {...s,requestedUsb:action.value,playing:null,notice:action.value?'Seat the computer plug first, then the Uno plug. Logic power starts after both are fully seated.':'Withdraw the Uno plug first. USB loss resets the counter; it does not remove physical cars.'};
  case 'servo':
   if(action.value&&(!trafficParkingWorkflowWired(s)||s.horn>0&&s.horn<2||s.horn===2&&s.sketch!=='working'))return block(s,'Finish the wiring and horn fastening. With the horn fitted, upload the working sketch before restoring servo power.');
   return {...s,servoPower:action.value,notice:action.value?'Independent 5 V servo supply enabled. USB logic power and common ground are still required.':'Servo supply off. The illustrated shaft holds its current pose; this is not a real holding-force guarantee.'};
  case 'upload-calibration':
   if(!trafficParkingWorkflowUsb(s)||s.servoPower||s.horn!==0)return block(s,'Seat USB, leave the horn off and switch servo power off before uploading the bare-shaft calibration sketch.');
   return {...s,sketch:'calibration',calibration:trafficParkingCalibrationInitial(),calMillis:0,seenDown:false,seenUp:false,notice:'Calibration sketch loaded. Switch servo supply ON, then press Reset calibration to observe both bare-shaft positions.'};
  case 'reset-calibration':
   if(s.sketch!=='calibration'||!trafficParkingWorkflowUsb(s)||!s.servoPower||s.horn!==0)return block(s,'Use the calibration sketch with USB and servo power on, and the horn removed, before resetting.');
   return {...s,calibration:trafficParkingCalibrationInitial(),calMillis:0,seenDown:false,seenUp:false,notice:'Bare shaft test: 20° for 1.5 seconds, then 100° held. Observe both positions before fitting the horn.'};
  case 'play-horn':
   if(s.sketch!=='calibration'||!trafficParkingWorkflowWired(s)||s.servoPower||!s.seenDown||!s.seenUp||Math.abs(s.angle-100)>.001)return block(s,'Observe the bare shaft at 20° and 100°, leave it at 100°, then turn servo power OFF before fitting the raised horn.');
   return s.playing==='horn'?{...s,playing:null}:{...s,horn:s.horn===2?0:s.horn,playing:'horn',paused:false,notice:'Fit the horn raised, then seat the retaining screw. Servo supply remains off.'};
  case 'upload-working':{
   if(!trafficParkingWorkflowUsb(s)||s.servoPower||s.horn!==2)return block(s,'Seat USB, finish the horn and screw, and keep servo power OFF while uploading the working sketch.');
   if(s.demo.cars.some(c=>!['waiting','offstage'].includes(c.stage)))return block(s,'Clear the physical trial before uploading a fresh counter program.');
   const demo=trafficParkingDemonstrationInitial();return {...s,sketch:'working',demo:{...demo,hardware:{...demo.hardware,angle:s.angle}},playing:null,notice:'Working sketch loaded. Restore servo power and watch the arm lower to 20° before requesting Entry.'};}
  case 'entry':case 'confirm-exit':case 'depart':case 'clear-trial':{
   if(!trafficParkingWorkflowReady(s))return block(s,'Finish calibration, fit the horn and upload the working sketch before running the parking trial.');
   const settings=trafficParkingWorkflowSettings(s),demo=action.type==='entry'?trafficParkingDemonstrationEntry(s.demo,settings):action.type==='depart'?trafficParkingDemonstrationDeparture(s.demo,action.value,settings):action.type==='confirm-exit'?trafficParkingDemonstrationConfirmExit(s.demo,settings):trafficParkingDemonstrationReset(s.demo);
   return {...s,demo,notice:demo.notice};}
 }
}
const calRows=[...trafficParkingCalibrationProgram.source.matchAll(/Serial.println\("([^"\n]+)"\)/g)].map(m=>m[1]);
function step(p:number,increment:number,max:number){const next=Math.min(max,p+increment),whole=Math.round(next);return Math.abs(next-whole)<1e-9?whole:next;}
function tick(s:TrafficParkingWorkflow):TrafficParkingWorkflow{
 let n={...s};
 if(n.playing==='assembly'){n.assemblyMs=Math.min(trafficParkingAssemblyTotalMs,n.assemblyMs+1);n.assembly=trafficParkingAssemblyProgress(n.assemblyMs);if(n.assembly===17){n.playing=null;n.notice='Components mounted. Connect all 66 named wire ends next.';}}
 if(n.playing==='wiring'){n.fitting=step(n.fitting,1/650,66);if(n.fitting===66){n.playing=null;n.notice='All wire ends seated. Connect USB and upload the bare-shaft calibration sketch.';}}
 if(n.playing==='horn'){n.horn=step(n.horn,1/1200,2);if(n.horn===2){n.playing=null;n.notice='Raised horn and screw fitted. Keep servo power off and upload the working sketch.';}}
 n.usb=trafficParkingUsbRequestedAdvance(n.usb,1,n.requestedUsb&&trafficParkingWorkflowWired(n));
 const usb=trafficParkingWorkflowUsb(n);
 if(n.sketch==='calibration'){
  if(!usb){n.calibration=null;n.calMillis=0;}
  else{const c=n.calibration??trafficParkingCalibrationInitial();n.calibration=trafficParkingCalibrationLoop(c,n.calMillis);n.calMillis=(n.calMillis+1)>>>0;
   if(n.servoPower){const command=trafficParkingCalibrationCommand(n.calibration),diff=command-n.angle;n.angle=Math.abs(diff)<=trafficParkingServoDegreesPerMs+1e-10?command:n.angle+Math.sign(diff)*trafficParkingServoDegreesPerMs;
    if(n.angle===20&&!n.calibration.raised)n.seenDown=true;
    if(n.angle===100&&n.calibration.raised&&n.seenDown&&!n.seenUp){n.seenUp=true;n.notice='Both bare-shaft positions observed. Switch servo power OFF, then fit the raised horn.';}
   }
  }
 }
 if(n.sketch==='working'){
  n.demo=trafficParkingDemonstrationAdvance(n.demo,trafficParkingWorkflowSettings(n),1);n.angle=n.demo.hardware.angle;
  if(n.demo.notice!==s.demo.notice)n.notice=n.demo.notice;
 }
 return n;
}
export function trafficParkingWorkflowAdvance(s:TrafficParkingWorkflow,elapsedMs:number):TrafficParkingWorkflow{
 if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid workflow elapsed time');if(s.paused)return s;let n=s,left=s.remainderMs+elapsedMs;while(left>=1-1e-9){n=tick(n);left-=1;}return {...n,remainderMs:Math.max(0,Math.round(left*1e9)/1e9)};
}
export function trafficParkingWorkflowOutputs(s:TrafficParkingWorkflow){const usb=trafficParkingWorkflowUsb(s),out=trafficParkingSessionOutputs(s.demo.hardware,{...trafficParkingWorkflowSettings(s),entry:false,exit:false});return {powered:usb,servoPower:s.servoPower,angle:s.angle,main:s.sketch==='working'?out.main:null,cross:s.sketch==='working'?out.cross:null,full:s.sketch==='working'&&out.full,rows:!usb?[]:s.sketch==='calibration'?calRows.slice(0,s.calibration?.raised?2:1):s.sketch==='working'?s.demo.hardware.controller?.rows??[]:['No sketch loaded in this illustration.'],entry:s.demo.request==='entry'&&s.demo.pulseMs>0,exit:s.demo.request==='exit'&&s.demo.pulseMs>0};}
