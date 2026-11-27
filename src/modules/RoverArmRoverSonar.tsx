import{memo,useLayoutEffect,useRef}from'react';import type{Group}from'three';
import Sensor from'./FloodSonarParts';import{raRoverSonarMount}from'../data/rover-arm-rover-range';
/** Place the detailed common sensor in this rover's own authored mount frame. */
function RoverArmRoverSonar({selected,choose}:{selected:string;choose:(id:string)=>void}){const root=useRef<Group>(null);useLayoutEffect(()=>{root.current?.traverse(o=>{if(o.userData.partId&&!o.name)o.name=o.userData.partId;});},[]);return <group ref={root} name="ra-rover-sonar-model" position={[...raRoverSonarMount.pcb]} rotation={[0,Math.PI,0]} scale={.02}><Sensor selected={selected} select={choose} partPrefix="ra-rover-" cpuGlyphs/></group>;}
export default memo(RoverArmRoverSonar);
