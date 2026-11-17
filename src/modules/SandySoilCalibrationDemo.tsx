import {useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import type {Group} from 'three';
import {WorldLabel} from './LabWorkbench';
import {GraduatedWaterCylinder,SandySampleCup} from './SandySoilParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

const samples=[
  {name:'Dry cup',dose:0,raw:591,x:-1.41},
  {name:'Middle cup',dose:15,raw:462,x:-.36},
  {name:'Wetter cup',dose:30,raw:371,x:.69},
];
const labels=[
  'Dry cup · 0 mL','Middle cup · 15 mL','Wetter cup · 30 mL','Graduated cylinder','Probe and Arduino · A0',
];
const details=[
  'This cup sets the zero point. Its probe reading becomes the dry endpoint when you capture it.',
  'The 15 mL cup tests the midpoint. Compare the measured relative index with 50. Try reseating the probe to see how repeat measurements vary.',
  'This cup sets the 100 point. Compare the sensor with the dry cup using the same blade depth.',
  'Measure the water before adding it to the sample. Use identical cups with equal portions of the same mix.',
  'The Arduino reads the probe signal on A0 and sends the raw measurement to Serial Monitor. The probe shares 5 V and ground with the board.',
];

function Bench({cup,selected,select}:{cup:number;selected:number;select:(i:number)=>void}){
  const probe=useRef<Group>(null);
  const lastCup=useRef(cup);
  const lift=useRef(0);
  useFrame((_,delta)=>{
    if(!probe.current)return;
    if(lastCup.current!==cup){
      lastCup.current=cup;
      lift.current=.58;
    }
    const {position}=probe.current;
    position.x+=(samples[cup].x-position.x)*(1-Math.exp(-11*delta));
    position.y=.72+lift.current;
    lift.current*=Math.exp(-5.5*delta);
  });

  return <>
    <color attach="background" args={['#42545b']}/>
    <hemisphereLight args={['#e9f4ff','#987d64',2.05]}/>
    <directionalLight position={[-3,6,4]} color="#ffeed9" intensity={2.15}/>
    <Box at={[0,-.098,0]} size={[4.8,.19,2.98]} color="#768987"/>
    <Box at={[-.37,.07,.11]} size={[3.17,.13,1.27]} color="#4f605d"/>
    {samples.map(({name,dose,x},i)=><group key={name} position={[x,.14,.17]} onClick={()=>select(i)}>
      <SandySampleCup dose={dose} selected={selected===i}/>
      <WorldLabel position={[0,.20,.58]} className="gp-marker-anchor">
        <button type="button" className="gp-marker" aria-label={labels[i]} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{labels[i]}</span>}</button>
      </WorldLabel>
    </group>)}
    <group position={[1.68,.005,-.26]} onClick={()=>select(3)}>
      <GraduatedWaterCylinder dose={30} selected={selected===3}/>
      <WorldLabel position={[.05,1.42,0]} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={labels[3]} aria-pressed={selected===3} onClick={()=>select(3)}>4{selected===3&&<span className="gp-demo-marker-name">{labels[3]}</span>}</button></WorldLabel>
    </group>
    <Box at={[-1.15,.095,-.92]} size={[1.07,.085,.55]} color="#267786"/>
    <Box at={[-1.56,.174,-.88]} size={[.17,.13,.16]} color="#c0cad0" metal={.65}/>
    <Box at={[-1.11,.167,-.92]} size={[.26,.06,.12]} color={selected===4?'#d4a779':'#27333b'}/>
    {[-1.08,-.72].map(z=><Box key={z} at={[-1.16,.162,z]} size={[.62,.06,.055]} color="#222c30"/>)}
    <group ref={probe} position={[samples[0].x,.72,.17]} onClick={()=>select(4)}>
      <Box at={[0,-.08,0]} size={[.17,.40,.033]} color={selected===4?'#e0a973':'#273340'}/>
      <Box at={[0,.116,0]} size={[.183,.124,.046]} color="#1d333d"/>
      <Box at={[0,.195,.024]} size={[.12,.064,.063]} color="#e5ded1"/>
      <Box at={[-.039,.102,.028]} size={[.045,.047,.01]} color="#333139"/>
      <WorldLabel position={[0,.41,-.07]} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={labels[4]} aria-pressed={selected===4} onClick={()=>select(4)}>5{selected===4&&<span className="gp-demo-marker-name">{labels[4]}</span>}</button></WorldLabel>
    </group>
    {['#dc795f','#26363c','#e9c075'].map((color,i)=>{
      const x=samples[cup].x+(i-1)*.04;
      return <Line key={color} points={[[x,.92,.17],[x,1.04,-.18],[x,.43,-.57],[-.75-i*.13,.21,-.70]]} color={color} lineWidth={2.5}/>;
    })}
    <ContactShadows position={[0,.005,0]} opacity={.32} scale={5.3} far={1.9} resolution={128} frames={1}/>
  </>;
}

