import{useRef}from'react';
import{useFrame,useThree}from'@react-three/fiber';
import type{Object3D}from'three';
import{aquaInspectionHidden,type AquaInspectionMode}from'../data/aquaclean-inspection';
import{aquaAssemblyPose}from'../data/aquaclean-assembly';
export default function AquacleanInspectionLayers({mode,assembly}:{mode:AquaInspectionMode;assembly:number}){const{scene}=useThree(),last=useRef<{root:Object3D|null;mode:AquaInspectionMode;assembly:number}>({root:null,mode:'none',assembly:NaN});useFrame(()=>{const root=scene.getObjectByName('aquaclean-mm');if(!root||last.current.root===root&&last.current.mode===mode&&last.current.assembly===assembly)return;last.current={root,mode,assembly};root.traverse(o=>{const id=o.userData.partId;if(id)o.visible=aquaAssemblyPose(id,assembly).visible&&!aquaInspectionHidden(id,mode);});},-.3);return null;}
