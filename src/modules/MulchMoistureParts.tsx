import {Color,DoubleSide} from 'three';
import {SolarMeterSolid as Box} from './SolarMeterParts';

const dry=new Color('#a28a65');
const damp=new Color('#4b3527');
const wood=['#b18158','#a46537','#cfac78','#8d5835','#74523a'];

export function MulchTray({covered=false,moisture=80,selected=false}:{covered?:boolean;moisture?:number;selected?:boolean}){
  const soil=dry.clone().lerp(damp,moisture/100);
  const rim=selected?'#967347':'#425d58';
  return <>
    <Box at={[0,.055,0]} size={[1.33,.11,1.04]} color="#334944"/>
    <Box at={[0,.17,0]} size={[1.24,.19,.96]} color="#485b52"/>
    {[-.583,.583].map(x=><Box key={x} at={[x,.26,0]} size={[.077,.21,.95]} color={rim}/>)}
    {[-.458,.458].map(z=><Box key={z} at={[0,.26,z]} size={[1.19,.21,.07]} color={rim}/>)}
    <Box at={[0,.27,0]} size={[1.08,.11,.83]} color={`#${soil.getHexString()}`}/>
    {Array.from({length:96},(_,i)=>{
      const x=(i%12-5.5)*.084+Math.sin(i*38)*.018;
      const z=(Math.floor(i/12)-3.5)*.095+Math.cos(i*46)*.019;
      return covered?<mesh key={i} position={[x,.348+i%4*.012,z]} rotation={[.08*(i%3),i*1.29,.11*(i%4-2)]}>
        <boxGeometry args={[.04+i%6*.019,.017+i%4*.006,.036+i%5*.013]}/>
        <meshStandardMaterial color={wood[i%wood.length]} roughness={.93} side={DoubleSide}/>
      </mesh>:<mesh key={i} position={[x,.329,z]} rotation={[i,.65,0]}>
        <icosahedronGeometry args={[.009+i%7*.0025,0]}/>
        <meshStandardMaterial color={i%11===0?'#a79b7f':soil} roughness={.97}/>
      </mesh>;
    })}
  </>;
}
