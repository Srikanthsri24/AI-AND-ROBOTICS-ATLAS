import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import type { Group } from 'three';
import { floodGate, gateDecision, gateLimits, type GateReason } from '../data/flood-gate';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];

function Panel({at,size,color,metal=0}:{at:Point;size:Point;color:string;metal?:number}) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.13} smoothness={2}>
    <meshStandardMaterial color={color} roughness={metal>.25?.36:.69} metalness={metal}/>
  </RoundedBox>;
}

function GateFlap({open}: {open:boolean}) {
  const flap=useRef<Group>(null);
  useFrame((_,dt)=>{
    if(flap.current) flap.current.rotation.z+=((open ? 1.02 : 0)-flap.current.rotation.z)*Math.min(dt*7,1);
  });
  return <group ref={flap} position={[0,.92,0]}>
    <Panel at={[0,-.40,0]} size={[.070,.79,1.31]} color="#c7b87b"/>
    {[-.43,0,.43].map(z=><Panel key={z} at={[.046,-.40,z]} size={[.034,.70,.037]} color="#786e50"/>)}
    <Panel at={[.004,-.756,0]} size={[.092,.06,1.34]} color="#798b87"/>
  </group>;
}

export function GateAssembly({open=false}: {open?:boolean}) {
  return <>
    <Panel at={[0,.108,0]} size={[.23,.095,1.60]} color="#889394" metal={.42}/>
    {[-.72,.72].map(z=><group key={z}>
      <Panel at={[0,.49,z]} size={[.21,.98,.19]} color="#576b73" metal={.51}/>
      <Panel at={[0,.075,z]} size={[.40,.12,.32]} color="#869699" metal={.51}/>
    </group>)}
    <mesh position={[0,.92,0]} rotation={[Math.PI/2,0,0]}>
      <cylinderGeometry args={[.047,.047,1.66,24]}/><meshStandardMaterial color="#b5bdba" metalness={.72} roughness={.28}/>
    </mesh>
    <GateFlap open={open}/>
  </>;
}

function GateServo({open}: {open:boolean}) {
  const horn=useRef<Group>(null);
  useFrame((_,dt)=>{
    if(horn.current) horn.current.rotation.z+=((open ? -.99 : 0)-horn.current.rotation.z)*Math.min(dt*7,1);
  });
  return <>
    <Panel at={[.27,.94,-.93]} size={[.36,.28,.24]} color="#235c93"/>
    <Panel at={[.09,.94,-.93]} size={[.07,.21,.32]} color="#2e5880"/>
    <mesh position={[.24,1.06,-.79]} rotation={[Math.PI/2,0,0]}>
      <cylinderGeometry args={[.052,.052,.10,25]}/><meshStandardMaterial color="#dae0de"/>
    </mesh>
    <group ref={horn} position={[.24,1.06,-.73]}>
      <Panel at={[-.10,.007,0]} size={[.24,.038,.056]} color="#d8e0db"/>
      <Panel at={[-.24,-.076,0]} size={[.024,.18,.023]} color="#aab6b9" metal={.65}/>
    </group>
  </>;
}

function RangeSensor({x,y}:{x:number;y:number}) {
  return <group position={[x,y,0]}>
    <Panel at={[0,0,0]} size={[.51,.041,.26]} color="#1e6299"/>
    {[-.13,.13].map(delta=><group key={delta} position={[delta,-.057,0]}>
      <mesh><cylinderGeometry args={[.083,.083,.104,28]}/><meshStandardMaterial color="#a4aeb6" metalness={.68} roughness={.31}/></mesh>
      <mesh position={[0,-.053,0]}><cylinderGeometry args={[.063,.063,.006,26]}/><meshStandardMaterial color="#424e58"/></mesh>
    </group>)}
    <Panel at={[.10,.025,.082]} size={[.11,.026,.067]} color="#242d34"/>
  </group>;
}

function WaterCell({x,depth,color}:{x:number;depth:number;color:string}) {
  if(depth<=0) return null;
  const height=depth*.066;
  return <>
    <mesh position={[x,.094+height/2,0]}>
      <boxGeometry args={[2.35,height,1.57]}/>
      <meshPhysicalMaterial color={color} transparent opacity={.49} metalness={.24} roughness={.24} depthWrite={false}/>
    </mesh>
    {[-.58,-.28,.11,.5].map((z,index)=><Line key={z}
      points={Array.from({length:15},(_,i)=>[x-.99+i*.14,.102+height,z+Math.sin(i*.73+index)*.039] as Point)}
      color="#a1e4ea" transparent opacity={.57} lineWidth={1.05}/>)}
  </>;
}

