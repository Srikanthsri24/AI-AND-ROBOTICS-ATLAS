import { SolarMeterSolid as Box } from './SolarMeterParts';

export function LightHood({selected=false}:{selected?:boolean}){
  return <>
    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.115,.115,.33,24,1,true]}/><meshStandardMaterial color={selected?'#bf9552':'#303a41'} side={2}/></mesh>
    <mesh position={[0,0,-.065]}><circleGeometry args={[.082,24]}/><meshStandardMaterial color="#c09369"/></mesh>
    {[-.035,.0,.035].map(x=><Box key={x} at={[x,0,-.06]} size={[.007,.104,.007]} color="#583a2c"/>)}
    <Box at={[0,-.135,-.15]} size={[.18,.13,.19]} color="#a97f60"/>
  </>;
}
