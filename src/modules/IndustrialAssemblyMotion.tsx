import {useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Object3D,Vector3} from 'three';
import {industrialAssemblyPose} from '../data/industrial-assembly';
/** Offsets use the root's native millimetres, independent of camera or scene scale. */
export default function IndustrialAssemblyMotion({progress}:{progress:number}){
 const {scene}=useThree(),bases=useRef(new WeakMap<Object3D,Vector3>());
 useFrame(()=>{
  const root=scene.getObjectByName('industrial-control-foundation');if(!root)return;
  root.updateWorldMatrix(true,true);
  const origin=root.localToWorld(new Vector3());
  root.traverse(o=>{
   const id=o.userData.partId;if(!id||!o.parent)return;
   let base=bases.current.get(o);if(!base){base=o.position.clone();bases.current.set(o,base);}
   const pose=industrialAssemblyPose(id,progress);
   o.visible=pose.visible;o.userData.assemblySettled=pose.settled;
   const displacement=root.localToWorld(new Vector3(...pose.offset)).sub(origin);
   const world=o.parent.localToWorld(base.clone()).add(displacement);
   o.position.copy(o.parent.worldToLocal(world));
  });
  root.updateWorldMatrix(true,true);root.userData.assemblyProgress=progress;
 },-.6);
 return null;
}
