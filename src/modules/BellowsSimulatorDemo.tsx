import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { bellowsReading, bellowsTrials } from '../data/bellows-simulator';
import { SoloKnob } from './BellowsSimulatorPart';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';
import { SolarMeterSolid as Box } from './SolarMeterParts';

type Point=[number,number,number];
type State={mode:'ready'|'running'|'alarm';ms:number;reason:string;trace:number[]};
const idle:State={mode:'ready',ms:0,reason:'Ready',trace:[]};
const labels=[
  ['Virtual bellows','This animated test chamber expands and relaxes with the model. The physical Arduino controls indicators.'],
  ['Resistance input · A0','A larger resistance raises the model index while reducing chamber expansion.'],
  ['Leak input · A1','An open leak makes it harder for the virtual chamber to expand.'],
  ['Fill LED · D5','This indicator is lit during the rising part of the cycle.'],
  ['Alarm LED · D6','An out-of-range trial stops the cycle and latches this indicator until cleared.'],
  ['Start or clear · D2','Press to start or stop a trial. During an alarm, the first press clears it and returns to idle.'],
] as const;
const points:Point[]=[[-1.04,1.49,.05],[1.10,.48,.51],[1.88,.48,.51],[1.14,.45,1.24],[1.86,.45,1.24],[.70,.46,.92]];

function Bench({state,resistance,leak,selected,select,toggle}:{toggle:()=>void;state:State;resistance:number;leak:number;selected:number;select:(index:number)=>void}){
  const value=bellowsReading(state.ms,resistance,leak);
  const running=state.mode==='running';
  const length=.80+(running?value.expansion*1.04:0);
  return <>
    <color attach="background" args={['#263546']}/>
    <hemisphereLight args={['#e8f2ff','#6b5442',2.3]}/>
    <directionalLight position={[-4,6,5]} intensity={2.15}/>
    <Box at={[0,-.13,0]} size={[6.1,.24,3.7]} color="#50657a"/>
    <Box at={[-1.31,.12,-.04]} size={[2.62,.23,1.61]} color={selected===0?'#c5a853':'#344b5e'}/>
    <group position={[-1.30,.28,-.06]} onClick={()=>select(0)}>
      <Box at={[0,.039,0]} size={[1.24,.12,1.10]} color="#9aa7a8" metal={.47}/>
      {Array.from({length:10},(_,i)=><mesh key={i} position={[0,.10+length*i/9,0]}>
        <cylinderGeometry args={[i%2?.47:.51,i%2?.51:.47,length/9+.016,36]}/>
        <meshStandardMaterial color={selected===0?'#698fb1':'#415e73'} roughness={.73}/>
      </mesh>)}
      <Box at={[0,length+.13,0]} size={[1.16,.12,1.04]} color="#a9b2b2" metal={.54}/>
      <Box at={[0,length+.21,0]} size={[.36,.09,.36]} color="#ced5d7" metal={.49}/>
    </group>
    {running&&<group position={[-1.30,.49,value.filling?1.46:.68]} rotation={[value.filling?Math.PI:0,0,0]}>
      <Line points={[[0,0,0],[0,0,.76]]} color="#79caeb" dashSize={.08} gapSize={.05} dashed lineWidth={2.4}/>
      <Line points={[[-.11,0,.58],[0,0,.76],[.11,0,.58]]} color="#79caeb" lineWidth={2.4}/>
    </group>}
    {running&&leak>30&&<Line points={[[-1.84,.64,0],[-2.20,.64,0],[-2.55,.57,0]]} color="#f4ba70" dashSize={.09} gapSize={.055} dashed lineWidth={2.1}/>}
    <group position={[1.47,.06,-.73]} scale={1.5}><Uno at={[0,0,0]}/></group>
    <Box at={[1.46,.105,.82]} size={[1.92,.19,1.26]} color="#e4e7e9"/>
    {Array.from({length:10},(_,i)=><Box key={i} at={[.61+i*.173,.20,.88]} size={[.04,.014,.038]} color="#727d83"/>)}
    {[resistance,leak].map((val,i)=><group key={i} position={[1.10+i*.78,.29,.49]} onClick={()=>select(i+1)}><SoloKnob value={val} active={selected===i+1}/></group>)}
    {[running&&value.filling,state.mode==='alarm'].map((lit,i)=><group key={i} position={[1.14+i*.72,.20,1.19]} onClick={()=>select(i+3)}>
      <Box at={[0,.023,0]} size={[.18,.046,.17]} color={selected===i+3?'#d8bb69':'#a2a7aa'}/>
      <mesh position={[0,.111,0]}><sphereGeometry args={[.078,20,18]}/><meshStandardMaterial color={i?'#af3a35':'#ebe6ce'} emissive={i?'#fa4435':'#fff0b9'} emissiveIntensity={lit?2.5:0}/></mesh>
    </group>)}
    <group position={[.70,.24,.91]} onClick={()=>{select(5);toggle();}}>
      <Box at={[0,0,0]} size={[.18,.08,.18]} color="#2d323a"/>
      <mesh position={[0,.059,0]}><cylinderGeometry args={[.063,.063,.055,22]}/><meshStandardMaterial color={selected===5?'#dabb65':'#567c8b'}/></mesh>
    </group>
    {['#d86e59','#292c37','#6caad7','#83b680'].map((color,i)=><Line key={color} points={[
      [1.05+i*.16,.32,-.37],[1.02+i*.18,.14,-.06],[1.03+i*.23,.205,.35],
    ]} color={color} lineWidth={2.7}/>)}
    <Line points={[[.79,.30,-.91],[.57,.18,-1.16],[.38,.13,-1.40],[-.10,.14,-1.57]]} color="#b0bbbf" lineWidth={4.3}/>
    {points.map((position,i)=><WorldLabel key={i} position={position} className="gp-marker-anchor">
      <button type="button" className="gp-marker" aria-label={labels[i][0]} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{labels[i][0]}</span>}</button>
    </WorldLabel>)}
  </>;
}

