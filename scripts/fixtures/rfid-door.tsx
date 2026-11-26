import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Parts from '../../src/modules/RfidDoorParts';
function Scene(){const [angle,setAngle]=useState(35),[door,setDoor]=useState(0),[selected,choose]=useState(''),state=useThree();useFrame(()=>{Object.assign(window,{__rfidDoorState:state,__rfidSetAngle:setAngle,__rfidSetDoor:setDoor});});return <><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.4}/><directionalLight position={[-2,4,4]} intensity={2.5}/><group scale={.01}><Parts angle={angle} doorAngle={door} selected={selected} choose={choose}/></group><OrbitControls makeDefault target={[.4,.55,.1]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[1.7,1.4,2.7],fov:40,near:.001}}><Scene/></Canvas>);return()=>root.unmount();}
