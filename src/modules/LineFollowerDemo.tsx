import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import type { Group } from 'three';
import { lineSamples,lineStart,lineStep,trackGap,trackZ,type LinePose } from '../data/line-follower';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { ReflectanceArray } from './LineFollowerParts';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type State={pose:LinePose;state:'ready'|'running'|'lost'|'complete';wheels:number[]};
const initial:State={pose:lineStart,state:'ready',wheels:[0,0]};
const labels=[
  ['Reflectance array','Three analog sensors compare the line to light and dark references. The three dots show their readings.'],
  ['Left drive wheel','The wheel on the side with the stronger line reading slows down so the rover turns toward that side.'],
  ['Right drive wheel','A centered reading makes both wheels run at the same speed. Without the line, both outputs go to zero.'],
  ['Tape route','Remove a short strip of tape to test loss detection. Reposition the rover on the visible line to try again.'],
] as const;

function Marker({i,at,selected,select}:{i:number;at:Point;selected:number;select:(i:number)=>void}){
  return <WorldLabel position={at} className="gp-marker-anchor">
    <button type="button" className="gp-marker" aria-pressed={i===selected} aria-label={labels[i][0]} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{labels[i][0]}</span>}</button>
  </WorldLabel>;
}
function Course({run,curve,gap,selected,select,markers,samples}:{run:State;curve:boolean;gap:boolean;selected:number;select:(i:number)=>void;markers:boolean;samples:number[]}){
  const wheels=useRef<(Group|null)[]>([]);
  useFrame((_,dt)=>wheels.current.forEach((wheel,i)=>{if(wheel)wheel.rotation.z-=dt*run.wheels[i]/13;}));
  const mark=(i:number,at:Point)=>markers?<Marker {...{i,at,selected,select}}/>:null;
  return <>
    <color attach="background" args={['#26354a']}/>
    <hemisphereLight args={['#e4efff','#6b5b48',2.35]}/>
    <directionalLight position={[-4,7,6]} intensity={2.35}/>
    <Box at={[0,-.14,.03]} size={[6.58,.25,3.89]} color="#997e62"/>
    <Box at={[0,.010,.03]} size={[6.19,.055,3.36]} color="#d6d9d1"/>
    {[-1.53,1.53].map(z=><Box key={z} at={[0,.046,z]} size={[5.84,.014,.037]} color="#849391"/>)}
    {Array.from({length:72},(_,i)=>{
      const x=-2.83+i*.08;
      if(gap&&trackGap(x))return null;
      const z=trackZ(x,curve);
      const tangent=Math.atan2(trackZ(x+.04,curve)-trackZ(x-.04,curve),.08);
      return <group key={i} position={[x,.045,z]} rotation={[0,-tangent,0]} onClick={()=>select(3)}>
        <mesh><boxGeometry args={[.12,.013,.147]}/><meshStandardMaterial color={selected===3?'#515655':'#23292e'} roughness={.78}/></mesh>
      </group>;
    })}
    {[-2.52,2.51].map(x=><Box key={x} at={[x,.049,.90]} size={[.26,.013,.50]} color={x<0?'#d6b97d':'#88aa97'}/>)}
    {mark(3,[.69,.15,-.52])}
    <group position={[run.pose.x,.06,run.pose.z]} rotation={[0,-run.pose.heading,0]}>
      <Box at={[-.12,.151,0]} size={[.81,.071,.61]} color="#40566a"/>
      <Box at={[-.34,.246,0]} size={[.27,.17,.42]} color="#344354"/>
      <group position={[-.07,.215,.008]} scale={.50}><Uno at={[0,0,0]}/></group>
      {[-1,1].map((sign,i)=><group key={sign} position={[-.18,.107,sign*.35]} ref={node=>{wheels.current[i]=node;}} onClick={()=>select(i+1)}>
        <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.159,.159,.098,28]}/><meshStandardMaterial color={selected===i+1?'#98744a':'#222a33'} roughness={.90}/></mesh>
        <mesh position={[0,0,sign*.053]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.094,.094,.023,20]}/><meshStandardMaterial color="#b69e5b" metalness={.43}/></mesh>
        <Box at={[.026,0,sign*.069]} size={[.101,.021,.012]} color="#8b6a43"/>
      </group>)}
      {mark(1,[-.40,.23,-.45])}{mark(2,[-.30,.24,.45])}
      <Box at={[.271,.117,0]} size={[.33,.08,.20]} color="#7a8c94" metal={.46}/>
      <group position={[.40,.048,0]} scale={.65} onClick={()=>select(0)}><ReflectanceArray selected={selected===0}/></group>
      {samples.map((value,i)=><group key={i}>
        <mesh position={[.396,.072,(i-1)*.135]}><sphereGeometry args={[.027,18,14]}/><meshStandardMaterial color={value>.22?'#69bcab':'#6d7780'} emissive="#6de1be" emissiveIntensity={value*2}/></mesh>
      </group>)}
      {mark(0,[.48,.237,.09])}
      <Line points={[[.40,.082,.02],[.22,.15,-.05],[.125,.247,-.10]]} color="#d49252" lineWidth={2.4}/>
    </group>
  </>;
}

