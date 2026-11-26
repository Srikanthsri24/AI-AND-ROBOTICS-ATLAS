export const rfidLatch={locked:35,released:105,shaft:[88,56,32.5] as const,tabLength:20,tabHalfWidth:2,strikeRight:71,strikeFront:30.75,tabBack:31.75};
/** Classroom model dimensions in mm; not a commercial lock or manufacturer CAD. */
export function rfidLatchPose(angle:number){
 if(!Number.isFinite(angle)||angle<35||angle>105)throw new RangeError('Latch angle must be 35–105 degrees');
 const radians=(angle-35)*Math.PI/180,minX=88-20*Math.cos(radians)-2*Math.sin(radians);
 return {radians,minX,clear:minX>rfidLatch.strikeRight+.5,tip:[88-20*Math.cos(radians),56+20*Math.sin(radians),32.5] as const};
}
export function rfidLatchAdvance(angle:number,target:35|105,elapsedMs:number,powered:boolean){
 rfidLatchPose(angle);rfidLatchPose(target);if(!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid latch elapsed time');
 if(!powered)return angle;const step=elapsedMs*.09;return Math.abs(target-angle)<=step+1e-9?target:angle+Math.sign(target-angle)*step;
}
