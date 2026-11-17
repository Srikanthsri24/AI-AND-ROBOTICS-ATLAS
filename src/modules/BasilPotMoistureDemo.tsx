import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {BasilPotPart} from './BasilPotPart';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const samples=[{name:'Dry cup',raw:573,x:-.74},{name:'Damp cup',raw:304,x:.33}];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Calibration cups',at:[-.91,.47,.95],detail:'The cups hold dry and damp portions of the same mix. The probe uses their raw readings as the 0 and 100 endpoints.'},
  {name:'Soil probe · A0',at:[1.51,.95,.62],detail:'The blade senses conditions in the soil immediately around it. Keep the connector above the soil and reuse the same insertion depth.'},
  {name:'Basil and saucer',at:[1.47,1.57,-.27],detail:'The saucer catches runoff. The soil around the blade darkens after watering in this model.'},
  {name:'Check-soil LED · D8',at:[-1.72,.44,1.02],detail:'The LED turns on at a relative index of 30 or below and clears at 40 or above. Check the soil before watering.'},
];

function Bench({sample,moisture,flag,selected,select}:{sample:number;moisture:number;flag:boolean;selected:number;select:(i:number)=>void}){
  const probe:Point=sample<2?[samples[sample].x+.12,.48,.66]:[1.55,.69,.45];
  const probeMarker:Point=[probe[0]+.09,probe[1]+.42,probe[2]+.13];
  return <>
    <color attach="background" args={['#3e514e']}/>
    <hemisphereLight args={['#edf7e9','#9a7761',2.05]}/><directionalLight position={[-3,6,3]} color="#fff0d9" intensity={2.1}/>
    <Box at={[0,-.095,0]} size={[4.85,.19,3.06]} color="#849084"/>
    <group position={[1.41,.015,.09]} onClick={()=>select(2)}><BasilPotPart moisture={moisture} selected={selected===2}/></group>
    <group onClick={()=>select(0)}>
      {samples.map(({x,name},i)=><group key={name} position={[x,.013,.66]}>
        <mesh position={[0,.17,0]}><cylinderGeometry args={[.31,.252,.33,36]}/><meshStandardMaterial color={selected===0?'#dfcaa3':'#c7b69b'} roughness={.74}/></mesh>
        <mesh position={[0,.333,0]}><cylinderGeometry args={[.283,.283,.024,36]}/><meshStandardMaterial color={i?'#443126':'#896848'} roughness={1}/></mesh>
        <mesh position={[0,.342,0]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.289,.022,11,36]}/><meshStandardMaterial color="#e0d0b3"/></mesh>
        {Array.from({length:18},(_,j)=>{
          const radius=.25*Math.sqrt(j/18),angle=j*2.39996;
          return <mesh key={j} position={[radius*Math.cos(angle),.352,radius*Math.sin(angle)]}><icosahedronGeometry args={[.012+(j%5)*.005,0]}/><meshStandardMaterial color={j%3?'#9f8268':'#b7ae96'} roughness={.99}/></mesh>;
        })}
      </group>)}
    </group>
    <group position={probe} rotation={[0,-.18,-.12]} onClick={()=>select(1)}>
      <Box at={[0,-.102,0]} size={[.174,.355,.032]} color={selected===1?'#edbb73':'#28343a'}/>
      <Box at={[0,.068,0]} size={[.188,.104,.042]} color="#1a2e35"/>
      <Box at={[0,.119,.024]} size={[.124,.065,.061]} color="#e7e1cf"/>
      <Box at={[-.045,.052,.026]} size={[.048,.043,.014]} color="#252630"/>
      <Box at={[.045,-.026,.019]} size={[.034,.064,.009]} color="#bc9e6e" metal={.4}/>
    </group>
    <Box at={[-1.65,.105,.02]} size={[.87,.085,.50]} color="#297e91"/>
    <Box at={[-1.98,.19,.10]} size={[.17,.112,.15]} color="#bfc3bf" metal={.6}/>
    <Box at={[-1.54,.176,.015]} size={[.23,.055,.10]} color="#253239"/>
    {[-.15,.22].map(z=><Box key={z} at={[-1.59,.162,z]} size={[.55,.049,.054]} color="#263439"/>)}
    <group onClick={()=>select(3)}>
      <Box at={[-1.71,.107,.97]} size={[.61,.10,.44]} color={selected===3?'#ebc194':'#e1ded1'}/>
      <Box at={[-1.70,.184,.95]} size={[.28,.038,.04]} color="#b6976c"/>
      <mesh position={[-1.56,.25,1.01]}><sphereGeometry args={[.066,20,14]}/><meshStandardMaterial color={flag?'#ff794b':'#8b4539'} emissive="#ff6339" emissiveIntensity={flag?2.4:0}/></mesh>
      {flag&&<pointLight position={[-1.56,.30,1.01]} color="#ff8251" intensity={1.1} distance={.85}/>}
    </group>
    {['#d56f60','#3a4245','#e5b75a'].map((color,index)=>{
      const offset=(index-1)*.035;
      return <Line key={color} points={[[probe[0]+offset,probe[1]+.13,probe[2]],[probe[0]+offset,probe[1]+.3,.16],[probe[0]+offset,.16,-.53],[-.7,.145,-.57+offset],[-1.42+offset,.19,-.15]]} color={color} lineWidth={2.4}/>;
    })}
    <Line points={[[-1.55,.17,.22],[-1.33,.19,.56],[-1.59,.18,.95]]} color="#d9715d" lineWidth={3}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={i===1?probeMarker:at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.35} scale={5.1} far={1.7} resolution={128} frames={1}/>
  </>;
}

