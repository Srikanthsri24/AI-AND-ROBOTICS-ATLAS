import {SolarMeterSolid as Box} from './SolarMeterParts';

export function CrossingRoad(){
  return <>
    <Box at={[0,.055,0]} size={[3.57,.11,1.70]} color="#444e55"/>
    {[-.74,.74].map(z=><Box key={z} at={[0,.15,z]} size={[3.58,.14,.35]} color="#a4a49e"/>)}
    {Array.from({length:5},(_,i)=><Box key={i} at={[.12,.115,(i-2)*.23]} size={[.69,.012,.125]} color="#eae6d9"/>)}
    {[-.41,.66].map(x=><Box key={x} at={[x,.115,0]} size={[.045,.012,1.16]} color="#ece4d4"/>)}
    {[-1.35,1.35].map(x=><Box key={x} at={[x,.115,0]} size={[.55,.012,.040]} color="#d0b078"/>)}
  </>;
}

export function CrossingMast({pedestrian=false}:{pedestrian?:boolean}){
  const height=pedestrian?1.0:1.28;
  return <>
    <Box at={[0,.05,0]} size={[.32,.10,.31]} color="#6d777a"/>
    <mesh position={[0,height/2,0]}><cylinderGeometry args={[.037,.044,height,20]}/><meshStandardMaterial color="#97a5aa" metalness={.47}/></mesh>
    <Box at={[0,height,.02]} size={[.28,pedestrian?.38:.61,.15]} color="#26343c"/>
  </>;
}
