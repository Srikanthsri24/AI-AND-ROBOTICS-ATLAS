import {memo} from 'react';
import type {ThreeEvent} from '@react-three/fiber';
import {streetSocketSpecs} from '../data/street-system-sockets';
function Sockets({selected,choose}:{selected:string;choose:(id:string)=>void}){
 return <group name="street-terminal-sockets">{streetSocketSpecs.map(s=>{const color=selected===s.id?'#b78be8':'#263847',metal=selected===s.id?'#b78be8':'#b9ad85',p=s.at;return <group key={s.id} name={s.id} userData={{partId:s.id}} position={p} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(s.id);}}>
 {[-1,1].map(side=><group key={side}><mesh position={[side*.8,-3,0]} castShadow><boxGeometry args={[.5,6,2.1]}/><meshStandardMaterial color={color} roughness={.6}/></mesh><mesh position={[0,-3,side*.8]} castShadow><boxGeometry args={[1.1,6,.5]}/><meshStandardMaterial color={color} roughness={.6}/></mesh><mesh name={s.id+'-spring-'+side} position={[side*.4,-3.25,0]}><boxGeometry args={[.2,4.5,.8]}/><meshStandardMaterial color={metal} metalness={.75} roughness={.35}/></mesh></group>)}
 <mesh position={[0,-5.75,0]}><boxGeometry args={[2.1,.5,2.1]}/><meshStandardMaterial color={color} roughness={.6}/></mesh><mesh name={s.id+'-crimp'} position={[0,-5.3,0]}><boxGeometry args={[.8,.4,.8]}/><meshStandardMaterial color={metal} metalness={.75} roughness={.35}/></mesh>
 </group>;})}</group>;
}
export default memo(Sockets);
