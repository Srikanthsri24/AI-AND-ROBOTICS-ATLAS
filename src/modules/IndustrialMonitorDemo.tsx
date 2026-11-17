import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import type { Group } from 'three';
import { industrialLimits, industrialMonitor } from '../data/industrial-monitor';
import { WorldLabel } from './LabWorkbench';
import { EthernetShieldGeometry } from './AquacleanDemo';
import { RollerSwitch } from './SmartBinDemo';

type Point=[number,number,number];
type Model={temperature:number;vibration:number;stopOpen:boolean;running:boolean;tripped:boolean};
const initial:Model={temperature:35,vibration:24,stopOpen:false,running:false,tripped:false};
type State='Running'|'Trip latched'|'Ready';

const causes=(model:Model)=>[
  ...(model.stopOpen?['Stop loop open']:[]),
  ...(model.temperature>=industrialLimits.temperature?['High temperature index']:[]),
  ...(model.vibration>=industrialLimits.vibration?['High vibration index']:[]),
];
const stateOf=(model:Model):State=>model.tripped?'Trip latched':model.running?'Running':'Ready';
function applyInputs(model:Model):Model {
  return causes(model).length?{...model,running:false,tripped:true}:model;
}
const colorByState:Record<State,string>={'Running':'#76e8b5','Trip latched':'#ff8b7b',Ready:'#dcce9a'};

function Block({at,size,color,metalness=0}:{at:Point;size:Point;color:string;metalness?:number}) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.15} smoothness={2}>
    <meshStandardMaterial color={color} metalness={metalness} roughness={metalness>.4?.37:.68}/>
  </RoundedBox>;
}

export function TestKnob() {
  return <>
    <mesh position={[0,.03,0]}><cylinderGeometry args={[.18,.19,.14,26]}/><meshStandardMaterial color="#929fa1" metalness={.61}/></mesh>
    <mesh position={[0,.19,0]}><cylinderGeometry args={[.115,.115,.27,24]}/><meshStandardMaterial color="#303d47"/></mesh>
    <Block at={[0,.329,.044]} size={[.027,.015,.085]} color="#e4cb8c"/>
    {[-.105,0,.105].map(x=><Block key={x} at={[x,-.078,0]} size={[.034,.11,.027]} color="#b6a67a" metalness={.55}/>)}
  </>;
}

export function IndustrialIndicators({state='Ready'}:{state?:State}) {
  return <>
    <Block at={[0,0,0]} size={[.68,.075,.35]} color="#c8ccbd"/>
    {[-.17,.17].map((x,index)=><group key={x} position={[x,.08,0]}>
      <mesh>
        <capsuleGeometry args={[.059,.12,7,20]}/>
        <meshStandardMaterial color={index===0?'#42c891':'#ce544f'} emissive={index===0?'#45eaa7':'#ff443c'}
          emissiveIntensity={(index===0&&state==='Running')||(index===1&&state==='Trip latched')?2.1:0}/>
      </mesh>
      <Block at={[0,-.022,.116]} size={[.19,.032,.041]} color="#c7a66d"/>
    </group>)}
  </>;
}

