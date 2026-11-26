import {rfidLatchPose} from './rfid-latch';
type V=readonly[number,number,number];
type Box={centre:V;axes:readonly[V,V,V];half:V};
const dot=(a:V,b:V)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const cross=(a:V,b:V):V=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
function overlaps(a:Box,b:Box){const delta:V=[b.centre[0]-a.centre[0],b.centre[1]-a.centre[1],b.centre[2]-a.centre[2]],axes=[...a.axes,...b.axes,...a.axes.flatMap(x=>b.axes.map(y=>cross(x,y)))];for(const axis of axes){if(dot(axis,axis)<1e-16)continue;const radius=(box:Box)=>box.axes.reduce((sum,d,n)=>sum+box.half[n]*Math.abs(dot(axis,d)),0);if(Math.abs(dot(delta,axis))>radius(a)+radius(b)+1e-9)return false;}return true;}
/** SAT contact for the actual rectangular latch tab and three strike walls,
 * in the same authored mm coordinates as RfidDoorParts. No torque model. */
export function rfidLatchContact(doorAngle:number,latchAngle:number){
 if(!Number.isFinite(doorAngle)||doorAngle<0||doorAngle>75)throw new RangeError('Door angle must be 0–75');
 const alpha=rfidLatchPose(latchAngle).radians,c=Math.cos(alpha),s=Math.sin(alpha),theta=doorAngle*Math.PI/180,dc=Math.cos(theta),ds=Math.sin(theta);
 const tab:Box={centre:[88-10*c,56+10*s,32.5],axes:[[c,-s,0],[s,c,0],[0,0,1]],half:[10,2,.75]},doorAxes:Box['axes']=[[dc,0,ds],[0,1,0],[-ds,0,dc]];
 const strike:readonly [V,V][]=[[[66.5,56,16.125],[.5,3,14.625]],[[70.5,56,16.125],[.5,3,14.625]],[[68.5,56,30.25],[2.5,3,.5]]];
 return strike.some(([p,half])=>overlaps(tab,{centre:[dc*p[0]-ds*p[2],p[1],ds*p[0]+dc*p[2]],axes:doorAxes,half}));
}
