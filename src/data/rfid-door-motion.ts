/** Authored hand-operated hinge travel at 60°/s. The servo releases the latch;
 * it does not power the door. Closing/opening requests wait for the release pose. */
export function rfidDoorAdvance(angle:number,target:number,latchAngle:number,elapsedMs:number){
 if(![angle,target].every(n=>Number.isFinite(n)&&n>=0&&n<=75)||!Number.isFinite(latchAngle)||latchAngle<35||latchAngle>105||!Number.isFinite(elapsedMs)||elapsedMs<0)throw new RangeError('Invalid RFID door motion');
 if(latchAngle<100)return angle;
 const step=elapsedMs*.06;return Math.abs(target-angle)<=step+1e-9?target:angle+Math.sign(target-angle)*step;
}
