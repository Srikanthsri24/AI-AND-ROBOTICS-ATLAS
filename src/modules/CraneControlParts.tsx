import {memo,useMemo,useRef,type ReactNode} from 'react';
import {useFrame,type ThreeEvent} from '@react-three/fiber';
import {Text} from '@react-three/drei';
import {Path,Shape,type Group} from 'three';
import Uno from './BluetoothCarUno';
import Board from './BluetoothMiniBreadboard';
import Driver from './CraneDriverParts';
import uno from '../data/uno-r3-board-layout.json';
import {craneLayout,craneButtonAt,type CranePoint as P} from '../data/crane-layout';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function CraneControlParts({selected,choose,usb=false,powerLed=false,signalLed=false,held=false,press,surface}:{selected:string;choose:(id:string)=>void;usb?:boolean;powerLed?:boolean;signalLed?:boolean|null;held?:boolean;press?:(down:boolean,pointerId:number)=>void;surface?:(e:ThreeEvent<PointerEvent>)=>void}){
 const cap=useRef<Group>(null);useFrame((_,dt)=>{if(cap.current)cap.current.position.y+=((held?-.65:0)-cap.current.position.y)*(1-Math.exp(-dt*35));});
 const switchShape=useMemo(()=>{const s=new Shape();s.moveTo(-3,-3);s.lineTo(3,-3);s.lineTo(3,3);s.lineTo(-3,3);s.closePath();const h=new Path();h.absarc(0,0,1.2,0,Math.PI*2,true);s.holes.push(h);return s;},[]);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,children:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{children}</group>,box=(id:string,p:P,size:P,color:string,metal=0)=><mesh position={p} castShadow receiveShadow><boxGeometry args={[...size]}/><meshStandardMaterial color={c(id,color)} metalness={metal} roughness={metal?.35:.65}/></mesh>;
 return <group name="crane-control-hardware">
 <group position={craneLayout.uno} scale={50}><Uno partPrefix="crane-" selected={selected} select={choose} powered={usb}/></group>
 {tag('crane-uno-supports',<>{uno.holes.map((h,n)=><mesh key={n} position={[craneLayout.uno[0]+Number(h.x)-34.29,14.6,craneLayout.uno[2]+26.67-Number(h.y)]} castShadow><cylinderGeometry args={[2.4,2.4,9.2,24]}/><meshStandardMaterial color={c('crane-uno-supports','#d6d2c8')} roughness={.75}/></mesh>)}</>)}
 {tag('crane-breadboard',<group position={craneLayout.breadboard}><group scale={50}><Board selected={selected==='crane-breadboard'} supplyLabel="" returnLabel=""/></group><Text position={[0,10.06,16]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={1.45} color="#514269">HOLD · NO LONG POWER RAILS</Text></group>)}
 <group position={craneLayout.driver}><Driver {...{selected,choose,powerLed,signalLed}}/></group>
 {tag('crane-driver-supports',<>{[2.54,15.24].map(y=><mesh key={y} position={[craneLayout.driver[0]+22.86,14,craneLayout.driver[2]-y]} castShadow><cylinderGeometry args={[2.1,2.1,8,24]}/><meshStandardMaterial color={c('crane-driver-supports','#d8d3c6')} roughness={.75}/></mesh>)}</>)}
 <group name="crane-hold-button" position={craneButtonAt}>
 {tag('crane-button-body',<mesh position={[0,10.6,0]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[switchShape,{depth:3.2,bevelEnabled:false,curveSegments:24}]}/><meshStandardMaterial color={c('crane-button-body','#29323f')} roughness={.65}/></mesh>)}
 {tag('crane-button-cover',<><mesh position={[0,14,0]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[switchShape,{depth:.25,bevelEnabled:false,curveSegments:24}]}/><meshStandardMaterial color={c('crane-button-cover','#aab6bf')} metalness={.75} roughness={.35}/></mesh>{[-1,1].map(side=><group key={side}>{box('crane-button-cover',[side*3.05,12.8,0],[.3,2.9,3],'#aab6bf',.7)}</group>)}</>)}
 {tag('crane-button-cap',<group ref={cap} onPointerDown={e=>{e.stopPropagation();surface?.(e);(e.target as unknown as Element).setPointerCapture(e.pointerId);choose('crane-button-cap');press?.(true,e.pointerId);}} onPointerUp={e=>{e.stopPropagation();(e.target as unknown as Element).releasePointerCapture(e.pointerId);press?.(false,e.pointerId);}} onLostPointerCapture={e=>press?.(false,e.pointerId)} onPointerCancel={e=>press?.(false,e.pointerId)}><mesh position={[0,15.45,0]} castShadow><cylinderGeometry args={[1.45,1.45,1,32]}/><meshStandardMaterial color={c('crane-button-cap',held?'#ae83cf':'#67538d')} roughness={.5}/></mesh><mesh position={[0,14.3,0]}><cylinderGeometry args={[1,1,2,24]}/><meshStandardMaterial color={c('crane-button-cap','#333d4a')} roughness={.6}/></mesh></group>)}
 {([-1,1] as const).map(bank=>{const id=bank<0?'crane-button-signal':'crane-button-ground';return <group key={bank}>{tag(id,<>{[-2.54,2.54].map(x=><group key={x}>{box(id,[x,8.3,bank*3.81],[.7,5.4,.3],'#b7baae',.7)}{box(id,[x,11,bank*3.15],[.7,.4,1.32],'#b7baae',.7)}</group>)}{box(id,[0,11.2,bank*2.5],[5.6,.4,.6],'#b7baae',.7)}</>)}</group>;})}
 </group>
 </group>;
}
export default memo(CraneControlParts);
