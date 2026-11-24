import {useMemo} from 'react';
import {CatmullRomCurve3,Vector3} from 'three';
import {beaconTie} from './BeaconRoverDividers';
export default function BeaconRoverArrivalLed({on,selected,select}:{on:boolean;selected:string;select:(id:string)=>void}){
 const anode=beaconTie(6,1,3),cathode=beaconTie(7,1,3),x=(anode[0]+cathode[0])/2,z=anode[2],active=selected==='arrival-led';
 const curves=useMemo(()=>[anode,cathode].map((p,i)=>new CatmullRomCurve3([new Vector3(x+(i?.018:-.018),1.39,z),new Vector3(p[0],1.34,z),new Vector3(p[0],p[1]-(i?.09:.11),p[2])])),[]);
 return <group userData={{partId:'arrival-led'}} onClick={e=>{e.stopPropagation();select('arrival-led');}}>
 {curves.map((curve,i)=><mesh key={i} castShadow><tubeGeometry args={[curve,16,.005,8,false]}/><meshStandardMaterial color={active?'#d9b6ff':'#bbc1c6'} metalness={.85} roughness={.25}/></mesh>)}
 <mesh position={[x,1.445,z]} castShadow><cylinderGeometry args={[.05,.05,.09,32]}/><meshPhysicalMaterial color={active?'#b78be8':'#c91f2b'} roughness={.19} clearcoat={1} emissive='#ff2430' emissiveIntensity={on?2.1:0}/></mesh>
 <mesh position={[x,1.49,z]}><sphereGeometry args={[.05,32,16,0,Math.PI*2,0,Math.PI/2]}/><meshPhysicalMaterial color={active?'#b78be8':'#d0212d'} roughness={.15} clearcoat={1} emissive='#ff2430' emissiveIntensity={on?2.1:0}/></mesh>
 <mesh position={[x,1.397,z]} castShadow><cylinderGeometry args={[.055,.055,.012,32]}/><meshStandardMaterial color={active?'#b78be8':'#a51d28'} roughness={.25}/></mesh>
 <mesh position={[x+.049,1.399,z]}><boxGeometry args={[.003,.013,.044]}/><meshStandardMaterial color={active?'#d9b6ff':'#8b1722'}/></mesh>
 {on&&<pointLight position={[x,1.48,z]} color='#ff3a42' intensity={.025} distance={.5}/>}
 </group>;
}
