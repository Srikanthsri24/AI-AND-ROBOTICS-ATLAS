import {useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Box3,Vector3,type PerspectiveCamera} from 'three';
import Waves from '../../src/modules/SchoolBellSoundWaves';
import Piezo from '../../src/modules/SchoolBellPiezoParts';
import Resistor from '../../src/modules/SchoolBellResistorParts';
import Studio from '../../src/modules/SchoolBellStudioLight';
import Label from '../../src/modules/CraneSurfaceLabel';
import {schoolBellSounderParts as parts} from '../../src/data/school-bell-sounder';
import {inspectCraneSurface} from '../../src/modules/crane-inspection';
import {floodSurfaceAnchor,type FloodAnchor} from '../../src/data/flood-surface';
function Scene(){const[selected,choose]=useState(''),[open,setOpen]=useState(true),[pitch,setPitch]=useState(0),anchor=useRef<FloodAnchor|null>(null),s=useThree();useFrame(()=>{Object.assign(window,{__schoolSounderPitch:setPitch,__schoolSounderScene:s,__schoolSounderSelected:selected,__schoolSounderChoose:choose,__schoolSounderOpen:setOpen,__schoolSounderIsOpen:open,__schoolSounderParts:parts,__schoolSounderFocus:(id:string)=>{s.scene.updateMatrixWorld(true);const root=s.scene.getObjectByName('school-sounder-hardware')!,obj=s.scene.getObjectByName(id)!,box=new Box3().setFromObject(obj),camera=s.camera as PerspectiveCamera;camera.near=.00001;camera.updateProjectionMatrix();anchor.current=inspectCraneSurface(root,camera,s.controls as any,id,box.getCenter(new Vector3()),Math.max(.04,box.getSize(new Vector3()).length()*2),s.size.width,s.size.height);choose(id);return !!anchor.current;}});});return <><Studio/><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.4}/><directionalLight position={[-2,4,3]} intensity={2.5}/><group name="school-sounder-hardware" scale={.01} onPointerDown={e=>{anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}><Waves pitch={pitch}/><Piezo selected={selected} select={choose} open={open}/><Resistor selected={selected} choose={choose}/></group><Label anchor={anchor} selected={selected} name={parts.find(p=>p.id===selected)?.label??''}/><OrbitControls makeDefault target={[-.05,.2,0]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[.6,.65,.7],near:.0001,far:10,fov:42}}><Scene/></Canvas>);return()=>root.unmount();}
