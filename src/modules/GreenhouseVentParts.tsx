import {SolarMeterSolid as Box} from './SolarMeterParts';

export function RoofVent({angle=0,selected=false}:{angle?:number;selected?:boolean}){
  const frame=selected?'#dfad67':'#8ba9a0';
  return <group rotation={[0,0,angle]}>
    <Box at={[.51,0,0]} size={[1.02,.043,1.26]} color={selected?'#bcc9a4':'#8daaa5'}/>
    {[-.61,.61].map(z=><Box key={z} at={[.51,.032,z]} size={[1.03,.042,.045]} color={frame}/>)}
    {[.025,.995].map(x=><Box key={x} at={[x,.032,0]} size={[.05,.041,1.25]} color={frame}/>)}
    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.029,.029,1.37,18]}/><meshStandardMaterial color="#a3aeb2" metalness={.42}/></mesh>
  </group>;
}
