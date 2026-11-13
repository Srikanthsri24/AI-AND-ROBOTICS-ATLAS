import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useEffect, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { CatmullRomCurve3, Group, Mesh, Vector3 } from 'three';
import type { Reading } from './lab-experiments';
import { distinctLabs } from "../data/distinct-labs";

type Device = 'controller' | 'esp32' | 'resistor' | 'led' | 'switch' | 'traffic' | 'knob' | 'buzzer' | 'ultrasonic' | 'target' | 'servo' | 'temperature' | 'radio' | 'display' | 'driver' | 'motor' | 'rover';
type Station = { devices: [Device, Device, Device]; labels: [string, string, string]; wires: 'series' | 'digital' | 'signal' | 'range' };
const stations: Record<string, Station> = {
  blink: { devices: ['controller','resistor','led'], labels: ['Controller output','Resistor','Red LED'], wires: 'series' },
  button: { devices: ['switch','controller','led'], labels: ['Push button','D2 input','Green LED'], wires: 'digital' },
  traffic: { devices: ['controller','driver','traffic'], labels: ['Controller','LED resistors','Signal lamps'], wires: 'digital' },
  buzzer: { devices: ['knob','controller','buzzer'], labels: ['Analog input','Threshold rule','Buzzer'], wires: 'digital' },
  ultrasonic: { devices: ['ultrasonic','controller','target'], labels: ['Range sensor','Echo timer','Target'], wires: 'range' },
  servo: { devices: ['knob','controller','servo'], labels: ['Angle command','Pulse output','Servo'], wires: 'digital' },
  temperature: { devices: ['temperature','controller','display'], labels: ['TMP36','ADC','Temperature'], wires: 'signal' },
  iot: { devices: ['esp32','radio','display'], labels: ['ESP32','Telemetry link','Dashboard'], wires: 'signal' },
  motor: { devices: ['controller','driver','motor'], labels: ['PWM output','Motor driver','DC motor'], wires: 'digital' },
  avoidance: { devices: ['ultrasonic','controller','rover'], labels: ['Range sensor','Decision rule','Rover'], wires: 'signal' },
};
const connections: Record<string, [string, string]> = {
  blink: ['Switched output', 'Ground return'],
  button: ['Switch → D2', 'Controller → LED'],
  traffic: ['D8–D10 outputs', 'Resistors → lamps'],
  buzzer: ['Analog → A0', 'D8 → driver'],
  ultrasonic: ['Trigger / echo', 'Sound out / back'],
  servo: ['Angle input', 'D9 pulse signal'],
  temperature: ['TMP36 → A0', 'ADC → readout'],
  iot: ['Sample packet', 'Stream → chart'],
  motor: ['D9 PWM', 'Driver → motor'],
  avoidance: ['Range reading', 'Drive command'],
};
type Point = [number, number, number];
const columns = [-2.22, 0, 2.22];
const metal = '#b7c5cf';
const dark = '#202734';
const railRows = [-1.01, -.89, .89, 1.01];
const socketRows = [-.68,-.55,-.42,-.29,-.16,.16,.29,.42,.55,.68,...railRows];
const sockets = socketRows.flatMap(z => Array.from({length: 45}, (_, i) => [i * .13 - 2.86, z]));
type Props = {
  lab: string; result: Reading; inputs: Record<string, number>; running: boolean; powered: boolean; tick: number;
  selected: number; onSelect: (part: number) => void; onSwitch: () => void;
};

export default function LabWorkbench(props: Props) {
  return distinctLabs[props.lab] ? <ScenarioWorkbench {...props}/> : <OriginalWorkbench {...props}/>;
}

