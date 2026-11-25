import {OrbitControls} from '@react-three/drei';
import Basin from './FloodBasinParts';
import Sonar from './FloodSonarParts';
import Panel from './FloodPanelParts';
import Uno from './BluetoothCarUno';
import Wiring from './FloodWiring';
import Lighting from './WorkshopStudioLighting';
import {floodSensorPose} from '../data/flood-workshop-layout';
import {floodPlacement} from '../data/flood-wiring';
/** Unregistered geometry integration reference. The published workshop adds
 * calibrated runtime, progressive assembly and actual-surface inspection. */
export default function FloodWorkshopPrototype({selected,select,waterMm=80,mountGapMm=230,echoConnected=true}:{selected:string;select:(id:string)=>void;waterMm?:number;mountGapMm?:number;echoConnected?:boolean}){
 return <><Lighting/><color attach="background" args={['#edf0f8']}/><hemisphereLight args={['#fff5e6','#6c7890',1]}/><directionalLight position={[-4,8,6]} intensity={2.4} castShadow shadow-mapSize={[2048,2048]}/><mesh rotation={[-Math.PI/2,0,0]} position={[-2,-.02,0]} receiveShadow raycast={()=>null}><planeGeometry args={[18,14]}/><meshStandardMaterial color="#d3d5dc" roughness={.9}/></mesh>
 <group name="flood-workshop-mm" scale={.02}><Basin {...{selected,select,waterMm,mountGapMm}}/><group position={floodSensorPose(mountGapMm)} rotation={[Math.PI/2,0,0]}><Sonar {...{selected,select}}/></group><group position={floodPlacement.panel}><Panel {...{selected,select}} red={waterMm>=80&&echoConnected} amber={waterMm>=50&&waterMm<80&&echoConnected} green={waterMm<50&&echoConnected}/></group><group position={floodPlacement.uno} scale={50}><Uno {...{selected,select}} powered/></group><Wiring {...{selected,select,mountGapMm,echoConnected}}/></group>
 <OrbitControls makeDefault target={[-2,2,0]} minDistance={.1} maxDistance={28} maxPolarAngle={Math.PI-.01}/></>;
}
