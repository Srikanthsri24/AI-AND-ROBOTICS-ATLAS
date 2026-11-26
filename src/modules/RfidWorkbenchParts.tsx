import {memo,useMemo,type ReactNode} from 'react';
import {Path,Shape} from 'three';
import type {ThreeEvent} from '@react-three/fiber';
import Breadboard from './BluetoothMiniBreadboard';
import {rfidWorkbench as d,rfidUnoSupports,rfidAntennaSupports} from '../data/rfid-workbench-layout';
type P=readonly[number,number,number];
function RfidWorkbenchParts({selected,choose}:{selected:string;choose:(id:string)=>void}){
 const post=useMemo(()=>{const s=new Shape();s.absarc(0,0,2.8,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,1.1,0,Math.PI*2,true);s.holes.push(h);return s;},[]);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>,box=(id:string,p:P,size:P,color:string)=><mesh position={[...p]} castShadow receiveShadow><boxGeometry args={[...size]}/><meshStandardMaterial color={c(id,color)} roughness={.75}/></mesh>;
 return <group name="rfid-workbench-parts">{tag('rfid-work-mat',box('rfid-work-mat',d.mat.centre,d.mat.size,'#39344f'))}
 {tag('rfid-uno-supports',<>{rfidUnoSupports.map((p,n)=><mesh key={n} position={[p.x,p.height/2,p.z]}><cylinderGeometry args={[2.4,2.4,p.height,24]}/><meshStandardMaterial color={c('rfid-uno-supports','#d4d0c6')} roughness={.7}/></mesh>)}</>)}
 {tag('rfid-antenna-supports',<>{rfidAntennaSupports.map((p,n)=><mesh name={'rfid-antenna-post-'+n} key={n} position={[p.x,0,p.z]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[post,{depth:p.height,bevelEnabled:false,curveSegments:32}]}/><meshStandardMaterial color={c('rfid-antenna-supports','#d4d0c6')} roughness={.7}/></mesh>)}</>)}
 {tag('rfid-breadboard-riser',box('rfid-breadboard-riser',[d.breadboard[0],4,d.breadboard[2]],[45,8,33],'#c8c3b9'))}{tag('rfid-breadboard',<group position={[...d.breadboard]} scale={50}><Breadboard selected={selected==='rfid-breadboard'} supplyLabel="" returnLabel=""/></group>)}
 {tag('rfid-card-rest',<>{box('rfid-card-rest',[d.cardRest[0],28,d.cardRest[2]],[68,4,44],'#b9a484')}{[-29,29].flatMap(x=>[-17,17].map(z=><group key={x+':'+z}>{box('rfid-card-rest',[d.cardRest[0]+x,13,d.cardRest[2]+z],[4,26,4],'#a38f72')}</group>))}</>)}
 {tag('rfid-fob-rest',<>{box('rfid-fob-rest',[d.fobRest[0],28,d.fobRest[2]],[38,4,30],'#b9a484')}{[-15,15].flatMap(x=>[-11,11].map(z=><group key={x+':'+z}>{box('rfid-fob-rest',[d.fobRest[0]+x,13,d.fobRest[2]+z],[4,26,4],'#a38f72')}</group>))}</>)}
 </group>;
}
export default memo(RfidWorkbenchParts);
