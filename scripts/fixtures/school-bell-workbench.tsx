import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import Scene from '../../src/modules/SchoolBellWorkbenchScene';
function View(){const[selected,choose]=useState(''),[cursor,setCursor]=useState(30),s=useThree();useFrame(()=>{Object.assign(window,{__schoolBenchFitting:setCursor,__schoolBenchCursor:cursor,__schoolBenchScene:s,__schoolBenchSelected:selected});});return <Scene selected={selected} choose={choose} fittingCursor={cursor} time="08:30" powered={cursor===30} batteryInsertion={1}/>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[2.8,3.7,4.4],fov:40,near:.001,far:30}}><View/></Canvas>);return()=>root.unmount();}
