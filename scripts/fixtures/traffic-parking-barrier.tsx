import {useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Box3,Vector3,type PerspectiveCamera} from 'three';
import Barrier from '../../src/modules/TrafficParkingBarrierParts';
import Studio from '../../src/modules/SchoolBellStudioLight';
import Label from '../../src/modules/CraneSurfaceLabel';
import {inspectCraneSurface} from '../../src/modules/crane-inspection';
import {floodSurfaceAnchor,type FloodAnchor} from '../../src/data/flood-surface';
import {trafficParkingBarrierParts as parts} from '../../src/data/traffic-parking-barrier';
function Scene(){
 const[selected,choose]=useState(''),[angle,setAngle]=useState(20),[cutaway,setCutaway]=useState(false),anchor=useRef<FloodAnchor|null>(null),s=useThree();
 useFrame(()=>{Object.assign(window,{__tpBarrierScene:s,__tpBarrierSelected:selected,__tpBarrierChoose:choose,__tpBarrierAngle:setAngle,__tpBarrierCutaway:setCutaway,__tpBarrierParts:parts,__tpBarrierFocus:(id:string)=>{s.scene.updateMatrixWorld(true);const object=s.scene.getObjectByName(id)!,box=new Box3().setFromObject(object),camera=s.camera as PerspectiveCamera;camera.near=.00001;camera.updateProjectionMatrix();anchor.current=inspectCraneSurface(s.scene.getObjectByName('traffic-parking-barrier')!,camera,s.controls as any,id,box.getCenter(new Vector3()),Math.max(.045,box.getSize(new Vector3()).length()*2),s.size.width,s.size.height);choose(id);return !!anchor.current;}});});
 return <><Studio/><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.4}/><directionalLight position={[-2,4,3]} intensity={2.5}/><group scale={.01} onPointerDown={e=>{anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}}><Barrier selected={selected} choose={choose} angle={angle} cutaway={cutaway}/></group><Label selected={selected} anchor={anchor} name={parts.find(p=>p.id===selected)?.label??''}/><OrbitControls makeDefault target={[.25,0,0]}/></>;
}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[.8,.6,1],fov:40,near:.0001,far:20}}><Scene/></Canvas>);return()=>root.unmount();}
