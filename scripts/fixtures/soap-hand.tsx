import {useRef,useState,Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls,ContactShadows} from '@react-three/drei';
import {Box3,Vector3,type PerspectiveCamera} from 'three';
import Mechanism from '../../src/modules/SoapMechanismParts';
import Hand from '../../src/modules/SoapHandParts';
import {soapHandProbe} from '../../src/modules/soap-hand-probe';
import {soapHandParts} from '../../src/data/soap-dispenser-hand';
import Studio from '../../src/modules/SchoolBellStudioLight';
import Label from '../../src/modules/CraneSurfaceLabel';
import {inspectCraneSurface} from '../../src/modules/crane-inspection';
import {floodSurfaceAnchor,type FloodAnchor} from '../../src/data/flood-surface';
function Scene(){const s=useThree(),anchor=useRef<FloodAnchor|null>(null),[selected,choose]=useState(''),[position,setPosition]=useState<readonly[number,number,number]>([25,170,75]);useFrame(()=>{Object.assign(window,{__soapHandScene:s,__soapHandProbe:()=>soapHandProbe(s.scene.getObjectByName('soap-human-hand')!),__soapHandSelected:selected,__soapHandChoose:choose,__soapHandParts:soapHandParts,__soapHandPosition:position,__soapHandSet:setPosition,__soapHandAnchor:anchor,__soapHandFocus:(id:string)=>{s.scene.updateMatrixWorld(true);const part=s.scene.getObjectByName(id)!,box=new Box3().setFromObject(part,true),camera=s.camera as PerspectiveCamera,distance=Math.max(.1,box.getSize(new Vector3()).length()*2);camera.near=distance/200;camera.updateProjectionMatrix();anchor.current=inspectCraneSurface(s.scene.getObjectByName('soap-human-hand')!,camera,s.controls as any,id,box.getCenter(new Vector3()),distance,s.size.width,s.size.height);choose(id);}});});return <><Studio/><color attach='background' args={['#edf0f8']}/><ambientLight intensity={1.2}/><directionalLight position={[-2,4,3]} intensity={2.5}/><group scale={.01} onPointerDown={e=>{e.stopPropagation();anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}><Mechanism selected='' choose={()=>{}}/><Hand {...{selected,choose,position}}/></group><ContactShadows name='soap-hand-shadow' position={[-.8,-.061,0]} opacity={.25} scale={8} blur={2} far={3} frames={1}/><Label selected={selected} anchor={anchor} name={soapHandParts.find(p=>p.id===selected)?.label??''}/><OrbitControls makeDefault target={[.25,1.65,.75]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[2.5,3.8,4],fov:40,near:.001,far:20}}><Suspense fallback={null}><Scene/></Suspense></Canvas>);return()=>root.unmount();}
