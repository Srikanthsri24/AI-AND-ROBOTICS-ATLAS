import { SolarMeterSolid as Box } from './SolarMeterParts';

export function SoloKnob({value,active}:{value:number;active:boolean}){
  return <group rotation={[0,(value-50)*.045,0]}>
    <mesh><cylinderGeometry args={[.17,.18,.16,26]}/><meshStandardMaterial color={active?'#cbb264':'#29394b'}/></mesh>
    <Box at={[0,.084,.077]} size={[.031,.008,.12]} color="#c6d0dd"/>
  </group>;
}
