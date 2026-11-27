import {tapControllerInitial,tapLoopEntry,tapReadDue,tapCompleteReading,type TapController} from './automatic-tap-controller';
export type TapSettings={assembled:boolean;usb:boolean;pumpPower:boolean;pumpCircuit:boolean;driverReference:boolean;driverSignal:boolean;sensorPower:boolean;sensorGround:boolean;trig:boolean;echo:boolean;echoPresent:boolean;distanceCm:number;levelPower:boolean;levelGround:boolean;levelSignal:boolean;water:boolean};
export const tapDefaults:TapSettings={assembled:false,usb:false,pumpPower:false,pumpCircuit:true,driverReference:true,driverSignal:true,sensorPower:true,sensorGround:true,trig:true,echo:true,echoPresent:true,distanceCm:26,levelPower:true,levelGround:true,levelSignal:true,water:true};
export type TapSession={controller:TapController|null;clockUs:number;nextLoopUs:number;remainderUs:number;pending:{start:number;finishUs:number;echoUs:number;water:boolean}|null;rotor:number;poweredUs:number};
export const tapSessionInitial=():TapSession=>({controller:null,clockUs:0,nextLoopUs:0,remainderUs:0,pending:null,rotor:0,poweredUs:0});
/** Illustrative 60 RPM transport speed, not a measured pump specification. */
export const tapRotorRadiansPerUs=Math.PI*2/1e6;
export function tapWaterInput(settings:TapSettings){return settings.levelPower&&settings.levelGround&&settings.levelSignal&&settings.water;}
export function tapEcho(settings:TapSettings){if(!Number.isFinite(settings.distanceCm)||settings.distanceCm<0||settings.distanceCm>500)throw new RangeError('Invalid tap target gap');const echo=Math.round(settings.distanceCm*20000/343);return settings.sensorPower&&settings.sensorGround&&settings.trig&&settings.echo&&settings.echoPresent&&echo>0&&echo<=7000?echo:0;}
export function tapMotorEnergized(s:TapSession,settings:TapSettings){return settings.assembled&&settings.usb&&!!s.controller?.driver&&settings.pumpPower&&settings.pumpCircuit&&settings.driverReference&&settings.driverSignal;}
function move(s:TapSession,settings:TapSettings,us:number){return tapMotorEnergized(s,settings)&&us>0?{...s,poweredUs:s.poweredUs+us,rotor:(s.rotor+us*tapRotorRadiansPerUs)%(Math.PI*2)}:s;}
/** Exactly scheduled sketch loops, with a 1 ms idle step and blocking echo
 * acquisition. A pending read retains the LEVEL value sampled at loop entry. */
export function tapSessionAdvance(previous:TapSession,settings:TapSettings,ms:number):TapSession{
 if(!Number.isFinite(ms)||ms<0)throw new RangeError('Invalid tap session interval');tapEcho(settings);
 const total=previous.remainderUs+ms*1000,whole=Math.floor(total+1e-9),remainderUs=Math.max(0,Math.round((total-whole)*1e9)/1e9);
 if(!settings.assembled||!settings.usb)return{...previous,controller:null,clockUs:0,nextLoopUs:0,pending:null,remainderUs};
 let s={...previous,controller:previous.controller??tapControllerInitial()};const end=s.clockUs+whole;
 while(true){
  if(s.pending&&s.pending.finishUs<=s.clockUs){const pending=s.pending;s={...s,controller:tapCompleteReading(s.controller,pending.start,{echoUs:pending.echoUs,finishedAt:Math.floor(s.clockUs/1000)>>>0,water:pending.water}),pending:null,nextLoopUs:s.clockUs+1000};}
  if(!s.pending&&s.nextLoopUs<=s.clockUs){const now=Math.floor(s.clockUs/1000)>>>0,water=tapWaterInput(settings),controller=tapLoopEntry(s.controller,now,water);s={...s,controller};if(tapReadDue(controller,now)){const echoUs=tapEcho(settings);s={...s,controller:{...controller,lastRead:now},pending:{start:now,finishUs:s.clockUs+12+(echoUs||7000),echoUs,water}};}else s={...s,nextLoopUs:s.clockUs+1000};}
  if(s.clockUs>=end)break;
  const next=Math.min(end,s.pending?.finishUs??s.nextLoopUs);s=move(s,settings,next-s.clockUs) as typeof s;s={...s,clockUs:next};
 }
 return{...s,remainderUs};
}
