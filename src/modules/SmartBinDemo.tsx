import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import type { Group } from 'three';
import { smartWasteBin, binLimits } from '../data/smart-waste-bin';
import { WorldLabel } from './LabWorkbench';
import { EthernetShieldGeometry } from './AquacleanDemo';

type Point=[number,number,number];
function Block({at,size,color,metal=0}:{at:Point;size:Point;color:string;metal?:number}) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.13} smoothness={2}>
    <meshStandardMaterial color={color} metalness={metal} roughness={metal>.35?.34:.67}/>
  </RoundedBox>;
}

export function RollerSwitch() {
  return <>
    <Block at={[0,0,0]} size={[.42,.20,.19]} color="#262f36"/>
    <Block at={[.05,.126,.01]} size={[.383,.036,.109]} color="#aab6bd" metal={.65}/>
    <mesh position={[.226,.144,.01]} rotation={[Math.PI/2,0,0]}>
      <cylinderGeometry args={[.06,.06,.09,26]}/><meshStandardMaterial color="#cad1ca" metalness={.55} roughness={.31}/>
    </mesh>
    {[-.134,0,.134].map(x=><Block key={x} at={[x,-.15,0]} size={[.046,.13,.022]} color="#bda884" metal={.67}/>)}
  </>;
}

function BinShell({cutaway=false}: {cutaway?:boolean}) {
  return <>
    <Block at={[0,.068,0]} size={[1.49,.137,1.34]} color="#293e48"/>
    <Block at={[0,1.17,-.651]} size={[1.51,2.19,.07]} color="#496473"/>
    {[-.737,.737].map(x=><Block key={x} at={[x,1.17,0]} size={[.071,2.19,1.33]} color="#4c6875"/>)}
    <mesh position={[0,1.17,.651]}>
      <boxGeometry args={[1.50,2.19,.068]}/>
      <meshStandardMaterial color="#547884" roughness={.58} transparent={cutaway} opacity={cutaway?.19:1} depthWrite={!cutaway}/>
    </mesh>
    {[-.65,.65].map(z=><Block key={z} at={[0,2.27,z]} size={[1.57,.104,.099]} color="#344d5b"/>)}
    {[-.74,.74].map(x=><Block key={x} at={[x,2.27,0]} size={[.101,.104,1.31]} color="#344d5b"/>)}
    {[-.67,.67].map(x=><Block key={x} at={[x,1.15,.685]} size={[.032,2.09,.023]} color="#7895a0"/>)}
  </>;
}

function BinLid({open=false,sensor=false}: {open?:boolean;sensor?:boolean}) {
  const hinge=useRef<Group>(null);
  useFrame((_,dt)=>{
    if(hinge.current) hinge.current.rotation.x+=((open?-1.02:0)-hinge.current.rotation.x)*Math.min(dt*8,1);
  });
  return <group ref={hinge} position={[0,2.35,-.63]}>
    <Block at={[0,.055,.65]} size={[1.68,.141,1.40]} color="#384950"/>
    <Block at={[0,.132,.68]} size={[1.52,.045,1.24]} color="#465d66"/>
    <Block at={[0,.067,1.37]} size={[.43,.107,.14]} color="#63777d"/>
    {sensor&&<>
      <Block at={[0,-.038,.62]} size={[.48,.043,.25]} color="#246e9e"/>
      {[-.12,.12].map(x=><mesh key={x} position={[x,-.094,.62]}>
        <cylinderGeometry args={[.076,.076,.091,28]}/>
        <meshStandardMaterial color="#aab7c0" roughness={.34} metalness={.61}/>
      </mesh>)}
      <Line points={[[.19,-.03,.62],[.29,-.015,.38],[.25,-.028,.18],[.23,.014,.018]]} color="#e6aa60" lineWidth={1.9}/>
    </>}
  </group>;
}

export function WasteBinGeometry() {
  return <><BinShell/><BinLid open/></>;
}

type BinSample={fill:number;open:boolean;fault:boolean;settling:boolean;collection:boolean};
const initial:BinSample={fill:32,open:false,fault:false,settling:false,collection:false};
type BinStatus='Available'|'Collection needed'|'Lid open'|'Settling'|'Sensor fault';

function latch(sample:BinSample):BinSample {
  if(sample.open||sample.fault||sample.settling) return sample;
  return {...sample,collection:sample.fill>=binLimits.pickupPercent ||
    (sample.collection&&sample.fill>binLimits.clearPercent)};
}

