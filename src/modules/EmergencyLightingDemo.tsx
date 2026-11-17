import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { emergencyLighting, lightLimits } from '../data/emergency-lighting';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
function Block({at,size,color}:{at:Point;size:Point;color:string}) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.15} smoothness={2}>
    <meshStandardMaterial color={color} roughness={.67}/>
  </RoundedBox>;
}

function Lamp({color,lit=false}:{color:string;lit?:boolean}) {
  return <>
    {[-.035,.035].map(x=><Block key={x} at={[x,-.027,0]} size={[.017,.13,.017]} color="#aab8bd"/>)}
    <mesh position={[0,.077,0]}><capsuleGeometry args={[.074,.075,6,22]}/>
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={lit?2.1:0} roughness={.31}/></mesh>
  </>;
}

export function EmergencyLamps() {
  return <>
    <group position={[-.18,0,0]}><Lamp color="#ff5146" lit/></group>
    <group position={[.18,0,0]}><Lamp color="#fff0cf" lit/></group>
    <mesh position={[0,-.03,.24]} rotation={[0,0,Math.PI/2]}>
      <cylinderGeometry args={[.042,.042,.20,23]}/><meshStandardMaterial color="#c9a682"/></mesh>
    <Block at={[0,-.03,.24]} size={[.36,.014,.014]} color="#aab8bd"/>
  </>;
}

function SensorHead() {
  return <>
    <Block at={[0,0,0]} size={[.26,.065,.19]} color="#98785b"/>
    <Line points={[[-.081,.037,-.052],[-.081,.037,.047],[-.037,.037,.047],[-.037,.037,-.049],[.01,.037,-.049],[.01,.037,.047],[.057,.037,.047],[.057,.037,-.049],[.090,.037,-.049]]}
      color="#6c3f28" lineWidth={1.5}/>
  </>;
}

const anchors:Point[]=[[-1.41,.36,1.17],[-1.89,.71,-.78],[-.69,.40,1.08],[.20,.59,-.62],
  [.23,.43,1.10],[.95,.37,1.16],[.30,.33,1.11]];
const labels:Point[]=[[-1.48,.94,1.34],[-2.10,1.36,-.72],[-.71,.91,1.30],[.31,1.02,-.29],
  [.28,.95,1.55],[1.01,.81,1.43],[.49,.77,1.14]];

