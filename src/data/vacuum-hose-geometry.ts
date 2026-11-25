import {CubicBezierCurve3,CurvePath,LineCurve3,Vector3} from 'three';
import {vacuumLayout as d,vacuumFilterSpec,type VacuumPoint} from './vacuum-workshop-layout';
export const vacuumTray={top:2,sites:[[-140,130],[-125,130],[-110,130],[-140,150],[-125,150],[-110,150]] as const};
export const vacuumPickupLength=700;
const vec=(p:VacuumPoint)=>new Vector3(...p);
export function vacuumNozzleAt(index:number,gap=d.nozzleGap):VacuumPoint{if(!Number.isInteger(index)||index<0||index>=6)throw Error('Select one of the six paper sites.');if(!Number.isFinite(gap)||gap<.5||gap>15)throw Error('Nozzle gap must be between 0.5 and 15 mm.');const[x,z]=vacuumTray.sites[index];return [x,vacuumTray.top+d.paper.thickness+gap,z];}
function pickup(nozzle:VacuumPoint,bulge:number){
 const path=new CurvePath<Vector3>(),front=145+bulge,line=(a:VacuumPoint,b:VacuumPoint)=>path.add(new LineCurve3(vec(a),vec(b))),bezier=(a:VacuumPoint,b:VacuumPoint,c:VacuumPoint,e:VacuumPoint)=>{const s=new CubicBezierCurve3(vec(a),vec(b),vec(c),vec(e));s.arcLengthDivisions=160;path.add(s);},[x,y,z]=nozzle;
 line([x,y,z],[x,38,z]);bezier([x,38,z],[x,60,z],[-110,60,front],[-90,60,front]);line([-90,60,front],[90,60,front]);bezier([90,60,front],[140,60,front],[155,51,100],[155,51,60]);bezier([155,51,60],[155,51,20],[145,51,0],[110,51,0]);line([110,51,0],[72,51,0]);bezier([72,51,0],[62,51,0],[55,43,0],[45,43,0]);path.arcLengthDivisions=600;return path;
}
/** The real hose flexes through the outer slack loop while retaining its length. The section through the grommet stays exactly straight. */
export function vacuumPickupCurve(nozzle:VacuumPoint){
 if(nozzle.some(v=>!Number.isFinite(v))||nozzle[0]<-150||nozzle[0]>-100||nozzle[1]<2.5||nozzle[1]>18||nozzle[2]<120||nozzle[2]>160)throw Error('Nozzle pose is outside the authored tray envelope.');
 let lo=0,hi=140;if(pickup(nozzle,lo).getLength()>vacuumPickupLength||pickup(nozzle,hi).getLength()<vacuumPickupLength)throw Error('Hose slack cannot reach this nozzle pose.');for(let i=0;i<25;i++){const mid=(lo+hi)/2;if(pickup(nozzle,mid).getLength()<vacuumPickupLength)lo=mid;else hi=mid;}return pickup(nozzle,(lo+hi)/2);
}
export function vacuumOutletCurve(){const path=new CurvePath<Vector3>();path.add(new LineCurve3(vec([75,79,0]),vec([110,79,0])));const turn=new CubicBezierCurve3(vec([110,79,0]),vec([145,79,0]),vec([140,60,-75]),vec([155,60,-75]));turn.arcLengthDivisions=200;path.add(turn);path.add(new LineCurve3(vec([155,60,-75]),vec([185,60,-75])));path.arcLengthDivisions=400;return path;}
export function vacuumHosePoint(curve:CurvePath<Vector3>,distance:number){return curve.getPointAt(Math.max(0,Math.min(1,distance/curve.getLength())));}
export function vacuumFilterRadius(x:number){const profile=[[61.5,0],[62,2],[63.5,5.5],[66,7.5],[70,8],[74,7.5],[77,5.6],[81,5.35]];if(x<=profile[0][0])return profile[0][1];for(let i=1;i<profile.length;i++){if(x<=profile[i][0]){const[a,r]=profile[i-1],[b,s]=profile[i];return r+(s-r)*(x-a)/(b-a);}}return profile.at(-1)![1];}
export const vacuumFilter=vacuumFilterSpec;
/** The short hose end opens slightly over the authored 6.5 mm barb crests; wall thickness is retained. */
export function vacuumHoseRadiiAt(curve:CurvePath<Vector3>,u:number,pumpEnd=false){const remaining=(1-u)*curve.getLength(),f=pumpEnd?Math.max(0,Math.min(1,(15-remaining)/5)):0,expansion=.25*f;return {inner:d.hose.innerR+expansion,outer:d.hose.outerR+expansion};}
