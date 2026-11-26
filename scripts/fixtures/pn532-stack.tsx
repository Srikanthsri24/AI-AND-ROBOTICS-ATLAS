import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Uno from '../../src/modules/BluetoothCarUno';
import Shield from '../../src/modules/Pn532ShieldParts';
import Headers from '../../src/modules/Pn532StackHeaders';
import {pn532Stack} from '../../src/data/pn532-stack';
function Scene(){const [selected,choose]=useState(''),s=useThree();useFrame(()=>{Object.assign(window,{__pn532StackState:s});});return <><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.4}/><directionalLight position={[0,4,3]} intensity={2.5}/><group scale={.01}><group name="pn532-uno" scale={50}><Uno selected={selected} select={choose} powered={false} partPrefix="rfid-"/></group><group name="pn532-shield-stack" position={[pn532Stack.offsetX-34.29,pn532Stack.baseY,26.67]}><Shield selected={selected} choose={choose}/><Headers selected={selected} choose={choose}/></group></group><OrbitControls makeDefault target={[.4,.1,0]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[1.6,1.6,2],fov:40,near:.001}}><Scene/></Canvas>);return()=>root.unmount();}
