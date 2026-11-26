import {memo,type ReactNode} from 'react';
import type {ThreeEvent} from '@react-three/fiber';
import {Text} from '@react-three/drei';
import Breadboard from './BluetoothMiniBreadboard';
import {schoolBellWorkbench as d,schoolBellUnoSupports,schoolBellRtcSupports,schoolBellBusColumns,schoolBellBusHole,type BellPoint} from '../data/school-bell-workbench-layout';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function SchoolBellBenchParts({selected,choose}:{selected:string;choose:(id:string)=>void}){const c=(id:string,normal:string)=>id===selected?'#b78be8':normal,tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>,box=(id:string,p:BellPoint,size:BellPoint,color:string)=><mesh position={[...p]} castShadow receiveShadow><boxGeometry args={[...size]}/><meshStandardMaterial color={c(id,color)} roughness={.7}/></mesh>;
return <group name="school-bench-parts">{tag('school-work-mat',box('school-work-mat',d.mat.centre,d.mat.size,'#39344f'))}
 {['uno','rtc'].map(kind=>{const supports=kind==='uno'?schoolBellUnoSupports:schoolBellRtcSupports,id='school-'+kind+'-supports';return <group key={id}>{tag(id,<>{supports.map((p,n)=><mesh key={n} name={id+'-'+n} position={[p.x,p.height/2,p.z]}><cylinderGeometry args={[1.1,1.1,p.height,24]}/><meshStandardMaterial color={c(id,'#c9c7c0')} roughness={.6}/></mesh>)}</>)}</group>;})}
 {tag('school-breadboard-base',box('school-breadboard-base',[d.breadboard[0],1,d.breadboard[2]],[47,2,35],'#cbc5b9'))}
 {tag('school-breadboard',<group position={[...d.breadboard]} scale={50}><Breadboard selected={selected==='school-breadboard'} supplyLabel="" returnLabel=""/></group>)}
 {Object.keys(schoolBellBusColumns).map(name=>{const net=name as keyof typeof schoolBellBusColumns,p=schoolBellBusHole(net,4);return <Text key={net} font={font} position={[p[0],12.1,p[2]+2.2]} rotation={[-Math.PI/2,0,Math.PI/2]} fontSize={1.1} color={net==='5V'?'#aa425d':net==='GND'?'#444b61':'#596d9b'} raycast={()=>null}>{net}</Text>;})}
 {tag('school-display-stand',<>{box('school-display-stand',[65,2,-63],[62,4,20],'#82718f')}{[-21.844,21.844].map(x=><group key={x}>{box('school-display-stand',[65-x,13.284,-63],[4,22.568,4],'#a4a1b0')}{box('school-display-stand',[65-x,26.57,-63.6],[4,4,4],'#a4a1b0')}</group>)}</>)}
 <Text font={font} position={[-145,.05,-97]} rotation={[-Math.PI/2,0,0]} anchorX="left" fontSize={4.2} color="#c8b4e8" raycast={()=>null}>SCHOOL BELL · RTC + I²C + TONE</Text>
 </group>;}
export default memo(SchoolBellBenchParts);
