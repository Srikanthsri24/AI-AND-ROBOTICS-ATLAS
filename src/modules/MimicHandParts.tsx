import { SolarMeterSolid as Box } from './SolarMeterParts';

export function FlexStrip(){
  return <>
    <Box at={[0,0,0]} size={[.155,.028,1.42]} color="#282b31"/>
    <Box at={[0,.016,-.13]} size={[.081,.006,1.11]} color="#48504c"/>
    {[-.038,.038].map(x=><Box key={x} at={[x,0,.76]} size={[.027,.019,.22]} color="#c9b58a" metal={.64}/>)}
  </>;
}
export function CardPalm(){
  return <>
    <Box at={[0,0,.13]} size={[1.12,.13,1.07]} color="#b18b61"/>
    <Box at={[0,.076,.13]} size={[1.04,.029,.98]} color="#c69c70"/>
    {[-.41,-.14,.14,.41].map(x=><Box key={x} at={[x,0,-.72]} size={[.22,.14,.64]} color="#ba936a"/>)}
    <group position={[-.60,0,.07]} rotation={[0,.68,0]}><Box at={[0,0,-.26]} size={[.25,.14,.61]} color="#be966c"/></group>
  </>;
}
