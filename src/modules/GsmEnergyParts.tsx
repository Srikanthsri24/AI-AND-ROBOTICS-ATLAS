import { SolarMeterSolid as Box } from './SolarMeterParts';

export function FonaModule({selected=false,online=false}:{selected?:boolean;online?:boolean}){
  return <>
    <Box at={[0,0,0]} size={[.93,.07,.67]} color={selected?'#d1a458':'#34344c'}/>
    <Box at={[0,.07,.02]} size={[.56,.089,.43]} color="#a9b1bb" metal={.68}/>
    <Box at={[-.37,.075,.03]} size={[.125,.094,.21]} color="#ddd9ca"/>
    <Box at={[.32,.062,-.18]} size={[.09,.051,.093]} color="#cab27a" metal={.58}/>
    {Array.from({length:8},(_,i)=><Box key={i} at={[i*.095-.34,.049,.284]} size={[.042,.018,.047]} color="#c6aa62" metal={.56}/>)}
    <mesh position={[.34,.064,.23]}><sphereGeometry args={[.028,16,12]}/><meshStandardMaterial color="#bd563a" emissive="#f55343" emissiveIntensity={online?2.4:0}/></mesh>
  </>;
}

export function FonaBattery(){
  return <>
    <Box at={[0,0,0]} size={[.64,.15,.96]} color="#adb4bd" metal={.58}/>
    <Box at={[0,.082,.007]} size={[.50,.018,.69]} color="#748697"/>
    <Box at={[0,0,-.50]} size={[.34,.10,.09]} color="#d7aa66"/>
    <Box at={[.04,.040,-.58]} size={[.17,.065,.12]} color="#ebe6d8"/>
  </>;
}
