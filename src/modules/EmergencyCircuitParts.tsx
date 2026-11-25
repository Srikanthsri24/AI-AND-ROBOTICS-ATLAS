import type {} from '@react-three/fiber';
import {useMemo,type ReactNode} from 'react';
import {Text} from '@react-three/drei';
import {CatmullRomCurve3,Path,Shape,Vector3} from 'three';
import Board from './EmergencyBreadboard';
import {emergencyBoard,emergencyBoardHole,emergencyResistors,emergencyButtons} from '../data/emergency-board';
import type {EmergencyPoint as P} from '../data/emergency-corridor';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
export default function EmergencyCircuitParts({selected='',select=()=>{},alarmPressed=false,resetPressed=false}:{selected?:string;select?:(id:string)=>void;alarmPressed?:boolean;resetPressed?:boolean}){
 const cover=useMemo(()=>{const s=new Shape();s.moveTo(-3,-3);s.lineTo(3,-3);s.lineTo(3,3);s.lineTo(-3,3);s.closePath();const h=new Path();h.absarc(0,0,1.2,0,Math.PI*2,true);s.holes.push(h);return{s,settings:{depth:.25,bevelEnabled:false,curveSegments:32}};},[]);
 const resistors=useMemo(()=>emergencyResistors.map(r=>{const a=emergencyBoardHole(r.a,-1,0),b=emergencyBoardHole(r.b,-1,0),x=(a[0]+b[0])/2;return{...r,x,z:a[2],curves:[[[a[0],5.5,a[2]],[a[0],12,a[2]],[a[0]+.4,13.6,a[2]],[x-3,14,a[2]]],[[x+3,14,b[2]],[b[0]-.4,13.6,b[2]],[b[0],12,b[2]],[b[0],5.5,b[2]]]].map(points=>new CatmullRomCurve3(points.map(p=>new Vector3(...p)),false,'centripetal'))};}),[]);
 const c=(id:string,color:string)=>selected===id?'#b48bec':color,owner=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>,box=(id:string,p:P,size:P,color:string,metal=0)=><mesh position={p} castShadow><boxGeometry args={size}/><meshStandardMaterial color={c(id,color)} metalness={metal} roughness={metal?.32:.6}/></mesh>;
 return <group name="emergency-circuit-parts-mm"><Board {...{selected,select}}/>
 {resistors.map(r=>{const id=(part:string)=>'emergency-'+r.key+'-resistor-'+part;return <group key={r.key}>
 {owner(id('body'),<group position={[r.x,14,r.z]} rotation={[0,0,Math.PI/2]}><mesh><cylinderGeometry args={[1.2,1.2,6,32]}/><meshStandardMaterial color={c(id('body'),'#c5ae87')} roughness={.65}/></mesh>{[-1.8,-.8,.4,2].map((at,i)=><mesh key={at} position={[0,at,0]}><cylinderGeometry args={[1.215,1.215,.35,32]}/><meshStandardMaterial color={c(id('body'),(r.ohms===220?['#a7463f','#a7463f','#624633','#b6a063']:['#624633','#252b32','#d48c3e','#b6a063'])[i])} metalness={i===3?.65:0} roughness={.4}/></mesh>)}</group>)}
 {owner(id('leads'),<>{r.curves.map((curve,i)=><mesh name={id('lead-')+i} key={i}><tubeGeometry args={[curve,48,.24,10,false]}/><meshStandardMaterial color={c(id('leads'),'#bfc5c6')} metalness={.8} roughness={.3}/></mesh>)}</>)}
 </group>;})}
 {emergencyButtons.map(b=>{const id=(part:string)=>'emergency-'+b.key+'-'+part,x=emergencyBoardHole(b.column,-1,4)[0],z=emergencyBoard.at[2],pressed=b.key==='alarm'?alarmPressed:resetPressed;return <group key={b.key}>
 {owner(id('body'),box(id('body'),[x,12.2,z],[6,3.2,6],'#29333e'))}
 {owner(id('cover'),<><mesh position={[x,14,z]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[cover.s,cover.settings]}/><meshStandardMaterial color={c(id('cover'),'#b4bdc7')} metalness={.8} roughness={.35}/></mesh>{[-1,1].map(side=>box(id('cover'),[x+side*3.05,12.8,z],[.3,2.9,3],'#b4bdc7',.8))}</>)}
 {owner(id('cap'),<group name={'emergency-'+b.key+'-moving-cap'} position={[x,pressed?-.65:0,z]}><mesh position={[0,15.45,0]} castShadow><cylinderGeometry args={[1.45,1.45,1,32]}/><meshStandardMaterial color={c(id('cap'),b.color)} roughness={.5}/></mesh><mesh position={[0,14.3,0]}><cylinderGeometry args={[1,1,2,24]}/><meshStandardMaterial color={c(id('cap'),'#343e4b')} roughness={.6}/></mesh></group>)}
 {([-1,1]as const).map(bank=>{const part=bank<0?'signal':'ground';return owner(id(part),<>{[-2.54,2.54].map(dx=><group key={dx}>{box(id(part),[x+dx,8.3,z+bank*3.81],[.5,5.4,.5],'#bfc5c6',.8)}{box(id(part),[x+dx,11,z+bank*3.15],[.5,.4,1.32],'#bfc5c6',.8)}</group>)}{box(id(part),[x,11.2,z+bank*2.5],[5.6,.4,.6],'#bfc5c6',.8)}</>);})}
 <Text position={[x,10.06,z+18]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={1.25} color="#4f3e64" raycast={()=>null}>{b.label}</Text>
 </group>;})}
 </group>;
}
