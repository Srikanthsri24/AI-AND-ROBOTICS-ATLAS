import type {ThreeEvent} from '@react-three/fiber';
import {memo,useMemo,type ReactNode} from 'react';
import {CatmullRomCurve3,Path,Shape,Vector3} from 'three';
import {streetLampTail} from '../data/street-system-sockets';
import {streetSystemLayout,streetSystemBranches,type StreetPoint} from '../data/street-system-layout';

type Props={selected:string;choose:(id:string)=>void;lamps:readonly(boolean|null)[];stage:number;cutaway:boolean};
/** Millimetre-scale street furniture. Channels and screw bores are actual openings. */
function StreetSystemLampParts({selected,choose,lamps,stage,cutaway}:Props){
 const shapes=useMemo(()=>{
  const foot=new Shape();foot.moveTo(-12,-10);foot.lineTo(12,-10);foot.lineTo(12,10);foot.lineTo(-12,10);foot.closePath();
  for(const x of [-8,8])for(const y of [-6,6]){const h=new Path();h.absarc(x,y,1.2,0,Math.PI*2,true);foot.holes.push(h);}
  const centre=new Path();centre.absarc(0,0,3,0,Math.PI*2,true);foot.holes.push(centre);
  const angle=Math.asin(1.3/4),notches=[0,Math.PI].map(offset=>{const s=new Shape(),a=angle+offset,b=Math.PI-angle+offset;s.absarc(0,0,4,a,b,false);s.lineTo(3*Math.cos(b),3*Math.sin(b));s.absarc(0,0,3,b,a,true);s.closePath();return s;});
  const half=(front:boolean)=>{const s=new Shape(),a=front?Math.PI:0,b=a+Math.PI;s.absarc(0,0,4,a,b,false);s.lineTo(3*Math.cos(b),3*Math.sin(b));s.absarc(0,0,3,b,a,true);s.closePath();return s;};
  return {foot,notches,back:half(false),front:half(true)};
 },[]);
 const tint=(id:string,color:string)=>selected===id?'#ad80dc':color;
 const owner=(id:string,node:ReactNode)=><group key={id} name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 const box=(id:string,p:StreetPoint,size:StreetPoint,color:string,metal=0)=><mesh key={id+p.join(",")} position={p} castShadow receiveShadow><boxGeometry args={[...size]}/><meshStandardMaterial color={tint(id,color)} metalness={metal} roughness={metal?.33:.7}/></mesh>;
 const wire=(id:string,points:readonly StreetPoint[],color:string)=><mesh castShadow><tubeGeometry args={[new CatmullRomCurve3(points.map(p=>new Vector3(...p))),48,.45,10,false]}/><meshStandardMaterial color={tint(id,color)} roughness={.5}/></mesh>;
 return <group name="street-system-furniture">
 {owner('street-base',<>{box('street-base',[0,4,0],[380,8,240],'#b59670')}{[-105,-35,35,105].map(z=>box('street-base',[0,8.03,z],[376,.06,.4],'#9b805d'))}</>)}
 {owner('street-road',<>{box('street-road',[0,8.7,-5],[355,1.4,56],'#4e5761')}{Array.from({length:10},(_,n)=>box('street-road',[-157+n*35,9.43,-5],[17,.05,1.3],'#e8dfbc'))}{[-1,1].map(side=>box('street-road',[0,10,side<0?-35:26],[355,4,22],'#b8b6ad'))}</>)}
 {stage>=1&&streetSystemBranches.map((branch,index)=>{
  const x=streetSystemLayout.lampXs[index],z=streetSystemLayout.lampZ,prefix=branch.id,on=lamps[index]===true;
  return <group key={prefix} name={prefix}>
   {owner(prefix+'-foot',<mesh position={[x,12,z]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[shapes.foot,{depth:2,bevelEnabled:false,curveSegments:32}]}/><meshStandardMaterial color={tint(prefix+'-foot','#777f86')} metalness={.65} roughness={.42}/></mesh>)}
   {owner(prefix+'-post',<><mesh position={[x,22,z]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[shapes.back,{depth:74,bevelEnabled:false,curveSegments:48}]}/><meshStandardMaterial color={tint(prefix+'-post','#7e8992')} metalness={.7} roughness={.36}/></mesh><mesh position={[x,14,z]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[shapes.notches[0],{depth:8,bevelEnabled:false,curveSegments:48}]}/><meshStandardMaterial color={tint(prefix+'-post','#7e8992')} metalness={.7} roughness={.36}/></mesh></>)}
   {owner(prefix+'-post-cover',<group visible={!cutaway}><mesh position={[x,22,z]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[shapes.front,{depth:74,bevelEnabled:false,curveSegments:48}]}/><meshStandardMaterial color={tint(prefix+'-post-cover','#7e8992')} metalness={.7} roughness={.36}/></mesh><mesh position={[x,14,z]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[shapes.notches[1],{depth:8,bevelEnabled:false,curveSegments:48}]}/><meshStandardMaterial color={tint(prefix+'-post-cover','#7e8992')} metalness={.7} roughness={.36}/></mesh></group>)}
   {owner(prefix+'-hood',<>{[-1,1].map(side=>box(prefix+'-hood',[x+side*8.5,100,-24],[1,6,32],'#5d6975',.55))}{box(prefix+'-hood',[x,100,-39.5],[16,6,1],'#5d6975',.55)}</>)}
   {owner(prefix+'-hood-front',box(prefix+'-hood-front',[x,100,-8.5],[16,6,1],'#5d6975',.55))}
   {owner(prefix+'-hood-roof',<>{box(prefix+'-hood-roof',[x,103,-24],[18,2,32],'#5d6975',.55)}{box(prefix+'-hood-roof',[x,101.8,-20],[15,.2,21],'#dce0dd',.8)}</>)}
   {stage>=2&&<>
    {owner(prefix+'-lens',<><mesh position={[x,98,-12]}><cylinderGeometry args={[2.5,2.5,3,32]}/><meshPhysicalMaterial color={selected===prefix+'-lens'?'#b78be8':'#e8e5d2'} emissive="#ffe7b2" emissiveIntensity={on?2.8:0} roughness={.2} clearcoat={1} transparent opacity={.85}/></mesh><mesh position={[x,96.5,-12]} rotation={[Math.PI,0,0]}><sphereGeometry args={[2.5,32,16,0,Math.PI*2,0,Math.PI/2]}/><meshPhysicalMaterial color={selected===prefix+'-lens'?'#b78be8':'#e8e5d2'} emissive="#ffe7b2" emissiveIntensity={on?2.8:0} roughness={.2} clearcoat={1}/></mesh></>)}
    {owner(prefix+'-internal-positive',<>{wire(prefix+'-internal-positive',streetLampTail(index,true),'#b84a5e')}{box(prefix+'-internal-positive',[x-1.27,100.25,-12],[.5,1.5,.5],'#b6bec8',.8)}</>)}
    {owner(prefix+'-internal-return',<>{wire(prefix+'-internal-return',streetLampTail(index,false),'#33465c')}{box(prefix+'-internal-return',[x+1.27,100.25,-12],[.5,1.5,.5],'#b6bec8',.8)}</>)}
    <pointLight position={[x,92,-12]} color="#ffe1a0" intensity={on?.25:0} distance={1.6} decay={1.8}/>
    {on&&<mesh name={prefix+'-light-pool'} position={[x,9.46,-12]} rotation={[-Math.PI/2,0,0]} scale={[1,.65,1]}><circleGeometry args={[24,48]}/><meshBasicMaterial color="#ffe5a5" transparent opacity={.28} depthWrite={false}/></mesh>}
   </>}
  </group>;
 })}
 </group>;
}
export default memo(StreetSystemLampParts);
