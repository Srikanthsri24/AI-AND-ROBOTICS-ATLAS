import {Color} from 'three';
import {SolarMeterSolid as Box} from './SolarMeterParts';

const pale=new Color('#a28560');
const dark=new Color('#554036');
export function WindowBoxPlanter({index=72,selected=false}:{index?:number;selected?:boolean}){
  const soil=pale.clone().lerp(dark,index/100);
  const board=selected?'#ba8c61':'#956b4e';
  return <>
    <Box at={[0,.04,0]} size={[1.75,.08,.88]} color="#526369"/>
    {[-.82,.82].map(x=><Box key={x} at={[x,.10,0]} size={[.052,.047,.83]} color="#69787a"/>)}
    {[-.41,.41].map(z=><Box key={z} at={[0,.10,z]} size={[1.68,.047,.051]} color="#69787a"/>)}
    {[-.31,.31].map(z=><Box key={z} at={[0,.25,z]} size={[1.55,.29,.070]} color={board}/>)}
    {[-.745,.745].map(x=><Box key={x} at={[x,.25,0]} size={[.065,.29,.61]} color="#856048"/>)}
    <Box at={[0,.24,0]} size={[1.41,.23,.55]} color={`#${soil.getHexString()}`}/>
    {[-.32,.32].map(z=><Box key={z} at={[0,.392,z]} size={[1.58,.054,.094]} color="#b18762"/>)}
    {[-.765,.765].map(x=><Box key={x} at={[x,.391,0]} size={[.07,.054,.64]} color="#a27857"/>)}
    {[.16,.25,.34].map((y,i)=><Box key={y} at={[0,y,.351]} size={[1.49,.006+i*.002,.008]} color="#6d4e3e"/>)}
    {[-.62,.62].flatMap(x=>[.18,.33].map(y=><mesh key={x+','+y} position={[x,y,.355]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.016,.016,.007,12]}/><meshStandardMaterial color="#b6ada0" metalness={.54}/></mesh>))}
    {Array.from({length:60},(_,i)=><mesh key={i} position={[Math.sin(i*45)*.66,.36,Math.cos(i*33)*.251]} rotation={[i,.37,.04]}><icosahedronGeometry args={[.009+i%7*.003,0]}/><meshStandardMaterial color={i%9===0?'#afa087':soil} roughness={1}/></mesh>)}
  </>;
}
