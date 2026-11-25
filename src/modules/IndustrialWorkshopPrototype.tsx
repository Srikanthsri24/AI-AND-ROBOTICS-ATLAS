import type {ThreeEvent} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import Panel from './IndustrialPanelParts';
import Stop from './IndustrialStopParts';
import Button from './IndustrialButtonParts';
import Indicators from './IndustrialIndicatorParts';
import Controller,{type IndustrialControllerInspection} from './IndustrialControllerParts';
import Wiring from './IndustrialWiring';
import Network from './IndustrialNetworkParts';
import Conveyor from './IndustrialConveyorParts';
import Motion from './IndustrialAssemblyMotion';
import Lighting from './WorkshopStudioLighting';
import {industrialOutputs,industrialFresh,type IndustrialInputs} from '../data/industrial-workshop';
import type {IndustrialSession} from '../data/industrial-session';
const target:[number,number,number]=[0,.25,0];
/** Private staging model; publication awaits inspection and complete operating interface checks. */
export default function IndustrialWorkshopPrototype({selected='',select=()=>{},session,input,assembly=7,stroke=0,stopConnected=true,inspection='none',controls=true,onSurface}:{selected?:string;select?:(id:string)=>void;session:IndustrialSession;input:IndustrialInputs;assembly?:number;stroke?:number;stopConnected?:boolean;inspection?:IndustrialControllerInspection;controls?:boolean;onSurface?:(event:ThreeEvent<PointerEvent>)=>void}){
 const powered=input.powered&&assembly===7&&inspection==='none',lights=industrialOutputs(session.clock,powered),r=session.receiver.record;
 const record=r?[r.uptimeMs,r.temperature,r.vibration,r.stopOpen?1:0,r.status].join(','):'Waiting for a status packet';
 return <><Lighting/><color attach="background" args={['#edf0f8']}/><hemisphereLight args={['#fff4ee','#62708c',1]}/><directionalLight position={[-3,8,6]} intensity={2.2} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-camera-near={.1} shadow-camera-far={25} shadow-bias={-.001} shadow-normalBias={.005}/><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.145,0]} receiveShadow raycast={()=>null}><planeGeometry args={[16,16]}/><meshStandardMaterial color="#d8dbe6" roughness={.9}/></mesh>
 <group name="industrial-control-foundation" scale={.01} onPointerDown={onSurface}>
  <Panel {...{selected,select}} temperatureAdc={input.temperatureAdc} vibrationAdc={input.vibrationAdc}/>
  <Stop {...{selected,select,stroke}}/><Button {...{selected,select}} pressed={powered&&input.buttonPressed}/>
  <Indicators {...{selected,select,powered}} {...lights}/>
  <Controller {...{selected,select,powered,inspection}} link={input.link}/>
  <group visible={inspection==='none'}><Wiring {...{selected,select,assembly}} stopConnected={stopConnected}/><Network {...{selected,select,powered,assembly,record}} connected={input.link} fresh={industrialFresh(session.receiver,session.nowMs)}/></group>
  <Conveyor {...{selected,select}} travelMm={session.conveyorUm/1000}/>
 </group><Motion progress={assembly}/>{controls&&<OrbitControls makeDefault target={target} minDistance={.08} maxDistance={12} maxPolarAngle={Math.PI/2-.01}/>}</>;
}
