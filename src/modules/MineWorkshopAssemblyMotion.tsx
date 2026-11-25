import { useRef } from 'react';
import { useFrame,useThree } from '@react-three/fiber';
import { Object3D,Vector3 } from 'three';
import { mineAssemblyPose } from '../data/mine-workshop-assembly';
export default function MineWorkshopAssemblyMotion({progress}:{progress:number}){const {scene}=useThree(),bases=useRef(new WeakMap<Object3D,Vector3>());useFrame(()=>{const root=scene.getObjectByName('mine-workshop-model');if(!root)return;root.updateWorldMatrix(true,true);root.traverse(o=>{const id=o.userData.partId;if(!id||!o.parent)return;let base=bases.current.get(o);if(!base){base=o.position.clone();bases.current.set(o,base);}const pose=mineAssemblyPose(id,progress);o.visible=pose.visible;o.userData.assemblySettled=pose.settled;const world=o.parent.localToWorld(base.clone()).add(new Vector3(...pose.offset));o.position.copy(o.parent.worldToLocal(world));});root.updateWorldMatrix(true,true);root.userData.assemblyProgress=progress;},-.6);return null;}
