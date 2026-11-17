import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { lineSamples, lineStart, lineStep, trackZ } from '../data/line-follower';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { ReflectanceArray } from './LineFollowerParts';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point = [number, number, number];
type Mode = 'parked' | 'patrol' | 'help';
const labels = [
  ['Route sensors','Three analog channels connect to A0–A2. A stronger reading on one side slows the wheel on that side to steer back toward the tape.'],
  ['Wheel driver','The Uno varies left and right PWM on D5 and D6. A help request pulls standby low on D12 and removes drive from both motors.'],
  ['Light sensor','The voltage divider feeds A3. The rover can start below 320 and parks again at 420 or above.'],
  ['Call button','Pressing CALL pulls D2 low. The controller stops the wheels and latches the local help alert until the operator acknowledges it.'],
  ['Alert beacon and piezo','The red LED on D3 and piezo on A4 pulse together. The operator uses the RESET switch on D10 to clear the alert.'],
] as const;
const anchors: Point[] = [[.72,.26,-.14],[-.34,.38,.34],[-.37,.61,-.30],[.17,.61,.33],[-.72,.71,.10]];

function PatrolScene({pose, mode, flash, night, gap, wheelTurn, selected, select}: {
  pose: typeof lineStart; mode: Mode; flash: boolean; night: boolean; gap: boolean;
  wheelTurn: number; selected: number; select: (part: number)=>void;
}){
  return <>
    <color attach="background" args={[night?'#202a3e':'#53697a']}/>
    <hemisphereLight args={['#d6eaff','#706050',night?1.7:2.6]}/>
    <directionalLight position={[-3,7,4]} intensity={night?2.1:2.7}/>
    <Box at={[0,-.15,0]} size={[6.65,.28,3.7]} color="#53636c"/>
    <Box at={[0,.009,0]} size={[6.3,.034,2.73]} color={night?'#a0a59d':'#bec5b6'}/>
    {[-1.26,1.26].map(z=><Box key={z} at={[0,.034,z]} size={[6.16,.018,.037]} color="#f2cc81"/>)}
    {Array.from({length:32},(_,i)=>i*.169-2.72).map(x=>gap&&x>.50&&x<1.02?null:
      <Line key={x} points={[[x,.044,trackZ(x,true)],[x+.173,.044,trackZ(x+.173,true)]]} color="#202327" lineWidth={7}/>)}
    <group position={[.23,.04,-1.02]}>
      <Box at={[0,.025,0]} size={[.8,.05,.33]} color="#607a84"/>
      <Box at={[-.28,.32,0]} size={[.052,.59,.062]} color="#8e9a9d" metal={.52}/>
      <Box at={[0,.59,0]} size={[.67,.24,.061]} color="#164e66"/>
      <WorldLabel position={[0,.63,.045]} className="gp-night-station-anchor"><span className="gp-night-station">HELP POINT</span></WorldLabel>
    </group>
    {[-2.56,2.53].map(x=><group key={x} position={[x,0,-1.52]}>
      <Box at={[0,.47,0]} size={[.064,.92,.068]} color="#88949c" metal={.6}/>
      <Box at={[0,.92,.085]} size={[.16,.075,.31]} color="#5a626b"/>
      <Box at={[0,.881,.12]} size={[.13,.015,.2]} color="#ffe3a0"/>
      <pointLight position={[0,.82,.14]} distance={2.3} color="#ffdd9e" intensity={night?12:0}/>
    </group>)}
    <group position={[pose.x,.04,pose.z]} rotation={[0,-pose.heading,0]}>
      <Box at={[0,.19,0]} size={[1.13,.077,.65]} color="#4f5964" metal={.55}/>
      <Box at={[.04,.31,0]} size={[.96,.069,.61]} color="#a99868" metal={.44}/>
      {[-.425,.425].map(z=><group key={z} position={[.08,.185,z]} rotation={[0,0,wheelTurn]}>
        <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.181,.181,.125,30]}/><meshStandardMaterial color="#212428" roughness={.86}/></mesh>
        <mesh position={[0,0,Math.sign(z)*.066]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.117,.117,.02,24]}/><meshStandardMaterial color={selected===1?'#ffcb78':'#b6a175'} metalness={.45}/></mesh>
        {Array.from({length:6},(_,i)=><Box key={i} at={[.075*Math.cos(i*Math.PI/3),.075*Math.sin(i*Math.PI/3),Math.sign(z)*.079]} size={[.036,.036,.015]} color="#3f4345"/>)}
      </group>)}
      <mesh position={[-.44,.105,0]}><sphereGeometry args={[.095,18,16]}/><meshStandardMaterial color="#737d84" metalness={.55}/></mesh>
      <group position={[.60,.135,0]} rotation={[Math.PI,0,-Math.PI/2]} scale={.84} onClick={()=>select(0)}><ReflectanceArray selected={selected===0}/></group>
      <group position={[-.15,.365,-.10]} scale={.85}><Uno at={[0,0,0]}/></group>
      <group onClick={()=>select(1)}>
        <Box at={[-.22,.405,.21]} size={[.26,.036,.18]} color={selected===1?'#ffd38b':'#584784'}/>
        <Box at={[-.22,.435,.21]} size={[.10,.02,.072]} color="#272b34"/>
        <Line points={[[-.22,.43,.23],[-.32,.36,.34],[.08,.20,.40]]} color="#dd7668" lineWidth={2.4}/>
      </group>
      <group onClick={()=>select(2)}>
        <mesh position={[-.41,.491,-.20]}><cylinderGeometry args={[.06,.06,.026,24]}/><meshStandardMaterial color={selected===2?'#fff0b4':'#a0774f'} metalness={.33}/></mesh>
        <Line points={[[-.46,.501,-.22],[-.43,.501,-.19],[-.40,.501,-.23],[-.37,.501,-.20]]} color="#53463b" lineWidth={1.5}/>
      </group>
      <group onClick={()=>select(3)}>
        <Box at={[.22,.38,.22]} size={[.15,.052,.15]} color="#232b34"/>
        <mesh position={[.22,.434,.22]}><cylinderGeometry args={[.056,.056,.062,24]}/><meshStandardMaterial color={selected===3?'#ffbf86':'#b44736'}/></mesh>
      </group>
      <group onClick={()=>select(4)}>
        <Box at={[.23,.377,-.234]} size={[.13,.047,.13]} color="#232b34"/>
        <mesh position={[.23,.421,-.234]}><cylinderGeometry args={[.046,.046,.050,20]}/><meshStandardMaterial color={selected===4?'#aba3ee':'#5865a8'}/></mesh>
        <Line points={[[.24,.38,-.23],[.32,.36,-.05],[.12,.43,.02]]} color="#8b8fd0" lineWidth={1.8}/>
        <Box at={[-.497,.40,.06]} size={[.135,.105,.18]} color={selected===4?'#ffc16a':'#363e49'}/>
        <mesh position={[-.497,.512,.06]}><sphereGeometry args={[.071,22,16]}/><meshStandardMaterial color="#cb4939" emissive="#ff3a19" emissiveIntensity={flash?5:0}/></mesh>
        <mesh position={[-.48,.39,-.15]}><cylinderGeometry args={[.066,.066,.065,24]}/><meshStandardMaterial color="#27292b"/></mesh>
      </group>
      <mesh position={[.44,.392,.16]}><sphereGeometry args={[.037,16,12]}/><meshStandardMaterial color="#488e66" emissive="#59f59d" emissiveIntensity={mode==='patrol'?3:0}/></mesh>
      {flash&&<pointLight position={[-.50,.57,.06]} color="#ff5539" distance={1.9} intensity={7}/>}
      {anchors.map((at,i)=><WorldLabel key={i} position={at} className="gp-marker-anchor">
        <button className="gp-marker" type="button" aria-label={labels[i][0]} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{labels[i][0]}</span>}</button>
      </WorldLabel>)}
    </group>
  </>;
}

