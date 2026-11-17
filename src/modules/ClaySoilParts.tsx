import {SolarMeterSolid as Box} from './SolarMeterParts';

export function ClaySample({gap=false,cutaway=false,shade='#8d614c',selected=false}:{gap?:boolean;cutaway?:boolean;shade?:string;selected?:boolean}){
  const gapWidth=gap?.27:.043;
  const slab=(.99-gapWidth)/2;
  const center=(slab+gapWidth)/2;
  return <>
    <Box at={[0,.052,0]} size={[1.18,.10,.87]} color={selected?'#e0b185':'#aebabe'}/>
    {[-1,1].map(side=><Box key={side} at={[side*.563,.33,0]} size={[.035,.48,.84]} color="#afc3c4"/>)}
    <Box at={[0,.33,-.414]} size={[1.13,.48,.032]} color="#a1b7b8"/>
    {!cutaway&&<mesh position={[0,.33,.416]}><boxGeometry args={[1.13,.48,.025]}/><meshPhysicalMaterial color="#c9dede" roughness={.28} transparent opacity={.27} depthWrite={false}/></mesh>}
    {[-1,1].map(side=><group key={side} position={[side*center,0,0]}>
      <Box at={[0,.29,0]} size={[slab,.373,.73]} color={shade}/>
      {Array.from({length:26},(_,i)=><mesh key={i} position={[Math.sin(i*53)*slab*.43,.481,Math.cos(i*35)*.328]} rotation={[i,.72,0]}>
        <icosahedronGeometry args={[.012+i%8*.004,0]}/>
        <meshStandardMaterial color={i%5===0?'#bb9580':shade} roughness={.98}/>
      </mesh>)}
    </group>)}
  </>;
}
