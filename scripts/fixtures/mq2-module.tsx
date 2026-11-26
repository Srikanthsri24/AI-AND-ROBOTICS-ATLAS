import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Module from '../../src/modules/Mq2ModuleParts';
function Scene(){const state=useThree(),[selected,choose]=useState('');useFrame(()=>{Object.assign(window,{__mq2State:state,__mq2Selected:selected});});return <><ambientLight intensity={1.5}/><directionalLight position={[1,3,2]} intensity={3}/><group scale={.1}><Module selected={selected} choose={choose} powered/></group><OrbitControls makeDefault target={[2,.4,-1]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[5,5,4],near:.001,fov:40}}><Scene/></Canvas>);return()=>root.unmount();}