function TransferDots({up,down}:{up:number;down:number}) {
  const dots=useRef<Group>(null);
  const time=useRef(0);
  useFrame((_,dt)=>{
    if(!dots.current) return;
    time.current+=Math.min(dt,.08)*1.3;
    dots.current.children.forEach((child,index)=>{
      const phase=(time.current+index/8)%1;
      child.position.set(-.49+phase*1.12,.10+(.066*(up+(down-up)*phase))*.68+.036*Math.sin(phase*Math.PI),.095*Math.sin(index*2.3));
    });
  });
  return <group ref={dots}>{Array.from({length:8},(_,index)=><mesh key={index}>
    <sphereGeometry args={[.036,12,8]}/><meshBasicMaterial color="#affbf6" depthTest={false}/>
  </mesh>)}</group>;
}

const anchors:Point[]=[[-.95,.46,-1.26],[-1.16,1.34,0],[.26,1.09,-.89],[1.21,.38,-1.26],[-.06,.43,-1.28],[0,.74,.48]];
const labels:Point[]=[[-.98,.96,-1.20],[-1.48,1.87,.11],[.61,1.64,-.86],[1.25,.90,-1.29],[-.21,.89,-1.31],[.38,1.21,.68]];

type Model={up:number;down:number;missing:boolean;open:boolean;reason:GateReason};
const baseline:Model={up:3,down:2,missing:false,open:false,reason:'Waiting for upstream'};
const openingNote:Record<GateReason,string>={
  'Waiting for upstream':'Upstream must reach 8 cm before the gate can open.',
  'Releasing water':'Both readings are valid and downstream has room.',
  'Upstream recovered':'Upstream reached the 5 cm closing threshold.',
  'Downstream interlock':'The downstream level prevents a release.',
  'Sensor fault':'The downstream echo is unavailable. The controller commands the gate closed.',
};

function applyReadings(previous:Model,changes:Partial<Pick<Model,'up'|'down'|'missing'>>):Model {
  const readings={...previous,...changes};
  return {...readings,...gateDecision(readings.up,readings.missing?null:readings.down,previous.open)};
}

export function SpillwayBasin() {
  return <>
    <Panel at={[0,.05,0]} size={[4.92,.105,1.73]} color="#758486"/>
    {[-.84,.84].map(z=><group key={z}>
      <mesh position={[0,.43,z]}><boxGeometry args={[4.97,.74,.052]}/>
        <meshStandardMaterial color="#a5dce3" transparent opacity={.23} depthWrite={false}/>
      </mesh>
      <Panel at={[0,.80,z]} size={[5.00,.044,.059]} color="#9abbbc"/>
    </group>)}
    {[-2.47,2.47].map(x=><group key={x}>
      <mesh position={[x,.42,0]}><boxGeometry args={[.053,.75,1.69]}/>
        <meshStandardMaterial color="#a5dce3" transparent opacity={.24} depthWrite={false}/>
      </mesh>
      <Panel at={[x,.80,0]} size={[.058,.047,1.72]} color="#94b6b9"/>
    </group>)}
  </>;
}

function SpillwayScene({model,flowing,selected,select}: {
  model:Model;flowing:boolean;selected:number;select:(index:number)=>void;
}) {
  return <>
    <Panel at={[0,-.105,-.10]} size={[6.15,.18,3.87]} color="#455767"/>
    <SpillwayBasin/>
    <WaterCell x={-1.22} depth={model.up} color="#397f9c"/>
    <WaterCell x={1.22} depth={model.down} color="#459b9d"/>
    <GateAssembly open={model.open}/>
    <GateServo open={model.open}/>
    {[-1.22,1.22].map(x=><group key={x}>
      <Panel at={[x,.78,-.99]} size={[.071,1.37,.095]} color="#95a4a8" metal={.52}/>
      <Panel at={[x,1.41,-.51]} size={[.080,.072,1.08]} color="#aab4b8" metal={.48}/>
      <RangeSensor x={x} y={1.37}/>
    </group>)}
    {[-1.22,1.22].map((x,index)=>!(model.missing&&index===1)&&<Line key={x}
      points={[[x,1.25,0],[x,.105+(index===0?model.up:model.down)*.066,0]]}
      color="#9eefe2" lineWidth={1.5} dashed dashSize={.093} gapSize={.054}/>)}
    <Panel at={[0,.13,-1.37]} size={[3.38,.255,.69]} color="#263a47"/>
    <Panel at={[-.98,.33,-1.39]} size={[.72,.101,.43]} color="#287aa2"/>
    <Panel at={[-1.18,.391,-1.39]} size={[.184,.044,.13]} color="#232d35"/>
    <Panel at={[-.65,.377,-1.37]} size={[.122,.053,.17]} color="#b5c2c5" metal={.58}/>
    <Panel at={[.05,.312,-1.39]} size={[.73,.072,.34]} color="#e9e7de"/>
    {Array.from({length:9},(_,i)=><Panel key={i} at={[-.24+i*.07,.358,-1.39]} size={[.014,.006,.25]} color="#959d98"/>)}
    <Panel at={[1.13,.356,-1.39]} size={[.60,.17,.36]} color="#3c454b"/>
    <Line points={[[-.63,.42,-1.43],[-.33,.44,-1.44],[-.19,.37,-1.41]]} color="#ef855f" lineWidth={2}/>
    <Line points={[[.90,.45,-1.35],[.53,.46,-1.42],[.32,.37,-1.39]]} color="#edb96a" lineWidth={2}/>
    <Line points={[[.06,.38,-1.40],[-.14,.67,-1.14],[.27,.96,-.85]]} color="#6ab3f4" lineWidth={2}/>
    {flowing&&<TransferDots up={model.up} down={model.down}/>}
    <WorldLabel position={[-1.69,.21,.97]} className="gp-marker-anchor"><span className="gp-rocket-field-label">Upstream</span></WorldLabel>
    <WorldLabel position={[1.75,.21,.98]} className="gp-marker-anchor"><span className="gp-rocket-field-label">Downstream</span></WorldLabel>
    {Array.from(new Set([1,5,selected])).map(index=><group key={index}>
      <Line points={[anchors[index],labels[index]]} color={index===selected?'#ffe18c':'#bbd7d9'} lineWidth={1.3}/>
      <WorldLabel position={labels[index]} className="gp-marker-anchor">
        <button className="gp-marker" type="button" aria-label={floodGate.parts[index][0]} aria-pressed={index===selected} onClick={()=>select(index)}>
          {index+1}
        </button>
      </WorldLabel>
    </group>)}
    <ContactShadows position={[0,-.015,0]} opacity={.32} scale={7} blur={2.5} far={4}/>
  </>;
}

