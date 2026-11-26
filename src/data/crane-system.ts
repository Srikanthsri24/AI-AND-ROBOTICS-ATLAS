import {craneAdvance,craneDefaults,craneInitial,craneOutputs,type CraneController,type CraneInputs} from './crane-workshop';
import {craneMotionAdvance,craneMotionInitial,type CraneMotion} from './crane-motion';
import {craneUsbAdvance,craneUsbMated,type CraneUsbMotion} from './crane-usb';
export type CraneSystem={controller:CraneController;motion:CraneMotion;usb:CraneUsbMotion;nowMs:number;remainderMs:number};
export type CraneSystemSettings={inputs:Omit<CraneInputs,'usb'>;requestUsb:boolean;inspectHost:boolean;assembled:boolean;targetX:number;targetFaceY:number};
const {usb:_unused,...inputs}=craneDefaults;
export const craneSystemDefaults:CraneSystemSettings={inputs,requestUsb:false,inspectHost:true,assembled:false,targetX:-65,targetFaceY:50};
export function craneSystemInitial():CraneSystem{return{controller:craneInitial(),motion:craneMotionInitial(),usb:{unoWithdrawal:12,hostWithdrawal:12},nowMs:0,remainderMs:0};}
export function craneSystemPowered(state:CraneSystem,settings:CraneSystemSettings){return settings.assembled&&craneUsbMated(settings.requestUsb,state.usb);}
/** Deterministic 1 ms coupling: old output drives this mechanical interval, then firmware
 * reaches the next boundary. Newly mated USB starts the firmware clock at that boundary.
 * Thus the eight-second cutoff cannot be skipped by one long browser frame. */
export function craneSystemAdvance(previous:CraneSystem,elapsedMs:number,settings:CraneSystemSettings):CraneSystem{
 if(!Number.isFinite(elapsedMs)||elapsedMs<0||elapsedMs>60000)throw new RangeError('System interval must be 0–60000 ms');
 if(!Number.isFinite(settings.targetX)||!Number.isFinite(settings.targetFaceY))throw new RangeError('Crane targets must be finite');
 let s={...previous};const total=Math.round((s.remainderMs+elapsedMs)*1e9)/1e9,ticks=Math.floor(total);s.remainderMs=Math.round((total-ticks)*1e9)/1e9;
 const sample=()=>{const input:CraneInputs={...settings.inputs,usb:craneSystemPowered(s,settings)};s.controller=craneAdvance(s.controller,0,input);return{input,output:craneOutputs(s.controller,input)};};
 sample();for(let n=0;n<ticks;n++){
  const {input,output}=sample();s.motion=craneMotionAdvance(s.motion,1,{targetX:settings.targetX,targetFaceY:settings.targetFaceY,energized:output.coilEnergized,enabled:settings.assembled});
  s.controller=craneAdvance(s.controller,1,input);s.usb=craneUsbAdvance(s.usb,1,settings.assembled&&settings.requestUsb?0:12,settings.inspectHost?12:0);s.nowMs++;sample();
 }
 return s;
}
export function craneSystemOutput(state:CraneSystem,settings:CraneSystemSettings){const usb=craneSystemPowered(state,settings);return{usb,...craneOutputs(state.controller,{...settings.inputs,usb})};}
