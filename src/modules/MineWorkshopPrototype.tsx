import type { ThreeEvent } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Mechanical from './MineWorkshopMechanical';
import Stations from './MineWorkshopStations';
import Motion from './MineWorkshopAssemblyMotion';
import Lighting from './WorkshopStudioLighting';
import type { MineInputs, MineSession } from '../data/mine-workshop';
const target:[number,number,number]=[0,1,0];
/** Private, authored teaching model. Publication waits for assembly, inspection and full UI verification. */
export type MineWorkshopPrototypeProps={selected?:string;select?:(id:string)=>void;session:MineSession;input:MineInputs;powered?:boolean;assembly?:number;controls?:boolean;onSurface?:(event:ThreeEvent<PointerEvent>)=>void};
export default function MineWorkshopPrototype({selected='',select=()=>{},session,input,powered=false,controls=true,onSurface,assembly=7}:MineWorkshopPrototypeProps){
 return <><Lighting/><color attach="background" args={['#edf0f8']}/><hemisphereLight args={['#fff4ee','#62708c',1]}/><directionalLight position={[-3,8,6]} intensity={2.2} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-6} shadow-camera-right={6} shadow-camera-top={6} shadow-camera-bottom={-6} shadow-camera-near={.1} shadow-camera-far={25} shadow-bias={-.001} shadow-normalBias={.005}/><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.34,0]} receiveShadow raycast={()=>null}><planeGeometry args={[18,18]}/><meshStandardMaterial color="#d8dbe6" roughness={.9}/></mesh><group name="mine-workshop-model" onPointerDown={onSurface}><Mechanical {...{selected,select}}/><Stations {...{selected,select,session,input,assembly}} powered={powered&&assembly===7}/></group><Motion progress={assembly}/>{controls&&<OrbitControls makeDefault target={target} minDistance={.12} maxDistance={20} maxPolarAngle={Math.PI/2-.01}/>}</>;
}
