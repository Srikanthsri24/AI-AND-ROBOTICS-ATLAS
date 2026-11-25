import type {ThreeEvent} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Corridor from './EmergencyCorridorParts';
import Signals from './EmergencySignalParts';
import Circuit from './EmergencyCircuitParts';
import Controller from './EmergencyControllerParts';
import Piezo from './EmergencyPiezoParts';
import Wiring from './EmergencyWiring';
import Motion from './EmergencyAssemblyMotion';
import Lighting from './WorkshopStudioLighting';
import {emergencyOutputs,type EmergencyClock,type EmergencyInputs} from '../data/emergency-workshop';
export type EmergencyInspection='none'|'contacts'|'piezo';
export default function EmergencyWorkshopPrototype({selected='',select=()=>{},clock,input,assembly=6,inspection='none',controls=true,onSurface}:{selected?:string;select?:(id:string)=>void;clock:EmergencyClock;input:EmergencyInputs;assembly?:number;inspection?:EmergencyInspection;controls?:boolean;onSurface?:(event:ThreeEvent<PointerEvent>)=>void}){const powered=input.powered&&assembly===6&&inspection==='none',lights=emergencyOutputs(clock,powered);return <><Lighting/><color attach="background" args={['#edf0f8']}/><hemisphereLight args={['#fff4ee','#62708c',1]}/><directionalLight position={[-3,8,6]} intensity={2.2} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-camera-near={.1} shadow-camera-far={25} shadow-bias={-.001} shadow-normalBias={.005}/><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.145,0]} receiveShadow raycast={()=>null}><planeGeometry args={[16,16]}/><meshStandardMaterial color="#d8dbe6" roughness={.9}/></mesh><group name="emergency-control-foundation" scale={.01} onPointerDown={onSurface}><Corridor {...{selected,select}}/><Signals {...{selected,select,powered}} paths={lights.paths} beacon={lights.beacon}/><Circuit {...{selected,select}} alarmPressed={powered&&input.alarmPressed} resetPressed={powered&&input.resetPressed}/><Controller animateUsb {...{selected,select,powered}}/><Piezo {...{selected,select}} open={inspection==='piezo'}/><group visible={inspection==='none'}><Wiring {...{selected,select,assembly}}/></group></group><Motion progress={assembly}/>{controls&&<OrbitControls makeDefault target={[0,.4,0]} minDistance={.03} maxDistance={25} maxPolarAngle={Math.PI-.01}/>}</>;}
