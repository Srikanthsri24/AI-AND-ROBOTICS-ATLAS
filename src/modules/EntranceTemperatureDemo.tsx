import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { objectThreshold,objectTrials } from '../data/entrance-temperature';
import { InfraredThermometer } from './EntranceTemperatureParts';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Status='idle'|'reading'|'open'|'warm'|'fault';
const labels=[
  ['Presence beam','When a test object reaches the stop, it blocks the beam. The receiver pulls Arduino pin D2 low to start one measurement cycle.'],
  ['IR thermometer','The MLX90614 reads the surface facing it. It sends the temperature to the Uno over I²C on A4 and A5.'],
  ['Model barrier','The servo opens the barrier for a below-threshold classroom reading. Arduino pin D9 sends the position command. A warm or missing reading keeps the barrier closed.'],
  ['Result LEDs','Green shows below threshold. Red shows warm or unavailable. Arduino pins D5 and D6 drive the LEDs through separate resistors. Removing the object clears both.'],
] as const;
const anchors:Point[]=[[-.99,.64,.42],[-1.19,1.24,-.13],[.71,.82,.67],[1.77,.53,-.38]];

function Bench({phase,slot,selected,select}:{phase:Status;slot:number;selected:number;select:(i:number)=>void}){
  const gate=useRef<Group>(null);
  useFrame((_,dt)=>{if(gate.current)gate.current.rotation.x=MathUtils.damp(gate.current.rotation.x,phase==='open'?1.12:0,11,dt);});
  const sample=objectTrials[slot];
  return <>
    <color attach="background" args={['#28364a']}/>
    <hemisphereLight args={['#e0ecff','#6c5a48',2.4]}/>
    <directionalLight position={[-4,7,5]} intensity={2.35}/>
    <Box at={[0,-.12,0]} size={[6.1,.23,4.08]} color="#546a78"/>
    <Box at={[-.61,.048,.33]} size={[3.77,.12,1.37]} color="#a48b72"/>
    <Box at={[-.61,.111,.33]} size={[3.68,.022,1.25]} color="#576f77"/>
    {[-.25,.91].map(z=><Box key={z} at={[-.61,.136,z]} size={[3.57,.05,.051]} color="#a5b4ad"/>)}
    <Box at={[-1.06,.15,.33]} size={[.53,.039,.57]} color="#dbc28e"/>
    <Box at={[-1.11,.16,-.014]} size={[.55,.093,.065]} color="#6e7f83"/>
    {[-.11,.79].map(z=><group key={z} position={[-1.04,0,z]} onClick={()=>select(0)}>
      <Box at={[0,.25,0]} size={[.20,.29,.20]} color={selected===0?'#d4ae65':'#887563'}/>
      <Box at={[0,.422,0]} size={[.18,.138,.15]} color="#283641"/>
    </group>)}
    <Line points={[[-1.04,.42,-.03],[-1.04,.42,phase==='idle'?.71:.18]]} color={phase==='idle'?'#77c9d5':'#e49a6a'} lineWidth={2} dashed dashSize={.055} gapSize={.043}/>
    <Box at={[-1.37,.65,-.35]} size={[.114,1.17,.16]} color="#758790" metal={.47}/>
    <Box at={[-1.22,1.16,-.229]} size={[.36,.09,.21]} color="#758790" metal={.44}/>
    <group position={[-1.05,1.045,-.04]} rotation={[Math.PI,0,0]} onClick={()=>select(1)}>
      <InfraredThermometer selected={selected===1}/>
    </group>
    {phase==='reading'&&<Line points={[[-1.05,.92,-.04],[-1.05,.53,.29]]} color="#efa978" lineWidth={2} dashed dashSize={.06} gapSize={.04}/>}
    {phase!=='idle'&&<group position={[-1.05,.358,.34]}>
      <Box at={[0,0,0]} size={[.35,.42,.36]} color={sample.color}/>
      <Box at={[0,.216,.02]} size={[.31,.023,.30]} color="#decaa3"/>
    </group>}
    <group position={[.69,.16,.84]} onClick={()=>select(2)}>
      <Box at={[0,.16,0]} size={[.27,.41,.23]} color={selected===2?'#e1b962':'#384b57'}/>
      <group ref={gate} position={[0,.32,-.05]} rotation={[0,0,0]}>
        <group rotation={[Math.PI/2,0,0]}>
          <Box at={[0,-.50,0]} size={[.102,1.00,.089]} color="#e3d4ae"/>
          {[.15,.40,.65,.87].map(y=><Box key={y} at={[0,-y,-.047]} size={[.10,.095,.010]} color="#ad5c53"/>)}
        </group>
      </group>
    </group>
    <group position={[1.66,.072,-.68]} scale={1.41}><Uno at={[0,0,0]}/></group>
    <group position={[1.75,.117,.32]} onClick={()=>select(3)}>
      <Box at={[0,0,0]} size={[.76,.14,.49]} color={selected===3?'#dfbc6d':'#e0e3e1'}/>
      {[-.19,.19].map((x,i)=><mesh key={x} position={[x,.157,0]}><sphereGeometry args={[.067,20,16]}/>
        <meshStandardMaterial color={i?'#bf5148':'#6fa68a'} emissive={i?'#eb4d3d':'#5de0a2'} emissiveIntensity={(i?phase==='warm'||phase==='fault':phase==='open')?3.7:0}/></mesh>)}
    </group>
    <Line points={[[-1.37,1.06,-.24],[-1.39,.20,-.53],[-.17,.13,-.71],[1.23,.30,-.35]]} color="#75aec4" lineWidth={3}/>
    <Line points={[[.79,.24,.72],[1.19,.14,.69],[1.44,.12,.28],[1.60,.34,-.32]]} color="#dda466" lineWidth={2.9}/>
    {anchors.map((at,i)=><WorldLabel key={i} position={at} className="gp-marker-anchor">
      <button type="button" className="gp-marker" aria-label={labels[i][0]} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{labels[i][0]}</span>}</button>
    </WorldLabel>)}
  </>;
}

