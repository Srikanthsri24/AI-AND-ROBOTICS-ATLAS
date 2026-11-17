import {SolarMeterSolid as Box} from './SolarMeterParts';

export function QuizDesk(){
  return <>
    {[-.84,.84].map((x,i)=><group key={x} position={[x,0,0]}>
      <Box at={[0,.055,0]} size={[1.41,.11,.86]} color="#505e64"/>
      <Box at={[0,.335,-.06]} size={[1.31,.54,.64]} color={i===0?'#476d89':'#8a6458'}/>
      <Box at={[0,.615,-.025]} size={[1.40,.094,.79]} color="#a28667"/>
      <Box at={[0,.355,.273]} size={[1.10,.26,.026]} color={i===0?'#c2e0ec':'#edc7ad'}/>
      {[-.49,.49].map(screw=><mesh key={screw} position={[screw,.353,.291]}><sphereGeometry args={[.018,14,8]}/><meshStandardMaterial color="#6e757a" metalness={.54}/></mesh>)}
    </group>)}
    <Box at={[0,.095,-.39]} size={[.79,.16,.45]} color="#394a53"/>
    <Box at={[0,.24,-.39]} size={[.69,.16,.40]} color="#65757a"/>
  </>;
}
