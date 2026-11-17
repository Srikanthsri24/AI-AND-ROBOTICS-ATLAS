import { SolarMeterSolid as Box } from './SolarMeterParts';

export function InfraredThermometer({selected=false}:{selected?:boolean}){
  return <>
    <mesh><cylinderGeometry args={[.17,.17,.167,32]}/><meshStandardMaterial color={selected?'#d6af64':'#9ea8b1'} metalness={.75} roughness={.33}/></mesh>
    <mesh position={[0,.087,0]}><cylinderGeometry args={[.085,.085,.012,26]}/><meshStandardMaterial color="#232b34" metalness={.57} roughness={.27}/></mesh>
    {[-.09,.09].map(x=>[-.09,.09].map(z=><Box key={x+':'+z} at={[x,-.20,z]} size={[.022,.24,.022]} color="#c1b49b" metal={.68}/>))}
    <Box at={[.169,-.055,-.09]} size={[.06,.024,.07]} color="#95a1ad" metal={.53}/>
  </>;
}
