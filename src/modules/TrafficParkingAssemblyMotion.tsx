import {useRef,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {Vector3,type Group,type Object3D} from 'three';
import {trafficParkingAssemblyObjects,trafficParkingAssemblyPose,trafficParkingAssemblyReady,trafficParkingHornPose} from '../data/traffic-parking-assembly';
const ids=new Set(trafficParkingAssemblyObjects.map(o=>o.id));
export default function TrafficParkingAssemblyMotion({root,progress,horn,angle}:{root:RefObject<Group|null>;progress:number;horn:number;angle:number}){
 const bases=useRef(new WeakMap<Object3D,{position:Vector3;rotation:number}>());
 useFrame(()=>{const ready=trafficParkingAssemblyReady(progress);root.current?.traverse(object=>{const h=object.name==='tp-gate-horn'||object.name==='tp-horn-screw';if(object.name==='traffic-parking-jumpers'){object.visible=ready;return;}if(!h&&!ids.has(object.name))return;let base=bases.current.get(object);if(!base){base={position:object.position.clone(),rotation:object.rotation.z};bases.current.set(object,base);}const pose=h?trafficParkingHornPose(object.name,ready?horn:0,angle):trafficParkingAssemblyPose(object.name,progress);object.visible=pose.visible;object.position.copy(base.position).add(new Vector3(...pose.offset));if(h)object.rotation.z=base.rotation+('rotation' in pose?pose.rotation as number:0);});},-3);
 return null;
}
