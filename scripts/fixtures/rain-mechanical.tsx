import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Parts from '../../src/modules/RainMechanicalParts';
function Scene(){const [angle,setAngle]=useState(35),[selected,choose]=useState(''),state=useThree();useFrame(()=>Object.assign(window,{__rainMechanicalState:state,__rainSetAngle:setAngle,__rainSelected:selected}));return <><ambientLight intensity={1.4}/><directionalLight position={[2,4,3]} intensity={2.5}/><group scale={.01}><Parts angle={angle} selected={selected} choose={choose}/></group><OrbitControls makeDefault target={[.4,.4,0]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[2,1.8,2],near:.001,fov:40}}><Scene/></Canvas>);return()=>root.unmount();}
