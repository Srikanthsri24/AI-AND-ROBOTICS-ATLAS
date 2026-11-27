import {createRoot} from 'react-dom/client';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,OrbitControls} from '@react-three/drei';
import Frame from '../../src/modules/SoapFrameParts';
import Electronics from '../../src/modules/SoapElectronicsParts';
import Studio from '../../src/modules/SchoolBellStudioLight';
export function mount(el:HTMLElement){el.style.cssText='position:fixed;inset:0;background:#edf0f8';const root=createRoot(el);root.render(<Canvas camera={{position:[3.6,4.2,5.5],fov:35,near:.001}}><Studio/><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.2}/><directionalLight position={[-3,5,3]} intensity={2.5}/><group scale={.01}><Frame selected="" choose={()=>{}}/><Electronics assembly={7} selected="" choose={()=>{}}/></group><ContactShadows position={[-.5,-.061,0]} opacity={.3} scale={7} blur={2} far={3} frames={1}/><OrbitControls target={[-.6,1,.2]}/></Canvas>);return()=>root.unmount();}
