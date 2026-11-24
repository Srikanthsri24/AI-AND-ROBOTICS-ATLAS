import {useEffect,useMemo,useRef} from 'react';
import {Object3D,Path,Shape,SpotLight} from 'three';
import type {BeaconLamp} from '../data/beacon-rover-optics';
export const beaconFlashlightParts=[['beacon-lamp','Battery flashlight','A separate battery flashlight supplies the classroom target light. Its beam changes the two CdS divider readings; it has no wire to the rover.'],['beacon-cradle','Flashlight calibration cradle','The supported flashlight stays at sensor height. Move the cradle to the start and near positions to compare room, detection and arrival readings.']] as const;
export default function BeaconRoverFlashlight({lamp,selected,select}:{lamp:BeaconLamp;selected:string;select:(id:string)=>void}){
 const light=useRef<SpotLight>(null),target=useMemo(()=>new Object3D(),[]),bezel=useMemo(()=>{const s=new Shape();s.absarc(0,0,.245,0,Math.PI*2,false);const hole=new Path();hole.absarc(0,0,.20,0,Math.PI*2,true);s.holes.push(hole);return s;},[]);
 useEffect(()=>{target.position.set(0,0,2);if(light.current){light.current.target=target;light.current.target.updateMatrixWorld();}},[target]);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color;
 return <group position={lamp.at} rotation={[0,lamp.yaw,0]}>
 <group userData={{partId:'beacon-cradle'}} onClick={e=>{e.stopPropagation();select('beacon-cradle');}}>
 <mesh position={[0,.205-lamp.at[1],-.85]} castShadow receiveShadow><boxGeometry args={[1.05,.14,1.4]}/><meshStandardMaterial color={c('beacon-cradle','#4a425d')} roughness={.62}/></mesh>
 <mesh position={[0,(.275+lamp.at[1]-.27)/2-lamp.at[1],-.85]} castShadow><cylinderGeometry args={[.055,.075,lamp.at[1]-.545,24]}/><meshStandardMaterial color={c('beacon-cradle','#a7aab3')} metalness={.8} roughness={.32}/></mesh>
 <mesh position={[0,-.25,-.85]} castShadow><boxGeometry args={[.40,.10,.35]}/><meshStandardMaterial color={c('beacon-cradle','#4a425d')}/></mesh>
 {[-1,1].map(side=><mesh key={side} position={[side*.245,-.085,-.85]} castShadow><boxGeometry args={[.07,.30,.28]}/><meshStandardMaterial color={c('beacon-cradle','#4a425d')}/></mesh>)}
 </group>
 <group userData={{partId:'beacon-lamp'}} onClick={e=>{e.stopPropagation();select('beacon-lamp');}}>
 <mesh position={[0,0,-.95]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.215,.215,1.5,48]}/><meshStandardMaterial color={c('beacon-lamp','#343843')} metalness={.6} roughness={.36}/></mesh>
 {Array.from({length:9},(_,i)=><mesh key={i} position={[0,0,-.65-i*.11]} rotation={[Math.PI/2,0,0]} castShadow><torusGeometry args={[.216,.009,8,48]}/><meshStandardMaterial color={c('beacon-lamp','#262933')} roughness={.82}/></mesh>)}
 <mesh position={[0,0,-1.72]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.225,.225,.08,48]}/><meshStandardMaterial color={c('beacon-lamp','#626374')} metalness={.7} roughness={.3}/></mesh>
 <mesh position={[0,0,-.20]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.24,.215,.20,48]}/><meshStandardMaterial color={c('beacon-lamp','#656878')} metalness={.8} roughness={.3}/></mesh>
 <mesh position={[0,0,-.065]}><extrudeGeometry args={[bezel,{depth:.07,bevelEnabled:false,curveSegments:48}]}/><meshStandardMaterial color={c('beacon-lamp','#b1b5bf')} metalness={.85} roughness={.24}/></mesh>
 <mesh position={[0,0,-.081]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.195,.195,.008,48]}/><meshStandardMaterial color='#e7ded0' emissive='#fff0cc' emissiveIntensity={lamp.on?2*lamp.power:0} roughness={.25}/></mesh>
 <mesh position={[0,0,.004]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.20,.20,.008,48]}/><meshPhysicalMaterial color='#f4f5ff' transparent opacity={.18} roughness={.06} metalness={.05} depthWrite={false}/></mesh>
 <mesh position={[0,.218,-.40]} castShadow><boxGeometry args={[.11,.04,.16]}/><meshStandardMaterial color={c('beacon-lamp',lamp.on?'#8b65bb':'#272931')} roughness={.8}/></mesh>
 </group>
 <primitive object={target}/><spotLight ref={light} position={[0,0,.02]} color='#fff0cf' intensity={lamp.on?22*lamp.power:0} angle={.8} penumbra={.45} distance={20} decay={2}/>
 </group>;
}