function statusOf(sample:BinSample):BinStatus {
  if(sample.open) return 'Lid open';
  if(sample.settling) return 'Settling';
  if(sample.fault) return 'Sensor fault';
  return sample.collection?'Collection needed':'Available';
}

const notes:Record<BinStatus,string>={
  Available:'The collection light is off.',
  'Collection needed':'The red collection light is on.',
  'Lid open':'Ranging is paused.',
  Settling:'The lid has just closed. Waiting for a stable reading.',
  'Sensor fault':'No usable echo. The fill level is unavailable.',
};
const anchors:Point[]=[[-.70,1.02,.52],[0,2.26,.02],[.67,2.244,-.40],
  [1.65,.46,-.06],[1.72,.58,-.09],[1.60,.53,.69],[1.60,.34,.57]];
const labels:Point[]=[[-.91,1.41,.80],[-.16,2.88,.20],[.82,2.70,-.36],
  [1.62,1.02,-.50],[1.94,1.18,-.17],[1.79,1.0,.78],[2.14,.80,.43]];

function BinScene({sample,cutaway,selected,select}: {
  sample:BinSample;cutaway:boolean;selected:number;select:(index:number)=>void;
}) {
  const status=statusOf(sample);
  const measured=status==='Available'||status==='Collection needed';
  const top=.124+sample.fill/100*1.77;
  return <>
    <Block at={[.54,-.10,0]} size={[4.50,.17,3.19]} color="#455968"/>
    <BinShell cutaway={cutaway}/>
    <BinLid open={sample.open} sensor/>
    <group position={[.64,2.20,-.40]} scale={.47}><RollerSwitch/></group>
    {sample.fill>0&&<>
      <Block at={[0,(top+.14)/2,0]} size={[1.32,top-.14,.97]} color="#a9aa92"/>
      {Array.from({length:Math.ceil(sample.fill/7)},(_,index)=><Block key={index}
        at={[(index%3-1)*.32,.17+(top-.16)*(index+.5)/Math.ceil(sample.fill/7),.50]}
        size={[.282,.085,.143]} color={['#d5c498','#b4c2a1','#c3a88a'][index%3]}/>)}
      <Block at={[0,top,.0]} size={[1.23,.034,.97]} color="#e0c8a0"/>
    </>}
    {measured&&cutaway&&<Line points={[[0,2.21,0],[0,top+.02,0]]} color="#8cf7dc" lineWidth={2.1} dashed dashSize={.11} gapSize={.073}/>}
    <Block at={[1.64,.134,.29]} size={[1.25,.24,1.7]} color="#2f4750"/>
    <Block at={[1.65,.348,-.061]} size={[.84,.086,.61]} color="#1e5b82"/>
    <group position={[1.65,.44,-.062]} scale={.9}><EthernetShieldGeometry/></group>
    <Block at={[1.63,.339,.61]} size={[.79,.09,.37]} color="#dfdfcd"/>
    <Block at={[1.81,.398,.62]} size={[.21,.037,.051]} color="#c9ac70"/>
    <mesh position={[1.53,.503,.62]}>
      <capsuleGeometry args={[.057,.105,6,21]}/>
      <meshStandardMaterial color={status==='Collection needed'?'#ff4b46':'#8f4547'} emissive="#ff3026"
        emissiveIntensity={status==='Collection needed'?2.2:0}/>
    </mesh>
    <Line points={[[1.36,.49,.10],[1.36,.46,.39],[1.52,.40,.60]]} color="#e27c68" lineWidth={2}/>
    <Line points={[[.25,2.34,-.66],[.65,2.33,-.69],[.98,1.79,-.61],[.98,.64,-.36],[1.27,.49,-.18]]}
      color="#eab15d" lineWidth={2}/>
    {Array.from(new Set([0,1,selected])).map(index=>{
      const anchor:Point=index===1&&sample.open?[0,2.79,-.36]:anchors[index];
      const label:Point=index===1&&sample.open?[-.16,3.12,-.25]:labels[index];
      return <group key={index}>
        <Line points={[anchor,label]} color={selected===index?'#ffe18a':'#a8c8d0'} lineWidth={1.5}/>
        <WorldLabel position={label} className="gp-marker-anchor"><button type="button" className="gp-marker"
          aria-label={smartWasteBin.parts[index][0]} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button></WorldLabel>
      </group>;
    })}
    <ContactShadows position={[.6,-.018,0]} opacity={.37} blur={2.3} far={4} scale={6}/>
  </>;
}

