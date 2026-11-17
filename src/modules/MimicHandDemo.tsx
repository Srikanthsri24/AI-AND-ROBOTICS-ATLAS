import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { digitNames, mimicGestures, mimicServoPins } from '../data/mimic-hand';
import { SoloKnob } from './BellowsSimulatorPart';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { TrackerServo } from './SolarTrackerParts';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Stage='open'|'curled'|'live';
const zero=[0,0,0,0,0];
const one=[1,1,1,1,1];
const bases:Point[]=[[-.54,0,.08],[-.395,0,-.47],[-.13,0,-.51],[.13,0,-.48],[.39,0,-.41]];
const lengths=[.77,1.09,1.19,1.10,.88];

function Digit({i,value,robot,selected,select}:{i:number;value:number;robot:boolean;selected:boolean;select:(i:number)=>void}){
  const length=lengths[i], joint=length*.54;
  const housing=robot?(selected?'#e2b762':'#bd936a'):(selected?'#659da9':'#325a70');
  return <group position={bases[i]} rotation={[0,i===0?.69:(i-2)*.055,0]} onClick={()=>select(i)}>
    {robot&&<group position={[0,0,0]} rotation={[0,0,Math.PI/2]}>
      <mesh><cylinderGeometry args={[.084,.084,.26,20]}/><meshStandardMaterial color="#b5bdc2" metalness={.62}/></mesh>
    </group>}
    <group rotation={[value*.92,0,0]}>
      <Box at={[0,0,-joint*.52]} size={[.222,.14,joint+.024]} color={housing}/>
      {!robot&&<Box at={[0,.083,-joint*.49]} size={[.066,.013,joint*.83]} color="#242b32"/>}
      {robot&&<Line points={[[0,.083,.02],[0,.085,-joint]]} color={selected?'#ffe08b':'#d6bf94'} lineWidth={2.4}/>}
      <group position={[0,0,-joint]} rotation={[value*.95,0,0]}>
        <Box at={[0,0,-(length-joint)*.47]} size={[.205,.139,length-joint]} color={housing}/>
        {robot&&<Line points={[[0,.079,0],[0,.079,-(length-joint)*.83]]} color={selected?'#ffe08b':'#d6bf94'} lineWidth={2.4}/>}
      </group>
    </group>
  </group>;
}

function Hands({input,output,selected,select,showLabels}:{input:number[];output:number[];selected:number;select:(i:number)=>void;showLabels:boolean}){
  return <>
    <color attach="background" args={['#253448']}/>
    <hemisphereLight args={['#eaf3ff','#705a47',2.35]}/>
    <directionalLight position={[-4,7,6]} intensity={2.45}/>
    <Box at={[0,-.13,0]} size={[6.14,.24,4.72]} color="#52697a"/>
    <group position={[-1.63,.16,-.30]}>
      <Box at={[0,0,.04]} size={[1.08,.18,1.05]} color="#365d73"/>
      <Box at={[0,-.012,.69]} size={[.81,.11,.36]} color="#303f4b"/>
      {input.map((value,i)=><Digit key={i} {...{i,value,select}} robot={false} selected={selected===i}/>)}
      {['#bc7759','#d4b267','#68ad88','#70a8c8','#a78bb8'].map((color,i)=><Line key={color} points={[[bases[i][0],.108,-.32],[i*.108-.23,.096,.42],[i*.067-.14,.093,.84]]} color={color} lineWidth={2.15}/>)}
    </group>
    <group position={[1.40,.26,-.30]}>
      <Box at={[0,-.12,.16]} size={[1.27,.16,1.31]} color="#394a54"/>
      <Box at={[0,0,.02]} size={[1.09,.16,1.01]} color="#bd966e"/>
      <Box at={[0,.088,.02]} size={[1.01,.026,.94]} color="#cda477"/>
      {output.map((value,i)=><Digit key={i} {...{i,value,select}} robot selected={selected===i}/>)}
      {showLabels&&bases.map(([x,,z],i)=>{
        const marker:Point=[x*1.54,.28+output[i]*.26,z-[.12,.39,.96,.39,.96][i]];
        return <group key={i}>
          <Line points={[[x,.19+output[i]*.15,z-.17],marker]} color={selected===i?'#ffda81':'#a8b2bc'} lineWidth={1.4}/>
          <WorldLabel position={marker} className="gp-marker-anchor">
            <button type="button" className="gp-marker" aria-label={digitNames[i]} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{digitNames[i]}</span>}</button>
          </WorldLabel>
        </group>;
      })}
    </group>
    <group position={[1.42,.14,1.15]}>
      <Box at={[0,0,0]} size={[2.26,.15,.66]} color="#3b4e5a"/>
      {output.map((value,i)=>{
        const x=i*.41-.84;
        return <group key={i} onClick={()=>select(i)}>
          <group position={[x,.12,0]} scale={.50} rotation={[0,Math.PI/2,0]}><TrackerServo selected={selected===i}/></group>
          <group position={[x,.278,.01]} scale={.39}><SoloKnob value={50+value*47} active={selected===i}/></group>
          <Line points={[[x,.282,.02],[bases[i][0]-.02,.19,-.47],[bases[i][0]-.02,.21,bases[i][2]-1.45]]} color={selected===i?'#ffe5a5':'#c5ac87'} lineWidth={2}/>
        </group>;
      })}
    </group>
    <group position={[-.93,.08,1.28]} scale={1.48}><Uno at={[0,0,0]}/></group>
    <Line points={[[-1.76,.26,.54],[-1.76,.15,.81],[-1.34,.33,.92],[-1.09,.34,.92]]} color="#7bb5cb" lineWidth={4}/>
    <Line points={[[-.38,.33,1.65],[.10,.12,1.64],[.35,.11,1.49],[.58,.24,1.31]]} color="#d99160" lineWidth={3.4}/>
  </>;
}

