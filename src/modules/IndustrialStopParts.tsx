import type {} from '@react-three/fiber';
import { useMemo,type ReactNode } from 'react';
import { Shape,Path } from 'three';
import { Text } from '@react-three/drei';
import { industrialStopAt as at,industrialStopLever as d,industrialStopPose } from '../data/industrial-controls';
import type { IndustrialPoint as P } from '../data/industrial-panel';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
export default function IndustrialStopParts({selected='',select=()=>{},stroke=0}:{selected?:string;select?:(id:string)=>void;stroke?:number}){
 const s=industrialStopPose(stroke),shapes=useMemo(()=>{const ring=(r:number,h:number)=>{const p=new Shape();p.absarc(0,0,r,0,Math.PI*2,false);const hole=new Path();hole.absarc(0,0,h,0,Math.PI*2,true);p.holes.push(hole);return p;};return{eye:ring(2.5,1.5),ear:ring(2,.8),wheel:ring(2.5,.8)};},[]);
 const c=(id:string,color:string)=>selected===id?'#b48bec':color,owner=(id:string,children:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{children}</group>;
 const box=(id:string,p:P,size:P,color:string)=><mesh key={id+p.join(',')} position={p} castShadow><boxGeometry args={size}/><meshStandardMaterial color={c(id,color)} roughness={.5}/></mesh>,cyl=(id:string,p:P,r:number,length:number,color:string,axis:'x'|'y'='y')=><mesh key={id+p.join(',')} position={p} rotation={axis==='x'?[0,0,Math.PI/2]:[0,0,0]} castShadow><cylinderGeometry args={[r,r,length,40]}/><meshStandardMaterial color={c(id,color)} metalness={.7} roughness={.3}/></mesh>,ring=(id:string,shape:Shape,p:P,length:number,color:string)=><mesh key={id+p.join(',')} position={p} rotation={[0,Math.PI/2,0]} castShadow><extrudeGeometry args={[shape,{depth:length,bevelEnabled:false,curveSegments:40}]}/><meshStandardMaterial color={c(id,color)} metalness={id==='industrial-stop-roller'?0:.7} roughness={.4}/></mesh>;
 return <group name="industrial-stop-fixture" position={at}>
 {owner('industrial-stop-mount',<>{box('industrial-stop-mount',[-6,25,15],[3,50,32],'#8c9bad')}{box('industrial-stop-mount',[-3,2,15],[18,4,32],'#8c9bad')}{box('industrial-stop-mount',[-3.75,33,15],[1.5,11,27],'#c6bba4')}</>)}
 {owner('industrial-stop-body',<>{box('industrial-stop-body',[0,33,15],[6,10,24],'#304151')}{[7,23].map(z=>cyl('industrial-stop-body',[3.5,33,z],1.1,1,'#afbac6','x'))}{box('industrial-stop-body',[0,38.2,2],[6,2.4,4],'#7c8a9a')}{cyl('industrial-stop-body',[0,40,0],1.4,7,'#afbac6','x')}{['COM','NO','NC'].map((name,i)=><Text key={name} position={[3.06,30,9+i*6]} rotation={[0,Math.PI/2,0]} font={font} fontSize={1.1} color="#e3e8f1" raycast={()=>null}>{name}</Text>)}</>)}
 {owner('industrial-stop-lever',<group name="industrial-stop-moving-lever" position={[0,40,0]} rotation={[-s.angle,0,0]}>{ring('industrial-stop-lever',shapes.eye,[-1.5,0,0],3,'#aeb9c5')}{box('industrial-stop-lever',[0,0,(d.length-1)/2],[3,.4,d.length-5],'#aeb9c5')}{box('industrial-stop-lever',[0,0,d.length-3.25],[6.2,.4,.5],'#aeb9c5')}{[-2.8,2.8].map(x=><group key={x}>{box('industrial-stop-lever',[x,0,d.length-2.25],[.5,.4,2.5],'#aeb9c5')}{ring('industrial-stop-lever',shapes.ear,[x-.25,0,d.length],.5,'#aeb9c5')}</group>)}</group>)}
 {owner('industrial-stop-roller',<group name="industrial-stop-moving-roller" position={s.roller}>{ring('industrial-stop-roller',shapes.wheel,[-2,0,0],4,'#c9c1ae')}</group>)}
 {owner('industrial-stop-axle',<group position={s.roller}>{cyl('industrial-stop-axle',[0,0,0],.7,7,'#b7c3cf','x')}</group>)}
 {owner('industrial-stop-plunger',<>{cyl('industrial-stop-plunger',[0,(38+s.plungerY)/2,4],1.2,s.plungerY-38,'#a98c62')}<mesh name="industrial-stop-rounded-plunger" position={[0,s.plungerY,4]}><sphereGeometry args={[1.2,32,20]}/><meshStandardMaterial color={c('industrial-stop-plunger','#a98c62')} roughness={.5}/></mesh></>)}
 {(['com','no','nc']as const).map((name,i)=>owner('industrial-stop-'+name,box('industrial-stop-'+name,[0,24.5,9+i*6],[.7,7,2.8],'#c0ac7a')))}
 {owner('industrial-stop-pad',<group name="industrial-stop-moving-pad" position={[0,s.padY,20.8]}>{box('industrial-stop-pad',[0,0,0],[18,4,18],'#bd4a6b')}<Text position={[0,2.04,0]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={2.1} color="#fff4f5" raycast={()=>null}>STOP TEST</Text></group>)}
 </group>;
}