export default function SmartBinDemo() {
  const [sample,setSample]=useState(initial);
  const [online,setOnline]=useState(true);
  const [stale,setStale]=useState(false);
  const [last,setLast]=useState<BinStatus>('Available');
  const [cutaway,setCutaway]=useState(true);
  const [selected,setSelected]=useState(1);
  const status=statusOf(sample);
  const hasReading=status==='Available'||status==='Collection needed';
  const gap=binLimits.emptyMm-(binLimits.emptyMm-binLimits.referenceFullMm)*sample.fill/100;

  useEffect(()=>{
    if(!sample.settling) return;
    const timer=window.setTimeout(()=>setSample(current=>latch({...current,settling:false})),500);
    return ()=>window.clearTimeout(timer);
  },[sample.settling]);
  useEffect(()=>{
    if(online) return;
    const timer=window.setTimeout(()=>setStale(true),2000);
    return ()=>window.clearTimeout(timer);
  },[online]);
  function toggleNetwork() {
    if(online) setLast(status);
    setStale(false);
    setOnline(!online);
  }
  function toggleLid() {
    setSample(current=>({...current,open:!current.open,settling:current.open}));
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive waste bin cutaway">
        <Canvas dpr={[1,1.5]} camera={{position:[4.1,3.1,5.2],fov:43}} fallback={<p>The sensor and monitor controls are available without the 3D view.</p>}>
          <color attach="background" args={['#233640']}/>
          <ambientLight intensity={1.2}/>
          <directionalLight position={[-1,6,4]} intensity={2.4}/>
          <BinScene sample={sample} cutaway={cutaway} selected={selected} select={setSelected}/>
          <OrbitControls target={[.48,1.28,0]} minDistance={4} maxDistance={13} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Simulated waste bin readings">
        <div><span>Sensor gap</span><strong>{hasReading?`${(gap/10).toFixed(1)} cm`:'Unavailable'}</strong></div>
        <div><span>Calibrated fill</span><strong>{hasReading?`${sample.fill}%`:'Unavailable'}</strong></div>
        <div><span>Collection light</span><strong>{status==='Collection needed'?'On':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Test a collection cycle</h3>
      <p>The collection notice turns on at 80% and clears at 70%. Try 80%, then 75%, then 70% to see why one threshold turns the light on and another turns it off.</p>
      <label htmlFor="gp-bin-fill">Test target height · {sample.fill}%</label>
      <input id="gp-bin-fill" className="gp-lidar-range" type="range" min={0} max={100} value={sample.fill}
        onChange={event=>{const fill=Number(event.target.value);setSample(current=>latch({...current,fill}));}}/>
      <div className="gp-steps" role="group" aria-label="Test target presets">
        {[32,70,75,80,95].map(fill=><button type="button" key={fill} aria-pressed={sample.fill===fill}
          onClick={()=>setSample(current=>latch({...current,fill}))}>{fill}%</button>)}
      </div>
      <div className="gp-steps">
        <button className="gp-button" type="button" onClick={toggleLid}>{sample.open?'Close lid':'Open lid'}</button>
        <button type="button" aria-pressed={sample.fault} onClick={()=>setSample(current=>latch({...current,fault:!current.fault}))}>
          {sample.fault?'Restore echo':'Simulate missing echo'}
        </button>
        <button type="button" aria-pressed={cutaway} onClick={()=>setCutaway(value=>!value)}>{cutaway?'Show whole bin':'Show cutaway'}</button>
      </div>
      <p className="gp-check" role="status">{status} · {notes[status]}</p>
      <section className="gp-program-card" aria-label="Simulated waste bin monitor">
        <h4>Local Ethernet monitor</h4>
        <p><strong>{online?'Live telemetry':stale?'Stale · no updates':'Waiting for telemetry'}</strong> · {online?status:`Last received: ${last}`}</p>
        <button className="gp-button gp-secondary" type="button" aria-pressed={online} onClick={toggleNetwork}>
          {online?'Disconnect monitor':'Reconnect monitor'}
        </button>
      </section>
      <h4>Inspect the parts</h4>
      <ol className="gp-demo-labels">{smartWasteBin.parts.map(([part],index)=><li key={part}>
        <button className="gp-part-label" type="button" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{part}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{smartWasteBin.parts[selected][2]}</p>
    </div>
  </div>;
}
