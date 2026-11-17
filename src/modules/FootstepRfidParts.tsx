import { SolarMeterSolid as Box } from './SolarMeterParts';

export function PiezoDisc({selected=false}:{selected?:boolean}){
  return <>
    <mesh><cylinderGeometry args={[.285,.285,.028,42]}/><meshStandardMaterial color={selected?'#e0b65b':'#ad8847'} metalness={.68} roughness={.29}/></mesh>
    <mesh position={[0,.019,0]}><cylinderGeometry args={[.209,.209,.027,38]}/><meshStandardMaterial color="#ddd8c9" metalness={.27} roughness={.38}/></mesh>
    <Box at={[.09,.041,.05]} size={[.049,.019,.039]} color="#b35b4b"/>
    <Box at={[-.242,.018,-.015]} size={[.047,.02,.042]} color="#3d4145"/>
  </>;
}
export function RectifierBridge({selected=false}:{selected?:boolean}){
  return <>
    <Box at={[0,-.05,0]} size={[.70,.072,.58]} color={selected?'#d7ab62':'#3a6154'}/>
    {[-.18,.18].flatMap(x=>[-.13,.13].map(z=><group key={x+':'+z} position={[x,.07,z]} rotation={[0,0,Math.PI/2]}>
      <mesh><cylinderGeometry args={[.042,.042,.205,20]}/><meshStandardMaterial color="#2e3334" roughness={.63}/></mesh>
      <mesh position={[0,.068,0]}><cylinderGeometry args={[.043,.043,.027,20]}/><meshStandardMaterial color="#aaaeb0" metalness={.27}/></mesh>
      <mesh><cylinderGeometry args={[.011,.011,.28,14]}/><meshStandardMaterial color="#b7bbbe" metalness={.65}/></mesh>
    </group>))}
  </>;
}
export function HarvestCapacitor({selected=false}:{selected?:boolean}){
  return <>
    <mesh position={[0,.12,0]}><cylinderGeometry args={[.143,.143,.31,30]}/><meshStandardMaterial color={selected?'#9e793f':'#24425a'} metalness={.35} roughness={.39}/></mesh>
    <mesh position={[0,.279,0]}><cylinderGeometry args={[.126,.126,.017,30]}/><meshStandardMaterial color="#b9bdb9" metalness={.72}/></mesh>
    <Box at={[0,.291,0]} size={[.167,.008,.013]} color="#7b8383"/>
    <Box at={[0,.291,0]} size={[.014,.008,.168]} color="#7b8383"/>
    <Box at={[.067,-.096,0]} size={[.018,.19,.018]} color="#b1b9bb" metal={.62}/>
    <Box at={[-.067,-.084,0]} size={[.018,.166,.018]} color="#b1b9bb" metal={.62}/>
  </>;
}
