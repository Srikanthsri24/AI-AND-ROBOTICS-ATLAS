import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { Quaternion, Vector3 } from 'three';
import { advanceChair, chairCommand, maxAngle, radioTimeout, setChairLink, startChair, type ChairState } from '../data/stand-up-chair.mjs';
import { WorldLabel } from './LabWorkbench';
import { SolarMeterSolid as Box } from './SolarMeterParts';

type Point=[number,number,number];
const labels=[
  ['RF receiver','The simulated receiver keeps a heartbeat active while the link is connected. An interruption starts the watchdog timer.'],
  ['Raspberry Pi controller','The simulated Pi checks command and link state. A reconnect requires a new Raise or Lower request.'],
  ['Seat linkage','The seat rotates about the front pivot. The back support rises as the rear of the seat lifts.'],
  ['Linear actuator model','The actuator extends or retracts between the chassis and the lifting seat. Its drive drops at either travel limit.'],
  ['Position limits','The model stops at either endpoint. A stop command or expired RF heartbeat holds the current angle.'],
];
const up=new Vector3(0,1,0);
function Tube({start,end,radius,color}:{start:Point;end:Point;radius:number;color:string}) {
  const a=new Vector3(...start),b=new Vector3(...end);
  const axis=new Vector3().subVectors(b,a);
  const rotation=new Quaternion().setFromUnitVectors(up,axis.clone().normalize());
  return <mesh position={a.add(b).multiplyScalar(.5)} quaternion={rotation}>
    <cylinderGeometry args={[radius,radius,axis.length(),18]}/><meshStandardMaterial color={color} metalness={.69} roughness={.38}/>
  </mesh>;
}

