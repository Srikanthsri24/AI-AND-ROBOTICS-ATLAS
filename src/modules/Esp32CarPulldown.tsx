import {useMemo} from 'react';
import {CatmullRomCurve3,Vector3} from 'three';
import {espPulldownEnds as ends} from '../data/esp32-car-wiring';
export default function Esp32CarPulldown({selected,select}:{selected:string;select:(id:string)=>void}){
 const x=(ends[0][0]+ends[1][0])/2,y=ends[0][1]+.0625,z=ends[0][2],active=selected==='esp-pulldown';
 const curves=useMemo(()=>ends.map((p,i)=>{const side=i?1:-1;return new CatmullRomCurve3([new Vector3(x+side*.065,y,z),new Vector3(p[0]-side*.014,y,z),new Vector3(p[0],y-.014,z),new Vector3(p[0],p[1]-.11,z)],false,'centripetal');}),[]);
 return <group userData={{partId:'esp-pulldown'}} onClick={e=>{e.stopPropagation();select('esp-pulldown');}}><mesh position={[x,y,z]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.025,.025,.13,24]}/><meshStandardMaterial color={active?'#b78be8':'#bcaa83'} roughness={.5}/></mesh>{[['#68442f',-.044],['#292c2e',-.018],['#a54d41',.008],['#bba46d',.046]].map(([color,offset])=><mesh key={String(offset)} position={[x+Number(offset),y,z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.0256,.0256,.009,24]}/><meshStandardMaterial color={String(color)} roughness={.4}/></mesh>)}{curves.map((curve,i)=><mesh key={i} castShadow><tubeGeometry args={[curve,28,.006,8,false]}/><meshStandardMaterial color={active?'#b78be8':'#b5bcb7'} metalness={.75} roughness={.32}/></mesh>)}</group>;
}
