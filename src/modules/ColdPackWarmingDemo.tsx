import {useEffect,useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import type {Group} from 'three';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Reusable cold pack',at:[.79,.65,-.12],detail:'The sealed pack cools the nearby air. Remove and replace it without moving the temperature probe.'},
  {name:'Dry air probe · A0',at:[-.21,.82,.37],detail:'The TMP36 samples air above the tray. It stays clear of the pack and condensation.'},
  {name:'Spill tray',at:[1.85,.46,.46],detail:'The tray holds the pack and catches condensation. Keep the board and leads outside it.'},
  {name:'Warm warning · D8',at:[-.85,.46,1.12],detail:'D8 waits for three continuous seconds of warm air. Once lit, it stays on until the reading drops to 18 °C.'},
];

function Bench({present,warning,selected,select}:{present:boolean;warning:boolean;selected:number;select:(i:number)=>void}){
  const pack=useRef<Group>(null);
  useFrame((_,delta)=>{
    if(!pack.current)return;
    const position=pack.current.position;
    position.z+=((present?-.15:-1.06)-position.z)*(1-Math.exp(-14*delta));
    const travel=Math.max(0,Math.min(1,(-.15-position.z)/.91));
    position.y=.328-.053*travel+Math.sin(travel*Math.PI)*.23;
  });
  return <>
    <color attach="background" args={['#344c61']}/><hemisphereLight args={['#e6f2ff','#85796b',2.08]}/><directionalLight position={[-3,6,4]} intensity={2.12} color="#fff0dc"/>
    <Box at={[0,-.095,0]} size={[4.94,.19,3.09]} color="#657d8b"/>
    <group onClick={()=>select(2)}>
      <Box at={[.92,.14,.04]} size={[2.45,.16,1.49]} color={selected===2?'#c0986c':'#718a96'}/>
      <Box at={[.92,.227,.04]} size={[2.25,.019,1.27]} color="#8ca4aa" metal={.32}/>
      {[-.271,2.11].map(x=><Box key={x} at={[x,.232,.04]} size={[.073,.14,1.48]} color="#637f8b" metal={.41}/>)}
      {[-.66,.74].map(z=><Box key={z} at={[.92,.232,z]} size={[2.40,.14,.073]} color="#637f8b" metal={.43}/>)}
    </group>
    <Box at={[.92,.09,-1.07]} size={[1.65,.19,.68]} color="#506473"/>
    <group ref={pack} position={[.98,.328,-.15]} onClick={()=>select(0)}>
      <Box at={[0,0,0]} size={[1.53,.18,.64]} color={selected===0?'#518dac':'#347bb3'}/>
      <Box at={[0,.100,0]} size={[1.39,.044,.52]} color="#75abd1" metal={.15}/>
      {Array.from({length:7},(_,i)=><Box key={i} at={[-.54+i*.18,.126,0]} size={[.032,.022,.45]} color="#4e8cba"/>)}
      <Box at={[-.57,.128,.164]} size={[.215,.013,.132]} color="#d3e1e9"/>
    </group>
    <group onClick={()=>select(1)}>
      <Box at={[-.28,.119,.41]} size={[.31,.135,.39]} color="#a9b2ac"/>
      <Box at={[-.28,.334,.41]} size={[.068,.35,.074]} color="#7e9a9e" metal={.47}/>
      <Box at={[-.28,.534,.41]} size={[.155,.104,.11]} color={selected===1?'#dca880':'#2d3b45'}/>
      {[-.044,0,.044].map(x=><Box key={x} at={[-.28+x,.462,.468]} size={[.015,.103,.014]} color="#adb9bf" metal={.66}/>)}
    </group>
    <Box at={[-1.56,.115,1.05]} size={[.79,.082,.48]} color="#2c7b90"/>
    <Box at={[-1.81,.194,1.105]} size={[.18,.113,.15]} color="#b0bac4" metal={.68}/>
    <Box at={[-1.48,.184,1.045]} size={[.24,.061,.12]} color="#29353f"/>
    {[.875,1.219].map(z=><Box key={z} at={[-1.47,.176,z]} size={[.49,.056,.056]} color="#29353b"/>)}
    <group onClick={()=>select(3)}>
      <Box at={[-.84,.121,1.05]} size={[.49,.104,.47]} color={selected===3?'#e3bc8e':'#dedbce'}/>
      <Box at={[-.84,.209,1.00]} size={[.32,.024,.023]} color="#aeb7bb" metal={.65}/>
      <Box at={[-.84,.223,1.00]} size={[.155,.048,.045]} color="#baa081"/>
      <mesh position={[-.68,.285,1.14]}><sphereGeometry args={[.072,22,14]}/><meshStandardMaterial color={warning?'#ff754f':'#994641'} emissive="#ff6940" emissiveIntensity={warning?2.10:0}/></mesh>
      {warning&&<pointLight position={[-.68,.35,1.14]} color="#ff8052" intensity={1.1} distance={.86}/>}
    </group>
    <Line points={[[-.28,.423,.467],[-.38,.22,.65],[-.63,.205,.829],[-1.23,.196,.875]]} color="#dc9f53" lineWidth={3}/>
    <Line points={[[-.234,.423,.467],[-.36,.197,.686],[-.71,.177,1.162],[-1.35,.183,1.219]]} color="#34454f" lineWidth={2}/>
    <Line points={[[-.324,.423,.466],[-.47,.199,.64],[-.95,.19,.755],[-1.45,.184,.875]]} color="#ba6455" lineWidth={2}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={i===0&&!present?[.92,.65,-1.05]:at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.006,0]} opacity={.32} scale={5.2} far={1.4} resolution={128} frames={1}/>
  </>;
}
type Reading={temperature:number;warmSeconds:number;warning:boolean};
const initial:Reading={temperature:16,warmSeconds:0,warning:false};
export default function ColdPackWarmingDemo(){
  const [present,setPresent]=useState(true);
  const [ambient,setAmbient]=useState(24);
  const [selected,select]=useState(0);
  const [reading,setReading]=useState(initial);
  const {temperature,warmSeconds,warning}=reading;
  const target=present?Math.min(ambient,16):ambient;
  useEffect(()=>{
    if(temperature===target&&(temperature<20||warning))return;
    const timer=window.setTimeout(()=>setReading(previous=>{
      const temperature=previous.temperature+Math.sign(target-previous.temperature);
      const warmSeconds=temperature>=20?previous.temperature>=20?Math.min(3,previous.warmSeconds+1):0:0;
      return {temperature,warmSeconds,warning:temperature>18&&(previous.warning||warmSeconds===3)};
    }),310);
    return ()=>window.clearTimeout(timer);
  },[temperature,target,warmSeconds,warning]);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D cold pack warming indicator">
        <Canvas camera={{position:[2.50,3.28,6.14],fov:40}} dpr={[1,1.6]} fallback={<p>Follow the temperature and warning readings below.</p>}>
          <Bench {...{present,warning,selected,select}}/><OrbitControls target={[0,.36,0]} enablePan={false} minDistance={3.5} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Cold pack readings">
        <div><span>Air by pack</span><strong>{temperature} °C</strong></div><div><span>Warm hold</span><strong>{warmSeconds} / 3 s</strong></div><div><span>Warning</span><strong>{warning?'On':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Remove and replace the cold pack</h3>
      <label className="gp-home-light">Room temperature <output>{ambient} °C</output><input type="range" aria-label="Room temperature" min="18" max="30" value={ambient} onChange={e=>setAmbient(e.target.valueAsNumber)}/></label>
      <div className="gp-steps"><button type="button" className="gp-button" onClick={()=>setPresent(!present)}>{present?'Remove cold pack':'Replace cold pack'}</button><button type="button" onClick={()=>{setPresent(true);setAmbient(24);setReading(initial);}}>Reset trial</button></div>
      <p role="status">{warning?'Warm warning on.':temperature>=20?'Timing warm air.':'Warm warning off.'}</p>
      <p>In this accelerated trial, the warm warning requires three modeled seconds at 20 °C or above and clears at 18 °C.</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
