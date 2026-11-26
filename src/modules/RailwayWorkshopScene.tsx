import {memo,useCallback,useRef,type RefObject} from 'react';
import {useFrame,type ThreeEvent} from '@react-three/fiber';
import {Line,OrbitControls} from '@react-three/drei';
import {Group,Color} from 'three';
import Prototype,{createRailwayAssemblyRuntime} from './RailwayAssemblyPrototype';
import Inspection,{type RailwayWorkshopView} from './RailwayWorkshopInspection';
import Lighting from './WorkshopStudioLighting';
import {railwayCircuit,type RailwayCircuitLinks} from '../data/railway-circuit';
import {railwayControlJumpers} from '../data/railway-control-jumpers';
import {railwaySensorFeeds} from '../data/railway-sensor-feeds';
import {railwaySensorLeads} from '../data/railway-sensor-leads';
import {railwayBeamBlocked,type RailwayInputs,type RailwayClock} from '../data/railway-workshop';
import {floodOwner,floodSurfaceAnchor,type FloodAnchor} from '../data/flood-surface';
export type RailwayLiveSession={clock:RailwayClock;inputs:RailwayInputs;links:RailwayCircuitLinks;usbUno:number;usbHost:number};
type Props={assembly:RefObject<number>;session:RefObject<RailwayLiveSession>;busy:boolean;selected:string;name:string;focus:number;view:RailwayWorkshopView;version:number;anchor:RefObject<FloodAnchor|null>;choose:(id:string)=>void};
function Scene({assembly,session,busy,selected,name,focus,view,version,anchor,choose}:Props){
 const runtime=useRef(createRailwayAssemblyRuntime()).current,pending=useRef<FloodAnchor|null>(null),beamA=useRef<Group>(null),beamB=useRef<Group>(null);
 useFrame(()=>{if(assembly.current!==14){if(!busy&&(runtime.inputs.current.usb||runtime.inputs.current.servoPower)){runtime.inputs.current={...runtime.inputs.current,usb:false,servoPower:false};runtime.usb.current={...runtime.usb.current,usb:false};runtime.clock.current={...runtime.clock.current,powered:false,rows:[]};}return;}const s=session.current,c=railwayCircuit(s.inputs,s.links,s.usbUno,s.usbHost);runtime.clock.current=s.clock;runtime.inputs.current=s.inputs;runtime.warning.current=c.warningConnected;runtime.controls.current=railwayControlJumpers.map(w=>s.links[w.id]);runtime.feeds.current=railwaySensorFeeds.map(w=>s.links[w.id]);runtime.leads.current=railwaySensorLeads.map(w=>s.links[w.id]);runtime.usb.current={usb:s.inputs.usb,usbUno:s.usbUno,usbHost:s.usbHost};},-2.5);
 useFrame(()=>{const s=session.current,c=assembly.current===14?railwayCircuit(s.inputs,s.links,s.usbUno,s.usbHost):null;for(const[station,root,x]of[['a',beamA.current,-190],['b',beamB.current,190]] as const){if(!root)continue;root.visible=!!c?.logicPowered&&!!c.devices[station+'-emitter'];const blocked=railwayBeamBlocked(s.clock.trainNose,x)||!(station==='a'?s.inputs.entryAligned:s.inputs.exitAligned);root.traverse(o=>{const m=(o as any).material;if(m?.color)m.color.copy(new Color(blocked?'#d76c88':'#9470da'));});}},0);
 const surface=useCallback((e:ThreeEvent<PointerEvent>)=>{if(busy)return;if(!floodOwner(e.object))return;e.stopPropagation();pending.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);},[busy]);
 const select=useCallback((id:string)=>{if(busy)return;if(pending.current&&floodOwner(pending.current.object)===id)anchor.current=pending.current;pending.current=null;choose(id);},[busy,anchor,choose]);
 return <><color attach="background" args={['#edf0f8']}/><Lighting/><ambientLight intensity={1.1}/><directionalLight position={[-5,12,7]} intensity={2.6} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-18} shadow-camera-right={18} shadow-camera-top={18} shadow-camera-bottom={-18} shadow-camera-far={100}/><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.061,0]} receiveShadow><planeGeometry args={[100,100]}/><meshStandardMaterial color="#e4e9f3" roughness={.95}/></mesh><group onPointerDown={surface}><group scale={.01}><Prototype progress={assembly} runtime={runtime} selected={selected} select={select}/><group ref={beamA} visible={false} name="railway-beam-a-overlay"><Line points={[[-190,24,-48],[-190,24,48]]} color="#9470da" lineWidth={1.5} dashed dashSize={6} gapSize={4}/></group><group ref={beamB} visible={false} name="railway-beam-b-overlay"><Line points={[[190,24,-48],[190,24,48]]} color="#9470da" lineWidth={1.5} dashed dashSize={6} gapSize={4}/></group></group></group><OrbitControls makeDefault enabled={!busy} minDistance={.02} maxDistance={60} maxPolarAngle={Math.PI-.01}/><Inspection {...{selected,name,anchor,focus,busy,view}} viewVersion={version}/></>;
}
export default memo(Scene);
