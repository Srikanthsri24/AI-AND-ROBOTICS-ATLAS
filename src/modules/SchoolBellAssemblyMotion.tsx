import {useRef,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {Vector3,type Group,type Object3D} from 'three';
import {schoolBellAssemblyObjects,schoolBellAssemblyPose} from '../data/school-bell-assembly';
const ids=new Set(schoolBellAssemblyObjects.map(o=>o.id));
export default function SchoolBellAssemblyMotion({root,progress}:{root:RefObject<Group|null>;progress:number}){const bases=useRef(new WeakMap<Object3D,Vector3>());useFrame(()=>{root.current?.traverse(object=>{if(!ids.has(object.name))return;let base=bases.current.get(object);if(!base){base=object.position.clone();bases.current.set(object,base);}const pose=schoolBellAssemblyPose(object.name,progress);object.visible=pose.visible;object.position.copy(base).add(new Vector3(...pose.offset));});},-3);return null;}
