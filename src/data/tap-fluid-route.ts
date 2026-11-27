import{tapIntakePath,tapOutletPath,tapPlumbing,type TapPoint}from'./tap-plumbing';
import{tapCableSegments}from'./tap-level-cable';
import{tapTubePoint,tapTubeLeadPoint,tapPumpDimensions}from'./tap-peristaltic-geometry';
export type TapFluidSection='intake'|'pump'|'outlet';
export type TapFluidStation={point:TapPoint;distanceMm:number;section:TapFluidSection};
const average=(a:TapPoint,b:TapPoint):TapPoint=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
function build(){const stations:TapFluidStation[]=[];let length=0;const add=(p:TapPoint,section:TapFluidSection)=>{const last=stations.at(-1);if(last){const d=Math.hypot(...p.map((v,i)=>v-last.point[i]));if(d<1e-8)return;length+=d;}stations.push({point:p,distanceMm:length,section});},rounded=(points:readonly TapPoint[],section:TapFluidSection)=>{for(const s of tapCableSegments(points,8)){add(s.a,section);for(let i=1;i<=(s.control?32:1);i++){const t=s.control?i/32:1,u=1-t,p=s.control?s.a.map((v,n)=>u*u*v+2*u*t*s.control![n]+t*t*s.b[n]):s.b;add(p as TapPoint,section);}}},pump=(p:TapPoint)=>add(p.map((v,i)=>v+tapPlumbing.pump[i])as unknown as TapPoint,'pump');
 rounded([...tapIntakePath].reverse(),'intake');for(let i=48;i>=0;i--)pump(average(tapTubeLeadPoint(-1,i/48,0,0),tapTubeLeadPoint(-1,i/48,Math.PI,0)));for(let i=0;i<=144;i++){const a=-3*Math.PI/4+i/144*3*Math.PI/2;pump(average(tapTubePoint(a,0,0),tapTubePoint(a,Math.PI,0)));}for(let i=0;i<=48;i++)pump(average(tapTubeLeadPoint(1,i/48,0,0),tapTubeLeadPoint(1,i/48,Math.PI,0)));rounded(tapOutletPath,'outlet');return stations;}
/** Nominal phase-zero centreline and 3.5 mm bore; not a measured pump displacement. */
export const tapFluidRoute=build();
export const tapFluidRouteLength=tapFluidRoute.at(-1)!.distanceMm;
export const tapFluidBoreArea=Math.PI*(tapPumpDimensions.tubeInnerDiameter/2)**2;
export const tapFluidPipeCapacityMl=tapFluidRouteLength*tapFluidBoreArea/1000;
export function tapFluidPointAt(distanceMm:number):TapPoint{if(!Number.isFinite(distanceMm)||distanceMm<0||distanceMm>tapFluidRouteLength)throw new RangeError('Invalid tap liquid station');let low=0,high=tapFluidRoute.length-1;while(high-low>1){const m=(low+high)>>1;if(tapFluidRoute[m].distanceMm<distanceMm)low=m;else high=m;}const a=tapFluidRoute[low],b=tapFluidRoute[high],t=(distanceMm-a.distanceMm)/(b.distanceMm-a.distanceMm);return a.point.map((v,i)=>v+(b.point[i]-v)*t)as unknown as TapPoint;}
