import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Sockets from '../../src/modules/StreetSystemSocketParts';
import Lamps from '../../src/modules/StreetSystemLampParts';
import Usb from '../../src/modules/StreetSystemUsbParts';
import Shade from '../../src/modules/StreetSystemShadeParts';
import Electrical from '../../src/modules/StreetSystemElectricalParts';
export function mountStreetHardware(el:HTMLElement){
 function Scene(){const[selected,choose]=useState(''),[travel,setTravel]=useState(0);(window as any).__shadeTravel=setTravel;return <><color attach="background" args={['#e9edf5']}/><ambientLight intensity={1.5}/><directionalLight position={[-4,9,7]} intensity={2.7}/><group scale={.01}><Lamps {...{selected,choose}} stage={8} lamps={[true,false,true]} cutaway/><Electrical {...{selected,choose}} stage={8} powered/><Sockets {...{selected,choose}}/><Shade travel={travel} {...{selected,choose}}/><Usb {...{selected,choose}} powered rows={['A0 = 180 | LAMPS ON']}/></group><OrbitControls makeDefault target={[0,.45,0]}/></>;}
 createRoot(el).render(<Canvas camera={{position:[3,3,4.5],fov:42,near:.001,far:100}} onCreated={s=>{(window as any).__get=s.get;}}><Scene/></Canvas>);
}