const repeatOffsets=[0,-4,5];
export default function SandySoilCalibrationDemo(){
  const [cup,setCup]=useState(0);
  const [selected,setSelected]=useState(0);
  const [captures,setCaptures]=useState<(number|null)[]>([null,null,null]);
  const [repeat,setRepeat]=useState(0);
  const [middleReadings,setMiddleReadings]=useState<number[]>([]);
  const raw=samples[cup].raw+(cup===1?repeatOffsets[repeat]:0);
  const [dry,middle,wet]=captures;
  const calibrated=dry!==null&&wet!==null;
  const middleIndex=dry!==null&&wet!==null&&middle!==null?100*(middle-dry)/(wet-dry):null;
  const format=(value:number|null)=>value===null?'—':value.toFixed(1);
  function select(part:number){
    setSelected(part);
    if(part<samples.length)setCup(part);
  }

  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D sandy soil calibration">
        <Canvas camera={{position:[2.2,3.3,6.4],fov:40}} dpr={[1,1.6]} fallback={<p>Use the sample buttons to compare the readings.</p>}><Bench {...{cup,selected,select}}/><OrbitControls target={[0,.53,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Calibration readings">
        <div><span>Current raw ADC</span><strong>{raw}</strong></div>
        <div><span>Captured middle index</span><strong>{format(middleIndex)}</strong></div>
        <div><span>Difference from 50</span><strong>{format(middleIndex===null?null:middleIndex-50)}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Does half the water give half the reading?</h3>
      <p>Move the probe to each cup. Capture the dry and wetter endpoints, then measure the middle dose. The demo uses example sensor readings.</p>
      <div className="gp-steps">{samples.map(({name,dose},i)=><button key={name} type="button" className="gp-button gp-secondary" aria-pressed={cup===i} onClick={()=>select(i)}>{name} · {dose} mL</button>)}</div>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={cup===1&&!calibrated} onClick={()=>{
          setCaptures(previous=>previous.map((value,i)=>i===cup?raw:value));
          if(cup===1)setMiddleReadings(previous=>[...previous.slice(-2),raw]);
        }}>Capture {samples[cup].name.toLowerCase()}</button>
        {cup===1&&<button type="button" onClick={()=>setRepeat(previous=>(previous+1)%repeatOffsets.length)}>Reseat the probe</button>}
        <button type="button" onClick={()=>{setCaptures([null,null,null]);setMiddleReadings([]);setRepeat(0);select(0);}}>Reset calibration</button>
      </div>
      <p>Captured raw values · Dry <strong>{dry??'—'}</strong> · Middle <strong>{middle??'—'}</strong> · Wetter <strong>{wet??'—'}</strong></p>
      {middleReadings.length>1&&<p>Recent middle readings {middleReadings.join(', ')} · Spread {Math.max(...middleReadings)-Math.min(...middleReadings)} counts</p>}
      <p role="status">{!calibrated?'Capture both endpoints.':middleIndex===null?'Endpoints set. Capture the middle cup.':Math.abs(middleIndex-50)<.05?'The middle reading matches 50.':`The middle reading is ${Math.abs(middleIndex-50).toFixed(1)} points ${middleIndex>50?'above':'below'} 50.`}</p>
      <ol className="gp-demo-labels">{labels.map((name,i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p>{details[selected]}</p>
    </div>
  </div>;
}
