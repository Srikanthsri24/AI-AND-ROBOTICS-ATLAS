import { SolarMeterSolid as Box } from './SolarMeterParts';
export function ColorBreakout({selected=false}:{selected?:boolean}){
  return <>
    <Box at={[0,0,0]} size={[.52,.065,.48]} color={selected?'#cbaa65':'#355c90'}/>
    <Box at={[0,.052,.004]} size={[.13,.044,.135]} color="#222c37"/>
    <Box at={[.006,.079,.001]} size={[.077,.013,.064]} color="#7d8fa0" metal={.46}/>
    {[-.176,-.058,.058,.176].map(x=><Box key={x} at={[x,.049,.19]} size={[.047,.019,.044]} color="#c6a66c" metal={.57}/>)}
    <Box at={[0,.073,-.19]} size={[.29,.09,.12]} color="#e3e1d6"/>
  </>;
}
