import { SolarMeterSolid as Box } from './SolarMeterParts';

export function FingerprintReader({active=false,selected=false}:{active?:boolean;selected?:boolean}){
  const housing=selected?'#d0a650':'#262d37';
  return <>
    <Box at={[0,.015,-.14]} size={[.59,.27,.68]} color={housing}/>
    <Box at={[0,-.066,.29]} size={[.59,.10,.42]} color={housing}/>
    <Box at={[0,.158,-.22]} size={[.59,.06,.43]} color={housing}/>
    <group position={[0,.045,.24]} rotation={[.51,0,0]}>
      <Box at={[0,0,0]} size={[.60,.095,.53]} color={housing}/>
      <Box at={[0,.05,0]} size={[.47,.013,.41]} color="#9aa3ac" metal={.55}/>
      <mesh position={[0,.061,0]} rotation={[-Math.PI/2,0,0]}>
        <planeGeometry args={[.39,.33]}/>
        <meshStandardMaterial color={active?'#ad5f4c':'#192e3a'} emissive="#ff3226" emissiveIntensity={active?.8:0} roughness={.16} metalness={.45}/>
      </mesh>
    </group>
    <Box at={[0,.005,-.49]} size={[.37,.10,.13]} color="#e4e2da"/>
  </>;
}
