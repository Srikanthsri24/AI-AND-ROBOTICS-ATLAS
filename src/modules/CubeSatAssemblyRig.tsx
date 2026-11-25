import {useLayoutEffect,useRef,type ReactNode,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {Group,Matrix3,Matrix4,Object3D,Vector3} from 'three';
import {cubeSatAssemblyPose,cubeSatAssemblyWindow} from '../data/cubesat-assembly';
type Entry={object:Object3D;position:Vector3;visible:boolean;id:string;posedPosition:Vector3;posedVisible:boolean};
/** Move the actual owner groups without rebuilding their geometry on animation frames. */
export default function CubeSatAssemblyRig({progress,children}:{progress:RefObject<number>;children:ReactNode}){
 const root=useRef<Group>(null),entries=useRef<Entry[]>([]),last=useRef<number|null>(null),inverseRoot=new Matrix4(),relative=new Matrix4(),linear=new Matrix3(),delta=new Vector3();
 useLayoutEffect(()=>{const group=root.current!;entries.current=[];group.traverse(object=>{const id=object.userData.partId;if(typeof id!=='string')return;cubeSatAssemblyWindow(id);entries.current.push({object,id,position:object.position.clone(),visible:object.visible,posedPosition:object.position.clone(),posedVisible:object.visible});});return()=>{for(const e of entries.current){e.object.position.copy(e.position);e.object.visible=e.visible;}};},[]);
 useFrame(()=>{const p=progress.current,group=root.current;if(!group)return;if(p===last.current){if(p<7.6)for(const e of entries.current){e.object.position.copy(e.posedPosition);e.object.visible=e.posedVisible;}return;}group.updateWorldMatrix(true,true);inverseRoot.copy(group.matrixWorld).invert();for(const e of entries.current){const pose=cubeSatAssemblyPose(e.id,p);relative.multiplyMatrices(inverseRoot,e.object.parent!.matrixWorld);linear.setFromMatrix4(relative).invert();delta.set(...pose.offset).applyMatrix3(linear);e.posedPosition.copy(e.position).add(delta);e.posedVisible=e.visible&&pose.visible;e.object.position.copy(e.posedPosition);e.object.visible=e.posedVisible;}group.updateWorldMatrix(true,true);group.userData.assemblyProgress=p;last.current=p;});
 return <group ref={root} name="cubesat-assembly-rig">{children}</group>;
}
