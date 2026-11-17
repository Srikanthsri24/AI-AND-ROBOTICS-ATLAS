import {Color} from 'three';
import {SolarMeterSolid as Box} from './SolarMeterParts';

const dry=new Color('#a5875e');
const damp=new Color('#4f392e');
export function OpenSoilTray({moisture=70,selected=false}:{moisture?:number;selected?:boolean}){
  const soil=dry.clone().lerp(damp,moisture/100);
  const rim=selected?'#d0a678':'#5f7882';
  return <>
    <Box at={[0,.06,0]} size={[1.49,.12,1.07]} color="#4d626a"/>
    {[-.704,.704].map(x=><Box key={x} at={[x,.22,0]} size={[.076,.30,1.06]} color={rim}/>)}
    {[-.491,.491].map(z=><Box key={z} at={[0,.22,z]} size={[1.42,.30,.072]} color={rim}/>)}
    <Box at={[0,.208,0]} size={[1.36,.19,.92]} color={`#${soil.getHexString()}`}/>
    {Array.from({length:72},(_,i)=><mesh key={i} position={[Math.sin(i*36)*.631,.309,Math.cos(i*57)*.443]} rotation={[.45,i,.15]}><icosahedronGeometry args={[.009+i%7*.004,0]}/><meshStandardMaterial color={i%9===0?'#bbac8a':soil} roughness={1}/></mesh>)}
    {[-.58,.58].map(x=><Box key={x} at={[x,.48,-.31]} size={[.073,.37,.073]} color="#98a6a9" metal={.45}/>)}
    <Box at={[0,.65,-.31]} size={[1.22,.065,.082]} color="#98a6a9" metal={.45}/>
    <Box at={[.08,.63,-.23]} size={[.20,.100,.17]} color="#394b54"/>
  </>;
}