export default function NightPatrolDemo(){
  const [night,setNight]=useState(true);
  const [gap,setGap]=useState(false);
  const [mode,setMode]=useState<Mode>('parked');
  const [pose,setPose]=useState(lineStart);
  const [wheelTurn,setWheelTurn]=useState(0);
  const [flash,setFlash]=useState(false);
  const [selected,select]=useState(0);
  const [sound,setSound]=useState(false);
  const audio=useRef<AudioContext|null>(null);
  const [message,setMessage]=useState('Parked at the route start');
  useEffect(()=>{
    if(mode!=='patrol')return;
    const timer=window.setTimeout(()=>{
      const step=lineStep(pose,true,gap);
      setPose(step.pose);
      if(step.state==='running')setWheelTurn(value=>value-.17);
      else {
        setMode('parked');
        setMessage(step.state==='lost'?'Tape lost · Drive disabled':'Route complete · Rover parked');
      }
    },45);
    return ()=>window.clearTimeout(timer);
  },[mode,pose,gap]);
  useEffect(()=>{
    if(mode!=='help')return;
    const timer=window.setInterval(()=>setFlash(value=>!value),250);
    return ()=>window.clearInterval(timer);
  },[mode]);
  useEffect(()=>{
    const context=audio.current;
    if(!sound||!flash||mode!=='help'||!context||context.state==='closed')return;
    const tone=context.createOscillator();
    const gain=context.createGain();
    tone.frequency.value=1800;
    gain.gain.value=.045;
    tone.connect(gain).connect(context.destination);
    tone.start();
    return ()=>{tone.stop();tone.disconnect();gain.disconnect();};
  },[sound,flash,mode]);
  useEffect(()=>()=>{if(audio.current)void audio.current.close();},[]);
  async function toggleSound(){
    if(sound){setSound(false);return;}
    try{
      audio.current ??= new AudioContext();
      await audio.current.resume();
      setSound(true);
    }catch{
      setSound(false);
    }
  }
  function toggleLighting(){
    setNight(!night);
    if(night&&mode==='patrol'){
      setMode('parked');
      setMessage('Bright light · Rover parked');
    }
  }
  function start(){
    if(!night){setMessage('Bright light · Start inhibited');return;}
    if(pose.x>=2.35||Math.max(...lineSamples(pose,true,gap))<.22){
      setMessage('Place rover back at the route start');return;
    }
    setMode('patrol');
    setMessage('Patrolling · Following the tape');
  }
  function call(){
    setMode('help');
    setFlash(true);
    setMessage('Help requested · Wheels stopped · Beacon and tone pulsing');
  }
  function acknowledge(){
    setMode('parked');
    setFlash(false);
    setMessage('Help acknowledged · Rover remains parked');
  }
  function reset(){
    setMode('parked');setPose(lineStart);setWheelTurn(0);
    setMessage('Parked at the route start');
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D night patrol route">
        <Canvas camera={{position:[1.5,4.7,6.8],fov:44}} dpr={[1,1.6]} fallback={<p>Use the controls and readouts to run the night patrol drill.</p>}>
          <PatrolScene {...{pose,mode,night,gap,wheelTurn,selected,select}} flash={mode==='help'&&flash}/>
          <OrbitControls target={[0,.22,0]} minDistance={3.8} maxDistance={14} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Night patrol readings">
        <div><span>Ambient light</span><strong>{night?'185':'650'} ADC</strong></div>
        <div><span>Drive</span><strong>{mode==='patrol'?'Enabled':'Off'}</strong></div>
        <div><span>Local alert</span><strong>{mode==='help'?'Active':'Clear'}</strong><small>{mode==='help'?(flash?'Pulse on':'Pulse off'):null}</small></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Run a help-point drill</h3>
      <p>Start in dim light and watch the rover follow its tape route. Press Call for help to stop the wheels. Acknowledge it as the operator, then start again.</p>
      <div className="gp-steps" role="group" aria-label="Route conditions">
        <button type="button" aria-pressed={night} onClick={toggleLighting}>Dim route</button>
        <button type="button" aria-pressed={gap} onClick={()=>setGap(!gap)}>Remove tape segment</button>
        <button type="button" aria-pressed={sound} onClick={()=>void toggleSound()}>Alert sound</button>
      </div>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={mode!=='parked'} onClick={start}>Start patrol</button>
        <button type="button" disabled={mode==='help'} onClick={call}>Call for help</button>
        <button type="button" disabled={mode!=='help'} onClick={acknowledge}>Acknowledge alert</button>
        <button type="button" disabled={mode==='help'} onClick={reset}>Back to start</button>
      </div>
      <p role="status" className="gp-demo-description">{message}</p>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
