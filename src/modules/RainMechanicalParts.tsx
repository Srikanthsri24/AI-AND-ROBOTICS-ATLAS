import {memo,useMemo,type ReactNode} from 'react';
import {Path,Shape} from 'three';
import type {ThreeEvent} from '@react-three/fiber';
import {rainLinkagePose} from '../data/rain-linkage';
type P=[number,number,number];
/** Authored card-and-rail classroom mechanism; local coordinates are millimetres. */
function RainMechanicalParts({angle,selected,choose}:{angle:number;selected:string;choose:(id:string)=>void}){
 const pose=rainLinkagePose(angle),x=pose.slider[0];
 const runner=useMemo(()=>{const s=new Shape();s.moveTo(-3.2,-3.5);s.lineTo(3.2,-3.5);s.lineTo(3.2,3.2);s.lineTo(-3.2,3.2);s.closePath();const h=new Path();h.moveTo(-2.3,-2.3);h.lineTo(-2.3,2.3);h.lineTo(2.3,2.3);h.lineTo(2.3,-2.3);h.closePath();s.holes.push(h);return s;},[]);
 const cableWall=useMemo(()=>{const s=new Shape();s.moveTo(-6,6);s.lineTo(6,6);s.lineTo(6,29);s.lineTo(-6,29);s.closePath();const h=new Path();h.moveTo(-2.8,9.2);h.lineTo(-2.8,11.8);h.lineTo(2.8,11.8);h.lineTo(2.8,9.2);h.closePath();s.holes.push(h);return s;},[]);
 const shirt=useMemo(()=>{const s=new Shape();[[-4,0],[-7,-2],[-9,-7],[-5,-9],[-4,-6],[-4,-18],[4,-18],[4,-6],[5,-9],[9,-7],[7,-2],[4,0],[2,0],[0,-2],[-2,0]].forEach(([x,y],n)=>n?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;},[]);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color;
 const tag=(id:string,children:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{children}</group>;
 const box=(id:string,p:P,size:P,color:string)=><mesh position={p} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={c(id,color)} roughness={.78}/></mesh>;

 return <group name="rain-mechanical-hardware">
 {tag('rain-card-base',box('rain-card-base',[42.5,3,0],[145,6,120],'#c7aa7c'))}
 {[-21,21].map((z,n)=>{const id='rain-rail-'+n;return <group key={id}>{tag(id,box(id,[61.5,26,z],[75,4,4],'#aab3b9'))}{tag('rain-rail-supports',<>{[27,96].map(px=><group key={px}>{box('rain-rail-supports',[px,15,z],[8,18,9],'#b59a70')}</group>)}</>)}</group>;})}
 {tag('rain-servo-case',<>{box('rain-servo-case',[-5.5,6.35,-16],[23,.7,12],'#306391')}{box('rain-servo-case',[-5.5,28.65,-16],[23,.7,12],'#306391')}{[-21.65,-10.35].map(z=><group key={z}>{box('rain-servo-case',[-5.5,17.5,z],[23,23,.7],'#306391')}</group>)}{box('rain-servo-case',[5.65,17.5,-16],[.7,23,12],'#306391')}<mesh position={[-17,0,-16]} rotation={[0,Math.PI/2,0]}><extrudeGeometry args={[cableWall,{depth:.7,bevelEnabled:false}]}/><meshStandardMaterial color={c('rain-servo-case','#306391')} roughness={.7}/></mesh>{box('rain-servo-case',[-5.5,7.5,-16],[32,3,15],'#274f77')}{box('rain-servo-case',[0,30,-16],[12,2,12],'#316996')}</>)}
 {tag('rain-servo-shaft',<mesh position={[0,32.5,-16]}><cylinderGeometry args={[2.4,2.4,3,24]}/><meshStandardMaterial color={c('rain-servo-shaft','#ddd8c7')} roughness={.5}/></mesh>)}
 {tag('rain-servo-horn',<group position={[0,34,-16]} rotation={[0,angle*Math.PI/180-Math.PI,0]}>{box('rain-servo-horn',[10,0,0],[20,1.5,3.8],'#e0ddd2')}<mesh><cylinderGeometry args={[3.5,3.5,1.5,24]}/><meshStandardMaterial color={c('rain-servo-horn','#e0ddd2')}/></mesh></group>)}
 {tag('rain-pushrod',<mesh position={[(pose.crank[0]+x)/2,35.5,pose.crank[2]/2]} rotation={[0,-pose.rodAngle,Math.PI/2]}><cylinderGeometry args={[.65,.65,65,12]}/><meshStandardMaterial color={c('rain-pushrod','#b7bec2')} metalness={.8} roughness={.35}/></mesh>)}
 {tag('rain-carriage',<group position={[x,0,0]}>{box('rain-carriage',[0,30.7,0],[26,3,54],'#d4bd94')}{[-21,21].map(z=><mesh key={z} position={[-5,26,z]} rotation={[0,Math.PI/2,0]}><extrudeGeometry args={[runner,{depth:10,bevelEnabled:false}]}/><meshStandardMaterial color={c('rain-carriage','#647587')} roughness={.65}/></mesh>)}</group>)}
 {tag('rain-joints',<>{[pose.crank,pose.slider].map((p,n)=><mesh key={n} position={[p[0],34.5,p[2]]}><cylinderGeometry args={[1.1,1.1,5,20]}/><meshStandardMaterial color={c('rain-joints','#aeb8be')} metalness={.8} roughness={.35}/></mesh>)}</>)}
 {tag('rain-clothesline',<group position={[x,0,0]}>{[-27,27].map(z=><group key={z}>{box('rain-clothesline',[0,55.6,z],[2.5,46.8,2.5],'#b49a71')}</group>)}<mesh position={[0,77,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.3,.3,54,10]}/><meshStandardMaterial color={c('rain-clothesline','#e6dcc7')}/></mesh></group>)}
 {[-14,14].map((z,n)=>{const id='rain-paper-shirt-'+n;return <group key={id}>{tag(id,<mesh position={[x,77,z]} rotation={[0,Math.PI/2,0]} castShadow><extrudeGeometry args={[shirt,{depth:.5,bevelEnabled:false}]}/><meshStandardMaterial color={c(id,n?'#8861b0':'#cf7973')} roughness={.9}/></mesh>)}{tag('rain-clothes-pegs',<>{[-2.5,2.5].map(dz=><group key={dz}>{box('rain-clothes-pegs',[x+.5,77,z+dz],[2,6,1.5],'#d2bb8f')}</group>)}</>)}</group>;})}
 {tag('rain-canopy',<>{box('rain-canopy',[47,94,0],[38,2,82],'#b79e7b')}{[28,66].flatMap(px=>[-36,36].map(z=><group key={px+':'+z}>{box('rain-canopy',[px,49,z],[3,86,3],'#b79e7b')}</group>))}</>)}
 </group>;
}
export default memo(RainMechanicalParts);
