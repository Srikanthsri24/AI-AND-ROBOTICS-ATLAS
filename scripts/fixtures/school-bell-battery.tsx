import {useRef,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Box3,Vector3,type PerspectiveCamera} from 'three';
import {inspectCraneSurface} from '../../src/modules/crane-inspection';
import Studio from '../../src/modules/SchoolBellStudioLight';
import Rtc from '../../src/modules/SchoolBellRtcParts';
function Scene(){const[selected,choose]=useState(''),[insertion,setInsertion]=useState(1),s=useThree();const current=useRef(insertion);current.current=insertion;useFrame(()=>{Object.assign(window,{__schoolBatteryFocus:(id:string)=>{s.scene.updateMatrixWorld(true);const obj=s.scene.getObjectByName(id)!,box=new Box3().setFromObject(obj),camera=s.camera as PerspectiveCamera;camera.near=.00001;camera.updateProjectionMatrix();const a=inspectCraneSurface(s.scene.getObjectByName('school-rtc-hardware')!,camera,s.controls as any,id,box.getCenter(new Vector3()),Math.max(.035,box.getSize(new Vector3()).length()*2),s.size.width,s.size.height);return a?{point:a.object.localToWorld(a.point.clone()).project(camera).toArray()}:null;},__schoolBatteryChoose:choose,__schoolBatteryScene:s,__schoolBatterySelected:selected,__schoolBatteryInsert:setInsertion,__schoolBatteryInsertion:current.current});});return <><Studio/><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.4}/><directionalLight position={[-2,-4,3]} intensity={2.5}/><group scale={.01}><Rtc selected={selected} choose={choose} batteryInsertion={insertion}/></group><OrbitControls makeDefault target={[.1143,-.015,-.10668]}/></>;}
export function mount(el:HTMLElement){const root=createRoot(el);root.render(<Canvas camera={{position:[.3,-.45,.1],near:.0001,far:10,fov:42}}><Scene/></Canvas>);return()=>root.unmount();}
