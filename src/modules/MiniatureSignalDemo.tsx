import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls } from '@react-three/drei';
import { WorldLabel } from './LabWorkbench';
import { SolarMeterSolid as Box } from './SolarMeterParts';

type Point = [number, number, number];
const phases = [
  {name:'Red', color:'#ff4c36', pin:'D8', duration:3000, message:'Stop before the line.'},
  {name:'Green', color:'#52ef70', pin:'D10', duration:3000, message:'The model roadway has permission to move.'},
  {name:'Amber', color:'#ffbc3a', pin:'D9', duration:1000, message:'The green phase is ending. Red comes next.'},
];
const parts: {name:string; at:Point; description:string}[] = [
  {name:'Arduino Uno', at:[-1.3,.52,.64], description:'The timer selects just one output. The previous output goes low before the next goes high.'},
  {name:'Series resistors', at:[-.43,.52,.75], description:'Each output goes through its own 330 Ω resistor. The three LED cathodes share the ground return.'},
  {name:'Signal head', at:[.43,1.73,-.32], description:'Red is on top, amber in the middle and green at the bottom. Each lens sits directly in front of its LED.'},
  {name:'Stop line', at:[.94,.13,.56], description:'This white line marks where a vehicle waits during red. Watch the signal change from red to green and then amber.'},
];
const heights = [1.48,.94,1.21];

function SignalBench({phase, selected, select}:{phase:number; selected:number; select:(part:number)=>void}) {
  return <>
    <color attach="background" args={['#293b4b']}/>
    <hemisphereLight args={['#e4efff','#776b60',2.05]}/>
    <directionalLight position={[-3,6,4]} intensity={2.2} color="#fff0db"/>
    <Box at={[0,-.1,0]} size={[5,.2,3.2]} color="#6d7381"/>
    <Box at={[1.25,.02,0]} size={[2.22,.04,3.06]} color="#414855"/>
    <Box at={[.24,.065,0]} size={[.20,.13,3.06]} color="#b1b4b0"/>
    {Array.from({length:6},(_,i)=><Box key={i} at={[1.46,.048,-1.3+i*.46]} size={[.037,.009,.23]} color="#ddb064"/>)}
    <group onClick={()=>select(3)}>
      <Box at={[.92,.052,.56]} size={[.96,.012,.067]} color={selected===3?'#ffca77':'#eef0e5'}/>
      {Array.from({length:5},(_,i)=><Box key={i} at={[.51+i*.20,.054,.15]} size={[.097,.013,.35]} color="#d7ddda"/>)}
    </group>
    <group position={[-1.43,.15,.6]} onClick={()=>select(0)}>
      <Box at={[0,0,0]} size={[.99,.078,.72]} color={selected===0?'#c18851':'#186786'}/>
      <Box at={[-.32,.083,.10]} size={[.19,.105,.17]} color="#a6b3be" metal={.74}/>
      <Box at={[-.44,.084,.1]} size={[.16,.086,.13]} color="#303843"/>
      <Line points={[[-.52,.083,.1],[-.71,.065,.1],[-.86,.018,.32],[-1.07,-.018,.35]]} color="#2e3944" lineWidth={4}/>
      <Box at={[.04,.073,0]} size={[.35,.066,.14]} color="#202832"/>
      {[-.26,.26].map(z=><group key={z}><Box at={[.07,.065,z]} size={[.67,.07,.074]} color="#252932"/>
        {Array.from({length:9},(_,i)=><Box key={i} at={[-.19+i*.061,.105,z]} size={[.022,.01,.026]} color="#b8a37a" metal={.6}/>)}</group>)}
    </group>
    <Box at={[-.44,.105,.62]} size={[.72,.12,.63]} color="#dedbd0"/>
    {Array.from({length:9},(_,i)=>[-.24,-.14,.14,.24].map(z=><Box key={i+':'+z} at={[-.73+i*.073,.167,.62+z]} size={[.019,.007,.021]} color="#777b7d"/>))}
    <group onClick={()=>select(1)}>
      {phases.map(({name,color},i)=><group key={name} position={[-.43,.206,.46+i*.143]}>
        <Box at={[0,0,0]} size={[.49,.018,.018]} color="#acb2b4" metal={.68}/>
        <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.034,.034,.22,16]}/><meshStandardMaterial color={selected===1?'#fbc47b':'#b9a681'}/></mesh>
        {['#ba6b35','#ba6b35','#684632'].map((band,j)=><Box key={j} at={[-.072+j*.05,.016,0]} size={[.017,.05,.054]} color={band}/>)}
        <Line points={[[-.245,0,0],[-.33,.08,0],[-.51,.03,.4-i*.086]]} color={color} lineWidth={2.5}/>
        <Line points={[[.24,0,0],[.36,.06,-.21],[.49,.024,-.68-i*.04]]} color={color} lineWidth={2.5}/>
      </group>)}
    </group>
    <Line points={[[-1.14,.25,.34],[-.91,.28,.29],[-.28,.16,.25],[.19,.14,-.55]]} color="#252a36" lineWidth={3}/>
    <group onClick={()=>select(2)}>
      <Box at={[.15,.13,-.51]} size={[.48,.12,.46]} color="#4e595d" metal={.4}/>
      <mesh position={[.15,.55,-.51]}><cylinderGeometry args={[.046,.052,.82,20]}/><meshStandardMaterial color="#a1a8a9" metalness={.6} roughness={.43}/></mesh>
      <Box at={[.15,1.25,-.51]} size={[.38,.91,.25]} color={selected===2?'#94613c':'#282d34'}/>
      {phases.map(({name,color},i)=><group key={name} position={[.15,heights[i],-.352]}>
        <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.12,.12,.106,32]}/><meshStandardMaterial color="#151c22"/></mesh>
        <mesh position={[0,0,.066]} scale={[1,1,.36]}><sphereGeometry args={[.086,24,16]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={phase===i?2.7:0} transparent opacity={phase===i?1:.42} roughness={.31}/></mesh>
        {phase===i&&<pointLight position={[0,0,.16]} color={color} intensity={1.3} distance={.65}/>}
      </group>)}
    </group>
    {parts.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.006,0]} opacity={.35} scale={5.4} far={1.6} resolution={128} frames={1}/>
  </>;
}

