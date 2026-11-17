import {DialFace, DialPointer} from './DialGaugeParts';
import {DrawbridgeDeck, DrawbridgeLanding} from './DrawbridgeParts';
import {LetterCatchBin, LetterFeedRamp, LetterTiltDeck} from './LetterSorterParts';
import { CardPanCamera, PanTarget } from './CameraPanParts';
import { AS5600Breakout, VanePointer, WindVanePivot } from './WindVaneParts';
import { ParkingLane, ParkingToyCar, StripedArm } from './ParkingBarrierParts';
import { ControllerStick } from './ControllerInputParts';
import { SignalPaddle } from './SignalPaddleParts';
import { DrawerCabinet, SlidingDrawer } from './DrawerIndicatorParts';
import { MailboxModel } from './MailboxFlagParts';
import { CrossingMast, CrossingRoad } from './CrossingRequestParts';
import { DeskPaddle } from './DeskSwitchParts';
import { LiftShaft, LiftCar } from './ElevatorCallParts';
import { DoorbellPanel } from './DoorbellPanelPart';
import { QuizDesk } from './QuizDeskPart';
import { LibraryCounter } from './LibraryCounterPart';
import { WindowBoxPlanter } from './WindowBoxParts';
import { OpenSoilTray } from './SoilDryingParts';
import { CottonWick, RaisedSoilCup } from './CapillaryWateringParts';
import { DepthComparisonPot } from './PlantPotDepthParts';
import { DrainageColumn } from './DrainageBottleParts';
import { MulchTray } from './MulchMoistureParts';
import { ClaySample } from './ClaySoilParts';
import { GraduatedWaterCylinder, SandySampleCup } from './SandySoilParts';
import { BasilPotPart } from './BasilPotPart';
import { GearWheel } from './GearWheel';
import { GrowLampPart, HydroPumpPart } from './HydroponicParts';
import { ShakeSensorPart } from './ShakeMonitorParts';
import { Drv8833Part, HuskyLensPart } from './TrolleyParts';
import { OmniWheelPart } from './OmniWheelPart';
import { HarvestCapacitor, PiezoDisc, RectifierBridge } from './FootstepRfidParts';
import { VoiceConsolePart } from './VoiceConsolePart';
import { InfraredThermometer } from './EntranceTemperatureParts';
import { ColorBreakout } from './RecyclingVendingParts';
import { ReflectanceArray } from './LineFollowerParts';
import { MegaBoard } from './GpsGsmParts';
import { LightHood } from './HorizonTrackerParts';
import { FonaBattery, FonaModule } from './GsmEnergyParts';
import { CardPalm, FlexStrip } from './MimicHandParts';
import { ParkingBlock } from './SelfParkingParts';
import { LightQuadrants, TrackerBracket, TrackerPanel } from './SolarTrackerParts';
import { NanoBoard, ScopeOled } from './WearableScopeParts';
import { FingerprintReader } from './FingerprintReader';
import { SolarMeterPanel, SolarMeterSensor } from './SolarMeterParts';
import { CardLink } from './AndroidSnakeDemo';
import { CameraBoard, SerialAdapter } from './TiltCameraDemo';
import { MicrowaveBoard } from './DetectionBenchDemo';
import { PiBoard, PiCooler, PiSensor } from './PiClimateDemo';
import { EnclosurePlug, EnclosureSupport } from './PrintedEnclosureDemo';
import { PressureSensor } from './FanInterlockDemo';
import { GpsBreakout } from './GpsAlertDemo';
import { MatrixPad, ReedPair } from './ExhibitionLockDemo';
import { ParticleBreakout } from './ClassroomAirDemo';
import { GreenhouseFan, MoistureProbe } from './GreenhouseDemo';
import { BalanceImu } from './PickBalanceDemo';
import { ArmPwmBoard, TrainingArm } from './RoverArmDemo';
import { TapLevel, TapPump } from './AutomaticTapDemo';
import { PumpBottle } from './SoapDispenserDemo';
import { ClockBoard, ClockDisplay } from './SchoolBellDemo';
import { PN532Shield, TagCard } from './RFIDDoorDemo';
import { RainSensorPlate } from './RainClotheslineDemo';
import { MQ2Module } from './MQ2MonitorDemo';
import { CoilDriver, CoilModel, WasherModel } from './ElectromagnetCraneDemo';
import type { ExpansionInfo } from '../data/project-expansion';
import { Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Bounds, Center, Environment, Lightformer, Line, RoundedBox, useGLTF } from '@react-three/drei';
import { Box3, CatmullRomCurve3, Path, Shape, Vector2, Vector3, type Group } from 'three';

import { bluetoothCar, bluetoothCarCommands, bluetoothCarPulseMs, type BluetoothCarCommand } from '../data/bluetooth-car';
import { esp32Car } from '../data/esp32-car';
import { bottleVacuum } from '../data/bottle-vacuum';
import { lidarFlightLimits, lidarMicroDrone, proximityDecision } from '../data/lidar-micro-drone';
import { solarSweeper, solarSweepLimits } from '../data/solar-sweeper';
import { beaconThresholds, fireResponseRover } from '../data/fire-response-rover';
import { VirtualBottleRocket, VirtualLandingField, VirtualLaunchStand } from './WaterRocketDemo';
import { CubeBus, CubeCamera, GroundStation } from './WeatherCubeSatDemo';
import { EmergencyLamps } from './EmergencyLightingDemo';
import { IndustrialIndicators, TestKnob } from './IndustrialMonitorDemo';
import { MineBeacon, MineDashboardModel, MineStation } from './MineSafetyDemo';
import { RollerSwitch, WasteBinGeometry } from './SmartBinDemo';
import { AquacleanChannel, EthernetShieldGeometry } from './AquacleanDemo';
import { GateAssembly, SpillwayBasin } from './FloodGateDemo';
import { FloodBasin, FloodPiezo, FloodSignalLights } from './FloodWarningDemo';
import { WorldLabel } from './LabWorkbench';

type Point = [number, number, number];
function Box({ at, size, color, metal = 0 }: {at: Point; size: Point; color: string; metal?: number}) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.16} smoothness={2}>
    <meshStandardMaterial color={color} metalness={metal} roughness={metal>.4?.34:.53}/>
  </RoundedBox>;
}
function Disk({ at, radius, depth, color, axle = false, glow = false }: {at: Point; radius: number; depth: number; color: string; axle?: boolean; glow?: boolean}) {
  return <mesh position={at} rotation={axle ? [0,0,Math.PI/2] : undefined}><cylinderGeometry args={[radius,radius,depth,40]}/><meshStandardMaterial color={color} roughness={.32} metalness={.28} emissive={color} emissiveIntensity={glow ? 2 : 0}/></mesh>;
}
function Wire({path,color}: {path: Point[];color:string}) {
  const curve = new CatmullRomCurve3(path.map(([x,y,z])=>new Vector3(x,y,z)));
  return <mesh><tubeGeometry args={[curve,24,.025,8,false]}/><meshStandardMaterial color={color} roughness={.48}/></mesh>;
}
function Lamp({at, color, lit}: {at: Point; color: string; lit: boolean}) {
  return <group position={at}>
    {[-.047,.047].map(x=><Box key={x} at={[x,.075,0]} size={[.021,.16,.023]} color="#bcc4c8" metal={.73}/>)}
    <Disk at={[0,.16,0]} radius={.106} depth={.027} color={color}/>
    <mesh position={[0,.212,0]}><cylinderGeometry args={[.088,.088,.09,32]}/>
      <meshPhysicalMaterial color={color} roughness={.18} clearcoat={1} emissive={color} emissiveIntensity={lit?2.2:0}/></mesh>
    <mesh position={[0,.255,0]}><sphereGeometry args={[.088,32,16,0,Math.PI*2,0,Math.PI/2]}/>
      <meshPhysicalMaterial color={color} roughness={.14} clearcoat={1} emissive={color} emissiveIntensity={lit?2.6:0}/></mesh>
    {lit && <pointLight position={[0,.32,0]} color={color} intensity={.8} distance={.85}/>}
  </group>;
}

function Gear({at, teeth, radius, color, speed, crank=false}: {at: Point; teeth: number; radius: number; color: string; speed: number; crank?:boolean}) {
  const ref = useRef<Group>(null);
  useFrame((_, dt) => { if(ref.current) ref.current.rotation.y += speed * dt; });
  return <group ref={ref} position={at}>
    <Disk at={[0,0,0]} radius={radius} depth={.21} color={color}/>
    {Array.from({length:teeth}, (_,i)=><group key={i} rotation={[0,2*Math.PI*i/teeth,0]}><Box at={[radius,0,0]} size={[.16,.20,.10]} color={color} metal={.58}/></group>)}
    <Disk at={[0,.10,0]} radius={.13} depth={.25} color="#b6bfc8"/>
    <Box at={[radius*.62,.115,0]} size={[.12,.02,.07]} color="#ffcd62"/>
    {crank && <>
      <Disk at={[0,.22,0]} radius={.08} depth={.31} color="#a2b0bd"/>
      <Box at={[-.20,.40,0]} size={[.49,.062,.105]} color="#a2b0bd" metal={.68}/>
      <Disk at={[-.41,.53,0]} radius={.067} depth={.24} color="#242a30"/>
    </>}
  </group>;
}
function FittedHardware({id,at,size,rotation,names}: {id:string;at:Point;size:Point;rotation?:Point;names?:string[]}) {
  const {scene} = useGLTF(`./models/hardware/${id}.glb`);
  const fitted = useMemo(()=>{
    const model=selectHardware(scene,names);
    const bounds=new Box3().setFromObject(model);
    const extent=bounds.getSize(new Vector3());
    return {model,center:bounds.getCenter(new Vector3()).multiplyScalar(-1),
      scale:new Vector3(...size).divide(extent.max(new Vector3(.001,.001,.001)))};
  },[scene,size,names]);
  return <group position={at} rotation={rotation} scale={fitted.scale}>
    <group position={fitted.center}><primitive object={fitted.model}/></group>
  </group>;
}

function RoverWheel({side,position}: {side:number;position:React.RefObject<Group | null>}) {
  const wheel=useRef<Group>(null);
  useFrame(()=>{
    if(wheel.current && position.current) wheel.current.rotation.x=position.current.position.z/.37;
  });
  return <group position={[side,.37,.32]} ref={wheel}>
    <Disk at={[0,0,0]} radius={.35} depth={.25} color="#171a1d" axle/>
    {Array.from({length:22},(_,i)=><group key={i} rotation={[i*Math.PI/11,0,0]}>
      <Box at={[0,.351,0]} size={[.24,.034,.062]} color="#24282b"/>
    </group>)}
    <Disk at={[side*.135,0,0]} radius={.238} depth={.05} color="#cc972a" axle/>
    <Disk at={[side*.171,0,0]} radius={.072} depth={.05} color="#939da5" axle/>
    {Array.from({length:6},(_,i)=><group key={i} rotation={[i*Math.PI/3,0,0]}>
      <Box at={[side*.169,.15,0]} size={[.016,.11,.034]} color="#edbb50"/>
    </group>)}
  </group>;
}

function Rover({active,approaching,reducedMotion,threshold,children}: {active:boolean;approaching:boolean;reducedMotion:boolean;threshold?:number;children?:ReactNode}) {
  const rover=useRef<Group>(null);
  const obstacleZ=1.9;
  const sensorOffset=1.12;
  const obstacleHalfDepth=.115;
  const distanceCm=threshold===undefined
    ? (active ? 12 : approaching ? 25 : 45)
    : threshold+(active ? -5 : approaching ? 2 : 15);
  const targetZ=obstacleZ-obstacleHalfDepth-sensorOffset-distanceCm*.028;
  useFrame((_, dt)=>{
    if (!rover.current) return;
    const position=rover.current.position;
    position.z += (targetZ-position.z)*(reducedMotion ? 1 : 1-Math.exp(-dt*2.6));
  });
  return <>
    <group ref={rover} position={[0,0,-.65]}>
      <Box at={[0,.37,0]} size={[1.8,.16,2.2]} color="#3d5265" metal={.65}/>
      <Suspense fallback={<Box at={[0,.53,-.24]} size={[1.05,.14,.8]} color="#126a8f"/>}>
        <FittedHardware id="boards-01" at={[0,.56,-.24]} size={[1.1,.29,.82]}/>
      </Suspense>
      {[-.69,.69].flatMap(x=>[-.77,.72].map(z=><Disk key={`${x}:${z}`} at={[x,.47,z]} radius={.056} depth={.035} color="#b0b9bf"/>))}
      <Suspense fallback={null}><FittedHardware id="components-34" names={['board','chip','capacitor','pads']} at={[.56,.52,.45]} size={[.50,.16,.35]}/></Suspense>
      {[-.64,.64].map(x=><Box key={x} at={[x,.28,.32]} size={[.42,.28,.52]} color="#d8a129"/>)}
      <Wire path={[[-.62,.36,.31],[-.55,.63,.55],[.25,.57,.49]]} color="#dd7b45"/>
      <Box at={[0,.49,-.77]} size={[1,.25,.38]} color="#24282e"/>
      <Wire path={[[.45,.63,-.77],[.7,.81,-.35],[.65,.60,.36]]} color="#e5564e"/>
      <Wire path={[[.45,.61,-.22],[.56,.89,.3],[.33,.69,.98]]} color="#f1b850"/>
      {[-1,1].map(side=><RoverWheel key={side} side={side} position={rover}/>)}
      <Disk at={[0,.13,-.75]} radius={.13} depth={.22} color="#697785" axle/>
      <Suspense fallback={<Box at={[0,.58,.99]} size={[.79,.33,.08]} color="#167eae"/>}>
        <FittedHardware id="sensors-08" at={[0,.60,1.01]} size={[.85,.35,.22]}/>
      </Suspense>
      {children}
    </group>
    <group position={[0,0,obstacleZ]}>
      <Box at={[0,.43,0]} size={[1.45,.86,.23]} color="#b08256"/>
      <Box at={[0,.48,.122]} size={[.23,.76,.018]} color="#d6b38e"/>
    </group>
  </>;
}
function Linkage({hand,active,target}: {hand:boolean;active:boolean;target?:number}) {
  const joint=useRef<Group>(null);
  const tip=useRef<Group>(null);
  useFrame((_,dt)=>{
    const blend=Math.min(1,dt*6);
    if(joint.current) joint.current.rotation.z += ((target===undefined ? (active ? (hand ? -.72 : .349) : (hand ? 0 : -.349)) : (target-90)*Math.PI/180*(hand?-1:1))-joint.current.rotation.z)*blend;
    if(tip.current) tip.current.rotation.z += ((hand&&active?-.53:0)-tip.current.rotation.z)*blend;
  });
  return <>
    <Box at={[0,.08,0]} size={[2.7,.16,1.4]} color="#414f5e" metal={.5}/>
    <Suspense fallback={null}><FittedHardware id="boards-01" at={[-1.08,.21,.91]} size={[1.12,.28,.73]}/></Suspense>
    <Box at={[.68,.23,-.92]} size={[.86,.30,.58]} color="#333e4b"/>
    <Wire path={[[-.64,.23,.86],[-.52,.43,.66],[-.46,.33,.30]]} color="#e5b04d"/>
    <Wire path={[[.33,.25,-.92],[-.20,.36,-.72],[-.48,.28,-.29]]} color="#db5448"/>
    <Suspense fallback={null}><FittedHardware id="anatomy-31" names={['case','cap','fins','ears','spline']} at={[-.55,.46,0]} size={[.69,.68,.64]}/></Suspense>
    {[-1.13,1.13].map(x=><Disk key={x} at={[x,.17,-.52]} radius={.061} depth={.024} color="#a9b2b9"/>)}
    {hand && <group position={[-.08,.58,-.35]}>
      <Box at={[0,0,0]} size={[1.1,.22,1.05]} color="#a7b6c3" metal={.48}/>
      {[-.48,-.23,.01].map((z,i)=><group key={z} position={[.51,0,z]}>
        <Box at={[.22,0,0]} size={[.53,.15,.16]} color="#c2cbd2" metal={.45}/>
        <Box at={[.59,-.055,0]} size={[.26-i*.035,.14,.15]} color="#b0bcc9" metal={.45}/>
        <Disk at={[.43,.025,0]} radius={.08} depth={.16} color="#6e8294"/>
      </group>)}
      <Box at={[.12,.02,.56]} size={[.52,.16,.19]} color="#b0bcc9" metal={.45}/>
    </group>}
    <group position={[-.55,.83,0]} ref={joint}>
      <Box at={[.48,.13,0]} size={[1.12,.27,.33]} color="#bbc9d4" metal={.66}/>
      <group position={[1,.13,0]} ref={tip}>
        <Box at={[.32,0,0]} size={[.68,.24,.28]} color="#b5c5d0" metal={.6}/>
        <Disk at={[.02,.08,0]} radius={.12} depth={.30} color="#718494"/>
        {hand && <Wire path={[[-.43,-.12,0],[.06,-.14,0],[.59,-.11,0]]} color="#e39b42"/>}
      </group>
    </group>
  </>;
}
function Counter({active}: {active:boolean}) {
  const target=useRef<Group>(null);
  useFrame((_,delta)=>{
    if (target.current) target.current.position.x+=((active?-.41:0)-target.current.position.x)*Math.min(1,delta*6);
  });
  return <>
    <Box at={[0,.06,0]} size={[3.25,.12,2.1]} color="#27303a"/>
    <Box at={[-1.55,1.16,-.88]} size={[.13,2.32,.13]} color="#667784" metal={.6}/>
    <Box at={[-.83,2.25,-.88]} size={[1.5,.13,.13]} color="#667784" metal={.6}/>
    <Suspense fallback={null}><FittedHardware id="sensors-37" names={['camera-board','lens','focus']} at={[-.13,2.14,-.88]} size={[.66,.25,.40]} rotation={[Math.PI,0,0]}/></Suspense>
    <Box at={[-.84,2.11,-.88]} size={[.56,.19,.42]} color="#e8e2d2"/>
    <spotLight position={[-.84,2.05,-.88]} angle={.66} intensity={8} penumbra={.9}/>
    <Box at={[1.15,.15,-.64]} size={[1.11,.18,.70]} color="#718697" metal={.5}/>
    <Box at={[1.15,.50,-.92]} size={[1.11,.67,.09]} color="#293d53"/>
    <Wire path={[[.18,2.12,-.9],[.62,1.84,-1.01],[.79,.62,-1.01],[1.3,.23,-.85]]} color="#30363e"/>
    {[-.92,.89].map(x=><Box key={x} at={[x,.27,.25]} size={[.51,.30,.63]} color="#f5dc9b"/>)}
    <group ref={target}><Box at={[0,.27,.25]} size={[.51,.30,.63]} color="#f5dc9b"/></group>
    <WorldLabel position={[1.15,.57,-.86]} className="gp-marker-anchor"><span className="gp-demo-readout">{active?2:3} regions</span></WorldLabel>
  </>;
}
function Electronics({id,active,hold,storyStep,phaseSeconds=3}: {id:string;active:boolean;hold:boolean;storyStep:number|null;phaseSeconds?:number}) {
  const signal = id==='traffic-sequencer';
  const soil = id==='soil-observer';
  const inputChanged = active || (storyStep!==null && storyStep>=1);
  const phase = useRef(0);
  const lights = useRef<Group>(null);
  const cycle = useRef(0);
  useFrame((_, delta)=>{
    if (!lights.current) return;
    if (!active) cycle.current = 0;
    else if (!hold) cycle.current = (cycle.current + delta)%(phaseSeconds*2+1);
    const seconds = cycle.current;
    phase.current = !active || seconds<phaseSeconds ? 0 : seconds<phaseSeconds*2 ? 1 : 2;
    lights.current.children.forEach((child,i)=>{child.visible=i===phase.current;});
  });
  return <>
    <Suspense fallback={<Box at={[-.93,.12,0]} size={[1.65,.21,1.23]} color="#086e98"/>}>
      <FittedHardware id="boards-01" at={[-.93,.21,0]} size={[1.65,.34,1.23]}/>
    </Suspense>
    <Suspense fallback={<Box at={[.89,.13,0]} size={[1.67,.22,1.39]} color="#ece8dd"/>}>
      <FittedHardware id="components-25" at={[.89,.13,0]} size={[1.67,.22,1.39]}/>
    </Suspense>
    <Wire path={[[ -.3,.29,.48],[-.09,.52,.66],[.38,.25,.58]]} color="#cb3f41"/>
    <Wire path={[[ -.3,.29,-.5],[-.05,.51,-.7],[.43,.25,-.58]]} color="#232936"/>
    {!signal && <><Wire path={[[ -.28,.30,.29],[-.02,.57,.30],[.91,.25,.42]]} color="#ca9d29"/>
      <Disk at={[.96,.28,.40]} radius={.065} depth={.25} color="#b99765" axle/></>}

    {soil && <>
      <Suspense fallback={null}><FittedHardware id="sensors-27" names={['probe','probe-pcb','circuit']} at={[.72,.81,-.20]} size={[.24,.65,.27]}/></Suspense>
      <Disk at={[.85,.27,-.18]} radius={.45} depth={.49} color="#a47359"/>
      <Disk at={[.85,.53,-.18]} radius={.41} depth={.05} color={inputChanged?'#8b6544':'#423328'}/>
      <Wire path={[[.72,1.02,-.20],[.42,.85,-.37],[.31,.25,-.40]]} color="#e2ae5d"/>
    </>}
    {id==='ambient-light' && <>
      <Suspense fallback={null}><FittedHardware id="sensors-21" at={[.54,.40,-.20]} size={[.31,.29,.26]}/></Suspense>
      <Disk at={[.66,.29,.04]} radius={.036} depth={.23} color="#bc9a68" axle/>
      {!inputChanged && <spotLight position={[.54,1.25,-.20]} intensity={3.8} angle={.35} penumbra={.8}/>}
    </>}
    {id==='home-project' && <>
      <mesh position={[.54,.39,-.20]}><cylinderGeometry args={[.091,.091,.22,32,1,false,0,Math.PI]}/><meshStandardMaterial color="#242b33" side={2}/></mesh>
      <Box at={[.54,.39,-.20]} size={[.019,.22,.18]} color="#242b33"/>
      {[-.055,0,.055].map(offset=><Box key={offset} at={[.54+offset,.27,-.20]} size={[.014,.12,.019]} color="#b9c3cb" metal={.6}/>)}
    </>}
    {id==='button-indicator' && <Suspense fallback={null}>
      <FittedHardware id="components-06" names={['frame','terminals']} at={[.54,.28,-.20]} size={[.28,.11,.28]}/>
      <FittedHardware id="components-06" names={['cap']} at={[.54,inputChanged?.34:.39,-.20]} size={[.14,.10,.14]}/>
    </Suspense>}
    {signal ? <>{[.44,.87,1.31].map((x,i)=><group key={x}>
      <Disk at={[x,.28,-.4]} radius={.036} depth={.23} color="#b99765" axle/>
      <Wire path={[[ -.3,.29,-.34+i*.18],[.14,.49,-.38+i*.09],[x,.25,-.39]]} color={['#ce504b','#55a26e','#dba73c'][i]}/>
    </group>)}<group ref={lights}>{[0,1,2].map(i=><group key={i}>{['#fd4036','#48f0a2','#ffc04a'].map((color,j)=><Lamp key={color} at={[.39+j*.48,.26,0]} color={color} lit={i===j}/>)}</group>)}</group></>
      : <Lamp at={[1.25,.25,.40]} color={id==='soil-observer'?'#ffb34a':'#56eca2'} lit={active}/>}
  </>;
}
const demoAnchors: Record<string, Record<number, Point>> = {
  'rover-project': {0:[0,.78,-.24],1:[0,.77,1.09],2:[.56,.62,.45],5:[0,.64,-.77],6:[.68,.81,-.35],3:[1.19,.47,.32],4:[-.68,.43,-.64]},
  'hand-project': {0:[-1.08,.35,.91],1:[-.55,.47,.35],2:[.55,1.06,0],3:[1.02,.77,0],4:[.68,.42,-.92],5:[-.52,.45,.66]},
  'desktop-arm': {0:[-1.08,.35,.91],1:[-.55,.47,.35],2:[.55,1.06,0],3:[.68,.42,-.92],4:[-.52,.45,.66]},
  'soil-observer': {0:[-.93,.32,0],1:[.69,1.1,-.18],2:[.85,.57,-.18],3:[1.25,.6,.40],4:[.38,.49,.58]},
  'home-project': {0:[-.93,.32,0],1:[.54,.53,-.20],2:[1.25,.6,.40],3:[.89,.26,.74]},
  'ambient-light': {0:[-.93,.32,0],1:[.54,.53,-.20],2:[.66,.36,.04],3:[1.25,.6,.40],4:[.89,.26,.74]},
  'button-indicator': {0:[-.93,.32,0],1:[.54,.53,-.20],2:[1.25,.6,.40],3:[.89,.26,.74]},
  'traffic-sequencer': {0:[-.93,.32,0],1:[.88,.62,0],2:[1.15,.34,-.4],3:[.89,.26,.74]},
  'mechanism-study': {0:[-1,.61,0],1:[.36,.61,0],2:[.36,.74,0],3:[-.9,.25,.79]},
  'vision-counter': {0:[-.13,2.28,-.88],1:[1.15,.85,-.92],2:[.89,.43,.25],3:[-1.55,1.51,-.88]},
};

