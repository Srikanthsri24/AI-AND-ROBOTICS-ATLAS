import{aquaPhysical as d,aquaRampStart as start,aquaRampEnd as end}from'./aquaclean-layout';
/** Authored illustrative motion, not a torque / fluid dynamics prediction. */
export const aquaChip={width:12,height:5,depth:10,faceOffset:7,releaseDegrees:75};
export function aquaCarryPose(degrees:number){if(!Number.isFinite(degrees)||degrees<0||degrees>aquaChip.releaseDegrees)throw Error('Carry angle outside the checked pickup sector.');const t=degrees/aquaChip.releaseDegrees,ease=t*t*(3-2*t),r0=d.paddle.y-d.waterY-aquaChip.height/2,r=r0+(d.paddle.radius-aquaChip.height/2-r0)*ease,a=degrees*Math.PI/180;return{x:d.paddle.x+aquaChip.faceOffset*Math.cos(a)+r*Math.sin(a),y:d.paddle.y+aquaChip.faceOffset*Math.sin(a)-r*Math.cos(a),rotation:a,radius:r};}
export function aquaReleaseFlight(){const pose=aquaCarryPose(aquaChip.releaseDegrees),a=pose.rotation,w=216*Math.PI/180,vx=(pose.radius*Math.cos(a)-aquaChip.faceOffset*Math.sin(a))*w,vy=(aquaChip.faceOffset*Math.cos(a)+pose.radius*Math.sin(a))*w,g=9806.65,slope=d.ramp.slope,offset=aquaChip.height/2*Math.sqrt(1+slope*slope),dy=pose.y-(start.y+slope*(pose.x-start.x)+offset),v=vy-slope*vx,disc=v*v+2*g*dy;if(disc<0)throw Error('The authored release cannot reach the ramp.');const time=(v+Math.sqrt(disc))/g,x=pose.x+vx*time,y=pose.y+vy*time-g*time*time/2;if(x<start.x||x>end.x)throw Error('The authored release misses the ramp.');return{pose,vx,vy,gravity:g,time,landing:{x,y,rotation:Math.atan(slope)}};}
export function aquaFlightPose(seconds:number){const f=aquaReleaseFlight();if(!Number.isFinite(seconds)||seconds<0||seconds>f.time)throw Error('Flight time outside the checked handoff.');const t=seconds/f.time,e=t*t*(3-2*t);return{x:f.pose.x+f.vx*seconds,y:f.pose.y+f.vy*seconds-f.gravity*seconds*seconds/2,rotation:f.pose.rotation+(f.landing.rotation-f.pose.rotation)*e};}

export const aquaBatchCount=17;
export type AquaCollectionPhase='approach'|'carry'|'flight'|'ramp'|'basket'|'done';
export type AquaCollection={phase:AquaCollectionPhase;collected:number;phaseUs:number;travel:number;approachStart:number;captureAt:number;fillMm:number};
/** A delivery represents a model litter batch. Five-mm fill increments are
 * authored teaching proxies, not a volume calculation for one foam chip.
 */
export function aquaCollectionInitial(collected=0,rotor=0):AquaCollection{if(!Number.isInteger(collected)||collected<0||collected>17||!Number.isFinite(rotor))throw Error('Invalid collection start.');return{phase:collected===17?'done':'approach',collected,phaseUs:0,travel:rotor,approachStart:rotor,captureAt:Math.ceil((rotor+360)/90)*90,fillMm:collected*5};}
const clamp=(t:number)=>Math.max(0,Math.min(1,t)),smooth=(t:number)=>{const p=clamp(t);return p*p*(3-2*p);};
const flight=aquaReleaseFlight(),flightUs=Math.round(flight.time*1e6);
/** Called by the fixed 1 ms visual scheduler. Released batches continue settling
 * under the authored gravity path after motor stop; pickup / carry freeze.
 */
export function aquaCollectionStep(previous:AquaCollection,driveUs:number):AquaCollection{if(!Number.isInteger(driveUs)||driveUs<0||driveUs>1000)throw Error('Use a 0–1000 us motor interval.');const s={...previous,travel:previous.travel+driveUs*216/1e6};
 if(s.phase==='approach'&&s.travel>=s.captureAt){s.phase='carry';s.phaseUs=0;}
 else if(s.phase==='carry'&&s.travel>=s.captureAt+aquaChip.releaseDegrees){s.phase='flight';s.phaseUs=0;}
 else if(s.phase==='flight'){s.phaseUs+=1000;if(s.phaseUs>=flightUs){s.phase='ramp';s.phaseUs=0;}}
 else if(s.phase==='ramp'){s.phaseUs+=1000;if(s.phaseUs>=700000){s.phase='basket';s.phaseUs=0;}}
 else if(s.phase==='basket'){s.phaseUs+=1000;s.fillMm=s.collected*5+5*smooth((s.phaseUs/1e6-.25)/.3);if(s.phaseUs>=1000000){s.collected++;s.fillMm=s.collected*5;s.phaseUs=0;s.phase=s.collected===17?'done':'approach';s.approachStart=s.travel;s.captureAt=Math.ceil((s.travel+360)/90)*90;}}
 return s;
}
export function aquaLitterPose(s:AquaCollection,index:number){if(!Number.isInteger(index)||index<0||index>=17)throw Error('Unknown model batch.');const basket=(layer:number)=>({x:187,y:32+layer*5,z:0,rotation:0}),pool={x:-220+(index%5)*20,y:d.waterY+aquaChip.height/2,z:(Math.floor(index/5)-1.5)*18,rotation:0};if(index<s.collected)return basket(index);if(index>s.collected||s.phase==='done')return pool;
 const pickup=aquaCarryPose(0);
 if(s.phase==='approach'){const t=smooth((s.travel-s.approachStart)/(s.captureAt-s.approachStart));return{x:pool.x+(pickup.x-pool.x)*t,y:pool.y,z:pool.z*(1-t),rotation:0};}
 if(s.phase==='carry')return{...aquaCarryPose(Math.min(75,Math.max(0,s.travel-s.captureAt))),z:0};
 if(s.phase==='flight')return{...aquaFlightPose(Math.min(flight.time,s.phaseUs/1e6)),z:0};
 const angle=Math.atan(d.ramp.slope),rampEnd={x:end.x-Math.sin(angle)*2.5,y:end.y+Math.cos(angle)*2.5,z:0,rotation:angle};
 if(s.phase==='ramp'){const t=smooth(s.phaseUs/700000);return{x:flight.landing.x+(rampEnd.x-flight.landing.x)*t,y:flight.landing.y+(rampEnd.y-flight.landing.y)*t,z:0,rotation:angle};}
 const t=clamp(s.phaseUs/1e6),final=basket(s.collected);
 if(t<.25){const p=smooth(t/.25);return{x:rampEnd.x+(143-rampEnd.x)*p,y:rampEnd.y,z:0,rotation:angle*(1-p)};}
 if(t<.55){const p=smooth((t-.25)/.3);return{x:143,y:rampEnd.y+(final.y-rampEnd.y)*p,z:0,rotation:0};}
 return{x:143+(final.x-143)*smooth((t-.55)/.45),y:final.y,z:0,rotation:0};
}

export const aquaLitterParts=Array.from({length:aquaBatchCount},(_,i)=>[`aqua-litter-${i+1}`,`Model litter batch ${i+1}`,'A foam marker follows the authored pickup, lift, ramp and basket sequence.','Each delivery represents a model litter batch; its five-millimetre fill increment is an illustration, not a physical volume calculation.'] as const);
