import { SolarMeterSolid as Box } from './SolarMeterParts';

export function ShakeSensorPart({selected=false}:{selected?:boolean}){
  return <>
    <Box at={[0,0,0]} size={[.68,.051,.53]} color={selected?'#d8ac67':'#245683'}/>
    <Box at={[.04,.039,0]} size={[.155,.037,.135]} color="#20282f"/>
    <Box at={[.04,.062,0]} size={[.071,.007,.015]} color="#76868a"/>
    {[-.28,.28].map(x=><mesh key={x} position={[x,.029,.165]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[.025,.044,18]}/><meshStandardMaterial color="#b89a60" metalness={.57}/>
    </mesh>)}
    {[-.22,.22].map(x=><Box key={x} at={[x,.053,-.199]} size={[.128,.051,.083]} color="#d9ddd3"/>)}
    {Array.from({length:5},(_,i)=><Box key={i} at={[(i-2)*.085,.032,.213]} size={[.049,.022,.036]} color="#c1a168" metal={.53}/>)}
  </>;
}
