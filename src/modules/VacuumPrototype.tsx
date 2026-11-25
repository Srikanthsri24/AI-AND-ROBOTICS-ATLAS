import {useEffect,type RefObject} from 'react';
import {OrbitControls} from '@react-three/drei';
import {useThree} from '@react-three/fiber';
import Jar from './VacuumJarParts';
import Bulb from './VacuumBulbParts';
import Lighting from './WorkshopStudioLighting';
import Hoses from './VacuumHoseParts';
import Filter from './VacuumFilterParts';
import Papers from './VacuumPaperParts';
import Inspection,{vacuumPartOwner,vacuumSurfaceAnchor,type VacuumAnchor} from './VacuumInspection';
import AirGuides from './VacuumAirGuides';
import {vacuumAssemblyPose} from '../data/vacuum-assembly';
import type {VacuumPaper} from '../data/vacuum-paper';
import type {VacuumAir} from '../data/vacuum-pneumatics';
import {vacuumNozzleAt} from '../data/vacuum-hose-geometry';
import {vacuumMm,type VacuumPoint} from '../data/vacuum-workshop-layout';
export type VacuumBenchProps={selected:string;select:(id:string)=>void;compression?:number;inletOpen?:boolean;outletOpen?:boolean;cutaway?:boolean;capOffset?:number;hoses?:boolean;restricted?:boolean;site?:number;gap?:number;papers?:VacuumPaper[];assembly?:number;leak?:number;air?:VacuumAir;showAir?:boolean;anchor?:RefObject<VacuumAnchor|null>;name?:string;focus?:number;viewVersion?:number;busy?:boolean;nozzle?:VacuumPoint;followPaper?:number|null};
/** Shared geometry for native fit checks and the bottle-vacuum workshop. */
export default function VacuumPrototype({selected,select,compression=0,inletOpen=false,outletOpen=false,cutaway=false,capOffset=0,hoses=false,restricted=false,site=0,gap=2,papers,assembly,leak=0,air,showAir=false,anchor,name=selected,focus=0,viewVersion=0,busy=false,nozzle,followPaper=null}:VacuumBenchProps){
 const pose=assembly===undefined?null:vacuumAssemblyPose(assembly),{camera}=useThree(),loose=assembly===undefined||assembly===13?leak:0;
 useEffect(()=>{camera.position.set(hoses?16:11,hoses?11:8,hoses?20:13);camera.lookAt(2,1,hoses?1.8:0);},[camera,hoses]);
 return <><Lighting/><color attach='background' args={['#edf0f8']}/><hemisphereLight args={['#fff6e9','#7d8195',1.3]}/><directionalLight position={[-2,10,3]} intensity={2.3} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12}/>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.01,0]} receiveShadow raycast={()=>null}><planeGeometry args={[50,40]}/><meshStandardMaterial color='#dbe0eb' roughness={.85}/></mesh>
 <group name='vacuum-assembly-root' userData={{assembly,leak}} scale={vacuumMm} onPointerDown={e=>{const id=vacuumPartOwner(e.object);if(!id||!anchor||busy)return;e.stopPropagation();anchor.current=vacuumSurfaceAnchor(e.object,e.point,e.face);select(id);}}>
 <Jar {...{selected,select,cutaway,capOffset}} {...(pose??{})} bottleX={(pose?.bottleX??0)-.64*loose} bottleRoll={(pose?.bottleRoll??0)+Math.PI*.4*loose}/>
 {(!pose||pose.pumpVisible)&&<group name='vacuum-pump-connection' position={[pose?.pumpOffset??0,0,0]}><Bulb {...{selected,select,compression,inletOpen,outletOpen,cutaway}}/></group>}
 {hoses&&<><group position={[0,pose?.lift??0,0]}><Hoses {...{selected,select}} {...(pose??{})} nozzle={nozzle??vacuumNozzleAt(site,gap)} offset={pose?.capOffset??capOffset}/>{(!pose||pose.filterVisible)&&<Filter {...{selected,select,restricted}} offset={pose?.capOffset??capOffset} pouchOffset={pose?.filterOffset??0} tieVisible={pose?.tieVisible??true} tieTightness={pose?.tieTightness??1}/>}</group>{(!pose||pose.trayVisible)&&<Papers {...{selected,select,papers}}/>}</>}
 {showAir&&air&&(!pose||pose.ready)&&<AirGuides {...{air,site,gap}}/>}</group>
 <OrbitControls makeDefault target={[2,1,hoses?1.8:0]} minDistance={.12} maxDistance={45} maxPolarAngle={Math.PI-.01}/>
 {anchor&&<Inspection {...{selected,name,anchor,focus,viewVersion,busy,followPaper}} assembly={assembly??13}/>}</>;
}
