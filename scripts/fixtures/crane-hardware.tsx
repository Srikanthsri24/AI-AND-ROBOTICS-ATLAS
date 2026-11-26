import {useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Gantry from '../../src/modules/CraneGantryParts';
import Controls from '../../src/modules/CraneControlParts';
import Supply from '../../src/modules/CraneSupplyParts';
import Wires from '../../src/modules/CraneWireParts';
import CoilLeads from '../../src/modules/CraneCoilLeadParts';
import Usb from '../../src/modules/CraneUsbParts';
import SurfaceLabel from '../../src/modules/CraneSurfaceLabel';
import {craneHardwareParts} from '../../src/data/crane-hardware-parts';
import {floodSurfaceAnchor,type FloodAnchor} from '../../src/data/flood-surface';
import {craneMotionInitial,craneMotionAdvance,type CraneMotionInput} from '../../src/data/crane-motion';
function Scene(){const wireCursor=useRef(14),usb=useRef({unoWithdrawal:12,hostWithdrawal:12}),anchor=useRef<FloodAnchor|null>(null),motion=useRef(craneMotionInitial()),[selected,setSelected]=useState(''),state=useThree();useFrame(()=>{(window as any).__craneState=state;});(window as any).__craneWireCursor=wireCursor;(window as any).__craneUsbMotion=usb;(window as any).__craneSelect=selected;(window as any).__craneAnchor=anchor;(window as any).__craneParts=craneHardwareParts;(window as any).__craneMotion=motion;(window as any).__craneAdvance=(ms:number,input:CraneMotionInput)=>{motion.current=craneMotionAdvance(motion.current,ms,input);};return <><ambientLight intensity={1.4}/><directionalLight position={[0,5,4]} intensity={2.5}/><group scale={.01} onPointerDown={e=>{e.stopPropagation();anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}><Gantry motion={motion} selected={selected} choose={setSelected}/><Controls selected={selected} choose={setSelected} powerLed surface={e=>{anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}/><Supply selected={selected} choose={setSelected} powered/><Wires selected={selected} choose={setSelected} cursor={wireCursor}/><CoilLeads motion={motion} selected={selected} choose={setSelected}/><Usb selected={selected} choose={setSelected} powered={false} motion={usb}/></group><SurfaceLabel anchor={anchor} selected={selected} name={craneHardwareParts.find(p=>p.id===selected)?.name??selected}/><OrbitControls makeDefault target={[0,1,0]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[3,2.8,4],fov:42,near:.001}}><Scene/></Canvas>);return()=>root.unmount();}
