import {SolarMeterSolid as Box} from './SolarMeterParts';

export function LibraryCounter({selected=false}:{selected?:boolean}){
  return <>
    <Box at={[0,.085,0]} size={[2.52,.17,.96]} color="#69554a"/>
    <Box at={[0,.45,-.29]} size={[2.36,.67,.153]} color="#9f7657"/>
    {[-1.08,1.08].map(x=><Box key={x} at={[x,.44,.04]} size={[.15,.65,.72]} color="#896249"/>)}
    <Box at={[0,.81,0]} size={[2.52,.095,1.01]} color={selected?'#cfaa7e':'#b88e68'}/>
    <Box at={[0,.46,.051]} size={[1.92,.39,.058]} color="#674c3e"/>
    {[-.88,.88].map(x=><Box key={x} at={[x,.44,.09]} size={[.051,.48,.032]} color="#9c785e"/>)}
    <Box at={[0,.515,.089]} size={[1.38,.14,.026]} color="#b29371"/>
    {[-.62,.62].map(x=><group key={x} position={[x,.90,.01]} rotation={[0,0,-.057]}>
      <Box at={[0,0,0]} size={[.58,.077,.43]} color="#3c515a"/>
      <Box at={[0,.036,.025]} size={[.50,.018,.34]} color="#66777d"/>
    </group>)}
  </>;
}
