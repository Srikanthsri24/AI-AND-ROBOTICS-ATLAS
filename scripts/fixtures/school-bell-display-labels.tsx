import {useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Box3,Vector3,type PerspectiveCamera} from 'three';
import Display from '../../src/modules/SchoolBellDisplayParts';
import {schoolBellDisplayParts,schoolBellDisplayPart} from '../../src/data/school-bell-display-parts';
import {inspectCraneSurface} from '../../src/modules/crane-inspection';
import {floodSurfaceAnchor,type FloodAnchor} from '../../src/data/flood-surface';
import Label from '../../src/modules/CraneSurfaceLabel';
function Scene(){const[selected,choose]=useState(''),anchor=useRef<FloodAnchor|null>(null),s=useThree();useFrame(()=>{Object.assign(window,{__schoolDisplayLabels:s,__schoolDisplaySelected:selected,__schoolDisplayChoose:choose,__schoolDisplayPartIds:schoolBellDisplayParts.map(p=>p.id),__schoolDisplayFocus:(id:string)=>{const root=s.scene.getObjectByName('school-display-hardware')!;s.scene.updateMatrixWorld(true);const obj=s.scene.getObjectByName(id)!,box=new Box3().setFromObject(obj),centre=box.getCenter(new Vector3()),size=box.getSize(new Vector3()).length(),camera=s.camera as PerspectiveCamera;camera.near=.00001;camera.updateProjectionMatrix();anchor.current=inspectCraneSurface(root,camera,s.controls as any,id,centre,Math.max(.035,size*2),s.size.width,s.size.height);choose(id);return !!anchor.current;}});});return <><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.4}/><directionalLight position={[-2,4,3]} intensity={2.5}/><group scale={.01}><Display selected={selected} choose={choose} onPick={(_,e)=>{anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}} time="08:30" powered/></group><Label anchor={anchor} selected={selected} name={schoolBellDisplayPart(selected)?.label??''}/><OrbitControls makeDefault/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[.25,.4,.45],near:.0001,far:10,fov:42}}><Scene/></Canvas>);return()=>root.unmount();}
