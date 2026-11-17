import {Color,DoubleSide} from 'three';
import {SolarMeterSolid as Box} from './SolarMeterParts';

const dry=new Color('#94765a');
const damp=new Color('#4d362b');

export function DrainageColumn({moisture=48,selected=false}:{moisture?:number;selected?:boolean}){
  const soil=dry.clone().lerp(damp,moisture/100);
  return <>
    <mesh position={[0,.90,0]} renderOrder={4}><cylinderGeometry args={[.349,.349,.92,48,1,true]}/><meshPhysicalMaterial color={selected?'#f5cf9e':'#c8e4ec'} transparent opacity={.24} roughness={.27} depthWrite={false} side={DoubleSide}/></mesh>
    <mesh position={[0,.389,0]} renderOrder={4}><cylinderGeometry args={[.349,.103,.105,48,1,true]}/><meshPhysicalMaterial color="#b9dce4" transparent opacity={.41} depthWrite={false} roughness={.31} side={DoubleSide}/></mesh>
    <mesh position={[0,1.37,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.348,.014,10,48]}/><meshStandardMaterial color="#a5c7d0" roughness={.32}/></mesh>
    <mesh position={[0,.742,0]}><cylinderGeometry args={[.328,.328,.48,48]}/><meshStandardMaterial color={soil} roughness={.99}/></mesh>
    <mesh position={[0,.333,0]}><cylinderGeometry args={[.122,.106,.10,32]}/><meshStandardMaterial color="#7597a4" roughness={.48}/></mesh>
    {Array.from({length:11},(_,i)=><Box key={i} at={[0,.491,(i-5)*.052]} size={[2*Math.sqrt(.32**2-((i-5)*.052)**2),.013,.016]} color="#7d8e83" metal={.13}/>)}
    {Array.from({length:40},(_,i)=>{
      const radius=.318*Math.sqrt(i/40),angle=i*2.39996;
      return <mesh key={i} position={[radius*Math.cos(angle),.985,radius*Math.sin(angle)]}><icosahedronGeometry args={[.010+i%7*.003,0]}/><meshStandardMaterial color={i%5===0?'#b4a28a':soil} roughness={1}/></mesh>;
    })}
  </>;
}
