import {SolarMeterSolid as Box} from './SolarMeterParts';

export function DrawerCabinet({cutaway=false}:{cutaway?:boolean}){
  return <>
    <Box at={[0,.06,0]} size={[1.82,.12,1.32]} color="#80644f"/>
    {!cutaway&&<Box at={[0,.76,0]} size={[1.82,.115,1.29]} color="#b68e66"/>}
    {[-.84,.84].map(x=><Box key={x} at={[x,.42,0]} size={[.12,.67,1.27]} color="#9b7556"/>)}
    {cutaway?<><Box at={[-.26,.42,-.61]} size={[1.15,.67,.084]} color="#846753"/><Box at={[.74,.42,-.61]} size={[.19,.67,.084]} color="#846753"/></>:<Box at={[0,.42,-.61]} size={[1.67,.67,.084]} color="#846753"/>}
    {[-.72,.72].map(x=><Box key={x} at={[x,.32,.01]} size={[.112,.083,1.19]} color="#7c888b" metal={.34}/>)}
    <Box at={[.51,.29,-.54]} size={[.19,.16,.13]} color="#665b50"/>
  </>;
}

export function SlidingDrawer({selected=false}:{selected?:boolean}){
  const wood=selected?'#d8a779':'#a97a58';
  return <>
    <Box at={[0,.044,0]} size={[1.36,.088,1.02]} color="#8d6c53"/>
    {[-.63,.63].map(x=><Box key={x} at={[x,.16,0]} size={[.086,.22,1.04]} color={wood}/>)}
    <Box at={[0,.18,-.49]} size={[1.28,.27,.08]} color="#a48161"/>
    <Box at={[0,.20,.56]} size={[1.58,.34,.12]} color={wood}/>
    <Box at={[0,.22,.633]} size={[.37,.072,.058]} color="#c6c1ae" metal={.57}/>
    <Box at={[.49,.10,-.57]} size={[.16,.083,.15]} color="#d9aa76"/>
  </>;
}
