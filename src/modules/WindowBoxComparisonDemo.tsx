import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {WindowBoxPlanter} from './WindowBoxParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Window box · A0',at:[-1.19,.62,.69],detail:'This probe follows the sample closest to the window. A0 uses its own dry and damp references.'},
  {name:'Shaded box · A1',at:[1.20,.62,.68],detail:'This probe is at the same depth in the same mix. A1 measures the sample farther from the window.'},
  {name:'Window exposure',at:[-.86,2.15,-.85],detail:'Both trials start with matched moisture. The sunny-day example gives the window box a faster modeled drying rate.'},
  {name:'Paired logger',at:[0,.34,1.27],detail:'The Uno logs both channels at the same time. Compare how far each drops from its own starting reading.'},
];
const baseline=82;
const hoursPerSample=2;
const lastHour=8;
const rates={sunny:.077,cloudy:.039};
type Weather=keyof typeof rates;
function measurements(day:Weather,hour:number){
  return {window:Math.round(baseline*Math.exp(-rates[day]*hour)),shade:Math.round(baseline*Math.exp(-.029*hour))};
}

function Bench({day,hour,selected,select}:{day:Weather;hour:number;selected:number;select:(i:number)=>void}){
  const sunny=day==='sunny';
  const reading=measurements(day,hour);
  return <>
    <color attach="background" args={['#44565d']}/>
    <hemisphereLight args={['#eaf4fc','#998472',2.06]}/>
    <directionalLight position={[-3,6,5]} color="#fff3e2" intensity={1.3}/>
    <pointLight position={[-1.25,2.3,-.65]} color={sunny?'#ffd493':'#c3d8ed'} intensity={sunny?15:6} distance={4} decay={2}/>
    <Box at={[0,-.095,0]} size={[4.87,.19,3.14]} color="#85918a"/>
    <group onClick={()=>select(2)}>
      <Box at={[-1.05,1.13,-1.18]} size={[2.14,2.15,.11]} color={selected===2?'#d5b58d':'#9daba8'}/>
      <mesh position={[-1.05,1.24,-1.104]}><planeGeometry args={[1.84,1.72]}/><meshStandardMaterial color={sunny?'#9fc4d7':'#9caebd'} emissive={sunny?'#5e8eac':'#536577'} emissiveIntensity={sunny?.32:.16}/></mesh>
      {[-1.99,-1.05,-.11].map(x=><Box key={x} at={[x,1.23,-1.048]} size={[.071,1.78,.078]} color="#e0ded0"/>)}
      {[.35,1.23,2.11].map(y=><Box key={y} at={[-1.05,y,-1.044]} size={[1.94,.071,.079]} color="#e0ded0"/>)}
      <Box at={[-1.05,.30,-1.00]} size={[2.17,.08,.29]} color="#c2b9a8"/>
      {sunny?<mesh position={[-1.62,1.76,-1.08]}><circleGeometry args={[.205,36]}/><meshBasicMaterial color="#ffe2a3"/></mesh>:<group>{[-1.6,-1.40,-1.24].map((x,i)=><mesh key={x} position={[x,1.63+i*.04,-1.08]} scale={[.27,.14,.02]}><sphereGeometry args={[1,22,12]}/><meshBasicMaterial color="#d6dce1"/></mesh>)}</group>}
    </group>
    {[reading.window,reading.shade].map((index,i)=>{
      const x=(i===0?-1:1)*1.17;
      return <group key={i} position={[x,.01,.21]} onClick={()=>select(i)}>
        <WindowBoxPlanter index={index} selected={selected===i}/>
        <group position={[i===0?.28:-.29,.52,-.04]} rotation={[0,0,i===0?-.10:.10]}>
          <Box at={[0,-.12,0]} size={[.148,.37,.032]} color={selected===i?'#dcb073':'#24353e'}/>
          <Box at={[0,.08,0]} size={[.168,.113,.043]} color="#263d48"/>
          <Box at={[0,.149,.018]} size={[.113,.058,.058]} color="#e2ddd0"/>
        </group>
      </group>;
    })}
    <group onClick={()=>select(3)}>
      <Box at={[0,.108,1.03]} size={[1.02,.085,.58]} color={selected===3?'#74aba4':'#287989'}/>
      <Box at={[-.36,.176,1.13]} size={[.18,.111,.14]} color="#bdc6ca" metal={.63}/>
      <Box at={[.11,.176,1.02]} size={[.25,.06,.112]} color="#26333a"/>
      {[.82,1.25].map(z=><Box key={z} at={[.03,.169,z]} size={[.63,.055,.047]} color="#25353d"/>)}
    </group>
    <Line points={[[-.89,.69,.19],[-.76,.78,.39],[-.50,.20,.71],[-.19,.18,.83]]} color="#e8b26e" lineWidth={3}/>
    <Line points={[[.88,.69,.19],[.74,.78,.39],[.49,.20,.67],[.23,.18,.83]]} color="#70bfca" lineWidth={3}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.35} scale={5.2} far={1.8} resolution={128} frames={1}/>
  </>;
}