export default function LineFollowerDemo(){
  const [run,setRun]=useState<State>(initial);
  const [reference,setReference]=useState<'none'|'light'|'ready'>('none');
  const [curve,setCurve]=useState(true);
  const [gap,setGap]=useState(false);
  const [selected,select]=useState(0);
  const [markers,setMarkers]=useState(true);
  const moving=run.state==='running';
  const samples=lineSamples(run.pose,curve,gap);
  useEffect(()=>{
    if(!moving)return;
    const timer=window.setInterval(()=>setRun(old=>old.state==='running'?lineStep(old.pose,curve,gap):old),38);
    return ()=>window.clearInterval(timer);
  },[moving,curve,gap]);
  const text=run.state==='lost'?'Line lost · Motors in standby':run.state==='complete'?'Finish reached':moving?'Following the line':reference==='none'?'Capture the light reference':reference==='light'?'Capture the dark reference':'Calibrated · Ready to start';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D line-following course">
        <Canvas camera={{position:[3.3,6.2,7.3],fov:42}} dpr={[1,1.6]} fallback={<p>Use the readouts to follow the steering response.</p>}>
          <Course {...{run,curve,gap,selected,select,markers,samples}}/>
          <OrbitControls target={[0,.20,.08]} minDistance={4.8} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Line follower readings">
        {samples.map((value,i)=><div key={i}><span>{['Left','Center','Right'][i]} sensor</span><strong>{Math.round(value*100)}%</strong></div>)}
        <div><span>Left / right PWM</span><strong>{run.wheels.join(' / ')}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Calibrate and follow the tape</h3>
      <p>Capture both reference surfaces, run the curve and compare the wheel speeds. Introduce a gap to test the lost-line stop.</p>
      <div className="gp-steps">
        <button type="button" disabled={moving} onClick={()=>setReference('light')}>W · Capture light</button>
        <button type="button" disabled={moving||reference!=='light'} onClick={()=>setReference('ready')}>B · Capture dark</button>
      </div>
      <div className="gp-steps">
        <button type="button" disabled={moving} aria-pressed={curve} onClick={()=>{setCurve(!curve);setRun(initial);}}>Curved track</button>
        <button type="button" aria-pressed={gap} onClick={()=>setGap(!gap)}>{gap?'Restore tape':'Remove tape section'}</button>
        <button type="button" aria-pressed={markers} onClick={()=>setMarkers(!markers)}>Scene labels</button>
      </div>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={reference!=='ready'||run.state==='lost'||run.state==='complete'} onClick={()=>setRun({...run,state:moving?'ready':'running',wheels:[0,0]})}>{moving?'Stop rover':'Start rover'}</button>
        <button type="button" onClick={()=>setRun(initial)}>Reposition at start</button>
      </div>
      <p role="status" className="gp-demo-description">{text}</p>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
