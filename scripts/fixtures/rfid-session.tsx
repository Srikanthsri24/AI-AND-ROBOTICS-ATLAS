import {useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Wires from '../../src/modules/RfidWireParts';
import ServoLeads from '../../src/modules/RfidServoLeadParts';
import Supply from '../../src/modules/RfidSupplyParts';
import Indicators from '../../src/modules/RfidIndicatorParts';
import Bench from '../../src/modules/RfidWorkbenchParts';
import {rfidWorkbench} from '../../src/data/rfid-workbench-layout';
import Uno from '../../src/modules/BluetoothCarUno';
import Shield from '../../src/modules/Pn532ShieldParts';
import Headers from '../../src/modules/Pn532StackHeaders';
import Tags from '../../src/modules/RfidTagParts';
import Door from '../../src/modules/RfidDoorParts';
import {pn532Stack} from '../../src/data/pn532-stack';
import {rfidSessionInitial,rfidSessionDefaults,rfidSessionAdvance,rfidSessionCommand,rfidSessionReset,type RfidSessionSettings} from '../../src/data/rfid-session';
function Scene(){const state=useRef(rfidSessionInitial()),settings=useRef({...rfidSessionDefaults,assembled:true,usb:true,servoPower:true}),[doorAngle,setDoorAngle]=useState(0),[withdrawal,setWithdrawal]=useState(0),[selected,choose]=useState(''),[,render]=useState(0),s=useThree();useFrame(()=>{Object.assign(window,{__rfidIntegratedScene:s});});Object.assign(window,{__rfidDoorView:setDoorAngle,__rfidWithdraw:setWithdrawal,__rfidIntegrated:{state,settings},__rfidDrive:(patch:Partial<RfidSessionSettings>,ms:number)=>{settings.current={...settings.current,...patch};state.current=rfidSessionAdvance(state.current,settings.current,ms);render(n=>n+1);},__rfidCommand:(text:string)=>{state.current=rfidSessionCommand(state.current,text);render(n=>n+1);},__rfidReset:()=>{state.current=rfidSessionReset(state.current,settings.current);render(n=>n+1);}});return <><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.4}/><directionalLight position={[-2,4,3]} intensity={2.5}/><group scale={.01}><Wires selected={selected} choose={choose}/><ServoLeads selected={selected} choose={choose}/><Bench selected={selected} choose={choose}/><Supply selected={selected} choose={choose} powered={settings.current.servoPower} withdrawal={withdrawal}/><Indicators selected={selected} choose={choose} red={state.current.controller?.red??false} green={state.current.controller?.green??false}/><group name="rfid-reader-prototype" position={[...rfidWorkbench.reader]}><group scale={50}><Uno selected={selected} select={choose} powered={!!state.current.controller} partPrefix="rfid-"/></group><group position={[pn532Stack.offsetX-34.29,pn532Stack.baseY,26.67]}><Shield selected={selected} choose={choose} powered={!!state.current.controller}/><Headers selected={selected} choose={choose}/><Tags a={state.current.tagA} b={state.current.tagB} selected={selected} choose={choose}/></group></group><group position={[...rfidWorkbench.door]}><Door doorAngle={doorAngle} angle={state.current.angle} selected={selected} choose={choose}/></group></group><OrbitControls makeDefault target={[-.2,.45,0]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[3,2.4,3.8],near:.01,far:50,fov:42}}><Scene/></Canvas>);return()=>root.unmount();}
