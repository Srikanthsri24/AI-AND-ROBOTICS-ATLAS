import {useEffect} from 'react';
import {useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {MultiRangerDeck,FlowDeckV2} from './LidarDecks';
import Airframe from './LidarAirframe';
import Battery,{LidarMediumPins} from './LidarBattery';
import StudioLighting from './WorkshopStudioLighting';
import {lidarMm} from '../data/lidar-workshop-layout';
/** Unpublished reference scene for physical deck / socket validation before full drone assembly. */
export default function LidarDeckPreview({selected,select,battery=false,pins=false,multi=true,flow=true,connected=0,cellLift=0,pinLift=0}:{selected:string;select:(id:string)=>void;battery?:boolean;pins?:boolean;multi?:boolean;flow?:boolean;connected?:number;cellLift?:number;pinLift?:number}){const {camera}=useThree();useEffect(()=>{camera.position.set(5,5,-6);camera.lookAt(0,0,0);},[camera]);return <><StudioLighting/><color attach='background' args={['#eff0f8']}/><hemisphereLight args={['#fff7ea','#8e8aa7',1.7]}/><directionalLight position={[3,5,-2]} intensity={2.6}/><group scale={lidarMm}><Airframe {...{selected,select}}/>{multi&&<MultiRangerDeck {...{selected,select}}/>}{flow&&<FlowDeckV2 {...{selected,select}}/>}{battery&&<Battery {...{selected,select,connected,cellLift}}/>}{pins&&<LidarMediumPins {...{selected,select}} lift={pinLift}/>}</group><OrbitControls makeDefault target={[0,0,0]} minDistance={.1} maxDistance={15}/></>;}