function OriginalWorkbench(props: Props) {
  const station = stations[props.lab];
  function select(index: number) {
    props.onSelect(index);
    if (props.lab === 'button' && index === 0) props.onSwitch();
  }
  return <div className="lab-board lab-board-3d">
    <div className="lab-board-viewport" aria-label="Interactive 3D workbench">
      <Canvas dpr={[1, 1.75]} shadows camera={{position:[0,6.4,5.9],fov:42}} fallback={<p>Enable WebGL to view the 3D workbench.</p>}>
        <color attach="background" args={['#182a42']}/>
        <ambientLight intensity={1.15}/>
        <directionalLight position={[-4,8,3]} intensity={2.4} castShadow shadow-mapSize={[1024,1024]}/>
        <directionalLight position={[4,3,-4]} color="#adcaff" intensity={1}/>
        <Block at={[0,-.23,0]} size={[16,.12,12]} color="#233953"/>
        <FitWorkbench/>
        <Breadboard/>
        <Connections {...props} station={station}/>
        {station.devices.map((device,index) => <group key={device} position={[columns[index],0,0]}>
          <group onClick={event => {event.stopPropagation();select(index);}}>
            <DeviceModel device={device} {...props}/>
          </group>
          {props.selected===index && <mesh position={[0,.012,0]} rotation={[-Math.PI/2,0,0]}>
            <ringGeometry args={[.60,.63,48]}/><meshBasicMaterial color="#8258ed"/>
          </mesh>}
          <WorldLabel position={[0,.10,1.31]} className="lab-world-label">
            <button aria-pressed={props.selected===index} onClick={()=>select(index)}>{station.labels[index]}</button>
          </WorldLabel>
        </group>)}
        <OrbitControls target={[0,.14,0]} enablePan={false} minDistance={5} maxDistance={11} minPolarAngle={.25} maxPolarAngle={1.15}/>
      </Canvas>
    </div>
    <div className="lab-board-legend"><span>Drag to orbit · Scroll or pinch to zoom · Select a part to inspect it</span></div>
  </div>;
}

export function WorldLabel({position,className,children}:{position:Point;className:string;children:ReactNode}) {
  const anchor=useRef<Group>(null);
  const element=useRef<HTMLDivElement>(null);
  const root=useRef<Root>(null);
  const { gl }=useThree();
  const projected=useMemo(()=>new Vector3(),[]);
  useLayoutEffect(()=>{
    const node=document.createElement('div');
    node.style.position='absolute';
    node.style.top='0';
    node.style.left='0';
    node.className=className;
    gl.domElement.parentElement?.append(node);
    element.current=node;
    const mounted=createRoot(node);
    root.current=mounted;
    return ()=>{
      node.remove();
      queueMicrotask(()=>mounted.unmount());
    };
  },[gl,className]);
  useLayoutEffect(()=>{root.current?.render(children);},[children,className]);
  useFrame(({camera,size})=>{
    if(!element.current||!anchor.current)return;
    anchor.current.getWorldPosition(projected).project(camera);
    const x=(projected.x+1)*size.width/2;
    const y=(1-projected.y)*size.height/2;
    element.current.style.transform=`translate3d(${x}px,${y}px,0) translate(-50%,-50%)`;
    element.current.style.visibility=projected.z>1?'hidden':'visible';
  });
  return <group position={position} ref={anchor}/>;
}

function FitWorkbench() {
  const { camera, size } = useThree();
  const narrow = size.width / size.height < 1.35;
  useEffect(() => {
    camera.position.set(0,narrow?7.3:6.4,narrow?6.7:5.9);
    camera.lookAt(0,.14,0);
  }, [camera,narrow]);
  return null;
}

function Block({at,size,color, metallic=false}: {at:Point;size:Point;color:string;metallic?:boolean}) {
  return <mesh position={at} castShadow receiveShadow><boxGeometry args={size}/>
    <meshStandardMaterial color={color} metalness={metallic?.55:.08} roughness={metallic?.29:.46}/>
  </mesh>;
}
function Cylinder({at,r,h,color,axis='y',glow=false}: {at:Point;r:number;h:number;color:string;axis?:'x'|'y'|'z';glow?:boolean}) {
  const rotation: Point = axis==='x'?[0,0,Math.PI/2]:axis==='z'?[Math.PI/2,0,0]:[0,0,0];
  return <mesh position={at} rotation={rotation} castShadow>
    <cylinderGeometry args={[r,r,h,32]}/><meshStandardMaterial color={color} roughness={.31}
      metalness={color===metal?.55:.08} emissive={glow?color:'#000'} emissiveIntensity={glow?1.8:0}/>
  </mesh>;
}
function Breadboard() {
  const holes = useMemo(() => {
    const positions = new Float32Array(sockets.flatMap(([x,z]) => [x,.009,z]));
    return positions;
  },[]);
  return <>
    <Block at={[0,-.125,0]} size={[6.18,.13,2.32]} color="#a5acb6"/>
    <Block at={[0,-.055,0]} size={[6.12,.11,2.28]} color="#eeeae3"/>
    <Block at={[0,.004,0]} size={[5.93,.009,.12]} color="#b7b4ad"/>
    {railRows.map((z,i)=><Block key={z} at={[0,.004,z+.045]} size={[5.88,.009,.013]} color={i%2?'#527ab5':'#d4484a'}/>)}
    <points>
      <bufferGeometry><bufferAttribute attach="attributes-position" args={[holes,3]}/></bufferGeometry>
      <pointsMaterial color="#4b5361" size={.032} sizeAttenuation/>
    </points>
  </>;
}

