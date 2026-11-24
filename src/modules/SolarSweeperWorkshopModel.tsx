import {memo,useEffect,useMemo,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Grid,OrbitControls} from '@react-three/drei';
import {Group} from 'three';
import MechanicsSource from './BluetoothCarMechanics';
import UnoSource from './BluetoothCarUno';
import BoardSource from './BluetoothWorkshopBoards';
import HeadSource from './SolarSweeperHead';
import MicroSource from './SolarSweeperUsbBreakout';
import PanelSource from './SolarSweeperPanel';
import ShadeSource from './SolarSweeperShade';
import CourseSource from './SolarSweeperCourse';
import CircuitSource from './SolarSweeperCircuit';
import UsbSource from './SolarSweeperUsb';
import {CarCableRoutes} from './BluetoothCarWiring';
import {solarSweeperWires} from '../data/solar-sweeper-wiring';
import {solarSweepPaperInitial,type SweepScrap} from '../data/solar-sweeper-paper';
import {Mount} from './RoverWorkshopModel';
import {solarSweeperLayout as d,solarCarMounts,solarExtraDrills} from '../data/solar-sweeper-layout';
import {bluetoothCarBreakoutScale} from '../data/bluetooth-car-layout';
import type {BluetoothCarPose} from '../data/bluetooth-car-motion';
const ignoreGridHit=()=>null;
const Mechanics=memo(MechanicsSource),Uno=memo(UnoSource),Board=memo(BoardSource),Head=memo(HeadSource),Micro=memo(MicroSource),Panel=memo(PanelSource),Shade=memo(ShadeSource),Course=memo(CourseSource),Circuit=memo(CircuitSource),Usb=memo(UsbSource);
const initialPaper=solarSweepPaperInitial();
/** Physical solar sweeper assembly, animated mechanisms and separate bench fixtures. */
export default function SolarSweeperWorkshopModel({stage,selected,select,pose,brushAngle=0,brushRaise=0,coverZ=6.2,paper=initialPaper,buttonPressed=false,onButton,aa=false,usb=false,lift=d.standLift,standZ=.2,onAssembly}:{stage:number;selected:string;select:(id:string)=>void;pose:BluetoothCarPose;brushAngle?:number;brushRaise?:number;coverZ?:number;paper?:SweepScrap[];buttonPressed?:boolean;onButton?:(down:boolean)=>void;aa?:boolean;usb?:boolean;lift?:number;standZ?:number;onAssembly?:(busy:boolean)=>void}){
 const wires=useMemo(()=>solarSweeperWires(brushRaise).filter(w=>w.step<=stage),[brushRaise,stage]);
 const car=useRef<Group>(null),controls=useRef<any>(null),{scene,camera,size}=useThree(),lastAssembly=useRef<boolean|null>(null),moving=useRef<{left?:Group;right?:Group;caster?:Group;swivel?:Group;brush?:Group;head?:Group;shade?:Group;paper?:Record<number,Group>}>({});
 useEffect(()=>{if(!controls.current)return;const fit=Math.max(size.width<500?1.3:1,.8/(size.width/Math.max(1,size.height)));camera.position.set(pose.x+6*fit,1+6*fit,pose.z-9*fit);controls.current.target.set(pose.x,1.4,pose.z-.8);controls.current.update();},[size.width,size.height,camera]);
 useEffect(()=>{lastAssembly.current=null;moving.current={};},[stage]);
 useFrame(()=>{const body=car.current,c=moving.current;c.shade??=scene.getObjectByName('solar-shade-slider') as Group;if(c.shade)c.shade.position.z=coverZ;if(stage>=15){c.paper??={};for(const piece of paper){c.paper[piece.id]??=scene.getObjectByName('solar-paper-'+piece.id) as Group;const node=c.paper[piece.id];if(node){node.position.set(piece.x,.144,piece.z);node.rotation.y=piece.yaw;}}}if(body){c.left??=body.getObjectByName('bluetooth-left-wheel-spin') as Group;c.right??=body.getObjectByName('bluetooth-right-wheel-spin') as Group;c.caster??=body.getObjectByName('bluetooth-caster-roll') as Group;c.swivel??=body.getObjectByName('bluetooth-caster-swivel') as Group;c.brush??=body.getObjectByName('solar-brush-spin') as Group;c.head??=body.getObjectByName('solar-head-lift') as Group;if(c.left)c.left.rotation.x=pose.leftAngle;if(c.right)c.right.rotation.x=pose.rightAngle;if(c.caster)c.caster.rotation.x=pose.casterRoll;if(c.swivel)c.swivel.rotation.y=pose.casterAngle;if(c.brush)c.brush.rotation.y=brushAngle;if(c.head)c.head.position.y=brushRaise;}
 if(lastAssembly.current===false)return;const busy=scene.getObjectsByProperty('name','workshop-mount').some(o=>o.position.length()>1e-6)||scene.getObjectsByProperty('name','bluetooth-strap-fit').some(o=>o.userData.busy)||scene.getObjectsByProperty('name','bluetooth-wire-route').some(o=>o.userData.busy)||scene.getObjectsByProperty('name','solar-panel-retainer').some(o=>o.userData.busy)||scene.getObjectsByProperty('name','solar-outlet-clip').some(o=>o.userData.busy);if(busy!==lastAssembly.current){lastAssembly.current=busy;onAssembly?.(busy);}});
 return <><color attach='background' args={['#eef0f8']}/><hemisphereLight args={['#fff2de','#768397',1.5]}/><directionalLight position={[0,10,0]} intensity={2.5} castShadow shadow-bias={-.0002} shadow-normalBias={.012} shadow-mapSize={[2048,2048]} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10}/>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,.135,0]} receiveShadow><planeGeometry args={[40,40]}/><meshStandardMaterial color='#d5d9e2' roughness={.83}/></mesh><Grid raycast={ignoreGridHit} position={[0,.141,0]} args={[22,22]} cellSize={.5} sectionSize={2} cellColor='#a5a5bb' sectionColor='#898da9' cellThickness={.35} sectionThickness={.65} fadeDistance={24}/>
 {stage>=13&&<Shade {...{selected,select}}/>}{stage>=15&&<Course {...{selected,select}}/>}
 <group userData={{partId:'stand'}} onClick={e=>{e.stopPropagation();select('stand');}}><mesh position={[0,.14+(d.chassis.bottom+d.standLift-.15)/2,standZ]} castShadow receiveShadow><boxGeometry args={[.5,d.chassis.bottom+d.standLift-.15,.9]}/><meshStandardMaterial color={selected==='stand'?'#b78be8':'#4a425c'}/></mesh><mesh position={[0,d.chassis.bottom+d.standLift-.005,standZ]}><boxGeometry args={[.58,.01,.98]}/><meshStandardMaterial color='#c3b9ce'/></mesh></group>
 <group ref={car} name='solar-sweeper-car' position={[pose.x,lift,pose.z]} rotation={[0,pose.yaw,0]}>
 <Mechanics {...{stage,selected,select,aa,usb}} mountsOverride={solarCarMounts} drillPoints={solarExtraDrills} rearLabel='SOLAR FELT SWEEPER · 2WD'/>
 {stage>=4&&<Mount from={[0,.7,0]}><group position={d.uno.at} rotation={[0,d.uno.rotation,0]}><Uno {...{selected,select}} powered={usb}/></group></Mount>}
 {stage>=5&&<><Mount from={[.7,.8,0]}><group position={d.driver.at} scale={bluetoothCarBreakoutScale}><Board kind='tb6612' {...{selected,select}} powered={usb}/></group></Mount><Mount from={[.7,.8,0]} delay={.25}><group position={d.brushDriver.at} scale={bluetoothCarBreakoutScale}><Board kind='tb6612' idPrefix='brush-driver' {...{selected,select}} powered={usb}/></group></Mount></>}
 {stage>=6&&<Mount from={[.5,.6,0]}><group position={d.usbBreakout.at}><Micro {...{selected,select}}/></group></Mount>}
 <Head {...{stage,selected,select}}/>{stage>=10&&<Circuit {...{selected,select}} pressed={buttonPressed} onButton={onButton}/>}<Panel {...{stage,selected,select}}/><Usb {...{stage,selected,select}}/><CarCableRoutes {...{wires,selected,select}}/>
 </group><OrbitControls makeDefault ref={controls} target={[0,1,-1.1]} enablePan minDistance={.25} maxDistance={35} maxPolarAngle={Math.PI/2-.025}/></>;
}