type Marker = {index:number;name:string};
const storySignalPaths: Record<string, [number,number][]> = {
  'rover-project': [[1,0],[0,2],[2,3]],
  'hand-project': [[0,1],[1,3],[3,2]],
  'soil-observer': [[1,0],[1,0],[0,3]],
  'home-project': [[1,0],[1,0],[0,2]],
  'ambient-light': [[1,0],[1,0],[0,3]],
  'traffic-sequencer': [[0,1],[0,1],[0,1]],
  'button-indicator': [[1,0],[1,0],[0,2]],
  'mechanism-study': [[3,0],[0,1],[0,1]],
  'desktop-arm': [[0,1],[1,2],[1,2]],
  'vision-counter': [[2,0],[0,1],[0,1]],
};

function StorySignal({from,to,hold}: {from:Point;to:Point;hold:boolean}) {
  const pulse=useRef<Group>(null);
  const time=useRef(0);
  const path=useMemo(()=>new CatmullRomCurve3([
    new Vector3(...from),
    new Vector3((from[0]+to[0])/2,Math.max(from[1],to[1])+.37,(from[2]+to[2])/2),
    new Vector3(...to),
  ]),[from,to]);
  const points=useMemo(()=>path.getPoints(20),[path]);
  useFrame((_,delta)=>{
    if (!hold) time.current=(time.current+delta*1.3)%1;
    pulse.current?.position.copy(path.getPoint(time.current));
  });
  return <>
    <Line points={points} color="#87fff2" lineWidth={2} transparent opacity={.62}/>
    <group ref={pulse} position={from}><mesh><sphereGeometry args={[.061,16,12]}/><meshBasicMaterial color="#fff4a2"/></mesh></group>
  </>;
}

