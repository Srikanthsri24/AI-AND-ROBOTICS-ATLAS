import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import type { Group } from 'three';
import { crossingPhase, type CrossingPhase } from '../data/railway-gate';
import { WorldLabel } from './LabWorkbench';

type Point = [number, number, number];
const approach = -2.6;
const exit = 2.0;
const trainLength = 2.24;
const clearPosition = 4.65;
const parts = [
  {name:'Approach beam A', at:[approach,.40,.58], label:[approach,1.16,.70], info:'A detects the front of the train. Its receiver changes D2 to HIGH, and the Uno turns on the warning and lowers the arm.'},
  {name:'Exit beam B', at:[exit,.40,.58], label:[exit,.92,.81], info:'B changes D3 to HIGH while the train passes. The controller waits for B to clear, with A also clear, before raising the arm.'},
  {name:'Servo barrier', at:[-.58,.43,1.25], label:[-.65,1.68,1.84], info:'The striped arm is attached to the servo horn. Pin D9 commands the upright and lowered angles.'},
  {name:'Red warning lamp', at:[.74,.60,1.38], label:[.82,1.22,1.98], info:'Pin D6 powers the LED through a 220 Ω resistor. It stays lit while the controller holds the gate closed.'},
  {name:'Arduino Uno', at:[-2.15,.21,2.03], label:[-2.27,.75,2.28], info:'The Uno remembers the train between the two beams. The servo gets its power separately, with ground shared between the supplies.'},
] satisfies {name:string; at:Point; label:Point; info:string}[];

function Panel({ at, size, color, metal = 0, radius = .018 }: {
  at:Point; size:Point; color:string; metal?:number; radius?:number;
}) {
  return <RoundedBox position={at} args={size} radius={radius} smoothness={2}>
    <meshStandardMaterial color={color} metalness={metal} roughness={.66}/>
  </RoundedBox>;
}

function Train({ nose }: {nose:number}) {
  return <group position={[nose,.16,0]}>
    {[-.54,-1.68].map((x,index)=><group key={x} position={[x,0,0]}>
      <Panel at={[0,.12,0]} size={[1.08,.13,.46]} color="#242d32"/>
      <Panel at={[0,.31,0]} size={[1.04,.33,.44]} color={index?'#2f645e':'#23656e'} radius={.04}/>
      <Panel at={[0,.49,0]} size={[1.03,.095,.46]} color="#313b40" radius={.035}/>
      <Panel at={[0,.256,.223]} size={[1.01,.05,.012]} color="#e1bd73"/>
      {[-.28,0,.28].map(pane=><group key={pane}>
        <Panel at={[pane,.384,.229]} size={[.19,.129,.015]} color="#a0a598" metal={.34}/>
        <Panel at={[pane,.384,.241]} size={[.158,.101,.009]} color="#344e57" metal={.46}/>
      </group>)}
      {[-.33,.33].flatMap(axle=>[-.228,.228].map(side=><group key={`${axle}:${side}`} position={[axle,.043,side]} rotation={[Math.PI/2,0,0]}>
        <mesh><cylinderGeometry args={[.108,.108,.06,24]}/><meshStandardMaterial color="#242829" metalness={.55}/></mesh>
        <mesh position={[0,.036,0]}><cylinderGeometry args={[.036,.036,.01,16]}/><meshStandardMaterial color="#8e9493" metalness={.6}/></mesh>
      </group>))}
      {index===0 && <>
        <Panel at={[.533,.398,0]} size={[.024,.133,.299]} color="#405e65" metal={.48}/>
        {[-.116,.116].map(z=><mesh key={z} position={[.55,.26,z]} rotation={[0,0,-Math.PI/2]}>
          <cylinderGeometry args={[.036,.036,.028,14]}/><meshStandardMaterial color="#ffedb9" emissive="#ffd195" emissiveIntensity={.45}/>
        </mesh>)}
      </>}
    </group>)}
    <Panel at={[-1.10,.14,0]} size={[.16,.05,.10]} color="#242d32"/>
  </group>;
}

function Barrier({closed}: {closed:boolean}) {
  const arm=useRef<Group>(null);
  useFrame((_,delta)=>{
    if (!arm.current) return;
    const angle=closed?0:Math.PI/2;
    arm.current.rotation.z+=(angle-arm.current.rotation.z)*Math.min(1,delta*8);
  });
  return <group position={[-.58,.20,1.24]}>
    <Panel at={[0,-.03,0]} size={[.32,.12,.37]} color="#989890"/>
    <Panel at={[0,.13,0]} size={[.23,.35,.25]} color="#2b5068"/>
    <Panel at={[.136,.30,0]} size={[.09,.13,.15]} color="#aaaca4" metal={.55}/>
    <group ref={arm} position={[.17,.30,0]} rotation={[0,0,Math.PI/2]}>
      <Panel at={[.51,0,0]} size={[1.17,.115,.09]} color="#eee9d4"/>
      {[.14,.42,.70,.98].map(x=><Panel key={x} at={[x,.001,0]} size={[.132,.12,.101]} color="#c84431"/>)}
    </group>
  </group>;
}

