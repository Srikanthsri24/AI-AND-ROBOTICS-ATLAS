import { SolarMeterSolid as Box } from './SolarMeterParts';

export function ParkingBlock({color='#8a705a'}:{color?:string}){
  return <>
    <Box at={[0,.214,0]} size={[1.17,.43,.61]} color={color}/>
    <Box at={[0,.433,0]} size={[1.15,.022,.59]} color="#ad926f"/>
    <Box at={[.18,.23,-.311]} size={[.24,.070,.016]} color="#ead7a2"/>
  </>;
}
