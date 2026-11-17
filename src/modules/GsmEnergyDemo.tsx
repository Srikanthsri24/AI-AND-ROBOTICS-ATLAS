import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { energyLoads, energyReading } from '../data/gsm-energy';
import { FonaBattery, FonaModule } from './GsmEnergyParts';
import { SolarMeterSensor, SolarMeterSolid as Box } from './SolarMeterParts';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Snapshot={watts:number;wh:number};
const parts=[
  ['INA219 shunt','Bench positive enters VIN+. VIN− supplies the resistor load. The sensor measures the drop across its shunt to estimate current.'],
  ['DC resistor load','The load has an open-circuit setting, one 220 Ω resistor, or two in series for 440 Ω.'],
  ['FONA radio','The modem receives the snapshot over UART and submits it over the simulated 2G network.'],
  ['Protected LiPo','The battery feeds the GSM breakout so transmitting draws from the battery rather than the Uno 5 V rail.'],
  ['Phone inbox','In this demo an accepted snapshot appears here. A real modem acceptance still needs confirmation on the receiving phone.'],
] as const;
const points:Point[]=[[-.90,.38,.30],[.34,.39,.55],[.36,.38,-.77],[1.28,.32,-.90],[1.95,.40,.68]];

function Bench({load,online,accepted,selected,select}:{load:number;online:boolean;accepted:boolean;selected:number;select:(i:number)=>void}){
  return <>
    <color attach="background" args={['#263549']}/>
    <hemisphereLight args={['#e4efff','#6f5c49',2.35]}/>
    <directionalLight position={[-4,7,6]} intensity={2.4}/>
    <Box at={[0,-.13,0]} size={[6.12,.24,4.01]} color="#526778"/>
    <Box at={[-2.14,.29,.65]} size={[.85,.55,1.33]} color="#3c4756"/>
    <Box at={[-2.14,.53,.80]} size={[.64,.044,.74]} color="#28384a"/>
    <Box at={[-2.11,.557,.70]} size={[.30,.014,.17]} color="#527f75"/>
    <Box at={[-2.25,.53,1.16]} size={[.11,.08,.095]} color="#bd524d"/>
    <Box at={[-2.01,.53,1.16]} size={[.11,.08,.095]} color="#242b33"/>
    <group position={[-.99,.09,.30]} scale={.74} onClick={()=>select(0)}><SolarMeterSensor selected={selected===0}/></group>
    <group onClick={()=>select(1)}>
      <Box at={[.22,.11,.65]} size={[1.45,.15,.92]} color={selected===1?'#e1c17b':'#e4e8e8'}/>
      {Array.from({length:8},(_,i)=><Box key={i} at={[i*.166-.42,.188,.94]} size={[.036,.013,.038]} color="#758490"/>)}
      {Array.from({length:load/220},(_,i)=><group key={i} position={[i*.49-.04,.25,.52]}>
        <Line points={[[-.24,-.055,0],[-.12,0,0],[.12,0,0],[.25,-.055,0]]} color="#b1bdc7" lineWidth={2.2}/>
        <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.047,.047,.23,20]}/><meshStandardMaterial color="#c7a172"/></mesh>
      </group>)}
    </group>
    <group position={[-1.42,.075,-.91]} scale={1.61}><Uno at={[0,0,0]}/></group>
    <group position={[.36,.098,-.75]} scale={1.07} onClick={()=>select(2)}><FonaModule selected={selected===2} {...{online}}/></group>
    <group position={[1.29,.108,-.88]} onClick={()=>select(3)}><FonaBattery/></group>
    <Box at={[.51,.096,-1.54]} size={[.83,.07,.26]} color="#333b49"/>
    <Line points={[[.70,.16,-.95],[.68,.084,-1.20],[.66,.125,-1.54]]} color="#29333d" lineWidth={2.4}/>
    <Line points={[[.95,.107,-1.05],[.85,.13,-1.39],[.06,.14,-1.14],[-.04,.16,-.74]]} color={selected===3?'#ffdb8f':'#cf645a'} lineWidth={3}/>
    <group position={[1.96,.118,.64]} rotation={[0,-.18,0]} onClick={()=>select(4)}>
      <Box at={[0,0,0]} size={[.73,.19,1.27]} color={selected===4?'#cfac64':'#283443'}/>
      <Box at={[0,.099,0]} size={[.66,.018,1.13]} color="#273f57"/>
      {accepted&&<><Box at={[0,.114,-.16]} size={[.52,.009,.28]} color="#64baa9"/>
        {[-.22,-.15,-.08].map((z,i)=><Box key={z} at={[-.05+i*.027,.121,z]} size={[.34-i*.055,.004,.016]} color="#c7e1d5"/>)}</>}
    </group>
    <Line points={[[-2.25,.57,1.16],[-1.88,.12,1.26],[-1.38,.11,.60],[-1.11,.285,.115]]} color="#cf6059" lineWidth={3.2}/>
    <Line points={[[-.87,.285,.115],[-.71,.13,.46],[-.28,.195,.52]]} color={load?'#eea557':'#b58d67'} lineWidth={3}/>
    <Line points={[[load===440?.70:.21,.195,.52],[.74,.106,1.29],[-1.54,.13,1.42],[-2.01,.57,1.16]]} color="#182635" lineWidth={3}/>
    {['#c16252','#273441','#76b9a8','#73aecc'].map((color,i)=><Line key={color} points={[
      [-1.29+i*.13,.13,.545],[-.53+i*.10,.11,-.08],[-.93-i*.115,.34,-.51],
    ]} color={color} lineWidth={2.6}/>)}
    <Line points={[[.19,.15,-.45],[.04,.13,-.22],[-.86,.34,-.54]]} color="#c8ae69" lineWidth={3}/>
    {points.map((at,i)=><WorldLabel key={i} position={at} className="gp-marker-anchor">
      <button type="button" className="gp-marker" aria-label={parts[i][0]} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{parts[i][0]}</span>}</button>
    </WorldLabel>)}
  </>;
}
export default function GsmEnergyDemo(){
  const [load,setLoad]=useState(220);
  const [wh,setWh]=useState(0);
  const [running,setRunning]=useState(false);
  const [online,setOnline]=useState(true);
  const [selected,select]=useState(0);
  const [pending,setPending]=useState<Snapshot|null>(null);
  const [message,setMessage]=useState<Snapshot|null>(null);
  const [notice,setNotice]=useState('Ready · No SMS requested');
  const {volts,milliamps,watts}=energyReading(load);
  useEffect(()=>{
    if(!running)return;
    const timer=window.setInterval(()=>setWh(value=>value+watts/3600),1000);
    return ()=>window.clearInterval(timer);
  },[running,watts]);
  useEffect(()=>{
    if(!pending)return;
    const timer=window.setTimeout(()=>{
      if(online){setMessage(pending);setNotice('Modem accepted SMS · Snapshot in simulated inbox');}
      else setNotice('SMS failed · Network unavailable');
      setPending(null);
    },900);
    return ()=>window.clearTimeout(timer);
  },[online,pending]);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D GSM energy workbench">
        <Canvas camera={{position:[3.7,5.6,7.1],fov:41}} dpr={[1,1.6]} fallback={<p>Use the load and network controls to compare readings.</p>}>
          <Bench {...{load,online,selected,select}} accepted={!!message}/>
          <OrbitControls target={[0,.15,.12]} minDistance={4.8} maxDistance={14} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Energy meter readings">
        <div><span>Load voltage</span><strong>{volts.toFixed(2)} V</strong></div>
        <div><span>Current</span><strong>{milliamps.toFixed(2)} mA</strong></div>
        <div><span>Power</span><strong>{watts.toFixed(3)} W</strong></div>
        <div><span>Energy</span><strong>{wh.toFixed(5)} Wh</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Compare load, time and messaging</h3>
      <p>Advance time with each resistor load and compare the energy gained. Ask the modem for a snapshot, then disable the simulated network and try again.</p>
      <div className="gp-steps" role="group" aria-label="Resistor load">
        {energyLoads.map(value=><button key={value.ohms} type="button" aria-pressed={value.ohms===load} onClick={()=>setLoad(value.ohms)}>{value.name}</button>)}
      </div>
      <div className="gp-steps">
        <button type="button" onClick={()=>setRunning(value=>!value)}>{running?'Pause meter':'Run meter'}</button>
        <button type="button" onClick={()=>setWh(value=>value+watts/60)}>Advance 60 s</button>
        <button type="button" onClick={()=>setWh(0)}>Reset energy</button>
      </div>
      <div className="gp-steps">
        <button type="button" aria-pressed={online} onClick={()=>setOnline(value=>!value)}>Simulated 2G</button>
        <button type="button" className="gp-button" disabled={!!pending} onClick={()=>{setPending({watts,wh});setNotice('Submitting snapshot');}}>Request SMS</button>
      </div>
      <p className="gp-demo-description" role="status">{notice}</p>
      {message&&<p className="gp-demo-description" aria-label="Last phone message">Atlas bench: {message.watts.toFixed(3)} W, {message.wh.toFixed(5)} Wh.</p>}
      <ol className="gp-demo-labels">{parts.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{parts[selected][1]}</p>
    </div>
  </div>;
}
