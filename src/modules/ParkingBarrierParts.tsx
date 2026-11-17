import {SolarMeterSolid as Box} from './SolarMeterParts';

export function ParkingLane(){
  return <>
    <Box at={[0,.05,0]} size={[3.57,.10,1.34]} color="#49545a"/>
    {[-.60,.60].map(z=><Box key={z} at={[0,.115,z]} size={[3.48,.10,.16]} color="#9b9e97"/>)}
    {[-.65,.47].map(x=><Box key={x} at={[x,.108,0]} size={[.032,.013,1.02]} color="#dfd6b7"/>)}
    {[-1.42,1.39].map(x=><Box key={x} at={[x,.108,0]} size={[.41,.013,.035]} color="#d2b880"/>)}
  </>;
}

export function StripedArm(){
  return <>
    <Box at={[.59,0,0]} size={[1.20,.094,.075]} color="#e5ddd0"/>
    {Array.from({length:5},(_,i)=><Box key={i} at={[.13+i*.23,0,0]} size={[.107,.096,.079]} color="#b9574d"/>)}
    <Box at={[.035,0,0]} size={[.15,.15,.14]} color="#536772"/>
  </>;
}

export function ParkingToyCar(){
  return <>
    <Box at={[0,.139,0]} size={[.85,.18,.43]} color="#468699"/>
    <Box at={[-.07,.27,0]} size={[.44,.144,.38]} color="#64a1ae"/>
    <Box at={[.142,.279,0]} size={[.041,.098,.342]} color="#324853"/>
    {[-.27,.27].flatMap(x=>[-.21,.21].map(z=><mesh key={x+','+z} position={[x,.072,z]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.079,.079,.058,20]}/><meshStandardMaterial color="#28343a" roughness={.84}/></mesh>))}
  </>;
}
