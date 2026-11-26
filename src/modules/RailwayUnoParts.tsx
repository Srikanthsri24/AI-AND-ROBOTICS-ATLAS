import {memo,useLayoutEffect,useMemo,useRef,type ReactNode,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {Group,Path,Shape,type MeshStandardMaterial} from 'three';
import BluetoothCarUno from './BluetoothCarUno';
import {railwayUnoAt,railwayUnoMounts} from '../data/railway-power-layout';
import type {RailwayClock} from '../data/railway-workshop';
function RailwayUnoParts({selected='',select=()=>{},clock}:{selected?:string;select?:(id:string)=>void;clock?:RefObject<RailwayClock>}){
 const root=useRef<Group>(null),lamps=useRef<{name:string;material:MeshStandardMaterial}[]>([]);
 useLayoutEffect(()=>{lamps.current=[];for(const name of['ON','RX','TX','L'])root.current?.getObjectByName('railway-uno-led-'+name)?.traverse(o=>{const m=(o as any).material;if(m?.emissive?.getHex()>0)lamps.current.push({name,material:m});});},[]);
 useFrame(()=>{for(const lamp of lamps.current){lamp.material.color.set(selected==='railway-uno-leds'?'#b78be8':lamp.name==='ON'?'#66aa62':'#c1a751');lamp.material.emissive.set(selected==='railway-uno-leds'?'#8e55d9':'#42a64b');lamp.material.emissiveIntensity=lamp.name==='ON'&&clock?.current.powered?1:0;}});
 const post=useMemo(()=>{const s=new Shape();s.absarc(0,0,3,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,1.3,0,Math.PI*2,true);s.holes.push(h);return s;},[]);
 const head=useMemo(()=>{const s=new Shape();s.absarc(0,0,2.4,0,Math.PI*2,false);const h=new Path();for(let n=0;n<6;n++){const a=-n*Math.PI/3;n?h.lineTo(Math.cos(a)*.8,Math.sin(a)*.8):h.moveTo(.8,0);}h.closePath();s.holes.push(h);return s;},[]);
 const color=(id:string,c:string)=>selected===id?'#b78be8':c,tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 return <group ref={root} name="railway-uno-hardware"><group position={[...railwayUnoAt]} scale={50}><BluetoothCarUno selected={selected} select={select} powered={false} partPrefix="railway-"/></group>
 {tag('railway-uno-supports',<>{railwayUnoMounts().map(([x,y,z],n)=><mesh key={n} position={[x,0,z]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[post,{depth:y,curveSegments:32,bevelEnabled:false}]}/><meshStandardMaterial color={color('railway-uno-supports','#dcd6c5')} roughness={.6}/></mesh>)}</>)}
 {tag('railway-uno-bolts',<>{railwayUnoMounts().map(([x,,z],n)=><group key={n}><mesh position={[x,5.3,z]} castShadow><cylinderGeometry args={[1,1,9,24]}/><meshStandardMaterial color={color('railway-uno-bolts','#aeb9c7')} metalness={.8} roughness={.3}/></mesh><mesh position={[x,9.8,z]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[head,{depth:1.2,curveSegments:32,bevelEnabled:false}]}/><meshStandardMaterial color={color('railway-uno-bolts','#c7cfd8')} metalness={.8} roughness={.3}/></mesh></group>)}</>)}
 </group>;
}
export default memo(RailwayUnoParts);
