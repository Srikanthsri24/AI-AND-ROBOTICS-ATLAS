import{CatmullRomCurve3,Quaternion,Vector3}from'three';
import{pickMotorLeadRoute,pickMotorCableHoles}from'./pick-rover-motor-leads';
const routes=[0,1,2,3].map(i=>{const r=pickMotorLeadRoute(i);r.curve.arcLengthDivisions=1000;return{...r,length:r.curve.getLength()};});
const ease=(n:number)=>{const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t);};
/** Fit the inner lead first; its finished flare must not cover the next bore. */
export const pickMotorFeedOrder=[1,0,2,3]as const;
export const pickMotorFeedTimes=[0,.175,.35,.425,.5,.55,.6,.65,.7,.75,.8,.825,.85,.875,.9,.9125,.925,.9375,.95,.9625,.975,.9875,1]as const;
/** Prepared motor lead: fixed solder end, inverted plug through the bore,
 * rearward carry, turn above the board, then seat on the output header.
 * Below-deck slack is paid out; conductor length is never scaled. */
export function pickMotorFeedPose(index:number,progress:number){
 const r=routes[index],hole=pickMotorCableHoles[index];if(!r||!Number.isFinite(progress)||progress<0||progress>1)throw new RangeError('Invalid motor lead feed pose');
 // Snap the last sub-0.012 mm of seating to avoid a numerically degenerate slack loop.
 if(progress>=.999)progress=1;
 const carry=index===0||index===3?84:70;
 const finalPlug=new Vector3(r.pin[0],r.pin[1]-2.75,r.pin[2]),keys=[{at:0,p:new Vector3(hole.x,24,hole.z)},{at:.35,p:new Vector3(hole.x,53,hole.z)},{at:.5,p:new Vector3(hole.x,carry,hole.z)},{at:.6,p:new Vector3(hole.x,carry,110)},{at:.7,p:new Vector3(finalPlug.x+16,carry,110)},{at:.8,p:new Vector3(finalPlug.x+16,carry,finalPlug.z)},{at:.9,p:new Vector3(finalPlug.x,carry,finalPlug.z)},{at:1,p:finalPlug}];
 let plug=keys[0].p.clone();for(let n=1;n<keys.length;n++){if(progress<=keys[n].at){plug.copy(keys[n-1].p).lerp(keys[n].p,ease((progress-keys[n-1].at)/(keys[n].at-keys[n-1].at)));break;}}
 const rotation=new Quaternion().setFromAxisAngle(new Vector3(1,0,0),Math.PI*(1-ease((progress-.8)/.1))),direction=new Vector3(0,1,0).applyQuaternion(rotation),end=new Vector3(0,8.05,0).applyQuaternion(rotation).add(plug),near=end.clone().addScaledVector(direction,3),settle=ease((progress-.9)/.1),anchor=new Vector3(hole.x,Math.min(29,near.y-.1),hole.z),loopX=hole.x-r.link.side*10;
 let slack=settle;
 function build(rear:number){
  const under=[r.start.clone(),new Vector3(r.start.x,29,42),new Vector3(loopX,15,65),new Vector3(loopX,15,rear),new Vector3(loopX,24,rear),new Vector3(loopX,24,65),anchor.clone()];
  for(let n=2;n<6;n++)under[n].lerp(new Vector3(hole.x,29,hole.z),slack);
  let upper:Vector3[];
  if(progress<=.35)upper=[near.clone(),end.clone()];else{const top=Math.min(43,near.y-.1),level=Math.max(top,near.y),back=progress<=.5?hole.z:progress<.6?end.z:110,laneX=hole.x+((r.link.side<0?Math.min(hole.x,-80):Math.max(hole.x,82))-hole.x)*ease((progress-.5)/.05),approachX=end.x+(hole.x<end.x?-1:1)*3*Math.sqrt(Math.max(0,1-direction.y*direction.y));upper=[new Vector3(hole.x,top,hole.z),new Vector3(laneX,Math.min(48,level),hole.z),new Vector3(laneX,level,hole.z),new Vector3(laneX,level,back),new Vector3(approachX,level,back),new Vector3(approachX,level,near.z),new Vector3(approachX,near.y,near.z),near.clone(),end.clone()];const final=r.curve.points.slice(3);upper.forEach((p,n)=>{const target=final[n].clone();if(n>=6)target.add(end.clone().sub(r.end));p.lerp(target,settle);});if(index===3&&progress>.9){const tail=ease((progress-.9)/.04);upper[5].x=end.x+14*tail;upper[5].z=end.z;upper[6].set(end.x+14*tail,end.y+3+2*tail,end.z);upper[7].set(end.x,end.y+3-tail,end.z);upper[8].copy(end);}if(index===0&&progress>.9){const clear=ease((progress-.9)/.025),back=progress<.975?110-70*clear:40+105*ease((progress-.975)/.025),level=progress<.925?Math.max(69,near.y):(carry+(finalPlug.y-carry)*ease(.25)+11.05)+(64-(carry+(finalPlug.y-carry)*ease(.25)+11.05))*ease((progress-.925)/.05);for(const n of[2,3,4,5])upper[n].y=level;upper[3].z=back;upper[4].z=back;upper[4].x=end.x+8*clear;upper[5].x=end.x+8*clear;upper[5].z=end.z;upper[6].set(end.x+8*clear,end.y+3+2*clear,end.z);upper[7].set(end.x,end.y+3-clear,end.z);upper[8].copy(end);}}
  const points=[...under,...upper].filter((p,n,a)=>!n||p.distanceTo(a[n-1])>.001),curve=new CatmullRomCurve3(points,false,'catmullrom',.03);curve.arcLengthDivisions=1000;return curve;
 }
 if(progress===1)return{curve:r.curve,plug,rotation,length:r.length,slackRear:65};
 let low=65.5,high=260,a=build(low),b=build(high),min=a.getLength(),max=b.getLength();if(min>r.length){slack=1;const shortest=build(low).getLength(),target=r.length-Math.min(.1,Math.max(0,(r.length-shortest)/2));let lo=settle,hi=1;for(let n=0;n<25;n++){slack=(lo+hi)/2;if(build(low).getLength()>target)lo=slack;else hi=slack;}slack=hi;a=build(low);b=build(high);min=a.getLength();max=b.getLength();}if(max<r.length){slack=0;const longest=build(high).getLength(),target=r.length+Math.min(.1,Math.max(0,(longest-r.length)/2));let lo=0,hi=settle;for(let n=0;n<25;n++){slack=(lo+hi)/2;if(build(high).getLength()>target)lo=slack;else hi=slack;}slack=lo;a=build(low);b=build(high);min=a.getLength();max=b.getLength();}if(r.length<min-.1||r.length>max+.1)throw Error(`Motor ${index} at ${progress}: length ${r.length} outside slack capacity ${min}–${max}`);
 let curve=a,rear=low;for(let n=0;n<25;n++){rear=(low+high)/2;curve=build(rear);if(curve.getLength()>r.length)high=rear;else low=rear;}
 return{curve,plug,rotation,length:r.length,slackRear:rear};
}

/** Flex the inner left rail clear of the 5V tie while a plug is inserted.
 * The paired rear corner compensates for the bend without moving either end. */
export function pickMotorTieClearance(amount:number,index=1){
 if(!Number.isFinite(amount)||amount<0||amount>(index===0?10.5:7.5)||![0,1].includes(index))throw new RangeError('Invalid motor tie clearance');
 const r=routes[index];if(amount===0)return r.curve;
 const build=(rear:number)=>{const points=r.curve.points.map(p=>p.clone());for(const n of[4,5,6])points[n].x+=amount;if(index===0)points[4].y+=3*amount/10.5;for(const n of[6,7])points[n].z+=rear;const curve=new CatmullRomCurve3(points,false,'catmullrom',.03);curve.arcLengthDivisions=1000;return curve;};
 let lo=-4,hi=4,curve=build(0);for(let n=0;n<25;n++){const mid=(lo+hi)/2;curve=build(mid);if(curve.getLength()>r.length)hi=mid;else lo=mid;}return curve;
}
