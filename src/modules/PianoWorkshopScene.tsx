import {useCallback,useEffect,useRef,type RefObject} from 'react';
import {useFrame,useThree,type ThreeEvent} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {Group,Matrix3,Vector3,type Object3D} from 'three';
import Bench from './PianoBenchParts';
import Sounder from './PianoSounderParts';
import Keyboard from './PianoKeyboardParts';
import Wires from './PianoWireParts';
import Usb from './PianoUsbParts';
import Inspection from './PianoWorkshopInspection';
import {pianoAssemblyCursor,pianoAssemblyPose} from '../data/piano-assembly';
import {pianoHardwareParts} from '../data/piano-hardware-parts';
import {floodOwner,floodSurfaceAnchor,type FloodAnchor} from '../data/flood-surface';
import type {PianoFlags} from '../data/piano-workshop';
import type {PianoUsbMotion} from '../data/piano-usb';
function Motion({root,progress}:{root:RefObject<Group|null>;progress:RefObject<number>}){const originals=useRef(new Map<Object3D,Vector3>());useFrame(()=>{const p=progress.current;if(!root.current)return;root.current.userData.assemblyProgress=p;root.current.updateWorldMatrix(true,true);root.current.traverse(o=>{if(!o.userData.partId)return;let at=originals.current.get(o);if(!at){at=o.position.clone();originals.current.set(o,at);}const pose=pianoAssemblyPose(o.userData.partId,p);o.visible=pose.visible;const delta=new Vector3(pose.shiftX*.01,pose.lift*.01,0);if(o.parent)delta.applyMatrix3(new Matrix3().setFromMatrix4(o.parent.matrixWorld).invert());o.position.copy(at).add(delta);});for(let i=0;i<8;i++){const module=root.current.getObjectByName(`piano-key-${i}-module`);if(module)module.visible=pianoAssemblyPose(`piano-key-${i}-body`,p).visible;}},-1);return null;}
type Props={progress:number;buildProgress:RefObject<number>;busy:boolean;selected:string;choose:(id:string)=>void;focus:number;view:number;mode:'bench'|'keys'|'sounder';held:PianoFlags;press:(index:number,down:boolean,pointerId?:number)=>void;powered:boolean;sounding:boolean;rows:readonly string[];usb:RefObject<PianoUsbMotion>;withdrawals:RefObject<readonly number[]>};
export default function PianoWorkshopScene({progress,buildProgress,busy,selected,choose,focus,view,mode,held,press,powered,sounding,rows,usb,withdrawals}:Props){const root=useRef<Group>(null),anchor=useRef<FloodAnchor|null>(null),pending=useRef<FloodAnchor|null>(null),cursor=useRef(0),controls=useThree(s=>s.controls);useFrame(()=>{cursor.current=pianoAssemblyCursor(buildProgress.current);},-3);
 const pick=useCallback((e:ThreeEvent<PointerEvent>)=>{if(busy)return;if(floodOwner(e.object)){e.stopPropagation();pending.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);}},[busy]);
 const select=useCallback((id:string)=>{if(busy)return;if(pending.current){anchor.current=pending.current;pending.current=null;}else if(anchor.current&&floodOwner(anchor.current.object)!==id)anchor.current=null;choose(id);},[busy,choose]);
 const keyPress=useCallback((index:number,down:boolean,pointerId?:number)=>{if(down&&controls)(controls as any).enabled=false;press(index,down,pointerId);},[controls,press]);
 useEffect(()=>{if(anchor.current&&floodOwner(anchor.current.object)!==selected)anchor.current=null;},[selected]);
 const name=pianoHardwareParts.find(p=>p.id===selected)?.name??'';
 return <><color attach="background" args={['#edf0f8']}/><ambientLight intensity={1.2}/><directionalLight position={[-4,9,7]} intensity={2.5} castShadow/><mesh position={[0,-.02,0]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[40,40]}/><meshStandardMaterial color="#e0e5ef" roughness={.9}/></mesh>
 <group ref={root} name="piano-assembly" scale={.01} onPointerDown={pick}><Bench {...{selected,choose:select,powered}}/><Sounder {...{selected,choose:select,sounding}}/><Keyboard {...{selected,choose:select,held}} surface={pick} press={keyPress}/><Wires {...{selected,choose:select,cursor}} withdrawalsRef={withdrawals}/><Usb {...{selected,choose:select,powered,rows}} motion={usb}/></group>
 <Motion root={root} progress={buildProgress}/><OrbitControls makeDefault enabled={!busy&&!held.some(Boolean)} minDistance={.08} maxDistance={20} maxPolarAngle={Math.PI*.49}/><Inspection {...{selected,name,anchor,focus,busy}} view={mode} viewVersion={view+Math.ceil(progress)*100000}/></>;
}
