import{useMemo,type ReactNode}from'react';
import type{ThreeEvent}from'@react-three/fiber';
import{Path,Shape}from'three';
import{pickGripFrameClampX}from'../data/pick-gripper-frame-clamps';
const capOptions={depth:1.2,bevelEnabled:false,curveSegments:32};
/** Forked clamp jaws leave a real insertion slot around each upright. Native mm. */
export default function PickGripperFrameClamps({selected,choose}:{selected:string;choose:(id:string)=>void}){
 const cap=useMemo(()=>{const s=new Shape();for(const[i,[x,y]]of[[-5,-31],[5,-31],[5,-41],[-5,-41],[-5,-39.65],[1.65,-39.65],[1.65,-36.35],[-5,-36.35]].entries())i?s.lineTo(x,y):s.moveTo(x,y);s.closePath();const h=new Path();h.absarc(0,-34.3,1,0,Math.PI*2,true);s.holes.push(h);return s;},[]);
 const mat=(id:string)=>({color:selected===id?'#c4a2ff':'#a6b0bf',metalness:.7,roughness:.36}),tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 return <group name="pick-grip-frame-clamps">{pickGripFrameClampX.map((x,i)=>{const body=`pick-grip-frame-clamp-${i}-body`,screw=`pick-grip-frame-clamp-${i}-screw`;return <group key={i} position={[x,0,0]}>
 {tag(body,<><mesh position={[0,30,36]} castShadow><boxGeometry args={[10,1.2,10]}/><meshStandardMaterial {...mat(body)}/></mesh><mesh position={[0,36.9,40.4]} castShadow><boxGeometry args={[10,12.6,1.2]}/><meshStandardMaterial {...mat(body)}/></mesh><mesh position={[0,42,0]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[cap,capOptions]}/><meshStandardMaterial {...mat(body)}/></mesh></>)}
 {tag(screw,<><mesh position={[0,42.7,34.3]} castShadow><cylinderGeometry args={[.9,.9,3,24]}/><meshStandardMaterial {...mat(screw)}/></mesh><mesh position={[0,43.8,34.3]} castShadow><cylinderGeometry args={[2,2,1.2,6]}/><meshStandardMaterial {...mat(screw)}/></mesh></>)}
 </group>;})}</group>;
}
