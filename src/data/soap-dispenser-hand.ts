export type SoapHandPoint=readonly[number,number,number];
export const soapHandRegions=['soap-hand-palm','soap-hand-index','soap-hand-middle','soap-hand-ring','soap-hand-little','soap-hand-thumb','soap-hand-arm'] as const;
type Ball={centre:SoapHandPoint;radii:SoapHandPoint;region:number};
type Bone={a:SoapHandPoint;b:SoapHandPoint;r0:number;r1:number;region:number};
export const soapHandBones:readonly Bone[]=[
 ...[{z:-24,x:[-33,-58,-82,-101],r:[9,8,6.8,5.7],region:1},{z:-7,x:[-35,-64,-90,-114],r:[9.4,8.1,7,6],region:2},{z:11,x:[-34,-62,-86,-106],r:[8.8,7.5,6.6,5.5],region:3},{z:28,x:[-29,-51,-72,-86],r:[7.4,6.5,5.8,4.8],region:4}].flatMap(f=>[0,1,2].map(i=>({a:[f.x[i],[-11,-8,-8,-11][i],f.z+(f.region===4?i*2:0)] as SoapHandPoint,b:[f.x[i+1],[-11,-8,-8,-11][i+1],f.z+(f.region===4?(i+1)*2:0)] as SoapHandPoint,r0:f.r[i],r1:f.r[i+1],region:f.region}))),
 {a:[25,-10,-27],b:[44,-9,-43],r0:11,r1:9,region:5},{a:[44,-9,-43],b:[35,-10,-57],r0:9,r1:7.6,region:5},{a:[35,-10,-57],b:[22,-12,-62],r0:7.6,r1:6,region:5},
];
const balls:readonly Ball[]=[{centre:[0,-12,0],radii:[49,13,39],region:0},{centre:[22,-11,-21],radii:[27,11,20],region:0},{centre:[107,-13,4],radii:[91,13,23],region:6}];
const ellipsoid=(p:SoapHandPoint,b:Ball)=>{const v=p.map((n,i)=>n-b.centre[i]),k0=Math.hypot(...v.map((n,i)=>n/b.radii[i])),k1=Math.hypot(...v.map((n,i)=>n/(b.radii[i]*b.radii[i])));return k1>1e-12?k0*(k0-1)/k1:-Math.min(...b.radii);};
const capsule=(p:SoapHandPoint,b:Bone)=>{const v=b.b.map((n,i)=>n-b.a[i]),w=p.map((n,i)=>n-b.a[i]),t=Math.max(0,Math.min(1,w.reduce((n,x,i)=>n+x*v[i],0)/v.reduce((n,x)=>n+x*x,0)));return Math.hypot(...w.map((n,i)=>n-t*v[i]))-(b.r0+(b.r1-b.r0)*t);};
function blend(a:number,b:number){const h=Math.max(0,3.5-Math.abs(a-b))/3.5;return Math.min(a,b)-h*h*3.5*.25;}
export function soapHandField(x:number,y:number,z:number){const p:SoapHandPoint=[x,y,z];let value=Infinity;for(const b of balls)value=blend(value,ellipsoid(p,b));for(const b of soapHandBones)value=blend(value,capsule(p,b));return value;}
export function soapHandRegion(x:number,y:number,z:number){const p:SoapHandPoint=[x,y,z];let min=Infinity,region=0;for(const b of balls){const d=ellipsoid(p,b);if(d<min){min=d;region=b.region;}}for(const b of soapHandBones){const d=capsule(p,b);if(d<min){min=d;region=b.region;}}return region;}
export function soapHandSurface(x:number,z:number){let high=12;for(let low=11.5;low>=-35;low-=.5){if(soapHandField(x,low,z)<=0){let a=low,b=high;for(let i=0;i<18;i++){const y=(a+b)/2;if(soapHandField(x,y,z)<=0)a=y;else b=y;}return (a+b)/2;}high=low;}return null;}
export const soapHandParts=[
 ['Human hand · palm','The upturned palm receives soap beneath the open nozzle.','It gives the sensor a broad reflecting surface. Move the hand away after one stroke so the dispenser can rearm.'],
 ['Human hand · index finger','Forms one edge of the open receiving hand.','The fingertips stay in front of the bottle while the palm moves under the outlet.'],
 ['Human hand · middle finger','Extends alongside the index finger as the hand is held open.','Keep a relaxed open shape while the wrist positions the palm beneath the sensor.'],
 ['Human hand · ring finger','Helps form the open hand beside the receiving palm.','The servo operates the pump while the hand waits beneath the outlet.'],
 ['Human hand · little finger','Forms the outside edge of the open hand.','The side approach keeps this edge clear of the dispenser wiring and stand.'],
 ['Human hand · thumb','Opens to the side of the palm.','Its position leaves room for soap to reach the receiving area while the hand stays clear of the nozzle.'],
 ['Human hand · wrist and forearm','Moves the palm into and out of the sensing area.','Withdraw the hand far enough to restore a clear reading before requesting the next stroke.'],
].map(([label,what,connection],i)=>({id:soapHandRegions[i],label,what,connection}));
/** Side approach keeps fingers in front of the bottle; reference height is
 * not itself a sensor reading, which must come from the actual skin surface. */
export function soapHandPose(insertion:number,referenceY=170){if(!Number.isFinite(insertion)||insertion<0||insertion>1||!Number.isFinite(referenceY)||referenceY<130||referenceY>210)throw new RangeError('Invalid dispensing hand pose');const t=insertion*insertion*(3-2*insertion);return [365-340*t,referenceY,75] as const;}