export default function BellowsSimulatorDemo(){
  const [resistance,setResistance]=useState(50);
  const [leak,setLeak]=useState(0);
  const [selected,select]=useState(0);
  const [state,setState]=useState<State>(idle);
  useEffect(()=>{
    if(state.mode!=='running')return;
    const timer=window.setInterval(()=>setState(old=>{
      if(old.mode!=='running')return old;
      const ms=old.ms+50;
      const reading=bellowsReading(ms,resistance,leak);
      const reason=reading.level>74?'High index · Restricted path':!reading.filling&&reading.peak<33?'Low index · Check for a leak':'';
      return {mode:reason?'alarm':'running',ms,reason,trace:[...old.trace.slice(-59),reading.level]};
    }),50);
    return ()=>window.clearInterval(timer);
  },[state.mode,resistance,leak]);
  const reading=bellowsReading(state.ms,resistance,leak);
  const phase=state.mode==='running'?(reading.filling?'Filling':'Releasing'):state.mode==='alarm'?'Alarm latched':'Idle';
  function toggle(){
    if(state.mode==='alarm'||state.mode==='running')setState(idle);
    else setState({...idle,mode:'running',reason:''});
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D classroom bellows simulator">
        <Canvas camera={{position:[3.4,4.6,6.7],fov:42}} dpr={[1,1.6]} fallback={<p>Follow the simulated trace and indicators below.</p>}>
          <Bench {...{state,resistance,leak,selected,select,toggle}}/>
          <OrbitControls target={[0,.61,0]} minDistance={4.8} maxDistance={14} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Bellows readings">
        <div><span>Phase</span><strong>{phase}</strong></div>
        <div><span>Pressure index</span><strong>{state.trace.at(-1)??0} units</strong></div>
      </div>
      <figure className="gp-bellows-plot" aria-label="Recent simulated pressure index">
        <figcaption>Recent pressure index · model units</figcaption>
        <div aria-hidden="true">{state.trace.map((value,i)=><span key={i} style={{height:`${value}%`}}/>)}</div>
      </figure>
    </div>
    <div className="gp-guide">
      <h3>See what changes the cycle</h3>
      <p>Start the normal trial, then try the restricted path and open leak. Compare the bellows, trace and alarm indicator. Values are unitless classroom inputs.</p>
      <div className="gp-steps" role="group" aria-label="Trial presets">
        {bellowsTrials.map(trial=><button type="button" key={trial.name} aria-pressed={resistance===trial.resistance&&leak===trial.leak}
          onClick={()=>{setResistance(trial.resistance);setLeak(trial.leak);}}>{trial.name}</button>)}
      </div>
      <label className="gp-solar-light">Resistance · {resistance} <input type="range" min="0" max="100" value={resistance} onChange={event=>setResistance(Number(event.target.value))}/></label>
      <label className="gp-solar-light">Leak · {leak} <input type="range" min="0" max="100" value={leak} onChange={event=>setLeak(Number(event.target.value))}/></label>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={toggle}>{state.mode==='alarm'?'Clear alarm':state.mode==='running'?'Stop simulation':'Start simulation'}</button>
      </div>
      <p role="status" className="gp-demo-description">{state.reason||phase}</p>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
