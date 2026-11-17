import {SolarMeterSolid as Box} from './SolarMeterParts';

export function SignalPaddle({lit=false,pressed=false}:{lit?:boolean;pressed?:boolean}){
  return <>
    <Box at={[0,.41,0]} size={[.33,.77,.15]} color="#4f6872"/>
    {Array.from({length:6},(_,i)=><Box key={i} at={[0,.12+i*.087,.077]} size={[.265,.022,.022]} color="#344c58"/>)}
    <mesh position={[0,1.11,.01]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.53,.53,.14,40]}/><meshStandardMaterial color="#507785" roughness={.76}/></mesh>
    <mesh position={[0,1.11,.089]}><circleGeometry args={[.441,40]}/><meshStandardMaterial color="#274b59" roughness={.68}/></mesh>
    <mesh position={[0,1.11,.098]}><ringGeometry args={[.34,.39,40]}/><meshStandardMaterial color="#c3945b" roughness={.64}/></mesh>
    <mesh position={[0,1.11,.106]}><circleGeometry args={[.27,40]}/><meshPhysicalMaterial color={lit?'#fff0b6':'#d3d8c8'} roughness={.47} emissive="#ffe4a3" emissiveIntensity={lit?2.65:0}/></mesh>
    <Box at={[0,.676,.081]} size={[.16,.134,.03]} color="#23353c"/>
    <mesh position={[0,.676,pressed?.102:.124]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.052,.056,.048,24]}/><meshPhysicalMaterial color="#cf9d68" roughness={.4}/></mesh>
    <Box at={[0,.047,-.019]} size={[.16,.11,.11]} color="#34444b"/>
  </>;
}
