import { Curve, Vector3 } from 'three';
import { pickJawCableRoutes } from './pick-rover-jaw-cable';
const stations=1000;
const smooth=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
const weights=Array.from({length:stations+1},(_,n)=>{const t=n/stations;return{lift:1-smooth((t-.03)/.27),slack:t<=.04||t>=.65?0:Math.sin(Math.PI*(t-.04)/.61)**2};});
let cache:{angle:number;routes:{wire:ReturnType<typeof pickJawCableRoutes>['routes'][number]['wire'];points:Vector3[];length:number}[]}|undefined;
function baseline(angle:number){if(cache?.angle===angle)return cache.routes;const routes=pickJawCableRoutes(angle).routes.map(({wire,curve})=>{const points=curve.getPoints(stations);return{wire,points,length:points.slice(1).reduce((s,p,n)=>s+p.distanceTo(points[n]),0)};});cache={angle,routes};return routes;}
class ServiceConductor extends Curve<Vector3>{constructor(readonly points:Vector3[],readonly lift:number,readonly slack:number){super();this.arcLengthDivisions=stations;}getPoint(t:number,target=new Vector3()){const f=Math.max(0,Math.min(stations,t*stations)),n=Math.min(stations-1,Math.floor(f)),a=f-n;target.copy(this.points[n]).lerp(this.points[n+1],a);target.y+=this.lift*(weights[n].lift+(weights[n+1].lift-weights[n].lift)*a);target.x+=this.slack*(weights[n].slack+(weights[n+1].slack-weights[n].slack)*a);return target;}}
/** Temporary vertical withdrawal of the complete jaw-servo frame. CH1 stays
 * seated; each physical conductor pays out its own service bow without stretch.
 * This is a service pose, not normal powered jaw/lift motion. */
export function pickJawFrameService(angle:number,lift:number){
 if(!Number.isFinite(lift)||lift<0||lift>24)throw new RangeError('Jaw frame service lift must be 0–24 mm');
 return baseline(angle).map(route=>{const length=(slack:number)=>{let sum=0;for(let n=1;n<=stations;n++){const p=route.points[n],q=route.points[n-1];sum+=Math.hypot(p.x-q.x+slack*(weights[n].slack-weights[n-1].slack),p.y-q.y+lift*(weights[n].lift-weights[n-1].lift),p.z-q.z);}return sum;};let lo=-30,hi=30;if(length(lo)>route.length||length(hi)<route.length)throw new RangeError('Jaw frame cable service slack exhausted');for(let n=0;n<30;n++){const mid=(lo+hi)/2;if(length(mid)>route.length)hi=mid;else lo=mid;}return{wire:route.wire,curve:new ServiceConductor(route.points,lift,lift===0?0:(lo+hi)/2),length:route.length};});
}
