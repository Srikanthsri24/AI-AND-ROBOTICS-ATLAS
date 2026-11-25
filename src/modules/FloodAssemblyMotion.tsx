import{useFrame,useThree}from'@react-three/fiber';
import{useRef}from'react';
import{Object3D,Vector3}from'three';
import{floodAssemblyPose}from'../data/flood-assembly';
/** Moves actual owner groups, including their real surfaces and connectors.
 * Parent transforms may contain the sensor rotation or the Uno's CAD scale.
 */
export default function FloodAssemblyMotion({progress}:{progress:number}){
 const{scene}=useThree(),last=useRef<{root:Object3D|null;progress:number}>({root:null,progress:NaN}),bases=useRef(new WeakMap<Object3D,Vector3>()),world=new Vector3(),shifted=new Vector3();
 useFrame(()=>{const root=scene.getObjectByName('flood-workshop-mm');if(!root)return;if(last.current.root===root&&last.current.progress===progress)return;last.current={root,progress};root.updateWorldMatrix(true,true);root.traverse(object=>{const id=object.userData.partId;if(!id||!object.parent)return;let base=bases.current.get(object);if(!base){base=object.position.clone();bases.current.set(object,base);}const pose=floodAssemblyPose(id,progress);object.visible=pose.visible;object.userData.assemblySettled=pose.settled;world.copy(base);object.parent.localToWorld(world);shifted.copy(world).add(new Vector3(...pose.offset).multiplyScalar(.02));object.parent.worldToLocal(shifted);object.position.copy(shifted);});root.updateWorldMatrix(true,true);},-.6);
 return null;
}
