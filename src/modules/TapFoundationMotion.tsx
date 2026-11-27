import{useEffect,useRef}from'react';
import{useFrame,useThree}from'@react-three/fiber';
import{Vector3,type Object3D}from'three';
import{tapFoundationPose,tapFoundationSteps}from'../data/tap-foundation';
import{tapHarnessWires}from'../data/tap-harness';
/** Move the real authored part roots, keeping actual-surface labels attached. */
export default function TapFoundationMotion({cursor}:{cursor:number}){const{scene}=useThree(),originals=useRef(new Map<Object3D,{position:Vector3;visible:boolean}>());
 useEffect(()=>()=>{for(const[o,p]of originals.current){o.position.copy(p.position);o.visible=p.visible;}originals.current.clear();},[]);
 useFrame(()=>{const remember=(o:Object3D)=>{if(!originals.current.has(o))originals.current.set(o,{position:o.position.clone(),visible:o.visible});return originals.current.get(o)!;};for(const{step,progress}of tapFoundationPose(cursor)){const ease=progress*progress*(3-2*progress),direction:readonly[number,number,number]=step.parts.some(id=>id==='tap-sonar-board-assembly')?[0,-35,0]:step.parts.some(id=>id==='tap-peristaltic-pump')?[0,0,45]:step.parts.some(id=>id==='tap-level-sensor')?[0,0,25]:[0,45,0];for(const id of step.parts){const o=scene.getObjectByName(id);if(!o)continue;const p=remember(o);o.visible=progress>0&&p.visible;o.position.copy(p.position).addScaledVector(new Vector3(...direction),1-ease);}}
 for(const id of[...tapHarnessWires.map(w=>w.id),'tap-stemma-assembly','tap-driver-reference-header','tap-usb-hardware']){const o=scene.getObjectByName(id);if(o){const p=remember(o);o.visible=cursor===tapFoundationSteps.length&&p.visible;}}
 },-1);return null;}
