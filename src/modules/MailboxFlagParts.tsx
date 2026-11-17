import {SolarMeterSolid as Box} from './SolarMeterParts';

export function MailboxModel({open=false,selected=false,onFlap}:{open?:boolean;selected?:boolean;onFlap?:()=>void}){
  const blue=selected?'#679da2':'#446e7e';
  return <>
    <Box at={[0,.072,0]} size={[1.71,.144,1.24]} color="#8b785e"/>
    <Box at={[0,.18,0]} size={[1.46,.092,1.05]} color="#3d4f57"/>
    <Box at={[0,.57,-.46]} size={[1.40,.76,.077]} color="#496674"/>
    {[-.67,.67].map(x=><Box key={x} at={[x,.56,-.015]} size={[.086,.77,.98]} color={blue}/>)}
    <Box at={[0,.96,-.02]} size={[1.50,.121,1.03]} color={blue}/>
    {[.39,.26,.13,0,-.13,-.26,-.39].map(z=><Box key={z} at={[0,1.027,z]} size={[1.32,.012,.016]} color="#365864"/>)}
    <Box at={[0,.30,.14]} size={[.64,.055,.45]} color="#e1d8be"/>
    <Box at={[0,.332,.14]} size={[.54,.027,.38]} color="#d1b587"/>
    <group position={[0,.236,.49]} rotation={[open?1.25:0,0,0]} onClick={onFlap}>
      <Box at={[0,.338,0]} size={[1.39,.68,.075]} color={blue}/>
      <Box at={[0,.34,.041]} size={[1.18,.50,.014]} color="#527f90"/>
      <Box at={[0,.56,.073]} size={[.22,.056,.087]} color="#bdc0b1" metal={.52}/>
    </group>
    <mesh position={[0,.228,.492]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.044,.044,1.36,20]}/><meshStandardMaterial color="#afb8b7" metalness={.6}/></mesh>
  </>;
}
