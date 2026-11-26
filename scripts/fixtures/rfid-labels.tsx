import {rfidAssemblyWireCursor} from '../../src/data/rfid-assembly';
import {useState,useRef} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import Scene from '../../src/modules/RfidWorkshopScene';
import {rfidSessionInitial,rfidSessionDefaults} from '../../src/data/rfid-session';
import {rfidConnectionsSeated} from '../../src/data/rfid-connections';
function Probe(){const s=useThree();useFrame(()=>{Object.assign(window,{__rfidLabelsScene:s});});return null;}
function App(){const usb=useRef({unoWithdrawal:12,hostWithdrawal:12});const[,refresh]=useState(0);const[selected,choose]=useState(''),[version,setVersion]=useState(0),[tagA,setTagA]=useState(0),[withdrawal,setWithdrawal]=useState(0),[progress,setProgress]=useState(11);Object.assign(window,{__rfidFocus:(id:string)=>{choose(id);setVersion(v=>v+1);},__rfidUsb:(pose:{unoWithdrawal:number;hostWithdrawal:number})=>{usb.current=pose;refresh(n=>n+1);},__rfidAssembly:setProgress,__rfidInspectDc:setWithdrawal,__rfidChooseRaw:choose,__rfidMoveTag:setTagA,__rfidLabelSelected:selected});return <Canvas camera={{position:[3,2.4,3.8],near:.01,far:50,fov:42}}><Probe/><Scene state={{...rfidSessionInitial(),tagA}} settings={{...rfidSessionDefaults,assembled:true,connections:rfidConnectionsSeated()}} usb={usb} cursor={rfidAssemblyWireCursor(progress)} progress={progress} doorAngle={0} withdrawal={withdrawal} selected={selected} choose={choose} version={version}/></Canvas>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<App/>);return()=>root.unmount();}
