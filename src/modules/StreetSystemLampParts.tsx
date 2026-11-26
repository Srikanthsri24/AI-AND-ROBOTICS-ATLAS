import type {ThreeEvent} from '@react-three/fiber';
import {memo,useMemo,type ReactNode} from 'react';
import {CatmullRomCurve3,Path,Shape,Vector3} from 'three';
import {streetSystemLayout,streetSystemBranches,type StreetPoint} from '../data/street-system-layout';

type Props={selected:string;choose:(id:string)=>void;lamps:readonly(boolean|null)[];stage:number;cutaway:boolean};
/** Millimetre-scale street furniture. Channels and screw bores are actual openings. */
function StreetSystemLampParts({selected,choose,lamps,stage,cutaway}:Props){
 const shapes=useMemo(()=>{
  const post=new Shape();post.absarc(0,0,4,0,Math.PI*2,false);const bore=new Path();bore.absarc(0,0,3,0,Math.PI*2,true);post.holes.push(bore);
  const foot=new Shape();foot.moveTo(-12,-10);foot.lineTo(12,-10);foot.lineTo(12,10);foot.lineTo(-12,10);foot.closePath();
  for(const x of [-8,8])for(const y of [-6,6]){const h=new Path();h.absarc(x,y,1.2,0,Math.PI*2,true);foot.holes.push(h);}
  const centre=new Path();centre.absarc(0,0,3,0,Math.PI*2,true);foot.holes.push(centre);
  const washer=new Shape();washer.absarc(0,0,2.4,0,Math.PI*2,false);const hole=new Path();hole.absarc(0,0,1.1,0,Math.PI*2,true);washer.holes.push(hole);
  return {post,foot,washer};
 },[]);
 const tint=(id:string,color:string)=>selected===id?'#ad80dc':color;
 const owner=(id:string,node:ReactNode)=><group key={id} name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 const box=(id:string,p:StreetPoint,size:StreetPoint,color:string,metal=0)=><mesh key={id+p.join(",")} position={p} castShadow receiveShadow><boxGeometry args={[...size]}/><meshStandardMaterial color={tint(id,color)} metalness={metal} roughness={metal?.33:.7}/></mesh>;
 const wire=(id:string,points:StreetPoint[],color:string)=><mesh castShadow><tubeGeometry args={[new CatmullRomCurve3(points.map(p=>new Vector3(...p))),48,.45,10,false]}/><meshStandardMaterial color={tint(id,color)} roughness={.5}/></mesh>;
 return <group name="street-system-furniture">
 {owner('street-base',<>{box('street-base',[0,4,0],[380,8,240],'#b59670')}{[-105,-35,35,105].map(z=>box('street-base',[0,8.03,z],[376,.06,.4],'#9b805d'))}</>)}
 {owner('street-road',<>{box('street-road',[0,8.7,-5],[355,1.4,56],'#4e5761')}{Array.from({length:10},(_,n)=>box('street-road',[-157+n*35,9.43,-5],[17,.05,1.3],'#e8dfbc'))}{[-1,1].map(side=>box('street-road',[0,10,side*31-5],[355,4,12],'#b8b6ad'))}</>)}
 {stage>=1&&streetSystemBranches.map((branch,index)=>{
  const x=streetSystemLayout.lampXs[index],z=streetSystemLayout.lampZ,prefix=branch.id,on=lamps[index]===true;
  return <group key={prefix} name={prefix}>
   {owner(prefix+'-foot',<mesh position={[x,12,z]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[shapes.foot,{depth:2,bevelEnabled:false,curveSegments:32}]}/><meshStandardMaterial color={tint(prefix+'-foot','#777f86')} metalness={.65} roughness={.42}/></mesh>)}
   {owner(prefix+'-post',cutaway?<>{[-1,1].map(side=>box(prefix+'-post',[x+side*3.5,55,z],[1,82,6],'#7e8992',.7))}{box(prefix+'-post',[x,55,z-3.5],[6,82,1],'#7e8992',.7)}</>:<mesh position={[x,14,z]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[shapes.post,{depth:82,bevelEnabled:false,curveSegments:48}]}/><meshStandardMaterial color={tint(prefix+'-post','#7e8992')} metalness={.7} roughness={.36}/></mesh>)}
   {owner(prefix+'-hood',<>{box(prefix+'-hood',[x,103,-24],[18,2,32],'#5d6975',.55)}{[-1,1].map(side=>box(prefix+'-hood',[x+side*8.5,100,-24],[1,6,32],'#5d6975',.55))}{box(prefix+'-hood',[x,100,-39.5],[16,6,1],'#5d6975',.55)}{box(prefix+'-hood',[x,100,-8.5],[16,6,1],'#5d6975',.55)}{box(prefix+'-hood',[x,101.8,-20],[15,.2,21],'#dce0dd',.8)}</>)}
   {owner(prefix+'-bolts',<>{[-8,8].flatMap(dx=>[-6,6].map(dz=><group key={dx+','+dz}><mesh position={[x+dx,10,z+dz]}><cylinderGeometry args={[1,1,8,16]}/><meshStandardMaterial color={tint(prefix+'-bolts','#bac2c8')} metalness={.8}/></mesh><mesh position={[x+dx,15,z+dz]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shapes.washer,{depth:.4,bevelEnabled:false}]}/><meshStandardMaterial color={tint(prefix+'-bolts','#c0c7ce')} metalness={.8}/></mesh>{box(prefix+'-bolts',[x+dx,15.8,z+dz],[3.4,1.1,3.4],'#a9b1ba',.8)}{box(prefix+'-bolts',[x+dx,16.37,z+dz],[2.5,.05,.4],'#394454')}</group>))}</>)}
   {stage>=2&&<>
    {owner(prefix+'-lens',<><mesh position={[x,98,-12]}><cylinderGeometry args={[2.5,2.5,3,32]}/><meshPhysicalMaterial color={selected===prefix+'-lens'?'#b78be8':'#e8e5d2'} emissive="#ffe7b2" emissiveIntensity={on?2.8:0} roughness={.2} clearcoat={1} transparent opacity={.85}/></mesh><mesh position={[x,96.5,-12]} rotation={[Math.PI,0,0]}><sphereGeometry args={[2.5,32,16,0,Math.PI*2,0,Math.PI/2]}/><meshPhysicalMaterial color={selected===prefix+'-lens'?'#b78be8':'#e8e5d2'} emissive="#ffe7b2" emissiveIntensity={on?2.8:0} roughness={.2} clearcoat={1}/></mesh></>)}
    {owner(prefix+'-internal-positive',wire(prefix+'-internal-positive',[branch.anode,[x-1.27,100,-17],[x-1.27,100,z],[x-1.27,18,z],branch.positiveTail],'#b84a5e'))}
    {owner(prefix+'-internal-return',wire(prefix+'-internal-return',[branch.cathode,[x+1.27,99,-17],[x+1.27,99,z],[x+1.27,18,z],branch.returnTail],'#33465c'))}
    <pointLight position={[x,92,-12]} color="#ffe1a0" intensity={on?.25:0} distance={1.6} decay={1.8}/>
    {on&&<mesh name={prefix+'-light-pool'} position={[x,9.46,-12]} rotation={[-Math.PI/2,0,0]} scale={[1,.65,1]}><circleGeometry args={[24,48]}/><meshBasicMaterial color="#ffe5a5" transparent opacity={.28} depthWrite={false}/></mesh>}
   </>}
  </group>;
 })}
 </group>;
}
export default memo(StreetSystemLampParts);
