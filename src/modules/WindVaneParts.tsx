import {SolarMeterSolid as Box} from './SolarMeterParts';

export function VanePointer(){
  return <>
    <Box at={[0,0,0]} size={[1.68,.065,.075]} color="#6f8a8d"/>
    <mesh position={[.80,.005,0]} rotation={[0,0,-Math.PI/2]}><coneGeometry args={[.137,.32,4]}/><meshStandardMaterial color="#c98458"/></mesh>
    <Box at={[-.68,.16,0]} size={[.47,.35,.055]} color="#547d8e"/>
    <Box at={[-.70,.16,.029]} size={[.32,.21,.009]} color="#79a1ac"/>
  </>;
}

export function WindVanePivot(){
  return <>
    <mesh position={[0,.054,0]}><cylinderGeometry args={[.81,.82,.106,56]}/><meshStandardMaterial color="#a78c6c"/></mesh>
    <mesh position={[0,.55,0]}><cylinderGeometry args={[.039,.039,.57,24]}/><meshStandardMaterial color="#9faeb3" metalness={.56}/></mesh>
    {[-.26,.26].map(x=><Box key={x} at={[x,.245,-.14]} size={[.062,.28,.067]} color="#526972"/>)}
    <Box at={[0,.37,-.13]} size={[.58,.061,.09]} color="#526972"/>
    <Box at={[0,.37,-.037]} size={[.12,.065,.20]} color="#526972"/>
    {Array.from({length:16},(_,i)=>{
      const angle=i*Math.PI/8;
      return <Box key={i} at={[Math.cos(angle)*.72,.11,Math.sin(angle)*.72]} size={[.063,.013,.049]} color={i%4===0?'#ddd6bc':'#6b6256'}/>;
    })}
  </>;
}

export function AS5600Breakout(){
  return <>
    <Box at={[0,0,0]} size={[.71,.063,.55]} color="#28343e"/>
    <Box at={[0,.052,0]} size={[.155,.048,.15]} color="#18232c"/>
    {[-.26,.26].map(x=><Box key={x} at={[x,.059,0]} size={[.13,.089,.22]} color="#e1dbc8"/>)}
    {[-.29,.29].flatMap(x=>[-.21,.21].map(z=><mesh key={x+','+z} position={[x,.039,z]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.037,.010,8,16]}/><meshStandardMaterial color="#b1aa7d" metalness={.58}/></mesh>))}
  </>;
}