export default function FloodGateDemo() {
  const [model,setModel]=useState(baseline);
  const [transfer,setTransfer]=useState(false);
  const [selected,setSelected]=useState(5);
  const flowing=transfer&&model.open;
  useEffect(()=>{
    if(!flowing) return;
    const timer=window.setInterval(()=>setModel(previous=>{
      if(!previous.open) return previous;
      return applyReadings(previous,{up:Math.max(0,previous.up-.25),down:Math.min(gateLimits.maxCm,previous.down+.25)});
    }),180);
    return ()=>window.clearInterval(timer);
  },[flowing]);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive automatic flood gate">
        <Canvas dpr={[1,1.5]} camera={{position:[3.8,4.0,6.3],fov:44}} fallback={<p>The water controls and gate decision are available without the 3D spillway.</p>}>
          <color attach="background" args={['#233842']}/>
          <ambientLight intensity={1.25}/>
          <directionalLight position={[-2,7,4]} intensity={2.39}/>
          <SpillwayScene model={model} flowing={flowing} selected={selected} select={setSelected}/>
          <OrbitControls target={[0,.55,-.13]} minDistance={4} maxDistance={14} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Simulated flood gate measurements">
        <div><span>Upstream</span><strong>{model.up.toFixed(2)} cm</strong></div>
        <div><span>Downstream</span><strong>{model.missing ? 'No echo' : `${model.down.toFixed(2)} cm`}</strong></div>
        <div><span>Gate command</span><strong>{model.open?'Open':'Closed'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Test both water levels</h3>
      <p>Raise upstream to 8 cm to request an opening. While open, it closes when upstream falls to 5 cm, downstream reaches 6 cm, or an echo is lost.</p>
      <label htmlFor="gp-gate-up">Upstream depth · {model.up.toFixed(2)} cm</label>
      <input type="range" className="gp-lidar-range" id="gp-gate-up" min={0} max={gateLimits.maxCm} step={.25} value={model.up}
        onChange={event=>{const up=Number(event.target.value);setModel(previous=>applyReadings(previous,{up}));}}/>
      <label htmlFor="gp-gate-down">Downstream depth · {model.down.toFixed(2)} cm</label>
      <input type="range" className="gp-lidar-range" id="gp-gate-down" min={0} max={gateLimits.maxCm} step={.25} value={model.down}
        onChange={event=>{const down=Number(event.target.value);setModel(previous=>applyReadings(previous,{down}));}}/>
      <div className="gp-steps" role="group" aria-label="Spillway controls">
        <button type="button" aria-pressed={transfer} onClick={()=>setTransfer(value=>!value)}>{transfer?'Pause water transfer':'Run water transfer'}</button>
        <button type="button" aria-pressed={model.missing} onClick={()=>setModel(previous=>applyReadings(previous,{missing:!previous.missing}))}>
          {model.missing?'Restore downstream echo':'Simulate missing echo'}
        </button>
        <button type="button" onClick={()=>{setTransfer(false);setModel(baseline);}}>Reset spillway</button>
      </div>
      <p className="gp-check" role="status">{model.reason} · {openingNote[model.reason]}</p>
      <h4>Inspect the spillway</h4>
      <ol className="gp-demo-labels">{floodGate.parts.map(([name],index)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{floodGate.parts[selected][2]}</p>
    </div>
  </div>;
}
