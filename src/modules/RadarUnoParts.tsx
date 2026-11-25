import {memo,useMemo,useRef,useLayoutEffect,type ReactNode,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {Group,Path,Shape,type MeshStandardMaterial} from 'three';
import type {RadarBenchMotion} from '../data/radar-assembly';
import {radarUsbConnected} from '../data/radar-usb';
import BluetoothCarUno from './BluetoothCarUno';
import {radarUnoAt,radarUnoMounts} from '../data/radar-harness';
function RadarUnoParts({selected,select,powered=false,motion}:{selected:string;select:(id:string)=>void;powered?:boolean;motion?:RefObject<RadarBenchMotion>}){
 const root=useRef<Group>(null),on=useRef<MeshStandardMaterial|null>(null);
 useLayoutEffect(()=>{root.current?.getObjectByName('radar-uno-led-ON')?.traverse(o=>{const m=(o as any).material;if(m?.emissive?.getHex()>0)on.current=m;});},[]);
 useFrame(()=>{if(motion&&on.current){const m=motion.current;on.current.emissiveIntensity=radarUsbConnected(m.usb,m.usbUno,m.usbHost)?1:0;}});
 const post=useMemo(()=>{const s=new Shape();s.absarc(0,0,3,0,Math.PI*2,false);const hole=new Path();hole.absarc(0,0,1.3,0,Math.PI*2,true);s.holes.push(hole);return s;},[]);
 const tag=(id:string,node:ReactNode)=><group userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const color=(id:string,c:string)=>selected===id?'#b78be8':c;
 return <group ref={root}>
  <group position={[...radarUnoAt]} scale={50}><BluetoothCarUno selected={selected} select={select} powered={powered} partPrefix="radar-"/></group>
  {tag('radar-uno-supports',<>{radarUnoMounts().map(([x,y,z],i)=><mesh key={i} position={[x,0,z]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[post,{depth:y,bevelEnabled:false,curveSegments:24}]}/><meshStandardMaterial color={color('radar-uno-supports','#e1d9c8')} roughness={.65}/></mesh>)}</>)}
  {tag('radar-uno-bolts',<>{radarUnoMounts().map(([x,,z],i)=><group key={i}>
   <mesh position={[x,5.3,z]} castShadow><cylinderGeometry args={[1,1,9,24]}/><meshStandardMaterial color={color('radar-uno-bolts','#b7bfc8')} metalness={.8} roughness={.3}/></mesh>
   <mesh position={[x,10.4,z]} castShadow><cylinderGeometry args={[2.4,2.4,1.2,24]}/><meshStandardMaterial color={color('radar-uno-bolts','#cbd1d7')} metalness={.8} roughness={.3}/></mesh>
   <mesh position={[x,11.02,z]}><boxGeometry args={[3,.04,.3]}/><meshStandardMaterial color={color('radar-uno-bolts','#46505d')}/></mesh>
  </group>)}</>)}
 </group>;
}
export default memo(RadarUnoParts);
