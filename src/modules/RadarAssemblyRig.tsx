import {useLayoutEffect,useRef,type ReactNode,type RefObject} from 'react';
import {useFrame} from '@react-three/fiber';
import {Group,Matrix3,Matrix4,Object3D,Vector3} from 'three';
import {radarAssemblyPose} from '../data/radar-assembly';
type Entry={object:Object3D;id:string;position:Vector3;visible:boolean;posedPosition:Vector3;posedVisible:boolean};
const sets=new Set(['radar-bracket-nut-set','radar-bracket-screw-set','radar-sonar-nut-set','radar-sonar-screw-set']);
/** Pose real owner groups; nuts and screws approach from their actual accessible sides. */
export default function RadarAssemblyRig({progress,children,selected='',select=()=>{}}:{progress:RefObject<number>;children:ReactNode;selected?:string;select?:(id:string)=>void}){
 const root=useRef<Group>(null),entries=useRef<Entry[]>([]),last=useRef<number|null>(null),inverseRoot=new Matrix4(),relative=new Matrix4(),linear=new Matrix3(),delta=new Vector3();
 useLayoutEffect(()=>{entries.current=[];root.current!.traverse(object=>{const id=object.userData.partId??(sets.has(object.name)?object.name:null);if(typeof id!=='string')return;radarAssemblyPose(id,0);entries.current.push({object,id,position:object.position.clone(),visible:object.visible,posedPosition:object.position.clone(),posedVisible:object.visible});});return()=>{for(const e of entries.current){e.object.position.copy(e.position);e.object.visible=e.visible;}};},[]);
 useFrame(()=>{const p=progress.current,r=root.current;if(!r)return;if(p===last.current){for(const e of entries.current){e.object.position.copy(e.posedPosition);e.object.visible=e.posedVisible;}return;}
  r.updateWorldMatrix(true,true);inverseRoot.copy(r.matrixWorld).invert();for(const e of entries.current){const pose=radarAssemblyPose(e.id,p);relative.multiplyMatrices(inverseRoot,e.object.parent!.matrixWorld);linear.setFromMatrix4(relative).invert();delta.set(...pose.offset).applyMatrix3(linear);e.posedPosition.copy(e.position).add(delta);e.posedVisible=e.visible&&pose.visible;e.object.position.copy(e.posedPosition);e.object.visible=e.posedVisible;}r.updateWorldMatrix(true,true);r.userData.assemblyProgress=p;last.current=p;
 },-1);
 return <group ref={root} name="radar-assembly-rig">{children}<group name="radar-assembly-supports" userData={{partId:'radar-assembly-supports'}} onClick={e=>{e.stopPropagation();select('radar-assembly-supports');}}>{[-32,32].flatMap(x=>[-22,22].map(z=><mesh key={`${x}/${z}`} position={[x,15,z]} castShadow receiveShadow><boxGeometry args={[10,30,10]}/><meshStandardMaterial color={selected==='radar-assembly-supports'?'#b78be8':'#8495b4'} roughness={.7}/></mesh>))}</group></group>;
}
