import {memo,useMemo,useRef,useLayoutEffect,type ReactNode,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {CatmullRomCurve3,Group,Mesh,Quaternion,Vector3,type TubeGeometry} from 'three';
import {railwayControlJumpers,railwayControlJumperPose,type RailwayWithdrawal,type RailwayJumperEnd} from '../data/railway-control-jumpers';
import type {RailwayPoint as P} from '../data/railway-electrical-layout';
import RailwayFemaleSocketGeometry from './RailwayFemaleSocketGeometry';
import {rewriteCubeSatTube} from './cubesat-tube-motion';
type HarnessCable={id:string;color:string;radius:number;a:RailwayJumperEnd;b:RailwayJumperEnd};
type HarnessPose={a:P;b:P;points:readonly P[]};
type Controls={selected?:string;select?:(id:string)=>void;withdrawals?:readonly RailwayWithdrawal[];motion?:RefObject<readonly RailwayWithdrawal[]>};
export function RailwayJumperHarness({selected='',select=()=>{},withdrawals,motion,cables:jumpers,pose:poseFor,groupName}:{selected?:string;select?:(id:string)=>void;withdrawals?:readonly RailwayWithdrawal[];motion?:RefObject<readonly RailwayWithdrawal[]>;cables:readonly HarnessCable[];pose:(n:number,a?:number,b?:number)=>HarnessPose;groupName:string}){
 const curve=(pose:HarnessPose)=>new CatmullRomCurve3(pose.points.map(p=>new Vector3(...p)),false,'centripetal');
 const root=useRef<Group>(null),last=useRef<string[]>([]),initial=useMemo(()=>jumpers.map((_,n)=>curve(poseFor(n,0,0))),[jumpers,poseFor]),orientations=useMemo(()=>jumpers.map(j=>({a:new Quaternion().setFromUnitVectors(new Vector3(0,1,0),new Vector3(...j.a.out)),b:new Quaternion().setFromUnitVectors(new Vector3(0,1,0),new Vector3(...j.b.out))})),[jumpers]);
 function update(values=withdrawals){if(!root.current)return;for(let n=0;n<jumpers.length;n++){const w=values?.[n]??{a:0,b:0};const j=jumpers[n],pose=poseFor(n,w.a,w.b),key=[...pose.a,...pose.b,...pose.points.flat()].join('/');if(last.current[n]===key)continue;const tube=root.current.getObjectByName(j.id+'-tube') as Mesh<TubeGeometry>;rewriteCubeSatTube(tube.geometry,curve(pose));root.current.getObjectByName(j.id+'-a-body')!.position.set(...pose.a);root.current.getObjectByName(j.id+'-b-body')!.position.set(...pose.b);last.current[n]=key;}}
 useLayoutEffect(()=>{last.current=[];},[jumpers,poseFor]);
 useLayoutEffect(()=>{if(!motion)update();},[withdrawals,motion,jumpers,poseFor]);useFrame(()=>{if(motion)update(motion.current);});
 const mat=(id:string,c:string,metal=0)=><meshStandardMaterial color={selected===id?'#b78be8':c} metalness={metal} roughness={metal?.3:.58}/>;
 const tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const box=(id:string,p:P,s:P,c:string,metal=0)=><mesh position={[...p]} castShadow><boxGeometry args={[...s]}/>{mat(id,c,metal)}</mesh>;
 const cylinder=(id:string,y:number,r:number,h:number,c:string,metal=0)=><mesh position={[0,y,0]} castShadow><cylinderGeometry args={[r,r,h,40]}/>{mat(id,c,metal)}</mesh>;
 return <group ref={root} name={groupName}>{jumpers.map((j,n)=><group key={j.id}>
 {tag(j.id,<mesh name={j.id+'-tube'} castShadow><tubeGeometry args={[initial[n],200,j.radius,10,false]}/>{mat(j.id,j.color)}</mesh>)}
 {(['a','b'] as const).map(end=>{const id=j.id+'-'+end;return tag(id,<group name={id+'-body'} quaternion={orientations[n][end]}>
 {j[end].kind==='banana'?<>{cylinder(id,-3.5,1.8,9,'#bfc8d4',.85)}{cylinder(id,4,3.2,6,j.color)}<mesh position={[0,8.5,0]} castShadow><cylinderGeometry args={[.65,3.2,3,40]}/>{mat(id,j.color)}</mesh>{[2.2,3.7,5.2].map(y=><mesh key={y} position={[0,y,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[3.2,.12,8,40]}/>{mat(id,j.color)}</mesh>)}</>:j[end].kind==='female'?<RailwayFemaleSocketGeometry highlighted={selected===id}/>:<>
 {box(id,[0,3.2,0],[2.3,6,2.3],'#263141')}{box(id,[0,-1.5,0],[.64,6,.64],'#bfae78',.8)}{box(id,[0,3.85,0],[.55,4.7,.55],'#bfae78',.8)}<mesh position={[0,7.2,0]} castShadow><cylinderGeometry args={[.55,1.15,2,24]}/>{mat(id,'#263141')}</mesh>
 </>}
 </group>);})}
 </group>)}</group>;
}
function RailwayControlJumpers(props:Controls){return <RailwayJumperHarness {...props} cables={railwayControlJumpers} pose={railwayControlJumperPose} groupName="railway-control-jumpers"/>;}
export default memo(RailwayControlJumpers);
