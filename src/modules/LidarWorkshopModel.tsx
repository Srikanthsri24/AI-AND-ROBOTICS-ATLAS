import {useEffect,useRef,type RefObject} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Grid,Line,OrbitControls} from '@react-three/drei';
import {Group} from 'three';
import Assembly from './LidarAssembly';
import Lighting from './WorkshopStudioLighting';
import Inspection,{lidarPartOwner,type LidarAnchor} from './LidarInspection';
import {lidarMm} from '../data/lidar-workshop-layout';
import {lidarWorkshopReading,type LidarWorkshopEnvironment,type LidarWorkshopState} from '../data/lidar-workshop-simulation';
const ignoreHit=()=>null;
export default function LidarWorkshopModel({progress,selected,select,name,anchor,focus,view,viewVersion,runtime,env,overlay,onHandling}:{progress:number;selected:string;select:(id:string)=>void;name:string;anchor:RefObject<LidarAnchor|null>;focus:number;view:'drone'|'bench'|'radio';viewVersion:number;runtime:LidarWorkshopState;env:LidarWorkshopEnvironment;overlay:boolean;onHandling:(busy:boolean)=>void}){
 const {scene,camera}=useThree(),controls=useRef<any>(null),y=useRef(28),handling=useRef<boolean|null>(null),phase=useRef(0),virtual=env.mode==='virtual';
 useEffect(()=>{handling.current=null;},[virtual]);
 useFrame((_,dt)=>{if(camera.position.y<.04)camera.position.y=.04;const root=scene.getObjectByName('lidar-drone-root') as Group|undefined;if(!root)return;if(virtual&&env.powered&&runtime.host?.running)phase.current+=Math.min(.05,dt)*12;for(const n of [1,2,3,4]){const prop=scene.getObjectByName(`lidar-propeller-${n}`);if(prop)prop.rotation.y=([2,4].includes(n)?1:-1)*phase.current;}y.current+=Math.sign(runtime.y-y.current)*Math.min(Math.abs(runtime.y-y.current),140*Math.min(.05,dt));root.position.y=y.current;const busy=Math.abs(y.current-runtime.y)>.001;if(busy!==handling.current){handling.current=busy;onHandling(busy);}});
 const ray=lidarWorkshopReading(runtime,env),line=ray.hit?[ray.origin.map(n=>n*lidarMm) as [number,number,number],ray.hit.map(n=>n*lidarMm) as [number,number,number]]:undefined;
 return <><color attach='background' args={['#edf0f8']}/><Lighting/><hemisphereLight args={['#fff6e7','#788399',1.25]}/><directionalLight position={[-5,28,-6]} intensity={2.2} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-35} shadow-camera-right={35} shadow-camera-top={40} shadow-camera-bottom={-40} shadow-bias={-.0002} shadow-normalBias={.005}/>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.012,-15]} receiveShadow raycast={ignoreHit}><planeGeometry args={[90,110]}/><meshStandardMaterial color='#d9dee9' roughness={.85}/></mesh><Grid raycast={ignoreHit} position={[0,-.005,-15]} args={[70,95]} cellSize={1} sectionSize={5} cellColor='#c3c5d4' sectionColor='#a7adc2' cellThickness={.3} sectionThickness={.5} fadeDistance={90}/>
 <group scale={lidarMm} onPointerDown={e=>{const id=lidarPartOwner(e.object);if(!id)return;e.stopPropagation();anchor.current={object:e.object,point:e.object.worldToLocal(e.point.clone())};select(id);}}><Assembly {...{progress,selected,select}} powered={env.powered} showHost={progress>=5} showBench={progress>6} cardDistance={env.cardDistance} cardX={env.cardX} cardYaw={env.cardYaw} droneY={y.current} droneZ={runtime.z} propellers={virtual} propellerAngle={0} screen={{title:virtual?'Virtual approach':'Python · range.front',reading:runtime.host?.running?(runtime.host.rows.at(-1)?.distance!==null&&runtime.host.rows.at(-1)?.distance!==undefined?runtime.host.rows.at(-1)!.distance+' mm':'No valid return'):'Logger stopped',status:runtime.host?.paused?'Consumer paused':runtime.host?.running?(runtime.host.advancing?'ADVANCE':'HOLD'):(virtual?'Illustrative browser controller':'Bench · motors stopped')}}/></group>
 {progress===7&&overlay&&env.powered&&!handling.current&&line&&<Line raycast={ignoreHit} points={line} color='#8663ca' lineWidth={1.4} dashed dashSize={.22} gapSize={.16}/>}
 <OrbitControls makeDefault ref={controls} target={[0,1.6,0]} minDistance={.15} maxDistance={120} maxPolarAngle={Math.PI-.01}/><Inspection {...{selected,anchor,focus,view,viewVersion,progress,virtual}} name={name} droneZ={runtime.z}/></>;
}
