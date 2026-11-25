import {Quaternion,Vector3,type CurvePath} from 'three';
import {vacuumBottleInner,vacuumLayout as d,type VacuumPoint} from './vacuum-workshop-layout';
import {vacuumNozzleAt,vacuumPickupCurve,vacuumTray} from './vacuum-hose-geometry';
import {vacuumAirAdvance,vacuumAirInitial,type VacuumAir,type VacuumCondition} from './vacuum-pneumatics';
/** Qualitative, independently authored light-paper / air model; these are not measured pickup ratings. Positions mm, velocities mm/s. */
export const vacuumPaperModel={airDensity:1.2,dragCoefficient:1.1,gravity:9806.65,contactAdhesion:.15,step:.001};
export type VacuumPaper={id:number;phase:'tray'|'tube'|'chamber';position:VacuumPoint;velocity:VacuumPoint;normal:VacuumPoint;distance:number;tubeSpeed:number;enteredAt:number|null;resting?:boolean};
export const vacuumPapersInitial=():VacuumPaper[]=>vacuumTray.sites.map(([x,z],id)=>({id,phase:'tray',position:[x,vacuumTray.top+d.paper.thickness/2,z],velocity:[0,0,0],normal:[0,1,0],distance:0,tubeSpeed:0,enteredAt:null}));
const up=new Vector3(0,1,0),vec=(p:VacuumPoint)=>new Vector3(...p),tuple=(v:Vector3)=>v.toArray() as VacuumPoint;
const mass=d.paper.side**2*d.paper.thickness*1e-9*d.paper.density;
const dragK=.5*vacuumPaperModel.airDensity*vacuumPaperModel.dragCoefficient*(d.paper.side*1e-3)**2/mass/1000;
/** Semi-implicit quadratic drag. Its rational relaxation cannot overshoot the local air velocity, even at the nozzle. */
function drag(velocity:Vector3,air:Vector3,dt:number){const relative=air.clone().sub(velocity),f=dragK*relative.length()*dt;return velocity.addScaledVector(relative,f/(1+f));}
export function vacuumCavityRadius(x:number){if(x<vacuumBottleInner[0][0]||x>d.cap.plateBack)return -1;if(x>86)return 35;for(let i=1;i<vacuumBottleInner.length;i++){const[a,r]=vacuumBottleInner[i-1],[b,s]=vacuumBottleInner[i];if(x<=b)return r+(s-r)*(x-a)/(b-a);}return 35.5;}
export function vacuumPaperCorners(p:Pick<VacuumPaper,'position'|'normal'>){const q=new Quaternion().setFromUnitVectors(up,vec(p.normal).normalize()),corners:Vector3[]=[];for(const x of [-1,1])for(const y of [-1,1])for(const z of [-1,1])corners.push(new Vector3(x*d.paper.side/2,y*d.paper.thickness/2,z*d.paper.side/2).applyQuaternion(q).add(vec(p.position)));return corners;}
export function vacuumPaperInside(p:Pick<VacuumPaper,'position'|'normal'>){return vacuumPaperCorners(p).every(v=>{const r=vacuumCavityRadius(v.x);return r>=0&&Math.hypot(v.y-d.axisY,v.z)<=r+1e-8;});}
function settle(p:VacuumPaper,dt:number){
 if(p.resting)return p;
 const old=vec(p.position),velocity=drag(vec(p.velocity),new Vector3(),dt);velocity.y-=vacuumPaperModel.gravity*dt;
 // Level the lightweight sheet during its fall; collision uses precisely this rendered orientation.
 const normal=vec(p.normal).lerp(up,1-Math.exp(-dt/ .012)).normalize(),candidate={position:tuple(old.clone().addScaledVector(velocity,dt)),normal:tuple(normal)};
 if(vacuumPaperInside(candidate))return {...p,...candidate,velocity:tuple(velocity)};
 // Preserve the last non-penetrating orientation if levelling would cross the wall.
 const safeNormal=vacuumPaperInside({position:p.position,normal:candidate.normal})?candidate.normal:p.normal;
 let lo=0,hi=1;for(let i=0;i<22;i++){const t=(lo+hi)/2;if(vacuumPaperInside({position:tuple(old.clone().lerp(vec(candidate.position),t)),normal:safeNormal}))lo=t;else hi=t;}
 const position=old.clone().lerp(vec(candidate.position),lo),r=vacuumCavityRadius(position.x),epsilon=.01,slope=(vacuumCavityRadius(position.x+epsilon)-vacuumCavityRadius(position.x-epsilon))/(2*epsilon),out=new Vector3(-r*slope,position.y-d.axisY,position.z).normalize();
 const impact=velocity.dot(out);if(impact>0)velocity.addScaledVector(out,-1.08*impact);velocity.multiplyScalar(.72);if(velocity.length()<8)velocity.set(0,0,0);
 return {...p,position:tuple(position),normal:safeNormal,velocity:tuple(velocity),resting:velocity.lengthSq()===0&&out.y<-.9&&safeNormal[1]>.99};
}
export function vacuumPaperStep(p:VacuumPaper,flowMl:number,curve:CurvePath<Vector3>,dt:number,clock:number):VacuumPaper{
 if(!Number.isFinite(flowMl)||!Number.isFinite(dt)||dt<=0||dt>.005)throw Error('Paper steps require finite flow and a duration up to 5 ms.');
 const q=(flowMl>1e-8?flowMl:0)*1000,length=curve.getLength();
 if(p.phase==='chamber')return settle(p,dt);
 if(p.phase==='tube'){
  const tangent=curve.getTangentAt(Math.min(1,p.distance/length)),airSpeed=q/(Math.PI*d.hose.innerR**2),delta=airSpeed-p.tubeSpeed,f=dragK*Math.abs(delta)*dt,speed=p.tubeSpeed+delta*f/(1+f)-vacuumPaperModel.gravity*tangent.y*dt,distance=p.distance+speed*dt;
  if(distance<0){const mouth=curve.getPointAt(0);return {...p,phase:'tray',position:tuple(mouth),velocity:tuple(tangent.multiplyScalar(speed)),normal:[0,1,0],distance:0,tubeSpeed:0};}
  if(distance>=length){const position=curve.getPointAt(1),normal=curve.getTangentAt(1);return {...p,phase:'chamber',position:tuple(position),velocity:tuple(normal.clone().multiplyScalar(speed)),normal:tuple(normal),distance:length,tubeSpeed:0,enteredAt:clock};}
  return {...p,distance,tubeSpeed:speed,position:tuple(curve.getPointAt(distance/length)),normal:tuple(tangent)};
 }
 const position=vec(p.position),mouth=curve.getPointAt(0),toward=mouth.clone().sub(position),distance=toward.length(),area=Math.PI*d.hose.innerR**2+2*Math.PI*distance**2,air=toward.normalize().multiplyScalar(q/area),velocity=drag(vec(p.velocity),air,dt),floor=vacuumTray.top+d.paper.thickness/2;
 velocity.y-=vacuumPaperModel.gravity*dt;
 if(position.y<=floor+1e-7&&velocity.y<vacuumPaperModel.gravity*vacuumPaperModel.contactAdhesion*dt){velocity.y=0;velocity.x*=Math.exp(-dt*80);velocity.z*=Math.exp(-dt*80);}
 position.addScaledVector(velocity,dt);if(position.y<floor){position.y=floor;velocity.y=Math.max(0,velocity.y);}
 const halfDiagonal=d.paper.side/Math.sqrt(2),radial=Math.hypot(position.x-mouth.x,position.z-mouth.z);
 if(position.y>=mouth.y&&radial+halfDiagonal<d.hose.innerR){const distance=Math.max(0,position.y-mouth.y);return {...p,phase:'tube',position:tuple(curve.getPointAt(distance/length)),velocity:[0,0,0],normal:[0,1,0],distance,tubeSpeed:Math.max(0,velocity.y)};}
 return {...p,position:tuple(position),velocity:tuple(velocity)};
}
/** Separating-axis test of the same eight-corner oriented boxes rendered for each sheet. */
export function vacuumPaperSeparation(a:VacuumPaper,b:VacuumPaper):Vector3|null{
 const axes=(p:VacuumPaper)=>{const q=new Quaternion().setFromUnitVectors(up,vec(p.normal).normalize());return [new Vector3(1,0,0),up.clone(),new Vector3(0,0,1)].map(v=>v.applyQuaternion(q));},aa=axes(a),bb=axes(b),half=[d.paper.side/2,d.paper.thickness/2,d.paper.side/2],delta=vec(a.position).sub(vec(b.position)),candidates=[...aa,...bb];
 for(const x of aa)for(const y of bb){const cross=x.clone().cross(y);if(cross.lengthSq()>1e-14)candidates.push(cross.normalize());}
 let smallest=Infinity,answer:Vector3|null=null;
 for(const axis of candidates){const radius=(basis:Vector3[])=>basis.reduce((v,e,i)=>v+half[i]*Math.abs(e.dot(axis)),0),overlap=radius(aa)+radius(bb)-Math.abs(delta.dot(axis));if(overlap<=1e-9)return null;if(overlap<smallest){smallest=overlap;const side=delta.dot(axis);answer=axis.clone().multiplyScalar(side< -1e-10?-1:side>1e-10?1:axis.y<0?-1:1);}}
 return answer?.multiplyScalar(smallest+1e-8)??null;
}
/** Resolve resting-sheet contacts, including lateral arrival; six collected sheets cannot occupy one coincident mesh. */
export function vacuumPaperContacts(_previous:VacuumPaper[],next:VacuumPaper[]){const resolved:VacuumPaper[]=[];const ordered=[...next].sort((a,b)=>(a.enteredAt??Infinity)-(b.enteredAt??Infinity)||a.id-b.id);for(const p of ordered){
 if(p.phase!=='chamber'){resolved.push(p);continue;}let supported=p;
 for(let pass=0;pass<3;pass++)for(const other of resolved){if(other.id===p.id||other.phase!=='chamber'||!other.resting&&vec(other.velocity).length()>8)continue;
 const correction=vacuumPaperSeparation(supported,other);if(!correction)continue;
 const candidate={...supported,position:tuple(vec(supported.position).add(correction))};if(!vacuumPaperInside(candidate))continue;
 const velocity=vec(supported.velocity),normal=correction.clone().normalize(),into=velocity.dot(normal);if(into<0)velocity.addScaledVector(normal,-into);velocity.multiplyScalar(.7);const resting=normal.y>.9&&velocity.length()<8;candidate.velocity=resting?[0,0,0]:tuple(velocity);candidate.resting=resting;supported=candidate;
 }resolved.push(supported);
 }return next.map(p=>resolved.find(a=>a.id===p.id)!);}
