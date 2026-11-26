import {useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Box3,Vector3,type PerspectiveCamera} from 'three';
import Workbench from '../../src/modules/TrafficParkingWorkbenchParts';
import type {TrafficLampColor} from '../../src/data/traffic-parking-signals';
import Studio from '../../src/modules/SchoolBellStudioLight';
import Label from '../../src/modules/CraneSurfaceLabel';
import {inspectCraneSurface} from '../../src/modules/crane-inspection';
import {floodSurfaceAnchor,type FloodAnchor} from '../../src/data/flood-surface';
import {trafficParkingHardwareParts as parts} from '../../src/data/traffic-parking-workbench';
function Scene(){
 const[selected,choose]=useState(''),[output,setOutput]=useState<{main:TrafficLampColor|null;cross:TrafficLampColor|null;full:boolean;angle:number;powered:boolean;servoPower:boolean;entry:boolean;exit:boolean}>({main:'Green',cross:'Red',full:false,angle:20,powered:true,servoPower:true,entry:false,exit:false}),[cutaway,setCutaway]=useState(false),[cursor,setCursor]=useState(66),anchor=useRef<FloodAnchor|null>(null),s=useThree();
 useFrame(()=>{Object.assign(window,{__tpBenchScene:s,__tpBenchSelected:selected,__tpBenchChoose:choose,__tpBenchOutput:setOutput,__tpBenchCutaway:setCutaway,__tpBenchFitting:setCursor,__tpBenchFittingCursor:cursor,__tpBenchAnchor:anchor,__tpBenchParts:parts,__tpBenchFocus:(id:string)=>{s.scene.updateMatrixWorld(true);const object=s.scene.getObjectByName(id)!,box=new Box3().setFromObject(object),camera=s.camera as PerspectiveCamera,distance=Math.max(.045,box.getSize(new Vector3()).length()*2);camera.near=distance/100;camera.updateProjectionMatrix();anchor.current=inspectCraneSurface(s.scene.getObjectByName('traffic-parking-workbench')!,camera,s.controls as any,id,box.getCenter(new Vector3()),distance,s.size.width,s.size.height);choose(id);return !!anchor.current;}});});
 return <><Studio/><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.4}/><directionalLight position={[-2,4,3]} intensity={2.5}/><group scale={.01} onPointerDown={e=>{anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}><Workbench selected={selected} choose={choose} {...output} cutaway={cutaway} fittingCursor={cursor}/></group><Label selected={selected} anchor={anchor} name={parts.find(p=>p.id===selected)?.label??''}/><OrbitControls makeDefault target={[0,.2,0]}/></>;
}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[3,3.5,4.5],fov:40,near:.02,far:20}}><Scene/></Canvas>);return()=>root.unmount();}
