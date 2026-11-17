import {SolarMeterSolid as Box} from './SolarMeterParts';

export function SandySampleCup({dose=0,selected=false}:{dose?:number;selected?:boolean}){
  const soil=dose===0?'#c5a674':dose<=15?'#a18058':'#765d45';
  return <>
    <mesh position={[0,.04,0]}><cylinderGeometry args={[.34,.29,.08,44]}/><meshStandardMaterial color="#b7c2c2" roughness={.62}/></mesh>
    <mesh position={[0,.30,0]}><cylinderGeometry args={[.307,.282,.46,44]}/><meshStandardMaterial color={soil} roughness={.96}/></mesh>
    <mesh position={[0,.34,0]} renderOrder={3}><cylinderGeometry args={[.36,.30,.61,44,1,true]}/><meshPhysicalMaterial color={selected?'#ffdc9f':'#d4e4e5'} transparent opacity={.24} depthWrite={false} roughness={.31}/></mesh>
    <mesh position={[0,.642,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.358,.019,10,44]}/><meshStandardMaterial color={selected?'#eec886':'#d5deda'}/></mesh>
    <Box at={[0,.28,.342]} size={[.24,.13,.018]} color="#ded9c9"/>
    {Array.from({length:39},(_,i)=>{
      const radius=.292*Math.sqrt(i/39),angle=i*2.399963;
      return <mesh key={i} position={[radius*Math.cos(angle),.54,radius*Math.sin(angle)]}>
        <icosahedronGeometry args={[.011+i%7*.002,0]}/><meshStandardMaterial color={i%3===0?'#c9c0a0':soil} roughness={1}/>
      </mesh>;
    })}
  </>;
}

export function GraduatedWaterCylinder({dose=30,selected=false}:{dose?:number;selected?:boolean}){
  const fill=.16+dose*.015;
  return <>
    <mesh position={[0,.05,0]}><cylinderGeometry args={[.29,.27,.10,8]}/><meshStandardMaterial color={selected?'#d6a77b':'#708d98'}/></mesh>
    <mesh position={[0,.13+fill/2,0]}><cylinderGeometry args={[.123,.123,fill,32]}/><meshPhysicalMaterial color="#6eb6d1" roughness={.23} clearcoat={.5}/></mesh>
    <mesh position={[0,.67,0]} renderOrder={3}><cylinderGeometry args={[.14,.14,1.14,36,1,true]}/><meshPhysicalMaterial color="#d8eef6" transparent opacity={.28} depthWrite={false} roughness={.22}/></mesh>
    <mesh position={[0,1.25,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.14,.011,9,36]}/><meshStandardMaterial color="#bed4db"/></mesh>
    {Array.from({length:11},(_,i)=><Box key={i} at={[.012,.23+i*.087,.143]} size={[i%5===0?.104:.061,.015,.008]} color="#344d59"/>)}
  </>;
}