export default function MimicHandDemo(){
  const [input,setInput]=useState<number[]>(zero);
  const [stage,setStage]=useState<Stage>('open');
  const [open,setOpen]=useState<number[]>(zero);
  const [closed,setClosed]=useState<number[]>(one);
  const [selected,select]=useState(1);
  const [showLabels,setShowLabels]=useState(true);
  const [notice,setNotice]=useState('Set the glove to Open hand and capture the first position.');
  const output=input.map((value,i)=>stage==='live'?Math.max(0,Math.min(1,(value-open[i])/(closed[i]-open[i]))):0);
  function calibrate(){
    if(stage==='live'){
      setStage('open');setNotice('Set the glove to Open hand and capture the first position.');return;
    }
    if(stage==='open'){
      setOpen(input);setStage('curled');setNotice('Now choose Fist and capture the curled position.');return;
    }
    if(input.some((value,i)=>value-open[i]<.13)){
      setStage('open');setNotice('One or more fingers moved too little. Start again with the glove open.');return;
    }
    setClosed(input);setStage('live');setNotice('Calibrated · Try Point, Pinch or an individual finger.');
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D animatronic hand workbench">
        <Canvas camera={{position:[2.9,6.8,7],fov:40}} dpr={[1,1.6]} fallback={<p>Use the five finger readouts to compare glove and model motion.</p>}>
          <Hands {...{input,output,selected,select,showLabels}}/>
          <OrbitControls target={[0,.35,0]} minDistance={4.7} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Finger readings">
        {digitNames.map((name,i)=><div key={name}><span>{name} · D{mimicServoPins[i]}</span><strong>{Math.round(output[i]*100)}%</strong></div>)}
      </div>
    </div>
    <div className="gp-guide">
      <h3>Calibrate the glove, then mirror a pose</h3>
      <p>The blue glove is the input. After calibration, the cardboard hand copies each digit. Select a finger to inspect its tendon and control it independently.</p>
      <div className="gp-steps" role="group" aria-label="Glove poses">
        {mimicGestures.map(value=><button type="button" key={value.name} aria-pressed={value.curl.every((curl,i)=>curl===input[i])} onClick={()=>setInput([...value.curl])}>{value.name}</button>)}
      </div>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={calibrate}>{stage==='open'?'Capture open':stage==='curled'?'Capture curled':'Recalibrate'}</button>
        <button type="button" aria-pressed={showLabels} onClick={()=>setShowLabels(value=>!value)}>Scene labels</button>
      </div>
      <p className="gp-demo-description" role="status">{notice}</p>
      <ol className="gp-demo-labels">{digitNames.map((name,i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <label className="gp-solar-light">{digitNames[selected]} glove curl · {Math.round(input[selected]*100)}%
        <input type="range" min="0" max="100" value={Math.round(input[selected]*100)} onChange={event=>setInput(values=>values.map((value,i)=>i===selected?Number(event.target.value)/100:value))}/>
      </label>
      <p className="gp-demo-description">A{selected} reads the {digitNames[selected].toLowerCase()} strip. D{mimicServoPins[selected]} commands its servo, which pulls the tendon toward the palm.</p>
    </div>
  </div>;
}
