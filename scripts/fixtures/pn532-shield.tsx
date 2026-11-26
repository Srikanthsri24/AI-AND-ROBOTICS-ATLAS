import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useThree,useFrame} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Parts from '../../src/modules/Pn532ShieldParts';
function Scene(){const [selected,choose]=useState(''),s=useThree();useFrame(()=>{Object.assign(window,{__pn532State:s});});return <><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.4}/><directionalLight position={[0,3,2]} intensity={2.5}/><group scale={.01}><Parts selected={selected} choose={choose}/></group><OrbitControls makeDefault target={[.59,0,-.26]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[1.2,1.1,.7],near:.001,fov:40}}><Scene/></Canvas>);return()=>root.unmount();}