export type VacuumExperiment={air:VacuumAir;papers:VacuumPaper[];cycles:number;fullSqueeze:boolean};
export const vacuumExperimentInitial=():VacuumExperiment=>({air:vacuumAirInitial(),papers:vacuumPapersInitial(),cycles:0,fullSqueeze:false});
/** Cache one fixed nozzle path per pose; do not reconstruct its length-constrained loop at every physics step. */
export function vacuumExperimentAdvance(previous:VacuumExperiment,seconds:number,squeeze:boolean,condition:VacuumCondition,curve:CurvePath<Vector3>):VacuumExperiment{
 if(!Number.isFinite(seconds)||seconds<0)throw Error('Elapsed time must be finite and non-negative.');let s=previous;const end=s.air.clock+seconds;
 while(s.air.clock<end-1e-12){const dt=Math.min(.005,end-s.air.clock),air=vacuumAirAdvance(s.air,dt,squeeze,condition);let papers=s.papers;for(let elapsed=0;elapsed<dt-1e-12;elapsed+=vacuumPaperModel.step){const h=Math.min(vacuumPaperModel.step,dt-elapsed);papers=vacuumPaperContacts(papers,papers.map(p=>vacuumPaperStep(p,air.flows.nozzle,curve,h,air.clock-dt+elapsed+h)));}
 const full=s.fullSqueeze||air.compression===1,completed=full&&!squeeze&&air.compression===0;s={air,papers,cycles:s.cycles+(completed?1:0),fullSqueeze:completed?false:full};
 }return s;
}
export const vacuumExperimentCurve=(site=0,gap=d.nozzleGap)=>vacuumPickupCurve(vacuumNozzleAt(site,gap));
