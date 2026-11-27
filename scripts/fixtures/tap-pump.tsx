import {createRoot} from 'react-dom/client';
import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Pump,{tapPumpParts} from '../../src/modules/TapPeristalticPump';
function Fixture(){const[selected,choose]=useState(''),[cutaway,setCutaway]=useState(true),[phase,setPhase]=useState(0);return <><div style={{height:600}}><Canvas camera={{position:[0,.45,1.45],fov:42}}><ambientLight intensity={1.5}/><directionalLight position={[3,4,5]} intensity={3}/><group scale={.01}><Pump phase={phase} cutaway={cutaway} selected={selected} choose={choose}/></group><OrbitControls target={[0,0,-.2]}/></Canvas></div><button onClick={()=>setCutaway(!cutaway)}>Toggle cover</button><button onClick={()=>setPhase(phase+.4)}>Rotate rollers</button>{tapPumpParts.map(([id,title,description])=><button key={id} onClick={()=>choose(id)}>{title}{selected===id?' · '+description:''}</button>)}</>}
export function mount(el:HTMLElement){el.style.cssText='position:fixed;inset:0;background:#eef0fa;color:#172341;padding:20px;overflow:auto';const root=createRoot(el);root.render(<Fixture/>);return()=>root.unmount();}
