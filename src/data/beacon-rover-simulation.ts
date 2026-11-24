import {beaconInitial,beaconLoop,type BeaconConfig} from './beacon-rover-controller';
import {beaconOptics,type BeaconLamp} from './beacon-rover-optics';
import {bluetoothCarMotion,bluetoothCarPose} from './bluetooth-car-motion';
export const beaconRuntimeInitial=()=>({core:beaconInitial(),pose:bluetoothCarPose(),clock:0});
export type BeaconRuntime=ReturnType<typeof beaconRuntimeInitial>;
/** Model milliseconds, with 35 ms sampling delays handled by the controller itself.
 * A board upload/reset creates a fresh runtime clock/core; handling may retain its pose separately.
 */
export function beaconAdvance(previous:BeaconRuntime,seconds:number,environment:{lamp:BeaconLamp;logic:boolean;motors:boolean;onStand:boolean;config?:BeaconConfig;leftReversed?:boolean;rightReversed?:boolean}){
 if(!Number.isFinite(seconds)||seconds<=0)return previous;const dt=Math.min(seconds,1),end=previous.clock+dt*1000;let core=previous.core,pose=previous.pose;
 for(let t=Math.floor(previous.clock)+1;t<=Math.floor(end);t++){
  const optical=beaconOptics({...pose,lift:environment.onStand?.15:0},environment.lamp);
  if(environment.logic)core=beaconLoop(core,optical[0].raw,optical[1].raw,t,environment.config);
  pose=bluetoothCarMotion(pose,.001,{left:core.leftPwm?1:0,right:core.rightPwm?1:0,enabled:environment.logic&&(core.leftPwm>0||core.rightPwm>0),motorPower:environment.motors,onStand:environment.onStand,pwmLeft:core.leftPwm,pwmRight:core.rightPwm,speedScale:.55,leftReversed:environment.leftReversed,rightReversed:environment.rightReversed});
 }
 return {core,pose,clock:end};
}
