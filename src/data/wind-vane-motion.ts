/** Slowed classroom motion, not a calibrated aerodynamic or magnetic-field solver. */
export type VaneMotion={angle:number;velocity:number};
export type VaneDrive={source:number;strength:number;hand:number|null;tight:boolean};
export const vaneHeading=(angle:number)=>((angle%360)+360)%360;
export const vaneDifference=(target:number,angle:number)=>((target-angle+540)%360+360)%360-180;
export function vaneMotionStep(previous:VaneMotion,elapsed:number,drive:VaneDrive):VaneMotion{
 if(!Number.isFinite(elapsed)||elapsed<0||!Number.isFinite(previous.angle)||!Number.isFinite(previous.velocity)||!Number.isFinite(drive.source)||!Number.isFinite(drive.strength)||drive.strength<0||drive.strength>1||(drive.hand!==null&&!Number.isFinite(drive.hand)))throw new Error('Use a finite pose, elapsed time and supported airflow strength.');
 const p={...previous},duration=Math.min(.1,elapsed);if(drive.tight)return {...p,velocity:0};
 if(drive.hand!==null){const d=vaneDifference(drive.hand,p.angle);p.angle+=Math.sign(d)*Math.min(Math.abs(d),duration*75);p.velocity=Math.abs(vaneDifference(drive.hand,p.angle))<1e-9?0:Math.sign(d)*75;return p;}
 const count=Math.max(1,Math.ceil(duration*120)),dt=duration/count;
 for(let i=0;i<count;i++){const error=vaneDifference(drive.source,p.angle),gust=Math.abs(error)>175&&Math.abs(p.velocity)<.1?80*drive.strength:0,acceleration=1050*drive.strength*Math.sin(error*Math.PI/180)+gust-4*p.velocity;p.velocity=Math.max(-150,Math.min(150,p.velocity+acceleration*dt));p.angle+=p.velocity*dt;if(drive.strength>0&&Math.abs(vaneDifference(drive.source,p.angle))<.08&&Math.abs(p.velocity)<.2){p.angle+=vaneDifference(drive.source,p.angle);p.velocity=0;}if(drive.strength===0&&Math.abs(p.velocity)<.05)p.velocity=0;}
 return p;
}
export function vaneRaw(angle:number,reverse=false,zero=1400){return ((Math.round(angle*4096/360)*(reverse?-1:1)+zero)%4096+4096)%4096;}
/** Representative status scenarios for teaching; real flags depend on the magnet and must be read from the chip. */
export function vaneMagnetStatus(gap:number,offset:number,present=true){if(!Number.isFinite(gap)||!Number.isFinite(offset)||gap<0||offset<0)throw new Error('Use a valid nonnegative gap and lateral offset.');if(!present||offset>1.5)return 0;if(gap<.5)return 0x28;if(gap>3)return 0x30;return 0x20;}
export const vaneDimensions={axisX:1.1,nominalBoardY:.4,scale:.021,chipTop:.0636,nominalGap:1.5,magnetHeight:.042,magnetRadius:.063,shaftRadius:.025,boreRadius:.031,beamY:2.05,shaftTop:2.02,bearingY:1.5,bearingLength:.4};
export function vaneBoardPose(gap:number,offset:number):[number,number,number]{return [vaneDimensions.axisX+offset*vaneDimensions.scale,vaneDimensions.nominalBoardY+(vaneDimensions.nominalGap-gap)*vaneDimensions.scale,0];}
export const vaneMagnetBottom=vaneDimensions.nominalBoardY+vaneDimensions.chipTop+vaneDimensions.nominalGap*vaneDimensions.scale;
export const vaneMagnetCenter=vaneMagnetBottom+vaneDimensions.magnetHeight/2;
/** Bring the magnet in from behind the chip, avoiding the taller header row at the front. */
export function vaneMagnetPose(progress:number):[number,number,number]{const e=(a:number,b:number)=>{const n=Math.max(0,Math.min(1,(progress-a)/(b-a)));return n*n*(3-2*n);};return [vaneDimensions.axisX+.85*(1-e(.3,.6)),.281+(vaneMagnetCenter-.281)*e(0,.3),-1+e(.6,1)];}
