import {useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Parts from '../../src/modules/Mq2WorkbenchParts';
import Wires from '../../src/modules/Mq2WireParts';
import Usb from '../../src/modules/Mq2UsbParts';
import Supply from '../../src/modules/Mq2SupplyParts';
import Supports from '../../src/modules/Mq2SupportParts';
import {mq2SessionInitial,mq2SessionDefaults,mq2SessionAdvance,mq2SessionCapture,mq2SessionRestart,type Mq2SessionSettings} from '../../src/data/mq2-session';
import {mq2Serial} from '../../src/data/mq2-workshop';
function Scene(){const system=useRef(mq2SessionInitial()),settings=useRef({...mq2SessionDefaults,assembled:true}),usb=useRef(system.current.usb),[,render]=useState(0),state=useThree();
 Object.assign(window,{__mq2CalibrationDrive:(patch:Partial<Mq2SessionSettings>,ms:number,action?:string)=>{settings.current={...settings.current,...patch};if(action==='capture')system.current=mq2SessionCapture(system.current);if(action==='reset')system.current=mq2SessionRestart(system.current,settings.current);system.current=mq2SessionAdvance(system.current,settings.current,ms);usb.current=system.current.usb;render(n=>n+1);},__mq2Calibration:{system,settings}});
 useFrame(()=>{Object.assign(window,{__mq2CalibrationScene:state});});
 const select=()=>{},powered=system.current.controller.powered;
 return <><ambientLight intensity={1.4}/><directionalLight position={[2,5,3]} intensity={2.5}/><group scale={.01}><Parts selected="" choose={select} usb={powered} modulePower={settings.current.supply} led={system.current.controller.led} dial={settings.current.dial}/><Wires selected="" choose={select} mode={settings.current.mode}/><Supply selected="" choose={select} powered={settings.current.supply}/><Supports selected="" choose={select}/><Usb selected="" choose={select} powered={powered} motion={usb} rows={system.current.controller.controller.rows.slice(-5).map(mq2Serial)}/></group><OrbitControls makeDefault target={[0,.2,-.25]}/></>;
}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[2.6,2.5,2.5],fov:40,near:.001}}><Scene/></Canvas>);return()=>root.unmount();}