function Cable({points,color,label,active,running,tick}: {points:Point[];color:string;label:string;active:boolean;running:boolean;tick:number}) {
  const curve=useMemo(()=>new CatmullRomCurve3(points.map(point=>new Vector3(...point))),[points]);
  const pulse=useRef<Mesh>(null);
  const initial=curve.getPointAt((tick*.23+.15)%1);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  useFrame(({clock})=>{
    if(pulse.current && active && running && !reduced) {
      pulse.current.position.copy(curve.getPointAt((clock.elapsedTime*.8)%1));
    }
  });
  const center=curve.getPointAt(.5);
  return <>
    <mesh castShadow><tubeGeometry args={[curve,30,.028,8,false]}/><meshStandardMaterial color={color} roughness={.41}/></mesh>
    {active && <mesh ref={pulse} position={initial}><sphereGeometry args={[.053,12,8]}/><meshBasicMaterial color="#ffe8a4"/></mesh>}
    {label && <WorldLabel position={[center.x,center.y+.13,center.z]} className="lab-wire-label"><span>{label}</span></WorldLabel>}
  </>;
}
function jumper(from: number,to: number,z: number): Point[] {
  return [[from,.12,z],[from+.13,.27,z],[(from+to)/2,.44,z],[to-.13,.27,z],[to,.12,z]];
}
function Connections(props: Props & {station: Station}) {
  const {lab, station, powered, running, tick, result}=props;
  const active=powered&&(lab==='iot'||result.active);
  const range=station.wires==='range';
  const series=station.wires==='series';
  const flow={running,tick};
  const end=2.22+Math.min(.28,result.sample/650);
  return <>
    <Cable points={series?[[ -1.77,.12,-.2],[-1.63,.34,-.2],[-.67,.39,-.2],[-.44,.15,-.2]]:jumper(-1.77,-.44,-.2)} color={series?'#d64648':'#e3a12b'}
      label={series?'Switched output':connections[lab][0]} active={active || powered&&['button','buzzer','avoidance'].includes(lab)} {...flow}/>
    {!range && <Cable points={series?[[.44,.15,-.2],[.65,.39,-.2],[1.84,.38,-.16],[2.11,.13,0]]:jumper(.44,1.77,-.2)} color={series?'#d64648':'#e3a12b'}
      label={series?'To LED anode':connections[lab][1]} active={active} {...flow}/>}
    {range && powered && result.active && <>
      <Cable points={[[-2.22,.47,-.24],[-1.3,.55,-.75],[.3,.55,-.93],[end,.42,-.23]]} color="#3cabc6" label="Sound to target" active {...flow}/>
      <Cable points={[[end,.42,-.16],[.3,.50,-.57],[-1.3,.5,-.5],[-2.22,.46,-.19]]} color="#aa86f5" label="Echo return" active {...flow}/>
    </>}
    {!range && lab!=='iot' && <Cable points={[[series?2.33:2.42,.12,series?0:.2],[2.7,.18,.62],[1.6,.25,.85],[-1.6,.25,.85],[-2.5,.17,.62],[-2.47,.12,.18]]}
      color="#303843" label="Ground return" active={series&&active} {...flow}/>}
  </>;
}

