import {useRef,useEffect,useMemo,useCallback,type RefObject} from 'react';
import {useFrame,useThree,type ThreeEvent} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Group,Vector3,Matrix3,type Object3D} from 'three';
import Lamps from './StreetSystemLampParts';
import Electrical from './StreetSystemElectricalParts';
import Shade from './StreetSystemShadeParts';
import {WorldLabel} from './LabWorkbench';
import {floodOwner,floodSurfaceAnchor,floodAnchorWorld,floodVisible,type FloodAnchor} from '../data/flood-surface';
import {streetSystemAssemblyPose} from '../data/street-system-assembly';
import {streetSystemParts} from '../data/street-system-parts';

type Props={progress:number;selected:string;choose:(id:string)=>void;lamps:readonly(boolean|null)[];powered:boolean;cutaway:boolean;view:number;shade:number};
function Fit({version}:{version:number}){const{camera,controls,size}=useThree();useEffect(()=>{const c=controls as any;if(!c)return;const distance=size.width<600?8:6;camera.position.set(distance*.48,distance*.54,distance*.74);c.target.set(0,.5,0);c.update();},[version,size.width,size.height,camera,controls]);return null;}
function Motion({root,progress}:{root:RefObject<Group|null>;progress:number}){
 const originals=useRef(new Map<Object3D,Vector3>());
 useFrame(()=>{root.current?.updateWorldMatrix(true,true);root.current?.traverse(o=>{if(!o.userData.partId)return;let origin=originals.current.get(o);if(!origin){origin=o.position.clone();originals.current.set(o,origin);}const pose=streetSystemAssemblyPose(o.userData.partId,progress);o.visible=pose.visible;const delta=new Vector3(0,pose.lift*.01,0);if(o.parent)delta.applyMatrix3(new Matrix3().setFromMatrix4(o.parent.matrixWorld).invert());o.position.copy(origin).add(delta);});},-1);
 return null;
}
function Label({anchor,name}:{anchor:RefObject<FloodAnchor|null>;name:string}){
 const marker=useRef<Group>(null);useFrame(()=>{if(!marker.current)return;const a=anchor.current;marker.current.visible=!!a&&floodVisible(a.object);if(a)marker.current.position.copy(floodAnchorWorld(a));});
 return <group ref={marker}>{anchor.current&&<WorldLabel position={[0,0,0]} className="lw-part-label" keepInView avoidOverlap><span>{name}</span></WorldLabel>}</group>;
}
export default function StreetSystemWorkshopScene({progress,selected,choose,lamps,powered,cutaway,view,shade}:Props){
 const root=useRef<Group>(null),anchor=useRef<FloodAnchor|null>(null),pending=useRef<FloodAnchor|null>(null);
 const name=useMemo(()=>streetSystemParts.find(p=>p.id===selected)?.name??'', [selected]);
 const pick=useCallback((e:ThreeEvent<PointerEvent>)=>{if(floodOwner(e.object)){pending.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}},[]);
 const select=useCallback((id:string)=>{anchor.current=pending.current;pending.current=null;choose(id);},[choose]);
 const visibleLamps=useMemo(()=>progress===8?lamps:[false,false,false],[progress,lamps[0],lamps[1],lamps[2]]);
 useEffect(()=>{if(anchor.current&&floodOwner(anchor.current.object)!==selected)anchor.current=null;},[selected]);
 return <><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.1}/><directionalLight position={[-4,9,7]} intensity={2.4} castShadow/>
 <mesh position={[0,-.02,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[40,40]}/><meshStandardMaterial color="#e0e5ef" roughness={.9}/></mesh>
 <group ref={root} name="street-system-assembly" scale={.01} onPointerDown={pick}><Lamps selected={selected} choose={select} stage={8} lamps={visibleLamps} cutaway={cutaway}/><Electrical selected={selected} choose={select} stage={8} powered={progress===8&&powered}/><Shade travel={shade} selected={selected} choose={select}/></group>
 <Motion root={root} progress={progress}/><Label anchor={anchor} name={name}/><OrbitControls makeDefault minDistance={.1} maxDistance={20} maxPolarAngle={Math.PI*.49}/><Fit version={view}/>
 </>;
}
