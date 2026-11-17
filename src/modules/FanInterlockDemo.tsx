import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { fanTrip } from '../data/fan-interlock';
import { GreenhouseFan } from './GreenhouseDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
const parts=[
 ['Pressure pad','A0 reads the voltage divider. Pressing the puck reduces the sensor resistance and raises the measured voltage.'],
 ['Guarded 5 V fan','The separate supply powers the fan through a MOSFET. A sustained high reading turns that output off.'],
 ['Alert lamp','Once the controller stops, the LED stays on even after the pad clears.'],
 ['Reset button','Reset only works when the measured reading is below 250 counts. The switch is independent of the force sensor.'],
] as const;

function Box({at,size,color,metal=0}: {at:Point;size:Point;color:string;metal?:number}){
 return <RoundedBox position={at} args={size} radius={.019} smoothness={2}>
  <meshStandardMaterial color={color} metalness={metal} roughness={.60}/>
 </RoundedBox>;
}

export function PressureSensor({selected=false}: {selected?:boolean}){
 return <>
  <mesh position={[0,.017,-.21]}><cylinderGeometry args={[.227,.227,.026,32]}/>
   <meshStandardMaterial color={selected?'#aa8750':'#32393e'} metalness={.22}/></mesh>
  <Box at={[0,.017,.12]} size={[.18,.023,.54]} color="#536062"/>
  <mesh position={[0,.035,-.21]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.148,.177,33]}/>
   <meshStandardMaterial color="#5f6d70"/></mesh>
  {[-.045,.045].map(x=><Box key={x} at={[x,.023,.42]} size={[.025,.018,.13]} color="#c6a16c" metal={.7}/>)}
 </>;
}

function Puck({pressure}:{pressure:number}){
 const body=useRef<Group>(null);
 useFrame((_,dt)=>{
  if(body.current)body.current.position.y=MathUtils.damp(body.current.position.y,pressure>250 ? .32 : .45,12,dt);
 });
 return <group ref={body} position={[-1.76,.45,.06]}>
  <mesh><cylinderGeometry args={[.174,.185,.111,28]}/><meshStandardMaterial color="#d0b281" roughness={.76}/></mesh>
  <mesh position={[0,.063,0]}><cylinderGeometry args={[.14,.14,.018,28]}/><meshStandardMaterial color="#937b5e"/></mesh>
 </group>;
}

function Bench({pressure,stopped,selected,select}:{pressure:number;stopped:boolean;selected:number;select:(i:number)=>void}){
 const markers=[
  {at:[-1.76,.31,.06],tag:[-2.04,.99,.26]},
  {at:[1.45,1.02,-.39],tag:[1.83,1.61,-.18]},
  {at:[.86,.38,.99],tag:[1.18,.85,1.21]},
  {at:[-.43,.39,.97],tag:[-.12,.87,1.15]},
 ] satisfies {at:Point;tag:Point}[];
 return <>
  <color attach="background" args={['#283f52']}/><ambientLight intensity={1.37}/>
  <directionalLight position={[4,7,5]} intensity={2.57}/><directionalLight position={[-5,4,-3]} intensity={1.3} color="#b6cde6"/>
  <Box at={[0,-.13,0]} size={[6.10,.24,3.53]} color="#947258"/>
  <Box at={[0,.014,0]} size={[5.98,.068,3.39]} color="#617d75"/>
  <Box at={[-1.74,.14,.29]} size={[1.26,.19,1.32]} color="#a3b3b6" metal={.42}/>
  <group position={[-1.76,.242,.27]}><PressureSensor selected={selected===0}/></group>
  <Puck pressure={pressure}/>
  <Box at={[1.44,.14,-.51]} size={[1.21,.174,.81]} color="#9d8265"/>
  {[-.36,.36].map(x=><Box key={x} at={[1.44+x,.59,-.57]} size={[.11,.91,.11]} color="#87989d" metal={.62}/>)}
  <group position={[1.44,1.02,-.50]} scale={1.24}><GreenhouseFan running={!stopped} selected={selected===1}/></group>
  <Box at={[-.21,.148,-.48]} size={[1.31,.098,.86]} color="#258399"/>
  <Box at={[-.73,.238,-.46]} size={[.198,.137,.264]} color="#acb9bd" metal={.69}/>
  <Box at={[-.18,.231,-.36]} size={[.289,.056,.16]} color="#2d343d"/>
  {[-.291,.291].map(z=><Box key={z} at={[-.08,.229,z-.48]} size={[.91,.078,.051]} color="#2a343c"/>)}
  <Box at={[.25,.157,.98]} size={[2.02,.192,.67]} color="#dcdcd0"/>
  <Box at={[-.44,.293,.97]} size={[.24,.074,.22]} color="#333d45"/>
  <mesh position={[-.44,.365,.97]}><cylinderGeometry args={[.067,.073,.112,22]}/>
   <meshStandardMaterial color={selected===3?'#d2a361':'#485764'}/></mesh>
  <mesh position={[.86,.328,.99]}><cylinderGeometry args={[.068,.068,.147,20]}/>
   <meshStandardMaterial color={stopped?'#ff5347':'#783d42'} emissive="#ff442a" emissiveIntensity={stopped?2.30:0}/></mesh>
  <mesh position={[.86,.406,.99]}><sphereGeometry args={[.068,16,10,0,Math.PI*2,0,Math.PI/2]}/>
   <meshStandardMaterial color={stopped?'#ff6d58':'#823e40'} emissive="#ff452d" emissiveIntensity={stopped?2.35:0}/></mesh>
  <mesh position={[.74,.273,.78]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.032,.032,.173,16]}/><meshStandardMaterial color="#c8ad87"/></mesh>
  <Box at={[2.25,.181,.55]} size={[.79,.239,.56]} color="#353d45"/>
  <Box at={[1.32,.229,.55]} size={[.43,.062,.28]} color="#2d3844"/>
  <Box at={[1.47,.291,.53]} size={[.132,.11,.19]} color="#517675"/>
  <Line points={[[-1.72,.30,.70],[-1.44,.38,.55],[-.88,.31,.20],[-.58,.28,-.19]]} color="#d9b271" lineWidth={1.85}/>
  <Line points={[[.26,.25,-.18],[.78,.30,.04],[1.29,.27,.49]]} color="#9fc8c6" lineWidth={1.75}/>
  <Line points={[[1.48,.32,.52],[1.78,.48,-.03],[1.72,.87,-.44]]} color={!stopped?'#e3ae79':'#af8171'} lineWidth={1.85}/>
  <Line points={[[2.08,.29,.54],[1.81,.36,.72],[1.52,.30,.61]]} color="#c57264" lineWidth={1.8}/>
  {markers.map(({at,tag},index)=><group key={index}>
   <Line points={[at,tag]} color={selected===index?'#ffe29c':'#bdced5'} lineWidth={1.4}/>
   <WorldLabel position={tag} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={parts[index][0]}
    aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button></WorldLabel>
  </group>)}
  <ContactShadows position={[0,.040,0]} scale={8} opacity={.4} blur={2.32} far={4}/>
 </>;
}

