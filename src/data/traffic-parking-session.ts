import {trafficParkingInitial,trafficParkingLoop,trafficParkingControllerOutputs,type TrafficParkingController} from './traffic-parking-workshop';
export type TrafficParkingSettings={assembled:boolean;usb:boolean;servoPower:boolean;servoGround:boolean;servoSignal:boolean;entryWired:boolean;exitWired:boolean;entry:boolean;exit:boolean};
export const trafficParkingDefaults:TrafficParkingSettings={assembled:false,usb:false,servoPower:false,servoGround:true,servoSignal:true,entryWired:true,exitWired:true,entry:false,exit:false};
export type TrafficParkingSession={controller:TrafficParkingController|null;millis:number;angle:number;remainderMs:number};
export function trafficParkingSessionInitial():TrafficParkingSession{return {controller:null,millis:0,angle:20,remainderMs:0};}
export function trafficParkingSessionReset(s:TrafficParkingSession):TrafficParkingSession{return {...s,controller:null,millis:0};}
/** Authored 180°/s loaded-servo illustration, not a measured stall/torque model.
 * With no valid PWM reference or motor supply the displayed pose holds; this
 * does not predict a disconnected physical servo's drift or electrical noise. */
export const trafficParkingServoDegreesPerMs=.18;
export function trafficParkingDriveValid(s:TrafficParkingSession,settings:TrafficParkingSettings){return !!s.controller&&settings.assembled&&settings.usb&&settings.servoPower&&settings.servoGround&&settings.servoSignal;}
/** One sketch sample per integrated millisecond. The logic clock resets with
 * USB power; servo pose is physical state and is retained across that reset. */
export function trafficParkingSessionAdvance(previous:TrafficParkingSession,settings:TrafficParkingSettings,elapsedMs:number){
 if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid traffic/parking elapsed time');let s=previous,left=previous.remainderMs+elapsedMs;const powered=settings.assembled&&settings.usb;
 while(left>=1-1e-9){
  if(!powered)s=trafficParkingSessionReset(s);
  else{if(!s.controller)s={...s,controller:trafficParkingInitial(),millis:0};s={...s,controller:trafficParkingLoop(s.controller!,s.millis,{entry:settings.entryWired&&settings.entry,exit:settings.exitWired&&settings.exit}),millis:(s.millis+1)>>>0};}
  if(trafficParkingDriveValid(s,settings)){const target=s.controller!.command,diff=target-s.angle;s={...s,angle:Math.abs(diff)<=trafficParkingServoDegreesPerMs+1e-10?target:s.angle+Math.sign(diff)*trafficParkingServoDegreesPerMs};}
  left-=1;
 }
 return {...s,remainderMs:Math.max(0,Math.round(left*1e9)/1e9)};
}
export function trafficParkingSessionOutputs(s:TrafficParkingSession,settings:TrafficParkingSettings){const powered=settings.assembled&&settings.usb&&!!s.controller,out=s.controller?trafficParkingControllerOutputs(s.controller):null;return {powered,main:powered?out!.main:null,cross:powered?out!.cross:null,full:powered&&out!.full,spaces:powered?out!.spaces:null,command:powered?out!.command:null,angle:s.angle,driveValid:trafficParkingDriveValid(s,settings)};}
