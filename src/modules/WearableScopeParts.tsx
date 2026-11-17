import { SolarMeterSolid as Box } from './SolarMeterParts';

export function NanoBoard({selected=false}:{selected?:boolean}){
  return <>
    <Box at={[0,0,0]} size={[1.58,.08,.63]} color={selected?'#cea753':'#157c61'}/>
    <Box at={[-.69,.10,0]} size={[.36,.18,.36]} color="#bfcbd2" metal={.74}/>
    <Box at={[-.874,.10,0]} size={[.015,.108,.255]} color="#26323d"/>
    <Box at={[.06,.064,0]} size={[.37,.064,.34]} color="#1b252b"/>
    {[-.277,.277].map(z=>Array.from({length:15},(_,i)=><Box key={z+':'+i}
      at={[(i-7)*.102,.052,z]} size={[.037,.026,.039]} color="#d1b86c" metal={.66}/>))}
    {[-.21,.10,.20,.50,.66].map((x,i)=><Box key={x} at={[x,.057,i%2?.14:-.15]} size={[.075,.034,.052]} color={i===3?'#e5d19a':'#2b3235'}/>)}
    <Box at={[.56,.074,.02]} size={[.135,.08,.14]} color="#c6c9ce" metal={.49}/>
  </>;
}

export function ScopeOled({selected=false}:{selected?:boolean}){
  return <>
    <Box at={[0,0,0]} size={[1.68,.10,1.42]} color={selected?'#d4ad59':'#26313e'}/>
    <Box at={[0,.075,0]} size={[1.49,.10,1.03]} color="#0e161e"/>
    <Box at={[0,.128,.02]} size={[1.28,.01,.65]} color="#101f2c"/>
    {[-.71,.71].map(x=><group key={x}>
      {[-.6,.6].map(z=><mesh key={z} position={[x,.054,z]}><cylinderGeometry args={[.047,.047,.014,20]}/><meshStandardMaterial color="#c6ae72" metalness={.72}/></mesh>)}
    </group>)}
    <Box at={[0,.086,-.615]} size={[.42,.10,.16]} color="#e4e2dc"/>
  </>;
}
