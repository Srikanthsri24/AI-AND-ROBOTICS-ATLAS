import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { initialSwipe,lampLevels,swipeStep } from '../data/gesture-lamp';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Pattern='right'|'left'|'hold'|'both';
type Trial={pattern:Pattern;ms:number};
const durations:Record<Pattern,number>={right:920,left:920,hold:1050,both:550};
const labels=[
  ['Left beam · D2','Left first and right second is the brighten command.'],
  ['Right beam · D3','Right first and left second is the dim command.'],
  ['LED light head','Each LED has its own resistor. The Uno sends the same PWM duty to all three channels.'],
  ['Arduino Uno','The controller accepts the second beam within 650 ms. Both paths must clear for 70 ms before another swipe.'],
] as const;
function cardPosition(trial:Trial){
  const fraction=Math.min(1,trial.ms/600);
  return trial.pattern==='right'?-.68+1.88*fraction:trial.pattern==='left'?1.20-1.88*fraction:trial.pattern==='both'?.21:-.14;
}
const anchors:Point[]=[[-.14,.50,1.04],[.56,.50,1.04],[-1.37,1.52,-.08],[1.66,.44,-.57]];

function Gate({left,right,level,selected,select,trial}:{left:boolean;right:boolean;level:number;selected:number;select:(i:number)=>void;trial:Trial|null}){
  const intensity=level/3;
  const cardX=trial?cardPosition(trial):0;
  return <>
    <color attach="background" args={['#27354a']}/>
    <hemisphereLight args={['#e4eeff','#655646',2.25]}/>
    <directionalLight position={[-4,7,6]} intensity={2.30}/>
    <Box at={[0,-.14,0]} size={[6.02,.25,4.08]} color="#617486"/>
    <Box at={[-1.53,.075,-.53]} size={[1.18,.13,1.28]} color="#8d715c"/>
    <Box at={[-1.79,.70,-.76]} size={[.12,1.20,.14]} color="#475564" metal={.38}/>
    <Box at={[-1.46,1.27,-.58]} size={[.77,.087,.14]} color="#4e5e6b" metal={.42}/>
    <group position={[-1.34,1.27,-.25]} onClick={()=>select(2)}>
      <Box at={[0,0,0]} size={[.95,.19,.65]} color={selected===2?'#d9b36c':'#a78a72'}/>
      <Box at={[0,-.105,0]} size={[.85,.036,.55]} color="#efe0b0"/>
      {[-.24,0,.24].map(x=><mesh key={x} position={[x,-.134,.0]}><sphereGeometry args={[.064,20,14]}/>
        <meshStandardMaterial color="#faf0d1" emissive="#ffe8a5" emissiveIntensity={intensity*3}/></mesh>)}
    </group>
    {level>0&&<pointLight position={[-1.34,1.09,-.23]} color="#ffe3a0" intensity={7+intensity*18} distance={3.3}/>}
    <Box at={[-1.25,.047,-.19]} size={[.68,.06,.49]} color="#d7d8cd"/>
    {[-.33,-.27,-.21,-.15,-.09].map(z=><Box key={z} at={[-1.22,.082,z]} size={[.39,.005,.014]} color="#8b9295"/>)}
    <Box at={[.20,.055,.86]} size={[1.49,.11,1.30]} color="#997a61"/>
    {[-.14,.56].map((x,i)=>{
      const blocked=i?right:left;
      return <group key={x} onClick={()=>select(i)}>
        {[.42,1.32].map(z=><group key={z}>
          <Box at={[x,.17,z]} size={[.18,.23,.16]} color={selected===i?'#dcb46a':'#7c6860'}/>
          <Box at={[x,.31,z]} size={[.20,.15,.14]} color="#283642"/>
          <mesh position={[x,.312,z<.9?z+.077:z-.077]}><sphereGeometry args={[.036,16,14]}/><meshStandardMaterial color={blocked?'#ce8b64':'#68b6b8'} emissive={blocked?'#de5848':'#48adbe'} emissiveIntensity={1.1}/></mesh>
        </group>)}
        <Line points={[[x,.31,.50],[x,.31,blocked?.78:1.24]]} color={blocked?'#ef8e67':'#79d0dc'} lineWidth={2.05} dashSize={.079} gapSize={.053} dashed/>
      </group>;
    })}
    {trial&&(trial.pattern==='hold'?trial.ms>=100&&trial.ms<825:trial.pattern==='both'?trial.ms>=100&&trial.ms<300:trial.ms<650)&&<Box at={[cardX,.37,.89]} size={[trial.pattern==='both'?1.09:.25,.40,.062]} color="#e2ba73"/>}
    <group position={[1.69,.074,-.69]} scale={1.46}><Uno at={[0,0,0]}/></group>
    <Box at={[1.65,.117,.42]} size={[1.06,.12,.52]} color="#e1e4e3"/>
    {Array.from({length:7},(_,i)=><Box key={i} at={[1.24+i*.137,.181,.45]} size={[.04,.010,.041]} color="#75818a"/>)}
    <Line points={[[.56,.26,.45],[.76,.13,.33],[1.40,.18,.45],[1.61,.33,-.32]]} color="#69a8c4" lineWidth={2.7}/>
    <Line points={[[-.14,.26,.44],[.16,.11,.22],[1.19,.13,.35],[1.36,.34,-.32]]} color="#df9963" lineWidth={2.7}/>
    <Line points={[[1.31,.32,-1.04],[.71,.14,-1.27],[-1.85,.11,-1.12],[-1.79,1.15,-.78]]} color="#a35c52" lineWidth={3}/>
    {anchors.map((at,i)=><WorldLabel key={i} position={at} className="gp-marker-anchor">
      <button type="button" className="gp-marker" aria-label={labels[i][0]} aria-pressed={selected===i} onClick={()=>select(i)}>
        {i+1}{selected===i&&<span className="gp-demo-marker-name">{labels[i][0]}</span>}
      </button>
    </WorldLabel>)}
  </>;
}

