import {useFrame} from '@react-three/fiber';
import {memo,useMemo,useLayoutEffect,useRef,type ReactNode,type RefObject} from 'react';
import type {RadarBenchMotion} from '../data/radar-assembly';
import {CatmullRomCurve3,Group,Mesh,Quaternion,Vector3,type TubeGeometry} from 'three';
import {radarPowerJumpers,radarPowerJumperPose,type RadarPowerWithdrawal} from '../data/radar-power-jumpers';
import type {RadarHarnessPoint as P} from '../data/radar-harness';
import {rewriteCubeSatTube as rewriteTube} from './cubesat-tube-motion';
function curve(i:number,a=0,b=0){return new CatmullRomCurve3(radarPowerJumperPose(i,a,b).points.map(p=>new Vector3(...p)),false,'centripetal');}

/** Five removable project-specific connections. Local +Y points out of each real socket. */
function RadarPowerJumpers({selected,select,withdrawals,motion}:{selected:string;select:(id:string)=>void;withdrawals?:readonly RadarPowerWithdrawal[];motion?:RefObject<RadarBenchMotion>}){
 const root=useRef<Group>(null),last=useRef<(RadarPowerWithdrawal|undefined)[]>([]),initial=useMemo(()=>radarPowerJumpers.map((_,i)=>curve(i)),[]);
 const orientations=useMemo(()=>radarPowerJumpers.map(j=>({a:new Quaternion().setFromUnitVectors(new Vector3(0,1,0),new Vector3(...j.a.out)),b:new Quaternion().setFromUnitVectors(new Vector3(0,1,0),new Vector3(...j.b.out))})),[]);
 function update(values=withdrawals){const r=root.current;if(!r)return;for(let i=0;i<5;i++){
  const j=radarPowerJumpers[i],w=values?.[i]??{a:0,b:0};
  if(last.current[i]?.a===w.a&&last.current[i]?.b===w.b)continue;
  const pose=radarPowerJumperPose(i,w.a,w.b),wire=r.getObjectByName(j.id+'-tube') as Mesh<TubeGeometry>;
  rewriteTube(wire.geometry,curve(i,w.a,w.b));r.getObjectByName(j.id+'-a-body')!.position.set(...pose.a);r.getObjectByName(j.id+'-b-body')!.position.set(...pose.b);
  last.current[i]={a:w.a,b:w.b};
 }}
 useLayoutEffect(()=>{if(!motion)update();},[withdrawals,motion]);
 useFrame(()=>{if(motion)update(motion.current.power);});
 const tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const material=(id:string,c:string,metal=0)=><meshStandardMaterial color={selected===id?'#b78be8':c} metalness={metal} roughness={metal?.3:.6}/>;
 const box=(id:string,at:P,size:P,c:string,metal=0)=><mesh position={at} castShadow><boxGeometry args={size}/>{material(id,c,metal)}</mesh>;
 const cylinder=(id:string,y:number,r:number,h:number,c:string,metal=0)=><mesh position={[0,y,0]} castShadow><cylinderGeometry args={[r,r,h,32]}/>{material(id,c,metal)}</mesh>;
 return <group ref={root} name="radar-power-jumpers">{radarPowerJumpers.map((j,i)=><group key={j.id}>
  {tag(j.id,<mesh name={j.id+'-tube'} castShadow><tubeGeometry args={[initial[i],240,.65,10,false]}/>{material(j.id,j.color)}</mesh>)}
  {(['a','b'] as const).map(end=>{const id=j.id+'-'+end;return tag(id,<group name={id+'-body'} quaternion={orientations[i][end]}>
   {j[end].kind==='banana'?<>
    {cylinder(id,-.5,1.8,9,'#b8c1cb',.85)}{cylinder(id,5,3.2,6,j.color)}
    <mesh position={[0,9.5,0]} castShadow><cylinderGeometry args={[1,3.2,3,32]}/>{material(id,j.color)}</mesh>
    {[3.2,4.6,6].map(y=><mesh key={y} position={[0,y,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[3.2,.12,6,32]}/>{material(id,j.color)}</mesh>)}
   </>:<>{box(id,[0,5,0],[2.4,6,2.4],'#263241')}{box(id,[0,1,0],[.64,6,.64],'#c5b48b',.8)}</>}
  </group>);})}
 </group>)}</group>;
}
export default memo(RadarPowerJumpers);
