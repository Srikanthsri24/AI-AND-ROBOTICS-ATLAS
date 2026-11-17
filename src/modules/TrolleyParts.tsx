import { SolarMeterSolid as Box } from './SolarMeterParts';

export function HuskyLensPart({selected=false,tracking=false}:{selected?:boolean;tracking?:boolean}){
  return <>
    <Box at={[0,0,0]} size={[.58,.45,.113]} color={selected?'#b78d54':'#323a47'} metal={.34}/>
    <Box at={[0,-.014,-.067]} size={[.46,.32,.018]} color="#315864"/>
    <Box at={[.007,.026,.067]} size={[.31,.225,.028]} color="#222d35"/>
    <mesh position={[.007,.026,.095]} rotation={[Math.PI/2,0,0]}>
      <cylinderGeometry args={[.085,.085,.061,25]}/><meshStandardMaterial color="#566579" metalness={.52}/>
    </mesh>
    <mesh position={[.007,.026,.129]} rotation={[Math.PI/2,0,0]}>
      <cylinderGeometry args={[.057,.057,.017,23]}/><meshStandardMaterial color="#24263e" metalness={.58} roughness={.18}/>
    </mesh>
    <Box at={[-.198,.224,-.003]} size={[.085,.022,.083]} color="#a95241"/>
    <Box at={[.205,.153,.064]} size={[.041,.036,.013]} color="#7da8a0"/>
    {tracking&&<mesh position={[.205,.153,.079]}><sphereGeometry args={[.019,15,12]}/><meshBasicMaterial color="#88e7a7"/></mesh>}
  </>;
}

export function Drv8833Part(){
  return <>
    <Box at={[0,0,0]} size={[.60,.057,.49]} color="#214675"/>
    <Box at={[0,.05,.022]} size={[.19,.055,.14]} color="#252c33"/>
    <Box at={[0,.085,-.155]} size={[.39,.134,.146]} color="#398a96"/>
    {[-.21,.21].flatMap(x=>[-.08,0,.08,.16].map(z=><Box key={x+':'+z} at={[x,.045,z]} size={[.046,.027,.034]} color="#bca16c" metal={.49}/>))}
  </>;
}
