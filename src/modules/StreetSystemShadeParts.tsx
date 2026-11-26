import type {ThreeEvent} from '@react-three/fiber';
import {streetShadePose,streetShadeGeometry as g} from '../data/street-system-shade';
export default function StreetSystemShadeParts({travel,selected,choose}:{travel:number;selected:string;choose:(id:string)=>void}){
 const p=streetShadePose(travel),color=selected==='street-shade'?'#aa7dd6':'#34465e';
 return <group name="street-shade" userData={{partId:'street-shade'}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose('street-shade');}}>
  <mesh name="street-shade-card" position={[p.x,p.y,p.z]} castShadow><boxGeometry args={[g.width,g.thickness,g.depth]}/><meshStandardMaterial color={color} roughness={.9}/></mesh>
  <mesh position={[p.x-g.width/2-9,p.y,p.z]} castShadow><boxGeometry args={[18,g.thickness,4]}/><meshStandardMaterial color={color} roughness={.9}/></mesh>
 </group>;
}
