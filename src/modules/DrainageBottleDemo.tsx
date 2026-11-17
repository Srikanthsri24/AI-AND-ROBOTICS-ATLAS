import {useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import type {Group} from 'three';
import {WorldLabel} from './LabWorkbench';
import {DrainageColumn} from './DrainageBottleParts';
import {GraduatedWaterCylinder} from './SandySoilParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Dose cylinder',at:[-1.46,1.48,.30],detail:'Measure 60 mL before the pour. In the build, use the cylinder again to measure the collected runoff once dripping stops.'},
  {name:'Soil probe · A0',at:[.42,1.65,.02],detail:'The probe reads the local soil above the drain at a fixed depth. It can still report damp soil after runoff stops.'},
  {name:'Mesh and bottle outlet',at:[.26,.84,.47],detail:'Mesh retains soil while excess water drips through the open neck.'},
  {name:'Runoff basin',at:[.70,.31,.97],detail:'The basin collects the drained water separately from the soil reading.'},
  {name:'Arduino Uno',at:[1.66,.42,.99],detail:'The Uno logs the relative index. The first sample at or below 35 bounds the dry crossing with the previous sample.'},
];
const timeline=[
  {hour:0,index:82,runoff:0},
  {hour:1,index:69,runoff:24},
  {hour:2,index:61,runoff:33},
  {hour:3,index:50,runoff:33},
  {hour:4,index:41,runoff:33},
  {hour:5,index:34,runoff:33},
];
type Sample=(typeof timeline)[number];

function Droplets({pouring,draining}:{pouring:boolean;draining:boolean}){
  const drops=useRef<Group>(null);
  useFrame(({clock})=>{
    if(!drops.current)return;
    drops.current.children.forEach((drop,i)=>{
      const progress=(clock.elapsedTime*(i<5?2.6:1.9)+i*.31)%1;
      drop.position.y=i<5?1.89-progress*.46:.74-progress*.51;
    });
  });
  return <group ref={drops}>
    {Array.from({length:9},(_,i)=><mesh key={i} visible={i<5?pouring:draining} position={[.28+Math.sin(i)*.046,1,.02+Math.cos(i)*.047]} scale={[.026,.061,.026]}>
      <sphereGeometry args={[1,12,8]}/><meshPhysicalMaterial color="#80d7f3" clearcoat={.75} roughness={.18}/>
    </mesh>)}
  </group>;
}

