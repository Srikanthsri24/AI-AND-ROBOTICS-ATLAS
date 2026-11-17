import {SolarMeterSolid as Box} from './SolarMeterParts';

export function DeskPaddle({pressed=false,selected=false,onPress}:{pressed?:boolean;selected?:boolean;onPress?:()=>void}){
  return <>
    <Box at={[0,.065,0]} size={[1.6,.13,1.07]} color="#866f59"/>
    {[-.56,.56].map(x=><Box key={x} at={[x,.15,.28]} size={[.17,.15,.21]} color="#746f65"/>)}
    {[-.52,.52].map(x=><Box key={x} at={[x,.19,-.41]} size={[.21,.19,.16]} color="#5a6369"/>)}
    <mesh position={[0,.28,-.41]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.046,.046,1.33,20]}/><meshStandardMaterial color="#adb4b7" metalness={.52}/></mesh>
    <group position={[0,.28,-.41]} rotation={[pressed?.060:-.19,0,0]} onClick={onPress}>
      <Box at={[0,.045,.42]} size={[1.53,.09,.88]} color={selected?'#dfa977':'#b9805b'}/>
      <Box at={[0,.097,.43]} size={[1.34,.026,.71]} color="#d9ac81"/>
      {[-.20,-.05,.10,.25].map(z=><Box key={z} at={[0,.113,.43+z]} size={[1.20,.011,.026]} color="#a47656"/>)}
    </group>
  </>;
}
