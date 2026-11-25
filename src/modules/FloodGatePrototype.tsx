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
/** Private geometry reference. Complete component / wiring reference; assembly and interactive UI follow. */
export default function FloodGatePrototype({selected,select,servoAngle=65,upMm=80,downMm=20,upGap=230,downGap=230,upEcho=true,downEcho=true,logicPower=true,servoPower=true,assembly=7}:{selected:string;select:(id:string)=>void;servoAngle?:number;upMm?:number;downMm?:number;upGap?:number;downGap?:number;upEcho?:boolean;downEcho?:boolean;logicPower?:boolean;servoPower?:boolean;assembly?:number}){return <><Lighting/><color attach="background" args={['#edf0f8']}/><hemisphereLight args={['#fff5e6','#6c7890',1]}/><directionalLight position={[-4,8,6]} intensity={2.4} castShadow/><mesh rotation={[-Math.PI/2,0,0]} receiveShadow raycast={()=>null}><planeGeometry args={[24,18]}/><meshStandardMaterial color="#d3d5dc" roughness={.9}/></mesh><group name="flood-gate-mm" scale={.02}><Basin {...{selected,select,upMm,downMm}}/><Linkage {...{selected,select,servoAngle}}/><Supports {...{selected,select,upGap,downGap}}/><Electrical {...{selected,select,logicPower,servoPower}}/><Wiring {...{selected,select,upGap,downGap,upEcho,downEcho}}/><Servo {...{selected,select,servoAngle}}/>{(['up','down'] as const).map(side=><group key={side} position={gateSensorPosition(side,side==='up'?upGap:downGap)} rotation={[Math.PI/2,0,0]}><Sonar {...{selected,select}} partPrefix={`gate-${side}-`}/></group>)}</group><AssemblyMotion progress={assembly}/><OrbitControls makeDefault target={[0,1.8,0]} maxDistance={80} minDistance={.1} maxPolarAngle={Math.PI-.01}/></>}