export default function EntranceTemperatureDemo(){
  const [slot,setSlot]=useState(0);
  const [phase,setPhase]=useState<Status>('idle');
  const [selected,select]=useState(0);
  const value=objectTrials[slot].temperature;
  useEffect(()=>{
    if(phase!=='reading')return;
    const timer=window.setTimeout(()=>setPhase(value===null?'fault':value<objectThreshold?'open':'warm'),820);
    return ()=>window.clearTimeout(timer);
  },[phase,value]);
  const text={idle:'Tray clear · Ready',reading:'Object detected · Taking samples',open:'Below threshold · Model gate open',warm:'Warm test object · Gate closed',fault:'Sensor unavailable · Gate closed'}[phase];
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D entrance object temperature station">
        <Canvas camera={{position:[3.4,5.1,7.1],fov:42}} dpr={[1,1.6]} fallback={<p>Use the sample selector and readouts to test the gate.</p>}>
          <Bench {...{phase,slot,selected,select}}/>
          <OrbitControls target={[0,.42,.14]} minDistance={4.7} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Object station readings">
        <div><span>Object reading</span><strong>{phase==='idle'||phase==='reading'?'—':value===null?'Unavailable':`${value.toFixed(1)} °C`}</strong></div>
        <div><span>Classroom threshold</span><strong>{objectThreshold} °C</strong></div>
        <div><span>Gate</span><strong>{phase==='open'?'Open':'Closed'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Test three object readings</h3>
      <p>Place a test object in the tray and wait for the measurement. Remove it before trying the next case.</p>
      <div className="gp-steps" role="group" aria-label="Object test cases">
        {objectTrials.map(({name},i)=><button key={name} type="button" disabled={phase!=='idle'} aria-pressed={slot===i} onClick={()=>setSlot(i)}>{name}</button>)}
      </div>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={phase!=='idle'} onClick={()=>setPhase('reading')}>Place test object</button>
        <button type="button" disabled={phase==='idle'} onClick={()=>setPhase('idle')}>Clear tray</button>
      </div>
      <p role="status" className="gp-demo-description">{text}</p>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
