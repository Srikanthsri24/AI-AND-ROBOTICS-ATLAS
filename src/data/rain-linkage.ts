import {rainServoAngles} from './rain-clothesline';
export type RainMechanicalPoint=readonly[number,number,number];
/** Authored classroom model dimensions in mm, not a kit manufacturer's CAD. */
export const rainLinkage={shaft:[0,35.5,-16] as RainMechanicalPoint,hornRadius:20,rodLength:65,sliderZ:0,railX:[24,99] as const,roofX:[28,66] as const,carriageHalfLength:13};
/** Mount the horn so Servo 35° shelters the load and 130° extends it.
 * Positive square-root branch keeps the carriage to the right of the servo. */
export function rainLinkagePose(angle:number){
 if(!Number.isFinite(angle)||angle<rainServoAngles.covered||angle>rainServoAngles.outside)throw new RangeError('Operating servo angle must be 35–130 degrees');
 const theta=angle*Math.PI/180,crank:RainMechanicalPoint=[-rainLinkage.hornRadius*Math.cos(theta),35.5,-16+rainLinkage.hornRadius*Math.sin(theta)],dz=rainLinkage.sliderZ-crank[2],dx=Math.sqrt(rainLinkage.rodLength**2-dz**2),slider:RainMechanicalPoint=[crank[0]+dx,35.5,0];
 return {angle,crank,slider,rodAngle:Math.atan2(dz,dx),carriageMinX:slider[0]-rainLinkage.carriageHalfLength,carriageMaxX:slider[0]+rainLinkage.carriageHalfLength};
}
/** Deliberately slowed visual response for following the linkage, not measured hardware speed. */
export const rainVisualServoRate=95;
export function rainServoAdvance(angle:number,target:number,elapsedMs:number,powered:boolean){
 rainLinkagePose(angle);rainLinkagePose(target);if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Mechanical elapsed time must be finite and nonnegative');
 if(!powered)return angle;const step=rainVisualServoRate*elapsedMs/1000,delta=target-angle;return Math.abs(delta)<=step?target:angle+Math.sign(delta)*step;
}