function DeviceModel({device,lab,result,inputs,running,powered,tick}: Props & {device:Device}) {
  const lit=powered&&result.active;
  if (device==='led') {
    const color=lab==='blink'?'#ff263d':'#18eb80';
    return <>
      <Block at={[-.11,.13,0]} size={[.036,.26,.036]} color={metal} metallic/>
      <Block at={[.11,.13,0]} size={[.036,.26,.036]} color={metal} metallic/>
      <Cylinder at={[0,.265,0]} r={.18} h={.06} color={color} glow={lit}/>
      <Cylinder at={[0,.39,0]} r={.145} h={.22} color={lit?color:lab==='blink'?'#a63042':'#23734d'} glow={lit}/>
      <mesh position={[0,.50,0]}><sphereGeometry args={[.145,24,16,0,Math.PI*2,0,Math.PI/2]}/>
        <meshPhysicalMaterial color={color} roughness={.18} clearcoat={1} emissive={lit?color:'#000'} emissiveIntensity={lit?2:0}/>
      </mesh>
      {lit && <pointLight position={[0,.58,0]} color={color} intensity={1.3} distance={1.2}/>}
      <WorldLabel position={[-.20,.13,.13]} className="lab-wire-label"><span>A +</span></WorldLabel>
      <WorldLabel position={[.20,.13,.13]} className="lab-wire-label"><span>K −</span></WorldLabel>
    </>;
  }
  if(device==='resistor') return <>
    <Resistor z={-.2}/>
    <WorldLabel position={[0,.19,.18]} className="lab-wire-label"><span>{inputs.resistance} Ω</span></WorldLabel>
  </>;
  if(device==='controller'||device==='esp32'||device==='driver') {
    if(lab==='traffic'&&device==='driver')return <>{[-.29,0,.29].map(z=><Resistor key={z} z={z}/>)}</>;
    return <>
      <Block at={[0,.075,0]} size={[1.02,.12,.71]} color={device==='esp32'?'#19574f':'#14628d'}/>
      {[-.30,.30].flatMap(z=>Array.from({length:8},(_,i)=><Cylinder key={`${z}-${i}`} at={[(i-3.5)*.115,.147,z]} r={.026} h={.021} color="#c6a262"/>))}
      <Block at={[.025,.17,0]} size={[.30,.055,.28]} color={device==='esp32'?metal:dark} metallic={device==='esp32'}/>
      <Block at={[-.45,.185,0]} size={[.19,.10,.24]} color={metal} metallic/>
      <Block at={[-.55,.187,0]} size={[.012,.054,.17]} color={dark}/>
      {[.16,.22,.29,.36].map(x=><Block key={x} at={[x,.145,.11]} size={[.041,.026,.07]} color="#ceb78e"/>)}
      <Cylinder at={[.39,.153,-.13]} r={.035} h={.023} color="#61e7a2" glow={powered}/>
    </>;
  }
  if(device==='switch'||device==='knob') {
    const angle=((inputs.input??inputs.angle??0)/(lab==='servo'?180:1023)-.5)*Math.PI*1.5;
    return <>
      <Block at={[0,.075,0]} size={[.47,.11,.43]} color={metal} metallic/>
      <Cylinder at={[0,device==='switch'&&lit?.16:.21,0]} r={.15} h={.14} color={dark}/>
      {device==='knob'&&<group rotation={[0,angle,0]}><Block at={[0,.287,-.08]} size={[.034,.012,.12]} color="#eee2b8"/></group>}
    </>;
  }
  if(device==='traffic')return <>
    <Block at={[0,.055,0]} size={[.57,.10,.48]} color={dark}/>
    <Block at={[0,.47,0]} size={[.39,.84,.26]} color={dark}/>
    {['Red','Amber','Green'].map((phase,i)=><Cylinder key={phase} at={[0,.76-i*.25,.15]} axis="z" r={.097} h={.09}
      color={['#d52442','#f0ad22','#26c982'][i]} glow={powered&&result.value===phase}/>)}
  </>;
  if(device==='buzzer')return <>
    <Cylinder at={[0,.15,0]} r={.29} h={.25} color={dark}/>
    <Cylinder at={[0,.279,0]} r={.068} h={.012} color="#080c14"/>
    {lit&&<Motion running={running} tick={tick} speed={1.4} axis="y">
      <mesh position={[0,.30,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.36,.39,32,1,0,Math.PI*.65]}/><meshBasicMaterial color="#f6b145" side={2}/></mesh>
    </Motion>}
  </>;
  if(device==='ultrasonic')return <>
    <Block at={[0,.25,0]} size={[.93,.43,.10]} color="#1377a1"/>
    {[-.23,.23].map(x=><group key={x}>
      <Cylinder at={[x,.28,.10]} r={.165} h={.16} axis="z" color={metal}/>
      <Cylinder at={[x,.28,.185]} r={.127} h={.016} axis="z" color="#303e50"/>
      <Cylinder at={[x,.28,.194]} r={.097} h={.008} axis="z" color="#627285"/>
    </group>)}
  </>;
  if(device==='target')return <group position={[Math.min(.28,(result.sample||0)/650),0,0]}>
    <Block at={[0,.32,0]} size={[.14,.64,.62]} color="#899aab"/>
    <Block at={[0,.04,0]} size={[.52,.08,.75]} color={dark}/>
  </group>;
  if(device==='servo')return <>
    <Block at={[0,.20,0]} size={[.69,.40,.43]} color="#245eac"/>
    <Block at={[0,.11,0]} size={[.89,.09,.41]} color="#1c4b8b"/>
    <Cylinder at={[0,.43,0]} r={.13} h={.12} color={dark}/>
    <ServoHorn angle={result.sample}/>
  </>;
  if(device==='motor')return <>
    <Cylinder at={[0,.25,0]} r={.23} h={.58} axis="x" color={metal}/>
    <Cylinder at={[.32,.25,0]} r={.20} h={.10} axis="x" color={dark}/>
    <Cylinder at={[.46,.25,0]} r={.043} h={.26} axis="x" color={metal}/>
    <group position={[.55,.25,0]}><Motion axis="x" speed={lit?inputs.duty*.28:0} running={running} tick={tick}>
      <Block at={[0,0,0]} size={[.045,.46,.065]} color="#e5d6a1"/>
    </Motion></group>
  </>;
  if(device==='temperature')return <>
    {[-.10,0,.10].map(x=><Block key={x} at={[x,.12,0]} size={[.027,.24,.026]} color={metal} metallic/>)}
    <Cylinder at={[0,.30,0]} r={.17} h={.23} color={dark}/>
    <Block at={[0,.30,.10]} size={[.29,.23,.09]} color="#222833"/>
  </>;
  if(device==='radio')return <>
    <Block at={[0,.09,0]} size={[.62,.12,.46]} color="#17645c"/>
    <Block at={[0,.19,0]} size={[.36,.12,.27]} color={metal} metallic/>
    <Cylinder at={[.20,.18,.12]} r={.04} h={.02} color="#72f8b9" glow={powered && tick%2===0}/>
  </>;
  if(device==='display')return <>
    <Block at={[0,.17,0]} size={[1,.30,.59]} color="#293547"/>
    <Block at={[0,.328,0]} size={[.87,.02,.44]} color="#15525a"/>
    <WorldLabel position={[0,.40,0]} className="lab-display-label"><span>{result.value}</span></WorldLabel>
  </>;
  return <>
    <Block at={[0,.24,0]} size={[.72,.26,.55]} color="#245b99"/>
    {[-.38,.38].map(z=><group key={z} position={[0,.18,z]}>
      <Cylinder at={[0,0,0]} r={.18} h={.12} axis="z" color={dark}/>
      <Motion axis="z" speed={lit?9:0} running={running} tick={tick}>
        <Block at={[0,0,z>0?.068:-.068]} size={[.045,.25,.018]} color={metal}/>
      </Motion>
    </group>)}
    <Cylinder at={[.24,.39,0]} r={.057} h={.045} color={lit?'#28d894':'#f33f48'} glow={powered}/>
  </>;
}