type Model={clock:number;trial:Trial|null;gesture:typeof initialSwipe;left:boolean;right:boolean};
const modelStart:Model={clock:0,trial:null,gesture:initialSwipe,left:false,right:false};
function tick(previous:Model):Model{
  const {trial}=previous,clock=previous.clock+25;
  if(!trial)return previous;
  const ms=trial.ms+25;
  let left=false,right=false;
  if(trial.pattern==='both')left=right=ms>=100&&ms<300;
  if(trial.pattern==='hold')left=ms>=100&&ms<825;
  if(trial.pattern==='right'||trial.pattern==='left'){
    const x=cardPosition({...trial,ms});
    left=Math.abs(x+.14)<.135;
    right=Math.abs(x-.56)<.135;
  }
  const gesture=swipeStep(previous.gesture,left,right,clock);
  return {clock,left,right,gesture,trial:ms>=durations[trial.pattern]?null:{...trial,ms}};
}

export default function GestureLampDemo(){
  const [model,setModel]=useState(modelStart);
  const [selected,select]=useState(0);
  const running=!!model.trial;
  useEffect(()=>{
    if(!running)return;
    const timer=window.setInterval(()=>setModel(tick),25);
    return ()=>window.clearInterval(timer);
  },[running]);
  const {gesture,left,right,trial}=model;
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D contactless study lamp">
        <Canvas camera={{position:[3.6,5.4,6.9],fov:42}} dpr={[1,1.6]} fallback={<p>Use the beam and brightness readouts to follow the trial.</p>}>
          <Gate {...{left,right,selected,select,trial}} level={gesture.level}/>
          <OrbitControls target={[0,.49,.13]} minDistance={4.7} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Study lamp readings">
        <div><span>Left beam</span><strong>{left?'Blocked':'Clear'}</strong></div>
        <div><span>Right beam</span><strong>{right?'Blocked':'Clear'}</strong></div>
        <div><span>Brightness</span><strong>{['Off','Low','Medium','High'][gesture.level]}</strong></div>
        <div><span>PWM</span><strong>{lampLevels[gesture.level]} / 255</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Swipe in both directions</h3>
      <p>Watch the card cross the beams. Try one slow or simultaneous interruption and compare what the lamp does.</p>
      <div className="gp-steps">
        {([['right','Swipe left to right'],['left','Swipe right to left'],['hold','Block left only'],['both','Block both together']] as const).map(([pattern,label])=>
          <button type="button" disabled={running} key={pattern} onClick={()=>setModel(previous=>({...previous,trial:{pattern,ms:0}}))}>{label}</button>)}
        <button type="button" onClick={()=>setModel(modelStart)}>Reset lamp</button>
      </div>
      <p role="status" className="gp-demo-description">{gesture.notice}</p>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
