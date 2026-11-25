import{memo,useCallback,type RefObject}from'react';
import Inspection,{type FloodView}from'./FloodInspection';
import{floodOwner,floodSurfaceAnchor,floodVisible,type FloodAnchor}from'../data/flood-surface';
import type{FloodWorkshopReading}from'../data/flood-workshop';
import {OrbitControls} from '@react-three/drei';
import Basin from './FloodBasinParts';
import AssemblyMotion from './FloodAssemblyMotion';
import Sonar from './FloodSonarParts';
import Panel from './FloodPanelParts';
import Uno from './BluetoothCarUno';
const UnoMemo=memo(Uno);
import Wiring from './FloodWiring';
import ControllerParts from './FloodControllerParts';
import Neighbourhood from './FloodNeighbourhood';
import Lighting from './WorkshopStudioLighting';
import {floodSensorPose} from '../data/flood-workshop-layout';
import {floodPlacement} from '../data/flood-wiring';
export type FloodModelProps={selected:string;select:(id:string)=>void;waterMm:number;mountGapMm:number;echoConnected:boolean;drillProgress:number;assembly:number;powered:boolean;reading:FloodWorkshopReading|null;anchor:RefObject<FloodAnchor|null>;focus:number;busy:boolean;view:FloodView;viewVersion:number;name:string};
export default function FloodWorkshopModel({selected,select,waterMm,mountGapMm,echoConnected,drillProgress,assembly,powered,reading,anchor,focus,busy,view,viewVersion,name}:FloodModelProps){
 const choose=useCallback((id:string)=>{if(!busy)select(id);},[busy,select]);
 return <><Lighting/><color attach="background" args={['#edf0f8']}/><hemisphereLight args={['#fff5e6','#6c7890',1]}/><directionalLight position={[-4,8,6]} intensity={2.4} castShadow shadow-mapSize={[2048,2048]}/><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.02,0]} receiveShadow raycast={()=>null}><planeGeometry args={[24,14]}/><meshStandardMaterial color="#d3d5dc" roughness={.9}/></mesh>
 <group name="flood-workshop-mm" scale={.02} onPointerDown={e=>{if(busy||!floodVisible(e.object))return;const id=floodOwner(e.object);if(!id)return;e.stopPropagation();anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);select(id);}}><Basin {...{selected,select:choose,waterMm,mountGapMm}}/><group position={floodSensorPose(mountGapMm)} rotation={[Math.PI/2,0,0]}><Sonar {...{selected,select:choose}}/></group><group position={floodPlacement.panel}><Panel {...{selected,select:choose}} red={powered&&!!reading?.red} amber={powered&&!!reading?.amber} green={powered&&!!reading?.green}/></group><group position={floodPlacement.uno} scale={50}><UnoMemo {...{selected,select:choose}} powered={powered}/></group><ControllerParts {...{selected,select:choose}} powered={powered}/><Wiring {...{selected,select:choose,mountGapMm,echoConnected}}/><Neighbourhood {...{selected,select:choose}} progress={drillProgress}/></group>
 <AssemblyMotion progress={assembly}/><OrbitControls makeDefault target={[-2,2,0]} minDistance={.1} maxDistance={80} maxPolarAngle={Math.PI-.01}/><Inspection {...{selected,name,anchor,focus,busy,view,viewVersion,mountGapMm}}/></>;
}
