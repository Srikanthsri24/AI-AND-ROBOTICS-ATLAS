import type {} from '@react-three/fiber';
import { useMemo,type ReactNode } from 'react';
import { CatmullRomCurve3,Vector3 } from 'three';
import { industrialIndicators } from '../data/industrial-indicators';
export default function IndustrialIndicatorParts({selected='',select=()=>{},green=false,red=false,powered=false}:{selected?:string;select?:(id:string)=>void;green?:boolean;red?:boolean;powered?:boolean}){
 return <group name="industrial-indicator-circuit">{industrialIndicators.map(d=><Indicator key={d.key} {...{d,selected,select}} on={powered&&(d.key==='run'?green:red)}/>)}</group>;
}
function Indicator({d,selected,select,on}:{d:typeof industrialIndicators[number];selected:string;select:(id:string)=>void;on:boolean}){
 const id=(part:string)=>`industrial-${d.key}-${part}`,c=(part:string,color:string)=>selected===id(part)?'#b48bec':color,owner=(part:string,children:ReactNode)=><group key={part} userData={{partId:id(part)}} onClick={e=>{e.stopPropagation();select(id(part));}}>{children}</group>,cx=(d.resistorA[0]+d.resistorB[0])/2,lx=(d.anode[0]+d.cathode[0])/2,z=d.anode[2];
 const leads=useMemo(()=>{const a=d.resistorA,b=d.resistorB;return[[[a[0],5.5,a[2]],[a[0],12,a[2]],[a[0]+1,14,a[2]],[cx-3,14,a[2]]],[[cx+3,14,b[2]],[b[0]-1,14,b[2]],[b[0],12,b[2]],[b[0],5.5,b[2]]]].map(points=>new CatmullRomCurve3(points.map(p=>new Vector3(...p)),false,'centripetal'));},[d,cx]);
 return <>
 {owner('resistor-body',<group position={[cx,14,d.resistorA[2]]} rotation={[0,0,Math.PI/2]}><mesh><cylinderGeometry args={[1.2,1.2,6,32]}/><meshStandardMaterial color={c('resistor-body','#c6b08b')} roughness={.6}/></mesh>{[-1.8,-.8,.4,2].map((p,i)=><mesh key={p} position={[0,p,0]}><cylinderGeometry args={[1.215,1.215,.35,32]}/><meshStandardMaterial color={c('resistor-body',['#aa3c37','#aa3c37','#684830','#b6a46a'][i])} metalness={i===3?.6:0} roughness={.4}/></mesh>)}</group>)}
 {owner('resistor-leads',<>{leads.map((curve,i)=><mesh key={i}><tubeGeometry args={[curve,48,.24,10,false]}/><meshStandardMaterial color={c('resistor-leads','#bfc5c1')} metalness={.8} roughness={.3}/></mesh>)}</>)}
 {owner('led-lens',<group name={`industrial-${d.key}-live-lens`} position={[lx,0,z]}>{[0,1,2].map(n=><mesh key={n} position={[0,n===0?15.4:n===1?17.45:19.2,0]}>{n===2?<sphereGeometry args={[2.5,32,16,0,Math.PI*2,0,Math.PI/2]}/>:<cylinderGeometry args={[n===0?2.8:2.5,n===0?2.8:2.5,n===0?.6:3.5,32]}/>}<meshPhysicalMaterial color={c('led-lens',on?d.color:d.off)} transparent opacity={.78} roughness={.2} metalness={.05} clearcoat={1} emissive={on?d.emissive:'#000000'} emissiveIntensity={on?1.8:0}/></mesh>)}</group>)}
 {(['anode','cathode']as const).map(name=>{const p=d[name];return owner('led-'+name,<><mesh position={[p[0],11.8,p[2]]}><cylinderGeometry args={[.25,.25,12.6,16]}/><meshStandardMaterial color={c('led-'+name,'#bbc2bf')} metalness={.8} roughness={.28}/></mesh>{name==='cathode'?<mesh position={[lx+.7,18.2,z]}><cylinderGeometry args={[1.2,.6,1.5,24]}/><meshStandardMaterial color={c('led-'+name,'#b7bfbd')} metalness={.8} roughness={.25}/></mesh>:<mesh position={[p[0],18.2,z]}><boxGeometry args={[.5,1.4,.8]}/><meshStandardMaterial color={c('led-'+name,'#bec5bf')} metalness={.8} roughness={.28}/></mesh>}</>);})}
 </>;
}