function Resistor({z}:{z:number}) {
  return <>
    <Cylinder at={[0,.15,z]} r={.024} h={.89} axis="x" color={metal}/>
    <Cylinder at={[0,.15,z]} r={.092} h={.40} axis="x" color="#d3b482"/>
    {[-.13,-.07,.02,.14].map((x,index)=><Cylinder key={x} at={[x,.15,z]} r={.095} h={.025} axis="x" color={['#b3493f','#af4437','#664532','#b78d37'][index]}/>)}
  </>;
}
function Motion({axis,speed,running,tick,children}:{axis:'x'|'y'|'z';speed:number;running:boolean;tick:number;children:ReactNode}) {
  const group=useRef<Group>(null);
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const previousTick=useRef(tick);
  useFrame((_,delta)=>{
    if(!group.current)return;
    if(running && !reduced) group.current.rotation[axis]+=Math.min(delta,.05)*speed;
    else if(tick!==previousTick.current) {
      group.current.rotation[axis]=tick===0?0:group.current.rotation[axis]+.18*speed;
    }
    previousTick.current=tick;
  });
  return <group ref={group}>{children}</group>;
}
function ServoHorn({angle}:{angle:number}) {
  const horn=useRef<Group>(null);
  const target=angle*Math.PI/180;
  useFrame((_,delta)=>{
    if(horn.current) horn.current.rotation.y += (target-horn.current.rotation.y)*Math.min(1,delta*11);
  });
  return <group ref={horn} position={[0,.51,0]}>
    <Block at={[.16,0,0]} size={[.53,.055,.12]} color="#f4e9d8"/>
    <Cylinder at={[0,.034,0]} r={.034} h={.02} color={metal}/>
  </group>;
}

