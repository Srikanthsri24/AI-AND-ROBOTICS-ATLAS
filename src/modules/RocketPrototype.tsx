import {useEffect} from 'react';
import {OrbitControls} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import Bottle from './RocketBottleParts';
import Stand from './RocketStandParts';
import Lighting from './WorkshopStudioLighting';
import {rocketAssemblyPose,rocketWorkshop as d} from '../data/rocket-workshop';
/** Private geometry / release reference; not a published workshop route. */
export default function RocketPrototype({selected,select,assembly=7,angle=45,open=0}:{selected:string;select:(id:string)=>void;assembly?:number;angle?:number;open?:number}){
 const {camera}=useThree(),p=rocketAssemblyPose(assembly);useEffect(()=>{camera.position.set(1.2,1,-1.8);camera.lookAt(0,.25,.08);},[camera]);
 return <><Lighting/><color attach='background' args={['#edf0f8']}/><hemisphereLight args={['#fff5e6','#6c7890',1]}/><directionalLight position={[-2,4,-3]} intensity={2.4} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-2} shadow-camera-right={2} shadow-camera-top={2} shadow-camera-bottom={-2}/><mesh rotation={[-Math.PI/2,0,0]} receiveShadow raycast={()=>null}><planeGeometry args={[8,8]}/><meshStandardMaterial color='#cbd5cd' roughness={.95}/></mesh>
 <group name='rocket-prototype-root' userData={{assembly,angle,open}}><Stand {...{selected,select,angle}} {...p} open={assembly===7?open:p.keepersOpen}/>{p.bottle&&<group name='rocket-body-position' position={[0,d.datum,p.bottleFront]} rotation={[0,0,(angle-90)*Math.PI/180]}><Bottle {...{selected,select}} trim={p.trimTravel} showTrim={p.trim}/></group>}</group><OrbitControls makeDefault target={[0,.25,.08]} minDistance={.05} maxDistance={8} maxPolarAngle={Math.PI-.01}/></>;
}