function Beam({ x, blocked, selected }: {x:number;blocked:boolean;selected:boolean}) {
  return <>
    {[-.58,.58].map(z=><group key={z} position={[x,0,z]}>
      <Panel at={[0,.08,0]} size={[.2,.10,.22]} color="#979d94"/>
      <Panel at={[0,.238,0]} size={[.075,.27,.075]} color="#535b5c" metal={.45}/>
      <Panel at={[0,.397,0]} size={[.17,.125,.12]} color={selected?'#b28542':'#202932'}/>
      <Panel at={[0,.397,-Math.sign(z)*.064]} size={[.057,.053,.02]} color={blocked?'#ed8c55':'#93c8b6'}/>
    </group>)}
    <Line points={blocked?[[x,.40,-.52],[x,.40,-.27]]:[[x,.40,-.52],[x,.40,.52]]}
      color={blocked?'#ed995b':'#8be8d6'} dashed dashSize={.08} gapSize={.045} lineWidth={1.55}/>
  </>;
}

function TrackScene({ nose, phase, entryBlocked, exitBlocked, selected, select }: {
  nose:number; phase:CrossingPhase; entryBlocked:boolean; exitBlocked:boolean; selected:number; select:(value:number)=>void;
}) {
  const closed=phase!=='clear';
  return <>
    <Panel at={[0,-.15,0]} size={[10.5,.27,5.9]} color="#9c754e" radius={.08}/>
    <Panel at={[0,.008,0]} size={[10.4,.05,5.78]} color="#717d57"/>
    <Panel at={[0,.042,0]} size={[10.35,.09,1.10]} color="#777568"/>
    {Array.from({length:36},(_,i)=><Panel key={i} at={[-5+i*.286,.097,0]} size={[.135,.074,.77]} color={i%3?'#51443a':'#625041'}/>)}
    {[-.22,.22].map(z=><Panel key={z} at={[0,.144,z]} size={[10.35,.035,.033]} color="#a0a9ab" metal={.65}/>)}
    {[-1,1].map(side=><group key={side}>
      <Panel at={[.14,.046,1.70*side]} size={[1.21,.075,2.38]} color="#465054"/>
      <Panel at={[.14,.09,1.94*side]} size={[1.08,.012,.04]} color="#e2ded0"/>
      {[1.36,2.17,2.61].map(z=><Panel key={z} at={[.14,.09,z*side]} size={[.034,.013,.25]} color="#d7cdb4"/>)}
    </group>)}
    <Panel at={[.14,.142,0]} size={[1.19,.028,.366]} color="#4c5557"/>
    <Beam x={approach} blocked={entryBlocked} selected={selected===0}/>
    <Beam x={exit} blocked={exitBlocked} selected={selected===1}/>
    <Train nose={nose}/>
    <Barrier closed={closed}/>
    <group position={[.74,0,1.38]}>
      <Panel at={[0,.07,0]} size={[.24,.10,.24]} color="#8a867a"/>
      <Panel at={[0,.32,0]} size={[.059,.54,.069]} color="#5d6768" metal={.6}/>
      <Panel at={[0,.60,0]} size={[.223,.205,.105]} color="#252e30"/>
      <mesh position={[0,.60,.059]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[.069,.069,.038,24]}/>
        <meshStandardMaterial color={closed?'#ff4e36':'#5d2527'} emissive="#ff3b19" emissiveIntensity={closed?2.5:0}/>
      </mesh>
    </group>
    <Panel at={[-2.12,.075,2.06]} size={[1.60,.10,1.08]} color="#947861"/>
    <Panel at={[-2.15,.17,2.03]} size={[.89,.083,.66]} color="#267fa1"/>
    <Panel at={[-2.48,.235,2.03]} size={[.19,.106,.23]} color="#b2b9bd" metal={.52}/>
    <Panel at={[-2.07,.224,2.10]} size={[.25,.039,.14]} color="#222a2e"/>
    {[-.24,.24].map(z=><Panel key={z} at={[-2.04,.231,z+2.02]} size={[.56,.061,.047]} color="#23292c"/>)}
    <Line points={[[-2.22,.26,1.80],[-2.36,.13,1.22],[approach,.12,.76],[approach,.30,.58]]} color="#e3b36f" lineWidth={1.7}/>
    <Line points={[[-1.94,.26,1.79],[-1.60,.10,.95],[-.58,.20,1.24]]} color="#e27f62" lineWidth={1.8}/>
    <Line points={[[-1.88,.24,2.23],[-.96,.11,2.20],[1.80,.11,2.20],[exit,.38,.58]]} color="#68aebe" lineWidth={1.7}/>
    <Line points={[[-1.88,.23,2.43],[-.90,.10,2.56],[1.03,.10,2.56],[.74,.32,1.38]]} color="#c6a5cd" lineWidth={1.7}/>
    {parts.map((part,index)=><group key={part.name}>
      <Line points={[part.at, part.label]} color={index===selected?'#ffdc85':'#cee0dc'} lineWidth={1.4}/>
      {index===selected&&<mesh position={part.at}>
        <sphereGeometry args={[.106,16,10]}/><meshBasicMaterial color="#ffcf73" wireframe/>
      </mesh>}
      <WorldLabel position={part.label} className="gp-marker-anchor">
        <button className="gp-marker" type="button" aria-label={part.name} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button>
      </WorldLabel>
    </group>)}
    <ContactShadows position={[0,.031,0]} opacity={.38} scale={12} blur={2.5} far={4}/>
  </>;
}

