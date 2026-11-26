import {useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Box3,Vector3,type PerspectiveCamera} from 'three';
import Supply from '../../src/modules/TrafficParkingSupplyParts';
import Studio from '../../src/modules/SchoolBellStudioLight';
import Label from '../../src/modules/CraneSurfaceLabel';
import {inspectCraneSurface} from '../../src/modules/crane-inspection';
import {floodSurfaceAnchor,type FloodAnchor} from '../../src/data/flood-surface';
import {trafficParkingSupplyParts as parts} from '../../src/data/traffic-parking-supply';
function Scene(){const[selected,choose]=useState(''),[output,setOutput]=useState({powered:false}),anchor=useRef<FloodAnchor|null>(null),s=useThree();useFrame(()=>{Object.assign(window,{__tpSupplyScene:s,__tpSupplySelected:selected,__tpSupplyChoose:choose,__tpSupplyOutput:setOutput,__tpSupplyParts:parts,__tpSupplyFocus:(id:string)=>{s.scene.updateMatrixWorld(true);const object=s.scene.getObjectByName(id)!,box=new Box3().setFromObject(object),camera=s.camera as PerspectiveCamera;camera.near=.00001;camera.updateProjectionMatrix();anchor.current=inspectCraneSurface(s.scene.getObjectByName('traffic-parking-supply')!,camera,s.controls as any,id,box.getCenter(new Vector3()),Math.max(.045,box.getSize(new Vector3()).length()*2),s.size.width,s.size.height);choose(id);return !!anchor.current;}});});return <><Studio/><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.4}/><directionalLight position={[-2,4,3]} intensity={2.5}/><group scale={.01} onPointerDown={e=>{anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}><Supply selected={selected} choose={choose} {...output}/></group><Label selected={selected} anchor={anchor} name={parts.find(p=>p.id===selected)?.label??''}/><OrbitControls makeDefault target={[1.35,.1,1.1]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[1.9,.9,2.2],fov:40,near:.0001,far:20}}><Scene/></Canvas>);return()=>root.unmount();}
