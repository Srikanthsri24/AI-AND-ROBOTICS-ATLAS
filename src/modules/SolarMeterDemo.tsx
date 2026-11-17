import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import type { Group } from 'three';
import { solarLoads, solarReading, type SolarLoad } from '../data/solar-meter';
import { SolarMeterSolid as Solid, SolarMeterPanel, SolarMeterSensor } from './SolarMeterParts';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Trial=ReturnType<typeof solarReading>&{light:number;load:SolarLoad};
const parts=[
  ['Solar cells','Light frees charge in the silicon cells. The panel’s positive wire enters VIN+ on the current monitor.'],
  ['INA219 shunt','A tiny resistor connects VIN+ and VIN−. The sensor reads its voltage drop to calculate current.'],
  ['Resistor load','The series resistors receive power and dissipate it as heat. An open circuit removes the path for current.'],
  ['Arduino Uno','USB powers the Uno and INA219 logic. The Uno reads the measurements on A4 and A5 and sends them to the computer.'],
  ['Ground return','Panel negative, INA219 ground and Uno ground share a reference. The black load wire completes the solar circuit.'],
] as const;
const loadName=(load:SolarLoad)=>load===0?'Open circuit':`${load} Ω`;

function LoadBoard({load,selected}:{load:SolarLoad;selected:boolean}){
  return <>
    <Solid at={[0,0,0]} size={[2.38,.14,1.16]} color={selected?'#f3d890':'#e7eaf0'}/>
    {Array.from({length:9},(_,i)=>Array.from({length:2},(_,j)=><mesh key={i*2+j} position={[(i-4)*.24,.073,j*.46-.23]} rotation={[-Math.PI/2,0,0]}>
      <planeGeometry args={[.056,.053]}/><meshBasicMaterial color="#5b6572"/>
    </mesh>))}
    {Array.from({length:load/220},(_,i)=>{
      const x=i*.62-.63;
      return <group key={i} position={[x,.17,-.23]}>
        <Line points={[[-.31,-.1,0],[-.23,0,0],[.23,0,0],[.31,-.1,0]]} color="#b6c4cf" lineWidth={2}/>
        <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.075,.075,.34,20]}/><meshStandardMaterial color="#c4a272"/></mesh>
        {['#ba382e','#ba382e','#a36632','#a88b38'].map((color,k)=><mesh key={color+k} position={[-.11+k*.073,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.077,.077,.03,20]}/><meshStandardMaterial color={color}/></mesh>)}
      </group>;
    })}
    <Solid at={[0,.074,.45]} size={[2.04,.007,.021]} color="#4178bd"/>
  </>;
}

function LightRays({light}:{light:number}){
  const rays=useRef<Group>(null);
  useFrame(({clock})=>{if(rays.current)rays.current.position.y=-.28*(clock.elapsedTime%1);});
  return <group ref={rays} visible={light>0}>
    {[-.78,-.26,.26,.78].map(x=><Line key={x} points={[[x,1.30,-1.61],[x,.91,-1.42]]} color="#ffcb64" transparent opacity={light/135} lineWidth={2}/>)}
  </group>;
}

