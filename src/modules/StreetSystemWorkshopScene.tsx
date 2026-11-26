import {useRef,useEffect,useMemo,useCallback,type RefObject} from 'react';
import {useFrame,type ThreeEvent} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Group,Vector3,Matrix3,type Object3D} from 'three';
import Lamps from './StreetSystemLampParts';
import Electrical from './StreetSystemElectricalParts';
import Shade from './StreetSystemShadeParts';
import Inspection from './StreetSystemWorkshopInspection';
import {floodOwner,floodSurfaceAnchor,type FloodAnchor} from '../data/flood-surface';
import {streetSystemAssemblyPose} from '../data/street-system-assembly';
import {streetSystemParts} from '../data/street-system-parts';

type Props={progress:number;selected:string;choose:(id:string)=>void;lamps:readonly(boolean|null)[];powered:boolean;cutaway:boolean;view:number;shade:number;focus:number};
function Motion({root,progress}:{root:RefObject<Group|null>;progress:number}){
 const originals=useRef(new Map<Object3D,Vector3>());
 useFrame(()=>{if(root.current)root.current.userData.assemblyProgress=progress;root.current?.updateWorldMatrix(true,true);root.current?.traverse(o=>{if(!o.userData.partId)return;let origin=originals.current.get(o);if(!origin){origin=o.position.clone();originals.current.set(o,origin);}const pose=streetSystemAssemblyPose(o.userData.partId,progress);o.visible=pose.visible;const delta=new Vector3(0,pose.lift*.01,0);if(o.parent)delta.applyMatrix3(new Matrix3().setFromMatrix4(o.parent.matrixWorld).invert());o.position.copy(origin).add(delta);});},-1);
 return null;
}
export default function StreetSystemWorkshopScene({progress,selected,choose,lamps,powered,cutaway,view,shade,focus}:Props){
 const root=useRef<Group>(null),anchor=useRef<FloodAnchor|null>(null),pending=useRef<FloodAnchor|null>(null);
 const name=useMemo(()=>streetSystemParts.find(p=>p.id===selected)?.name??'', [selected]);
 const pick=useCallback((e:ThreeEvent<PointerEvent>)=>{if(floodOwner(e.object)){e.stopPropagation();pending.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}},[]);
 const select=useCallback((id:string)=>{anchor.current=pending.current;pending.current=null;choose(id);},[choose]);
 const visibleLamps=useMemo(()=>progress===8?lamps:[false,false,false],[progress,lamps[0],lamps[1],lamps[2]]);
 useEffect(()=>{if(anchor.current&&floodOwner(anchor.current.object)!==selected)anchor.current=null;},[selected]);
 return <><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.1}/><directionalLight position={[-4,9,7]} intensity={2.4} castShadow/>
 <mesh position={[0,-.02,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[40,40]}/><meshStandardMaterial color="#e0e5ef" roughness={.9}/></mesh>
 <group ref={root} name="street-system-assembly" scale={.01} onPointerDown={pick}><Lamps selected={selected} choose={select} stage={8} lamps={visibleLamps} cutaway={cutaway}/><Electrical selected={selected} choose={select} stage={8} powered={progress===8&&powered}/><Shade travel={shade} selected={selected} choose={select}/></group>
 <Motion root={root} progress={progress}/><OrbitControls makeDefault minDistance={.1} maxDistance={20} maxPolarAngle={Math.PI*.49}/><Inspection selected={selected} name={name} anchor={anchor} focus={focus} busy={false} view="bench" viewVersion={view+Math.ceil(progress)*100000}/>
 </>;
}
