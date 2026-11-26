import Usb from '../../src/modules/RainUsbParts';
import {rainAssemblyUsb} from '../../src/data/rain-assembly';
import Label from '../../src/modules/CraneSurfaceLabel';
import {floodSurfaceAnchor,type FloodAnchor} from '../../src/data/flood-surface';
import {rainWorkshopParts} from '../../src/data/rain-hardware-parts';
import type {Group} from 'three';
import Motion from '../../src/modules/RainAssemblyMotion';
import {rainAssemblyWireCursor} from '../../src/data/rain-assembly';
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
function Scene(){const anchor=useRef<FloodAnchor|null>(null),root=useRef<Group>(null),[assembly,setAssembly]=useState(15);const usbMotion=useRef({unoWithdrawal:0,hostWithdrawal:0});const system=useRef(rainSessionInitial()),settings=useRef({...rainSessionDefaults,assembled:true,usb:true,servoPower:true}),[withdrawal,setWithdrawal]=useState(0),[selected,choose]=useState(''),[cursor,setCursor]=useState(18),[,render]=useState(0),state=useThree();Object.assign(window,{__rainWithdraw:setWithdrawal,__rainSelected:rainWorkshopParts(settings.current.drops).find(p=>p.id===selected),__rainAssemble:(value:number)=>{if(value<15){settings.current={...settings.current,assembled:false,usb:false,servoPower:false,drops:[]};system.current=rainSessionInitial();}else settings.current={...settings.current,assembled:true};setAssembly(value);},__rainFit:setCursor,__rainDrive:(patch:Partial<RainSessionSettings>,ms:number)=>{settings.current={...settings.current,...patch};if(assembly<15)settings.current={...settings.current,assembled:false,usb:false,servoPower:false};system.current=rainSessionAdvance(system.current,settings.current,ms);render(n=>n+1);},__rainSession:{system,settings}});useFrame(()=>{usbMotion.current=assembly<15?rainAssemblyUsb(assembly):{unoWithdrawal:settings.current.usb?0:12,hostWithdrawal:0};Object.assign(window,{__rainSessionScene:state});});return <><ambientLight intensity={1.5}/><directionalLight position={[1,4,3]} intensity={2.5}/><Motion root={root} progress={assembly}/><group ref={root} scale={.01} onPointerDown={e=>{e.stopPropagation();anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}><Usb selected={selected} choose={choose} powered={settings.current.usb} motion={usbMotion} rows={system.current.controller?.rows.slice(-5).map(row=>row.text)??[]}/><Wires selected={selected} choose={choose} cursor={assembly<15?rainAssemblyWireCursor(assembly):cursor}/><ServoLeads selected={selected} choose={choose}/><Supply selected={selected} choose={choose} powered={settings.current.servoPower} withdrawal={withdrawal}/><Controller selected={selected} choose={choose} usb={settings.current.usb}/><Mechanical angle={system.current.angle} selected={selected} choose={choose}/><Water drops={settings.current.drops} selected={selected} choose={choose}/></group><Label anchor={anchor} selected={selected} name={rainWorkshopParts(settings.current.drops).find(p=>p.id===selected)?.name??''}/><OrbitControls makeDefault target={[0,.4,.2]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[3.3,2.6,3.5],near:.001,fov:40}}><Scene/></Canvas>);return()=>root.unmount();}
