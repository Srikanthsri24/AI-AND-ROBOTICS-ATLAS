import type {BluetoothCarPose} from './bluetooth-car-motion';
/** Surface contact model: paper slides and turns only when a real moving felt pad overlaps it.
 * Motion / friction constants are illustrative; no measured cleanup efficiency is claimed.
 */
export const solarBrushGeometry={x:.07,z:-3.45,padRadius:.12,padOrbit:.30,hubRadius:.465,laneHalfWidth:.25,paperWidth:.12,paperLength:.17};
export type SweepScrap={id:number;x:number;z:number;yaw:number;vx:number;vz:number;spin:number};
export const solarSweepPaperInitial=():SweepScrap[]=>[[-.15,-4.05],[.16,-4.60],[-.08,-5.20],[.12,-5.75],[-.18,-6.30],[.08,-6.90]].map(([x,z],id)=>({id,x,z,yaw:(id%3-1)*.22,vx:0,vz:0,spin:0}));
export function solarSweepPads(pose:Pick<BluetoothCarPose,'x'|'z'|'yaw'>,angle:number){const g=solarBrushGeometry,c=Math.cos(pose.yaw),s=Math.sin(pose.yaw);return [0,1,2].map(i=>{const a=angle+i*Math.PI*2/3,x=g.x+Math.sin(a)*g.padOrbit,z=g.z+Math.cos(a)*g.padOrbit;return {x:pose.x+c*x+s*z,z:pose.z-s*x+c*z};});}
export function solarSweepPaperStep(paper:SweepScrap[],seconds:number,before:BluetoothCarPose,after:BluetoothCarPose,brush:{angle:number;omega:number;contact:boolean}):SweepScrap[]{
 if(!Number.isFinite(seconds)||seconds<=0)return paper;const dt=Math.min(seconds,.02),g=solarBrushGeometry,pads=solarSweepPads(after,brush.angle),vX=(after.x-before.x)/seconds,vZ=(after.z-before.z)/seconds,frameYaw=(after.yaw-before.yaw)/seconds;
 return paper.map(p=>{let vx=p.vx,vz=p.vz,spin=p.spin;const c=Math.cos(p.yaw),s=Math.sin(p.yaw);if(brush.contact)for(let i=0;i<3;i++){const pad=pads[i],dx=pad.x-p.x,dz=pad.z-p.z,localX=c*dx-s*dz,localZ=s*dx+c*dz,qx=Math.max(-g.paperWidth/2,Math.min(g.paperWidth/2,localX)),qz=Math.max(-g.paperLength/2,Math.min(g.paperLength/2,localZ)),distance=Math.hypot(localX-qx,localZ-qz);if(distance>=g.padRadius)continue;
 const weight=1-distance/g.padRadius,phase=brush.angle+i*Math.PI*2/3,localVX=Math.cos(phase)*g.padOrbit*brush.omega,localVZ=-Math.sin(phase)*g.padOrbit*brush.omega,cy=Math.cos(after.yaw),sy=Math.sin(after.yaw),targetX=vX+cy*localVX+sy*localVZ+frameYaw*(pad.z-after.z),targetZ=vZ-sy*localVX+cy*localVZ-frameYaw*(pad.x-after.x),a=1-Math.exp(-28*weight*dt),dvx=(targetX-vx)*a,dvz=(targetZ-vz)*a;vx+=dvx;vz+=dvz;spin=Math.max(-6,Math.min(6,spin+(dz*dvx-dx*dvz)*18));}
 const friction=Math.exp(-5*dt);vx*=friction;vz*=friction;spin*=Math.exp(-6*dt);if(Math.hypot(vx,vz)<.0005){vx=0;vz=0;}if(Math.abs(spin)<.0005)spin=0;return {...p,x:p.x+vx*dt,z:p.z+vz*dt,yaw:p.yaw+spin*dt,vx,vz,spin};});
}
export function solarSweepOutside(p:SweepScrap){const g=solarBrushGeometry,halfX=Math.abs(Math.cos(p.yaw))*g.paperWidth/2+Math.abs(Math.sin(p.yaw))*g.paperLength/2;return Math.abs(p.x)-halfX>g.laneHalfWidth;}
