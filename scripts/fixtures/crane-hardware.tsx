import {useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Gantry from '../../src/modules/CraneGantryParts';
import Driver from '../../src/modules/CraneDriverParts';
import {craneMotionInitial,craneMotionAdvance,type CraneMotionInput} from '../../src/data/crane-motion';
function Scene(){const motion=useRef(craneMotionInitial()),[selected,setSelected]=useState(''),state=useThree();useFrame(()=>{(window as any).__craneState=state;});(window as any).__craneSelect=selected;(window as any).__craneMotion=motion;(window as any).__craneAdvance=(ms:number,input:CraneMotionInput)=>{motion.current=craneMotionAdvance(motion.current,ms,input);};return <><ambientLight intensity={1.4}/><directionalLight position={[0,5,4]} intensity={2.5}/><group scale={.01}><Gantry motion={motion} selected={selected} choose={setSelected}/><group position={[0,15,-55]}><Driver selected={selected} choose={setSelected} powerLed signalLed/></group></group><OrbitControls makeDefault target={[0,1,0]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[3,2.8,4],fov:42,near:.001}}><Scene/></Canvas>);return()=>root.unmount();}