function ChairScene({state,selected,select}:{state:ChairState;selected:number;select:(index:number)=>void}) {
  const radians=state.angle*Math.PI/180;
  const rear:Point=[.38-.86*Math.cos(radians),.94+.86*Math.sin(radians),0];
  const rod:Point=[.38-.64*Math.cos(radians),.88+.64*Math.sin(radians),.21];
  const actuator:Point=[.23,.27,.21];
  const casing:Point=[actuator[0]+(rod[0]-actuator[0])*.61,actuator[1]+(rod[1]-actuator[1])*.61,rod[2]];
  const anchors:Point[]=[[-1.13,.47,-.73],[-1.29,.42,.59],[rear[0]-.12,rear[1]+.30,0],[(rod[0]+actuator[0])*.5,(rod[1]+actuator[1])*.5,.45],[.46,.91,.59]];
  return <>
    <color attach="background" args={['#243a4e']}/>
    <hemisphereLight args={['#e5f0fd','#8c7562',2.13]}/>
    <directionalLight position={[-4,7,6]} color="#fff0dd" intensity={2.4}/>
    <directionalLight position={[4,4,-5]} color="#b6d4ed" intensity={1.3}/>
    <RoundedBox args={[4.20,.18,2.90]} radius={.05} position={[0,-.10,0]}>
      <meshStandardMaterial color="#728990" roughness={.8}/>
    </RoundedBox>
    {[-.40,.40].map(z=><group key={z}>
      <Tube start={[-.82,.29,z]} end={[.72,.29,z]} radius={.047} color="#586d79"/>
      <Tube start={[.64,.29,z]} end={[.38,.94,z]} radius={.042} color="#83949d"/>
      <Tube start={[-.62,.29,z]} end={[.38,.94,z]} radius={.032} color="#718793"/>
      <Tube start={[.72,.29,z]} end={[1.05,.18,z]} radius={.036} color="#788994"/>
      <group position={[-.49,.47,z*1.47]}>
        <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.463,.463,.081,48]}/><meshStandardMaterial color="#272d36" roughness={.85}/></mesh>
        <mesh rotation={[Math.PI/2,0,0]} position={[0,0,z*.12]}><cylinderGeometry args={[.383,.383,.020,40]}/><meshStandardMaterial color="#607784" metalness={.65} roughness={.38}/></mesh>
        {Array.from({length:10},(_,i)=><group key={i} rotation={[0,0,i*Math.PI/5]}><Box at={[.19,0,z*.16]} size={[.31,.032,.029]} color="#a3b1b2" metal={.67}/></group>)}
        <mesh rotation={[Math.PI/2,0,0]} position={[0,0,z*.20]}><cylinderGeometry args={[.086,.086,.067,22]}/><meshStandardMaterial color="#808e93" metalness={.75}/></mesh>
      </group>
      <mesh rotation={[Math.PI/2,0,0]} position={[.70,.137,z*1.1]}><cylinderGeometry args={[.129,.129,.069,28]}/><meshStandardMaterial color="#222a33" roughness={.81}/></mesh>
    </group>)}
    <Box at={[.89,.145,0]} size={[.38,.065,.64]} color="#535f6a" metal={.52}/>
    <group position={[.38,.94,0]} rotation={[0,0,-radians]} onClick={()=>select(2)}>
      <Box at={[-.44,-.03,0]} size={[.91,.082,.76]} color={selected===2?'#ddac62':'#607882'} metal={.61}/>
      <RoundedBox position={[-.43,.049,0]} args={[.87,.115,.70]} radius={.039}><meshStandardMaterial color="#344359" roughness={.82}/></RoundedBox>
      <group position={[-.86,.04,0]} rotation={[0,0,radians]}>
        <Tube start={[0,0,-.32]} end={[-.13,.77,-.32]} radius={.036} color="#8295a0"/>
        <Tube start={[0,0,.32]} end={[-.13,.77,.32]} radius={.036} color="#8295a0"/>
        <RoundedBox position={[-.069,.43,0]} args={[.105,.62,.60]} radius={.040}><meshStandardMaterial color="#425774" roughness={.86}/></RoundedBox>
        <Tube start={[-.13,.75,-.32]} end={[-.13,.75,.32]} radius={.034} color="#839aa5"/>
      </group>
    </group>
    <group onClick={()=>select(3)}>
      <Tube start={actuator} end={casing} radius={.081} color={selected===3?'#e8b072':'#737d89'}/>
      <Tube start={casing} end={rod} radius={.036} color="#c4cccf"/>
    </group>
    <group onClick={()=>select(4)}>
      <Box at={[.422,.83,.43]} size={[.18,.12,.13]} color={selected===4?'#edb76d':'#36434a'}/>
      <mesh position={[.454,.897,.47]}><sphereGeometry args={[.037,16,10]}/><meshStandardMaterial color={state.angle<=0||state.angle>=maxAngle?'#fab867':'#737982'} emissive="#e6892b" emissiveIntensity={state.angle<=0||state.angle>=maxAngle ? .7 : 0}/></mesh>
    </group>
    <group position={[-1.27,.095,.61]} onClick={()=>select(1)}>
      <Box at={[0,-.05,0]} size={[.72,.09,.55]} color={selected===1?'#e6b271':'#2d6e59'} metal={.20}/>
      <Box at={[0,.008,0]} size={[.64,.046,.47]} color="#37765e"/>
      <Box at={[-.047,.045,.03]} size={[.19,.055,.18]} color="#222936"/>
      {[-.135,.135].map(z=><Box key={z} at={[.24,.076,z]} size={[.13,.14,.135]} color="#a6b6c0" metal={.67}/>)}
      <Box at={[0,.056,-.19]} size={[.46,.05,.055]} color="#262b31"/>
      {Array.from({length:13},(_,i)=><Box key={i} at={[-.215+i*.032,.088,-.19]} size={[.014,.013,.022]} color="#d2ba81" metal={.55}/>)}
    </group>
    <group position={[-1.15,.085,-.71]} onClick={()=>select(0)}>
      <Box at={[0,0,0]} size={[.63,.13,.43]} color={selected===0?'#d5ad70':'#37536d'}/>
      <Box at={[.05,.073,0]} size={[.40,.029,.33]} color="#2d7780"/>
      <Tube start={[-.17,.07,-.12]} end={[-.23,.37,-.18]} radius={.022} color="#393e4c"/>
      <mesh position={[.18,.09,.074]}><sphereGeometry args={[.032,16,10]}/><meshStandardMaterial color={state.link?'#7de0b1':'#d98470'} emissive={state.link?'#348565':'#9e463c'} emissiveIntensity={.95}/></mesh>
    </group>
    <Line points={[[-1.04,.16,-.74],[-1.00,.095,-.35],[-1.22,.16,.38]]} color="#56a598" lineWidth={3}/>
    <Line points={[[-1.12,.15,.65],[-.83,.14,.79],[.18,.17,.35],[.24,.31,.25]]} color={state.drive?'#e7ba79':'#a4775c'} lineWidth={3}/>
    {anchors.map((at,index)=><WorldLabel key={labels[index][0]} position={at} className="gp-marker-anchor">
      <button type="button" className="gp-marker" aria-label={labels[index][0]} aria-pressed={selected===index} onClick={()=>select(index)}>
        {index+1}{selected===index&&<span className="gp-demo-marker-name">{labels[index][0]}</span>}
      </button>
    </WorldLabel>)}
    <ContactShadows position={[0,.004,0]} opacity={.35} scale={4.4} far={1.3} resolution={128} frames={1}/>
  </>;
}