function Conveyor({running}:{running:boolean}) {
  const cartons=useRef<Group>(null);
  const ribs=useRef<Group>(null);
  const offset=useRef(0);
  useFrame((_,dt)=>{
    if(!running) return;
    offset.current+=Math.min(dt,.08)*.70;
    cartons.current?.children.forEach((item,index)=>{item.position.x=-1.98+(offset.current+index*1.31)%3.94;});
    ribs.current?.children.forEach((item,index)=>{item.position.x=-2.12+(offset.current+index*.246)%4.18;});
  });
  return <>
    {[-1.88,1.88].flatMap(x=>[-.51,.51].map(z=><Block key={`${x}:${z}`} at={[x,.37,z]} size={[.16,.74,.16]} color="#6b7f84" metalness={.51}/>))}
    <Block at={[0,.68,0]} size={[4.55,.29,1.26]} color="#405e6c"/>
    <Block at={[0,.836,0]} size={[4.36,.057,.94]} color="#2d373b"/>
    {[-.57,.57].map(z=><Block key={z} at={[0,.88,z]} size={[4.57,.153,.123]} color="#9cabb0" metalness={.61}/>)}
    {[-2.13,2.13].map(x=><mesh key={x} position={[x,.76,0]} rotation={[Math.PI/2,0,0]}>
      <cylinderGeometry args={[.164,.164,.94,26]}/><meshStandardMaterial color="#82989d" metalness={.6} roughness={.42}/>
    </mesh>)}
    <group ref={ribs}>{Array.from({length:17},(_,i)=><group key={i} position={[-2.12+i*.246,.87,0]}>
      <Block at={[0,0,0]} size={[.022,.022,.86]} color="#63737a"/>
    </group>)}</group>
    <group ref={cartons}>{Array.from({length:3},(_,i)=><group key={i} position={[-1.98+i*1.31,1.11,0]}>
      <Block at={[0,0,0]} size={[.45,.42,.56]} color="#c29d6c"/>
      <Block at={[0,.216,0]} size={[.078,.012,.552]} color="#dcc39b"/>
      <Block at={[.057,.018,.284]} size={[.16,.081,.014]} color="#e2d3b2"/>
    </group>)}</group>
  </>;
}

const points:Point[]=[[-1.17,.43,1.03],[-1.17,.58,1.07],[.07,.52,1.15],[.85,.49,1.13],
  [1.19,.48,1.20],[1.90,.49,1.09],[.69,.39,1.14]];
const labels:Point[]=[[-1.45,.97,1.08],[-1.19,1.13,1.04],[.03,1.04,1.28],[.68,.98,1.53],
  [1.17,.97,1.56],[2.05,1.13,1.30],[.69,.88,1.11]];

function TrainingScene({model,selected,select}:{model:Model;selected:number;select:(index:number)=>void}) {
  const state=stateOf(model);
  return <>
    <Block at={[0,-.105,.10]} size={[6.22,.20,3.93]} color="#425865"/>
    <Conveyor running={model.running}/>
    <Block at={[.25,.17,1.13]} size={[4.24,.31,1.12]} color="#304653"/>
    <Block at={[-1.17,.393,1.04]} size={[.81,.076,.59]} color="#23678f"/>
    <group position={[-1.17,.487,1.04]} scale={.77}><EthernetShieldGeometry/></group>
    {[-.18,.19].map((x,index)=><group key={x} position={[x,.408,1.17]} scale={.69}
      rotation={[0,(index===0?model.temperature:model.vibration)*-.046,0]}><TestKnob/></group>)}
    <Block at={[.88,.377,1.15]} size={[1.07,.073,.57]} color="#d4d5c3"/>
    <group position={[.76,.485,1.17]} scale={.55}><RollerSwitch/></group>
    <mesh position={[1.17,.469,1.18]}>
      <cylinderGeometry args={[.089,.089,.11,24]}/><meshStandardMaterial color="#538f77"/>
    </mesh>
    <group position={[1.91,.422,1.13]} scale={.86}><IndustrialIndicators state={state}/></group>
    <Line points={[[-.87,.50,1.27],[-.55,.55,1.39],[-.18,.49,1.18]]} color="#e6ae77" lineWidth={2}/>
    <Line points={[[.77,.45,1.15],[1.28,.51,1.04],[1.74,.455,1.04]]} color="#8dc5cb" lineWidth={2}/>
    <WorldLabel position={[-1.68,1.59,-.03]} className="gp-marker-anchor">
      <span className="gp-rocket-field-label" style={{color:colorByState[state]}}>Model conveyor · {state}</span>
    </WorldLabel>
    {Array.from(new Set([2,5,selected])).map(index=><group key={index}>
      <Line points={[points[index],labels[index]]} color={selected===index?'#ffe199':'#b7d5db'} lineWidth={1.35}/>
      <WorldLabel position={labels[index]} className="gp-marker-anchor">
        <button className="gp-marker" type="button" aria-label={industrialMonitor.parts[index][0]} aria-pressed={selected===index}
          onClick={()=>select(index)}>{index+1}</button>
      </WorldLabel>
    </group>)}
    <ContactShadows position={[0,-.01,0]} scale={7} opacity={.36} blur={2.4} far={4}/>
  </>;
}

