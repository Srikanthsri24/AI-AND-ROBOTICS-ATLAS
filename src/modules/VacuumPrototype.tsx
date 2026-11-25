import {useEffect} from 'react';
import {OrbitControls} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import Jar from './VacuumJarParts';
import Bulb from './VacuumBulbParts';
import Lighting from './WorkshopStudioLighting';
import {vacuumMm} from '../data/vacuum-workshop-layout';
/** Private geometry / pressure-reference scene. Not a published workshop route. */
export default function VacuumPrototype({selected,select,compression=0,inletOpen=false,outletOpen=false,cutaway=false,capOffset=0}:{selected:string;select:(id:string)=>void;compression?:number;inletOpen?:boolean;outletOpen?:boolean;cutaway?:boolean;capOffset?:number}){const {camera}=useThree();useEffect(()=>{camera.position.set(11,8,13);camera.lookAt(2,1,0);},[camera]);return <><Lighting/><color attach='background' args={['#edf0f8']}/><hemisphereLight args={['#fff6e9','#7d8195',1.3]}/><directionalLight position={[-2,10,3]} intensity={2.3} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12}/><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.01,0]} receiveShadow raycast={()=>null}><planeGeometry args={[50,40]}/><meshStandardMaterial color='#dbe0eb' roughness={.85}/></mesh><group scale={vacuumMm}><Jar {...{selected,select,cutaway,capOffset}}/><Bulb {...{selected,select,compression,inletOpen,outletOpen,cutaway}}/></group><OrbitControls makeDefault target={[2,1,0]} minDistance={.2} maxDistance={45}/></>;}
