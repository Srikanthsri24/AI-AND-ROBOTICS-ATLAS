import {useFrame} from '@react-three/fiber';
import type {RefObject} from 'react';
import {radarAssemblyMotion,type RadarBenchMotion} from '../data/radar-assembly';
/** Resolve one authoritative physical pose before the hardware and assembly frame callbacks. */
export default function RadarMotionBridge({assembly,motion,live}:{assembly:RefObject<number>;motion:RefObject<RadarBenchMotion>;live?:RefObject<RadarBenchMotion>}){
 useFrame(()=>{motion.current=assembly.current<9?radarAssemblyMotion(assembly.current):live?.current??radarAssemblyMotion(9);},-4);
 return null;
}
