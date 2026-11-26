import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Rtc from '../../src/modules/SchoolBellRtcParts';
function Scene(){const[selected,choose]=useState(''),s=useThree();useFrame(()=>{Object.assign(window,{__schoolRtcScene:s,__schoolRtcSelected:selected});});return <><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.4}/><directionalLight position={[-2,4,3]} intensity={2.5}/><group scale={.01}><Rtc selected={selected} choose={choose}/></group><OrbitControls makeDefault target={[.1143,.015,-.0889]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[.35,.4,.25],near:.001,far:10,fov:42}}><Scene/></Canvas>);return()=>root.unmount();}
