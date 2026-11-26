import {useRef,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import type {Group,Object3D} from 'three';
import {rainAssemblyGroups,rainAssemblyPose} from '../data/rain-assembly';
/** Applies local-mm fitting offsets, including every repeated support / peg group. */
export default function RainAssemblyMotion({root,progress}:{root:RefObject<Group|null>;progress:number}){
 const bases=useRef(new WeakMap<Object3D,number>());
 useFrame(()=>{root.current?.traverse(object=>{if(!rainAssemblyGroups.includes(object.name))return;let base=bases.current.get(object);if(base===undefined){base=object.position.y;bases.current.set(object,base);}const pose=rainAssemblyPose(object.name,progress);object.visible=pose.visible;object.position.y=base+pose.lift;});},-3);
 return null;
}
