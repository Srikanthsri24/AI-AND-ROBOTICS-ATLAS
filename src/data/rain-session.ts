import {rainInitial,rainStep,type RainController} from './rain-workshop';
import {rainServoAdvance} from './rain-linkage';
import {rainGeometricBridge,type RainWaterDrop} from './rain-water-sensor';
export type RainSessionSettings={assembled:boolean;usb:boolean;sensorPower:boolean;sensorGround:boolean;sensorSignal:boolean;servoPower:boolean;servoGround:boolean;servoSignal:boolean;drops:readonly RainWaterDrop[]};
export const rainSessionDefaults:RainSessionSettings={assembled:false,usb:false,sensorPower:true,sensorGround:true,sensorSignal:true,servoPower:false,servoGround:true,servoSignal:true,drops:[]};
export type RainSession={controller:RainController|null;controllerKnown:boolean;clockMs:number;angle:number;remainderMs:number;raw:'LOW'|'HIGH'|null};
export function rainSessionInitial():RainSession{return {controller:null,controllerKnown:false,clockMs:0,angle:35,remainderMs:0,raw:null};}
function rawInput(settings:RainSessionSettings):RainSession['raw']{return settings.sensorPower&&settings.sensorGround&&settings.sensorSignal?(rainGeometricBridge(settings.drops)?'LOW':'HIGH'):null;}
export function rainSessionReset(previous:RainSession,settings:RainSessionSettings):RainSession{
 if(!settings.assembled||!settings.usb)return {...previous,controller:null,controllerKnown:false,clockMs:0,raw:null};
 const raw=rawInput(settings);return {...previous,controller:raw===null?rainInitial():rainStep(rainInitial(),0,raw==='LOW'),controllerKnown:raw!==null,clockMs:0,raw};
}
/** One-millisecond educational integration, not a measured AVR loop execution time.
 * The previous command drives the preceding mechanical interval; a new command
 * never teleports the carriage. Missing input wiring remains unknown until reset. */
export function rainSessionAdvance(previous:RainSession,settings:RainSessionSettings,elapsedMs:number):RainSession{
 if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Elapsed time must be finite and nonnegative');
 let state=previous,remaining=previous.remainderMs+elapsedMs;const raw=rawInput(settings);
 while(remaining>=1-1e-9){
  if(!settings.assembled||!settings.usb)state={...state,controller:null,controllerKnown:false,clockMs:0,raw:null};
  else if(state.controller===null)state=rainSessionReset(state,settings);
  else{
   const drive=state.controllerKnown&&settings.servoPower&&settings.servoGround&&settings.servoSignal;
   const angle=rainServoAdvance(state.angle,state.controller.commandAngle,1,drive),clockMs=(state.clockMs+1)>>>0,known=state.controllerKnown&&raw!==null;
   state={...state,angle,clockMs,controllerKnown:known,raw,controller:known?rainStep(state.controller,clockMs,raw==='LOW'):state.controller};
  }
  remaining-=1;
 }
 return {...state,remainderMs:Math.max(0,Math.round(remaining*1e9)/1e9)};
}
