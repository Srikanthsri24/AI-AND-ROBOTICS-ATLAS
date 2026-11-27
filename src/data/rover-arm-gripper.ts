import{Shape,Path}from'three';
/** Authored teaching transmission, not kit CAD. Standard 20-degree involute
 * proportions; 20 teeth avoid the low-tooth-count undercut of the old sketch.
 * Reference: https://www.sdp-si.com/resources/elements-of-metric-gear-technology/index.php */
export const raGrip={radius:7.6,teeth:20,module:.76,pressure:20*Math.PI/180,backlash:.025};
export const raGripPitch=Math.PI*raGrip.module;
export const raGripRoot=raGrip.radius+1.25*raGrip.module;
export const raGripRackZ=raGripRoot+2;
export function raGripPinion(){const s=new Shape(),r=raGrip.radius,base=r*Math.cos(raGrip.pressure),root=r-1.25*raGrip.module,outer=r+raGrip.module,inv=(a:number)=>Math.tan(a)-a,half=(at:number)=>Math.PI/(2*raGrip.teeth)+inv(raGrip.pressure)-inv(Math.acos(Math.min(1,base/at)))-raGrip.backlash/r;
 const point=(radius:number,a:number)=>s.lineTo(radius*Math.cos(a),radius*Math.sin(a));
 for(let tooth=0;tooth<raGrip.teeth;tooth++){const c=tooth*2*Math.PI/raGrip.teeth,h=half(base);if(tooth===0)s.moveTo(root*Math.cos(c-h),root*Math.sin(c-h));else point(root,c-h);point(base,c-h);for(let i=1;i<=10;i++){const a=base+(outer-base)*i/10;point(a,c-half(a));}for(let i=1;i<=5;i++)point(outer,c-half(outer)+2*half(outer)*i/5);for(let i=9;i>=0;i--){const a=base+(outer-base)*i/10;point(a,c+half(a));}point(root,c+h);for(let i=1;i<=4;i++)point(root,c+h+(2*Math.PI/raGrip.teeth-2*h)*i/4);}
 s.closePath();const hole=new Path();hole.absarc(0,0,1.3,0,Math.PI*2,true);s.holes.push(hole);return s;}
export function raGripTooth(side:-1|1){const s=new Shape(),pitchHalf=raGripPitch/4-raGrip.backlash,rootHalf=pitchHalf+1.25*raGrip.module*Math.tan(raGrip.pressure),tipHalf=pitchHalf-raGrip.module*Math.tan(raGrip.pressure),sign=-side,tip=raGrip.radius-raGrip.module; s.moveTo(-rootHalf,-sign*raGripRoot);s.lineTo(rootHalf,-sign*raGripRoot);s.lineTo(tipHalf,-sign*tip);s.lineTo(-tipHalf,-sign*tip);s.closePath();return s;}
export function raGripToothX(side:-1|1){const phase=(11+raGripPitch/2)%raGripPitch;return Array.from({length:13},(_,i)=>-side*13+(i-6)*raGripPitch-side*phase);}
