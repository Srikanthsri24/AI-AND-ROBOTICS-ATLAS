import{useCallback,type RefObject}from'react';
import Inspection,{type FloodGateView}from'./FloodGateInspection';
import{floodOwner,floodSurfaceAnchor,floodVisible,type FloodAnchor}from'../data/flood-surface';
import{OrbitControls}from'@react-three/drei';
import AssemblyMotion from'./FloodGateAssemblyMotion';
import Basin from'./FloodGateBasinParts';
import Electrical from'./FloodGateElectricalParts';
import Wiring from'./FloodGateWiring';
import Supports from'./FloodGateSupportParts';
import Servo from'./FloodGateServoParts';
import Sonar from'./FloodSonarParts';
import{gateSensorPosition}from'../data/flood-gate-layout';
import Linkage from'./FloodGateLinkageParts';
import Lighting from'./WorkshopStudioLighting';
export type FloodGateModelProps={selected:string;select:(id:string)=>void;servoAngle:number;upMm:number;downMm:number;upGap:number;downGap:number;upEcho:boolean;downEcho:boolean;logicPower:boolean;servoPower:boolean;assembly:number;cutaway:boolean;sealCutaway?:boolean;anchor:RefObject<FloodAnchor|null>;focus:number;name:string;busy:boolean;view:FloodGateView;viewVersion:number};
export default function FloodGateWorkshopModel({selected,select,servoAngle,upMm,downMm,upGap,downGap,upEcho,downEcho,logicPower,servoPower,assembly,cutaway,sealCutaway=false,anchor,focus,name,busy,view,viewVersion}:FloodGateModelProps){const choose=useCallback((id:string)=>{if(!busy)select(id);},[busy,select]);return <><Lighting/><color attach="background" args={['#edf0f8']}/><hemisphereLight args={['#fff5e6','#6c7890',1]}/><directionalLight position={[-4,8,6]} intensity={2.4} castShadow/><mesh rotation={[-Math.PI/2,0,0]} receiveShadow raycast={()=>null}><planeGeometry args={[24,18]}/><meshStandardMaterial color="#d3d5dc" roughness={.9}/></mesh><group name="flood-gate-mm" scale={.02} onPointerDown={e=>{if(busy||!floodVisible(e.object))return;const id=floodOwner(e.object);if(!id)return;e.stopPropagation();anchor.current=floodSurfaceAnchor(e.object,e.point,e.face,e.instanceId);select(id);}}><Basin {...{selected,select:choose,upMm,downMm}}/><Linkage {...{selected,select:choose,servoAngle,sealCutaway}}/><Supports {...{selected,select:choose,upGap,downGap}}/><Electrical {...{selected,select:choose,logicPower,servoPower}}/><Wiring {...{selected,select:choose,upGap,downGap,upEcho,downEcho}}/><Servo {...{selected,select:choose,servoAngle,cutaway}}/>{(['up','down'] as const).map(side=><group key={side} position={gateSensorPosition(side,side==='up'?upGap:downGap)} rotation={[Math.PI/2,0,0]}><Sonar {...{selected,select:choose}} partPrefix={`gate-${side}-`}/></group>)}</group><AssemblyMotion progress={assembly}/><OrbitControls makeDefault target={[0,1.8,0]} maxDistance={80} minDistance={.1} maxPolarAngle={Math.PI-.01}/><Inspection {...{selected,name,anchor,focus,busy,view,viewVersion}} mountGapMm={Math.max(upGap,downGap)}/></>}