function Bench({sample,pouring,draining,selected,select}:{sample:Sample;pouring:boolean;draining:boolean;selected:number;select:(i:number)=>void}){
  return <>
    <color attach="background" args={['#40545e']}/>
    <hemisphereLight args={['#edf8ff','#927a65',2.12]}/><directionalLight position={[-3,6,4]} color="#fff1dd" intensity={2.2}/>
    <Box at={[0,-.096,0]} size={[4.75,.19,2.98]} color="#85948e"/>
    <group position={[-1.47,.01,.22]} onClick={()=>select(0)}><GraduatedWaterCylinder dose={sample===beforePour?60:0} selected={selected===0}/></group>
    <group onClick={()=>select(3)}>
      <Box at={[.28,.07,.07]} size={[1.83,.13,1.55]} color={selected===3?'#af9474':'#596f7a'}/>
      {[-.65,1.21].map(x=><Box key={x} at={[x,.19,.07]} size={[.065,.20,1.55]} color="#687f8a"/>)}
      {[-.69,.82].map(z=><Box key={z} at={[.28,.19,z]} size={[1.84,.20,.07]} color="#687f8a"/>)}
      {sample.runoff>0&&<mesh position={[.28,.139+sample.runoff*.0009,.07]}><boxGeometry args={[1.62,sample.runoff*.0018,1.34]}/><meshPhysicalMaterial color="#75bad4" clearcoat={.90} roughness={.18}/></mesh>}
    </group>
    {[-.18,.74].flatMap(x=>[-.28,.31].map(z=><Box key={x+','+z} at={[x,.40,z]} size={[.08,.63,.08]} color="#9aa4a3" metal={.54}/>))}
    {[-.18,.74].map(x=><Box key={x} at={[x,.70,.02]} size={[.10,.085,.68]} color="#7b8f97" metal={.38}/>)}
    {[-.20,.24].map(z=><Box key={z} at={[.28,.70,z]} size={[.94,.085,.095]} color="#7b8f97" metal={.38}/>)}
    <group position={[.28,.38,.02]} onClick={()=>select(2)}><DrainageColumn moisture={sample.index} selected={selected===2}/></group>
    <group position={[.43,1.39,.02]} rotation={[0,0,-.13]} onClick={()=>select(1)}>
      <Box at={[0,-.092,0]} size={[.149,.43,.033]} color={selected===1?'#e1ac6b':'#2a3743'}/>
      <Box at={[0,.112,0]} size={[.17,.113,.043]} color="#293c47"/>
      <Box at={[0,.177,.025]} size={[.111,.062,.063]} color="#e6dfcf"/>
    </group>
    <group onClick={()=>select(4)}>
      <Box at={[1.66,.14,.95]} size={[.88,.086,.49]} color={selected===4?'#70a9a7':'#287b8b'}/>
      <Box at={[1.34,.213,.99]} size={[.172,.114,.144]} color="#b8c5c9" metal={.62}/>
      <Box at={[1.79,.212,.94]} size={[.235,.054,.098]} color="#29353e"/>
      {[.77,1.14].map(z=><Box key={z} at={[1.73,.205,z]} size={[.55,.055,.05]} color="#26343a"/>)}
    </group>
    {['#dfa958','#be6655','#344753'].map((color,i)=><Line key={color} points={[[.40+i*.035,1.57,.061],[.70+i*.04,1.58,.37],[1.31+i*.044,.34,.69],[1.58+i*.07,.22,.77]]} color={color} lineWidth={2.4}/>)}
    <Droplets {...{pouring,draining}}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.35} scale={5.2} far={1.9} resolution={128} frames={1}/>
  </>;
}

const beforePour={hour:0,index:27,runoff:0};
export default function DrainageBottleDemo(){
  const [step,setStep]=useState(-1);
  const [selected,select]=useState(0);
  const sample=timeline[step]??beforePour;
  const dry=step>=0&&sample.index<=35;
  const drained=sample.runoff===33;
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D drainage bottle experiment">
        <Canvas camera={{position:[2.35,3.15,6.12],fov:41}} dpr={[1,1.6]} fallback={<p>Use the readouts to compare runoff and the soil index.</p>}><Bench {...{sample,selected,select}} pouring={step===0} draining={step===0||step===1}/><OrbitControls target={[0,.61,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Drainage and soil readings">
        <div><span>Elapsed time</span><strong>{step<0?'—':sample.hour+' h'}</strong></div><div><span>Runoff collected</span><strong>{sample.runoff} mL</strong></div><div><span>Relative soil index</span><strong>{sample.index}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Follow the water after the pour</h3>
      <p>The probe starts calibrated. Pour 60 mL, then step through the simulated hourly readings. Compare when dripping stops with when the index reaches 35 or lower.</p>
      <div className="gp-steps"><button className="gp-button" type="button" disabled={step>=0} onClick={()=>{setStep(0);select(2);}}>Pour 60 mL</button><button className="gp-button gp-secondary" type="button" disabled={step<0||dry} onClick={()=>setStep(previous=>Math.min(previous+1,timeline.length-1))}>Record next hour</button><button type="button" onClick={()=>{setStep(-1);select(0);}}>Reset trial</button></div>
      <p role="status">{step<0?'Ready for the measured pour.':dry?'First dry-range reading at 5 h. The crossing was between 4 h and 5 h.':drained?'Runoff has stopped. The soil is still above the dry threshold.':'Water is draining while the probe reads above the dry threshold.'}</p>
      {step>=0&&<table className="gp-mulch-log" aria-label="Drainage sample log"><thead><tr><th scope="col">Hour</th><th scope="col">Runoff</th><th scope="col">Soil index</th></tr></thead><tbody>{timeline.slice(0,step+1).map(row=><tr key={row.hour}><th scope="row">{row.hour}</th><td>{row.runoff} mL</td><td>{row.index}</td></tr>)}</tbody></table>}
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={i===selected} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{labels[selected].detail}</p>
    </div>
  </div>;
}
