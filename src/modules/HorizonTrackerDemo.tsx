import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { headings, horizonReading, sweepThreshold } from '../data/horizon-tracker';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { TrackerPanel, TrackerServo } from './SolarTrackerParts';
import { LightHood } from './HorizonTrackerParts';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
const parts=[
  ['Direction hood','The hood shades off-angle light. The Uno logs one averaged count after settling at each heading.'],
  ['Fixed-angle panel','This lightweight panel turns only around the vertical axis. The carrier keeps the panel at the same tilt.'],
  ['Yaw servo · D9','The servo visits headings from −60° to +60°, then returns to the winner or the previous heading in dim light.'],
  ['Arduino Uno','A0 reads the light divider. The Uno compares the sweep samples and remembers the best passing heading.'],
] as const;
const deg=MathUtils.degToRad;
function Marker({i,at,selected,select}:{i:number;at:Point;selected:number;select:(i:number)=>void}){
  return <WorldLabel position={at} className="gp-marker-anchor">
    <button type="button" className="gp-marker" aria-label={parts[i][0]} aria-pressed={i===selected} onClick={()=>select(i)}>{i+1}{i===selected&&<span className="gp-demo-marker-name">{parts[i][0]}</span>}</button>
  </WorldLabel>;
}
function Stage({heading,lamp,brightness,selected,select}:{heading:number;lamp:number;brightness:number;selected:number;select:(i:number)=>void}){
  const carrier=useRef<Group>(null);
  useFrame((_,dt)=>{
    if(carrier.current)carrier.current.rotation.y=MathUtils.damp(carrier.current.rotation.y,deg(heading),15,dt);
  });
  const light:Point=[2.45*Math.sin(deg(lamp)),1.35,2.08*Math.cos(deg(lamp))];
  return <>
    <color attach="background" args={['#263449']}/>
    <hemisphereLight args={['#e1edff','#5f503f',2.45]}/>
    <directionalLight position={[-4,7,5]} intensity={2.26}/>
    <Box at={[0,-.13,.41]} size={[6.28,.23,4.7]} color="#4e6475"/>
    <mesh position={[0,.046,-.22]}><cylinderGeometry args={[1.17,1.20,.12,64]}/><meshStandardMaterial color="#334756" metalness={.28} roughness={.52}/></mesh>
    {headings.map(n=><group key={n} position={[0,.113,-.22]} rotation={[0,deg(n),0]}>
      <Box at={[0,0,1.03]} size={[n%30===0?.03:.016,.014,n%30===0?.21:.16]} color={heading===n?'#edc372':'#c7d1d4'}/>
    </group>)}
    <group position={[0,.12,-.22]} onClick={()=>select(2)}><TrackerServo at={[-.18,.198,0]} selected={selected===2}/></group>
    <Marker i={2} at={[-.68,.38,.53]} {...{selected,select}}/>
    <group ref={carrier} position={[0,.54,-.22]}>
      <Box at={[0,0,0]} size={[1.48,.10,1.15]} color="#a78160"/>
      <Box at={[0,.14,-.18]} size={[1.05,.23,.44]} color="#b18c69"/>
      <group position={[0,.41,.09]} rotation={[deg(36),0,0]} scale={.81} onClick={()=>select(1)}>
        <TrackerPanel light={brightness} selected={selected===1}/>
      </group>
      <Marker i={1} at={[-.45,.78,-.07]} {...{selected,select}}/>
      <group position={[.78,.24,.29]} onClick={()=>select(0)}><LightHood selected={selected===0}/></group>
      <Marker i={0} at={[.87,.50,.41]} {...{selected,select}}/>
      <Line points={[[.79,.21,.13],[.59,.095,-.06],[.28,.067,-.05],[.11,-.08,-.12]]} color="#e6ad64" lineWidth={2.5}/>
    </group>
    <group position={[1.94,.08,-.66]} scale={1.57} onClick={()=>select(3)}><Uno at={[0,0,0]} highlighted={selected===3}/></group>
    <Marker i={3} at={[1.94,.39,-.64]} {...{selected,select}}/>
    <Box at={[1.88,.085,.09]} size={[1.05,.10,.43]} color="#e4e7e9"/>
    {Array.from({length:7},(_,i)=><Box key={i} at={[1.47+i*.137,.139,.18]} size={[.034,.010,.034]} color="#768794"/>)}
    <Line points={[[.08,.19,-.35],[.68,.12,-.37],[1.37,.12,.01],[1.58,.332,-.28]]} color="#deb16c" lineWidth={3}/>
    <Line points={[[1.44,.30,-.30],[1.57,.17,-.05],[1.43,.15,.17]]} color="#5598c5" lineWidth={2.5}/>
    <Line points={[[1.68,.31,-.25],[1.69,.15,-.04],[1.73,.15,.17]]} color="#252e39" lineWidth={2.5}/>
    <group position={light} rotation={[0,deg(lamp),0]}>
      <Box at={[0,-1.24,0]} size={[.43,.13,.40]} color="#414e5b"/>
      <Box at={[0,-.67,.055]} size={[.066,1.07,.069]} color="#7e8b94" metal={.57}/>
      <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.207,.131,.24,28]}/><meshStandardMaterial color="#465871"/></mesh>
      <mesh position={[0,0,-.125]} rotation={[0,Math.PI,0]}><circleGeometry args={[.2,28]}/><meshBasicMaterial color={brightness>20?'#ffe5a1':'#8793a5'}/></mesh>
    </group>
    <pointLight position={[light[0],light[1],light[2]-.15]} color="#ffe2a7" intensity={brightness*.21} distance={7}/>
  </>;
}