export default function StandUpChairDemo() {
  const [state,setState]=useState(startChair);
  const [selected,select]=useState(0);
  useEffect(()=>{
    if(!state.drive) return;
    let previous=performance.now();
    const timer=window.setInterval(()=>{
      const now=performance.now(), elapsed=now-previous;
      previous=now;
      setState(current=>advanceChair(current,elapsed));
    },40);
    return ()=>window.clearInterval(timer);
  },[state.drive]);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D stand-up wheelchair bench model">
        <Canvas camera={{position:[3.35,3.0,5.25],fov:40}} dpr={[1,1.6]} fallback={<p>Follow the position and drive readings below.</p>}>
          <ChairScene {...{state,selected,select}}/>
          <OrbitControls target={[0,.65,0]} minDistance={3.4} maxDistance={9} enablePan={false} maxPolarAngle={1.49}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Stand-up chair readings">
        <div><span>Seat angle</span><strong>{Math.round(state.angle)}°</strong></div>
        <div><span>Actuator</span><strong>{state.drive>0?'Extending':state.drive<0?'Retracting':'Off'}</strong></div>
        <div><span>RF link</span><strong>{state.link?'Connected':'Interrupted'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Control the rider-free model</h3>
      <p>Raise the seat, stop partway, then try opening the RF link while it moves. Watch the actuator and angle to see when the controller stops movement.</p>
      <div className="gp-steps">
        <button type="button" onClick={()=>setState(current=>chairCommand(current,'raise'))}>Raise seat</button>
        <button type="button" onClick={()=>setState(current=>chairCommand(current,'lower'))}>Lower seat</button>
        <button type="button" onClick={()=>setState(current=>chairCommand(current,'stop'))}>Stop movement</button>
      </div>
      <div className="gp-steps"><button type="button" onClick={()=>setState(current=>setChairLink(current,!current.link))}>{state.link?'Interrupt RF link':'Restore RF link'}</button>
        <button type="button" onClick={()=>setState(startChair())}>Reset model</button></div>
      <p role="status">{state.notice}</p>
      <p>The illustration travels 0–{maxAngle}° and its simulated timeout is {radioTimeout} ms. After reconnecting, send a fresh motion command.</p>
      <ol className="gp-demo-labels">{labels.map(([name],index)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={index===selected} onClick={()=>select(index)}><span>{index+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
