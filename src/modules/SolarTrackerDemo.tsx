import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { trackSun, tracker, trackerReadings, trackerWeather, type Pose } from '../data/solar-tracker';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { LightQuadrants, TrackerPanel, TrackerServo } from './SolarTrackerParts';

type Point=[number,number,number];
const midpoint:Pose={yaw:0,tilt:0};
const parts=[
  ['Quadrant sensor head','Four CdS dividers share a cross-shaped shade. Left/right and top/bottom differences tell the Uno which way to move.'],
  ['Solar panel','The panel rides on the gimbal. Its insulated output is separate from the tracker electronics.'],
  ['Pan servo · D9','This base motor rotates the entire upper assembly sideways.'],
  ['Tilt servo · D10','This motor changes the angle of the carrier and its sensor head.'],
  ['Weather sensor · I²C','The SHT31-D reports temperature and relative humidity. Its readings are separate from the light-based steering loop.'],
] as const;
const angle=(n:number)=>MathUtils.degToRad(n);
function Marker({i,at,selected,select}:{i:number;at:Point;selected:number;select:(index:number)=>void}){
  return <WorldLabel position={at} className="gp-marker-anchor">
    <button type="button" className="gp-marker" aria-label={parts[i][0]} aria-pressed={i===selected} onClick={()=>select(i)}>{i+1}{i===selected&&<span className="gp-demo-marker-name">{parts[i][0]}</span>}</button>
  </WorldLabel>;
}

function Bench({pose,sun,brightness,selected,select,values}:{pose:Pose;sun:Pose;brightness:number;selected:number;select:(index:number)=>void;values:number[]}){
  const pan=useRef<Group>(null);
  const tilt=useRef<Group>(null);
  useFrame((_,dt)=>{
    if(pan.current)pan.current.rotation.y=MathUtils.damp(pan.current.rotation.y,angle(pose.yaw),12,dt);
    if(tilt.current)tilt.current.rotation.x=MathUtils.damp(tilt.current.rotation.x,angle(53-pose.tilt),12,dt);
  });
  const light:Point=[
    -.68+2.9*Math.sin(angle(sun.yaw)),
    2.03+2.28*Math.sin(angle(sun.tilt+18)),
    2.7*Math.cos(angle(sun.yaw)),
  ];
  const lightColor=brightness>20?'#ffcf78':'#909bad';
  return <>
    <color attach="background" args={['#263448']}/>
    <hemisphereLight args={['#e1edff','#685238',2.35]}/>
    <directionalLight position={[-4,7,4]} intensity={1.8}/>
    <pointLight position={light} color="#ffdd9a" intensity={brightness*.32} distance={7}/>
    <mesh position={light}><sphereGeometry args={[.13,24,20]}/><meshBasicMaterial color={lightColor}/></mesh>
    {[-.18,.18].map(x=><Line key={x} points={[[light[0]+x,light[1]-.06,light[2]-.10],[light[0]+x*.7,light[1]-.29,light[2]-.56]]} color={lightColor} transparent opacity={brightness*.009} lineWidth={2}/>)}
    <Box at={[0,-.16,0]} size={[6.3,.29,4.32]} color="#8b735d"/>
    <Box at={[0,.001,0]} size={[5.96,.058,4.02]} color="#40566a"/>
    {[-.94,.28].map(x=><Box key={x} at={[x,.085,0]} size={[.07,.11,1.32]} color="#777e84" metal={.52}/>)}
    <group position={[-.68,.12,.04]}>
      <Box at={[0,.02,0]} size={[1.47,.12,1.23]} color="#2b323b"/>
      <group onClick={()=>select(2)}><TrackerServo at={[-.19,.27,0]} selected={selected===2}/></group>
      <Marker i={2} at={[-.34,.56,.38]} {...{selected,select}}/>
      <group ref={pan} position={[0,.55,0]}>
        <Box at={[0,0,0]} size={[1.94,.12,.87]} color="#2b3540"/>
        {[-.89,.89].map(x=><Box key={x} at={[x,.44,0]} size={[.122,.805,.30]} color="#34414c"/>)}
        <group onClick={()=>select(3)}><TrackerServo at={[1.12,.78,0]} selected={selected===3} vertical/></group>
        <Marker i={3} at={[1.16,.92,.20]} {...{selected,select}}/>
        <Box at={[.96,.83,0]} size={[.31,.095,.11]} color="#a9afb7" metal={.64}/>
        <group ref={tilt} position={[0,.83,0]} rotation={[angle(53),0,0]}>
          <Box at={[0,-.11,0]} size={[1.55,.123,1.53]} color="#947052"/>
          <group onClick={()=>select(1)}><TrackerPanel light={brightness} selected={selected===1}/></group>
          <Marker i={1} at={[-.59,.22,.27]} {...{selected,select}}/>
          <group position={[.04,.115,-.85]} scale={.72} onClick={()=>select(0)}><LightQuadrants {...{values}} selected={selected===0}/></group>
          <Marker i={0} at={[.07,.31,-.86]} {...{selected,select}}/>
          {['#4c8baa','#d0735d','#d3ba6b','#52a987'].map((color,i)=><Line key={color} points={[[.18+.071*i,.118,-.74],[.53+.042*i,-.049,-.42],[.52+.050*i,-.115,-.08]]} color={color} lineWidth={2.1}/>)}
        </group>
        <Line points={[[1.13,.67,.06],[.69,.38,-.24],[.54,.08,-.49],[.31,-.13,-.58]]} color="#df9455" lineWidth={3}/>
      </group>
    </group>
    <group position={[1.60,.07,-.47]} scale={1.5}><Uno at={[0,0,0]}/></group>
    <Box at={[.68,.11,-1.24]} size={[1.52,.13,.51]} color="#e3e5e1"/>
    {Array.from({length:10},(_,i)=><Box key={i} at={[.015+i*.135,.186,-1.24]} size={[.036,.012,.039]} color="#75818a"/>)}
    <group position={[1.40,.09,.79]} onClick={()=>select(4)}>
      <Box at={[0,0,0]} size={[.59,.065,.42]} color={selected===4?'#d2ac54':'#284c8d'}/>
      <Box at={[0,.047,.01]} size={[.14,.035,.105]} color="#282d30"/>
      {[-.18,-.062,.062,.18].map(x=><Box key={x} at={[x,.041,-.14]} size={[.05,.027,.055]} color="#d4b678" metal={.57}/>)}
    </group>
    <Marker i={4} at={[1.40,.26,.92]} {...{selected,select}}/>
    {['#cc6656','#242a31','#6ab1ce','#66aa79'].map((color,i)=><Line key={color} points={[[1.22+i*.12,.13,.64],[1.27+i*.12,.12,.33],[1.32+i*.12,.32,-.095]]} color={color} lineWidth={2.8}/>)}
    <Line points={[[-.25,.58,-.53],[-.12,.22,-.80],[.28,.18,-1.22],[1.31,.325,-.83]]} color="#db965c" lineWidth={3.5}/>
    <Line points={[[.85,.32,-.69],[.79,.18,-.44],[2.45,.14,.38],[3.05,.17,.6]]} color="#b3bfca" lineWidth={4.6}/>
  </>;
}

