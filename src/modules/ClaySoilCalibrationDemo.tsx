import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {ClaySample} from './ClaySoilParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Dry reference',at:[-1.38,.70,-.55],detail:'This sample sets the zero of the relative index.'},
  {name:'Damp reference',at:[-1.38,.70,.51],detail:'This sample sets the upper end of the relative index.'},
  {name:'Test sample cutaway',at:[.96,.39,.88],detail:'The two clay faces move apart to show an air gap. The test sample keeps the same moisture and insertion depth.'},
  {name:'Probe signal · A0',at:[.94,1.26,.26],detail:'The probe senses the material surrounding the blade. Less contact can shift the reading even at fixed moisture.'},
  {name:'Arduino Uno',at:[-.17,.40,1.26],detail:'The Uno averages analog samples. The sketch reports each placement set’s minimum, maximum and spread.'},
];
const samplePoints:Point[]=[[-1.37,.08,-.62],[-1.37,.08,.52],[.92,.10,.24]];
const referenceRaw=[604,338];
const repeatRaw={snug:[459,462,460],gap:[508,531,518]};
type Contact=keyof typeof repeatRaw;
type Measurements=Record<Contact,number[]>;
const empty:Measurements={snug:[],gap:[]};

function Bench({sample,contact,selected,select}:{sample:number;contact:Contact;selected:number;select:(i:number)=>void}){
  const [x,y,z]=samplePoints[sample];
  return <>
    <color attach="background" args={['#394a53']}/>
    <hemisphereLight args={['#edf4fc','#937c64',2.1]}/><directionalLight position={[-3,6,4]} color="#fff0d5" intensity={2.2}/>
    <Box at={[0,-.095,0]} size={[4.88,.19,3.14]} color="#7d8b89"/>
    <Box at={[-1.37,.035,-.05]} size={[1.35,.07,2.31]} color="#4d5d60"/>
    <Box at={[.92,.047,.24]} size={[1.96,.094,1.25]} color="#58696a"/>
    {samplePoints.map((at,i)=><group key={i} position={at} onClick={()=>select(i)}>
      <group scale={i===2?[1.55,1.25,1.22]:1}>
        <ClaySample gap={i===2&&contact==='gap'} cutaway={i===2} shade={['#b18b6c','#715244','#9a6850'][i]} selected={selected===i}/>
      </group>
    </group>)}
    <group position={[x,y+(sample===2?.62:.48),z+.01]} onClick={()=>select(3)}>
      <Box at={[0,-.14,0]} size={[.036,.52,.14]} color={selected===3?'#efb26c':'#28353c'}/>
      <Box at={[0,.14,0]} size={[.048,.14,.18]} color="#293b45"/>
      <Box at={[.021,.185,.019]} size={[.059,.048,.101]} color="#e7ddca"/>
      <Box at={[0,.04,0]} size={[.048,.022,.141]} color="#ecc77e"/>
    </group>
    <group onClick={()=>select(4)}>
      <Box at={[-.21,.101,1.18]} size={[.89,.093,.51]} color={selected===4?'#76acaa':'#28798b'}/>
      <Box at={[-.51,.18,1.21]} size={[.18,.11,.15]} color="#bccbd0" metal={.65}/>
      <Box at={[-.11,.171,1.17]} size={[.24,.053,.103]} color="#252e33"/>
      {[1.00,1.38].map(at=><Box key={at} at={[-.16,.167,at]} size={[.53,.053,.05]} color="#263234"/>)}
    </group>
    {['#d77861','#304349','#eac377'].map((color,i)=><Line key={color} points={[[x+i*.032,y+(sample===2?.81:.67),z+.02],[x+i*.032,1.08,z+.42],[-.26+i*.043,.24,.89],[-.12+i*.08,.18,1.00]]} color={color} lineWidth={2.7}/>)}
    {labels.map(({name,at},i)=><WorldLabel key={name} position={i===3?[x+.11,y+1.06,z-.12]:at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.35} scale={5.2} far={1.8} resolution={128} frames={1}/>
  </>;
}

export default function ClaySoilCalibrationDemo(){
  const [sample,setSample]=useState(0);
  const [selected,setSelected]=useState(0);
  const [contact,setContact]=useState<Contact>('snug');
  const [references,setReferences]=useState<(number|null)[]>([null,null]);
  const [measurements,setMeasurements]=useState<Measurements>(empty);
  const [dry,damp]=references;
  const calibrated=dry!==null&&damp!==null;
  const raw=sample<2?referenceRaw[sample]:repeatRaw[contact][Math.min(measurements[contact].length,2)];
  function select(part:number){
    setSelected(part);
    if(part<3)setSample(part);
  }
  function capture(){
    if(sample<2){
      setReferences(previous=>previous.map((value,i)=>i===sample?raw:value));
      setMeasurements(empty);
    }else{
      setMeasurements(previous=>({...previous,[contact]:[...previous[contact],raw]}));
    }
  }
  const complete=measurements.snug.length===3&&measurements.gap.length===3;
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D clay soil calibration">
        <Canvas camera={{position:[2.19,3.37,6.42],fov:40}} dpr={[1,1.6]} fallback={<p>Use the controls to compare the two placement sets.</p>}><Bench {...{sample,contact,selected,select}}/><OrbitControls target={[0,.56,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Clay probe readings">
        <div><span>Raw ADC</span><strong>{raw}</strong></div>
        <div><span>Relative index</span><strong>{dry!==null&&damp!==null?(100*(raw-dry)/(damp-dry)).toFixed(1):'—'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Compare probe contact</h3>
      <p>Capture both references, then take three simulated placements in the same test sample for each contact setting.</p>
      <div className="gp-steps">{['Dry reference','Damp reference','Test sample'].map((name,i)=><button key={name} className="gp-button gp-secondary" type="button" aria-pressed={sample===i} onClick={()=>select(i)}>Use {name.toLowerCase()}</button>)}</div>
      {sample===2&&<div className="gp-steps"><button type="button" aria-pressed={contact==='snug'} onClick={()=>setContact('snug')}>Snug contact</button><button type="button" aria-pressed={contact==='gap'} onClick={()=>setContact('gap')}>Air gap</button></div>}
      <div className="gp-steps">
        <button className="gp-button" type="button" disabled={sample===2&&(!calibrated||measurements[contact].length===3)} onClick={capture}>{sample===2?'Record placement':`Capture ${sample===0?'dry':'damp'} reference`}</button>
        <button type="button" onClick={()=>{setReferences([null,null]);setMeasurements(empty);setContact('snug');select(0);}}>Reset experiment</button>
      </div>
      <p>Dry reference <strong>{dry??'—'}</strong> · Damp reference <strong>{damp??'—'}</strong></p>
      <table className="gp-clay-results" aria-label="Placement comparison"><thead><tr><th scope="col">Contact</th><th scope="col">Raw readings</th><th scope="col">Spread</th></tr></thead><tbody>
        {(['snug','gap'] as const).map(key=>{
          const values=measurements[key];
          return <tr key={key}><th scope="row">{key==='snug'?'Snug':'Air gap'}</th><td>{values.join(', ')||'—'}</td><td>{values.length>1?`${Math.max(...values)-Math.min(...values)} counts`:'—'}</td></tr>;
        })}
      </tbody></table>
      <p role="status">{!calibrated?'Capture both references.':complete?'Both sets complete. Compare their raw ranges.':'Record three placements for each contact setting.'}</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p>{labels[selected].detail}</p>
    </div>
  </div>;
}
