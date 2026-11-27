import{useLayoutEffect,useRef}from'react';import type{Mesh}from'three';
import { RoundedBox } from '@react-three/drei';

type Point=[number,number,number];

/** Opt-in nominal bounds keep generated bevels within connector mating dimensions. */
export function SolarMeterSolid({at,size,color,metal=0,exact=false}:{at:Point;size:Point;color:string;metal?:number;exact?:boolean}){
  const ref=useRef<Mesh>(null),normalized=useRef(false);useLayoutEffect(()=>{if(!ref.current)return;const mesh=ref.current;if(!exact){if(normalized.current){mesh.scale.set(1,1,1);normalized.current=false;}return;}mesh.geometry.computeBoundingBox();const box=mesh.geometry.boundingBox!;mesh.scale.set(size[0]/(box.max.x-box.min.x),size[1]/(box.max.y-box.min.y),size[2]/(box.max.z-box.min.z));normalized.current=true;},[exact,size[0],size[1],size[2]]);
  return <RoundedBox ref={ref} position={at} args={size} radius={Math.min(...size)*.18} smoothness={2}>
    <meshStandardMaterial color={color} roughness={metal?.32:.56} metalness={metal}/>
  </RoundedBox>;
}

export function SolarMeterPanel({selected=false,light=65}:{selected?:boolean;light?:number}){
  return <>
    <SolarMeterSolid at={[0,0,0]} size={[2.36,.11,1.53]} color={selected?'#eac565':'#c3cbd4'} metal={.58}/>
    <SolarMeterSolid at={[0,.055,0]} size={[2.24,.05,1.41]} color="#131e2b"/>
    {Array.from({length:12},(_,i)=>{
      const x=(i%6-2.5)*.365,z=(Math.floor(i/6)-.5)*.686;
      return <group key={i} position={[x,.086,z]}>
        <mesh rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.347,.664]}/>
          <meshPhysicalMaterial color="#173558" emissive="#244785" emissiveIntensity={light/170} roughness={.29} clearcoat={.68}/>
        </mesh>
        {[-.12,0,.12].map(dx=><SolarMeterSolid key={dx} at={[dx,.003,0]} size={[.006,.004,.65]} color="#91b1d4" metal={.54}/>)}
        <SolarMeterSolid at={[0,.004,0]} size={[.34,.005,.019]} color="#adbad2" metal={.59}/>
      </group>;
    })}
  </>;
}

export function SolarMeterSensor({selected=false}:{selected?:boolean}){
  return <>
    <SolarMeterSolid at={[0,0,0]} size={[1.16,.07,.87]} color={selected?'#eac565':'#2851a0'}/>
    <SolarMeterSolid at={[0,.14,-.26]} size={[.65,.23,.27]} color="#2c94a3"/>
    {[-.17,.17].map(x=><group key={x}>
      <mesh position={[x,.264,-.26]}><cylinderGeometry args={[.079,.079,.019,20]}/><meshStandardMaterial color="#b9c6d4" metalness={.75} roughness={.32}/></mesh>
      <SolarMeterSolid at={[x,.276,-.26]} size={[.09,.009,.014]} color="#384554"/>
    </group>)}
    <SolarMeterSolid at={[.19,.055,.063]} size={[.34,.05,.19]} color="#242b39"/>
    <SolarMeterSolid at={[-.15,.058,.04]} size={[.19,.054,.16]} color="#161c26"/>
    {[-.39,-.13,.13,.39].map(x=><SolarMeterSolid key={x} at={[x,.055,.33]} size={[.075,.04,.073]} color="#d8bf75" metal={.66}/>)}
    {[-.53,.53].map(x=><SolarMeterSolid key={x} at={[x,.025,.04]} size={[.12,.03,.12]} color="#c0a85f" metal={.6}/>)}
  </>;
}