type Crossing = { nose:number; phase:CrossingPhase; entryBlocked:boolean; exitBlocked:boolean };
const initial:Crossing={nose:-2.98,phase:'clear',entryBlocked:false,exitBlocked:false};
function advance(current:Crossing, distance:number):Crossing {
  const nose=Math.min(clearPosition,current.nose+distance);
  const blocks=(beam:number)=>nose>=beam&&nose-trainLength<=beam;
  const entryBlocked=blocks(approach);
  const exitBlocked=blocks(exit);
  return {nose,entryBlocked,exitBlocked,phase:crossingPhase(current.phase,entryBlocked,exitBlocked)};
}

const guide = {
  clear:'The gate is up and the warning light is off. The model road is open.',
  occupied:'A recorded a train. The controller keeps the roadway closed while it waits for beam B.',
  leaving:'The train reached B. The barrier stays down until the tail has cleared the exit beam.',
};

export default function RailwayGateDemo() {
  const [crossing,setCrossing]=useState(initial);
  const [running,setRunning]=useState(false);
  const [selected,setSelected]=useState(0);
  const finished=crossing.nose>=clearPosition;
  useEffect(()=>{
    if (!running||finished) return;
    let frame:number;
    let last=performance.now();
    const drive=(now:number)=>{
      const delta=Math.min(.04,(now-last)/1000);
      last=now;
      setCrossing(value=>advance(value,delta*.91));
      frame=requestAnimationFrame(drive);
    };
    frame=requestAnimationFrame(drive);
    return ()=>cancelAnimationFrame(frame);
  },[running,finished]);

  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive model railway crossing">
        <Canvas dpr={[1,1.5]} camera={{position:[4.7,6.2,10.5],fov:43}} fallback={<p>The train controls and crossing readouts are available without WebGL.</p>}>
          <color attach="background" args={['#263b46']}/>
          <ambientLight intensity={1.25}/><directionalLight position={[2,8,5]} intensity={2.33}/><directionalLight position={[-5,4,-3]} color="#bddbec" intensity={.9}/>
          <TrackScene {...crossing} selected={selected} select={setSelected}/>
          <OrbitControls target={[0,.10,0]} minDistance={5} maxDistance={17} enablePan={false} maxPolarAngle={Math.PI/2.04}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Railway crossing readings">
        <div><span>Beam A</span><strong>{crossing.entryBlocked?'Blocked':'Clear'}</strong></div>
        <div><span>Beam B</span><strong>{crossing.exitBlocked?'Blocked':'Clear'}</strong></div>
        <div><span>Barrier command</span><strong>{crossing.phase==='clear'?'Raise':'Lower'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Take the train through the crossing</h3>
      <p>Play a full pass. Pause with the train between beams, or move it in short steps to test what happens when it stops.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>{
          if(finished){setCrossing(initial);setRunning(true);}
          else setRunning(value=>!value);
        }}>{finished?'Replay crossing':running?'Pause train':crossing.nose===initial.nose?'Play crossing':'Resume train'}</button>
        <button type="button" disabled={running||finished} onClick={()=>setCrossing(value=>advance(value,.32))}>Move one step</button>
        <button type="button" onClick={()=>{setRunning(false);setCrossing(initial);}}>Reset crossing</button>
      </div>
      <p className="gp-demo-description" role="status">{finished?'The last carriage has cleared beam B. The barrier is open again.':guide[crossing.phase]}</p>
      <h4>Inspect the crossing</h4>
      <ol className="gp-demo-labels">{parts.map(({name},index)=><li key={name}>
        <button className="gp-part-label" type="button" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{parts[selected].info}</p>
    </div>
  </div>;
}
