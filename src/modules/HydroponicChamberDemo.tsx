import { useEffect,useRef,useState } from 'react';
import { Canvas,useFrame } from '@react-three/fiber';
import { ContactShadows,Line,OrbitControls } from '@react-three/drei';
import { CatmullRomCurve3,Vector3,type Group } from 'three';
import { growFan,growLimits,growLit } from '../data/hydroponic-chamber';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { GrowLampPart,HydroPumpPart } from './HydroponicParts';
import { GreenhouseFan } from './GreenhouseDemo';
import { Uno } from './ClassroomStationsDemo';
import { ClockBoard } from './SchoolBellDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
const labels=[
  ['Reservoir and pump','The submerged pump lifts solution from the covered reservoir into the upper channel. It stops when the water falls below the sensor mark.'],
  ['Low-water sensor','The SEN0485 reads through the container wall. A dry or disconnected signal stops the pump. Resume requires 1.5 continuous seconds of safe water.'],
  ['Root channel and drain','The sloped channel carries a shallow film past the roots. Gravity returns the solution to the reservoir.'],
  ['Timed light bar','The clock turns the white strip on at 06:00 and off at 22:00. The demo illustrates timing on a model chamber.'],
  ['Air probe and exhaust','The SHT31 measures air. The fan starts at 28 °C and stays on until 25 °C or lower. A missing air reading defaults to ventilation.'],
  ['Dry controller panel','The Uno runs the three loops separately. The clock, air sensor and reservoir input each govern their own output.'],
] as const;
const anchors:Point[]=[[-1.40,.56,1.13],[-.58,.43,1.48],[-.42,1.22,1.33],[-.57,2.23,.53],[.75,1.82,-.37],[2.04,.60,.54]];
const feed:Point[]=[[-1.58,.33,.79],[-1.88,.38,.84],[-1.89,1.09,.82],[-1.52,1.13,.83],[-1.21,1.10,.83]];
const returnFlow:Point[]=[[.67,1.04,.82],[.86,1.00,.82],[.88,.54,.82],[.52,.42,.82],[-.41,.42,.82],[-.54,.28,.79]];
const channel:Point[]=[[-1.22,1.024,.82],[-.65,1.011,.82],[.03,1.0,.82],[.66,.985,.82]];
const flowCurves=[feed,channel,returnFlow].map(points=>new CatmullRomCurve3(points.map(p=>new Vector3(...p))));

function WaterIndicators(){
  const particles=useRef<Group>(null);
  const coordinate=useRef(new Vector3());
  useFrame(({clock})=>{
    particles.current?.children.forEach((particle,index)=>{
      const t=(clock.elapsedTime*.55+(index%5)/5)%1;
      flowCurves[Math.floor(index/5)].getPoint(t,coordinate.current);
      particle.position.copy(coordinate.current);
    });
  });
  return <group ref={particles}>{Array.from({length:15},(_,i)=><mesh key={i}>
    <sphereGeometry args={[.026,13,11]}/><meshBasicMaterial color="#97e8fc"/>
  </mesh>)}</group>;
}
function Seedling({x,index}:{x:number;index:number}){
  return <group position={[x,1.04,.82]}>
    <mesh position={[0,.04,0]}><cylinderGeometry args={[.146,.103,.17,20,1,true]}/><meshStandardMaterial color="#394746" side={2}/></mesh>
    <mesh position={[0,.132,0]} rotation={[-Math.PI/2,0,0]}><torusGeometry args={[.143,.018,9,24]}/><meshStandardMaterial color="#5f6b62"/></mesh>
    <mesh position={[0,.103,0]}><cylinderGeometry args={[.114,.104,.035,20]}/><meshStandardMaterial color="#776347"/></mesh>
    {Array.from({length:9},(_,i)=>{
      const angle=i*2.395+index*.82;
      const height=.16+(i%3)*.069;
      const length=.137+.028*(i%4);
      return <group key={i} position={[0,height,0]} rotation={[0,angle,0]}>
        <mesh position={[0,.042,length*.58]} rotation={[-.24,0,0]} scale={[.073,.022,length]}>
          <sphereGeometry args={[1,17,12]}/><meshStandardMaterial color={['#547e45','#649354','#819b50','#72934b'][i%4]} roughness={.65}/>
        </mesh>
        <Line points={[[0,0,0],[0,.055,length*.61],[0,.055,length*1.34]]} color="#a6bc68" lineWidth={.9}/>
      </group>;
    })}
    {[-.065,0,.059].map((v,i)=><Line key={v} points={[[v,-.031,0],[v-.03,-.071,.012],[v+.033,-.125,.015*i]]} color="#c1b991" lineWidth={1.1}/>)}
  </group>;
}