const cableColors = ['#eb6a53','#63c9e3','#f1c76b'];
const boards = new Set(['resistor','led','controller','esp32','knob','switch','buzzer','driver']);
const paired = new Set(['switch','clock','pressure','temperature','supply','ultrasonic']);
const fixtures = new Set(['target','gate','tank','conveyor','rover','camera','gripper','fan','heater']);

function ScenarioWorkbench(props: Props) {
  const scenario = distinctLabs[props.lab];
  const parts = scenario.parts;
  const pairedInput = parts[0].shape === parts[1].shape && paired.has(parts[0].shape);
  const hasFixture = parts.some(part => fixtures.has(part.shape));
  const breadboard = !hasFixture && parts.filter(part => boards.has(part.shape)).length >= 2;
  const locations: Point[] = parts.length === 4
    ? [[-2.15,0,-.78],[-.7,0,.42],[.75,0,-.78],[2.18,0,.42]]
    : pairedInput && parts.length === 3
      ? [[-1.9,0,-.72],[-.15,0,.52],[1.96,0,-.28]]
      : parts.map((_, i) => [(i-(parts.length-1)/2)*(parts.length===2 ? 3 : 2.1),0,hasFixture && i%2===0 ? -.44 : 0]);
  const links = pairedInput && parts.length === 3 ? [[0,2],[1,2]] : parts.slice(1).map((_, i)=>[i,i+1]);
  return <div className="lab-board lab-board-3d">
    <div className="lab-board-viewport" aria-label="Interactive 3D workbench">
      <Canvas dpr={[1,1.5]} shadows camera={{position:[0,6.4,5.9],fov:42}} fallback={<p>Enable WebGL to view the 3D workbench.</p>}>
        <color attach="background" args={[hasFixture ? '#192c32' : '#182a42']}/>
        <ambientLight intensity={1.3}/>
        <directionalLight position={[-4,8,3]} intensity={2.4} castShadow/>
        <directionalLight position={[4,3,-4]} color="#adcaff" intensity={1}/>
        <Block at={[0,-.24,0]} size={[16,.12,12]} color={hasFixture ? '#274145' : '#233953'}/>
        {breadboard ? <Breadboard/> : <Block at={[0,-.095,0]} size={[6.45,.19,2.7]} color={hasFixture ? '#44575a' : '#485a70'}/>}
        <FitWorkbench/>
        {links.map(([from,to],i)=>{
          const [x,,z]=locations[from], [end,,endZ]=locations[to];
          const back = Math.min(z,endZ)-.5-i*.16;
          const field = parts[from].shape === 'ultrasonic' && fixtures.has(parts[to].shape)
            || parts[to].shape === 'ultrasonic' && fixtures.has(parts[from].shape)
            || parts[from].shape === 'radio';
          const points: Point[] = field ? [[x+.35,.31,z],[(x+end)/2,.48,(z+endZ)/2],[end-.35,.31,endZ]]
            : [[x+.38,.08,z+.16],[x+.55,.29,back], [end-.55,.27,back],[end-.38,.08,endZ+.16]];
          return <Cable key={from+':'+to} points={points} color={field?'#71d8bf':cableColors[i]}
            label={field ? 'Signal path' : parts[from].shape==='supply' ? 'Power' : 'Signal'}
            active={props.powered} running={props.running} tick={props.tick}/>;
        })}
        {parts.map(({shape,label},index)=><group key={label} position={locations[index]}>
          {props.selected===index && <mesh position={[0,.015,0]} rotation={[-Math.PI/2,0,0]}>
            <ringGeometry args={[.65,.70,48]}/><meshBasicMaterial color="#e0b4ff"/>
          </mesh>}
          <group onClick={event=>{event.stopPropagation();props.onSelect(index);}}>
            <ScenarioDevice {...props} shape={shape} index={index}/>
          </group>
          <WorldLabel position={[0,.12,parts.length===4 && index%2===0 ? .48 : .77]} className="lab-world-label">
            <button aria-pressed={props.selected===index} onClick={()=>props.onSelect(index)}>{label}</button>
          </WorldLabel>
        </group>)}
        <OrbitControls target={[0,.14,0]} enablePan={false} minDistance={5} maxDistance={11} minPolarAngle={.25} maxPolarAngle={1.15}/>
      </Canvas>
    </div>
    <div className="lab-board-legend"><span>Orbit or zoom · Select a component to inspect its role · Connections show functional signal flow</span></div>
  </div>;
}

