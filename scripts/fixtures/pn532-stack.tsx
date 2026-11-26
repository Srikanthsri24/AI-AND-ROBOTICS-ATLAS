import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Tags from '../../src/modules/RfidTagParts';
import Uno from '../../src/modules/BluetoothCarUno';
import Shield from '../../src/modules/Pn532ShieldParts';
import Headers from '../../src/modules/Pn532StackHeaders';
import {pn532Stack} from '../../src/data/pn532-stack';
function Scene(){const [a,setA]=useState(0),[b,setB]=useState(0);const [selected,choose]=useState(''),s=useThree();useFrame(()=>{Object.assign(window,{__pn532StackState:s,__pn532Tags:(a:number,b:number)=>{setA(a);setB(b);}});});return <><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.4}/><directionalLight position={[0,4,3]} intensity={2.5}/><group scale={.01}><group name="pn532-uno" scale={50}><Uno selected={selected} select={choose} powered={false} partPrefix="rfid-"/></group><group name="pn532-shield-stack" position={[pn532Stack.offsetX-34.29,pn532Stack.baseY,26.67]}><Shield selected={selected} choose={choose}/><Headers selected={selected} choose={choose}/><Tags a={a} b={b} selected={selected} choose={choose}/></group></group><OrbitControls makeDefault target={[.4,.1,0]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[1.6,1.6,2],fov:40,near:.001}}><Scene/></Canvas>);return()=>root.unmount();}