export default function WindowBoxComparisonDemo(){
  const [day,setDay]=useState<Weather>('sunny');
  const [hour,setHour]=useState(-1);
  const [selected,select]=useState(0);
  const current=Math.max(0,hour);
  const reading=measurements(day,current);
  const gap=reading.shade-reading.window;
  const rows=hour<0?[]:Array.from({length:hour/hoursPerSample+1},(_,i)=>{
    const time=i*hoursPerSample;
    const reading=measurements(day,time);
    return {time,windowLoss:baseline-reading.window,shadeLoss:baseline-reading.shade,gap:reading.shade-reading.window};
  });
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D window box comparison">
        <Canvas camera={{position:[2.25,3.35,6.55],fov:42}} dpr={[1,1.6]} fallback={<p>Compare both box readings in the log.</p>}><Bench hour={current} {...{day,selected,select}}/><OrbitControls target={[0,.82,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Window box readings">
        <div><span>Elapsed time</span><strong>{hour<0?'—':hour+' h'}</strong></div><div><span>Window index</span><strong>{reading.window}</strong></div><div><span>Shade index</span><strong>{reading.shade}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Compare a sunny and a cloudy day</h3>
      <p>Both boxes start at 82 on the relative scale. Sample every two simulated hours. Changing weather starts a fresh trial.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button gp-secondary" aria-pressed={day==='sunny'} onClick={()=>{if(day!=='sunny'){setDay('sunny');setHour(-1);}select(2);}}>Sunny day</button>
        <button type="button" className="gp-button gp-secondary" aria-pressed={day==='cloudy'} onClick={()=>{if(day!=='cloudy'){setDay('cloudy');setHour(-1);}select(2);}}>Cloudy day</button>
      </div>
      <div className="gp-steps"><button className="gp-button" type="button" disabled={hour===lastHour} onClick={()=>setHour(previous=>previous<0?0:Math.min(lastHour,previous+hoursPerSample))}>{hour<0?'Record baseline':'Sample next 2 hours'}</button><button type="button" onClick={()=>{setDay('sunny');setHour(-1);select(0);}}>Reset trial</button></div>
      <p role="status">{hour<0?'Record the matched baseline.':hour===lastHour?`Trial complete. The window box lost ${gap} more points.`:`Window minus shade loss: ${gap} points.`}</p>
      {rows.length>0&&<table className="gp-mulch-log" aria-label="Window and shade drying log"><thead><tr><th scope="col">Hour</th><th scope="col">Window loss</th><th scope="col">Shade loss</th><th scope="col">Difference</th></tr></thead><tbody>{rows.map(row=><tr key={row.time}><th scope="row">{row.time}</th><td>{row.windowLoss}</td><td>{row.shadeLoss}</td><td>{row.gap}</td></tr>)}</tbody></table>}
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button className="gp-part-label" type="button" aria-pressed={i===selected} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{labels[selected].detail}</p>
    </div>
  </div>;
}
