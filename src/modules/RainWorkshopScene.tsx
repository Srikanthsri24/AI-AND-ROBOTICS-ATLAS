import {useRef,type RefObject} from 'react';
import {useFrame,type ThreeEvent} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import type {Group} from 'three';
import Controller from './RainControllerParts';
import Mechanical from './RainMechanicalParts';
import Water from './RainWaterParts';
import Supply from './RainSupplyParts';
import Leads from './RainServoLeadParts';
import Wires from './RainWireParts';
import Usb from './RainUsbParts';
import Motion from './RainAssemblyMotion';
import Camera from './RainCamera';
import Label from './CraneSurfaceLabel';
import {rainHardwareParts} from '../data/rain-hardware-parts';
import {rainAssemblyUsb,rainAssemblyWireCursor} from '../data/rain-assembly';
import type {RainSession,RainSessionSettings} from '../data/rain-session';
import type {RainUsbMotion} from '../data/rain-usb';
import {floodSurfaceAnchor,type FloodAnchor} from '../data/flood-surface';
export default function RainWorkshopScene({system,settings,progress,usb,selected,choose,version,report}:{system:RefObject<RainSession>;settings:RefObject<RainSessionSettings>;progress:number;usb:RefObject<RainUsbMotion>;selected:string;choose:(id:string)=>void;version:number;report:(s:string)=>void}){
 const root=useRef<Group>(null),anchor=useRef<FloodAnchor|null>(null),motion=useRef(usb.current);
 useFrame(()=>{motion.current=progress<15?rainAssemblyUsb(progress):usb.current;},-4);
 const pick=(e:ThreeEvent<PointerEvent>)=>{e.stopPropagation();anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);};
 return <><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.4}/><directionalLight position={[-3,7,4]} intensity={2.3} castShadow shadow-mapSize={[2048,2048]}/><Motion root={root} progress={progress}/><group ref={root} name="rain-workshop-hardware" scale={.01} onPointerDown={pick}><Controller selected={selected} choose={choose} usb={settings.current.usb}/><Mechanical angle={system.current.angle} selected={selected} choose={choose}/><Water drops={settings.current.drops} selected={selected} choose={choose}/><Supply selected={selected} choose={choose} powered={settings.current.servoPower}/><Leads selected={selected} choose={choose}/><Wires selected={selected} choose={choose} cursor={rainAssemblyWireCursor(progress)}/><Usb selected={selected} choose={choose} powered={settings.current.usb} motion={motion} rows={system.current.controller?.rows.slice(-5).map(row=>row.text)??[]}/></group><Label anchor={anchor} selected={selected} name={rainHardwareParts.find(p=>p.id===selected)?.name??''}/><OrbitControls makeDefault minDistance={.05} maxDistance={20}/><Camera selected={selected} version={version*100+Math.floor(progress)} anchor={anchor} report={report}/></>;
}
