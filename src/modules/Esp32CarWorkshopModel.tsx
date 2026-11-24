import {memo,useEffect,useMemo,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {Grid,OrbitControls} from '@react-three/drei';
import {Group} from 'three';
import BluetoothCarMechanics from './BluetoothCarMechanics';
import Esp32CarBoard from './Esp32CarBoard';
import Esp32CarCarrier from './Esp32CarCarrier';
import Esp32CarPulldown from './Esp32CarPulldown';
import Esp32CarUsbCable from './Esp32CarUsbCable';
import {CarCableRoutes} from './BluetoothCarWiring';
import {espCarLayout as d,espCarMounts} from '../data/esp32-car-layout';
import {espCarWires} from '../data/esp32-car-wiring';
import BluetoothWorkshopBoard from './BluetoothWorkshopBoards';
import {Mount} from './RoverWorkshopModel';
import {bluetoothCarBreakoutScale,type CarPoint} from '../data/bluetooth-car-layout';
import type {BluetoothCarPose} from '../data/bluetooth-car-motion';
const Mechanics=memo(BluetoothCarMechanics),Controller=memo(Esp32CarBoard),Board=memo(BluetoothWorkshopBoard),Carrier=memo(Esp32CarCarrier),Pulldown=memo(Esp32CarPulldown);
export default function Esp32CarWorkshopModel({stage,selected,select,pose,lift=d.standLift,stand=true,standZ=.20,aa=false,usb=false,modeJumper=false,plugLift,wireStep=0,leftReversed=false,rightReversed=false,onAssembly}:{stage:number;selected:string;select:(id:string)=>void;pose:BluetoothCarPose;lift?:number;stand?:boolean;standZ?:number;aa?:boolean;usb?:boolean;modeJumper?:boolean;plugLift?:number;wireStep?:number;leftReversed?:boolean;rightReversed?:boolean;onAssembly?:(busy:boolean)=>void}){
 const wires=useMemo(()=>espCarWires({leftReversed,rightReversed,modeJumper,plugLift}).filter(w=>w.step<=wireStep),[leftReversed,rightReversed,modeJumper,plugLift,wireStep]);
 const car=useRef<Group>(null),controls=useRef<any>(null),{scene,camera,size}=useThree(),lastAssembly=useRef<boolean|null>(null);const spins=useRef<{left?:Group;right?:Group;caster?:Group;swivel?:Group}>({});
 useEffect(()=>{if(!controls.current)return;const phone=size.width<500,base:CarPoint=phone?[5,6,8]:[4.7,4.5,6.5],fit=Math.max(1,(phone?.70:.90)/(size.width/Math.max(1,size.height))),point:CarPoint=[base[0]*fit,.9+(base[1]-.9)*fit,base[2]*fit];camera.position.set(point[0]+pose.x,point[1],point[2]+pose.z);controls.current.target.set(pose.x,.9,pose.z);controls.current.maxDistance=Math.max(22,camera.position.distanceTo(controls.current.target)*1.1);controls.current.update();},[size.width,size.height,camera]);
 useEffect(()=>{lastAssembly.current=null;spins.current={};},[stage,wireStep]);
 useFrame(()=>{
  const body=car.current,cache=spins.current;
  if(body){
   if(stage>=2){cache.left??=body.getObjectByName('bluetooth-left-wheel-spin') as Group;cache.right??=body.getObjectByName('bluetooth-right-wheel-spin') as Group;if(cache.left)cache.left.rotation.x=pose.leftAngle;if(cache.right)cache.right.rotation.x=pose.rightAngle;}
   if(stage>=3){cache.caster??=body.getObjectByName('bluetooth-caster-roll') as Group;cache.swivel??=body.getObjectByName('bluetooth-caster-swivel') as Group;
    if(cache.swivel)cache.swivel.rotation.y=pose.casterAngle??0;if(cache.caster)cache.caster.rotation.x=pose.casterRoll??0;
   }
  }
  if(lastAssembly.current===false)return;const busy=scene.getObjectsByProperty('name','workshop-mount').some(o=>o.position.length()>1e-6)||scene.getObjectsByProperty('name','bluetooth-strap-fit').some(o=>o.userData.busy)||scene.getObjectsByProperty('name','bluetooth-wire-route').some(o=>o.userData.busy)||scene.getObjectsByProperty('name','esp-carrier-jaws').some(o=>o.userData.busy);if(busy!==lastAssembly.current){lastAssembly.current=busy;onAssembly?.(busy);}});
 return <><color attach='background' args={['#eef0f8']}/><hemisphereLight args={['#fff2de','#768397',2.0]}/><directionalLight position={[-4,8,5]} intensity={3.0} castShadow shadow-bias={-.0002} shadow-normalBias={.012} shadow-mapSize={[2048,2048]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7}/><mesh rotation={[-Math.PI/2,0,0]} position={[0,.135,0]} receiveShadow><planeGeometry args={[40,40]}/><meshStandardMaterial color='#d5d9e2' roughness={.83}/></mesh><Grid position={[0,.141,0]} args={[14,14]} cellSize={.5} sectionSize={2} cellColor='#a5a5bb' sectionColor='#898da9' cellThickness={.35} sectionThickness={.65} fadeDistance={20}/>
 {stand&&<group userData={{partId:'stand'}} onClick={e=>{e.stopPropagation();select('stand');}}><mesh position={[0,.60,standZ]} castShadow receiveShadow><boxGeometry args={[.50,.92,.90]}/><meshStandardMaterial color={selected==='stand'?'#b78be8':'#4a425c'} roughness={.8}/></mesh><mesh position={[0,1.055,standZ]}><boxGeometry args={[.58,.01,.98]}/><meshStandardMaterial color='#c3b9ce' roughness={.8}/></mesh></group>}
 <group ref={car} name='esp32-workshop-car' position={[pose.x,lift,pose.z]} rotation={[0,pose.yaw,0]}>
 <Mechanics {...{stage,selected,select,aa,usb}} mountsOverride={espCarMounts} supplyLabel='3V3' rearLabel='ESP32 DUAL LINK · 2WD'/>
 {stage>=4&&<Carrier {...{selected,select}} boardFitted={stage>=5}/>}
 {stage>=5&&<Mount from={[0,.7,0]}><group name='esp32-controller' position={d.controller.at}><Controller {...{selected,select}} powered={usb}/></group></Mount>}
 {stage>=6&&<Mount from={[.7,.8,0]}><group name='bluetooth-driver' scale={bluetoothCarBreakoutScale} position={d.driver.at} rotation={[0,d.driver.rotation,0]}><Board kind='tb6612' {...{selected,select}} powered={usb}/></group></Mount>}
 {wireStep>=13&&<Esp32CarUsbCable {...{selected,select}}/>}
 {wireStep>=8&&<Pulldown {...{selected,select}}/>}
 <CarCableRoutes {...{wires,selected,select}}/>
 </group><OrbitControls makeDefault ref={controls} target={[0,.9,0]} enablePan={false} minDistance={.35} maxDistance={22} maxPolarAngle={Math.PI/2-.03}/></>;
}