function Corridor({brightness,path,alarm,pulse,selected,select}:{
  brightness:number;path:boolean;alarm:boolean;pulse:boolean;selected:number;select:(index:number)=>void;
}) {
  return <>
    <ambientLight intensity={.44+brightness*.013}/>
    <directionalLight position={[2,5,4]} intensity={.47+brightness*.021}/>
    <Block at={[0,-.10,0]} size={[6.65,.19,3.82]} color="#485e6d"/>
    <Block at={[0,.032,-.47]} size={[5.95,.08,1.50]} color="#969e97"/>
    <Block at={[0,.81,-1.23]} size={[5.96,1.53,.13]} color="#788e96"/>
    <Block at={[2.92,.79,-.50]} size={[.125,1.53,1.48]} color="#6d848d"/>
    <Block at={[2.82,.65,-.50]} size={[.047,1.268,.68]} color="#496367"/>
    <Block at={[2.779,.58,-.26]} size={[.036,.037,.090]} color="#d0c99d"/>
    {[-2.55,-1.77,-.98,-.19,.60,1.39,2.18].map(x=><Block key={x} at={[x,.076,-.48]} size={[.74,.009,.018]} color="#798885"/>)}
    {[-1.29,0,1.29].map(x=><group key={x} position={[x,.40,-1.11]}>
      <Block at={[0,-.011,-.055]} size={[.26,.21,.074]} color="#394f5b"/>
      <Block at={[0,.01,.008]} size={[.19,.055,.082]} color="#a0a6a0"/>
      <group position={[0,.063,.060]}><Lamp color={path?'#fff1cc':'#acafa5'} lit={path}/></group>
      {path&&<pointLight position={[0,.085,.25]} color="#ffe7a5" intensity={1.39} distance={2.05}/>}
    </group>)}
    <Block at={[-2.64,.96,-1.10]} size={[.22,.21,.12]} color="#374953"/>
    <group position={[-2.64,1.04,-1.025]}><Lamp color={alarm?'#ff6557':'#aa4442'} lit={pulse}/></group>
    {pulse&&<pointLight position={[-2.64,1.12,-.91]} intensity={1.62} distance={1.5} color="#ff5b4f"/>}
    <Block at={[-1.85,.42,-.77]} size={[.066,.63,.072]} color="#687d83"/>
    <group position={[-1.85,.75,-.77]}><SensorHead/></group>
    {[-.59,.47,1.53].map(x=><Line key={x} points={[[x-.23,.079,-.42],[x+.18,.079,-.42],[x+.07,.079,-.52],[x+.18,.079,-.42],[x+.07,.079,-.32]]}
      color={path?'#fff1c0':'#a4b1a8'} lineWidth={2.2}/>)}
    <Block at={[-.16,.128,1.07]} size={[3.45,.24,1.08]} color="#283e4b"/>
    <Block at={[-1.27,.31,1.09]} size={[.81,.088,.59]} color="#245f8c"/>
    <Block at={[-1.41,.37,1.08]} size={[.167,.038,.165]} color="#212830"/>
    <Block at={[-.97,.355,1.083]} size={[.131,.064,.161]} color="#a5b7bd"/>
    <Block at={[.38,.305,1.08]} size={[1.31,.098,.58]} color="#dfddce"/>
    {[-.02,.38].map((x,index)=><group key={x} position={[x,.39,1.11]}>
      <Block at={[0,0,0]} size={[.19,.068,.19]} color="#303b41"/>
      <mesh position={[0,.042,0]}><cylinderGeometry args={[.064,.064,.044,19]}/>
        <meshStandardMaterial color={index===0?'#b8443e':'#4c8e7c'}/></mesh>
    </group>)}
    <mesh position={[.93,.393,1.14]}><cylinderGeometry args={[.114,.114,.108,24]}/>
      <meshStandardMaterial color="#2a3034"/></mesh>
    <Line points={[[-.95,.37,1.03],[-.57,.44,1.03],[-.41,.36,1.12]]} color="#dcab6d" lineWidth={2}/>
    <Line points={[[.10,.34,1.17],[.31,.31,.48],[.18,.12,-.08],[-.01,.43,-1.06]]} color="#96c5cd" lineWidth={1.6}/>
    <WorldLabel position={[-2.58,1.54,-.92]} className="gp-marker-anchor"><span className="gp-rocket-field-label">{alarm?'Alarm latched':'Beacon standby'}</span></WorldLabel>
    <WorldLabel position={[2.83,1.31,-.43]} className="gp-marker-anchor"><span className="gp-rocket-field-label">Model exit</span></WorldLabel>
    {Array.from(new Set([1,3,selected])).map(index=><group key={index}>
      <Line points={[anchors[index],labels[index]]} color={index===selected?'#ffe59e':'#b9d6db'} lineWidth={1.25}/>
      <WorldLabel position={labels[index]} className="gp-marker-anchor">
        <button className="gp-marker" type="button" aria-label={emergencyLighting.parts[index][0]} aria-pressed={index===selected}
          onClick={()=>select(index)}>{index+1}</button>
      </WorldLabel>
    </group>)}
    <ContactShadows position={[0,-.018,0]} scale={7} opacity={.37} blur={2.5} far={4}/>
  </>;
}

