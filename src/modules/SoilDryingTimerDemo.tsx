import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {OpenSoilTray} from './SoilDryingParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Open soil tray',at:[.63,.52,.92],detail:'The uncovered surface can dry. Keep the same soil amount and probe depth when comparing trials.'},
  {name:'Fixed probe · A0',at:[.56,1.16,.05],detail:'A0 reads the blade at the same spot and depth on every scheduled sample.'},
  {name:'Arduino timer',at:[-1.10,.42,.89],detail:'The Uno takes one reading each minute. A reading above 35 clears the consecutive-low count.'},
  {name:'Dry indicator · D8',at:[-1.95,.40,1.25],detail:'The series resistor limits LED current. D8 lights after the third consecutive low reading and stays on until reset.'},
];

const example=[72,51,34,40,35,32,29];
const dryLimit=35;
const requiredLow=3;
type Reading={minute:number;index:number;count:number};
const baseline:Reading={minute:0,index:example[0],count:0};

function Bench({reading,confirmed,selected,select}:{reading:Reading;confirmed:boolean;selected:number;select:(i:number)=>void}){
  return <>
    <color attach="background" args={['#3e515a']}/>
    <hemisphereLight args={['#ebf4ff','#907764',2.08]}/><directionalLight position={[-3,6,4]} color="#fff2dd" intensity={2.14}/>
    <Box at={[0,-.094,0]} size={[4.8,.19,3.06]} color="#7f8e88"/>
    <group position={[.72,.095,.02]} scale={[1.58,1.35,1.41]} onClick={()=>select(0)}><OpenSoilTray moisture={reading.index} selected={selected===0}/></group>
    <group position={[.84,.88,-.22]} onClick={()=>select(1)}>
      <Box at={[0,-.17,0]} size={[.17,.61,.034]} color={selected===1?'#e7b074':'#26353c'}/>
      <Box at={[0,.104,0]} size={[.188,.123,.041]} color="#233b44"/>
      <Box at={[0,.171,.02]} size={[.124,.066,.065]} color="#e0ddcf"/>
      <Box at={[-.041,.094,.026]} size={[.053,.046,.013]} color="#242b34"/>
    </group>
    <group onClick={()=>select(2)}>
      <Box at={[-1.21,.105,.83]} size={[1.02,.086,.55]} color={selected===2?'#6da4a1':'#287b8b'}/>
      <Box at={[-1.59,.176,.92]} size={[.18,.111,.147]} color="#b9c8cc" metal={.61}/>
      <Box at={[-1.06,.172,.83]} size={[.25,.059,.109]} color="#27353a"/>
      {[.64,1.029].map(z=><Box key={z} at={[-1.15,.166,z]} size={[.62,.055,.046]} color="#25333c"/>)}
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[-1.93,.104,1.17]} size={[.49,.11,.44]} color={selected===3?'#e4b788':'#e2ddd1'}/>
      <Box at={[-1.97,.18,1.14]} size={[.28,.039,.040]} color="#b1926d"/>
      <mesh position={[-1.83,.248,1.23]}><sphereGeometry args={[.064,22,14]}/><meshStandardMaterial color={confirmed?'#ff7751':'#84443a'} emissive="#ff5d36" emissiveIntensity={confirmed?2.65:0}/></mesh>
      {confirmed&&<pointLight position={[-1.83,.30,1.23]} color="#ff754a" intensity={1.25} distance={.82}/>}
    </group>
    {['#e0ad61','#bc6559','#304452'].map((color,i)=><Line key={color} points={[[.81+i*.032,1.056,-.20],[.34+i*.037,1.13,.13],[-.57+i*.048,.40,.39],[-.93-i*.11,.18,.65]]} color={color} lineWidth={2.55}/>)}
    <Line points={[[-1.38,.17,1.04],[-1.48,.17,1.26],[-1.81,.17,1.18]]} color="#cc7363" lineWidth={3}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.35} scale={5.2} far={1.8} resolution={128} frames={1}/>
  </>;
}

export default function SoilDryingTimerDemo(){
  const [selected,select]=useState(0);
  const [log,setLog]=useState<Reading[]>([]);
  const reading=log[log.length-1]??baseline;
  const confirmed=reading.count===requiredLow;
  function advance(){
    setLog(previous=>{
      if(!previous.length)return [baseline];
      const last=previous[previous.length-1];
      if(last.count===requiredLow)return previous;
      const minute=last.minute+1;
      const index=example[minute];
      return [...previous,{minute,index,count:index<=dryLimit?last.count+1:0}];
    });
  }
  const countReset=log.length>1&&reading.index>dryLimit&&log[log.length-2].count>0;
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D soil drying timer study">
        <Canvas camera={{position:[2.1,3.25,6.3],fov:41}} dpr={[1,1.6]} fallback={<p>Use the log to follow the threshold and confirmation.</p>}><Bench {...{reading,confirmed,selected,select}}/><OrbitControls target={[0,.57,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Drying timer readings">
        <div><span>Elapsed time</span><strong>{log.length?reading.minute+' min':'—'}</strong></div>
        <div><span>Relative soil index</span><strong>{reading.index}</strong></div>
        <div><span>Consecutive low</span><strong>{reading.count} / {requiredLow}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Time the confirmed dry reading</h3>
      <p>The probe starts calibrated. Step through simulated one-minute samples. Compare the first dip with the time the LED actually lights.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={confirmed} onClick={advance}>{log.length?'Sample next minute':'Start timer'}</button>
        <button type="button" onClick={()=>{setLog([]);select(0);}}>Reset timer</button>
      </div>
      <p role="status">{!log.length?'Ready to start above the dry limit.':confirmed?`Dry confirmed at ${reading.minute} minutes. LED on.`:countReset?'Back above 35. The count reset.':reading.count?`Low reading ${reading.count} of ${requiredLow}. LED off.`:'Above the dry limit. LED off.'}</p>
      {log.length>0&&<table className="gp-mulch-log" aria-label="Soil drying sample log"><thead><tr><th scope="col">Minute</th><th scope="col">Index</th><th scope="col">Consecutive low</th></tr></thead><tbody>{log.map(row=><tr key={row.minute}><th scope="row">{row.minute}</th><td>{row.index}</td><td>{row.count}</td></tr>)}</tbody></table>}
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button className="gp-part-label" type="button" aria-pressed={i===selected} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{labels[selected].detail}</p>
    </div>
  </div>;
}
