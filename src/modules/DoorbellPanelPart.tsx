import {SolarMeterSolid as Box} from './SolarMeterParts';

export function DoorbellPanel({selected=false}:{selected?:boolean}){
  return <>
    <Box at={[0,.06,0]} size={[1.91,.12,.94]} color="#6d7474"/>
    <Box at={[0,.88,-.27]} size={[1.77,1.58,.14]} color={selected?'#d4b890':'#c4ae90'}/>
    <Box at={[-.23,.72,-.159]} size={[.91,1.29,.081]} color="#936245"/>
    {[-.72,.25].map(x=><Box key={x} at={[x,.76,-.139]} size={[.087,1.34,.11]} color="#ded0b7"/>)}
    <Box at={[-.23,1.434,-.14]} size={[1.07,.089,.112]} color="#ded0b7"/>
    {[.46,1.02].map(y=><Box key={y} at={[-.23,y,-.11]} size={[.66,.43,.027]} color="#ab7954"/>)}
    <mesh position={[.065,.71,-.062]}><sphereGeometry args={[.045,20,14]}/><meshStandardMaterial color="#caa770" metalness={.55}/></mesh>
    <Box at={[.560,.73,-.146]} size={[.25,.37,.10]} color="#43545c"/>
    <Box at={[.50,1.34,-.146]} size={[.44,.30,.12]} color="#526067"/>
    {Array.from({length:5},(_,i)=><Box key={i} at={[.50,1.24+i*.048,-.078]} size={[.32,.022,.014]} color="#2f3c43"/>)}
    <Box at={[-.23,.13,-.034]} size={[1.02,.078,.38]} color="#8a8980"/>
  </>;
}
