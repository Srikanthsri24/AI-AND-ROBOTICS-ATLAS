import {useEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {MultiRangerDeck,FlowDeckV2} from './LidarDecks';
import Airframe from './LidarAirframe';
import {lidarMm} from '../data/lidar-workshop-layout';
/** Unpublished reference scene for physical deck / socket validation before full drone assembly. */
export default function LidarDeckPreview({selected,select}:{selected:string;select:(id:string)=>void}){const {camera}=useThree();useEffect(()=>{camera.position.set(5,5,-6);camera.lookAt(0,0,0);},[camera]);return <><color attach='background' args={['#eff0f8']}/><hemisphereLight args={['#fff7ea','#8e8aa7',1.7]}/><directionalLight position={[3,5,-2]} intensity={2.6}/><group scale={lidarMm}><Airframe {...{selected,select}}/><MultiRangerDeck {...{selected,select}}/><FlowDeckV2 {...{selected,select}}/></group><OrbitControls makeDefault target={[0,0,0]} minDistance={.1} maxDistance={15}/></>;}
