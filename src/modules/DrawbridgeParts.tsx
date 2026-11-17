import {SolarMeterSolid as Box} from './SolarMeterParts';

export function DrawbridgeDeck({angle=0,highlighted=false}:{angle?:number;highlighted?:boolean}){
  return <group rotation={[0,0,angle]}>
    <Box at={[.66,0,0]} size={[1.32,.105,.79]} color={highlighted?'#d4a46e':'#ab805a'}/>
    <Box at={[.66,.058,0]} size={[1.29,.022,.66]} color="#46545c"/>
    {[.20,.43,.66,.89,1.12].map(x=><Box key={x} at={[x,.071,0]} size={[.10,.008,.014]} color="#eed7a2"/>)}
    {[-.365,.365].map(z=><Box key={z} at={[.66,.091,z]} size={[1.31,.083,.049]} color="#caa275"/>)}
    <mesh position={[.014,0,0]} rotation={[Math.PI/2,0,0]}>
      <cylinderGeometry args={[.055,.055,1.02,20]}/>
      <meshStandardMaterial color="#8a7860" roughness={.49}/>
    </mesh>
  </group>;
}

export function DrawbridgeLanding({highlighted=false}:{highlighted?:boolean}){
  return <group>
    <Box at={[.42,.23,0]} size={[.89,.46,.92]} color={highlighted?'#c69e72':'#ad885e'}/>
    <Box at={[.42,.474,0]} size={[.91,.032,.67]} color="#46545c"/>
    <Box at={[-.04,.329,0]} size={[.15,.086,.78]} color="#9c7957"/>
    <Box at={[.46,.491,0]} size={[.27,.009,.016]} color="#eed7a2"/>
  </group>;
}
