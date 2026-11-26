import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Sensor from '../../src/modules/RainWaterSensorParts';
function Scene(){const [selected,choose]=useState(''),state=useThree();useFrame(()=>{Object.assign(window,{__rainSensorState:state,__rainSensorSelected:selected});});return <><ambientLight intensity={1.5}/><directionalLight position={[0,3,2]} intensity={2.5}/><group scale={.05}><Sensor selected={selected} choose={choose}/></group><OrbitControls makeDefault target={[1,.1,-.5]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[3,3,3],fov:38,near:.001}}><Scene/></Canvas>);return()=>root.unmount();}
