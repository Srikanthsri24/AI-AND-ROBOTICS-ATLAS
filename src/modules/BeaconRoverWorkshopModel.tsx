import {memo,useEffect,useMemo,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Grid,OrbitControls} from '@react-three/drei';
import {Group} from 'three';
import MechanicsSource from './BluetoothCarMechanics';
import UnoSource from './BluetoothCarUno';
import BoardSource from './BluetoothWorkshopBoards';
import SensorsSource from './BeaconRoverSensors';
import DividersSource from './BeaconRoverDividers';
import LedSource from './BeaconRoverArrivalLed';
import FlashlightSource from './BeaconRoverFlashlight';
import BluetoothCarUsbCable from './BluetoothCarUsbCable';
import {CarCableRoutes} from './BluetoothCarWiring';
import {Mount} from './RoverWorkshopModel';
import {beaconCarLayout as d,beaconCarMounts,beaconSensorDrills} from '../data/beacon-rover-layout';
import {beaconSignalWires,beaconMotorWires} from '../data/beacon-rover-wiring';
import {bluetoothCarBreakoutScale,type CarPoint} from '../data/bluetooth-car-layout';
import type {BluetoothCarPose} from '../data/bluetooth-car-motion';
import {beaconOpticalHardware,type BeaconLamp} from '../data/beacon-rover-optics';
import {WorldLabel} from './LabWorkbench';
const SignalLabels=memo(function SignalLabels(){return <>{beaconOpticalHardware.sensors.map((sensor,i)=><WorldLabel key={sensor.id} position={sensor.at} className='btw-label br-signal-label' keepInView avoidOverlap><span>{i?'A1 · right light':'A0 · left light'}</span></WorldLabel>)}<WorldLabel position={[-.5762,1.54,.2886]} className='btw-label br-signal-label' keepInView avoidOverlap><span>D10 · arrival LED</span></WorldLabel></>;});
const ignoreGridHit=()=>null;
const Mechanics=memo(MechanicsSource),Uno=memo(UnoSource),Board=memo(BoardSource),Sensors=memo(SensorsSource),Dividers=memo(DividersSource),Led=memo(LedSource),Flashlight=memo(FlashlightSource);
export default function BeaconRoverWorkshopModel({stage,selected,select,pose,lamp,aa=false,usb=false,alert=false,lift=.15,stand=true,standZ=.2,onAssembly}:{stage:number;selected:string;select:(id:string)=>void;pose:BluetoothCarPose;lamp:BeaconLamp;aa?:boolean;usb?:boolean;alert?:boolean;lift?:number;stand?:boolean;standZ?:number;onAssembly?:(busy:boolean)=>void}){
 const wires=useMemo(()=>[...beaconSignalWires(),...beaconMotorWires()].filter(w=>w.step<=stage),[stage]);
 const car=useRef<Group>(null),controls=useRef<any>(null),{scene,camera,size}=useThree(),lastAssembly=useRef<boolean|null>(null),spins=useRef<{left?:Group;right?:Group;caster?:Group;swivel?:Group}>({});
 useEffect(()=>{if(!controls.current)return;const fit=Math.max(size.width<500?1.25:1,.8/(size.width/Math.max(1,size.height)));camera.position.set(pose.x+6*fit,1+7*fit,pose.z+8*fit);controls.current.target.set(pose.x,.9,pose.z-2.8);controls.current.update();},[size.width,size.height,camera]);
 useEffect(()=>{lastAssembly.current=null;spins.current={};},[stage]);
 useFrame(()=>{const body=car.current,c=spins.current;if(body){c.left??=body.getObjectByName('bluetooth-left-wheel-spin') as Group;c.right??=body.getObjectByName('bluetooth-right-wheel-spin') as Group;c.caster??=body.getObjectByName('bluetooth-caster-roll') as Group;c.swivel??=body.getObjectByName('bluetooth-caster-swivel') as Group;if(c.left)c.left.rotation.x=pose.leftAngle;if(c.right)c.right.rotation.x=pose.rightAngle;if(c.caster)c.caster.rotation.x=pose.casterRoll;if(c.swivel)c.swivel.rotation.y=pose.casterAngle;}
 if(lastAssembly.current===false)return;const busy=scene.getObjectsByProperty('name','workshop-mount').some(o=>o.position.length()>1e-6)||scene.getObjectsByProperty('name','bluetooth-strap-fit').some(o=>o.userData.busy)||scene.getObjectsByProperty('name','bluetooth-wire-route').some(o=>o.userData.busy);if(busy!==lastAssembly.current){lastAssembly.current=busy;onAssembly?.(busy);}});
 return <><color attach='background' args={['#eef0f8']}/><hemisphereLight args={['#fff2de','#768397',1.5]}/><directionalLight position={[-4,8,5]} intensity={2.5} castShadow shadow-bias={-.0002} shadow-normalBias={.012} shadow-mapSize={[2048,2048]} shadow-camera-left={-12} shadow-camera-right={12} shadow-camera-top={12} shadow-camera-bottom={-12}/>
 <mesh rotation={[-Math.PI/2,0,0]} position={[0,.135,0]} receiveShadow><planeGeometry args={[40,40]}/><meshStandardMaterial color='#d5d9e2' roughness={.83}/></mesh><Grid raycast={ignoreGridHit} position={[0,.141,0]} args={[22,22]} cellSize={.5} sectionSize={2} cellColor='#a5a5bb' sectionColor='#898da9' cellThickness={.35} sectionThickness={.65} fadeDistance={24}/>
 {stand&&<group userData={{partId:'stand'}} onClick={e=>{e.stopPropagation();select('stand');}}><mesh position={[0,.60,standZ]} castShadow receiveShadow><boxGeometry args={[.5,.92,.9]}/><meshStandardMaterial color={selected==='stand'?'#b78be8':'#4a425c'}/></mesh><mesh position={[0,1.055,standZ]}><boxGeometry args={[.58,.01,.98]}/><meshStandardMaterial color='#c3b9ce'/></mesh></group>}
 <Flashlight {...{lamp,selected,select}}/>
 <group ref={car} name='beacon-workshop-car' position={[pose.x,lift,pose.z]} rotation={[0,pose.yaw,0]}>
 <Mechanics {...{stage,selected,select,aa,usb}} mountsOverride={beaconCarMounts} drillPoints={beaconSensorDrills} rearLabel='CLASSROOM BEACON · 2WD'/>
 {stage>=4&&<Mount from={[0,.7,0]}><group position={d.uno.at} rotation={[0,d.uno.rotation,0]}><Uno {...{selected,select}} powered={usb}/></group></Mount>}
 {stage>=5&&<Mount from={[.7,.8,0]}><group position={d.driver.at} rotation={[0,d.driver.rotation,0]} scale={bluetoothCarBreakoutScale}><Board kind='tb6612' {...{selected,select}} powered={usb}/></group></Mount>}
 <Sensors {...{stage,selected,select}}/>
 {stage>=9&&<Mount from={[0,.5,0]}><Dividers {...{selected,select}}/><Led {...{selected,select}} on={usb&&alert}/></Mount>}
 {stage>=14&&usb&&<SignalLabels/>}<CarCableRoutes {...{wires,selected,select}}/>{stage>=13&&<BluetoothCarUsbCable {...{selected,select}}/>}
 </group><OrbitControls makeDefault ref={controls} target={[0,.9,-2.8]} enablePan minDistance={.30} maxDistance={35} maxPolarAngle={Math.PI/2-.03}/></>;
}