function GrowScene({wet,pump,light,fan,selected,select}:{
  wet:boolean;pump:boolean;light:boolean;fan:boolean;selected:number;select:(index:number)=>void;
}){
  const waterHeight=wet?.34:.10;
  return <>
    <color attach="background" args={['#253c49']}/>
    <hemisphereLight args={['#e3f3fc','#6a5e47',2.26]}/>
    <directionalLight position={[-4,8,6]} intensity={2.67}/>
    <Box at={[0,-.16,0]} size={[6.70,.28,4.39]} color="#586f78"/>
    <Box at={[-.63,.029,.14]} size={[3.66,.077,2.74]} color="#3e5f62"/>
    {[-2.21,1.12].flatMap(x=>[-1.00,1.20].map(z=><group key={x+':'+z}>
      <Box at={[x,1.04,z]} size={[.078,2.13,.077]} color="#9aa7a5" metal={.59}/>
      <Box at={[x,2.12,z]} size={[.114,.11,.114]} color="#5e7d83" metal={.42}/>
    </group>))}
    <Box at={[-.55,2.16,-.99]} size={[3.38,.084,.083]} color="#a6b1ab" metal={.55}/>
    <Box at={[-.55,2.16,1.20]} size={[3.38,.084,.083]} color="#a6b1ab" metal={.55}/>
    <Box at={[-.53,1.19,-.974]} size={[3.18,1.66,.027]} color="#576862"/>
    <Box at={[-.53,.20,-.929]} size={[3.13,.105,.101]} color="#6e7b72"/>
    <mesh position={[-2.21,1.10,.1]} rotation={[0,Math.PI/2,0]} renderOrder={2}>
      <planeGeometry args={[2.16,2.02]}/><meshStandardMaterial color="#b1dce8" transparent opacity={.13} depthWrite={false} side={2}/>
    </mesh>
    <group onClick={()=>select(3)} position={[-.57,1.99,.53]}><GrowLampPart lit={light} selected={selected===3}/></group>
    <group onClick={()=>select(4)} position={[.61,1.61,-.58]}>
      <group rotation={[0,Math.PI,0]} scale={.72}><GreenhouseFan running={fan} selected={selected===4}/></group>
      <Box at={[-.49,-.17,.30]} size={[.21,.17,.075]} color={selected===4?'#d6ad68':'#3f7389'}/>
      <Box at={[-.48,-.17,.348]} size={[.080,.083,.012]} color="#30363b"/>
    </group>
    <group onClick={()=>select(0)}>
      <Box at={[-1.21,.107,.75]} size={[1.31,.104,.83]} color={selected===0?'#ba9259':'#4e696c'}/>
      <mesh position={[-1.21,.16+waterHeight/2,.75]} renderOrder={1}>
        <boxGeometry args={[1.17,waterHeight,.70]}/>
        <meshStandardMaterial color="#3d9cb8" transparent opacity={.58} depthWrite={false} roughness={.18}/>
      </mesh>
      <mesh position={[-1.21,.393,1.17]} renderOrder={2}>
        <boxGeometry args={[1.31,.50,.028]}/><meshStandardMaterial color="#a3ccd6" transparent opacity={.30} depthWrite={false}/>
      </mesh>
      <Box at={[-1.86,.386,.75]} size={[.032,.48,.83]} color="#63808a"/>
      <Box at={[-.56,.386,.75]} size={[.032,.48,.83]} color="#63808a"/>
      <Box at={[-1.21,.632,.75]} size={[1.33,.049,.87]} color="#42656d"/>
      <group position={[-1.63,.245,.79]} scale={.54}><HydroPumpPart selected={selected===0}/></group>
    </group>
    <group onClick={()=>select(1)} position={[-.57,.375,1.20]}>
      <Box at={[0,0,0]} size={[.14,.157,.04]} color={selected===1?'#dfb46d':'#343d45'}/>
      <Box at={[-.19,-.014,-.024]} size={[.19,.021,.024]} color="#e2cf95"/>
      <Line points={[[0,.044,.019],[.23,.094,.08],[1.31,-.19,-.12],[2.17,-.22,-.32]]} color="#9d825e" lineWidth={2}/>
    </group>
    <group onClick={()=>select(2)}>
      <Box at={[-.28,.929,.82]} size={[2.17,.066,.65]} color={selected===2?'#bd9862':'#476e72'}/>
      {[-.08,1.70].map((_,i)=><mesh key={i} position={[-.28,1.012,i?1.141:.494]} renderOrder={2}>
        <boxGeometry args={[2.16,.21,.037]}/><meshStandardMaterial color="#a4d5df" transparent opacity={.35} depthWrite={false}/>
      </mesh>)}
      <Box at={[-.28,1.13,1.15]} size={[2.14,.026,.039]} color="#a4babb" metal={.27}/>
      <Box at={[-.28,1.13,.493]} size={[2.14,.026,.039]} color="#a4babb" metal={.27}/>
      {[-.77,.22].map((x,i)=><Seedling key={x} x={x} index={i}/>)}
    </group>
    <Line points={feed} color={pump?'#62c8db':'#6f8790'} lineWidth={4}/>
    <Line points={returnFlow} color={pump?'#62c8db':'#6f8790'} lineWidth={4}/>
    {pump&&<><Line points={channel} color="#53b9cc" lineWidth={2.5}/><WaterIndicators/></>}
    <group onClick={()=>select(5)} position={[2.05,.11,.09]}>
      <Box at={[0,-.052,0]} size={[1.41,.125,1.39]} color={selected===5?'#c4a167':'#516976'}/>
      <group scale={1.41} position={[-.1,.03,0]}><Uno at={[0,0,0]}/></group>
      <group scale={.38} position={[.33,.08,.39]}><ClockBoard/></group>
    </group>
    <Line points={[[.52,1.48,-.36],[1.23,.62,-.28],[1.46,.26,.05],[1.80,.25,.27]]} color="#d6a671" lineWidth={2.4}/>
    {anchors.map((at,i)=><WorldLabel key={i} position={at} className="gp-marker-anchor">
      <button type="button" className="gp-marker" aria-pressed={selected===i} aria-label={labels[i][0]} onClick={()=>select(i)}>
        {i+1}{selected===i&&<span className="gp-demo-marker-name">{labels[i][0]}</span>}
      </button>
    </WorldLabel>)}
    <ContactShadows position={[0,.025,0]} opacity={.38} scale={6.5} blur={2.2} far={1.7} resolution={128} frames={1}/>
  </>;
}
const clockText=(minute:number)=>String(Math.floor(minute/60)).padStart(2,'0')+':'+String(minute%60).padStart(2,'0');

