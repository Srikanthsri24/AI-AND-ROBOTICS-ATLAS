import {SolarMeterSolid as Box} from './SolarMeterParts';

export function LiftShaft({selected=false}:{selected?:boolean}){
  return <>
    <Box at={[0,.067,0]} size={[1.65,.135,.94]} color="#68787d"/>
    <Box at={[0,1.01,-.29]} size={[1.28,1.84,.09]} color={selected?'#cbaa86':'#a99b85'}/>
    {[-.61,.61].map(x=><Box key={x} at={[x,1.02,-.03]} size={[.10,1.86,.53]} color="#7c8e91"/>)}
    {[-.41,.41].map(x=><Box key={x} at={[x,1.01,-.19]} size={[.042,1.74,.064]} color="#b2c1c1" metal={.42}/>)}
    <Box at={[0,1.98,-.10]} size={[1.33,.091,.55]} color="#8a9b9d"/>
    <Box at={[.76,.34,.065]} size={[.32,.35,.21]} color="#566e75"/>
    <Box at={[0,.16,.26]} size={[1.00,.054,.26]} color="#a5a19a"/>
  </>;
}

export function LiftCar({selected=false}:{selected?:boolean}){
  return <>
    <Box at={[0,.24,-.03]} size={[.72,.49,.48]} color={selected?'#d7ab77':'#768f99'} metal={.18}/>
    <Box at={[0,.258,.223]} size={[.58,.33,.028]} color="#bacbd0" metal={.43}/>
    <Box at={[0,.259,.243]} size={[.012,.31,.012]} color="#60747d"/>
    <Box at={[0,.033,.10]} size={[.75,.068,.47]} color="#5a6e72"/>
    <Box at={[.39,.10,-.02]} size={[.11,.098,.15]} color="#d6a46f"/>
  </>;
}
