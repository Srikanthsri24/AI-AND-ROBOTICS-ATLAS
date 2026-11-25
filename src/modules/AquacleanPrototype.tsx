import type{ThreeEvent}from'@react-three/fiber';
import Layers from'./AquacleanInspectionLayers';
import type{AquaInspectionMode}from'../data/aquaclean-inspection';
import Mechanical from'./AquacleanMechanicalParts';
import Motor from'./AquacleanMotorParts';
import Sensor from'./AquacleanSensorParts';
import Controller from'./AquacleanControllerParts';
import Driver from'./AquacleanDriverParts';
import Battery from'./AquacleanBatteryParts';
import Panel from'./AquacleanPanelParts';
import Wiring from'./AquacleanWiring';
import Network from'./AquacleanNetworkParts';
import Litter from'./AquacleanLitterParts';
import Loom from'./AquacleanLoomParts';
import Motion from'./AquacleanAssemblyMotion';
import Lighting from'./WorkshopStudioLighting';
import{aquaCollectionInitial,type AquaCollection}from'../data/aquaclean-collection';
export type AquacleanPrototypeProps={onSurface?:(event:ThreeEvent<PointerEvent>)=>void;inspection?:AquaInspectionMode;selected:string;select:(id:string)=>void;assembly?:number;angle?:number;gap?:number;powered?:boolean;motorPower?:boolean;button?:boolean;echo?:boolean;link?:boolean;record?:string;fresh?:boolean;collection?:AquaCollection};
/** Private until the complete workshop interaction / inspection flow is verified. */
export default function AquacleanPrototype({onSurface,inspection='none',selected,select,assembly=7,angle=0,gap=200,powered=false,motorPower=false,button=false,echo=true,link=true,record='Waiting for a status packet',fresh=false,collection=aquaCollectionInitial()}:AquacleanPrototypeProps){const ready=assembly>=7,rotor=ready?angle:0,physicalGap=ready?gap:200,logicPower=ready&&inspection==='none'&&powered,drivePower=ready&&inspection==='none'&&motorPower,props={selected,select};return <><Lighting/><hemisphereLight args={['#fff5e8','#65738b',1]}/><directionalLight position={[-4,8,6]} intensity={2.4} castShadow/><color attach="background" args={['#edf0f8']}/><mesh rotation={[-Math.PI/2,0,0]} receiveShadow raycast={()=>null}><planeGeometry args={[26,20]}/><meshStandardMaterial color="#d1d5df" roughness={.92}/></mesh><group name="aquaclean-mm" scale={.02} onPointerDown={onSurface}><Mechanical {...props} rotorDegrees={rotor}/><Motor {...props} rotorDegrees={rotor}/><Sensor {...props} gapMm={physicalGap}/><Loom {...props}/><Controller {...props} powered={logicPower} link={link}/><Driver {...props}/><Battery {...props} motorPower={drivePower}/><Panel {...props} pressed={ready&&button}/><Wiring {...props} echoConnected={echo} assembly={assembly}/><Network {...props} connected={link} powered={logicPower} assembly={assembly} record={ready?record:'Waiting for a status packet'} fresh={ready&&fresh}/><Litter {...props} collection={ready?collection:aquaCollectionInitial()}/></group><Motion progress={assembly}/><Layers mode={inspection} assembly={assembly}/></>}