export default function HydroponicChamberDemo(){
  const [minute,setMinute]=useState(8*60);
  const [temperature,setTemperature]=useState(23);
  const [wet,setWet]=useState(true);
  const [paused,setPaused]=useState(false);
  const [primed,setPrimed]=useState(false);
  const [clockReady,setClockReady]=useState(true);
  const [sensorReady,setSensorReady]=useState(true);
  const [fan,setFan]=useState(false);
  const [selected,select]=useState(0);
  const waterAllowed=wet&&!paused;
  const pump=waterAllowed&&primed;
  const light=growLit(minute,clockReady);
  useEffect(()=>{
    setPrimed(false);
    if(!waterAllowed)return;
    const timer=window.setTimeout(()=>setPrimed(true),growLimits.wetDelay);
    return ()=>window.clearTimeout(timer);
  },[waterAllowed]);
  useEffect(()=>{setFan(previous=>growFan(sensorReady?temperature:null,previous));},[sensorReady,temperature]);
  const status=!wet?'Low reservoir · Pump off':paused?'Maintenance pause · Pump off':!primed?'Waiting for stable water level':'Circulating · Water returns to the reservoir';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D hydroponic grow chamber">
        <Canvas camera={{position:[3.0,4.4,6.95],fov:43}} dpr={[1,1.6]} fallback={<p>Use the control readouts to follow each output.</p>}>
          <GrowScene {...{wet,pump,light,fan,selected,select}}/>
          <OrbitControls target={[0,.70,.14]} minDistance={4} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Chamber outputs">
        <div><span>Circulation pump</span><strong>{pump?'Running':'Off'}</strong></div>
        <div><span>Grow light</span><strong>{light?'On':'Off'}</strong></div>
        <div><span>Ventilation fan</span><strong>{fan?'Running':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide gp-hydro-controls">
      <h3>Run the chamber through a day</h3>
      <p>Change the clock and temperature, then lower the reservoir. Watch each output respond and follow the moving water through the channel when the pump runs.</p>
      <label htmlFor="hydro-hour">Clock <output htmlFor="hydro-hour">{clockReady?clockText(minute):'Unavailable'}</output></label>
      <input id="hydro-hour" type="range" min="0" max="1410" step="30" value={minute} aria-valuetext={clockText(minute)} onChange={event=>setMinute(event.target.valueAsNumber)}/>
      <div className="gp-steps" aria-label="Time presets">
        <button type="button" onClick={()=>setMinute(8*60)}>08:00 daytime</button>
        <button type="button" onClick={()=>setMinute(23*60)}>23:00 nighttime</button>
      </div>
      <label htmlFor="hydro-temp">Air temperature <output htmlFor="hydro-temp">{sensorReady?temperature+' °C':'Unavailable'}</output></label>
      <input id="hydro-temp" type="range" aria-valuetext={temperature+' °C'} min="16" max="35" value={temperature} onChange={event=>setTemperature(event.target.valueAsNumber)}/>
      <div className="gp-steps" aria-label="Reservoir and service controls">
        <button type="button" className="gp-button" aria-pressed={!wet} onClick={()=>setWet(!wet)}>{wet?'Lower water level':'Refill reservoir'}</button>
        <button type="button" aria-pressed={paused} onClick={()=>setPaused(!paused)}>{paused?'Resume circulation':'Pause circulation'}</button>
      </div>
      <div className="gp-steps" aria-label="Test sensor signals">
        <button type="button" aria-pressed={!clockReady} onClick={()=>setClockReady(!clockReady)}>{clockReady?'Disconnect clock':'Reconnect clock'}</button>
        <button type="button" aria-pressed={!sensorReady} onClick={()=>setSensorReady(!sensorReady)}>{sensorReady?'Disconnect air probe':'Reconnect air probe'}</button>
      </div>
      <p role="status" className="gp-demo-description">{status}</p>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
