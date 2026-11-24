/** Mirrors mini_drawbridge_model.ino. Commands are consumed before one due 1° step. */
export type DrawbridgeState={position:number;target:number;lastStep:number;command:number;lines:{at:number;text:string}[]};
export function drawbridgeInitial(reverse=false):DrawbridgeState{return {position:35,target:35,lastStep:0,command:reverse?145:35,lines:[{at:0,text:'Lowered command. Send r to raise or l to lower.'}]};}
export function drawbridgeTick(previous:DrawbridgeState,serial:string,now:number,reverse=false):DrawbridgeState{
 now=now>>>0;const s={...previous,lines:[...previous.lines]};
 for(const character of serial){if(character==='r')s.target=90;else if(character==='l')s.target=35;}
 if(s.position===s.target||((now-s.lastStep)>>>0)<24)return s;
 s.lastStep=now;s.position+=s.position<s.target?1:-1;s.command=reverse?180-s.position:s.position;
 if(s.position===s.target)s.lines.push({at:now,text:s.position===90?'Raised command reached':'Lowered command reached'});
 return s;
}
export type DrawbridgePoint=[number,number,number];
export const drawbridgePivot:DrawbridgePoint=[-1,.87,0];
export function drawbridgeDeckPoint(point:DrawbridgePoint,angle:number):DrawbridgePoint{const a=angle*Math.PI/180;return [-1+Math.cos(a)*point[0]-Math.sin(a)*point[1],.87+Math.sin(a)*point[0]+Math.cos(a)*point[1],point[2]];}
const unit=(v:number)=>Math.max(0,Math.min(1,v));
/** Separate horn, plate and screw tools keep the servo output accessible during fitting. */
export function drawbridgeHornPose(progress:number){const t=unit(progress),lift=unit(t/.16),turn=unit((t-.16)/.16),travel=unit((t-.32)/.16),lower=unit((t-.48)/.16),insert=unit((t-.64)/.16);return {position:[-2.8+1.8*travel,.18+2.42*lift-1.73*lower,1.9-1.235*travel+.055*insert] as DrawbridgePoint,rotationX:-Math.PI/2*(1-turn)};}
export function drawbridgePlatePose(progress:number){const t=unit(progress),lift=unit(t/.16),turn=unit((t-.16)/.16),travel=unit((t-.32)/.16),lower=unit((t-.48)/.32),seat=unit((t-.80)/.10);return {position:[-2.8+1.8*travel,.19+2.81*lift-1.70*lower-.43*seat,1.3-.67*travel] as DrawbridgePoint,rotationX:-Math.PI/2*(1-turn)};}
export function drawbridgeScrewPose(progress:number){const t=unit(progress),lift=unit(t/.16),turn=unit((t-.16)/.16),travel=unit((t-.32)/.16),lower=unit((t-.48)/.42),seat=unit((t-.90)/.04),insert=unit((t-.94)/.06);return {position:[-3.3+2.3*travel,.20+3.20*lift-2.10*lower-.43*seat,1.6-.40*travel-.48*insert] as DrawbridgePoint,rotationX:-Math.PI/2*(1-turn)};}
export function drawbridgeClearRoad(angle:number,coupled:boolean){return coupled&&angle===0;}
export function drawbridgeClearCanal(angle:number,coupled:boolean){return coupled&&angle===55;}
