import {useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import type {Group} from 'three';
import {WorldLabel} from './LabWorkbench';
import {DepthComparisonPot} from './PlantPotDepthParts';
import {GraduatedWaterCylinder} from './SandySoilParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const parts:{name:string;at:Point;detail:string}[]=[
  {name:'Measured dose',at:[-1.43,1.48,.40],detail:'The same 60 mL dose is poured onto the soil surface at the start of each trial.'},
  {name:'Upper probe · A0',at:[.95,1.04,.54],detail:'The sensing blade sits horizontally 4 cm below the soil surface. A0 reports its response.'},
  {name:'Lower probe · A1',at:[.99,.51,.56],detail:'A1 monitors the blade 10 cm below the surface. Its first observed rise may occur later.'},
  {name:'Arduino Uno',at:[1.68,.35,1.13],detail:'The Uno stores each baseline and records the first sample that rises by at least 8 relative-index points.'},
];
const samples=[
  {minute:0,upper:26,lower:27},
  {minute:1,upper:49,lower:28},
  {minute:2,upper:62,lower:32},
  {minute:3,upper:66,lower:40},
  {minute:4,upper:65,lower:48},
  {minute:5,upper:62,lower:53},
];

function PourDrops(){
  const drops=useRef<Group>(null);
  useFrame(({clock})=>{
    drops.current?.children.forEach((drop,i)=>{
      const progress=(clock.elapsedTime*2.4+i*.24)%1;
      drop.position.y=2.10-progress*.63;
    });
  });
  return <group ref={drops}>{Array.from({length:7},(_,i)=><mesh key={i} position={[.29+Math.sin(i)*.13,1.72,-.12+Math.cos(i)*.08]} scale={[.026,.059,.026]}><sphereGeometry args={[1,14,9]}/><meshPhysicalMaterial color="#7ad6f2" roughness={.20} clearcoat={.76}/></mesh>)}</group>;
}

function Bench({upper,lower,poured,pouring,part,select}:{upper:number;lower:number;poured:boolean;pouring:boolean;part:number;select:(i:number)=>void}){
  return <>
    <color attach="background" args={['#40515a']}/>
    <hemisphereLight args={['#e9f4ff','#957b65',2.06]}/><directionalLight position={[-3,6,4]} color="#fff0db" intensity={2.12}/>
    <Box at={[0,-.097,0]} size={[4.76,.19,3.08]} color="#828e89"/>
    <group position={[-1.43,.01,.20]} onClick={()=>select(0)}><GraduatedWaterCylinder dose={poured?0:60} selected={part===0}/></group>
    <group position={[.27,.015,.06]} scale={[1.35,1.32,1.32]}><DepthComparisonPot cutaway upper={upper} lower={lower}/></group>
    {[1.06,.55].map((y,i)=><group key={y} onClick={()=>select(i+1)}>
      <Box at={[.53,y,.16]} size={[.79,.044,.115]} color={part===i+1?'#e5ac64':'#293b41'}/>
      <Box at={[.95,y,.16]} size={[.20,.059,.129]} color="#24343c"/>
      <Box at={[1.04,y+.006,.161]} size={[.104,.070,.085]} color="#e3dfca"/>
      <Box at={[.79,y+.027,.159]} size={[.060,.012,.077]} color="#a48c66" metal={.3}/>
      <Line points={[[1.08,y,.16],[1.31,y,.20],[1.46,.24,.76],[1.65+i*.12,.20,.85]]} color={i?'#6bbacb':'#e7b46e'} lineWidth={3.1}/>
    </group>)}
    <group onClick={()=>select(3)}>
      <Box at={[1.67,.12,1.03]} size={[.93,.086,.48]} color={part===3?'#71a6a2':'#287d8b'}/>
      <Box at={[1.34,.19,1.08]} size={[.18,.103,.139]} color="#bcc9cb" metal={.62}/>
      <Box at={[1.78,.19,1.01]} size={[.24,.056,.094]} color="#25343d"/>
      { [.86,1.22].map(z=><Box key={z} at={[1.71,.18,z]} size={[.60,.054,.048]} color="#283337"/>)}
    </group>
    {pouring&&<PourDrops/>}
    {parts.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={part===i} onClick={()=>select(i)}>{i+1}{part===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.34} scale={5.1} far={1.8} resolution={128} frames={1}/>
  </>;
}

export default function PlantPotDepthDemo(){
  const [baseline,setBaseline]=useState(false);
  const [step,setStep]=useState(-1);
  const [part,select]=useState(0);
  const sample=samples[Math.max(0,step)];
  const logged=samples.slice(0,step+1);
  const upperFirst=logged.find(row=>row.upper-samples[0].upper>=8)?.minute;
  const lowerFirst=logged.find(row=>row.lower-samples[0].lower>=8)?.minute;
  const end=step===samples.length-1;
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D plant pot depth comparison">
        <Canvas camera={{position:[1.55,3.03,6.34],fov:40}} dpr={[1,1.6]} fallback={<p>Compare the two readings below.</p>}><Bench upper={sample.upper} lower={sample.lower} poured={step>=0} pouring={step===0} part={part} select={select}/><OrbitControls target={[0,.63,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Pot depth readings">
        <div><span>Elapsed time</span><strong>{step<0?'—':sample.minute+' min'}</strong></div>
        <div><span>Upper index · 4 cm</span><strong>{sample.upper}</strong></div>
        <div><span>Lower index · 10 cm</span><strong>{sample.lower}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Watch each layer respond</h3>
      <p>Save the baseline, pour 60 mL, and take a sample each simulated minute. The two layers darken as their example readings rise.</p>
      <div className="gp-steps">
        <button className="gp-button gp-secondary" type="button" disabled={baseline} onClick={()=>setBaseline(true)}>Save baseline</button>
        <button className="gp-button" type="button" disabled={!baseline||step>=0} onClick={()=>setStep(0)}>Pour 60 mL</button>
        <button className="gp-button gp-secondary" type="button" disabled={step<0||end} onClick={()=>setStep(previous=>Math.min(previous+1,samples.length-1))}>Sample next minute</button>
        <button type="button" onClick={()=>{setBaseline(false);setStep(-1);select(0);}}>Reset comparison</button>
      </div>
      <p role="status">{!baseline?'Save the starting readings.':step<0?'Baseline saved. Pour the measured dose.':lowerFirst!==undefined?`Upper first observed at ${upperFirst} min. Lower first observed at ${lowerFirst} min.`:upperFirst!==undefined?`Upper first observed at ${upperFirst} min. Lower has not reached the threshold.`:'Sample both depths to find the first rise of 8 points.'}</p>
      {logged.length>0&&<table className="gp-mulch-log" aria-label="Depth comparison log"><thead><tr><th scope="col">Minute</th><th scope="col">Upper rise</th><th scope="col">Lower rise</th></tr></thead><tbody>
        {logged.map(row=><tr key={row.minute}><th scope="row">{row.minute}</th><td>{row.upper-samples[0].upper}</td><td>{row.lower-samples[0].lower}</td></tr>)}
      </tbody></table>}
      <ol className="gp-demo-labels">{parts.map(({name},i)=><li key={name}><button className="gp-part-label" type="button" aria-pressed={part===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{parts[part].detail}</p>
    </div>
  </div>;
}
