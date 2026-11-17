import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {CottonWick,RaisedSoilCup} from './CapillaryWateringParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Lower reservoir',at:[-.45,.43,.87],detail:'The waterline stays below the cup. The immersed wick draws water from this reservoir.'},
  {name:'Cotton wick',at:[.49,.85,.76],detail:'The visible wet section rises along the wick. In the control, the lower tip stays above the waterline.'},
  {name:'Soil cup and probe · A0',at:[.60,1.69,.28],detail:'The probe samples the soil beside the wick at a fixed depth. The cup stays above the water for both trials.'},
  {name:'Arduino Uno logger',at:[-1.44,.39,1.01],detail:'The Uno logs elapsed time and change from the initial relative index.'},
];
const series={suspended:[30,30,29,29,28],immersed:[30,31,38,49,58]};
type Trial=keyof typeof series;
const maxStep=series.immersed.length-1;
const minutesPerStep=10;

function Bench({trial,step,selected,select}:{trial:Trial;step:number;selected:number;select:(index:number)=>void}){
  const immersed=trial==='immersed';
  const wick:Point[]=[[.42,immersed?.24:.55,.49],[.28,.58,.51],[.25,.75,.32],[.27,.94,.12],[.45,1.02,.08]];
  const wetLength=immersed?step:0;
  return <>
    <color attach="background" args={['#40535c']}/>
    <hemisphereLight args={['#eaf5ff','#977c66',2.1]}/><directionalLight position={[-3,6,4]} color="#fff2df" intensity={2.15}/>
    <Box at={[0,-.09,0]} size={[4.64,.18,3.06]} color="#81918a"/>
    <group position={[.37,.015,0]} scale={[1.27,1,1.20]} onClick={()=>select(0)}>
      <RaisedSoilCup moisture={series[trial][step]} water={immersed?70-step*3:70} selected={selected===0}/>
    </group>
    <group onClick={()=>select(1)}>
      {wetLength<wick.length-1&&<CottonWick points={wick.slice(wetLength)} selected={selected===1}/>}
      {wetLength>0&&<CottonWick points={wick.slice(0,wetLength+1)} wet selected={selected===1}/>}
    </group>
    <group position={[.63,1.37,.14]} rotation={[0,0,.13]} onClick={()=>select(2)}>
      <Box at={[0,-.11,0]} size={[.17,.40,.032]} color={selected===2?'#e7b779':'#2a363f'}/>
      <Box at={[0,.08,0]} size={[.184,.119,.042]} color="#253a46"/>
      <Box at={[0,.143,.025]} size={[.121,.064,.062]} color="#e9e0cc"/>
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[-1.43,.09,.93]} size={[1.02,.088,.52]} color={selected===3?'#73aaa8':'#287888'}/>
      <Box at={[-1.81,.167,1.01]} size={[.17,.105,.147]} color="#bdc8ce" metal={.63}/>
      <Box at={[-1.29,.16,.93]} size={[.23,.056,.119]} color="#27353c"/>
      {[.75,1.12].map(z=><Box key={z} at={[-1.36,.16,z]} size={[.59,.055,.046]} color="#233239"/>)}
    </group>
    {['#deb06b','#bd6b60','#344654'].map((color,i)=><Line key={color} points={[[.60+i*.033,1.52,.17],[.11+i*.04,1.48,.48],[-.77+i*.04,.41,.71],[-1.11-i*.09,.18,.76]]} color={color} lineWidth={2.5}/>)}
    {labels.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.34} scale={5.1} far={1.8} resolution={128} frames={1}/>
  </>;
}

const empty={suspended:-1,immersed:-1};
const formatChange=(trial:Trial,step:number)=>step<0?'—':String(series[trial][step]-series[trial][0]);
export default function CapillaryWateringDemo(){
  const [trial,setTrial]=useState<Trial>('suspended');
  const [progress,setProgress]=useState(empty);
  const [selected,select]=useState(0);
  const step=progress[trial];
  const reading=series[trial][Math.max(0,step)];
  const count=Math.max(progress.suspended,progress.immersed)+1;
  const complete=progress.suspended===maxStep&&progress.immersed===maxStep;
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D capillary watering model">
        <Canvas camera={{position:[2.15,3.32,6.24],fov:40}} dpr={[1,1.6]} fallback={<p>Compare the readings in the trial log.</p>}><Bench trial={trial} step={Math.max(0,step)} {...{selected,select}}/><OrbitControls target={[0,.61,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Wick trial readings">
        <div><span>Elapsed time</span><strong>{step<0?'—':step*minutesPerStep+' min'}</strong></div>
        <div><span>Soil index</span><strong>{reading}</strong></div>
        <div><span>Change from baseline</span><strong>{formatChange(trial,step)}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Put the wick in contact with water</h3>
      <p>Log both trials with fresh samples at the same starting moisture. Each click advances a simulated ten minutes.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button gp-secondary" aria-pressed={trial==='suspended'} onClick={()=>{setTrial('suspended');select(1);}}>Suspended wick</button>
        <button type="button" className="gp-button gp-secondary" aria-pressed={trial==='immersed'} onClick={()=>{setTrial('immersed');select(1);}}>Immersed wick</button>
      </div>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={step===maxStep} onClick={()=>setProgress(previous=>({...previous,[trial]:Math.min(previous[trial]+1,maxStep)}))}>{step<0?'Record baseline':'Sample next 10 minutes'}</button>
        <button type="button" onClick={()=>{setTrial('suspended');setProgress(empty);select(0);}}>Reset trials</button>
      </div>
      <p role="status">{complete?'Both trials complete. Compare the change at each interval.':step<0?'Record this trial’s baseline.':step===maxStep?'This trial is complete. Switch wick position to compare.':'Sample again at the next interval.'}</p>
      {count>0&&<table className="gp-mulch-log" aria-label="Wick trial comparison"><thead><tr><th scope="col">Minute</th><th scope="col">Suspended change</th><th scope="col">Immersed change</th></tr></thead><tbody>
        {Array.from({length:count},(_,i)=><tr key={i}><th scope="row">{i*minutesPerStep}</th><td>{formatChange('suspended',i<=progress.suspended?i:-1)}</td><td>{formatChange('immersed',i<=progress.immersed?i:-1)}</td></tr>)}
      </tbody></table>}
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button className="gp-part-label" type="button" aria-pressed={i===selected} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{labels[selected].detail}</p>
    </div>
  </div>;
}
