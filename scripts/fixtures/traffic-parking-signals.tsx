import {useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Box3,Vector3,type PerspectiveCamera} from 'three';
import Signals from '../../src/modules/TrafficParkingSignalParts';
import Studio from '../../src/modules/SchoolBellStudioLight';
import Label from '../../src/modules/CraneSurfaceLabel';
import {inspectCraneSurface} from '../../src/modules/crane-inspection';
import {floodSurfaceAnchor,type FloodAnchor} from '../../src/data/flood-surface';
import {trafficParkingSignalParts as parts,type TrafficLampColor} from '../../src/data/traffic-parking-signals';
function Scene(){const[selected,choose]=useState(''),[output,setOutput]=useState<{main:TrafficLampColor|null;cross:TrafficLampColor|null;full:boolean}>({main:'Green',cross:'Red',full:false}),anchor=useRef<FloodAnchor|null>(null),s=useThree();useFrame(()=>{Object.assign(window,{__tpSignalsScene:s,__tpSignalsSelected:selected,__tpSignalsChoose:choose,__tpSignalsOutput:setOutput,__tpSignalsParts:parts,__tpSignalsFocus:(id:string)=>{s.scene.updateMatrixWorld(true);const object=s.scene.getObjectByName(id)!,box=new Box3().setFromObject(object),camera=s.camera as PerspectiveCamera;camera.near=.00001;camera.updateProjectionMatrix();anchor.current=inspectCraneSurface(s.scene.getObjectByName('traffic-parking-signals')!,camera,s.controls as any,id,box.getCenter(new Vector3()),Math.max(.045,box.getSize(new Vector3()).length()*2),s.size.width,s.size.height);choose(id);return !!anchor.current;}});});return <><Studio/><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.4}/><directionalLight position={[-2,4,3]} intensity={2.5}/><group scale={.01} onPointerDown={e=>{anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}><Signals selected={selected} choose={choose} {...output}/></group><Label selected={selected} anchor={anchor} name={parts.find(p=>p.id===selected)?.label??''}/><OrbitControls makeDefault target={[-.25,.35,-.3]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[2,2,3],fov:40,near:.0001,far:20}}><Scene/></Canvas>);return()=>root.unmount();}
