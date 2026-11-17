import {SolarMeterSolid as Box} from './SolarMeterParts';

export function CardPanCamera({selected=false}:{selected?:boolean}){
  return <>
    <Box at={[0,.14,0]} size={[.68,.30,.62]} color={selected?'#d5aa80':'#50646d'}/>
    <Box at={[0,.303,0]} size={[.63,.034,.57]} color="#708791"/>
    <Box at={[0,.326,.086]} size={[.025,.012,.39]} color="#e4c799"/>
    <mesh position={[0,.149,.328]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.112,.112,.091,30]}/><meshStandardMaterial color="#303f49"/></mesh>
    <mesh position={[0,.149,.378]}><circleGeometry args={[.073,28]}/><meshStandardMaterial color="#293944" roughness={.35}/></mesh>
    <Box at={[-.235,.192,.314]} size={[.064,.052,.017]} color="#b79969"/>
  </>;
}

export function PanTarget({color='#caa66c'}:{color?:string}){
  return <>
    <Box at={[0,.036,0]} size={[.35,.07,.25]} color="#697576"/>
    <Box at={[0,.245,-.04]} size={[.32,.40,.053]} color="#c8beab"/>
    <mesh position={[0,.25,-.01]}><circleGeometry args={[.112,24]}/><meshStandardMaterial color={color}/></mesh>
  </>;
}
