import{OrbitControls}from'@react-three/drei';
import Basin from'./FloodGateBasinParts';
import Linkage from'./FloodGateLinkageParts';
import Lighting from'./WorkshopStudioLighting';
/** Private geometry reference. Servo casing / mounts, sensors and wiring follow. */
export default function FloodGatePrototype({selected,select,servoAngle=65,upMm=80,downMm=20}:{selected:string;select:(id:string)=>void;servoAngle?:number;upMm?:number;downMm?:number}){return <><Lighting/><color attach="background" args={['#edf0f8']}/><hemisphereLight args={['#fff5e6','#6c7890',1]}/><directionalLight position={[-4,8,6]} intensity={2.4} castShadow/><mesh rotation={[-Math.PI/2,0,0]} receiveShadow raycast={()=>null}><planeGeometry args={[24,18]}/><meshStandardMaterial color="#d3d5dc" roughness={.9}/></mesh><group name="flood-gate-mm" scale={.02}><Basin {...{selected,select,upMm,downMm}}/><Linkage {...{selected,select,servoAngle}}/></group><OrbitControls makeDefault target={[0,1.8,0]} maxDistance={80} minDistance={.1} maxPolarAngle={Math.PI-.01}/></>}