type Sample={heading:number;count:number};
type Sweep={heading:number;retained:number;samples:Sample[];phase:'idle'|'scan'|'return';dim:boolean};
const initial:Sweep={heading:0,retained:0,samples:[],phase:'idle',dim:false};
const start=(state:Sweep):Sweep=>({...state,heading:headings[0],samples:[],phase:'scan',dim:false});

export default function HorizonTrackerDemo(){
  const [sweep,setSweep]=useState(initial);
  const [lamp,setLamp]=useState(31);
  const [brightness,setBrightness]=useState(88);
  const [automatic,setAutomatic]=useState(false);
  const [selected,select]=useState(0);
  useEffect(()=>{
    if(sweep.phase==='idle'&&!automatic)return;
    const timer=window.setTimeout(()=>{
      setSweep(previous=>{
        if(previous.phase==='idle')return start(previous);
        if(previous.phase==='return')return {...previous,phase:'idle'};
        const samples=[...previous.samples,{heading:previous.heading,count:horizonReading(previous.heading,lamp,brightness)}];
        if(samples.length<headings.length)return {...previous,samples,heading:headings[samples.length]};
        const best=samples.reduce((a,b)=>b.count>a.count||b.count===a.count&&Math.abs(b.heading-previous.retained)<Math.abs(a.heading-previous.retained)?b:a);
        const dim=best.count<sweepThreshold;
        const retained=dim?previous.retained:best.heading;
        return {samples,heading:retained,retained,phase:'return',dim};
      });
    },sweep.phase==='idle'?25000:300);
    return ()=>window.clearTimeout(timer);
  },[sweep,automatic,lamp,brightness]);
  const last=sweep.samples.at(-1);
  const moving=sweep.phase!=='idle';
  const notice=sweep.phase==='scan'?'Sweeping · Sampling each heading':sweep.phase==='return'?'Returning to retained heading':sweep.dim?'Dim sweep · Previous heading retained':last?'Sweep complete':'Ready to scan';
  const atCenter=sweep.samples.find(sample=>sample.heading===0);
  const peak=sweep.samples.reduce((max,sample)=>Math.max(max,sample.count),0);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D single-axis solar tracker">
        <Canvas camera={{position:[3.7,5.8,7.3],fov:42}} dpr={[1,1.6]} fallback={<p>Follow the sweep readings and chart below.</p>}>
          <Stage heading={sweep.heading} {...{lamp,brightness,selected,select}}/>
          <OrbitControls target={[0,.52,.20]} minDistance={4.9} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Sweep readings">
        <div><span>Current heading</span><strong>{sweep.heading}°</strong></div>
        <div><span>Retained heading</span><strong>{sweep.retained}°</strong></div>
        <div><span>Samples</span><strong>{sweep.samples.length} / 13</strong></div>
        <div><span>Count at 0°</span><strong>{atCenter?.count??'—'}</strong></div>
        <div><span>Peak count</span><strong>{last?peak:'—'}</strong></div>
      </div>
      <figure className="gp-bellows-plot" aria-label="Light measurements by heading">
        <figcaption>Sweep · −60° to +60° · 10° per bar</figcaption>
        <div style={{display:'grid',gridTemplateColumns:'repeat(13, 1fr)'}}>{headings.map((n,i)=><span key={n}
          title={sweep.samples[i]?`${n}° · ${sweep.samples[i].count} counts`:`${n}° · awaiting sample`}
          style={{width:'100%',height:`${(sweep.samples[i]?.count??12)*100/1023}%`,background:sweep.samples[i]&&n===sweep.retained&&!moving&&!sweep.dim?'#238569':undefined}}/>)}</div>
      </figure>
    </div>
    <div className="gp-guide">
      <h3>Find the peak in the sweep</h3>
      <p>Move the lamp, then run the sweep. Compare the strongest bar with the reading at 0°. Dim the lamp and test what happens when every heading falls below 180 counts.</p>
      <label className="gp-solar-light">Lamp heading · {lamp}° <input type="range" min="-60" max="60" value={lamp} disabled={moving} onChange={event=>setLamp(Number(event.target.value))}/></label>
      <label className="gp-solar-light">Brightness · {brightness}% <input type="range" min="0" max="100" value={brightness} disabled={moving} onChange={event=>setBrightness(Number(event.target.value))}/></label>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={moving} onClick={()=>setSweep(start)}>Run sweep</button>
        <button type="button" aria-pressed={automatic} onClick={()=>setAutomatic(value=>!value)}>Auto-repeat</button>
      </div>
      <p className="gp-demo-description" role="status">{notice}</p>
      <ol className="gp-demo-labels">{parts.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{parts[selected][1]}</p>
    </div>
  </div>;
}
