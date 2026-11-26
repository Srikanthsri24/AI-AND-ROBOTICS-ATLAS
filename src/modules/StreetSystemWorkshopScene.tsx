import {useRef,useEffect,useMemo,useCallback,type RefObject} from 'react';
import {useFrame,type ThreeEvent} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Group,Vector3,Matrix3,type Object3D} from 'three';
import Fasteners from './StreetSystemFasteners';
import Sockets from './StreetSystemSocketParts';
import Lamps from './StreetSystemLampParts';
import Usb from './StreetSystemUsbParts';
import Electrical from './StreetSystemElectricalParts';
import type {StreetUsbMotion} from '../data/street-system-usb';
import type {StreetSystemSettings} from '../data/street-system-workshop';
import Shade from './StreetSystemShadeParts';
import Inspection from './StreetSystemWorkshopInspection';
import {floodOwner,floodSurfaceAnchor,type FloodAnchor} from '../data/flood-surface';
import {streetActiveFastener,streetFootFastenerPose} from '../data/street-system-fasteners';
import {streetSystemAssemblyPose} from '../data/street-system-assembly';
import {streetSystemParts} from '../data/street-system-parts';

type Props={busy:boolean;progress:number;selected:string;choose:(id:string)=>void;lamps:readonly(boolean|null)[];powered:boolean;cutaway:boolean;view:number;shade:number;focus:number;links:StreetSystemSettings;rows:readonly string[];usbMotion:RefObject<StreetUsbMotion>};
function Motion({root,progress}:{root:RefObject<Group|null>;progress:number}){
 const originals=useRef(new Map<Object3D,Vector3>());
 useFrame(()=>{if(root.current)root.current.userData.assemblyProgress=progress;root.current?.updateWorldMatrix(true,true);root.current?.traverse(o=>{if(!o.userData.partId)return;let origin=originals.current.get(o);if(!origin){origin=o.position.clone();originals.current.set(o,origin);}const pose=streetSystemAssemblyPose(o.userData.partId,progress);o.visible=pose.visible;const delta=new Vector3(0,pose.lift*.01,(pose.shiftZ??0)*.01);if(o.parent)delta.applyMatrix3(new Matrix3().setFromMatrix4(o.parent.matrixWorld).invert());o.position.copy(origin).add(delta);});},-1);
 return null;
}
export default function StreetSystemWorkshopScene({progress,selected,choose,lamps,powered,cutaway,view,shade,focus,links,rows,usbMotion,busy}:Props){
 const assembly=useRef(progress);assembly.current=progress;
 const root=useRef<Group>(null),anchor=useRef<FloodAnchor|null>(null),pending=useRef<FloodAnchor|null>(null);
 const fastener=streetActiveFastener(progress),fastenerPose=fastener?streetFootFastenerPose(fastener.index,progress):null,fastenerVisible=fastener&&fastenerPose&&(fastener.part==='washer'?fastenerPose.washerVisible:fastenerPose.screwVisible);
 const focusRootName=fastenerVisible&&fastener&&selected===`street-lamp-${fastener.lamp+1}-bolts`?`street-${fastener.part}-${fastener.index}`:undefined;
 const name=useMemo(()=>focusRootName&&fastener?`Lamp ${fastener.lamp+1} · ${fastener.part} ${fastener.index%4+1}`:streetSystemParts.find(p=>p.id===selected)?.name??'', [selected,focusRootName,fastener?.index,fastener?.part]);
 const pick=useCallback((e:ThreeEvent<PointerEvent>)=>{if(busy)return;if(floodOwner(e.object)){e.stopPropagation();pending.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}},[busy]);
 const select=useCallback((id:string)=>{if(busy)return;anchor.current=pending.current;pending.current=null;choose(id);},[choose,busy]);
 const electricalLinks=useMemo(()=>({sensorConnected:links.sensorConnected,outputs:links.outputs,returns:links.returns}),[links.sensorConnected,links.outputs[0],links.outputs[1],links.outputs[2],links.returns[0],links.returns[1],links.returns[2]]);
 const visibleLamps=useMemo(()=>progress===8?lamps:[false,false,false],[progress===8,lamps[0],lamps[1],lamps[2]]);
 useEffect(()=>{if(anchor.current&&floodOwner(anchor.current.object)!==selected)anchor.current=null;},[selected]);
 return <><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.1}/><directionalLight position={[-4,9,7]} intensity={2.4} castShadow/>
 <mesh position={[0,-.02,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[40,40]}/><meshStandardMaterial color="#e0e5ef" roughness={.9}/></mesh>
 <group ref={root} name="street-system-assembly" scale={.01} onPointerDown={pick}><Lamps selected={selected} choose={select} stage={8} lamps={visibleLamps} cutaway={cutaway}/><Electrical selected={selected} choose={select} stage={8} powered={progress===8&&powered} links={electricalLinks} progress={assembly}/><Fasteners selected={selected} choose={select} progress={assembly}/><Sockets selected={selected} choose={select}/><Shade travel={shade} selected={selected} choose={select}/><Usb selected={selected} choose={select} powered={progress===8&&powered} rows={rows} motion={usbMotion}/></group>
 <Motion root={root} progress={progress}/><OrbitControls makeDefault enabled={!busy} minDistance={.1} maxDistance={20} maxPolarAngle={Math.PI*.49}/><Inspection selected={selected} name={name} anchor={anchor} focus={focus} busy={busy} focusRootName={focusRootName} view="bench" viewVersion={view+Math.ceil(progress)*100000}/>
 </>;
}
