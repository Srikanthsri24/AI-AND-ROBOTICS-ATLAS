import { SolarMeterSolid as Box } from './SolarMeterParts';

export function OmniWheelPart({hand=1,selected=false}:{hand?:number;selected?:boolean}){
  return <>
    <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.174,.174,.148,32]}/>
      <meshStandardMaterial color={selected?'#d6a55c':'#435762'} metalness={.48} roughness={.42}/>
    </mesh>
    <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.092,.092,.163,26]}/>
      <meshStandardMaterial color="#a9b5b8" metalness={.7} roughness={.33}/>
    </mesh>
    <Box at={[.086,0,0]} size={[.017,.066,.066]} color="#394551"/>
    {Array.from({length:9},(_,i)=><group key={i} rotation={[i*2*Math.PI/9,0,0]}>
      <mesh position={[0,.172,0]} rotation={[0,Math.PI/4*hand,Math.PI/2]}>
        <capsuleGeometry args={[.041,.105,6,14]}/><meshStandardMaterial color="#252b30" roughness={.79}/>
      </mesh>
    </group>)}
  </>;
}