export default function ProjectDemo({id,active,hold=false,storyStep=null,markers,selected,onSelect,configuration}: {id:string;active:boolean;configuration?:ExpansionInfo;hold?:boolean;storyStep?:number | null;markers?:Marker[];selected?:number;onSelect?:(part:number)=>void}) {
  const ratio=configuration?.kind==='ratio'?configuration.limit:3;
  const gearOffset=(ratio-3)*.25;
  const motion = useRef(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const connection = storyStep!==null && storyStep>0 ? storySignalPaths[id]?.[storyStep-1] : undefined;
  const signal = connection && <StorySignal key={storyStep}
    from={demoAnchors[id][connection[0]]} to={demoAnchors[id][connection[1]]} hold={hold||motion.current}/>;
  const partMarkers = markers?.map(marker => {
        const anchor = demoAnchors[id]?.[marker.index];
        const position: Point | undefined = anchor && id==='mechanism-study' && [1,2].includes(marker.index) ? [anchor[0]+gearOffset,anchor[1],anchor[2]] : anchor;
        return position && <group key={marker.index}>
          {selected===marker.index && <mesh position={position}><sphereGeometry args={[.135,20,16]}/><meshBasicMaterial color="#ffd776" transparent opacity={.38} depthWrite={false}/></mesh>}
          <WorldLabel position={position} className="gp-marker-anchor">
          <button className="gp-marker" aria-label={marker.name} aria-pressed={selected===marker.index} onClick={()=>onSelect?.(marker.index)}>{marker.index+1}{selected===marker.index&&<span className="gp-demo-marker-name">{marker.name}</span>}</button>
        </WorldLabel></group>;
      });
  return <div className="gp-canvas" aria-label="Interactive 3D demonstration">
    <Canvas dpr={[1,1.5]} camera={{position:[4,4.6,6],fov:39}} fallback={<p>3D viewing requires WebGL. The expected result is shown below.</p>}>
      <color attach="background" args={['#293641']}/>
      <ambientLight intensity={.55}/>
      <directionalLight position={[3,6,5]} intensity={1.5}/>
      <Environment resolution={128}>
        <Lightformer intensity={3.2} color="#fff4e5" position={[2,5,1]} rotation={[Math.PI/2,0,0]} scale={6}/>
        <Lightformer intensity={1.7} color="#bad9ff" position={[-5,3,-3]} rotation={[0,-Math.PI/2,0]} scale={4}/>
      </Environment>
      <Box at={[0,-.075,0]} size={[14,.12,14]} color="#3b4b56"/>
      {id==='rover-project' ? <Rover active={active} threshold={configuration?.kind==='distance'?configuration.limit:undefined} approaching={storyStep===1} reducedMotion={motion.current || hold}>{partMarkers}{signal}</Rover>
        : id==='hand-project'||id==='desktop-arm' ? <Linkage hand={id==='hand-project'} active={active} target={configuration?.kind==='angle'?(active?configuration.limit:75):undefined}/>
        : id==='vision-counter' ? <Counter active={active}/>
        : id==='mechanism-study' ? <><Box at={[0,.12,0]} size={[3.25+Math.max(0,gearOffset*2),.24,2+Math.max(0,gearOffset)]} color="#526472" metal={.55}/><Gear at={[-1,.47,0]} teeth={12} radius={.32} color="#b58b56" crank speed={active&&!hold&&!motion.current?2.4:0}/><Gear at={[.36+gearOffset,.47,0]} teeth={12*ratio} radius={.91+gearOffset} color="#9ba9b6" speed={active&&!hold&&!motion.current?-2.4/ratio:0}/></>
        : <Electronics id={id} active={active} hold={hold} storyStep={storyStep} phaseSeconds={configuration?.kind==='timer'?configuration.limit:undefined}/>}
      {id!=='rover-project' && <>{partMarkers}{signal}</>}
      {id==='mechanism-study' && <>
        <Disk at={[-1,.33,0]} radius={.14} depth={.29} color="#8294a2"/>
        <Disk at={[.36+gearOffset,.33,0]} radius={.14} depth={.29} color="#8294a2"/>
        {[-1.45,1.36].flatMap(x=>[-.79,.79].map(z=><Disk key={`${x}/${z}`} at={[x,.245,z]} radius={.055} depth={.025} color="#acb7bf"/>))}
      </>}
      <ContactShadows opacity={.45} scale={8} blur={2} resolution={128}/>
      <OrbitControls target={[0,.45,0]} enablePan={false} minDistance={3.5} maxDistance={13} maxPolarAngle={1.48}/>
    </Canvas>
  </div>;
}

function BluetoothRadio({receiving=false}: {receiving?:boolean}) {
  return <>
    <Box at={[0,0,0]} size={[.39,.038,.59]} color="#1256a0" metal={.28}/>
    <Box at={[0,.028,.103]} size={[.27,.024,.28]} color="#9a2423"/>
    <Box at={[0,.044,.083]} size={[.21,.034,.206]} color="#b6c1c7" metal={.72}/>
    <Box at={[0,.044,.223]} size={[.18,.028,.047]} color="#dfd0b8"/>
    {[-.147,.147].map(x=><mesh key={x} position={[x,.021,.246]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[.021,.033,20]}/><meshStandardMaterial color="#d3a54d" metalness={.65}/>
    </mesh>)}
    {Array.from({length:8},(_,index)=><mesh key={index} position={[(index-3.5)*.045,.021,-.246]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[.010,.019,16]}/><meshStandardMaterial color="#d3a54d" metalness={.65}/>
    </mesh>)}
    <Box at={[0,.04,-.103]} size={[.086,.058,.10]} color="#adb6bb" metal={.6}/>
    <Box at={[.031,.051,-.103]} size={[.050,.035,.034]} color="#21272d"/>
    <Disk at={[-.145,.039,.156]} radius={.021} depth={.021} color="#68caff" glow={receiving}/>
  </>;
}

export function BluetoothMotorDriver() {
  return <>
    <Box at={[0,0,0]} size={[.38,.032,.43]} color="#1256a0"/>
    <Box at={[0,.021,0]} size={[.135,.042,.17]} color="#22262a"/>
    {[-.15,.15].flatMap(x=>Array.from({length:7},(_,index)=><mesh key={`${x}:${index}`} position={[x,.018,(index-3)*.053]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[.010,.019,14]}/><meshStandardMaterial color="#dac078" metalness={.58}/>
    </mesh>))}
    {[-.09,.09].map(x=><Box key={x} at={[x,.025,.13]} size={[.05,.023,.036]} color="#c1ae80"/>)}
  </>;
}

export function Esp32Board({receiving=false}: {receiving?:boolean}) {
  return <>
    <Box at={[0,0,0]} size={[.48,.043,.92]} color="#222934"/>
    <Box at={[0,.033,.244]} size={[.34,.024,.44]} color="#252d36"/>
    <Box at={[0,.052,.18]} size={[.29,.036,.26]} color="#b6b9b9" metal={.78}/>
    <Box at={[0,.049,.401]} size={[.25,.016,.11]} color="#18202a"/>
    <Box at={[0,.057,-.445]} size={[.14,.074,.13]} color="#bfc4c6" metal={.65}/>
    {[-.20,.20].flatMap(x=>Array.from({length:19},(_,index)=><Disk key={`${x}:${index}`} at={[x,.029,(index-9)*.044]} radius={.015} depth={.025} color="#cdbf9d"/>))}
    {[-.129,.129].map(x=><Box key={x} at={[x,.043,-.348]} size={[.063,.049,.073]} color="#3d4146"/>)}
    <Box at={[0,.034,-.231]} size={[.093,.030,.10]} color="#171b20"/>
    <Disk at={[.125,.043,-.20]} radius={.019} depth={.021} color="#70d0ff" glow={receiving}/>
  </>;
}

function AxialResistor({bands=['#6a311d','#1d2024','#a92c2c','#b7953f']}: {bands?:string[]}) {
  return <group rotation={[0,0,Math.PI/2]}>
    <Disk at={[0,0,0]} radius={.039} depth={.19} color="#d7c498"/>
    <Disk at={[0,0,0]} radius={.011} depth={.33} color="#c0c4cb"/>
    {bands.map((color,index)=><Disk key={index}
      at={[0,(index-1.5)*.040,0]} radius={.040} depth={.016} color={color}/>)}
  </group>;
}

const esp32Anchors: Point[] = [[.44,.68,.78],[.58,.72,.11],[-.58,.65,.54],[1.04,.37,.34],
  [0,.45,1.02],[0,.68,-.86],[.56,.68,-.14],[-.64,.70,-.68]];
const esp32LabelPositions: Point[] = [[.54,1.31,.86],[.58,1.04,-.02],[-.78,.95,.63],[1.23,.49,.34],
  [0,.59,1.26],[0,.86,-1.02],[.65,.74,-.33],[-.79,.91,-.81]];

const bluetoothAnchors: Point[] = [[-.22,.72,-.17],[.62,.64,.83],[-.58,.65,.54],[1.02,.37,.34],
  [0,.45,1.02],[0,.68,-.86],[.56,.68,.06],[-.64,.70,-.68]];

function BluetoothRover({command,selected,showLabels,onSelect,esp32,labelParts}: {
  command:typeof bluetoothCarCommands[number]; selected:number|null; showLabels:boolean; onSelect:(index:number)=>void; esp32:boolean; labelParts:typeof bluetoothCar.parts;
}) {
  const rover=useRef<Group>(null);
  const leftWheel=useRef<Group>(null);
  const rightWheel=useRef<Group>(null);
  useFrame((_,elapsed)=>{
    if(!rover.current || !leftWheel.current || !rightWheel.current) return;
    const dt=Math.min(elapsed,.05);
    const {left,right}=command;
    const speed=(left+right)*.85;
    const yaw=rover.current.rotation.y + (right-left)*.85*dt;
    const position=rover.current.position;
    const x=position.x+Math.sin(yaw)*speed*dt;
    const z=position.z+Math.cos(yaw)*speed*dt;
    if(Math.abs(x)>2.56 || Math.abs(z)>2.56) return;
    rover.current.rotation.y=yaw;
    position.set(x,0,z);
    leftWheel.current.rotation.x+=left*1.7*dt/.35;
    rightWheel.current.rotation.x+=right*1.7*dt/.35;
  });
  return <group ref={rover} position={[0,0,-.8]}>
    <Box at={[0,.42,0]} size={[1.69,.10,2.15]} color={esp32?"#3d7780":"#aa782c"} metal={.38}/>
    {[-.70,.70].flatMap(x=>[-.88,.90].map(z=><Disk key={`${x}:${z}`} at={[x,.475,z]} radius={.052} depth={.025} color="#c8cdd1"/>))}
    {[-1,1].map(side=><group key={side} position={[side,.35,.32]}>
      <Box at={[-side*.38,-.04,-.03]} size={[.44,.30,.52]} color="#d49c23"/>
      <group ref={side===1?leftWheel:rightWheel}>
        <Disk at={[0,0,0]} radius={.345} depth={.24} color="#1d2227" axle/>
        {Array.from({length:24},(_,index)=><group key={index} rotation={[index*Math.PI/12,0,0]}>
          <Box at={[0,.345,0]} size={[.235,.028,.060]} color="#292e33"/>
        </group>)}
        <Disk at={[side*.126,0,0]} radius={.233} depth={.045} color="#d8a02b" axle/>
        <Disk at={[side*.154,0,0]} radius={.076} depth={.023} color="#a9b2b9" axle/>
        {Array.from({length:6},(_,index)=><group key={index} rotation={[index*Math.PI/3,0,0]}>
          <Box at={[side*.15,.145,0]} size={[.019,.105,.050]} color="#f4c957"/>
        </group>)}
      </group>
    </group>)}
    <Disk at={[0,.30,-.89]} radius={.18} depth={.10} color="#aab5bf"/>
    <Disk at={[0,.141,-.89]} radius={.14} depth={.14} color="#3c454e" axle/>
    {esp32 ? <>
      <group position={[.44,.55,.69]}><Esp32Board receiving={command.key!=='S'}/></group>
      <group position={[.58,.617,.11]}><AxialResistor/></group>
    </> : <>
      <Suspense fallback={<Box at={[-.23,.555,-.115]} size={[.86,.12,.69]} color="#126a8f"/>}>
        <FittedHardware id="boards-01" at={[-.23,.566,-.115]} size={[.88,.20,.71]}/>
      </Suspense>
      <group position={[.62,.52,.75]}><BluetoothRadio receiving={command.key!=='S'}/></group>
    </>}
    <group position={[-.58,.55,.54]}><BluetoothMotorDriver/></group>
    <Box at={[0,.57,-.87]} size={[.88,.20,.33]} color="#24282e"/>
    <Box at={[.32,.688,-.87]} size={[.12,.043,.095]} color="#545e68"/>
    <Box at={[-.63,.55,-.67]} size={[.30,.15,.60]} color="#283045" metal={.38}/>
    <Box at={[.55,.515,.05]} size={[.32,.08,.63]} color="#e5e6e2"/>
    {Array.from({length:8},(_,index)=><Box key={index} at={[.55,.558,(index-3)*.067]} size={[.235,.009,.013]} color="#747c7e"/>)}
    {esp32 ? <>
      <Wire path={[[.25,.58,.51],[.04,.73,.55],[-.33,.69,.65],[-.47,.58,.59]]} color="#4da3ed"/>
      <Wire path={[[.22,.58,.60],[.06,.69,.70],[-.24,.65,.73],[-.42,.58,.70]]} color="#a982ec"/>
      <Wire path={[[.30,.56,.25],[.24,.65,-.03],[-.39,.65,-.66],[-.60,.61,-.91]]} color="#15191e"/>
    </> : <><Wire path={[[.73,.57,.50],[.73,.74,.31],[.46,.73,.25],[.11,.61,.23]]} color="#3d91df"/>
    <Wire path={[[.66,.57,.50],[.65,.64,.29],[.53,.62,.17]]} color="#e84d47"/></>}
    <Wire path={[[.43,.64,-.88],[.65,.76,-.59],[.04,.68,-.46],[-.49,.59,.35]]} color="#e84d47"/>
    <Wire path={[[.37,.64,-.84],[.57,.69,-.55],[-.03,.65,-.42],[-.50,.57,.39]]} color="#15191e"/>
    <Wire path={[[-.65,.59,.58],[-.82,.55,.57],[-.75,.32,.25]]} color="#e7b850"/>
    <Wire path={[[-.52,.61,.59],[-.08,.66,.83],[.58,.53,.54],[.68,.34,.28]]} color="#ff8a41"/>
    <Wire path={[[-.56,.61,-.94],[-.40,.70,-.98],[-.25,.64,-.46]]} color="#222834"/>
    {(esp32 ? esp32Anchors : bluetoothAnchors).map((position,index)=>(showLabels || selected===index) && <group key={index}>
      {selected===index&&<mesh position={[position[0],position[1]-.10,position[2]]} rotation={[-Math.PI/2,0,0]}>
        <ringGeometry args={[.16,.21,40]}/><meshBasicMaterial color="#ffe17e" depthTest={false}/>
      </mesh>}
      {esp32 && <Line points={[position,esp32LabelPositions[index]]} color={selected===index?'#ffe17e':'#94bdcd'} lineWidth={1.3}/>}
      <WorldLabel position={esp32 ? esp32LabelPositions[index] : position} className="gp-marker-anchor">
        <button type="button" className="gp-marker" aria-label={labelParts[index][0]} aria-pressed={selected===index} onClick={()=>onSelect(index)}>
          {index+1}{selected===index&&<span className="gp-demo-marker-name">{labelParts[index][0]}</span>}
        </button>
      </WorldLabel>
    </group>)}
  </group>;
}

export function BluetoothCarDemo({esp32=false}: {esp32?:boolean}) {
  const labelParts = esp32 ? esp32Car.parts : bluetoothCar.parts;
  const [link,setLink]=useState<'Wi-Fi'|'Bluetooth Classic'>('Wi-Fi');
  const [connected,setConnected]=useState(true);
  const [key,setKey]=useState<BluetoothCarCommand>('S');
  const [message,setMessage]=useState('Choose a command to drive.');
  const [selected,setSelected]=useState<number|null>(null);
  const [showLabels,setShowLabels]=useState(false);
  const [run,setRun]=useState(0);
  const timer=useRef<number|undefined>(undefined);
  const command=bluetoothCarCommands.find(item=>item.key===key)!;
  useEffect(()=>()=>window.clearTimeout(timer.current),[]);
  function send(next:BluetoothCarCommand) {
    window.clearTimeout(timer.current);
    setKey(next);
    setMessage(next==='S' ? 'Stop sent. The driver is disabled.' : esp32 ? `Command received over ${link}.` : 'Command sent to the Bluetooth board.');
    if(next==='S') return;
    timer.current=window.setTimeout(()=>{
      setKey('S');
      setMessage('Command timed out. The driver stopped both wheels.');
    },bluetoothCarPulseMs);
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label={esp32 ? "Interactive ESP32 rover driving area" : "Interactive Bluetooth car driving area"}>
        <Canvas dpr={[1,1.5]} camera={{position:[3.7,4.5,5.6],fov:43}} fallback={<p>WebGL is required for the driving view. The wheel responses are also shown in the controls.</p>}>
          <color attach="background" args={['#1c2934']}/>
          <ambientLight intensity={.95}/>
          <directionalLight position={[4,7,5]} intensity={2.25}/>
          <Environment resolution={128}><Lightformer position={[1,5,2]} rotation={[Math.PI/2,0,0]} scale={8} intensity={3}/></Environment>
          <Box at={[0,-.08,0]} size={[10,.14,10]} color="#263a47"/>
          <Line points={[[-3.7,.025,-3.7],[3.7,.025,-3.7],[3.7,.025,3.7],[-3.7,.025,3.7],[-3.7,.025,-3.7]]} color="#d7b76a" lineWidth={2}/>
          <gridHelper args={[7.4,8,'#526774','#415564']}/>
          <ContactShadows position={[0,.014,0]} opacity={.54} scale={9} blur={2.8} far={4} resolution={256}/>
          <BluetoothRover key={run} command={command} selected={selected} showLabels={showLabels} onSelect={setSelected} esp32={esp32} labelParts={labelParts}/>
          <OrbitControls target={[0,.25,0]} enablePan={false} minDistance={4} maxDistance={15} maxPolarAngle={1.46}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Motor state">
        <div><span>Left wheel</span><strong>{command.left===0?'Stopped':command.left>0?'Forward':'Reverse'}</strong></div>
        <div><span>Right wheel</span><strong>{command.right===0?'Stopped':command.right>0?'Forward':'Reverse'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Drive the finished car</h3>
      <p>Send a command as you would from your phone. Each command drives for up to 850 ms. Send another to keep moving.</p>
      {esp32 && <section>
        <h4>Choose a control link</h4>
        <p>Changing links restarts the radio on the real rover. In the demo, switching links stops the wheels and reconnects the new link.</p>
        <div className="gp-steps" role="group" aria-label="Control link">
          {(['Wi-Fi','Bluetooth Classic'] as const).map(mode=><button type="button" key={mode} aria-pressed={link===mode} onClick={()=>{
            send('S');setLink(mode);setConnected(true);setMessage(`${mode} connected. The driver is in standby.`);
          }}>{mode}</button>)}
        </div>
        <button type="button" className="gp-button gp-secondary" onClick={()=>{
          setConnected(!connected);
          if (!connected) setMessage(`${link} reconnected. Send a new command to drive.`);
          else setMessage(key==='S' ? `${link} disconnected. The driver is in standby.`
            : `${link} disconnected. The current drive command will expire automatically.`);
        }}>{connected ? 'Simulate link loss' : 'Reconnect link'}</button>
      </section>}
      <div className="gp-rc-controls" role="group" aria-label="Driving commands">
        {bluetoothCarCommands.map(({key:letter,label})=><button key={letter} type="button" className="gp-button gp-secondary"
          aria-pressed={key===letter} disabled={!connected} onClick={()=>send(letter)}><kbd>{letter}</kbd>{label}</button>)}
        <button type="button" className="gp-button gp-secondary" onClick={()=>{send('S');setRun(value=>value+1);setMessage('Car reset to the start.');}}>Reset position</button>
      </div>
      <p className="gp-check" role="status">{message} {command.description}</p>
      <h4>Inspect the mounted parts</h4>
      <button type="button" className="gp-button gp-secondary" aria-pressed={showLabels} onClick={()=>setShowLabels(value=>!value)}>Show all model labels</button>
      <ol className="gp-demo-labels">{labelParts.map(([name],index)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      {selected!==null&&<p className="gp-demo-description" role="status">{labelParts[selected][2]}</p>}
    </div>
  </div>;
}

type BeaconRunState = 'Ready'|'Searching'|'Steering left'|'Steering right'|'Driving forward'|'Arrived'|'Time limit reached';
type BeaconReading = {left:number;right:number;state:BeaconRunState};
const initialBeaconReading:BeaconReading = {left:170,right:170,state:'Ready'};
const dividerBands=['#6a311d','#1d2024','#c77723','#b7953f'];
const ledResistorBands=['#a92c2c','#a92c2c','#6a311d','#b7953f'];
const beaconAnchors: Point[] = [[-.45,.79,-.13],[.73,.90,1.05],[.20,.72,.57],[.63,.62,-.33],[1.05,.35,.25],
  [0,.43,.98],[.03,.68,-.82],[.29,.65,.42],[-.63,.65,-.76],[0,.88,.95]];

function PhotoCell({at}: {at:Point}) {
  return <group position={at}>
    <Box at={[-.039,.05,0]} size={[.018,.20,.022]} color="#bfc4ca" metal={.56}/>
    <Box at={[.039,.05,0]} size={[.018,.20,.022]} color="#bfc4ca" metal={.56}/>
    <mesh position={[0,.21,.025]} rotation={[Math.PI/2,0,0]}>
      <cylinderGeometry args={[.082,.082,.04,32]}/><meshStandardMaterial color="#b78750"/>
    </mesh>
    <Line points={[[-.047,.177,.047],[-.047,.239,.047],[-.022,.239,.047],[-.022,.177,.047],[.005,.177,.047],[.005,.239,.047],[.034,.239,.047],[.034,.177,.047]]}
      color="#65321e" lineWidth={1.5}/>
  </group>;
}

function BeaconCourseRover({targetX,enabled,running,selected,select,onReading}: {
  targetX:number;enabled:boolean;running:boolean;selected:number;select:(index:number)=>void;onReading:(sample:BeaconReading)=>void;
}) {
  const rover=useRef<Group>(null);
  const leftWheel=useRef<Group>(null);
  const rightWheel=useRef<Group>(null);
  const last=useRef<BeaconReading>(initialBeaconReading);
  const clock=useRef({elapsed:0,published:0,started:false});
  const [arrived,setArrived]=useState(false);
  useFrame((_,elapsed)=>{
    if (!rover.current || !leftWheel.current || !rightWheel.current || !running) return;
    if (last.current.state==='Arrived' || last.current.state==='Time limit reached') return;
    const dt=Math.min(elapsed,.08);
    const {position,rotation}=rover.current;
    const dx=targetX-position.x, dz=2.1-position.z;
    const distance=Math.hypot(dx,dz);
    const bearing=Math.atan2(dx,dz)-rotation.y;
    const brightness=enabled ? 984-distance*104 : 170;
    const offset=enabled ? Math.sin(bearing)*190 : 0;
    const left=Math.round(Math.max(0,Math.min(1023,brightness+offset)));
    const right=Math.round(Math.max(0,Math.min(1023,brightness-offset)));
    let state:BeaconRunState='Searching';
    let speedLeft=0, speedRight=0;
    if(clock.current.elapsed>=beaconThresholds.limitMs/1000) state='Time limit reached';
    else if (Math.min(left,right)>=beaconThresholds.arrival) state='Arrived';
    else if (Math.max(left,right)>=beaconThresholds.detect) {
      speedLeft=left-right>beaconThresholds.balance ? 0 : 1.25;
      speedRight=right-left>beaconThresholds.balance ? 0 : 1.25;
      state=speedLeft===0 ? 'Steering left' : speedRight===0 ? 'Steering right' : 'Driving forward';
      clock.current.started=true;
    }
    if(clock.current.started) clock.current.elapsed+=dt;
    rotation.y+=(speedRight-speedLeft)*dt/1.5;
    const velocity=(speedLeft+speedRight)/2;
    position.x+=Math.sin(rotation.y)*velocity*dt;
    position.z+=Math.cos(rotation.y)*velocity*dt;
    leftWheel.current.rotation.x+=speedLeft*dt/.35;
    rightWheel.current.rotation.x+=speedRight*dt/.35;
    clock.current.published+=dt;
    if(state!==last.current.state || clock.current.published>=.15) {
      clock.current.published=0;
      last.current={left,right,state};
      onReading(last.current);
    }
    if(state==='Arrived') setArrived(true);
  });
  return <group ref={rover} position={[0,0,-1.3]}>
    <Box at={[0,.43,0]} size={[1.8,.10,2.10]} color="#a13b32" metal={.44}/>
    <Box at={[0,.52,.96]} size={[1.57,.12,.14]} color="#343a40"/>
    {[-.72,.72].map(x=><group key={x}>
      <PhotoCell at={[x,.55,.99]}/>
      <Wire path={[[x,.62,1.02],[x,.57,.83],[x/2,.65,.58]]} color={x>0?'#f4ba4e':'#8aa9fb'}/>
    </group>)}
    <Suspense fallback={<Box at={[-.43,.54,-.12]} size={[.86,.14,.72]} color="#176a92"/>}>
      <FittedHardware id="boards-01" at={[-.43,.56,-.12]} size={[.86,.22,.72]}/>
    </Suspense>
    <group position={[.62,.55,-.33]}><BluetoothMotorDriver/></group>
    <Box at={[.29,.53,.43]} size={[.49,.09,.48]} color="#e7e4de"/>
    {Array.from({length:7},(_,index)=><Box key={index} at={[.29,.58,.25+.057*index]} size={[.32,.01,.014]} color="#9da8aa"/>)}
    <group position={[.20,.63,.52]}><AxialResistor bands={dividerBands}/></group>
    <group position={[.35,.63,.56]}><AxialResistor bands={dividerBands}/></group>
    <Lamp at={[0,.58,.95]} color="#fa3824" lit={arrived}/>
    <Box at={[.08,.54,-.83]} size={[.94,.19,.34]} color="#22272b"/>
    <Box at={[-.64,.53,-.74]} size={[.28,.14,.54]} color="#293849"/>
    <Wire path={[[.50,.64,-.82],[.72,.70,-.53],[.62,.59,-.45]]} color="#f45a4a"/>
    <Wire path={[[.10,.65,.42],[-.06,.70,.36],[-.39,.61,.04]]} color="#eaba43"/>
    <Wire path={[[.54,.59,-.36],[.16,.70,-.39],[-.19,.65,-.28]]} color="#62aadc"/>
    <Disk at={[0,.13,-.84]} radius={.13} depth={.16} color="#555f6b" axle/>
    {[-1,1].map(side=><group key={side} position={[side,.35,.25]}>
      <Box at={[-side*.37,-.04,0]} size={[.44,.25,.49]} color="#dca330"/>
      <group ref={side===1?leftWheel:rightWheel}>
        <Disk at={[0,0,0]} radius={.34} depth={.24} color="#1b2127" axle/>
        <Disk at={[side*.13,0,0]} radius={.23} depth={.045} color="#d4a032" axle/>
        {Array.from({length:24},(_,index)=><group key={index} rotation={[index*Math.PI/12,0,0]}>
          <Box at={[0,.34,0]} size={[.23,.03,.061]} color="#303940"/>
        </group>)}
        <Box at={[side*.16,.13,0]} size={[.021,.082,.052]} color="#fce28e"/>
      </group>
    </group>)}
    {Array.from(new Set([1,9,selected])).map(index=>{
      const position=beaconAnchors[index];
      const label:Point=[position[0],position[1]+(index===1 ? .30 : .22),position[2]];
      return <group key={index}>
        <Line points={[position,label]} color={selected===index?'#ffe17e':'#aac7d9'} lineWidth={1.5}/>
        <WorldLabel position={label} className="gp-marker-anchor">
          <button className="gp-marker" type="button" aria-label={fireResponseRover.parts[index][0]}
            aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button>
        </WorldLabel>
      </group>;
    })}
  </group>;
}

export function BeaconRoverDemo() {
  const [targetX,setTargetX]=useState(0);
  const [enabled,setEnabled]=useState(true);
  const [running,setRunning]=useState(false);
  const [run,setRun]=useState(0);
  const [reading,setReading]=useState(initialBeaconReading);
  const [selected,setSelected]=useState(1);
  const done=reading.state==='Arrived'||reading.state==='Time limit reached';
  function reset() {
    setRun(value=>value+1);
    setReading(initialBeaconReading);
    setRunning(false);
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive beacon response course">
        <Canvas dpr={[1,1.5]} camera={{position:[5.1,6.2,7.8],fov:40}} fallback={<p>WebGL is required for the 3D course.</p>}>
          <color attach="background" args={['#202e36']}/>
          <ambientLight intensity={1.2}/>
          <directionalLight position={[4,7,4]} intensity={2.1}/>
          <Box at={[0,-.072,0]} size={[7.5,.13,7.4]} color="#414b51"/>
          <gridHelper args={[7,7,'#707e86','#56616a']}/>
          <Line points={[[-2.65,.02,-2.65],[2.65,.02,-2.65],[2.65,.02,2.85],[-2.65,.02,2.85],[-2.65,.02,-2.65]]} color="#d3b465" lineWidth={2}/>
          <ContactShadows position={[0,.016,0]} opacity={.62} scale={7.5} blur={2.5} far={4} resolution={256}/>
          <group position={[targetX,0,2.1]}>
            <Disk at={[0,.07,0]} radius={.34} depth={.13} color="#a87d29"/>
            <Box at={[0,.37,0]} size={[.22,.65,.22]} color="#e8a532"/>
            <mesh position={[0,.77,-.14]} rotation={[Math.PI/2,0,0]}>
              <cylinderGeometry args={[.23,.18,.22,32]}/><meshStandardMaterial color="#333842" metalness={.44}/>
            </mesh>
            <mesh position={[0,.77,-.257]}>
              <sphereGeometry args={[.18,28,18]}/><meshStandardMaterial color="#f7e9bd" emissive="#ffd983" emissiveIntensity={enabled ? 2 : 0}/>
            </mesh>
            {enabled&&<pointLight position={[0,.70,-.42]} color="#ffcb76" intensity={4.4} distance={5}/>}
          </group>
          <BeaconCourseRover key={run} targetX={targetX} enabled={enabled} running={running} selected={selected} select={setSelected} onReading={setReading}/>
          <OrbitControls target={[0,.24,.25]} enablePan={false} minDistance={4} maxDistance={15} maxPolarAngle={1.45}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Simulated analog readings">
        <div><span>Left sensor · A0</span><strong>{reading.left}</strong></div>
        <div><span>Right sensor · A1</span><strong>{reading.right}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Run the beacon course</h3>
      <p>Put the flashlight on the left or right to see how the two sensor readings steer the rover. Turn off the beacon to see the rover wait.</p>
      <div className="gp-steps" role="group" aria-label="Beacon position">
        {[1.55,0,-1.55].map((position,index)=><button key={position} type="button" aria-pressed={position===targetX} onClick={()=>{setTargetX(position);reset();}}>
          {['Left','Center','Right'][index]}
        </button>)}
      </div>
      <div className="gp-steps">
        <button type="button" aria-pressed={enabled} onClick={()=>setEnabled(value=>!value)}>Beacon {enabled?'on':'off'}</button>
        <button type="button" className="gp-button" disabled={running||done} onClick={()=>setRunning(true)}>Run rover</button>
        <button type="button" onClick={reset}>Reset course</button>
      </div>
      <p className="gp-check" role="status">{reading.state}{reading.state==='Arrived'?' · Motors stopped and red alert on.':reading.state==='Searching'?' · Waiting for enough light.':''}</p>
      <h4>Inspect the rover</h4>
      <ol className="gp-demo-labels">{fireResponseRover.parts.map(([name],index)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{fireResponseRover.parts[selected][2]}</p>
    </div>
  </div>;
}

function SolarPanel({brightness=1}: {brightness?:number}) {
  return <>
    <Box at={[0,0,0]} size={[1.96,.060,1.45]} color="#292f34" metal={.36}/>
    <Box at={[0,.046,0]} size={[1.87,.021,1.35]} color="#131a24"/>
    {Array.from({length:24},(_,index)=>{
      const x=(index%6-2.5)*.30, z=(Math.floor(index/6)-1.5)*.32;
      return <group key={index} position={[x,.062,z]}>
        <Box at={[0,0,0]} size={[.281,.008,.301]} color={brightness>.6 ? '#224a79' : '#18273e'} metal={.52}/>
        {[-.069,.069].map(offset=><Box key={offset} at={[offset,.005,0]} size={[.005,.002,.28]} color="#a9bacb"/>)}
      </group>;
    })}
  </>;
}

function SolarUsbBreakout() {
  return <>
    <Box at={[0,0,0]} size={[.34,.035,.42]} color="#1b5789"/>
    <Box at={[0,.037,-.094]} size={[.18,.060,.16]} color="#b4c4ce" metal={.65}/>
    <Box at={[0,.041,-.179]} size={[.13,.028,.012]} color="#171e28"/>
    {Array.from({length:5},(_,index)=><Disk key={index} at={[(index-2)*.051,.022,.133]} radius={.018} depth={.013} color="#d1b072"/>)}
  </>;
}

function SolarStartButton() {
  return <>
    <Box at={[0,0,0]} size={[.22,.078,.22]} color="#242e38"/>
    <Box at={[0,.044,0]} size={[.208,.014,.206]} color="#afb7c1" metal={.62}/>
    <Disk at={[0,.065,0]} radius={.064} depth={.048} color="#272e35"/>
  </>;
}

function FeltSweeperHead({spinning=false}: {spinning?:boolean}) {
  const rotor=useRef<Group>(null);
  useFrame((_,dt)=>{if (rotor.current&&spinning) rotor.current.rotation.y+=Math.min(dt,.08)*11;});
  return <>
    <Box at={[0,.31,0]} size={[.30,.41,.31]} color="#d8a322"/>
    <Disk at={[0,.16,0]} radius={.41} depth={.045} color="#536c76"/>
    <group ref={rotor} position={[0,.08,0]}>
      <Disk at={[0,.019,0]} radius={.345} depth={.074} color="#d09c36"/>
      {[0,2.094,4.188].map(angle=><group key={angle} rotation={[0,angle,0]}>
        <Disk at={[.205,-.030,0]} radius={.098} depth={.047} color="#e3cca3"/>
        <Disk at={[.177,.062,0]} radius={.025} depth={.015} color="#b9c0ca"/>
      </group>)}
    </group>
  </>;
}

const sweepAnchors:Point[]=[[0,1.07,-.30],[.73,.67,-.50],[0,.43,1.08],[-.54,.70,-.22],[.51,.69,.17],[1.03,.36,.23],
  [-.73,.47,.67],[.25,.65,-.87],[.40,.63,.53],[-.62,.66,-.76],[.32,.65,.40],[-.53,.71,.62]];
const paperScraps=Array.from({length:16},(_,index)=>({
  x:((index*7)%15-7)*.037,
  z:-1.18+Math.floor(index/2)*.36,
  turn:((index*9)%17)*.34,
  side:index%2===0?-1:1,
}));
const sweeperStartZ=-2.45;
const sweeperTravel=3.45;

function SolarCleaningModel({progress,spinning,light,selected,onSelect,lifted}: {
  progress:number;spinning:boolean;light:number;selected:number;onSelect:(index:number)=>void;lifted:boolean;
}) {
  const panelY=lifted ? 1.92 : .92;
  return <group position={[0,0,sweeperStartZ+progress*sweeperTravel]}>
    <Box at={[0,.43,-.12]} size={[1.72,.12,2.08]} color="#268579" metal={.55}/>
    {[-1,1].map(side=><group key={side} position={[side,.35,.23]}>
      <Box at={[-side*.36,-.05,0]} size={[.39,.27,.47]} color="#d9a02b"/>
      <group rotation={[progress*sweeperTravel/.34,0,0]}>
        <Disk at={[0,0,0]} radius={.34} depth={.23} color="#20272e" axle/>
        <Disk at={[side*.13,0,0]} radius={.22} depth={.045} color="#dab84e" axle/>
        <Disk at={[side*.16,.126,0]} radius={.037} depth={.035} color="#53646d" axle/>
        {Array.from({length:24},(_,index)=><group key={index} rotation={[index*Math.PI/12,0,0]}>
          <Box at={[0,.339,0]} size={[.22,.026,.064]} color="#333d43"/>
        </group>)}
      </group>
    </group>)}
    <Disk at={[0,.14,-.91]} radius={.14} depth={.16} color="#515e65" axle/>
    <Box at={[0,.35,.89]} size={[.48,.13,.64]} color="#566b79" metal={.6}/>
    <group position={[0,0,1.09]}><FeltSweeperHead spinning={spinning}/></group>
    <Suspense fallback={<Box at={[-.54,.57,-.22]} size={[.85,.15,.66]} color="#177396"/>}>
      <FittedHardware id="boards-01" at={[-.54,.57,-.22]} size={[.72,.22,.68]}/>
    </Suspense>
    <group position={[.48,.54,.17]}><BluetoothMotorDriver/></group>
    <group position={[.49,.54,-.22]}><BluetoothMotorDriver/></group>
    <group position={[.69,.56,-.59]}><SolarUsbBreakout/></group>
    <group position={[-.51,.56,.62]}><SolarStartButton/></group>
    <Box at={[.14,.57,-.85]} size={[.85,.18,.32]} color="#252b32"/>
    <Box at={[-.63,.56,-.79]} size={[.26,.15,.45]} color="#33485c"/>
    <Box at={[.32,.54,.57]} size={[.46,.10,.34]} color="#e9e8e4"/>
    <group position={[.31,.64,.48]}><AxialResistor bands={dividerBands}/></group>
    <group position={[.31,.64,.58]}><AxialResistor bands={dividerBands}/></group>
    {[-.73,.73].flatMap(x=>[-.83,.35].map(z=><Box key={`${x}:${z}`} at={[x,.69,z]} size={[.068,.39,.068]} color="#bcc8c8" metal={.65}/>))}
    <group position={[0,panelY,-.25]}><SolarPanel brightness={light}/></group>
    <Wire path={[[.90,panelY,-.64],[.84,panelY-.08,-.74],[.78,.72,-.65],[.69,.60,-.61]]} color="#232a2e"/>
    <Wire path={[[.66,.59,-.56],[.72,.63,-.35],[.54,.58,-.23]]} color="#f06b49"/>
    <Wire path={[[.52,.58,-.17],[.20,.65,.06],[.14,.57,.56],[.08,.42,1.05]]} color="#eac044"/>
    <Wire path={[[.39,.63,.54],[.08,.71,.56],[-.37,.61,.25]]} color="#66b2e0"/>
    {Array.from(new Set([0,2,selected])).map(index=>{
      const position=sweepAnchors[index];
      const anchor:Point=index===0?[position[0],panelY+.11,position[2]]:position;
      const label:Point=[anchor[0]+(index===0?0:.24),anchor[1]+.39,anchor[2]];
      return <group key={index}>
        <Line points={[anchor,label]} color={selected===index?'#ffe088':'#aac7d9'} lineWidth={1.6}/>
        <WorldLabel position={label} className="gp-marker-anchor">
          <button type="button" className="gp-marker" aria-label={solarSweeper.parts[index][0]} aria-pressed={selected===index} onClick={()=>onSelect(index)}>
            {index+1}{selected===index&&<span className="gp-demo-marker-name">{solarSweeper.parts[index][0]}</span>}
          </button>
        </WorldLabel>
      </group>;
    })}
  </group>;
}

type SweepState='Ready'|'Checking solar power'|'Sweeping'|'Pass complete'|'Stopped in shade'|'Stopped manually';
const solarConditions=[
  {name:'Direct sun',voltage:5.0,brightness:1},
  {name:'Partial shade',voltage:4.0,brightness:.42},
  {name:'Covered',voltage:0,brightness:.12},
];

export function SolarSweeperDemo() {
  const [light,setLight]=useState(0);
  const [state,setState]=useState<SweepState>('Ready');
  const [progress,setProgress]=useState(0);
  const [selected,setSelected]=useState(0);
  const [lifted,setLifted]=useState(false);
  const condition=solarConditions[light];
  const spinning=state==='Sweeping'||state==='Checking solar power';
  const cutoff=solarSweepLimits.cutoffMv/1000;
  useEffect(()=>{
    if(state==='Checking solar power') {
      const timer=window.setTimeout(()=>setState(condition.voltage>=cutoff?'Sweeping':'Stopped in shade'),solarSweepLimits.settleMs);
      return ()=>window.clearTimeout(timer);
    }
    if(state!=='Sweeping') return;
    if(condition.voltage<cutoff) {
      setState('Stopped in shade');
      return;
    }
    const start=performance.now();
    const timer=window.setInterval(()=>{
      const fraction=Math.min(1,(performance.now()-start)/solarSweepLimits.passMs);
      setProgress(fraction);
      if(fraction===1) setState('Pass complete');
    },45);
    return ()=>window.clearInterval(timer);
  },[state,condition.voltage,cutoff]);
  const brushZ=sweeperStartZ+progress*sweeperTravel+1.09;
  const piecesSwept=paperScraps.filter(piece=>brushZ-piece.z>=.26).length;
  function start() {
    if(spinning) {
      setState('Stopped manually');
      return;
    }
    if(condition.voltage<cutoff) {
      setState('Stopped in shade');
      return;
    }
    setProgress(0);
    setState('Checking solar power');
    setLifted(false);
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive solar sweeping course">
        <Canvas dpr={[1,1.5]} camera={{position:[5.2,5.6,6.3],fov:42}} fallback={<p>WebGL is required for the 3D sweeping course.</p>}>
          <color attach="background" args={['#1d2d36']}/>
          <ambientLight intensity={.72}/>
          <directionalLight position={[3,7,5]} intensity={.85+condition.brightness*1.5}/>
          <Environment resolution={128}><Lightformer position={[2,4,2]} rotation={[Math.PI/2,0,0]} scale={7} intensity={2}/></Environment>
          <Box at={[0,-.07,0]} size={[5.8,.12,8]} color="#58706c"/>
          <gridHelper args={[7.7,10,'#77918b','#698580']}/>
          <Line points={[[-.58,.020,-2],[.58,.020,-2],[.58,.020,2.65],[-.58,.020,2.65],[-.58,.020,-2]]} color="#f3dd92" lineWidth={2}/>
          <ContactShadows position={[0,.016,0]} opacity={.51} scale={8} blur={2.7} far={4} resolution={256}/>
          {paperScraps.map((piece,index)=>{
            const shift=Math.max(0,Math.min(1,(brushZ-piece.z)/.26));
            return <group key={index} position={[piece.x*(1-shift)+piece.side*.85*shift,.041,piece.z+shift*.09]} rotation={[0,piece.turn+shift*1.6,0]}>
              <Box at={[0,0,0]} size={[.13,.017,.080]} color={index%3===0?'#f2cd6c':index%3===1?'#eee8d5':'#e5a078'}/>
            </group>;
          })}
          <SolarCleaningModel progress={progress} spinning={spinning} light={condition.brightness} selected={selected} onSelect={setSelected} lifted={lifted}/>
          <OrbitControls target={[0,.24,0]} enablePan={false} minDistance={4} maxDistance={15} maxPolarAngle={1.46}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Simulated solar readings">
        <div><span>Solar USB under load</span><strong>{condition.voltage.toFixed(1)} V</strong></div>
        <div><span>Paper pieces swept out</span><strong>{piecesSwept} / {paperScraps.length}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Test a sweeping pass</h3>
      <p>Start in direct sun, then cover the panel while the rover moves. The voltage and paper count are simulated. The real test uses a meter and a marked lane.</p>
      <div className="gp-steps" role="group" aria-label="Solar illumination">
        {solarConditions.map(({name},index)=><button key={name} type="button" aria-pressed={light===index} onClick={()=>setLight(index)}>{name}</button>)}
      </div>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={start}>{spinning?'Stop pass':'Start pass'}</button>
        <button type="button" onClick={()=>{setProgress(0);setState('Ready');}}>Reset course</button>
      </div>
      <p className="gp-check" role="status">{state}{state==='Stopped in shade'?' · The brush and wheels remain stopped until you start another pass.':state==='Pass complete'?' · The brush and wheels have stopped.':''}</p>
      <h4>Inspect the mounted parts</h4>
      <button type="button" className="gp-button gp-secondary" disabled={spinning} aria-pressed={lifted} onClick={()=>setLifted(value=>!value)}>
        {lifted?'Lower panel':'Lift panel to inspect'}
      </button>
      <ol className="gp-demo-labels">{solarSweeper.parts.map(([name],index)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={index===selected} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{solarSweeper.parts[selected][2]}</p>
    </div>
  </div>;
}

function RangeWindow({dark=false}: {dark?:boolean}) {
  return <>
    <Box at={[0,0,0]} size={[.146,.115,.055]} color="#303840"/>
    {[-.032,.032].map(x=><Box key={x} at={[x,0,.030]} size={[.042,.055,.008]} color={dark?'#111920':'#86546c'} metal={.42}/>)}
  </>;
}

function RangerDeck() {
  return <>
    <Box at={[0,0,0]} size={[.54,.041,.56]} color="#262a31"/>
    <Box at={[0,.031,0]} size={[.16,.036,.18]} color="#10171a"/>
    {Array.from({length:4},(_,index)=><group key={index} rotation={[0,index*Math.PI/2,0]}>
      <Box at={[0,-.003,.277]} size={[.24,.038,.15]} color="#262a31"/>
      <Box at={[-.087,.022,.329]} size={[.047,.014,.058]} color="#be9861" metal={.62}/>
      <Box at={[.087,.022,.329]} size={[.047,.014,.058]} color="#be9861" metal={.62}/>
      <group position={[0,.047,.354]}><RangeWindow/></group>
    </group>)}
    <group position={[0,.061,-.085]} rotation={[-Math.PI/2,0,0]}><RangeWindow/></group>
  </>;
}

function FlowDeck() {
  return <>
    <Box at={[0,0,0]} size={[.58,.036,.57]} color="#252b33"/>
    {[-.228,.228].map(x=><Box key={x} at={[x,.04,0]} size={[.068,.075,.53]} color="#121a21"/>)}
    <group position={[0,-.049,.09]} rotation={[Math.PI/2,0,0]}><RangeWindow dark/></group>
    <Disk at={[.048,-.042,-.091]} radius={.048} depth={.038} color="#131f26"/>
  </>;
}

function CrazyradioModel() {
  return <>
    <Box at={[0,0,0]} size={[.27,.047,.51]} color="#222a31"/>
    <Box at={[0,.023,.28]} size={[.225,.082,.21]} color="#bac7ce" metal={.72}/>
    <Box at={[0,.047,.02]} size={[.207,.039,.21]} color="#aab5bb" metal={.68}/>
    <Box at={[0,.024,-.28]} size={[.10,.07,.12]} color="#c4a65a" metal={.78}/>
    <Box at={[0,.265,-.317]} size={[.089,.55,.092]} color="#1b222b"/>
  </>;
}

function DroneRotor({spinning,direction}: {spinning:boolean;direction:number}) {
  const rotor=useRef<Group>(null);
  useFrame((_,delta)=>{if(rotor.current&&spinning) rotor.current.rotation.y+=Math.min(delta,.08)*direction*35;});
  return <>
    <Disk at={[0,0,0]} radius={.104} depth={.23} color="#aab1b9" />
    <Disk at={[0,-.11,0]} radius={.103} depth={.07} color="#292e37"/>
    <group ref={rotor} position={[0,.14,0]}>
      <Disk at={[0,0,0]} radius={.083} depth={.042} color="#28303a"/>
      <group rotation={[0,.22,0]}><Box at={[.213,.004,0]} size={[.34,.033,.12]} color="#232832"/></group>
      <group rotation={[0,Math.PI+.22,0]}><Box at={[.213,.004,0]} size={[.34,.033,.12]} color="#232832"/></group>
      {spinning&&<mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.15,.37,40]}/><meshBasicMaterial color="#506879" transparent opacity={.20} depthWrite={false}/></mesh>}
    </group>
  </>;
}

function CrazyflieFrame({spinning=false}: {spinning?:boolean}) {
  return <>
    <Box at={[0,0,0]} size={[.64,.052,.69]} color="#29313a"/>
    <Box at={[0,.095,-.023]} size={[.43,.137,.48]} color="#b5b9b7" metal={.48}/>
    {[-.13,.13].map(z=><Box key={z} at={[0,.170,z]} size={[.45,.018,.056]} color="#262c32"/>)}
    <Box at={[0,.034,-.324]} size={[.13,.058,.059]} color="#aebbc7" metal={.62}/>
    {[-1,1].flatMap(x=>[-1,1].map(z=><group key={`${x}:${z}`}>
      <group position={[x*.421,0,z*.422]} rotation={[0,Math.atan2(x,z),0]}>
        <Box at={[0,0,0]} size={[.123,.056,.77]} color="#222a33"/>
        <Box at={[0,.033,.071]} size={[.051,.019,.47]} color="#66717a" metal={.42}/>
      </group>
      <group position={[x*.69,-.01,z*.69]}><DroneRotor spinning={spinning} direction={x*z}/></group>
      <Disk at={[x*.51,.046,z*.51]} radius={.026} depth={.021} color={z===1?'#f6554b':'#54b8f2'} glow={spinning}/>
      <Box at={[x*.69,-.153,z*.69]} size={[.117,.15,.112]} color="#28343f"/>
    </group>))}
  </>;
}

const droneWorldScale=2.35;
const droneStartZ=-2.65;
const droneSensorOffset=.275;
type DronePose={travelMm:number;altitudeMm:number;advance:boolean};
const initialDronePose:DronePose={travelMm:0,altitudeMm:0,advance:false};
const dronePartAnchors:Point[]=[[-.35,.13,-.12],[0,.34,.36],[.26,-.09,-.17]];
const dronePartLabels:Point[]=[[-.61,.56,-.26],[.50,1.14,.38],[.75,.44,-.14]];

function DroneArena({pose,flying,wallMm,rangeMm,selected,onSelect}: {
  pose:DronePose;flying:boolean;wallMm:number;rangeMm:number|null;selected:number;onSelect:(index:number)=>void;
}) {
  const droneZ=droneStartZ+pose.travelMm/1000*droneWorldScale;
  const wallZ=droneStartZ+droneSensorOffset+wallMm/1000*droneWorldScale;
  const altitude=.163+pose.altitudeMm/1000*droneWorldScale;
  const beamY=altitude+.27;
  return <>
    <Box at={[0,-.065,.1]} size={[6.8,.12,8.0]} color="#495c64"/>
    <gridHelper position={[0,.005,.1]} args={[7.8,14,'#718991','#5c727c']}/>
    <Line points={[[-1.38,.017,-3.28],[1.38,.017,-3.28],[1.38,.017,3.42],[-1.38,.017,3.42],[-1.38,.017,-3.28]]} color="#d0ad69" lineWidth={2}/>
    <Disk at={[0,.017,droneStartZ]} radius={.71} depth={.022} color="#30424c"/>
    <Line points={[[-.36,.031,droneStartZ],[.36,.031,droneStartZ]]} color="#d4dce0" lineWidth={2}/>
    <Line points={[[0,.031,droneStartZ-.39],[0,.031,droneStartZ+.39]]} color="#d4dce0" lineWidth={2}/>
    <Box at={[0,1.02,wallZ+.070]} size={[2.56,2.03,.14]} color="#aa8058"/>
    {[-1.11,1.11].map(x=><Box key={x} at={[x,.044,wallZ+.1]} size={[.27,.086,.54]} color="#7a5b43"/>)}
    <Line points={[[-1.18,.025,wallZ-.4*droneWorldScale],[1.18,.025,wallZ-.4*droneWorldScale]]} color="#ffba66" lineWidth={2}/>
    <ContactShadows position={[0,.014,0]} opacity={.52} scale={8} blur={2.9} far={4} resolution={256}/>
    {rangeMm!==null&&pose.altitudeMm>80&&<Line points={[[0,beamY,droneZ+droneSensorOffset],[0,beamY,wallZ]]}
      color={pose.advance?'#68e6da':'#ffb36a'} lineWidth={2} dashed dashSize={.11} gapSize={.055}/>}
    <group position={[0,altitude,droneZ]} scale={.72}>
      <CrazyflieFrame spinning={flying||pose.altitudeMm>0}/>
      <group position={[0,.221,.02]}><RangerDeck/></group>
      <group position={[0,-.119,0]}><FlowDeck/></group>
      {Array.from(new Set([1,selected])).filter(index=>index!==3).map(index=><group key={index}>
        <Line points={[dronePartAnchors[index],dronePartLabels[index]]} color={index===selected?'#ffdb89':'#a8c7d4'} lineWidth={1.4}/>
        <WorldLabel position={dronePartLabels[index]} className="gp-marker-anchor">
          <button type="button" className="gp-marker" aria-label={lidarMicroDrone.parts[index][0]} aria-pressed={selected===index} onClick={()=>onSelect(index)}>
            {index+1}{selected===index&&<span className="gp-demo-marker-name">{lidarMicroDrone.parts[index][0]}</span>}
          </button>
        </WorldLabel>
      </group>)}
    </group>
    <group position={[-1.87,0,-1.88]}>
      <Box at={[0,.23,0]} size={[.87,.46,.58]} color="#344651"/>
      <group position={[0,.48,0]}><CrazyradioModel/></group>
      <WorldLabel position={[0,1.14,0]} className="gp-marker-anchor">
        <button type="button" className="gp-marker" aria-label={lidarMicroDrone.parts[3][0]} aria-pressed={selected===3} onClick={()=>onSelect(3)}>4</button>
      </WorldLabel>
    </group>
  </>;
}

export function LidarDroneDemo() {
  const [pose,setPose]=useState<DronePose>(initialDronePose);
  const [flying,setFlying]=useState(false);
  const [wallCm,setWallCm]=useState(165);
  const [lost,setLost]=useState(false);
  const [selected,setSelected]=useState(1);
  const rangeMm=lost ? null : wallCm*10-pose.travelMm;
  const permitted=proximityDecision(rangeMm,pose.advance);
  const status=!flying ? (pose.altitudeMm>0?'Landing':pose.travelMm>0?'Landed':'On the launch mat')
    : pose.altitudeMm<350 ? 'Taking off' : lost ? 'Holding · no valid return'
      : permitted ? 'Advancing' : 'Holding · clearance limit';
  useEffect(()=>{
    const timer=window.setInterval(()=>setPose(current=>{
      const altitudeMm=flying ? Math.min(350,current.altitudeMm+26) : Math.max(0,current.altitudeMm-29);
      const range=wallCm*10-current.travelMm;
      const advance=flying&&altitudeMm===350&&proximityDecision(lost?null:range,current.advance);
      const step=advance?Math.min(18,Math.max(0,range-lidarFlightLimits.stopMm)):0;
      const travelMm=current.travelMm+step;
      if(altitudeMm===current.altitudeMm&&step===0&&advance===current.advance) return current;
      return {altitudeMm,travelMm,advance};
    }),50);
    return ()=>window.clearInterval(timer);
  },[flying,lost,wallCm]);
  const minimumWall=Math.max(80,Math.ceil(pose.travelMm/10)+17);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive LiDAR flight course">
        <Canvas dpr={[1,1.5]} camera={{position:[5.3,5.5,-6.4],fov:43}} fallback={<p>WebGL is required for the flight scene. The simulated range and decision are shown below.</p>}>
          <color attach="background" args={['#202f38']}/>
          <ambientLight intensity={1.25}/>
          <directionalLight position={[3,7,-3]} intensity={2.2}/>
          <Environment resolution={128}><Lightformer position={[2,4,2]} rotation={[Math.PI/2,0,0]} scale={8} intensity={2.1}/></Environment>
          <DroneArena pose={pose} flying={flying} wallMm={wallCm*10} rangeMm={rangeMm} selected={selected} onSelect={setSelected}/>
          <OrbitControls target={[0,.45,.12]} enablePan={false} minDistance={4} maxDistance={15} maxPolarAngle={1.48}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Simulated LiDAR measurements">
        <div><span>Front range</span><strong>{rangeMm===null?'No return':`${(rangeMm/10).toFixed(1)} cm`}</strong></div>
        <div><span>Height above floor</span><strong>{(pose.altitudeMm/10).toFixed(1)} cm</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Fly the proximity course</h3>
      <p>Start a simulated approach. The drone holds at 40 cm, then needs at least 50 cm to advance again. The dotted line marks the front measurement.</p>
      <label htmlFor="gp-lidar-wall">Wall from launch mark · {wallCm} cm</label>
      <input id="gp-lidar-wall" className="gp-lidar-range" type="range" min={minimumWall} max={250} step={1} value={wallCm}
        onChange={event=>setWallCm(Number(event.target.value))}/>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>setFlying(value=>!value)}>{flying?'Land':'Take off'}</button>
        <button type="button" aria-pressed={lost} onClick={()=>setLost(value=>!value)}>{lost?'Restore sensor return':'Simulate no return'}</button>
        <button type="button" onClick={()=>{setFlying(false);setPose(initialDronePose);setWallCm(165);setLost(false);}}>Reset course</button>
      </div>
      <p className="gp-check" role="status">{status}</p>
      <h4>Inspect the drone and radio</h4>
      <ol className="gp-demo-labels">{lidarMicroDrone.parts.map(([name],index)=><li key={name}>
        <button className="gp-part-label" type="button" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{lidarMicroDrone.parts[selected][2]}</p>
    </div>
  </div>;
}

const bottleProfile=[
  [.04,-1.43],[.52,-1.43],[.62,-1.37],[.675,-1.22],[.68,-1.1],
  [.67,-.89],[.68,-.8],[.67,-.67],[.68,-.58],[.67,-.45],[.68,-.35],
  [.67,-.22],[.68,-.10],[.68,.64],[.65,.79],[.55,.94],[.43,1.02],[.41,1.23],
].map(([radius,distance])=>new Vector2(radius,distance));

const vacuumLidFace=new Shape();
vacuumLidFace.absarc(0,0,.44,0,Math.PI*2,false);
for(const [x,y] of [[-.28,.11],[.07,-.18]]) {
  const opening=new Path();
  opening.absarc(x,y,.103,0,Math.PI*2,true);
  vacuumLidFace.holes.push(opening);
}

function BottleChamber({cutaway=false,loose=false}: {cutaway?:boolean;loose?:boolean}) {
  const rimStart=cutaway ? .80 : 0;
  return <>
    <mesh rotation={[0,0,-Math.PI/2]}>
      <latheGeometry args={[bottleProfile,64,rimStart,Math.PI*2-rimStart*2]}/>
      <meshPhysicalMaterial color="#a3d8da" roughness={.16} clearcoat={.85} transparent
        opacity={cutaway?.18:.36} side={2} depthWrite={false}/>
    </mesh>
    <group position={[loose?1.36:1.25,0,0]} rotation={[0,0,-Math.PI/2]}>
      <mesh>
        <cylinderGeometry args={[.442,.442,.22,64,1,true]}/>
        <meshStandardMaterial color="#234c58" roughness={.55} side={2}/>
      </mesh>
      {Array.from({length:30},(_,index)=><group key={index} rotation={[0,index*Math.PI/15,0]}>
        <Box at={[.435,0,0]} size={[.020,.197,.039]} color="#416772"/>
      </group>)}
      <mesh position={[0,.105,0]} rotation={[-Math.PI/2,0,0]}>
        <shapeGeometry args={[vacuumLidFace,48]}/><meshStandardMaterial color="#2a5360" side={2}/>
      </mesh>
    </group>
    {[-1.27,1.15].map(x=><mesh key={x} position={[x,0,0]} rotation={[0,Math.PI/2,0]}>
      <torusGeometry args={[x<0?.635:.415,.024,8,64,Math.PI*2-rimStart*2]}/>
      <meshPhysicalMaterial color="#9ac9d1" transparent opacity={.64} roughness={.18}/>
    </mesh>)}
  </>;
}

function PortGrommet() {
  return <>
    {[-.030,.032].map(x=><mesh key={x} position={[x,0,0]} rotation={[0,Math.PI/2,0]}>
      <torusGeometry args={[.128,.033,12,32]}/><meshStandardMaterial color="#242e35" roughness={.86}/>
    </mesh>)}
    <mesh rotation={[0,0,-Math.PI/2]}>
      <cylinderGeometry args={[.129,.129,.066,32,1,true]}/><meshStandardMaterial color="#252d35" side={2}/>
    </mesh>
  </>;
}

function FilterMesh({restricted=false}: {restricted?:boolean}) {
  return <group rotation={[0,0,-Math.PI/2]}>
    <mesh><cylinderGeometry args={[.18,.24,.27,28,1,true]}/>
      <meshStandardMaterial color="#c4cbc0" opacity={.43} transparent depthWrite={false} side={2}/></mesh>
    {[0,1,2,3,4].map(i=><mesh key={i} position={[0,-.12+i*.057,0]} rotation={[-Math.PI/2,0,0]}>
      <torusGeometry args={[.236-i*.013,.008,6,28]}/><meshStandardMaterial color="#a5bcae"/>
    </mesh>)}
    {Array.from({length:12},(_,i)=><group key={i} rotation={[0,i*Math.PI/6,0]}>
      <Line points={[[.235,-.125,0],[.181,.135,0]]} color="#baafa4" lineWidth={.65}/>
    </group>)}
    <Disk at={[0,.123,0]} radius={.182} depth={.034} color="#6a7976"/>
    {restricted&&<Box at={[.01,-.14,.028]} size={[.28,.023,.41]} color="#d28b43"/>}
  </group>;
}

function BulbPump({compressed=false}: {compressed?:boolean}) {
  const body=useRef<Group>(null);
  useFrame((_,dt)=>{
    if(!body.current) return;
    const target=compressed?.55:1;
    body.current.scale.y+=(target-body.current.scale.y)*Math.min(dt*13,1);
    body.current.scale.z+=(target-body.current.scale.z)*Math.min(dt*13,1);
  });
  return <>
    <group ref={body}>
      <mesh scale={[.57,.29,.27]}><sphereGeometry args={[1,36,20]}/><meshStandardMaterial color="#272c31" roughness={.66}/></mesh>
      {[-.31,-.16,0,.16,.31].map(x=><mesh key={x} position={[x,0,0]} scale={[1,1,.93]} rotation={[0,Math.PI/2,0]}>
        <torusGeometry args={[.293*Math.sqrt(1-(x/.57)**2),.013,8,36]}/>
        <meshStandardMaterial color="#3c454b" roughness={.65}/>
      </mesh>)}
    </group>
    {[-1,1].map(side=><group key={side} position={[side*.58,0,0]} rotation={[0,0,-Math.PI/2]}>
      <Disk at={[0,0,0]} radius={.123} depth={.19} color="#b0bac0"/>
      <Disk at={[0,side*.116,0]} radius={.077} depth={.16} color="#4c565c"/>
    </group>)}
    <Line points={[[-.14,.30,0],[.15,.30,0],[.064,.30,.064],[.15,.30,0],[.064,.30,-.064]]} color="#aab7bd" lineWidth={1.3}/>
  </>;
}

function AirHose({points,radius=.076}: {points:Point[];radius?:number}) {
  const path=useMemo(()=>new CatmullRomCurve3(points.map(point=>new Vector3(...point))),[points]);
  return <mesh renderOrder={3}>
    <tubeGeometry args={[path,60,radius,12,false]}/>
    <meshPhysicalMaterial color="#9fd0cb" transparent opacity={.39} roughness={.18} depthWrite={false} clearcoat={.7}/>
  </mesh>;
}

const vacuumPickupPath:Point[]=[[-2.59,.22,1.41],[-1.80,.29,1.65],[-.16,.44,1.58],[1.27,.86,1.1],
  [1.69,1.06,.72],[1.72,1.03,.37],[1.36,.93,.18],[.70,.79,.19],[-.12,.70,.19]];
const vacuumOutletPath:Point[]=[[.90,1.30,-.12],[1.29,1.28,-.12],[1.64,1.18,-.22],[1.82,.98,-.31],[2.08,.84,-.32]];
const vacuumExhaustPath:Point[]=[[2.88,.84,-.32],[3.38,.84,-.32],[3.84,.84,-.32],[4.26,.92,-.32]];
const vacuumLeakPath:Point[]=[[1.26,1.90,.41],[1.33,1.60,.40],[1.43,1.46,.26],[.98,1.19,.14],[.72,1.12,-.09]];
const vacuumIntakePath:Point[]=[...vacuumPickupPath,[-.32,.87,.03],[.08,1.18,-.05],...vacuumOutletPath];
const vacuumAnchors:Point[]=[[-.80,1.49,.05],[-1.82,.31,1.65],[2.56,1.06,-.32],[.89,1.34,-.13],[1.43,1.14,.22]];
const vacuumLabels:Point[]=[[-.95,2.14,.12],[-2.17,.78,1.62],[2.80,1.65,-.29],[.62,1.82,-.35],[1.38,1.74,.52]];
const vacuumTray:Point[]=[[-2.78,.11,1.54],[-2.59,.11,1.64],[-2.80,.11,1.81],[-2.52,.11,1.83],[-2.98,.11,1.69],[-2.88,.11,1.95]];
const vacuumCaptured:Point[]=[[-.24,.46,.08],[-.55,.46,.16],[-.78,.46,-.03],[-.25,.45,-.19],[-.96,.47,.19],[-.47,.45,-.11]];
const vacuumCycleMs=1000;
type VacuumPhase='ready'|'exhaust'|'compressed'|'intake';
type VacuumCondition='sealed'|'restricted'|'leak';
const vacuumConditions = [
  {id:'sealed',label:'Clear mesh, tight cap',flow:'Strong',credit:6},
  {id:'restricted',label:'Partially covered mesh',flow:'Reduced',credit:2},
  {id:'leak',label:'Loose cap',flow:'Weak',credit:1},
] as const;

function FlowDots({points,rate,color,count}: {points:Point[];rate:number;color:string;count:number}) {
  const dots=useRef<Group>(null);
  const elapsed=useRef(0);
  const curve=useMemo(()=>new CatmullRomCurve3(points.map(point=>new Vector3(...point))),[points]);
  useFrame((_,dt)=>{
    if(!dots.current) return;
    elapsed.current+=Math.min(dt,.06)*rate;
    dots.current.children.forEach((child,index)=>{curve.getPointAt((elapsed.current+index/count)%1,child.position);});
  });
  return <group ref={dots}>{Array.from({length:count},(_,i)=><mesh key={i}>
    <sphereGeometry args={[.036,10,8]}/><meshBasicMaterial color={color} depthTest={false}/>
  </mesh>)}</group>;
}

function TravelingScrap({index}: {index:number}) {
  const item=useRef<Group>(null);
  const elapsed=useRef(0);
  const path=useMemo(()=>new CatmullRomCurve3([vacuumTray[index],...vacuumPickupPath,vacuumCaptured[index]].map(point=>new Vector3(...point))),[index]);
  useFrame((_,dt)=>{
    if(!item.current) return;
    elapsed.current=Math.min(1,elapsed.current+dt/(vacuumCycleMs/1000*.88));
    path.getPointAt(elapsed.current,item.current.position);
    item.current.rotation.y+=dt*6;
  });
  return <group ref={item} position={vacuumTray[index]}><Box at={[0,0,0]} size={[.091,.027,.087]} color="#ffc971"/></group>;
}

function BottleVacuumScene({condition,phase,cutaway,selected,onSelect,collected,collecting}:{
  condition:VacuumCondition;phase:VacuumPhase;cutaway:boolean;selected:number;onSelect:(part:number)=>void;collected:number;collecting:boolean;
}) {
  const isIntake=phase==='intake', isExhaust=phase==='exhaust';
  return <>
    <Box at={[0,-.08,.22]} size={[9,.15,5.5]} color="#627c82"/>
    <Box at={[-2.77,.055,1.73]} size={[.66,.074,.66]} color="#334d55"/>
    {[-1.04,.59].map(x=><Box key={x} at={[x,.16,0]} size={[.26,.31,1.13]} color="#375763"/>)}
    <group position={[0,1,0]}><BottleChamber cutaway={cutaway} loose={condition==='leak'}/></group>
    <AirHose points={vacuumPickupPath}/>
    <AirHose points={vacuumOutletPath}/>
    <AirHose points={vacuumExhaustPath}/>
    <group position={[1.37,.93,.18]}><PortGrommet/></group>
    <group position={[1.36,1.28,-.11]}><PortGrommet/></group>
    <group position={[.96,1.29,-.11]}><FilterMesh restricted={condition==='restricted'}/></group>
    <group position={[2.61,.84,-.32]}><BulbPump compressed={phase==='exhaust'||phase==='compressed'}/></group>
    <ContactShadows position={[0,.012,0]} opacity={.44} scale={8} blur={2.7} far={4} resolution={256}/>
    {vacuumTray.map((start,index)=>index===collected&&collecting ? <TravelingScrap key={index} index={index}/>
      : <group key={index} position={index<collected?vacuumCaptured[index]:start} rotation={[0,index*.69,0]}>
          <Box at={[0,0,0]} size={[.090,.019,.083]} color={index%3===0?'#edb154':index%3===1?'#f6ddab':'#f9a87e'}/>
        </group>)}
    {isIntake&&<FlowDots points={vacuumIntakePath} rate={condition==='sealed'?.91:condition==='restricted'?.46:.24} color="#6cfff1" count={condition==='sealed'?9:5}/>}
    {isIntake&&condition==='leak'&&<FlowDots points={vacuumLeakPath} rate={1.3} color="#ffd18a" count={5}/>}
    {isExhaust&&<FlowDots points={vacuumExhaustPath} rate={1.15} color="#7ddde9" count={4}/>}
    {Array.from(new Set([0,2,3,selected])).map(index=><group key={index}>
      <Line points={[vacuumAnchors[index],vacuumLabels[index]]} color={index===selected?'#ffe19c':'#bed9df'} lineWidth={1.4}/>
      <WorldLabel position={vacuumLabels[index]} className="gp-marker-anchor">
        <button type="button" className="gp-marker" aria-label={bottleVacuum.parts[index][0]} aria-pressed={index===selected} onClick={()=>onSelect(index)}>
          {index+1}{index===selected&&<span className="gp-demo-marker-name">{bottleVacuum.parts[index][0]}</span>}
        </button>
      </WorldLabel>
    </group>)}
  </>;
}

export function BottleVacuumDemo() {
  const [condition,setCondition]=useState<VacuumCondition>('sealed');
  const [phase,setPhase]=useState<VacuumPhase>('ready');
  const [cutaway,setCutaway]=useState(true);
  const [selected,setSelected]=useState(0);
  const [samples,setSamples]=useState({cycles:0,collected:0,credit:0});
  const trial=vacuumConditions.find(item=>item.id===condition)!;
  const moving=phase==='exhaust'||phase==='intake';
  const collecting=phase==='intake'&&samples.collected<vacuumTray.length&&samples.credit+trial.credit>=6;

  useEffect(()=>{
    if(phase!=='exhaust'&&phase!=='intake') return;
    const timer=window.setTimeout(()=>{
      if(phase==='intake') {
        setSamples(previous=>{
          const credit=previous.credit+trial.credit;
          return {cycles:previous.cycles+1,collected:Math.min(vacuumTray.length,previous.collected+Math.floor(credit/6)),credit:credit%6};
        });
      }
      setPhase(phase==='exhaust'?'compressed':'ready');
    },phase==='exhaust'?650:vacuumCycleMs);
    return ()=>window.clearTimeout(timer);
  },[phase,trial.credit]);

  const status=phase==='exhaust'?'Squeezing · air leaves through the open exhaust.'
    : phase==='compressed'?'Bulb compressed · release it to draw air through the nozzle.'
    : phase==='intake'?(condition==='leak'?'Releasing · air also enters around the loose cap.':'Releasing · air passes through the chamber and mesh.')
    : samples.cycles?'Cycle complete · collected paper stays in the bottle.':'Ready · squeeze the bulb to begin.';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive bottle vacuum cutaway">
        <Canvas dpr={[1,1.5]} camera={{position:[3.1,4.1,7.5],fov:43}} fallback={<p>WebGL is required for the cutaway. The pump state and pickup count are shown below.</p>}>
          <color attach="background" args={['#243740']}/>
          <ambientLight intensity={1.16}/>
          <directionalLight position={[-1,5,3]} intensity={2.18}/>
          <Environment resolution={128}><Lightformer position={[1,4,2]} rotation={[Math.PI/2,0,0]} scale={7} intensity={2}/></Environment>
          <BottleVacuumScene condition={condition} phase={phase} cutaway={cutaway} selected={selected}
            onSelect={setSelected} collected={samples.collected} collecting={collecting}/>
          <OrbitControls target={[.34,.64,.25]} enablePan={false} minDistance={4} maxDistance={13} maxPolarAngle={1.52}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Simulated pickup results">
        <div><span>Nozzle airflow</span><strong>{phase==='intake'?trial.flow:'Idle'}</strong></div>
        <div><span>Full cycles</span><strong>{samples.cycles}</strong></div>
        <div><span>Scraps collected</span><strong>{samples.collected} / {vacuumTray.length}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Follow a pump cycle</h3>
      <p>Squeeze to exhaust air, then release to draw air and paper through the pickup tube. The dots show the airflow. Pickup counts are simulated for comparing conditions.</p>
      <div className="gp-steps" role="group" aria-label="Filter and cap condition">
        {vacuumConditions.map(item=><button type="button" key={item.id} disabled={moving} aria-pressed={condition===item.id}
          onClick={()=>setCondition(item.id)}>{item.label}</button>)}
      </div>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={moving} onClick={()=>setPhase(phase==='compressed'?'intake':'exhaust')}>
          {phase==='compressed'||phase==='intake'?'Release bulb':'Squeeze bulb'}
        </button>
        <button type="button" onClick={()=>{setPhase('ready');setSamples({cycles:0,collected:0,credit:0});}}>Empty chamber</button>
      </div>
      <p className="gp-check" role="status">{status}</p>
      <h4>Inspect the airflow path</h4>
      <button type="button" className="gp-button gp-secondary" aria-pressed={cutaway} onClick={()=>setCutaway(value=>!value)}>
        {cutaway?'Show whole bottle':'Show cutaway'}
      </button>
      <ol className="gp-demo-labels">{bottleVacuum.parts.map(([name],index)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{bottleVacuum.parts[selected][2]}</p>
    </div>
  </div>;
}

const partAssets: Record<string, [string, string[]?][]> = {
  'Arduino Uno R3': [['boards-01']],
  'HC-SR04 ultrasonic module': [['sensors-08']],
  'Breadboard and jumper wires': [['components-25'],['components-24']],
  'LED and 330 Ω resistor': [['components-20'],['components-01']],
  '330 Ω resistors': [['components-01']],
  '10 kΩ resistor': [['components-01']],
  'Positional micro servo': [['anatomy-31',['case','horn','shaft','cable','mounting']]],
  'Hinged finger and palm frame': [['anatomy-13',['palm','fingers','joints','thumb','knuckle-caps']]],
  'Nylon cord and elastic return': [['anatomy-14',['cords']]],
  '5 V-compatible analog capacitive probe': [['sensors-27',['probe','probe-pcb','circuit','cable']]],
  'Photoresistor': [['sensors-21']],
  'Red, amber and green LEDs': [['components-20']],
  'Momentary tactile button': [['components-06']],
  'Matching shafts and bearings': [['robots-45',['races','balls','shafts','collars']]],
};

function selectHardware(scene: Group, names?: string[]) {
  if (!names) return scene.clone(true);
  const group = scene.clone(false);
  for (const name of names) {
    const part = scene.getObjectByName(name);
    if (!part) continue;
    const copy = part.clone(true);
    part.updateWorldMatrix(true, false);
    part.matrixWorld.decompose(copy.position,copy.quaternion,copy.scale);
    group.add(copy);
  }
  return group.children.length ? group : scene.clone(true);
}

function AtlasPart({asset}: {asset:[string,string[]?]}) {
  const [id, names] = asset;
  const {scene} = useGLTF(`./models/hardware/${id}.glb`);
  const object = useMemo(() => selectHardware(scene,names),[scene,names]);
  return <primitive object={object}/>;
}

function PartGeometry({name}: {name:string}) {
  const assets = partAssets[name];
  if (assets) return <>{assets.map((asset,index)=>
    <group key={asset[0]} position={[assets.length===1?0:index*1.8-.9,0,0]}><Center><AtlasPart asset={asset}/></Center></group>
  )}</>;
  if (name==='12-tooth spur gear' || name==='36-tooth spur gear') {
    const driver=name==='12-tooth spur gear';
    return <GearWheel teeth={driver?12:36} pitch={driver?.42:1.26} metal={driver} highlight={false}/>;
  }
  if (name.endsWith('spur gear')) {
    const teeth = Number.parseInt(name,10);
    return <Gear at={[0,0,0]} teeth={teeth} radius={teeth*.025} color="#91a2b2" speed={0}/>;
  }
  switch (name) {
    case 'Adafruit short flex sensors and 10 kΩ resistors':
      return <><group position={[-.26,0,0]}><FlexStrip/></group><group position={[.36,0,0]}><AxialResistor bands={['#6a311d','#1d2024','#b65923','#b7953f']}/></group></>;
    case 'Hinged finger and palm frame':
      return <>
        <Box at={[-.69,0,0]} size={[.82,.16,.62]} color="#ba9b71"/>
        <Box at={[.047,0,.05]} size={[.63,.15,.36]} color="#cfad80"/>
        <Box at={[.60,0,.05]} size={[.49,.14,.34]} color="#c4a477"/>
        {[-.27,.35].map(x=><mesh key={x} position={[x,.03,.05]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.045,.045,.46,18]}/><meshStandardMaterial color="#8b9ca1" metalness={.58}/></mesh>)}
      </>;
    case 'Nylon cord and elastic return':
      return <>
        <mesh position={[-.47,0,0]}><cylinderGeometry args={[.36,.36,.21,36]}/><meshStandardMaterial color="#bd9d72" roughness={.45}/></mesh>
        <mesh rotation={[Math.PI/2,0,0]} position={[.49,.04,0]}><torusGeometry args={[.28,.034,14,40]}/><meshStandardMaterial color="#498eac" roughness={.62}/></mesh>
      </>;
    case 'Cardboard fingers and palm backing':
      return <CardPalm/>;
    case 'Pololu QTR-MD-03A analog reflectance array':
      return <group scale={1.8}><ReflectanceArray/></group>;
    case 'Matte track card and black tape':
      return <><Box at={[0,0,0]} size={[1.95,.05,1.37]} color="#d6d9d1"/>
        <Box at={[-.43,.03,0]} size={[.86,.017,.17]} color="#2a2d30"/>
        <group position={[.33,.03,-.14]} rotation={[0,.43,0]}><Box at={[0,0,0]} size={[.86,.017,.17]} color="#2a2d30"/></group></>;
    case 'Adafruit APDS9960 color breakout':
      return <group scale={1.8}><ColorBreakout/></group>;
    case 'Corrugated sorting chute and clean samples':
      return <>
        <Box at={[0,-.49,0]} size={[1.86,.10,.91]} color="#927359"/>
        <Box at={[0,.07,-.42]} size={[1.82,1.16,.08]} color="#ba9b75"/>
        {[-.59,0,.59].map((x,i)=><group key={x} position={[x,-.21,0]}>
          <Box at={[0,0,0]} size={[.51,.25,.68]} color={['#579bc3','#61a786','#d0a267'][i]}/>
          <group position={[0,.34,-.16]} rotation={[.38,0,.30*(i-1)]}><Box at={[0,0,0]} size={[.44,.075,.63]} color="#ae9170"/></group>
        </group>)}
      </>;
    case 'Cardboard vending cabinet and dummy cans':
      return <>
        <Box at={[0,-.58,0]} size={[1.72,.10,.87]} color="#977a5d"/>
        <Box at={[0,.12,-.39]} size={[1.67,1.39,.07]} color="#ad8d71"/>
        {[-.80,-.40,0,.40,.80].map(x=><Box key={x} at={[x,.18,-.05]} size={[.045,1.12,.70]} color="#bc9b75"/>)}
        {[-.60,-.20,.20,.60].map((x,i)=><Disk key={x} at={[x,-.05,.12]} radius={.115} depth={.19} color={['#b4474b','#965684','#dcaa56','#465c7a'][i]}/>)}
      </>;
    case 'Cardboard lamp shade and swipe gate':
      return <>
        <Box at={[0,-.35,0]} size={[1.80,.10,1.19]} color="#bc9972"/>
        <Box at={[-.63,.05,-.30]} size={[.10,.75,.10]} color="#8d6a52"/>
        <Box at={[-.45,.45,-.24]} size={[.64,.15,.45]} color="#b28e71"/>
        {[-.10,.34].map(x=>[-.31,.31].map(z=><Box key={x+':'+z} at={[x,-.19,z]} size={[.17,.265,.15]} color="#9f7b60"/>))}
      </>;
    case 'Cardboard model car and sensor hood':
      return <>
        <Box at={[0,0,0]} size={[1.64,.25,.78]} color="#bc9b76"/>
        <Box at={[-.22,.23,0]} size={[.75,.23,.68]} color="#665a52"/>
        <Box at={[-.19,.38,0]} size={[.58,.087,.62]} color="#c4a17b"/>
        <Box at={[.52,.18,0]} size={[.27,.15,.20]} color="#353638"/>
        {[-.26,.26].map(z=><Box key={z} at={[.82,.043,z]} size={[.036,.105,.133]} color="#c9caba"/>)}
      </>;
    case 'Two-axis joystick breakout':
      return <ControllerStick/>;
    case 'Cardboard controller faceplate':
      return <>
        <Box at={[0,0,0]} size={[1.82,.075,1.02]} color="#b18b62"/>
        <Box at={[-.39,.04,0]} size={[.62,.022,.20]} color="#4b4b50"/>
        <Box at={[-.39,.04,0]} size={[.20,.022,.62]} color="#4b4b50"/>
        {[.28,.57].map((x,i)=><Disk key={x} at={[x,.05,i?.11:-.11]} radius={.126} depth={.04} color={i?'#634f83':'#437e76'}/>)}
      </>;
    case 'Cardboard room shell and vent guard':
      return <>
        <Box at={[0,-.37,0]} size={[1.54,.08,1.34]} color="#be9b77"/>
        <Box at={[0,.21,-.63]} size={[1.54,1.12,.08]} color="#b89775"/>
        <Box at={[-.73,.21,.02]} size={[.08,1.12,1.34]} color="#bd9f7e"/>
        <Box at={[.40,.36,-.56]} size={[.52,.50,.09]} color="#4a555e"/>
        {[-.19,-.10,0,.10,.19].map(x=><Box key={x} at={[.4+x,.36,-.496]} size={[.026,.45,.016]} color="#acb0b1"/>)}
      </>;
    case 'Cardboard lift arm and gripper':
      return <>
        <Box at={[-.53,0,0]} size={[.25,.67,.42]} color="#826448"/>
        <Box at={[-.03,.24,0]} size={[.90,.13,.34]} color="#bb9871"/>
        {[-.24,.24].map(z=><Box key={z} at={[.49,.21,z]} size={[.51,.14,.14]} color="#d2ac76"/>)}
        <Wire path={[[-.49,.33,-.13],[-.05,.33,-.10],[.49,.30,-.18]]} color="#e4c07c"/>
      </>;
    case 'Corrugated curb and parking blocks':
      return <>
        <group position={[-.72,-.20,-.17]}><ParkingBlock color="#5a738e"/></group>
        <group position={[.72,-.20,-.17]}><ParkingBlock/></group>
        <Box at={[0,-.20,.46]} size={[2.61,.065,.14]} color="#bba777"/>
      </>;
    case 'Mini pan-tilt kit with two servos':
      return <TrackerBracket/>;
    case 'Voltaic P123 mini solar panel':
      return <TrackerPanel/>;
    case 'Four CdS sensors and 10 kΩ resistors':
      return <><group position={[-.42,0,0]}><LightQuadrants/></group><group position={[.49,.02,0]}><AxialResistor bands={['#6a311d','#1d2024','#b65923','#b7953f']}/></group></>;
    case 'Cardboard turntable carrier and light hood':
      return <><Box at={[0,-.22,0]} size={[1.25,.09,1.10]} color="#bd9060"/>
        <Box at={[0,-.08,-.21]} size={[.93,.24,.43]} color="#b88e64"/>
        <group position={[.46,.07,.18]} scale={1.25}><LightHood/></group></>;
    case 'Cardboard sensor shade and backing':
      return <>
        <Box at={[0,-.08,0]} size={[1.18,.075,.94]} color="#bd9060"/>
        <Box at={[0,.13,0]} size={[.064,.38,.85]} color="#b48358"/>
        <Box at={[0,.13,0]} size={[1.08,.38,.064]} color="#b48358"/>
      </>;
    case 'Classic Arduino Nano (5 V ATmega328P)':
      return <NanoBoard/>;
    case 'Adafruit 128×64 SSD1306 OLED':
      return <ScopeOled/>;
    case '1 kΩ input series resistor':
      return <AxialResistor/>;
    case 'Insulated cardboard wrist mount':
      return <>
        <Box at={[0,0,0]} size={[.9,.13,2.65]} color="#333d44"/>
        <Box at={[0,.11,0]} size={[1.67,.16,1.58]} color="#bf9e78"/>
        <Box at={[0,.206,0]} size={[1.61,.032,1.51]} color="#675951"/>
        <Box at={[0,.08,-1.18]} size={[.97,.17,.20]} color="#6e7881"/>
      </>;
    case 'Adafruit 751 optical fingerprint sensor':
      return <group scale={1.75}><FingerprintReader/></group>;
    case 'Cardboard locker and keeper':
      return <>
        {[-.68,.68].map(y=><Box key={y} at={[0,y,0]} size={[1.66,.09,1.14]} color="#b78a62"/>)}
        {[-.8,.8].map(x=><Box key={x} at={[x,0,0]} size={[.08,1.36,1.14]} color="#bc9368"/>)}
        <Box at={[0,0,-.53]} size={[1.66,1.36,.07]} color="#865e48"/>
        <Box at={[.65,0,.49]} size={[.22,.23,.14]} color="#865e48"/>
        <group position={[-.80,0,.55]} rotation={[0,-1.15,0]}><Box at={[.8,0,0]} size={[1.60,1.30,.07]} color="#c29367"/></group>
      </>;
    case 'Cardboard rail bed, train and signal mast':
      return <>
        <Box at={[0,-.32,0]} size={[2.34,.12,.91]} color="#bb9161"/>
        {[-.21,.21].map(z=><Box key={z} at={[0,-.204,z]} size={[2.26,.04,.045]} color="#7d8286"/>)}
        {Array.from({length:10},(_,index)=><Box key={index} at={[.23*index-1.03,-.246,0]} size={[.085,.046,.62]} color="#80644e"/>)}
        <Box at={[-.36,-.054,0]} size={[.87,.17,.38]} color="#9d7153"/>
        <Box at={[-.60,.086,0]} size={[.40,.23,.38]} color="#46737b"/>
        <Box at={[.65,.15,.34]} size={[.067,.82,.064]} color="#8b7359"/>
        <Box at={[.65,.50,.34]} size={[.17,.28,.102]} color="#414950"/>
      </>;
    case 'Cardboard interlock enclosure':
      return <>
        <Box at={[0,-.45,0]} size={[1.7,.09,1.36]} color="#bd9060"/>
        <Box at={[0,-.10,-.64]} size={[1.7,.66,.08]} color="#b88b5d"/>
        {[-.81,.81].map(x=><Box key={x} at={[x,-.1,0]} size={[.08,.66,1.36]} color="#bd9060"/>)}
        <group position={[0,.25,-.65]} rotation={[-1.15,0,0]}><Box at={[0,0,.68]} size={[1.7,.09,1.36]} color="#c39767"/></group>
      </>;
    case '6 V 1 W raw solar panel':
      return <SolarMeterPanel/>;
    case 'Arduino Mega 2560 Rev3':
      return <MegaBoard/>;
    case 'Adafruit FONA 800 GSM breakout and antenna':
      return <><group position={[-.26,0,0]}><FonaModule/></group><Box at={[.48,0,.02]} size={[.35,.05,.93]} color="#353b44"/></>;
    case 'Protected 3.7 V LiPo for FONA':
      return <FonaBattery/>;
    case 'Adafruit INA219 current monitor':
      return <SolarMeterSensor/>;
    case 'Model signal LEDs (red, green and amber)':
      return <>{['#b92627','#d28b16','#22814d'].map((color,index)=>
        <group key={color} position={[(index-1)*.39,0,0]}>
          <Disk at={[0,.018,0]} radius={.105} depth={.044} color={color}/>
          <Disk at={[0,.097,0]} radius={.084} depth={.15} color={color}/>
          <mesh position={[0,.17,0]}><sphereGeometry args={[.084,20,14]}/><meshStandardMaterial color={color} roughness={.26}/></mesh>
          <Box at={[-.044,-.14,0]} size={[.021,.28,.021]} color="#c8c9c7" metal={.55}/>
          <Box at={[.044,-.116,0]} size={[.021,.232,.021]} color="#c8c9c7" metal={.55}/>
        </group>)}</>;
    case '220 Ω axial resistors':
      return <AxialResistor bands={ledResistorBands}/>;
    case 'Corrugated body links and felt skids':
      return <group scale={1.6}><CardLink/></group>;
    case 'SparkFun SEN-10293 piezo element':
      return <><PiezoDisc/><Wire path={[[.09,.04,.05],[.26,.15,.15],[.43,.11,.39]]} color="#b75347"/>
        <Wire path={[[-.24,.04,0],[-.01,.12,.20],[.37,.11,.44]]} color="#2d353a"/></>;
    case '1N4001 rectifier diodes':
      return <RectifierBridge/>;
    case '22 µF 16 V storage capacitor and 4.7 V Zener':
      return <><group position={[-.18,0,0]}><HarvestCapacitor/></group><group position={[.25,-.04,0]}>
        <Box at={[0,0,0]} size={[.205,.052,.055]} color="#bc6748"/>
        <Box at={[.066,.031,0]} size={[.028,.011,.058]} color="#34373b"/>
        <Box at={[0,0,0]} size={[.35,.013,.013]} color="#b3b9bd" metal={.63}/>
      </group></>;
    case 'Voltage-divider resistors and filter capacitor':
      return <>{[-.22,.14].map(z=><group key={z} position={[-.10,0,z]}><AxialResistor bands={['#e5bf2c','#684b9f','#dfb239','#b7953f']}/></group>)}
        <Disk at={[.26,.061,0]} radius={.084} depth={.028} color="#c08a52"/>
        <Box at={[.226,-.03,0]} size={[.016,.14,.017]} color="#c0c4c8" metal={.68}/>
        <Box at={[.294,-.03,0]} size={[.016,.14,.017]} color="#c0c4c8" metal={.68}/>
      </>;
    case 'Logic-level N-channel MOSFET and 100 kΩ resistor':
      return <><group position={[-.29,0,0]}><AtlasPart asset={['components-11']}/></group>
        <group position={[.31,0,0]}><AxialResistor bands={['#75412c','#21242a','#e0b72d','#b7953f']}/></group></>;
    case 'Red load LED and 4.7 kΩ resistor':
      return <><group position={[-.28,0,0]}><AtlasPart asset={['components-20']}/></group>
        <group position={[.29,0,0]}><AxialResistor bands={['#e5bf2c','#684b9f','#b95337','#b7953f']}/></group></>;
    case 'Card tile, foam supports and rubber bumpers':
      return <>
        <Box at={[0,-.22,0]} size={[1.18,.075,1.03]} color="#647278"/>
        {[-.42,.42].flatMap(x=>[-.37,.37].map(z=><Box key={x+':'+z} at={[x,-.076,z]} size={[.16,.25,.165]} color="#41454b"/>))}
        <Box at={[0,.09,0]} size={[1.12,.094,.98]} color="#917154"/>
        <Box at={[0,.146,0]} size={[1.09,.029,.95]} color="#ab8a64"/>
      </>;
    case 'Clear flat-sided channel and spill tray':
      return <>
        <Box at={[0,-.36,0]} size={[1.27,.094,1.74]} color="#586e81"/>
        <Box at={[0,-.285,0]} size={[.62,.052,1.31]} color="#9ac3cc"/>
        {[[-.30,0,0],[.30,0,0],[0,0,-.64],[0,0,.64]].map((at,i)=>
          <mesh key={i} position={at as Point}>
            <boxGeometry args={i<2?[.033,.55,1.32]:[.61,.55,.033]}/>
            <meshStandardMaterial color="#85bacc" transparent opacity={.39} depthWrite={false} roughness={.2}/>
          </mesh>)}
        {[-.30,.30].flatMap(x=>[-.64,.64].map(z=><Box key={x+':'+z} at={[x,0,z]} size={[.026,.55,.026]} color="#adcad1"/>))}
      </>;
    case 'Clear refill tanks and spill tray':
      return <group scale={.85}><SpillwayBasin/></group>;
    case 'AI Thinker ESP32-CAM with OV2640':
      return <CameraBoard/>;
    case 'FTDI Friend USB-to-serial adapter':
      return <group scale={1.75}><SerialAdapter/></group>;
    case 'Regulated 5 V supply and adapter':
      return <><Box at={[-.36,.14,0]} size={[1.05,.61,.70]} color="#2b3039"/>
        {[-.53,-.22].map(x=><Box key={x} at={[x,.57,0]} size={[.075,.32,.065]} color="#a9afb8"/>)}
        <Wire path={[[.14,.20,0],[.40,.04,.14],[.53,.06,.27],[.78,.08,.25]]} color="#2e343c"/>
        <Box at={[.92,.09,.25]} size={[.27,.16,.22]} color="#22272d"/><Box at={[1.10,.09,.25]} size={[.12,.085,.10]} color="#a1adb4"/></>;
    case 'DFRobot SEN0192 radar and lead':
      return <group scale={1.65}><MicrowaveBoard/></group>;
    case 'Raspberry Pi 5':
      return <PiBoard selected={-1} installedCooler={false}/>;
    case 'Pi 5 active cooler':
      return <PiCooler/>;
    case 'Adafruit SHT31-D breakout':
      return <group scale={2.3}><PiSensor/></group>;
    case '27 W USB-C power supply':
      return <><Box at={[0,0,0]} size={[.84,.67,.96]} color="#d8dce4"/>
        {[-.18,.18].map(x=><Box key={x} at={[x,.36,.21]} size={[.079,.34,.05]} color="#9eaaa9"/>)}
        <Wire path={[[0,-.04,-.42],[0,-.044,-.80],[.5,-.04,-.87],[.86,-.04,-.53],[.82,-.04,-.09]]} color="#e1e4e9"/>
        <Box at={[.82,-.04,.03]} size={[.24,.11,.32]} color="#d8dce4"/>
        <Box at={[.82,-.04,.231]} size={[.19,.074,.143]} color="#aab6bd"/></>;
    case 'microSD card':
      return <><Box at={[0,0,0]} size={[.84,.08,1.07]} color="#42464f"/>
        <Box at={[0,.043,.07]} size={[.78,.015,.68]} color="#a2373a"/>
        {Array.from({length:8},(_,i)=><Box key={i} at={[i*.083-.29,-.045,-.29]} size={[.045,.01,.25]} color="#bd9c59"/>)}</>;
    case 'Adhesive PCB supports':
      return <group scale={2.2}><EnclosureSupport/></group>;
    case 'USB Micro-B data cable':
    case 'USB Mini-B data cable':
      return <>
        <Box at={[-.71,0,-.25]} size={[.39,.20,.29]} color="#29323b"/><Box at={[-.97,0,-.25]} size={[.18,name==='USB Micro-B data cable'?.066:.105,.21]} color="#b4c1cc" metal={.55}/>
        <Wire path={[[-.50,0,-.25],[.31,0,-.26],[.69,0,.07],[.26,0,.51],[-.38,0,.52]]} color="#29323b"/>
        <Box at={[-.56,0,.52]} size={[.40,.19,.32]} color="#29323b"/><Box at={[-.85,0,.52]} size={[.25,.11,.25]} color="#afbcca" metal={.55}/>
      </>;
    case 'USB-A to USB-B data cable':
      return <><EnclosurePlug/><Wire path={[[-.88,0,0],[-1.15,0,.12],[-1.08,0,.62],[-.62,0,.91],[-.22,0,.95]]} color="#29323b"/>
        <Box at={[.06,0,.95]} size={[.58,.31,.47]} color="#29323b"/><Box at={[.48,0,.95]} size={[.32,.17,.36]} color="#afbcca"/></>;
    case 'PLA filament':
      return <><Disk at={[0,0,0]} radius={.83} depth={.45} color="#767c82"/>
        {[-.25,.25].map(y=><Disk key={y} at={[0,y,0]} radius={1.01} depth={.09} color="#32373e"/>)}
        <Disk at={[0,.30,0]} radius={.29} depth={.013} color="#20262d"/></>;
    case 'Digital calipers':
      return <>
        <Box at={[0,0,.05]} size={[2.9,.065,.23]} color="#9cabb5"/>
        <Box at={[-1.33,0,-.26]} size={[.18,.065,.50]} color="#9cabb5"/>
        <Box at={[-.50,0,-.26]} size={[.16,.065,.50]} color="#9cabb5"/>
        <Box at={[-.23,.06,.08]} size={[.72,.17,.45]} color="#303b47"/>
        <Box at={[-.29,.151,.03]} size={[.41,.02,.22]} color="#97ae9f"/>
        {Array.from({length:12},(_,index)=><Box key={index} at={[index*.091+.32,.037,.09]} size={[.017,.009,index%2 ? .041 : .078]} color="#49525d"/>)}
      </>;
    case 'TB6612FNG breakout':
      return <BluetoothMotorDriver/>;
    case 'Signal LEDs and 220 Ω resistors':
      return <><FloodSignalLights/><group position={[0,.11,.34]}><AxialResistor bands={ledResistorBands}/></group></>;
    case 'Adafruit MPU6050 breakout':
      return <group scale={1.65}><ShakeSensorPart/></group>;
    case 'Card shake platform and model building':
      return <>
        <Box at={[0,-.23,0]} size={[1.93,.10,1.19]} color="#786d5a"/>
        {[-.46,.46].map(z=><Box key={z} at={[0,-.12,z]} size={[1.81,.08,.091]} color="#536670" metal={.35}/>)}
        <Box at={[0,-.055,0]} size={[1.41,.067,1.02]} color="#a99d85"/>
        <Box at={[-.16,.211,0]} size={[.61,.47,.55]} color="#c8ab82"/>
        {[-.16,.16].map(x=><group key={x} position={[-.16+x,.463,0]} rotation={[0,0,x>0?-.30:.30]}>
          <Box at={[0,0,0]} size={[.39,.047,.65]} color="#655a5d"/>
        </group>)}
      </>;
    case 'Passive piezo sounder':
      return <FloodPiezo/>;
    case 'Red and white LEDs with 220 Ω resistors':
      return <EmergencyLamps/>;
    case '10 kΩ linear potentiometer':
    case '10 kΩ cutoff potentiometer':
      return <TestKnob/>;
    case 'Lantern shell, diffuser and campsite base':
      return <><Box at={[0,-.47,0]} size={[1.1,.09,.9]} color="#8a7a64"/><Disk at={[0,-.32,0]} radius={.32} depth={.17} color="#566e62"/><mesh position={[0,.005,0]}><cylinderGeometry args={[.24,.26,.53,32]}/><meshStandardMaterial color="#e1dfce"/></mesh><Disk at={[0,.315,0]} radius={.30} depth={.095} color="#566e62"/><Wire path={[[-.22,.33,.015],[-.22,.48,.015],[-.11,.555,.015],[.11,.555,.015],[.22,.48,.015],[.22,.33,.015]]} color="#adb1ae"/></>;
    case 'Card school, path and window diffuser':
      return <><Box at={[0,-.34,0]} size={[1.45,.08,1.19]} color="#6f806e"/><Box at={[0,0,-.25]} size={[1.19,.63,.55]} color="#a97663"/><Box at={[0,.34,-.25]} size={[1.3,.075,.62]} color="#5e6b70"/>{[-.39,-.13,.13].map(x=><Box key={x} at={[x,.022,.042]} size={[.19,.28,.036]} color="#f2dfb9"/>)}<Box at={[.41,-.072,.043]} size={[.25,.48,.039]} color="#576a76"/><Box at={[.41,-.285,.33]} size={[.32,.027,.57]} color="#aab1a8"/></>;
    case 'Digital reference thermometer':
      return <><Box at={[0,0,0]} size={[.51,.97,.17]} color="#d8e0db"/><Box at={[0,.18,.093]} size={[.36,.33,.023]} color="#586e64"/><Box at={[0,-.09,.097]} size={[.12,.067,.025]} color="#a5aca9"/><Wire path={[[.22,-.35,.02],[.39,-.42,.02],[.51,-.31,.09],[.48,.04,.12]]} color="#475657"/></>;
    case 'Model chamber and dry test block':
      return <><Box at={[0,-.35,0]} size={[1.39,.15,.95]} color="#687782"/><Box at={[0,.43,0]} size={[1.40,.09,.95]} color="#8f9fa6"/>{[-.66,.66].map(x=><mesh key={x} position={[x,.055,0]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[.91,.71]}/><meshStandardMaterial color="#a8c9c6" transparent opacity={.25} side={2} depthWrite={false}/></mesh>)}<Box at={[0,-.14,0]} size={[.96,.066,.69]} color="#a1ada8"/><Box at={[0,-.005,.01]} size={[.36,.16,.32]} color="#b49b78"/></>;
    case 'Reusable cold pack and spill tray':
      return <><Box at={[0,-.16,0]} size={[1.49,.10,1.00]} color="#788e9d"/>{[-.71,.71].map(x=><Box key={x} at={[x,-.07,0]} size={[.061,.12,1.00]} color="#94a5ad"/>)}{[-.47,.47].map(z=><Box key={z} at={[0,-.07,z]} size={[1.45,.12,.067]} color="#94a5ad"/>)}<Box at={[0,.007,0]} size={[1.07,.21,.58]} color="#397dae"/>{Array.from({length:6},(_,i)=><Box key={i} at={[-.40+i*.16,.117,0]} size={[.033,.03,.47]} color="#6aabcf"/>)}</>;
    case 'Card vent duct and probe stands':
      return <><Box at={[0,.29,-.16]} size={[1.19,.095,.72]} color="#9caaae"/><Box at={[0,-.18,-.16]} size={[1.19,.092,.72]} color="#82959c"/>{[-.56,.56].map(x=><Box key={x} at={[x,.05,-.16]} size={[.075,.48,.72]} color="#8d9ea7"/>)}{[-.10,.01,.12,.23].map(y=><Box key={y} at={[0,y,.224]} size={[1.13,.034,.085]} color="#b9c2bf"/>)}<Box at={[.37,-.23,.51]} size={[.28,.051,.25]} color="#788b8e"/><Box at={[.37,-.095,.51]} size={[.046,.25,.051]} color="#87999c"/></>;
    case 'Card box, foil reflector and clear cover':
      return <><Box at={[0,-.27,0]} size={[1.48,.16,1.0]} color="#9f8266"/><Box at={[0,-.18,0]} size={[1.29,.034,.83]} color="#303940"/>{[-.70,.70].map(x=><Box key={x} at={[x,-.105,0]} size={[.075,.31,1.0]} color="#9f8266"/>)}<mesh position={[0,.055,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[1.3,.87]}/><meshStandardMaterial color="#b6d1d0" transparent opacity={.20} side={2} depthWrite={false}/></mesh><group rotation={[-.81,0,0]} position={[0,.052,-.49]}><Box at={[0,0,.45]} size={[1.45,.054,.89]} color="#aa8e72"/><Box at={[0,-.036,.44]} size={[1.32,.017,.80]} color="#bdc8c9" metal={.73}/></group></>;
    case 'Clear model tank and dry sensor pad':
      return <><Box at={[0,-.37,0]} size={[1.31,.104,.9]} color="#566e79"/>{[-.62,.62].map(x=><mesh key={x} position={[x,.01,0]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[.83,.72]}/><meshStandardMaterial color="#9fc6ce" transparent opacity={.22} side={2} depthWrite={false}/></mesh>)}<mesh position={[0,.01,.407]}><planeGeometry args={[1.23,.72]}/><meshStandardMaterial color="#a7cbd3" transparent opacity={.20} side={2} depthWrite={false}/></mesh><Box at={[.41,.022,.438]} size={[.26,.20,.079]} color="#8faaa7"/><Box at={[.41,.022,.489]} size={[.115,.084,.047]} color="#384750"/></>;
    case 'Clear terrarium and movable vent':
      return <><Box at={[0,-.40,0]} size={[1.35,.14,.89]} color="#586b64"/>{[-.64,.64].map(x=><mesh key={x} position={[x,.015,0]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[.83,.72]}/><meshStandardMaterial color="#a8c9c6" transparent opacity={.26} side={2} depthWrite={false}/></mesh>)}<mesh position={[0,.015,-.415]}><planeGeometry args={[1.28,.72]}/><meshStandardMaterial color="#a8c9c6" transparent opacity={.22} side={2} depthWrite={false}/></mesh><group position={[0,.38,-.41]} rotation={[-.53,0,0]}><Box at={[0,0,.411]} size={[1.28,.05,.82]} color="#718a7c"/>{Array.from({length:5},(_,i)=><Box key={i} at={[-.46+i*.22,.03,.41]} size={[.068,.008,.70]} color="#abb69f"/>)}</group></>;
    case 'Card tunnel, movable screen and sensor hood':
      return <><Box at={[0,-.29,0]} size={[1.31,.09,1.34]} color="#586872"/><mesh position={[0,-.08,-.30]} rotation={[-Math.PI/2,0,0]}><cylinderGeometry args={[.52,.52,.66,32,1,true,-Math.PI/2,Math.PI]}/><meshStandardMaterial color="#9d9b88" roughness={.83} side={2}/></mesh>{[-.51,.51].map(x=><Box key={x} at={[x,-.184,-.27]} size={[.062,.15,.71]} color="#9d9b88"/>)}<Box at={[.21,.16,.29]} size={[.61,.04,.48]} color="#58707a"/><Box at={[-.47,-.12,.31]} size={[.25,.07,.23]} color="#ad9e86"/></>;
    case 'Model sill and shade hood':
      return <><Box at={[.2,-.237,.05]} size={[1.13,.072,.51]} color="#c5ab8f"/><Box at={[.2,.16,-.17]} size={[1.07,.72,.046]} color="#94aab1"/><Box at={[.2,.16,-.14]} size={[.054,.71,.03]} color="#d6cbb4"/><Box at={[.2,.18,-.14]} size={[1.06,.046,.03]} color="#d6cbb4"/><Box at={[-.66,-.14,.12]} size={[.39,.044,.42]} color="#7b8e90"/><Box at={[-.66,-.24,-.078]} size={[.39,.23,.055]} color="#70878c"/></>;
    case 'Card window frame and shadow paddle':
      return <><Box at={[-.26,-.45,.033]} size={[1.12,.08,.59]} color="#cab192"/>{[-.78,.26].map(x=><Box key={x} at={[x,0,-.18]} size={[.067,.91,.052]} color="#b7a18b"/>)}{[-.41,0,.43].map(y=><Box key={y} at={[-.26,y,-.18]} size={[1.09,.059,.055]} color="#b7a18b"/>)}<Box at={[-.26,0,-.18]} size={[.048,.86,.053]} color="#b7a18b"/><Box at={[.65,-.25,.22]} size={[.48,.037,.42]} color="#414e58"/><Box at={[.62,-.18,.29]} size={[.07,.13,.075]} color="#a79274"/></>;
    case 'Card stair model and mounting strips':
      return <><Box at={[0,-.31,0]} size={[1.31,.074,1.02]} color="#667681"/>{[0,1,2].map(i=><group key={i}><Box at={[0,-.22+i*.077,.29-i*.30]} size={[1.13,.13+i*.153,.32]} color="#a78a72"/><Box at={[0,-.151+i*.154,.29-i*.30]} size={[1.16,.045,.353]} color="#cbb19a"/><Box at={[0,-.159+i*.154,.462-i*.30]} size={[.96,.024,.015]} color="#536473"/></group>)}</>;
    case 'Clear case and exhibit plinth':
      return <><Box at={[0,-.39,0]} size={[1.4,.135,.89]} color="#444e5a"/><Box at={[0,-.235,0]} size={[.74,.16,.53]} color="#a58d75"/>{[-.63,.63].map(x=><mesh key={x} position={[x,.079,0]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[.81,.823]}/><meshStandardMaterial color="#afd0d2" transparent opacity={.27} side={2} depthWrite={false}/></mesh>)}<mesh position={[0,.079,-.405]}><planeGeometry args={[1.26,.823]}/><meshStandardMaterial color="#afd0d2" transparent opacity={.23} side={2} depthWrite={false}/></mesh><Box at={[0,.508,0]} size={[1.28,.035,.83]} color="#77868b"/></>;
    case 'Seed tray and divided test base':
      return <><Box at={[0,-.19,0]} size={[1.52,.16,.79]} color="#485554"/><Box at={[0,-.06,0]} size={[.061,.12,.70]} color="#9bad9e"/>{[-.23,.01,.25].flatMap(z=>[-.53,-.24,.24,.53].map(x=><Box key={x+':'+z} at={[x,-.091,z]} size={[.23,.035,.20]} color="#745640"/>))}</>;
    case 'Red and green LEDs':
      return <><Lamp at={[-.18,0,0]} color="#ec573f" lit={false}/><Lamp at={[.18,0,0]} color="#5dce70" lit={false}/></>;
    case 'Pair of 330 Ω resistors':
      return <>{[-.16,.16].map(z=><group key={z} position={[0,0,z]}><AxialResistor bands={['#bf6633','#bf6633','#684738','#b7953f']}/></group>)}</>;
    case 'Seedling tray and sliding shade card':
      return <><Box at={[0,-.19,0]} size={[1.34,.16,.75]} color="#485554"/>{[-.23,.01,.25].flatMap(z=>[-.44,-.15,.15,.44].map(x=><Box key={x+':'+z} at={[x,-.094,z]} size={[.25,.035,.20]} color="#6f5039"/>))}{[-.56,.56].map(x=><Box key={x} at={[x,.08,-.29]} size={[.049,.39,.047]} color="#889b8d"/>)}<Box at={[0,.29,-.30]} size={[1.28,.045,.58]} color="#557568"/></>;
    case 'Book and shade card':
      return <><Box at={[-.30,-.12,.03]} size={[1.39,.065,.88]} color="#546b7a"/>{[-1,1].map(sign=><group key={sign} position={[-.3+sign*.343,-.045,.03]} rotation={[0,0,sign*.072]}><Box at={[0,0,0]} size={[.663,.107,.86]} color="#eddfc3"/>{Array.from({length:7},(_,i)=><Box key={i} at={[0,.056,-.29+i*.086]} size={[.49,.004,.009]} color="#7e8077"/>)}</group>)}<Box at={[.72,-.09,.14]} size={[.44,.023,.66]} color="#946956"/></>;
    case '10 kΩ rotary test potentiometers':
      return <><group position={[-.24,0,0]}><TestKnob/></group><group position={[.24,0,0]}><TestKnob/></group></>;
    case 'Green and red LEDs with 220 Ω resistors':
      return <IndustrialIndicators state="Running"/>;
    case 'Virtual CubeSat bus':
      return <CubeBus/>;
    case 'Virtual weather camera':
      return <CubeCamera/>;
    case 'Virtual ground station':
      return <GroundStation/>;
    case 'Virtual tunnel stations':
      return <><group position={[-.37,0,0]}><MineStation/></group><group position={[.37,0,0]}><MineStation warning/></group></>;
    case 'Virtual local alarm':
      return <MineBeacon state="Alarm"/>;
    case 'Virtual telemetry dashboard':
      return <MineDashboardModel/>;
    case 'Lidded waste bin':
      return <WasteBinGeometry/>;
    case 'Roller-lever microswitch':
      return <RollerSwitch/>;
    case 'Arduino Ethernet Shield 2':
      return <EthernetShieldGeometry/>;
    case 'Model river tray, ramp and mesh basket':
      return <AquacleanChannel/>;
    case 'Clear basin and hinged model gate':
      return <><SpillwayBasin/><GateAssembly/></>;
    case 'Clear basin and dry sensor stand':
      return <FloodBasin/>;
    case 'Virtual bottle rocket':
      return <VirtualBottleRocket/>;
    case 'Virtual launch stand':
      return <VirtualLaunchStand/>;
    case 'Marked landing field':
      return <VirtualLandingField mini/>;
    case 'Clear bottle drainage column and mesh':
      return <group position={[0,-.81,0]}><DrainageColumn/></group>;
    case 'Reused clear PET bottle and cap':
      return <BottleChamber/>;
    case 'Clear vinyl tubing':
      return <AirHose points={[[-.78,0,-.38],[-.18,.11,-.57],[.62,.05,-.14],[.26,0,.52],[-.51,.04,.39]]}/>;
    case 'One-way squeeze bulb pump':
      return <BulbPump/>;
    case 'Coarse filter mesh':
      return <FilterMesh/>;
    case 'Rubber port grommets':
      return <><group position={[0,.18,0]}><PortGrommet/></group><group position={[0,-.18,0]}><PortGrommet/></group></>;
    case 'Crazyflie 2.1+ kit':
      return <CrazyflieFrame/>;
    case 'Bitcraze Multi-ranger deck':
      return <RangerDeck/>;
    case 'Bitcraze Flow deck V2':
      return <FlowDeck/>;
    case 'Crazyradio 2.0 USB dongle':
      return <CrazyradioModel/>;
    case 'Regulated 5 V USB solar panel':
      return <SolarPanel/>;
    case 'USB Micro-B breakout':
      return <SolarUsbBreakout/>;
    case 'TT sweep motor, wheel hub and felt pads':
      return <FeltSweeperHead/>;
    case 'Momentary tactile piano switches':
      return <SolarStartButton/>;
    case '220 Ω piezo series resistor':
      return <AxialResistor bands={ledResistorBands}/>;
    case 'Card signal paddle, handle and diffuser':
      return <group position={[0,-.82,0]}><SignalPaddle/></group>;
    case 'Card drawer, guides and end stop':
      return <group scale={.84} position={[0,-.33,-.32]}><DrawerCabinet/><group position={[0,.38,.69]}><SlidingDrawer/></group></group>;
    case 'Card mailbox and hinged flap':
      return <group position={[0,-.49,-.13]}><MailboxModel open/></group>;
    case 'Card paddle, hinge and travel stops':
      return <group position={[0,-.26,0]}><DeskPaddle/></group>;
    case 'Card lift shaft and sliding car':
      return <group scale={.75} position={[0,-.74,0]}><LiftShaft/><group position={[0,.65,0]}><LiftCar/></group></group>;
    case 'Model doorway and chime housing':
      return <group scale={.87} position={[0,-.74,0]}><DoorbellPanel/></group>;
    case 'Quiz desk and team panels':
      return <group scale={.74} position={[0,-.24,0]}><QuizDesk/></group>;
    case 'Library counter and help panel':
      return <group scale={.83} position={[0,-.42,0]}><LibraryCounter/></group>;
    case 'Momentary tactile stop button':
    case 'Momentary tactile button':
    case 'Momentary tactile start button':
      return <SolarStartButton/>;
    case 'Pair of CdS photoresistors':
      return <><PhotoCell at={[-.16,0,0]}/><PhotoCell at={[.16,0,0]}/></>;
    case 'Red, amber and green LEDs':
      return <>{['#e73931','#ffbb42','#4cd868'].map((color,index)=><Lamp key={color} at={[(index-1)*.3,0,0]} color={color} lit={false}/>)}</>;
    case 'Card wardrobe and hinge':
      return <><Box at={[.15,0,-.35]} size={[1,1.25,.09]} color="#ad8466"/>{[-.35,.65].map(x=><Box key={x} at={[x,0,0]} size={[.08,1.25,.74]} color="#ad8466"/>)}{[-.61,0,.61].map(y=><Box key={y} at={[.15,y,0]} size={[1,.075,.74]} color="#ba9675"/>)}<group position={[-.35,0,.37]} rotation={[0,-1.75,0]}><Box at={[.5,0,0]} size={[1,1.23,.08]} color="#aa7d60"/>{[-.41,.41].map(y=><Box key={y} at={[.02,y,.046]} size={[.047,.14,.02]} color="#7f8588"/>)}</group></>;
    case 'Card base and streetlight pole':
      return <><Box at={[0,-.34,0]} size={[1.55,.12,.76]} color="#565e65"/><Box at={[0,-.24,-.22]} size={[1.55,.095,.33]} color="#a39f8d"/><Disk at={[.14,.20,-.13]} radius={.046} depth={.82} color="#aaa290"/><Box at={[.14,.59,.05]} size={[.10,.06,.36]} color="#b7aa91"/><Box at={[.14,.58,.25]} size={[.18,.10,.19]} color="#484d53"/></>;
    case 'Adafruit AS5600 angle sensor':
      return <group scale={1.65}><AS5600Breakout/></group>;
    case 'Diametrically polarized magnet':
      return <mesh><cylinderGeometry args={[.41,.41,.22,44]}/><meshStandardMaterial color="#bcc4c6" metalness={.67} roughness={.3}/></mesh>;
    case 'Card dial face and pointer':
      return <group scale={.84}><DialFace labelled={false}/><DialPointer value={62}/></group>;
    case 'Card bridge deck, hinge supports and canal':
      return <group scale={.72} position={[-.55,-.31,0]}>
        <group position={[0,.5,0]}><DrawbridgeDeck angle={.65}/></group>
        <group position={[1.34,0,0]}><DrawbridgeLanding/></group>
        <group position={[-.02,0,0]} rotation={[0,Math.PI,0]}><DrawbridgeLanding/></group>
      </group>;
    case 'Card letter chute, tilting deck and bins':
      return <group scale={.72} position={[0,-.43,0]}>
        <group position={[0,.91,-.62]}><LetterFeedRamp/></group>
        <group position={[0,.60,.06]}><LetterTiltDeck tilt={.25}/></group>
        <group position={[-.68,0,.06]}><LetterCatchBin color="#527f86"/></group>
        <group position={[.68,0,.06]}><LetterCatchBin color="#b97651"/></group>
      </group>;
    case 'Card camera shell and pan targets':
      return <group position={[0,-.26,0]}><CardPanCamera/>{[-.68,0,.68].map((x,i)=><group key={x} position={[x,0,.66]}><PanTarget color={['#6babb8','#caa66c','#c18067'][i]}/></group>)}</group>;
    case 'Card vane, pivot and compass base':
      return <group position={[0,-.37,0]}><WindVanePivot/><group position={[0,.84,0]}><VanePointer/></group></group>;
    case 'Card parking lane, striped arm and toy car':
      return <group scale={.65} position={[0,-.27,0]}><ParkingLane/><group position={[-.85,.11,0]}><ParkingToyCar/></group><group position={[.42,.61,-.56]} rotation={[0,-Math.PI/2,0]}><StripedArm/></group></group>;
    case 'Model crossing road and signal masts':
      return <group scale={.66} position={[0,-.32,0]}><CrossingRoad/><group position={[-.86,.18,-.64]}><CrossingMast/></group><group position={[.70,.18,.64]}><CrossingMast pedestrian/></group></group>;
    case 'Cardstock for signal head and road':
      return <><mesh position={[-.25,0,0]}><boxGeometry args={[.45,.022,.7]}/><meshStandardMaterial color="#aa8c68"/></mesh><mesh position={[.3,-.025,0]}><boxGeometry args={[.47,.022,.81]}/><meshStandardMaterial color="#5e656f"/></mesh></>;
    case 'Diffused green LED':
      return <Lamp at={[0,0,0]} color="#48bc68" lit={false}/>;
    case '330 Ω series resistor':
      return <AxialResistor bands={['#bf6633','#bf6633','#684738','#b7953f']}/>;
    case '330 Ω resistors':
      return <>{[-.26,0,.26].map(z=><group key={z} position={[0,0,z]}><AxialResistor bands={['#bf6633','#bf6633','#684738','#b7953f']}/></group>)}</>;
    case 'Photoresistor':
      return <PhotoCell at={[0,0,0]}/>;
    case '10 kΩ divider resistor':
      return <AxialResistor bands={dividerBands}/>;
    case 'Diffused white LED and 220 Ω resistor':
    case 'Diffused white LEDs and 220 Ω resistors':
      return <><Lamp at={[-.18,0,0]} color="#f8f0dc" lit={false}/><group position={[.20,.07,0]}><AxialResistor bands={ledResistorBands}/></group></>;
    case '10 kΩ divider resistors':
      return <><AxialResistor bands={dividerBands}/><group position={[0,.13,0]}><AxialResistor bands={dividerBands}/></group></>;
    case 'Red LED and 220 Ω resistor':
      return <><Lamp at={[-.14,0,0]} color="#e73931" lit={false}/><group position={[.16,.07,0]}><AxialResistor bands={ledResistorBands}/></group></>;
    case 'Computer with microphone':
      return <VoiceConsolePart/>;
    case 'ESP32-DevKitC V4 (ESP32-WROOM-32E)':
      return <Esp32Board/>;
    case '1 kΩ pull-down resistor':
      return <AxialResistor/>;
    case 'Bluefruit LE UART Friend':
      return <BluetoothRadio/>;
    case '5 V USB power bank':
      return <><Box at={[0,0,0]} size={[.58,.30,1.62]} color="#283045" metal={.4}/><Box at={[0,0,.81]} size={[.29,.10,.02]} color="#0c121a"/></>;
    case 'Left and right 48 mm Mecanum wheels':
      return <>{[-1,1].map(hand=><group key={hand} position={[hand*.42,0,0]} scale={1.8}><OmniWheelPart hand={hand}/></group>)}</>;
    case '6 V TT geared DC motors':
      return <><Box at={[.10,0,0]} size={[.82,.45,.49]} color="#e4ad32"/>
        <Disk at={[-.48,0,0]} radius={.196} depth={.38} color="#9ba6ad" axle/>
        <Box at={[.52,0,.09]} size={[.26,.109,.109]} color="#ded6b5"/>
        <Wire path={[[-.60,.07,-.08],[-.79,.19,-.21],[-.96,.20,-.34]]} color="#c5594f"/>
        <Wire path={[[-.60,-.07,.08],[-.79,.17,-.12],[-.96,.16,-.29]]} color="#30383d"/></>;
    case 'Four-motor chassis plate and mounts':
      return <><Box at={[0,0,0]} size={[1.59,.09,1.92]} color="#665185" metal={.48}/>
        {[-.61,.61].flatMap(x=>[-.74,.74].map(z=><Box key={x+':'+z} at={[x,-.14,z]} size={[.26,.31,.23]} color="#6d5b91" metal={.47}/>))}
        {[-.52,0,.52].flatMap(x=>[-.51,0,.51].map(z=><Disk key={x+':'+z} at={[x,.052,z]} radius={.055} depth={.009} color="#3d3453"/>))}</>;
    case 'Regulated 4.5 V motor supply':
      return <><Box at={[0,0,0]} size={[1.29,.54,1.08]} color="#727d83" metal={.38}/>
        <Box at={[0,0,.53]} size={[1.18,.46,.034]} color="#303b44"/>
        <Box at={[-.23,.098,.554]} size={[.54,.15,.018]} color="#527569"/>
        {[-.24,0,.24].map((x,index)=><Disk key={x} at={[x,-.14,.558]} radius={.044} depth={.04} color={index===0?'#a94a41':'#393e46'}/>)}</>;
    case 'Adafruit Motor Shield V2':
      return <><Box at={[0,0,0]} size={[.96,.063,1.21]} color="#2d577d"/>
        {[-.45,.45].map(x=><Box key={x} at={[x,.086,.10]} size={[.127,.147,.81]} color="#438daa"/>)}
        {[-.21,.21].map(z=><Box key={z} at={[.08,.055,z]} size={[.19,.05,.25]} color="#262d38"/>)}
        {[-.30,.30].map(x=><Box key={x} at={[x,.077,-.53]} size={[.22,.092,.12]} color="#292f3b"/>)}</>;
    case 'Cardboard station markers and foam block':
      return <>{[-.43,.43].map((x,index)=><Box key={x} at={[x,-.12,0]} size={[.65,.117,.59]} color={index?'#77a28a':'#b3986d'}/>)}
        <Box at={[-.43,.025,0]} size={[.19,.18,.19]} color="#e5ad65"/></>;
    case '6 V geared DC motors and wheels':
      return <><Box at={[-.43,0,0]} size={[.82,.45,.48]} color="#efba33"/><Disk at={[-.94,0,0]} radius={.21} depth={.43} color="#9aa7ae" axle/><Disk at={[.62,0,0]} radius={.49} depth={.22} color="#25282b" axle/><Disk at={[.75,0,0]} radius={.31} depth={.05} color="#e2a928" axle/></>;
    case 'DFRobot HuskyLens SEN0305 vision sensor':
      return <group scale={1.6}><HuskyLensPart/></group>;
    case 'Adafruit DRV8833 motor breakout':
      return <group scale={1.55}><Drv8833Part/></group>;
    case 'Switched 3×AA holder and matching lead':
      return <>
        <Box at={[0,0,0]} size={[1.16,.26,1.40]} color="#313942"/>
        {[-.34,0,.34].map(x=><mesh key={x} position={[x,.148,0]} rotation={[Math.PI/2,0,0]}>
          <cylinderGeometry args={[.143,.143,1.18,26]}/><meshStandardMaterial color="#a98046" metalness={.58}/>
        </mesh>)}
        <Box at={[.40,.17,.59]} size={[.14,.084,.15]} color="#424655"/>
        <Wire path={[[.55,0,0],[.72,.035,-.14],[.93,.04,-.16]]} color="#bd6455"/>
        <Wire path={[[.55,0,.04],[.70,.032,-.09],[.94,.04,-.12]]} color="#2c3540"/>
        <Box at={[.98,.04,-.14]} size={[.13,.085,.11]} color="#c4c8bf"/>
      </>;
    case 'Mesh basket, color target and obstacles':
      return <>
        <Box at={[-.35,-.235,0]} size={[.79,.062,.79]} color="#77868d"/>
        {[-.735,.035].map(x=><group key={x}>
          {Array.from({length:8},(_,i)=><Box key={i} at={[x,-.08,(i-3.5)*.10]} size={[.014,.32,.018]} color="#9fa8a7" metal={.60}/>)}
          <Box at={[x,.074,0]} size={[.024,.029,.81]} color="#aab4ac" metal={.55}/>
        </group>)}
        <Box at={[.43,.14,-.17]} size={[.45,.67,.075]} color="#a5a8a1"/>
        <Box at={[.43,.22,-.119]} size={[.31,.20,.025]} color="#de753d"/>
        <Box at={[.43,-.105,.32]} size={[.31,.29,.28]} color="#b49269"/>
      </>;
    case 'Chassis and caster':
      return <><Box at={[0,.05,0]} size={[1.65,.09,2.2]} color="#57646f" metal={.5}/><Disk at={[0,-.21,.75]} radius={.18} depth={.13} color="#2c343b" axle/></>;
    case 'Switched 4×AA holder':
      return <><Box at={[0,0,0]} size={[1.5,.24,1.38]} color="#20262f"/>{[-.49,-.16,.16,.49].map(x=><mesh key={x} position={[x,.20,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.135,.135,1.18,28]}/><meshStandardMaterial color="#9c732a" metalness={.5}/></mesh>)}<Box at={[.57,.23,.73]} size={[.23,.17,.19]} color="#333c46"/></>;
    case '5 V MLX90614 infrared thermometer':
      return <group scale={3}><InfraredThermometer/></group>;
    case '3 mm IR break-beam pair':
      return <>{[-.52,.52].map((x,index)=><group key={x} position={[x,0,0]}>
        <Box at={[0,0,0]} size={[.33,.22,.43]} color="#202632"/>
        <Disk at={[0,.115,-.09]} radius={.067} depth={.025} color={index?'#684e58':'#7f8596'}/>
        {(index?['#c35841','#20232b','#e1ded0']:['#c35841','#20232b']).map((color,i)=>
          <Wire key={color} path={[[i*.041-.04,-.02,.20],[i*.042-.05,-.02,.41],[i*.045-.13,-.06,.63],[i*.046-.11,-.05,.77]]} color={color}/>)}
      </group>)}</>;
    case 'P20/15 5 V electromagnet':
      return <group scale={2.4}><CoilModel/><Wire path={[[.04,.13,.16],[.18,.25,.30],[.37,.24,.29],[.46,.12,.37]]} color="#cb5949"/><Wire path={[[.01,.13,.17],[.17,.24,.33],[.36,.23,.33],[.43,.11,.41]]} color="#242c34"/></group>;
    case 'STEMMA MOSFET driver and lead':
      return <group scale={2.4}><CoilDriver/><Wire path={[[-.24,.07,0],[-.38,.07,0],[-.43,.06,.15],[-.51,.04,.21]]} color="#cf5949"/></group>;
    case 'Plain steel washer':
      return <group scale={3.2}><WasherModel/></group>;
    case 'Round force-sensitive resistor':
      return <group scale={1.7}><PressureSensor/></group>;
    case 'Adafruit Ultimate GPS serial breakout':
      return <GpsBreakout/>;
    case '3×4 membrane matrix keypad':
      return <MatrixPad labels/>;
    case 'Magnetic door contact switch':
      return <group scale={2}><ReedPair/></group>;
    case 'Adafruit PMSA003I I²C breakout':
      return <ParticleBreakout/>;
    case 'SEN0193 capacitive soil probe':
      return <group scale={1.4}><MoistureProbe/></group>;
    case '5 V two-wire cooling fan':
      return <group scale={1.5}><GreenhouseFan/></group>;
    case 'Adafruit MPU-6050 IMU':
      return <BalanceImu/>;
    case 'Six-channel metal robot arm kit':
      return <TrainingArm/>;
    case 'PCA9685 PWM servo driver':
      return <ArmPwmBoard/>;
    case 'External regulated arm servo supply':
      return <><Box at={[0,0,0]} size={[1.19,.39,.72]} color="#252a33"/><Wire path={[[.35,0,0],[.64,.03,.17],[.87,-.07,.34],[1.07,-.13,.20]]} color="#262935"/></>;
    case 'DFRobot FIT0800 5 V submersible pump and tube':
      return <><group scale={1.53}><HydroPumpPart/></group>
        <Wire path={[[0,.45,0],[.06,.64,.1],[.42,.53,.33],[.79,.29,.32]]} color="#779baa"/></>;
    case 'Eight 5 V RGBW NeoPixels and input protection':
      return <><GrowLampPart/>
        <group position={[-.78,.15,.41]}><AxialResistor bands={['#bb7438','#bb7438','#794632','#b99d5a']}/></group>
        <mesh position={[.56,.17,.39]}><cylinderGeometry args={[.111,.111,.33,24]}/><meshStandardMaterial color="#344d6b" metalness={.33}/></mesh>
        <Box at={[.56,.336,.39]} size={[.138,.012,.132]} color="#a0a7aa" metal={.49}/>
      </>;
    case 'Hydroponic channel, net cups and covered reservoir':
      return <>
        <Box at={[0,-.22,0]} size={[1.33,.22,.70]} color="#59777e"/>
        <Box at={[0,-.092,0]} size={[1.37,.052,.73]} color="#7b9095"/>
        <Box at={[0,.11,0]} size={[1.76,.082,.38]} color="#719299"/>
        {[-.165,.165].map(z=><Box key={z} at={[0,.157,z]} size={[1.76,.077,.032]} color="#a5b9be"/>)}
        {[-.39,.39].map(x=><group key={x} position={[x,.237,0]}>
          <mesh><cylinderGeometry args={[.115,.08,.156,21,1,true]}/><meshStandardMaterial color="#384849" side={2}/></mesh>
          <mesh position={[0,.08,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.114,.019,9,24]}/><meshStandardMaterial color="#63716c"/></mesh>
        </group>)}
      </>;
    case 'SEN0485 capacitive level sensor':
      return <group scale={2}><TapLevel/><Wire path={[[.22,0,0],[.40,.05,0],[.47,.02,.18],[.79,-.05,.22]]} color="#30323a"/></group>;
    case '5 V peristaltic pump with tubing':
      return <group scale={1.6}><TapPump/>{[-.10,.10].map(z=><AirHose key={z} points={[[.26,.45,z],[.44,.41,z],[.56,.30,z+.11],[.69,.16,z+.13]]}/>)}</group>;
    case 'Regulated 5 V pump supply and adapter':
      return <><Box at={[0,0,0]} size={[.83,.58,.72]} color="#252a34"/><Wire path={[[.3,0,.25],[.67,-.09,.34],[.91,-.14,.18],[1.18,-.14,.22]]} color="#20242a"/><Box at={[1.21,-.14,.22]} size={[.21,.15,.17]} color="#3b6755"/></>;
    case 'Liquid soap pump bottle':
      return <PumpBottle/>;
    case 'Adafruit DS3231 RTC and CR1220':
      return <group scale={1.6}><ClockBoard/></group>;
    case 'Red 0.56-inch I²C clock display':
      return <ClockDisplay/>;
    case 'Adafruit PN532 NFC shield':
      return <PN532Shield/>;
    case '13.56 MHz ISO 14443A classroom tags':
      return <><group position={[-.46,0,0]}><TagCard tag="A"/></group><group position={[.46,.06,0]}><TagCard tag="B"/></group></>;
    case 'Grove Water Sensor and breakout cable':
      return <group scale={1.5}><RainSensorPlate/>
        {['#262d33','#c2594c','#d1cec3','#dcb668'].map((color,i)=><Wire key={color}
          path={[[-.39,.09,i*.054-.08],[-.63,.12,i*.054-.08],[-.77,.09,.09+i*.052],[-.91,.04,.26+i*.06]]} color={color}/>)}
      </group>;
    case 'Waveshare MQ-2 gas sensor module':
      return <group scale={1.5}><MQ2Module/></group>;
    case 'Regulated 5 V sensor supply and adapter':
    case 'Regulated 5 V coil supply and adapter':
    case 'Regulated 5 V servo supply':
      return <><Box at={[0,0,0]} size={[.83,.58,.72]} color="#252a34"/><Wire path={[[.3,0,.25],[.67,-.09,.34],[.91,-.14,.18],[1.18,-.14,.22]]} color="#20242a"/><Disk at={[1.22,-.14,.22]} radius={.05} depth={.16} color="#aeb8bd" axle/></>;
    case 'Pair of TMP36 air sensors':
      return <>{[-.34,.34].map(center=><group key={center} position={[center,0,0]}><Disk at={[0,.18,0]} radius={.21} depth={.36} color="#252b32"/>{[-.10,0,.10].map(x=><Box key={x} at={[x,-.23,0]} size={[.031,.52,.031]} color="#aeb9c5" metal={.65}/>)}</group>)}</>;
    case 'TMP36 analog temperature sensor':
      return <><Disk at={[0,.18,0]} radius={.23} depth={.38} color="#252b32"/>{[-.11,0,.11].map(x=><Box key={x} at={[x,-.25,0]} size={[.035,.55,.035]} color="#aeb9c5" metal={.65}/>)}</>;
    case 'Deep plant pot and drainage saucer':
      return <group position={[0,-.59,0]}><DepthComparisonPot/></group>;
    case 'Basil pot and drainage saucer':
      return <group position={[0,-.62,0]}><BasilPotPart/></group>;
    case 'Sandy mix and identical sample cups':
      return <>{[0,15,30].map((dose,index)=><group key={dose} position={[(index-1)*.78,-.28,0]}><SandySampleCup dose={dose}/></group>)}</>;
    case 'Graduated cylinder':
      return <group position={[0,-.60,0]}><GraduatedWaterCylinder/></group>;
    case 'Clay-rich soil and identical sample cups':
      return <group scale={.92}>{['#a98166','#6d4a3b'].map((shade,i)=><group key={shade} position={[(i-.5)*1.23,-.27,0]}><ClaySample shade={shade}/></group>)}</group>;
    case 'Matched trays and wood-chip mulch':
      return <>{[false,true].map((covered,i)=><group key={i} position={[(i-.5)*1.41,-.18,0]}><MulchTray covered={covered}/></group>)}</>;
    case 'Braided cotton wick':
      return <CottonWick points={[[-.75,0,.25],[-.47,.11,-.27],[-.07,.08,-.34],[.40,.02,-.16],[.28,0,.21],[-.11,-.06,.26],[-.30,-.08,.01],[.08,-.12,-.07],[.67,-.17,.22]]}/>;
    case 'Clear reservoir and raised soil cup':
      return <group position={[0,-.65,0]}><RaisedSoilCup/></group>;
    case 'Open soil tray and probe stand':
      return <group position={[0,-.31,0]}><OpenSoilTray/></group>;
    case 'Matched window boxes and drip trays':
      return <group position={[0,-.22,0]}><WindowBoxPlanter/></group>;
    case 'Dry and damp soil samples':
      return <>{[-.52,.52].map((x,index)=><group key={x}><Disk at={[x,0,0]} radius={.43} depth={.55} color="#a97352"/><Disk at={[x,.29,0]} radius={.39} depth={.05} color={index?'#493229':'#886047'}/></group>)}</>;
    case 'USB webcam':
      return <><Box at={[0,0,0]} size={[1.15,.43,.34]} color="#252d37"/><mesh position={[0,0,.22]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.17,.17,.15,32]}/><meshStandardMaterial color="#3e7596" metalness={.45}/></mesh><Wire path={[[.54,0,0],[.76,0,0],[.87,-.26,0],[1.03,-.32,.22]]} color="#262b31"/></>;
    case 'Computer with webcam support':
      return <><Box at={[0,-.25,.21]} size={[1.56,.09,1.04]} color="#768999" metal={.52}/><Box at={[0,.22,-.29]} size={[1.56,.87,.08]} color="#334b63"/><Box at={[0,.23,-.24]} size={[1.40,.73,.03]} color="#122138"/></>;
    case 'Matte dark card and bright targets':
      return <><Box at={[0,0,0]} size={[1.9,.055,1.3]} color="#202530"/>{[-.55,0,.55].map(x=><Box key={x} at={[x,.10,0]} size={[.31,.17,.35]} color="#ffe3a6"/>)}</>;
    case 'Fixed stand and diffuse lamp':
      return <><Box at={[0,-.64,0]} size={[.85,.12,.68]} color="#475869"/><Box at={[-.28,0,0]} size={[.08,1.28,.08]} color="#aab7c2" metal={.55}/><Box at={[.1,.62,0]} size={[.82,.09,.09]} color="#aab7c2" metal={.55}/><Box at={[.43,.54,0]} size={[.39,.18,.48]} color="#e7dfc8"/></>;
    case 'Arm link and base fixture':
      return <><Box at={[0,-.22,0]} size={[1.5,.14,.87]} color="#a38870"/><Box at={[-.38,-.08,-.19]} size={[.43,.18,.36]} color="#647482" metal={.49}/><Disk at={[-.38,.31,-.19]} radius={.115} depth={.11} color="#e2ddcc"/><Box at={[.05,.31,-.19]} size={[.95,.045,.15]} color="#cb8953"/><Box at={[.38,.34,-.19]} size={[.11,.015,.09]} color="#2e5572"/><Box at={[.31,-.14,.15]} size={[.59,.02,.43]} color="#edebdf"/></>;
    case 'Base, hand crank and hardware':
      return <><Box at={[0,-.17,0]} size={[1.6,.16,1.15]} color="#455a6d"/><Disk at={[-.32,.04,0]} radius={.13} depth={.46} color="#aab7c2"/><Box at={[-.06,.28,0]} size={[.57,.08,.12]} color="#aab7c2" metal={.5}/><Disk at={[.21,.42,0]} radius={.08} depth={.32} color="#323d48"/></>;
    default:
      return null;
  }
}

export function ProjectPartView({name}: {name:string}) {
  return <div className="gp-canvas" role="region" aria-label={`3D model of ${name}`}>
    <Canvas dpr={[1,1.5]} camera={{position:[4,3.5,5],fov:37}} fallback={<p>3D viewing requires WebGL.</p>}>
      <color attach="background" args={['#192a3d']}/>
      <ambientLight intensity={1.6}/>
      <directionalLight position={[3,6,5]} intensity={2.7}/>
      <directionalLight position={[-4,3,-3]} color="#a9c9ff" intensity={1.35}/>
      <OrbitControls makeDefault enablePan={false}/>
      <Suspense fallback={null}><Bounds key={name} fit clip observe margin={1.3}><Center><PartGeometry name={name}/></Center></Bounds></Suspense>
    </Canvas>
  </div>;
}