function Bench({light,load,selected,select,labels}:{light:number;load:SolarLoad;selected:number;select:(i:number)=>void;labels:boolean}){
  const {milliamps}=solarReading(light,load);
  const points:Point[]=[[-1.5,.82,-1.75],[.85,.57,-1.08],[1.15,.42,1.06],[-1.62,.48,.85],[-.15,.30,1.64]];
  return <>
    <color attach="background" args={['#222c3c']}/>
    <hemisphereLight args={['#e3ecff','#5a5369',2.4]}/>
    <directionalLight position={[-3,7,5]} intensity={2.2}/>
    <Solid at={[0,-.15,0]} size={[6.5,.28,4.55]} color="#a88262"/>
    <Solid at={[0,0,0]} size={[6.14,.047,4.19]} color="#34455a"/>
    {Array.from({length:17},(_,i)=><Line key={i} points={[[i*.35-2.8,.025,-1.94],[i*.35-2.8,.025,1.94]]} color="#435970" lineWidth={1}/>)}
    {Array.from({length:12},(_,i)=><Line key={i} points={[[-2.8,.025,i*.35-1.925],[2.8,.025,i*.35-1.925]]} color="#435970" lineWidth={1}/>)}
    <Solid at={[-1.50,.14,-1.2]} size={[1.84,.25,.8]} color="#566479"/>
    <group position={[-1.50,.37,-1.17]} rotation={[.28,0,0]} onClick={()=>select(0)}><SolarMeterPanel selected={selected===0} light={light}/></group>
    <group position={[-1.50,0,0]}><LightRays light={light}/></group>
    <group position={[.86,.16,-1.00]} onClick={()=>select(1)}><SolarMeterSensor selected={selected===1}/></group>
    <group position={[1.17,.12,.85]} onClick={()=>select(2)}><LoadBoard selected={selected===2} load={load}/></group>
    <group position={[-1.57,.085,.79]} scale={1.48} onClick={()=>select(3)}><Uno at={[0,0,0]} highlighted={selected===3}/></group>
    <Line points={[[-3.15,.16,1.56],[-2.66,.17,1.36],[-2.39,.22,.92],[-2.27,.30,.568]]} color="#adb8c3" lineWidth={5}/>
    <Line points={[[-.54,.3,-1.05],[-.23,.19,-1.57],[.69,.43,-1.26]]} color="#ec5249" lineWidth={3}/>
    <Line points={[[1.03,.43,-1.26],[1.87,.14,-.48],[1.87,.17,.36],[.23,.19,.62]]} color={milliamps>1?'#ffb04c':'#d08440'} lineWidth={3}/>
    <group onClick={()=>select(4)}>
      <Line points={[[-.53,.3,-.82],[-.24,.13,-.58],[-.28,.13,1.65],[2.11,.13,1.65],[load===660?2.09:1.47,.19,.62]]} color={selected===4?'#eac565':'#171d28'} lineWidth={4}/>
      <Line points={[[-1.28,.335,1.16],[-.94,.16,1.37],[-.69,.13,1.37],[-.28,.13,1.65]]} color={selected===4?'#eac565':'#1e2634'} lineWidth={3}/>
      <Line points={[[.47,.23,-.67],[.12,.14,-.20],[-.2,.14,1.0],[-.28,.13,1.65]]} color={selected===4?'#eac565':'#1e2634'} lineWidth={3}/>
    </group>
    {['#d75359','#45a588','#5e9ef2'].map((color,i)=><Line key={color} points={[[.73+i*.26,.24,-.67],[.77+i*.15,.12,-.32],[-1.083-i*.102,.334,.429]]} color={color} lineWidth={2.6}/>)}
    {labels&&points.map((position,i)=><WorldLabel key={i} position={position} className="gp-marker-anchor">
      <button type="button" className="gp-marker" aria-label={parts[i][0]} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{parts[i][0]}</span>}</button>
    </WorldLabel>)}
  </>;
}

export default function SolarMeterDemo(){
  const [light,setLight]=useState(100);
  const [load,setLoad]=useState<SolarLoad>(440);
  const [selected,select]=useState(0);
  const [labels,setLabels]=useState(true);
  const [trials,setTrials]=useState<Trial[]>([]);
  const measurement=solarReading(light,load);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D solar measurement bench">
        <Canvas camera={{position:[3.2,6.9,7.4],fov:41}} dpr={[1,1.7]} fallback={<p>Use the light and load controls to compare readings.</p>}>
          <Bench {...{light,load,selected,select,labels}}/>
          <OrbitControls target={[0,.16,0]} minDistance={5} maxDistance={16} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Simulated load measurements">
        <div><span>Voltage</span><strong>{measurement.volts.toFixed(2)} V</strong></div>
        <div><span>Current</span><strong>{measurement.milliamps.toFixed(2)} mA</strong></div>
        <div><span>Power</span><strong>{measurement.milliwatts.toFixed(2)} mW</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Compare light and load</h3>
      <p>Record a sunny trial. Shade the panel, then restore the light and swap the load. The readings use a simplified panel model.</p>
      <label className="gp-solar-light">Light reaching panel · {light}% <input type="range" min="0" max="100" step="1" value={light} onChange={event=>setLight(Number(event.target.value))}/></label>
      <div className="gp-steps" role="group" aria-label="Panel load">
        {solarLoads.map(value=><button type="button" key={value} aria-pressed={load===value} onClick={()=>setLoad(value)}>{loadName(value)}</button>)}
      </div>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>setTrials(values=>[...values.slice(-5),{...measurement,light,load}])}>Record reading</button>
        <button type="button" onClick={()=>setTrials([])} disabled={!trials.length}>Clear readings</button>
        <button type="button" aria-pressed={labels} onClick={()=>setLabels(value=>!value)}>Scene labels</button>
      </div>
      {trials.length>0&&<div className="gp-table"><table aria-label="Recorded trials"><thead><tr><th>Light</th><th>Load</th><th>V</th><th>mA</th><th>mW</th></tr></thead><tbody>
        {trials.map((trial,i)=><tr key={i}><td>{trial.light}%</td><td>{loadName(trial.load)}</td><td>{trial.volts.toFixed(2)}</td><td>{trial.milliamps.toFixed(2)}</td><td>{trial.milliwatts.toFixed(2)}</td></tr>)}
      </tbody></table></div>}
      <ol className="gp-demo-labels">{parts.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{parts[selected][1]}</p>
    </div>
  </div>;
}
