import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {MulchTray} from './MulchMoistureParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Bare tray · A0',at:[-1.11,.68,.80],detail:'The bare tray is the control. Its probe reads the soil below the exposed surface.'},
  {name:'Covered tray · A1',at:[1.11,.68,.80],detail:'Wood chips cover the soil. The probe goes to the same depth below the soil surface as the bare probe.'},
  {name:'Probe connectors',at:[-.15,1.11,.10],detail:'Both probes share power and ground and have their own analog channels and calibration values.'},
  {name:'Arduino Uno logger',at:[.04,.40,1.39],detail:'The Uno records both readings at the same time. Loss is measured from each tray’s starting index.'},
];
const startingIndex=84;
const lastHour=24;
const moistureAt=(hour:number)=>[Math.round(startingIndex*Math.exp(-.044*hour)),Math.round(startingIndex*Math.exp(-.018*hour))];
type Row={hour:number;bare:number;covered:number};
const readingAt=(hour:number):Row=>{
  const [bare,covered]=moistureAt(hour);
  return {hour,bare,covered};
};

function Bench({reading,selected,select}:{reading:Row;selected:number;select:(index:number)=>void}){
  return <>
    <color attach="background" args={['#40535a']}/>
    <hemisphereLight args={['#edf6ff','#987e67',2.10]}/><directionalLight position={[-3,6,4]} color="#fff0d9" intensity={2.15}/>
    <Box at={[0,-.095,0]} size={[4.83,.19,3.08]} color="#83918b"/>
    {[reading.bare,reading.covered].map((moisture,i)=>{
      const x=(i===0?-1:1)*1.08;
      return <group key={i} position={[x,.01,-.16]}>
        <group onClick={()=>select(i)} scale={[1.27,1.40,1.26]}><MulchTray covered={i===1} moisture={moisture} selected={selected===i}/></group>
        <Box at={[0,.25,.613]} size={[.58,.122,.022]} color={i===0?'#ece4d0':'#d3e4dd'}/>
        <group position={[i===0?.27:-.27,.46,.04]} rotation={[0,0,i===0?-.12:.12]} onClick={()=>select(2)}>
          <Box at={[0,-.13,0]} size={[.17,.36,.031]} color={selected===2?'#e6b273':'#27343a'}/>
          <Box at={[0,.081,0]} size={[.184,.127,.045]} color="#293b48"/>
          <Box at={[0,.157,.024]} size={[.122,.064,.063]} color="#e0dbcc"/>
        </group>
        <Line points={[[i===0?.27:-.27,.64,.06],[i===0?.19:-.19,.82,.24],[-x*.31,.20,.85],[-x-.38+i*.12,.19,1.07]]} color={i===0?'#e8b572':'#6ebed1'} lineWidth={3}/>
      </group>;
    })}
    <group onClick={()=>select(3)}>
      <Box at={[0,.055,1.09]} size={[1.12,.10,.58]} color="#576764"/>
      <Box at={[0,.138,1.09]} size={[.93,.071,.42]} color={selected===3?'#6eacab':'#287c8b'}/>
      <Box at={[-.34,.207,1.14]} size={[.19,.12,.15]} color="#bfcdd1" metal={.57}/>
      <Box at={[.09,.205,1.08]} size={[.25,.060,.112]} color="#26343a"/>
      {[.947,1.25].map(z=><Box key={z} at={[.05,.198,z]} size={[.61,.052,.042]} color="#243036"/>)}
      <Line points={[[-.42,.19,1.15],[-.80,.17,1.32],[-1.15,.16,1.40],[-1.51,.09,1.40]]} color="#32414a" lineWidth={4}/>
    </group>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.34} scale={5.1} far={1.8} resolution={128} frames={1}/>
  </>;
}

export default function MulchMoistureDemo(){
  const [hour,setHour]=useState(0);
  const [log,setLog]=useState<Row[]>([]);
  const [selected,select]=useState(0);
  const reading=readingAt(hour);
  const ready=log.length>0;
  const logged=log[log.length-1]?.hour===hour;
  const csv=['elapsed_hours,bare_index,covered_index,bare_loss,covered_loss',...log.map(({hour,bare,covered})=>[hour,bare,covered,startingIndex-bare,startingIndex-covered].join(','))].join('\n');
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D mulch moisture experiment">
        <Canvas camera={{position:[2.03,3.63,6.22],fov:41}} dpr={[1,1.6]} fallback={<p>Use the tray readouts to compare the samples.</p>}><Bench {...{reading,selected,select}}/><OrbitControls target={[0,.45,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Tray moisture readings">
        <div><span>Elapsed time</span><strong>{hour} h</strong></div><div><span>Bare tray index</span><strong>{reading.bare}</strong></div><div><span>Covered tray index</span><strong>{reading.covered}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Compare how the trays dry</h3>
      <p>Start with matched, calibrated probes and equally damp soil. Record the baseline, advance four hours, and log both trays. This model illustrates slower drying under mulch using simulated values.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={logged} onClick={()=>setLog(previous=>[...previous,reading])}>{ready?'Log both trays':'Record baseline'}</button>
        <button type="button" className="gp-button gp-secondary" disabled={!ready||!logged||hour===lastHour} onClick={()=>setHour(previous=>Math.min(previous+4,lastHour))}>Advance 4 hours</button>
        <button type="button" onClick={()=>{setHour(0);setLog([]);select(0);}}>Reset trial</button>
      </div>
      <p role="status">{!ready?'Record the baseline.':!logged?'Log the readings at this interval.':hour===lastHour?'Trial complete. Compare the losses.':'Both readings logged.'}</p>
      {ready&&<>
        <table className="gp-mulch-log" aria-label="Drying log"><thead><tr><th scope="col">Hour</th><th scope="col">Bare loss</th><th scope="col">Covered loss</th></tr></thead><tbody>
          {log.map(row=><tr key={row.hour}><th scope="row">{row.hour}</th><td>{startingIndex-row.bare}</td><td>{startingIndex-row.covered}</td></tr>)}
        </tbody></table>
        <a className="gp-button gp-secondary" href={`data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`} download="mulch-moisture-trial.csv">Download trial CSV</a>
      </>}
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={i===selected} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{labels[selected].detail}</p>
    </div>
  </div>;
}
