/** Millimetres/radians/seconds. Authored lightweight foam-block teaching rig;
 * these dimensions and response constants are not a kit/load rating. */
export const pickRoverRig={wheelRadius:32.5,track:142,pivotY:90,linkLength:100,palmReach:35,lowAngle:-40*Math.PI/180,highAngle:0,blockWidth:40,blockHeight:50,blockDepth:30,openGap:60,closedGap:34,padCompression:1,servoResponseMs:60,wheelResponseMs:80,maximumSpeed:360,gravity:9810,releaseClearance:4};
export type PickRoverMotion={clockMs:number;remainderMs:number;z:number;speed:number;wheelAngle:number;liftAngle:number;jawGap:number;block:{x:number;y:number;z:number;vy:number;held:boolean};captures:number;releases:number;landings:number;delivered:boolean};
export type PickRoverActuation={wheelPwm:number;liftPulse:number|null;jawPulse:number|null;motorPower:boolean;servoPower:boolean;logicReference:boolean};
export function pickRoverTip(s:Pick<PickRoverMotion,'z'|'liftAngle'>){return{x:0,y:pickRoverRig.pivotY+pickRoverRig.linkLength*Math.sin(s.liftAngle),z:s.z-pickRoverRig.linkLength*Math.cos(s.liftAngle)-pickRoverRig.palmReach};}
const startTip=pickRoverTip({z:0,liftAngle:pickRoverRig.lowAngle});
export const pickRoverCourse={pickupZ:startTip.z,deliveryZ:startTip.z-120,deliveryHalfDepth:35,deliveryHalfWidth:40};
export function pickRoverMotionInitial(blockOffset:{x?:number;z?:number}={}):PickRoverMotion{const x=blockOffset.x??0,z=blockOffset.z??0;if(!Number.isFinite(x)||!Number.isFinite(z))throw new RangeError('Finite block offset required');return{clockMs:0,remainderMs:0,z:0,speed:0,wheelAngle:0,liftAngle:pickRoverRig.lowAngle,jawGap:pickRoverRig.openGap,block:{x,y:pickRoverRig.blockHeight/2,z:startTip.z+z,vy:0,held:false},captures:0,releases:0,landings:0,delivered:false};}
const damp=(value:number,target:number,ms:number,tau:number)=>target+(value-target)*Math.exp(-ms/tau);
function step(s:PickRoverMotion,a:PickRoverActuation):PickRoverMotion{
 const r=pickRoverRig,dt=.001,speed=damp(s.speed,a.motorPower&&a.logicReference?-a.wheelPwm/255*r.maximumSpeed:0,1,r.wheelResponseMs),travel=(s.speed+speed)*dt/2;
 let liftAngle=s.liftAngle,jawGap=s.jawGap;
 const liftActive=a.servoPower&&a.logicReference&&a.liftPulse!==null,jawActive=a.servoPower&&a.logicReference&&a.jawPulse!==null;
 if(liftActive){const target=r.lowAngle+(a.liftPulse!-1440)/120*(r.highAngle-r.lowAngle);liftAngle=damp(liftAngle,target,1,r.servoResponseMs);}
 if(jawActive){const target=r.openGap+(a.jawPulse!-1450)/100*(r.closedGap-r.openGap);jawGap=damp(jawGap,target,1,r.servoResponseMs);}
 let next={...s,clockMs:s.clockMs+1,z:s.z+travel,speed,wheelAngle:s.wheelAngle+travel/r.wheelRadius,liftAngle,jawGap,block:{...s.block}},tip=pickRoverTip(next);
 const aligned=Math.abs(next.block.x-tip.x)<=3&&Math.abs(next.block.z-tip.z)<=r.blockDepth/2-2&&Math.abs(next.block.y-tip.y)<=7;
 if(!next.block.held&&jawActive&&next.jawGap<=r.blockWidth&&s.jawGap>r.blockWidth&&aligned){next.block.held=true;next.captures++;next.delivered=false;}
 if(next.block.held){
  if(!jawActive||next.jawGap>=r.blockWidth+r.releaseClearance){next.block.held=false;next.releases++;next.block.vy=0;}
  else {next.jawGap=Math.max(next.jawGap,r.blockWidth-2*r.padCompression);next.block={x:tip.x,y:Math.max(r.blockHeight/2,tip.y),z:tip.z,vy:0,held:true};}
 }
 if(!next.block.held){const wasAbove=next.block.y>r.blockHeight/2;next.block.vy-=r.gravity*dt;next.block.y+=next.block.vy*dt;if(next.block.y<=r.blockHeight/2){next.block.y=r.blockHeight/2;next.block.vy=0;if(wasAbove)next.landings++;next.delivered=next.releases>0&&Math.abs(next.block.x)+r.blockWidth/2<=pickRoverCourse.deliveryHalfWidth&&Math.abs(next.block.z-pickRoverCourse.deliveryZ)+r.blockDepth/2<=pickRoverCourse.deliveryHalfDepth;}}
 return next;
}
/** Fixed 1 ms physical sampling; external frame size never changes grip events.
 * Loss of jaw power releases the foam block. Joint pose is retained visually;
 * this does not model unloaded joint gravity, servo torque or tyre slip. */
export function pickRoverMotionAdvance(s:PickRoverMotion,a:PickRoverActuation,ms:number):PickRoverMotion{
 if(!Number.isFinite(ms)||ms<0||!Number.isFinite(a.wheelPwm)||Math.abs(a.wheelPwm)>255||[a.liftPulse,a.jawPulse].some(p=>p!==null&&(!Number.isFinite(p)||p<1400||p>1600)))throw new RangeError('Invalid rover actuation');
 const total=s.remainderMs+ms,whole=Math.floor(total+1e-9),remainderMs=Math.max(0,Math.round((total-whole)*1e9)/1e9);let next=s;for(let n=0;n<whole;n++)next=step(next,a);return{...next,remainderMs};
}