export default function EmergencyLightingDemo() {
  const [light,setLight]=useState({brightness:72,dark:false});
  const [alarm,setAlarm]=useState({held:false,latched:false});
  const [pulse,setPulse]=useState(false);
  const [sound,setSound]=useState(false);
  const [selected,setSelected]=useState(3);
  const context=useRef<AudioContext|null>(null);
  const pulsing=alarm.latched&&pulse;
  const path=alarm.latched||light.dark;
  useEffect(()=>{
    if(!alarm.latched) return;
    const timer=window.setInterval(()=>setPulse(value=>!value),lightLimits.pulseMs);
    return ()=>window.clearInterval(timer);
  },[alarm.latched]);
  useEffect(()=>{
    const audio=context.current;
    if(!pulsing||!sound||audio?.state!=='running') return;
    const tone=audio.createOscillator();
    const gain=audio.createGain();
    tone.frequency.value=1250;
    gain.gain.value=.027;
    tone.connect(gain);
    gain.connect(audio.destination);
    tone.start();
    return ()=>{tone.stop();tone.disconnect();gain.disconnect();};
  },[pulsing,sound]);
  useEffect(()=>()=>{if(context.current)void context.current.close();},[]);
  async function toggleSound() {
    if(sound){setSound(false);return;}
    try {
      context.current??=new AudioContext();
      await context.current.resume();
      setSound(true);
    } catch { setSound(false); }
  }
  function setBrightness(brightness:number) {
    setLight(previous=>({brightness,dark:brightness<=lightLimits.darkOn||(brightness<lightLimits.brightOff&&previous.dark)}));
  }
  function toggleAlarm() {
    if(alarm.held){setAlarm({held:false,latched:true});return;}
    if(!alarm.latched)setPulse(true);
    setAlarm({held:true,latched:true});
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive emergency lighting corridor">
        <Canvas dpr={[1,1.5]} camera={{position:[4.4,4.4,6.72],fov:44}} fallback={<p>The lighting controls remain available without WebGL.</p>}>
          <color attach="background" args={['#243b49']}/>
          <Corridor brightness={light.brightness} path={path} alarm={alarm.latched} pulse={pulsing} selected={selected} select={setSelected}/>
          <OrbitControls target={[0,.59,.04]} enablePan={false} minDistance={4} maxDistance={15}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Simulated lighting outputs">
        <div><span>Brightness index</span><strong>{light.brightness}%</strong></div>
        <div><span>White path lights</span><strong>{path?'On':'Off'}</strong></div>
        <div><span>Beacon and piezo</span><strong>{alarm.latched?'Pulsing':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Test the corridor</h3>
      <p>Lower the light index to 30% to turn on the path. Raise it to 42% to switch off again. Press Alarm to turn on the path lights and pulse the beacon at any brightness.</p>
      <label htmlFor="gp-emergency-brightness">Ambient brightness · {light.brightness}%</label>
      <input id="gp-emergency-brightness" className="gp-lidar-range" type="range" min={0} max={100} value={light.brightness}
        onChange={event=>setBrightness(Number(event.target.value))}/>
      <div className="gp-steps" role="group" aria-label="Ambient brightness presets">
        {[20,30,35,42,72].map(value=><button type="button" key={value} aria-pressed={value===light.brightness}
          onClick={()=>setBrightness(value)}>{value}%</button>)}
      </div>
      <div className="gp-steps">
        <button className="gp-button" type="button" aria-pressed={alarm.held} onClick={toggleAlarm}>{alarm.held?'Release Alarm':'Press Alarm'}</button>
        <button type="button" disabled={!alarm.latched||alarm.held} onClick={()=>setAlarm({held:false,latched:false})}>Reset alarm</button>
        <button type="button" aria-pressed={sound} onClick={()=>void toggleSound()}>{sound?'Mute sound':'Enable sound'}</button>
      </div>
      <p className="gp-check" role="status">{alarm.latched ? alarm.held?'Alarm latched · release the button before resetting.':'Alarm latched · reset when ready.'
        : light.dark?'Night lighting · white path lights on.':'Standby · path and warning outputs off.'}</p>
      <h4>Inspect the circuit</h4>
      <ol className="gp-demo-labels">{emergencyLighting.parts.map(([name],index)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{emergencyLighting.parts[selected][2]}</p>
    </div>
  </div>;
}
