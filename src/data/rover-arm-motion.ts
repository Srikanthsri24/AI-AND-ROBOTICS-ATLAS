import type{raArmDriverOutputs}from'./rover-arm-driver';
/** Calibration is supplied by the workbench, never inferred from a servo name.
 * The first-order response is an illustrative unloaded teaching response, not
 * a torque/gravity/gear-backlash simulation or manufacturer speed guarantee. */
export type RaArmCalibration={pulseA:number;angleA:number;pulseB:number;angleB:number;minAngle:number;maxAngle:number;responseMs:number};
export type RaArmMotionStatus='uncalibrated'|'outside-calibration'|'tracking'|'settled'|'no-power'|'no-reference'|'no-pulse';
export type RaArmPose={angles:readonly number[];targets:readonly(number|null)[];status:readonly RaArmMotionStatus[]};
type Outputs=ReturnType<typeof raArmDriverOutputs>;
export function raArmPoseInitial(angles:readonly number[]):RaArmPose{if(angles.length!==6||angles.some(a=>!Number.isFinite(a)))throw new RangeError('Six initial joint angles required');return{angles:[...angles],targets:Array(6).fill(null),status:Array(6).fill('uncalibrated')};}
export function raArmValidateCalibration(c:RaArmCalibration){
 if([c.pulseA,c.angleA,c.pulseB,c.angleB,c.minAngle,c.maxAngle,c.responseMs].some(v=>!Number.isFinite(v))||c.pulseA<=0||c.pulseB<=0||c.pulseA===c.pulseB||c.angleA===c.angleB||c.responseMs<=0||c.minAngle>=c.maxAngle||c.angleA<c.minAngle||c.angleA>c.maxAngle||c.angleB<c.minAngle||c.angleB>c.maxAngle)throw new RangeError('Invalid joint calibration');
}
/** No-pulse/no-power conditions retain the last visual pose; that visual hold
 * must not be presented as a real servo's holding torque or physical failsafe. */
export function raArmPoseAdvance(previous:RaArmPose,outputs:Outputs,calibration:readonly(RaArmCalibration|null)[],ms:number):RaArmPose{
 if(!Number.isFinite(ms)||ms<0||outputs.length!==6||calibration.length!==6||previous.angles.length!==6||previous.angles.some(a=>!Number.isFinite(a)))throw new RangeError('Invalid arm motion step');
 const angles=[...previous.angles],targets:(number|null)[]=[],status:RaArmMotionStatus[]=[];
 for(let i=0;i<6;i++){
  const c=calibration[i],o=outputs[i];if(c)raArmValidateCalibration(c);
  if(o.status!=='tracking'){targets.push(null);status.push(o.status);continue;}
  if(!c){targets.push(null);status.push('uncalibrated');continue;}
  const pulse=o.pulseUs;if(pulse===null||!Number.isFinite(pulse))throw new RangeError('Tracking output requires a pulse');
  const target=c.angleA+(pulse-c.pulseA)/(c.pulseB-c.pulseA)*(c.angleB-c.angleA);
  if(pulse<Math.min(c.pulseA,c.pulseB)-1e-8||pulse>Math.max(c.pulseA,c.pulseB)+1e-8||target<c.minAngle-1e-10||target>c.maxAngle+1e-10||angles[i]<c.minAngle||angles[i]>c.maxAngle){targets.push(null);status.push('outside-calibration');continue;}
  targets.push(target);if(ms>0)angles[i]=target+(angles[i]-target)*Math.exp(-ms/c.responseMs);status.push(Math.abs(angles[i]-target)<1e-4?'settled':'tracking');
 }
 return{angles,targets,status};
}