function ScenarioDevice(props: Props & {shape:string; index:number}) {
  const {shape, index, result, inputs, powered, tick, running} = props;
  const model = distinctLabs[props.lab];
  const value = index === 0 ? inputs.a : inputs.b ?? inputs.a;
  const active = powered && (props.lab === 'iot-10' && shape === 'led' ? result.sample >= 0 : result.active);
  const angle = powered ? Math.max(0,Math.min(180,result.sample*(model.unit==='%'?1.8:1))) : 0;
  const speed = active ? Math.max(.8,Math.min(12,inputs.a)) : 0;
  if(shape==='supply') return <>
    <Block at={[0,.23,0]} size={[1.03,.46,.72]} color="#a7b5c1" metallic/>
    <Block at={[0,.47,0]} size={[.85,.025,.47]} color="#142b3c"/>
    {[-.29,.29].map((x,i)=><Cylinder key={x} at={[x,.15,.37]} r={.07} h={.09} axis="z" color={i?'#cf4a42':dark}/>)}
    <WorldLabel position={[0,.49,0]} className="lab-display-label"><span>{value} {model.input.includes('voltage') || model.input.includes('supply') ? 'V' : ''}</span></WorldLabel>
  </>;
  if(shape==='clock'||shape==='meter') return <>
    <Block at={[0,.10,0]} size={[.80,.2,.66]} color={dark}/>
    <Cylinder at={[0,.23,0]} r={.30} h={.14} color="#a2aeb7"/>
    <Cylinder at={[0,.308,0]} r={.265} h={.02} color="#f1e9d9"/>
    {Array.from({length:8},(_,i)=><group key={i} rotation={[0,i*Math.PI/4,0]}>
      <Block at={[0,.326,-.22]} size={[.018,.009,.05]} color={dark}/>
    </group>)}
    <group rotation={[0,(shape==='clock'?tick:result.sample*.35)*.5,0]}><Block at={[0,.34,-.09]} size={[.024,.018,.20]} color="#be423b"/></group>
  </>;
  if(shape==='tank') return <>
    <Block at={[0,.04,0]} size={[1.2,.08,.72]} color={metal} metallic/>
    <Block at={[0,.28,-.32]} size={[1.2,.52,.08]} color="#86a5b4" metallic/>
    {[-.56,.56].map(x=><Block key={x} at={[x,.28,0]} size={[.08,.52,.7]} color="#86a5b4" metallic/>)}
    <Block at={[0,.07+Math.max(0,Math.min(value,10))*.018,0]} size={[1.03,.10+Math.max(0,Math.min(value,10))*.036,.58]} color="#188eaf"/>
  </>;
  if(shape==='pressure'||shape==='soil'||shape==='light') return <>
    <Block at={[0,.07,0]} size={[.72,.14,.55]} color="#17685b"/>
    {shape==='soil' ? [-.1,.1].map(x=><Block key={x} at={[x,.16,.37]} size={[.075,.06,.51]} color="#b58b46" metallic/>)
      : <Cylinder at={[0,.21,0]} r={shape==='light'?.14:.25} h={.14} color={shape==='light'?'#d8a165':metal}/>}
    {shape==='light' && <Block at={[0,.29,0]} size={[.12,.02,.04]} color={dark}/>}
  </>;
  if(shape==='heater') return <>
    <Block at={[0,.05,0]} size={[1,.1,.65]} color="#8f9ea6" metallic/>
    {[-.22,-.11,0,.11,.22].map(z=><Block key={z} at={[0,.17,z]} size={[.9,.22,.04]} color={active?'#d27b47':metal} metallic/>)}
  </>;
  if(shape==='conveyor') return <>
    <Block at={[0,.07,0]} size={[1.45,.14,.69]} color="#526577"/>
    <Block at={[0,.18,0]} size={[1.38,.13,.53]} color={dark}/>
    {[-.66,.66].map(x=><Cylinder key={x} at={[x,.18,0]} axis="z" r={.085} h={.58} color={metal}/>)}
    {[0,1,2].map(i=><Block key={i} at={[-.6+((i*.43+(active?tick*.15:0))%1.24),.34,0]} size={[.19,.19,.28]} color="#bc905d"/>)}
  </>;
  if(shape==='fan') return <>
    <Cylinder at={[0,.29,0]} r={.42} h={.13} color={dark}/>
    <Motion axis="y" speed={speed} running={running} tick={tick}>
      {[0,1,2,3,4].map(i=><group key={i} rotation={[0,i*Math.PI*2/5,0]}><Block at={[.22,.39,0]} size={[.27,.055,.10]} color={metal}/></group>)}
    </Motion>
    <Cylinder at={[0,.4,0]} r={.12} h={.12} color="#748a9a"/>
  </>;
  if(shape==='gate'||shape==='camera'||shape==='gripper') return <>
    <Block at={[0,.08,0]} size={[.78,.16,.58]} color="#33485f"/>
    <Cylinder at={[0,.24,0]} r={.18} h={.25} color={metal}/>
    <group position={[0,.39,0]} rotation={[0,angle*Math.PI/180,0]}>
      {shape==='camera' ? <><Block at={[0,.12,0]} size={[.49,.28,.31]} color={dark}/><Cylinder at={[0,.12,.19]} r={.105} h={.13} color="#305576" axis="z"/></>
        : shape==='gripper' ? [-.16,.16].map(x=><Block key={x} at={[x,.05,.18]} size={[.12,.12,.38]} color={metal} metallic/>)
          : <><Block at={[.29,.06,0]} size={[.72,.13,.12]} color="#f5c873"/><Block at={[.48,.13,0]} size={[.17,.015,.12]} color="#ce5246"/></>}
    </group>
  </>;
  if(shape==='traffic') {
    const phase = model.unit==='channel' ? ['Red','Amber','Green'][Math.max(0,Math.floor(result.sample)-1)%3]
      : active ? 'Green' : 'Red';
    return <DeviceModel {...props} device="traffic" result={{...result,value:phase}}/>;
  }
  const componentResult = shape==='switch' ? {...result,active:value>0}
    : shape==='servo' ? {...result,sample:angle}
    : shape==='motor' || shape==='rover' ? {...result,active:powered && (shape==='motor' ? (props.lab==='motor-1' ? inputs.a>0 : result.active) : (props.lab==='avoidance-7' ? result.sample!==0 : result.active))}
    : shape==='led' ? {...result,active} : result;
  return <DeviceModel {...props} device={shape as Device} result={componentResult}
    lab={shape==='led' && props.lab.startsWith('blink') ? 'blink' : props.lab}
    inputs={{...inputs, input:value*102.3,duty:inputs.a*10,resistance:(inputs.b??0)*100}}/>;
}
