import {SolarMeterSolid as Box} from './SolarMeterParts';

export function ControllerStick({x=0,y=0,clicked=false}:{x?:number;y?:number;clicked?:boolean}){
  return <>
    <Box at={[0,-.17,0]} size={[.84,.06,.82]} color="#29416a"/>
    {[-.34,.34].flatMap(x=>[-.32,.32].map(z=><mesh key={x+','+z} position={[x,-.132,z]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.032,.011,8,16]}/><meshStandardMaterial color="#bfac78" metalness={.58}/></mesh>))}
    <Box at={[0,-.056,0]} size={[.49,.19,.47]} color="#a0a9ac" metal={.54}/>
    <Box at={[-.30,-.086,0]} size={[.14,.105,.30]} color="#273c43"/>
    <Box at={[0,-.085,.302]} size={[.31,.105,.134]} color="#2c3c45"/>
    <group position={[0,clicked?.027:.065,0]} rotation={[y*.21,0,-x*.21]}>
      <mesh position={[0,.119,0]}><cylinderGeometry args={[.103,.063,.24,24]}/><meshStandardMaterial color="#2b353c"/></mesh>
      <mesh position={[0,.239,0]}><cylinderGeometry args={[.229,.196,.12,35]}/><meshStandardMaterial color="#39464b" roughness={.79}/></mesh>
      <mesh position={[0,.307,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.172,.020,10,35]}/><meshStandardMaterial color="#586269" roughness={.82}/></mesh>
    </group>
  </>;
}