export default function FanInterlockDemo(){
 const [pressure,setPressure]=useState(70),[stopped,setStopped]=useState(true),[selected,setSelected]=useState(0);
 const [notice,setNotice]=useState('Clear the pad and reset to run the fan.');
 const pulse=useRef<number|undefined>(undefined);
 const high=pressure>=fanTrip.high;
 useEffect(()=>{
  if(!high||stopped)return;
  const timer=window.setTimeout(()=>{setStopped(true);setNotice('Sustained pressure stopped the fan and latched the alert.');},fanTrip.dwell);
  return ()=>window.clearTimeout(timer);
 },[high,stopped]);
 useEffect(()=>()=>window.clearTimeout(pulse.current),[]);
 function setLoad(value:number){
  window.clearTimeout(pulse.current);
  setPressure(value);
 }
 return <div className="gp-split gp-demo">
  <div className="gp-story-stage">
   <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive 3D fan interlock">
    <Canvas dpr={[1,1.5]} camera={{position:[3.2,3.85,7.4],fov:42}} fallback={<p>The controls and readings are available without WebGL.</p>}>
     <Bench pressure={pressure} stopped={stopped} selected={selected} select={setSelected}/>
     <OrbitControls target={[0,.50,0]} minDistance={4} maxDistance={14} enablePan={false}/>
    </Canvas>
   </div>
   <div className="gp-demo-result" aria-label="Fan interlock readings">
    <div><span>Pressure input</span><strong>{pressure} ADC counts</strong></div>
    <div><span>Fan output</span><strong>{stopped?'Stopped':'Running'}</strong></div>
    <div><span>Alert lamp</span><strong>{stopped?'On':'Off'}</strong></div>
   </div>
  </div>
  <div className="gp-guide">
   <h3>Compare a tap with a sustained press</h3>
   <p>Start with Reset. The fan stops only when the pressure stays high for half a second.</p>
   <label htmlFor="fan-pressure">Pressure-pad reading · {pressure} counts</label>
   <input id="fan-pressure" className="gp-lidar-range" type="range" min={0} max={1023} value={pressure} onChange={event=>setLoad(Number(event.target.value))}/>
   <div className="gp-steps">
    <button type="button" onClick={()=>{setLoad(730);pulse.current=window.setTimeout(()=>setPressure(70),180);}}>Tap pad</button>
    <button type="button" onClick={()=>setLoad(730)}>Hold pressure</button>
    <button type="button" onClick={()=>setLoad(70)}>Clear pad</button>
    <button type="button" className="gp-button" onClick={()=>{
     if(pressure>=fanTrip.clear){setNotice('Reset rejected. Clear the pad first.');return;}
     setStopped(false);setNotice('Reset accepted. The fan is running.');
    }}>Reset fan</button>
   </div>
   <p className="gp-demo-description" role="status">{notice}</p>
   <h4>Inspect the bench</h4>
   <ol className="gp-demo-labels">{parts.map(([name],index)=><li key={name}>
    <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
   </li>)}</ol>
   <p className="gp-demo-description">{parts[selected][1]}</p>
  </div>
 </div>;
}