export default function MiniatureSignalDemo() {
  const [phase,setPhase]=useState(0);
  const [running,setRunning]=useState(false);
  const [selected,select]=useState(2);
  const active=phases[phase];
  useEffect(()=>{
    if(!running) return;
    const timeout=window.setTimeout(()=>setPhase(index=>(index+1)%phases.length),active.duration);
    return ()=>window.clearTimeout(timeout);
  },[running,phase,active.duration]);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D miniature traffic signal">
        <Canvas camera={{position:[2.8,3.1,5.55],fov:42}} dpr={[1,1.6]} fallback={<p>Use the phase controls and readings below.</p>}>
          <SignalBench {...{phase,selected,select}}/>
          <OrbitControls target={[0,.57,0]} enablePan={false} minDistance={3.2} maxDistance={9}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Traffic signal readings">
        <div><span>Active lamp</span><strong>{active.name}</strong></div>
        <div><span>Output HIGH</span><strong>{active.pin}</strong></div>
        <div><span>Phase duration</span><strong>{active.duration/1000} s</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Follow the signal cycle</h3>
      <div className="gp-steps">
        <button className="gp-button" type="button" onClick={()=>setRunning(value=>!value)}>{running?'Pause cycle':'Run cycle'}</button>
        <button type="button" onClick={()=>{setRunning(false);setPhase(index=>(index+1)%phases.length);}}>Next phase</button>
        <button type="button" onClick={()=>{setRunning(false);setPhase(0);}}>Reset to red</button>
      </div>
      <p role="status">{active.name} · {active.message}</p>
      <ol className="gp-demo-labels">{parts.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{parts[selected].description}</p>
    </div>
  </div>;
}
