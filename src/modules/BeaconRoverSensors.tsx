import {useMemo} from 'react';
import {CatmullRomCurve3,Path,Shape,Vector3} from 'three';
import {Mount} from './RoverWorkshopModel';
import {beaconOpticalHardware as d} from '../data/beacon-rover-optics';
import {beaconCellLeadPoints} from '../data/beacon-rover-layout';
const violet='#b78be8';
export const beaconSensorParts=[
 ['left-cds','Left CdS sensing face','Light lowers this photoresistor’s resistance. Its outer lead connects to 5 V; its inner lead connects to A0 and the left 10 kΩ resistor to GND.'],
 ['right-cds','Right CdS sensing face','This independent light-dependent resistor connects to 5 V and the A1 divider. Comparing A0 and A1 tells the program which side receives more light.'],
 ['left-hood','Left opaque paper sleeve','The hollow sleeve rejects light arriving far from the left sensing direction. Its open mouth admits the flashlight beam; it has no electrical connection.'],
 ['right-hood','Right opaque paper sleeve','This separate hood limits the right sensor’s field of view. Both sensing faces must see strong light before the arrival LED is latched on.'],
 ['sensor-brackets','Sensor mounting brackets','Two screwed bases hold the sensing faces above the front corners. Their four fixing screws pass through matching holes in the chassis.'],
] as const;
function Annulus({inner,outer,length,color}:{inner:number;outer:number;length:number;color:string}){
 const shape=useMemo(()=>{const s=new Shape();s.absarc(0,0,outer,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(h);return s;},[inner,outer]);
 return <mesh castShadow receiveShadow><extrudeGeometry args={[shape,{depth:length,bevelEnabled:false,curveSegments:48}]}/><meshStandardMaterial color={color} roughness={.91}/></mesh>;
}
function Lead({index,side,selected}:{index:0|1;side:-1|1;selected:boolean}){const curve=useMemo(()=>new CatmullRomCurve3(beaconCellLeadPoints(index,side).map(p=>new Vector3(...p))),[index,side]);return <mesh castShadow><tubeGeometry args={[curve,20,.005,8,false]}/><meshStandardMaterial color={selected?violet:'#b9bec3'} metalness={.88} roughness={.28}/></mesh>;}
function Base({index,selected}:{index:0|1;selected:boolean}){
 const shape=useMemo(()=>{const s=new Shape();s.moveTo(-.17,-.11);s.lineTo(.17,-.11);s.lineTo(.17,.11);s.lineTo(-.17,.11);s.closePath();for(const x of [-.11,.11]){const h=new Path();h.absarc(x,0,.023,0,Math.PI*2,true);s.holes.push(h);}return s;},[]);
 const c=selected?violet:'#45434f',y=d.sensors[index].at[1];return <>
 <mesh position={[0,.99-y,0]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[shape,{depth:.04,bevelEnabled:false}]}/><meshStandardMaterial color={c} roughness={.6}/></mesh>
 <mesh position={[0,1.127-y,-.02]} castShadow><boxGeometry args={[.045,.194,.07]}/><meshStandardMaterial color={c} roughness={.6}/></mesh>
 <group position={[0,0,-.035]}><Annulus inner={.108} outer={.116} length={.03} color={c}/></group>
 {[-.11,.11].map(x=><Mount key={x} from={[0,.35,0]} delay={2.3}><group position={[x,0,0]}><mesh position={[0,.97-y,0]} castShadow><cylinderGeometry args={[.019,.019,.12,16]}/><meshStandardMaterial color='#aeb4bb' metalness={.85} roughness={.3}/></mesh><mesh position={[0,1.0475-y,0]} castShadow><cylinderGeometry args={[.048,.048,.035,24]}/><meshStandardMaterial color={selected?violet:'#bfc6cc'} metalness={.8} roughness={.3}/></mesh>{[0,Math.PI/2].map(a=><mesh key={a} position={[0,1.066-y,0]} rotation={[0,a,0]}><boxGeometry args={[.052,.003,.009]}/><meshStandardMaterial color='#474b55'/></mesh>)}</group></Mount>)}
 </>;
}
/** Separate, hollow optical modules. The electrodes are isolated combs, never one shorted zigzag. */
export default function BeaconRoverSensors({stage,selected,select}:{stage:number;selected:string;select:(id:string)=>void}){
 return <>{d.sensors.map((s,index)=>{const i=index as 0|1,id=`${s.id}-cds`,hood=`${s.id}-hood`,active=selected===id;return <group key={s.id} position={s.at} rotation={[0,s.yaw,0]}>
 {stage>=6&&<group userData={{partId:'sensor-brackets'}} onClick={e=>{e.stopPropagation();select('sensor-brackets');}}><Mount from={[0,.55,0]}><Base index={i} selected={selected==='sensor-brackets'}/></Mount></group>}
 {stage>=7&&<group userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}><Mount from={[0,.1,-.45]}>
 <mesh rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[d.cellRadius,d.cellRadius,.024,48]}/><meshStandardMaterial color={active?violet:'#c49a55'} roughness={.63}/></mesh>
 {[-1,1].map(side=><group key={side}><mesh position={[side*.039,0,-.0135]}><boxGeometry args={[.004,.073,.002]}/><meshStandardMaterial color={active?'#eedcff':'#72634b'} metalness={.5}/></mesh>{[-.030,-.006,.018].map(y=><mesh key={y} position={[side*-.008,y+(side>0?.012:0),-.0135]}><boxGeometry args={[.058,.004,.002]}/><meshStandardMaterial color={active?'#eedcff':'#72634b'} metalness={.5}/></mesh>)}<Lead index={i} side={side as -1|1} selected={active}/></group>)}
 <mesh position={[0,0,-.0148]} scale={[1,1,.10]}><sphereGeometry args={[d.cellRadius,32,16]}/><meshPhysicalMaterial color={active?violet:'#e7b45b'} transparent opacity={.16} roughness={.2} clearcoat={1} depthWrite={false}/></mesh>
 </Mount></group>}
 {stage>=8&&<group userData={{partId:hood}} onClick={e=>{e.stopPropagation();select(hood);}}><Mount from={[0,0,-.5]}><group position={[0,0,-d.hoodLength]}><Annulus inner={d.hoodInnerRadius} outer={d.hoodOuterRadius} length={d.hoodLength+.02} color={selected===hood?violet:'#29272d'}/><mesh position={[.107,0,.10]}><boxGeometry args={[.004,.018,.16]}/><meshStandardMaterial color={selected===hood?'#dfc6ff':'#45414a'} roughness={1}/></mesh></group></Mount></group>}
 </group>;})}</>;
}
