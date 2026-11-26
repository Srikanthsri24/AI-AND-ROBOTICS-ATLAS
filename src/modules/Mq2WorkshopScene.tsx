import {useRef,type RefObject} from 'react';
import {useFrame,type ThreeEvent} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import type {Group,Object3D} from 'three';
import Parts from './Mq2WorkbenchParts';
import Wires from './Mq2WireParts';
import Supply from './Mq2SupplyParts';
import Supports from './Mq2SupportParts';
import Usb from './Mq2UsbParts';
import Label from './CraneSurfaceLabel';
import Camera from './Mq2Camera';
import {mq2AssemblyGroups,mq2AssemblyPose,mq2AssemblyWireCursor,mq2AssemblyUsb} from '../data/mq2-assembly';
import {mq2HardwareParts} from '../data/mq2-hardware-parts';
import {mq2Serial} from '../data/mq2-workshop';
import type {Mq2Session,Mq2SessionSettings} from '../data/mq2-session';
import {floodSurfaceAnchor,type FloodAnchor} from '../data/flood-surface';
export default function Mq2WorkshopScene({system,settings,progress,selected,choose,viewVersion,report}:{system:RefObject<Mq2Session>;settings:RefObject<Mq2SessionSettings>;progress:RefObject<number>;selected:string;choose:(id:string)=>void;viewVersion:number;report:(message:string)=>void}){
 const root=useRef<Group>(null),anchor=useRef<FloodAnchor|null>(null),bases=useRef(new Map<Object3D,number>()),wireCursor=useRef(0),usb=useRef(system.current.usb);
 useFrame(()=>{if(!root.current)return;const p=progress.current;for(const id of mq2AssemblyGroups){const object=root.current.getObjectByName(id);if(!object)continue;let y=bases.current.get(object);if(y===undefined){y=object.position.y;bases.current.set(object,y);}const pose=mq2AssemblyPose(id,p);object.visible=pose.visible;object.position.y=y+pose.lift;}wireCursor.current=mq2AssemblyWireCursor(p);usb.current=p<13?mq2AssemblyUsb(p):system.current.usb;},-3);
 const powered=progress.current===13&&system.current.controller.powered,rows=system.current.controller.controller.rows.slice(-5).map(mq2Serial),parts=mq2HardwareParts(settings.current.mode);
 const pick=(e:ThreeEvent<PointerEvent>)=>{e.stopPropagation();anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);};
 return <><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.4}/><directionalLight position={[-3,7,4]} intensity={2.3} castShadow shadow-mapSize={[2048,2048]}/><group ref={root} name="mq2-workshop-hardware" scale={.01} onPointerDown={pick}><Parts selected={selected} choose={choose} usb={powered} modulePower={settings.current.supply} led={system.current.controller.led} dial={settings.current.dial}/><Supports selected={selected} choose={choose}/><Supply selected={selected} choose={choose} powered={settings.current.supply}/><Wires selected={selected} choose={choose} mode={settings.current.mode} cursor={wireCursor}/><Usb selected={selected} choose={choose} powered={powered} motion={usb} rows={rows}/></group><Label anchor={anchor} selected={selected} name={parts.find(p=>p.id===selected)?.name??''}/><OrbitControls makeDefault minDistance={.05} maxDistance={20}/><Camera selected={selected} version={viewVersion*100+Math.floor(progress.current)} anchor={anchor} report={report}/></>;
}