type Trial={sample:number;moisture:number;dry:number|null;damp:number|null;flag:boolean};
const initial:Trial={sample:0,moisture:22,dry:null,damp:null,flag:false};
const rawReading=(trial:Trial)=>samples[trial.sample]?.raw??Math.round(573-269*trial.moisture/100);
function relativeIndex(trial:Trial){
  const {dry,damp}=trial;
  if(dry===null||damp===null||Math.abs(damp-dry)<12)return null;
  return Math.max(0,Math.min(100,Math.trunc(100*(rawReading(trial)-dry)/(damp-dry))));
}

export default function BasilPotMoistureDemo(){
  const [trial,setTrial]=useState(initial);
  const [selected,select]=useState(0);
  const {sample,moisture,dry,damp,flag}=trial;
  const index=relativeIndex(trial);
  const calibrated=index!==null;
  function update(patch:Partial<Trial>){
    setTrial(previous=>{
      const next={...previous,...patch};
      const index=relativeIndex(next);
      return {...next,flag:index!==null&&(index<=30||(index<40&&previous.flag))};
    });
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D basil pot moisture flag">
        <Canvas camera={{position:[2.3,3.2,6.1],fov:40}} dpr={[1,1.6]} fallback={<p>Follow the probe readings below.</p>}>
          <Bench {...{sample,moisture,flag,selected,select}}/><OrbitControls target={[0,.60,0]} enablePan={false} minDistance={3.5} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Soil readings"><div><span>Raw ADC</span><strong>{rawReading(trial)}</strong></div><div><span>Relative index</span><strong>{index??'—'}</strong></div><div><span>Dry flag</span><strong>{flag?'On':'Off'}</strong></div></div>
    </div>
    <div className="gp-guide">
      <h3>Calibrate the probe, then check the pot</h3>
      <p>Capture each reference. Move the probe to the basil pot and see whether watering clears the flag.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button gp-secondary" onClick={()=>{update({sample:0,dry:samples[0].raw});select(0);}}>{dry===null?'Capture dry cup':'Recapture dry cup'}</button>
        <button type="button" className="gp-button gp-secondary" onClick={()=>{update({sample:1,damp:samples[1].raw});select(0);}}>{damp===null?'Capture damp cup':'Recapture damp cup'}</button>
        <button type="button" className="gp-button" disabled={!calibrated} onClick={()=>{update({sample:2});select(1);}}>Check basil pot</button>
        <button type="button" onClick={()=>{setTrial(initial);select(0);}}>Reset trial</button>
      </div>
      <p>Dry reference <strong>{dry??'—'}</strong> · Damp reference <strong>{damp??'—'}</strong></p>
      {sample===2&&<><label className="gp-home-light">Simulated soil moisture <output>{moisture}</output><input type="range" aria-label="Simulated soil moisture" min="0" max="100" value={moisture} onChange={event=>update({moisture:event.target.valueAsNumber})}/></label><div className="gp-steps"><button type="button" className="gp-button gp-secondary" onClick={()=>update({moisture:78})}>Water the pot</button><button type="button" onClick={()=>update({moisture:22})}>Let the mix dry</button></div></>}
      <p role="status">{!calibrated?'Capture both references.':flag?'Dry flag on.':'Dry flag off.'}</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p>{labels[selected].detail}</p>
    </div>
  </div>;
}
