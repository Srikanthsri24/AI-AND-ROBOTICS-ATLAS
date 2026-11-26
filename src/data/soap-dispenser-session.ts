import {soapAngles} from './soap-dispenser';
import {soapDispenserInitial,soapDispenserReadDue,soapDispenserAdvancePhase,soapDispenserCompleteReading,type SoapDispenserController} from './soap-dispenser-workshop';
export type SoapDispenserSettings={assembled:boolean;usb:boolean;servoPower:boolean;servoGround:boolean;servoSignal:boolean;sensorPower:boolean;sensorGround:boolean;trigConnected:boolean;echoConnected:boolean;echoPresent:boolean;distanceCm:number};
export const soapDispenserDefaults:SoapDispenserSettings={assembled:false,usb:false,servoPower:false,servoGround:true,servoSignal:true,sensorPower:true,sensorGround:true,trigConnected:true,echoConnected:true,echoPresent:true,distanceCm:25};
export type SoapDispenserSession={controller:SoapDispenserController|null;clockUs:number;nextLoopUs:number;pending:{start:number;finishUs:number;echoUs:number}|null;angle:number;pressArmed:boolean;completedServoPresses:number;remainderUs:number};
export function soapDispenserSessionInitial():SoapDispenserSession{return {controller:null,clockUs:0,nextLoopUs:0,pending:null,angle:soapAngles.rest,pressArmed:true,completedServoPresses:0,remainderUs:0};}
/** Illustrative unloaded travel, not a measured torque/load response. */
export const soapDispenserDegreesPerUs=.00018;
export function soapDispenserEcho(settings:SoapDispenserSettings){
 if(!Number.isFinite(settings.distanceCm)||settings.distanceCm<0||settings.distanceCm>500)throw new RangeError('Invalid illustrated target distance');
 const echo=Math.round(settings.distanceCm*20000/343);
 return settings.assembled&&settings.usb&&settings.sensorPower&&settings.sensorGround&&settings.trigConnected&&settings.echoConnected&&settings.echoPresent&&echo>0&&echo<=7000?echo:0;
}
export function soapDispenserDriveValid(s:SoapDispenserSession,settings:SoapDispenserSettings){return !!s.controller&&settings.assembled&&settings.usb&&settings.servoPower&&settings.servoGround&&settings.servoSignal;}
function move(s:SoapDispenserSession,settings:SoapDispenserSettings,us:number):SoapDispenserSession{
 if(!soapDispenserDriveValid(s,settings))return s;
 const target=s.controller!.command,diff=target-s.angle,step=us*soapDispenserDegreesPerUs,angle=Math.abs(diff)<=step+1e-10?target:Math.round((s.angle+Math.sign(diff)*step)*1e8)/1e8;
 let pressArmed=s.pressArmed,completedServoPresses=s.completedServoPresses;if(angle===soapAngles.rest)pressArmed=true;if(angle===soapAngles.press&&pressArmed){completedServoPresses++;pressArmed=false;}
 return {...s,angle,pressArmed,completedServoPresses};
}
/** Idle loops are scheduled 1 ms apart. A sonar read blocks the next loop for
 * 12 µs of TRIG preparation plus an ideal echo duration, or the 7000 µs timeout.
 * No additional echo-start/Serial latency is claimed. PWM travel continues
 * while acquiring. Both timestamps and sub-millisecond frame remainders persist. */
export function soapDispenserSessionAdvance(previous:SoapDispenserSession,settings:SoapDispenserSettings,elapsedMs:number):SoapDispenserSession{
 if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid soap-session elapsed time');soapDispenserEcho(settings);
 const elapsed=previous.remainderUs+elapsedMs*1000,whole=Math.floor(elapsed+1e-9),remainderUs=Math.max(0,Math.round((elapsed-whole)*1e9)/1e9);
 if(!settings.assembled||!settings.usb)return {...previous,controller:null,clockUs:0,nextLoopUs:0,pending:null,remainderUs};
 if(whole===0)return {...previous,remainderUs};
 let s:SoapDispenserSession={...previous,controller:previous.controller??soapDispenserInitial()};const end=s.clockUs+whole;
 while(true){
  if(s.pending&&s.pending.finishUs<=s.clockUs){const pending=s.pending;s={...s,controller:soapDispenserCompleteReading(s.controller!,pending.start,{echoUs:pending.echoUs,finishedAt:Math.floor(s.clockUs/1000)>>>0}),pending:null,nextLoopUs:s.clockUs+1000};}
  if(!s.pending&&s.nextLoopUs<=s.clockUs){const now=Math.floor(s.clockUs/1000)>>>0,controller=soapDispenserAdvancePhase(s.controller!,now);s={...s,controller};if(soapDispenserReadDue(controller,now)){const echoUs=soapDispenserEcho(settings);s={...s,controller:{...controller,lastRead:now},pending:{start:now,finishUs:s.clockUs+12+(echoUs||7000),echoUs}};}else s={...s,nextLoopUs:s.clockUs+1000};}
  if(s.clockUs>=end)break;
  const next=Math.min(end,s.pending?.finishUs??s.nextLoopUs);s=move(s,settings,next-s.clockUs);s={...s,clockUs:next};
 }
 return {...s,remainderUs};
}
export function soapDispenserSessionReset(s:SoapDispenserSession):SoapDispenserSession{return {...s,controller:null,clockUs:0,nextLoopUs:0,pending:null};}
export function soapDispenserOutputs(s:SoapDispenserSession,settings:SoapDispenserSettings){const powered=settings.assembled&&settings.usb&&!!s.controller;return {powered,phase:powered?s.controller!.phase:null,command:powered?s.controller!.command:null,angle:s.angle,lastCm:powered?s.controller!.lastCm:null,acquiring:powered&&!!s.pending,strokeCommands:powered?s.controller!.strokeCommands:0,completedServoPresses:s.completedServoPresses,driveValid:soapDispenserDriveValid(s,settings)};}
