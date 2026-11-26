import {useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Wires from '../../src/modules/RainWireParts';
import ServoLeads from '../../src/modules/RainServoLeadParts';
import Supply from '../../src/modules/RainSupplyParts';
import Controller from '../../src/modules/RainControllerParts';
import Mechanical from '../../src/modules/RainMechanicalParts';
import Water from '../../src/modules/RainWaterParts';
import {rainSessionInitial,rainSessionAdvance,rainSessionDefaults,type RainSessionSettings} from '../../src/data/rain-session';
function Scene(){const system=useRef(rainSessionInitial()),settings=useRef({...rainSessionDefaults,assembled:true,usb:true,servoPower:true}),[selected,choose]=useState(''),[cursor,setCursor]=useState(18),[,render]=useState(0),state=useThree();Object.assign(window,{__rainFit:setCursor,__rainDrive:(patch:Partial<RainSessionSettings>,ms:number)=>{settings.current={...settings.current,...patch};system.current=rainSessionAdvance(system.current,settings.current,ms);render(n=>n+1);},__rainSession:{system,settings}});useFrame(()=>{Object.assign(window,{__rainSessionScene:state});});return <><ambientLight intensity={1.5}/><directionalLight position={[1,4,3]} intensity={2.5}/><group scale={.01}><Wires selected={selected} choose={choose} cursor={cursor}/><ServoLeads selected={selected} choose={choose}/><Supply selected={selected} choose={choose} powered={settings.current.servoPower}/><Controller selected={selected} choose={choose} usb={settings.current.usb}/><Mechanical angle={system.current.angle} selected={selected} choose={choose}/><Water drops={settings.current.drops} selected={selected} choose={choose}/></group><OrbitControls makeDefault target={[0,.4,.2]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[3.3,2.6,3.5],near:.001,fov:40}}><Scene/></Canvas>);return()=>root.unmount();}
