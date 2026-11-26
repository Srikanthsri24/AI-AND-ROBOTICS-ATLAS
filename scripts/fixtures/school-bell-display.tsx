import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Display from '../../src/modules/SchoolBellDisplayParts';
function Scene(){const[selected,choose]=useState(''),s=useThree();useFrame(()=>{Object.assign(window,{__schoolDisplayScene:s,__schoolDisplaySelected:selected});});return <><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.4}/><directionalLight position={[-2,4,3]} intensity={2.5}/><group scale={.01}><group rotation={[0,Math.PI,0]}><group rotation={[Math.PI/2,0,0]}><Display selected={selected} choose={choose} time="08:30" powered/></group></group></group><OrbitControls makeDefault target={[0,0,0]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[.25,.18,.85],near:.001,far:10,fov:42}}><Scene/></Canvas>);return()=>root.unmount();}
