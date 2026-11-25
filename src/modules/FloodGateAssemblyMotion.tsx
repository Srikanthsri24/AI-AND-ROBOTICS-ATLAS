import{useRef}from'react';
import{useFrame,useThree}from'@react-three/fiber';
import{Object3D,Vector3}from'three';
import{gateAssemblyPose}from'../data/flood-gate-assembly';
export default function FloodGateAssemblyMotion({progress}:{progress:number}){const{scene}=useThree(),last=useRef<{root:Object3D|null;progress:number}>({root:null,progress:NaN}),bases=useRef(new WeakMap<Object3D,Vector3>());
 useFrame(()=>{const root=scene.getObjectByName('flood-gate-mm');if(!root||last.current.root===root&&last.current.progress===progress)return;last.current={root,progress};root.updateWorldMatrix(true,true);root.traverse(o=>{const id=o.userData.partId;if(!id||!o.parent)return;let base=bases.current.get(o);if(!base){base=o.position.clone();bases.current.set(o,base);}const pose=gateAssemblyPose(id,progress);o.visible=pose.visible;o.userData.assemblySettled=pose.settled;const world=o.parent.localToWorld(base.clone()).add(new Vector3(...pose.offset).multiplyScalar(.02));o.position.copy(o.parent.worldToLocal(world));});root.updateWorldMatrix(true,true);},-.6);return null;
}
