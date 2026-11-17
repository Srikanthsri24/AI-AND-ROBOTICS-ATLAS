import { SolarMeterSolid as Box } from './SolarMeterParts';
export function ReflectanceArray({selected=false}:{selected?:boolean}){
  return <>
    <Box at={[0,0,0]} size={[.47,.045,.64]} color={selected?'#d2a952':'#27383c'}/>
    {[-.19,0,.19].map(z=><group key={z} position={[.06,-.038,z]}>
      <Box at={[0,0,0]} size={[.162,.053,.11]} color="#202a32"/>
      <Box at={[.035,-.028,0]} size={[.046,.009,.063]} color="#908893"/>
      <Box at={[-.036,-.028,0]} size={[.050,.009,.063]} color="#6b6774"/>
    </group>)}
    {Array.from({length:5},(_,i)=><Box key={i} at={[-.18,.03,i*.105-.21]} size={[.051,.014,.045]} color="#bea66a" metal={.61}/>)}
  </>;
}