export default function IndustrialMonitorDemo() {
  const [model,setModel]=useState(initial);
  const [online,setOnline]=useState(true);
  const [stale,setStale]=useState(false);
  const [last,setLast]=useState<State>('Ready');
  const [selected,setSelected]=useState(2);
  const state=stateOf(model);
  const activeCauses=causes(model);
  useEffect(()=>{
    if(online) return;
    const timeout=window.setTimeout(()=>setStale(true),industrialLimits.staleMs);
    return ()=>window.clearTimeout(timeout);
  },[online]);
  function changeInput(input:'temperature'|'vibration',value:number) {
    setModel(current=>applyInputs({...current,[input]:value}));
  }
  function press() {
    setModel(current=>{
      if(causes(current).length) return current;
      if(current.tripped) return {...current,tripped:false};
      return {...current,running:!current.running};
    });
  }

  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive industrial conveyor training model">
        <Canvas dpr={[1,1.5]} camera={{position:[4.1,4.5,6.8],fov:44}} fallback={<p>The controls and indicators remain available without WebGL.</p>}>
          <color attach="background" args={['#253b48']}/>
          <ambientLight intensity={1.26}/>
          <directionalLight position={[-1,6,4]} intensity={2.35}/>
          <TrainingScene model={model} selected={selected} select={setSelected}/>
          <OrbitControls target={[0,.60,.12]} enablePan={false} minDistance={4} maxDistance={14}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Local training panel readings">
        <div><span>Temperature index</span><strong>{model.temperature}</strong></div>
        <div><span>Vibration index</span><strong>{model.vibration}</strong></div>
        <div><span>Stop loop</span><strong>{model.stopOpen?'Open':'Closed'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Test the local panel</h3>
      <p>Start the model, then raise temperature to 75, vibration to 65, or open the stop loop. Clear the cause, acknowledge the trip, then press Start again.</p>
      <label htmlFor="gp-industrial-temp">Temperature index · {model.temperature}</label>
      <input className="gp-lidar-range" id="gp-industrial-temp" type="range" min={0} max={100} value={model.temperature}
        onChange={event=>changeInput('temperature',Number(event.target.value))}/>
      <label htmlFor="gp-industrial-vibration">Vibration index · {model.vibration}</label>
      <input className="gp-lidar-range" id="gp-industrial-vibration" type="range" min={0} max={100} value={model.vibration}
        onChange={event=>changeInput('vibration',Number(event.target.value))}/>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={activeCauses.length>0} onClick={press}>
          {model.tripped?'Acknowledge trip':model.running?'Stop model':'Start model'}
        </button>
        <button type="button" aria-pressed={model.stopOpen} onClick={()=>setModel(current=>applyInputs({...current,stopOpen:!current.stopOpen}))}>
          {model.stopOpen?'Close stop loop':'Open stop loop'}
        </button>
      </div>
      <p className="gp-check" role="status">{state}{activeCauses.length ? ` · ${activeCauses.join(' and ')}`
        : model.tripped?' · Cause cleared. Acknowledge before restarting.':''}</p>
      <section className="gp-program-card" aria-label="Simulated industrial remote console">
        <h4>Remote console</h4>
        <p><strong>{online?'Live telemetry':stale?'Stale · no recent packet':'Waiting for telemetry'}</strong> · {online?state:`Last received: ${last}`}</p>
        <button type="button" className="gp-button gp-secondary" aria-pressed={online} onClick={()=>{
          if(online)setLast(state);
          setStale(false);setOnline(value=>!value);
        }}>{online?'Disconnect monitor':'Reconnect monitor'}</button>
      </section>
      <h4>Inspect the panel</h4>
      <ol className="gp-demo-labels">{industrialMonitor.parts.map(([name],index)=><li key={name}>
        <button className="gp-part-label" type="button" aria-pressed={index===selected} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{industrialMonitor.parts[selected][2]}</p>
    </div>
  </div>;
}
