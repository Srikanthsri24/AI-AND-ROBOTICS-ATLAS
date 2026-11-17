import { SolarMeterSolid as Box } from './SolarMeterParts';

export function HydroPumpPart({selected=false}:{selected?:boolean}){
  return <>
    <Box at={[0,.022,0]} size={[.52,.32,.37]} color={selected?'#c7a16b':'#68838f'} metal={.27}/>
    <Box at={[0,-.13,0]} size={[.54,.08,.42]} color="#344551"/>
    <mesh position={[.224,0,.006]} rotation={[0,0,Math.PI/2]}>
      <cylinderGeometry args={[.084,.084,.13,23]}/><meshStandardMaterial color="#6f8d9b" metalness={.29}/>
    </mesh>
    <mesh position={[0,.236,0]}><cylinderGeometry args={[.061,.061,.146,20]}/><meshStandardMaterial color="#8cabb3" metalness={.24}/></mesh>
    {[-.10,0,.10].map(z=><Box key={z} at={[-.263,.008,z]} size={[.015,.135,.025]} color="#263946"/>)}
  </>;
}

export function GrowLampPart({lit=false,selected=false}:{lit?:boolean;selected?:boolean}){
  return <>
    <Box at={[0,0,0]} size={[2.31,.072,.31]} color={selected?'#cba763':'#77909a'} metal={.54}/>
    <Box at={[0,-.043,0]} size={[2.22,.021,.15]} color="#d7ddd3"/>
    <mesh position={[0,-.034,.154]}><boxGeometry args={[2.24,.025,.014]}/>
      <meshStandardMaterial color={lit?'#eee6c4':'#84999e'} emissive="#fcf1bc" emissiveIntensity={lit?1.5:0}/>
    </mesh>
    {Array.from({length:8},(_,i)=><mesh key={i} position={[(i-3.5)*.263,-.06,0]}>
      <boxGeometry args={[.071,.018,.080]}/>
      <meshStandardMaterial color={lit?'#fff7d7':'#d4c9ac'} emissive="#fff0b8" emissiveIntensity={lit?3.4:0}/>
    </mesh>)}
    {lit&&<pointLight position={[0,-.20,0]} color="#fff2ca" intensity={3.3} distance={2.5}/>}
  </>;
}