export default function SolarTrackerDemo(){
  const [sun,setSun]=useState<Pose>({yaw:22,tilt:14});
  const [pose,setPose]=useState<Pose>(midpoint);
  const [weatherIndex,setWeather]=useState(0);
  const [running,run]=useState(false);
  const [selected,select]=useState(0);
  const weather=trackerWeather[weatherIndex];
  const reading=trackerReadings(pose,sun,weather.brightness);
  useEffect(()=>{
    if(!running)return;
    const timer=window.setInterval(()=>setPose(value=>trackSun(value,sun,weather.brightness)),tracker.periodMs);
    return ()=>window.clearInterval(timer);
  },[running,sun,weather]);
  const balanced=Math.abs(reading.yawError)<=tracker.deadband&&Math.abs(reading.tiltError)<=tracker.deadband;
  const status=!running?'Paused':reading.level<tracker.dark?'Dim light · Holding position':balanced?'Light balanced':'Tracking the brighter side';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D dual-axis solar tracker">
        <Canvas camera={{position:[4.8,5.7,7.5],fov:43}} dpr={[1,1.6]} fallback={<p>Use the angle readouts to observe the tracker.</p>}>
          <Bench {...{pose,sun,selected,select}} values={reading.values} brightness={weather.brightness}/>
          <OrbitControls target={[0,.82,.14]} minDistance={5.1} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Tracker readings">
        <div><span>Pan offset</span><strong>{pose.yaw}°</strong></div>
        <div><span>Tilt offset</span><strong>{pose.tilt}°</strong></div>
        <div><span>Temperature</span><strong>{weather.temp} °C</strong></div>
        <div><span>Humidity</span><strong>{weather.humidity}% RH</strong></div>
      </div>
      <div className="gp-demo-result" aria-label="Light sensor counts">
        {['Top left','Top right','Bottom left','Bottom right'].map((label,i)=><div key={label}><span>{label}</span><strong>{reading.values[i]}</strong></div>)}
      </div>
    </div>
    <div className="gp-guide">
      <h3>Move the lamp and compare the sensors</h3>
      <p>Start tracking and move the lamp sideways or vertically. Compare the counts as the panel turns. Switch to dim light and see whether it still moves.</p>
      <label className="gp-solar-light">Lamp side · {sun.yaw}° <input type="range" min="-45" max="45" step="1" value={sun.yaw} onChange={event=>setSun({...sun,yaw:Number(event.target.value)})}/></label>
      <label className="gp-solar-light">Lamp height offset · {sun.tilt}° <input type="range" min="-35" max="35" step="1" value={sun.tilt} onChange={event=>setSun({...sun,tilt:Number(event.target.value)})}/></label>
      <div className="gp-steps" role="group" aria-label="Simulated weather">
        {trackerWeather.map((value,i)=><button key={value.name} type="button" aria-pressed={weatherIndex===i} onClick={()=>setWeather(i)}>{value.name}</button>)}
      </div>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>run(value=>!value)}>{running?'Pause tracking':'Start tracking'}</button>
        <button type="button" onClick={()=>{run(false);setPose(midpoint);}}>Center both axes</button>
      </div>
      <p role="status" className="gp-demo-description">{status}</p>
      <ol className="gp-demo-labels">{parts.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{parts[selected][1]}</p>
    </div>
  </div>;
}
