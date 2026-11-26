import {useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls,ContactShadows} from '@react-three/drei';
import {Box3,Vector3,type PerspectiveCamera} from 'three';
import Pump from '../../src/modules/SoapPumpParts';
import Studio from '../../src/modules/SchoolBellStudioLight';
import Label from '../../src/modules/CraneSurfaceLabel';
import {soapPumpParts} from '../../src/data/soap-dispenser-pump';
import {inspectCraneSurface} from '../../src/modules/crane-inspection';
import {floodSurfaceAnchor,type FloodAnchor} from '../../src/data/flood-surface';
function Scene(){const s=useThree(),anchor=useRef<FloodAnchor|null>(null),[selected,choose]=useState(''),[pose,setPose]=useState<{depression:number;flow:'idle'|'press'|'refill';fill:number;cutaway:boolean}>({depression:0,flow:'idle',fill:.8,cutaway:false});useFrame(()=>{Object.assign(window,{__soapPumpScene:s,__soapPumpSelected:selected,__soapPumpChoose:choose,__soapPumpSet:(p:Partial<typeof pose>)=>setPose(v=>({...v,...p})),__soapPumpPose:pose,__soapPumpAnchor:anchor,__soapPumpParts:soapPumpParts,__soapPumpFocus:(id:string)=>{s.scene.updateMatrixWorld(true);const part=s.scene.getObjectByName(id)!,box=new Box3().setFromObject(part,true),camera=s.camera as PerspectiveCamera,distance=Math.max(.04,box.getSize(new Vector3()).length()*2);camera.near=distance/200;camera.updateProjectionMatrix();anchor.current=inspectCraneSurface(s.scene.getObjectByName('soap-pump-bottle')!,camera,s.controls as any,id,box.getCenter(new Vector3()),distance,s.size.width,s.size.height);choose(id);return !!anchor.current;}});});return <><Studio/><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.2}/><directionalLight position={[-2,4,3]} intensity={2.5}/><group scale={.01} onPointerDown={e=>{anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}><Pump selected={selected} choose={choose} {...pose}/></group><ContactShadows position={[0,-.001,0]} opacity={.25} scale={5} blur={2} far={3} frames={1}/><Label selected={selected} anchor={anchor} name={soapPumpParts.find(p=>p.id===selected)?.label??''}/><OrbitControls makeDefault target={[0,1.15,.1]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[2,2.7,3.8],fov:40,near:.001,far:20}}><Scene/></Canvas>);return()=>root.unmount();}
