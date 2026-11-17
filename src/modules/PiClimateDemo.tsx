import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { CatmullRomCurve3, Vector3, type Mesh } from 'three';
import { piBench } from '../data/pi-prototyping';
import { WorldLabel } from './LabWorkbench';
import { download } from './state';

type Point = [number, number, number];
type Reading = { time: string; temperature: number; humidity: number };
const markers = [
  ['Raspberry Pi 5', 'Python checks the I²C sensor response, updates the LED and writes captures to the card.'],
  ['SHT31-D', 'The orange and dark leads supply 3.3 V and ground. Blue carries data, and yellow carries the clock signal.'],
  ['Threshold LED and resistor', 'GPIO27 drives the LED through 220 Ω. The LED lights at or above the threshold when the sensor reports a valid sample.'],
  ['Capture switch', 'Pressing the switch pulls GPIO17 to ground. The script saves a timestamp and the sensor reading to a CSV file.'],
  ['Active cooler', 'The Pi controls this cooler through its separate fan connector. Place the sensor outside the cooler exhaust.'],
] as const;

function Box({ at, size, color, metal = 0 }: {at: Point; size: Point; color: string; metal?: number}) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.15} smoothness={2} castShadow receiveShadow>
    <meshStandardMaterial color={color} metalness={metal} roughness={metal ? .32 : .65}/>
  </RoundedBox>;
}

export function PiCooler({ highlighted = false }: {highlighted?: boolean}) {
  return <>
    <Box at={[0,.05,0]} size={[1.48,.12,1.22]} color="#7f8d93" metal={.55}/>
    {Array.from({length:12},(_,i)=><Box key={i} at={[-.66+i*.12,.172,0]} size={[.057,.21,1.17]} color={highlighted?'#edd188':'#a7b5b8'} metal={.62}/>)}
    <mesh position={[.26,.30,.12]}><cylinderGeometry args={[.38,.38,.12,32]}/><meshStandardMaterial color="#1e252a"/></mesh>
    {[0,1,2,3,4,5,6].map(i=><group key={i} rotation={[0,i*Math.PI/3.5,0]} position={[.26,.373,.12]}>
      <Box at={[.18,0,0]} size={[.23,.018,.095]} color="#586063"/>
    </group>)}
    <mesh position={[.26,.39,.12]}><cylinderGeometry args={[.103,.103,.058,20]}/><meshStandardMaterial color="#262d33"/></mesh>
    <Line points={[[.57,.26,.28],[.76,.14,.42],[.60,.12,.67]]} color="#be5943" lineWidth={1.2}/>
  </>;
}

export function PiSensor({ highlighted = false }: {highlighted?: boolean}) {
  return <>
    <Box at={[0,.053,0]} size={[.76,.10,.53]} color={highlighted?'#5958af':'#263451'}/>
    {[-.24,.24].map(x=><mesh key={x} position={[x,.109,.14]}><ringGeometry args={[.021,.037,18]}/><meshStandardMaterial color="#c2a36b" side={2}/></mesh>)}
    <Box at={[.02,.128,.03]} size={[.212,.055,.178]} color="#282f38"/>
    <Box at={[.02,.159,.03]} size={[.112,.013,.101]} color="#b8b0a0" metal={.25}/>
    {[-.28,.28].map(x=><Box key={x} at={[x,.149,-.11]} size={[.14,.13,.19]} color="#e0e1d4"/>)}
    {[0,1,2,3].map(i=><Box key={i} at={[-.215+i*.145,.127,.212]} size={[.047,.055,.047]} color="#d7b267" metal={.35}/>)}
  </>;
}

const pin = (number: number): Point => [-1.29 + Math.floor((number-1)/2)*.128,.39, number%2 ? -.67 : -.806];
export function PiBoard({ selected, installedCooler = true }: {selected: number; installedCooler?: boolean}) {
  return <>
    <Box at={[0,.109,0]} size={[2.84,.11,1.86]} color={selected===0?'#358c71':'#1f634e'}/>
    {[-1.23,1.23].flatMap(x=>[-.73,.73].map(z=><mesh key={`${x}-${z}`} position={[x,.168,z]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[.046,.079,20]}/><meshStandardMaterial color="#ba9c5b" metalness={.64}/>
    </mesh>))}
    <Box at={[-.073,.193,-.739]} size={[2.57,.088,.245]} color="#222731"/>
    {Array.from({length:40},(_,i)=><Box key={i} at={[pin(i+1)[0],.283,pin(i+1)[2]]} size={[.027,.171,.027]} color={i===0?'#e8d487':'#aa8950'} metal={.51}/>)}
    {[-.53,.07,.67].map((z,i)=><group key={z}>
      <Box at={[1.20,.386,z]} size={[.60,.445,.49]} color="#bdc8ce" metal={.73}/>
      <Box at={[1.51,.393,z]} size={[.018,.284,.353]} color={i===1?'#416f99':'#2b3642'}/>
      {i!==0&&<Box at={[1.522,.389,z]} size={[.017,.037,.353]} color="#a7b3bb" metal={.7}/>}
    </group>)}
    {[-.89,-.42,-.05].map(x=><Box key={x} at={[x,.221,.87]} size={[.26,.12,.21]} color="#a9b7bb" metal={.7}/>)}
    {Array.from({length:10},(_,i)=><Box key={i} at={[-1.10+i*.095,.178,.53]} size={[.046,.030,.066]} color={i%3?'#414745':'#b7ae95'}/>)}
    {installedCooler ? <group position={[-.18,.156,-.02]} scale={.88}><PiCooler highlighted={selected===4}/></group> :
      <Box at={[-.23,.188,0]} size={[.51,.063,.5]} color="#9ea3a4" metal={.5}/>}
  </>;
}

const wires: {from: number; to: Point; color: string; bend: number; sensor?: boolean}[] = [
  {from:1,to:[1.535,.24,-.65],color:'#ec9252',bend:-1.79,sensor:true},
  {from:6,to:[1.68,.24,-.65],color:'#354350',bend:-1.63,sensor:true},
  {from:3,to:[1.825,.24,-.65],color:'#60b8f0',bend:-1.46,sensor:true},
  {from:5,to:[1.97,.24,-.65],color:'#f0cb65',bend:-1.29,sensor:true},
  {from:9,to:[2.54,.25,1.31],color:'#354350',bend:-.50},
  {from:13,to:[1.68,.257,.45],color:'#d887b4',bend:-.24},
  {from:11,to:[2.85,.27,.77],color:'#90d0a0',bend:-.78},
];
const piOrigin: Point = [-1.62,.10,.06];
function DataPulse({ curve }: {curve: CatmullRomCurve3}) {
  const pulse = useRef<Mesh>(null);
  useFrame(({clock})=>{
    if(pulse.current) curve.getPointAt(1 - clock.elapsedTime % 1, pulse.current.position);
  });
  return <mesh ref={pulse}><sphereGeometry args={[.034,12,10]}/><meshBasicMaterial color="#a7e7ff"/></mesh>;
}

function Bench({ running, fault, led, pressed, selected, select, labels }: {
  running: boolean; fault: boolean; led: boolean; pressed: boolean; selected: number; select: (i: number)=>void; labels: boolean;
}) {
  const points: Point[] = [[-2.30,.51,.18],[1.78,.37,-.84],[2.08,.55,.47],[3.02,.36,.93],[-1.78,.68,.05]];
  const tags: Point[] = [[-3.05,.95,.60],[2.30,.81,-1.35],[1.72,.98,.35],[3.55,.70,1.0],[-1.14,1.14,-.22]];
  return <>
    <color attach="background" args={['#243847']}/>
    <ambientLight intensity={.64}/>
    <directionalLight intensity={2.4} position={[-5,8,6]} color="#fff1df"/>
    <directionalLight intensity={1.4} position={[5,4,-6]} color="#add6fb"/>
    <Box at={[0,-.17,0]} size={[12,.33,8]} color="#394d56"/>
    <group position={piOrigin}><PiBoard selected={selected}/></group>
    <Line points={[[-2.51,.32,.96],[-2.54,.29,1.18],[-2.65,.14,1.68],[-3.11,.10,2.13],[-3.52,.10,2.42]]} color="#242b31" lineWidth={4}/>
    <group position={[1.75,.10,-.86]}><PiSensor highlighted={selected===1}/></group>
    <group position={[2.40,.12,.80]}>
      <Box at={[0,0,0]} size={[2.21,.20,1.22]} color="#e1dfd2"/>
      <Box at={[0,.101,0]} size={[2.18,.017,.092]} color="#b5b4aa"/>
      {Array.from({length:24},(_,x)=>[-.48,-.35,-.23,-.12,.12,.23,.35,.48].map(z=>
        <mesh key={`${x}/${z}`} position={[-1.00+x*.087,.111,z]}>
          <boxGeometry args={[.033,.005,.032]}/><meshStandardMaterial color="#777c7b"/>
        </mesh>))}
      <Box at={[0,.112,.555]} size={[2.03,.006,.018]} color="#435c9d"/>
    </group>
    {wires.map(({from,to,color,bend,sensor})=>{
      const [x,y,z]=pin(from);
      const start: Point=[x+piOrigin[0],y+piOrigin[1],z+piOrigin[2]];
      const path: Point[] = [start,[start[0],.61,bend],[(start[0]+to[0])/2,.50,bend],[to[0],.44,to[2]-.09],to];
      const curve = new CatmullRomCurve3(path.map(([x,y,z])=>new Vector3(x,y,z)));
      return <group key={from}><Line points={curve.getPoints(22)}
        color={fault&&sensor&&from===3?'#f28e82':color} lineWidth={selected===1&&sensor?2.9:1.95}/>{from===3&&running&&!fault&&<DataPulse curve={curve}/>}</group>;
    })}
    <Line points={[[1.97,.257,.45],[2.04,.251,.45],[2.08,.251,.53],[2.08,.31,.53]]} color="#adbac6" lineWidth={2.2}/>
    <Line points={[[2.16,.31,.62],[2.16,.25,.62],[2.35,.32,1.16],[2.54,.25,1.31],[2.95,.25,1.31],[3.14,.31,1.02]]} color="#394651" lineWidth={1.7}/>
    <mesh position={[1.85,.257,.45]} rotation={[0,0,Math.PI/2]}>
      <cylinderGeometry args={[.054,.054,.245,18]}/><meshStandardMaterial color={selected===2?'#ebce92':'#c8b18e'}/>
    </mesh>
    {['#a45943','#a45943','#503d36','#ae8847'].map((color,i)=><mesh key={i} position={[1.779+i*.044,.257,.45]} rotation={[0,0,Math.PI/2]}>
      <cylinderGeometry args={[.055,.055,.016,18]}/><meshStandardMaterial color={color}/>
    </mesh>)}
    <mesh position={[2.12,.387,.57]}>
      <cylinderGeometry args={[.082,.095,.22,24]}/><meshStandardMaterial color={led?'#ff4f41':selected===2?'#b85d57':'#812f37'} emissive="#ff2f1a" emissiveIntensity={led?2.8:0}/>
    </mesh>
    <mesh position={[2.12,.495,.57]}>
      <sphereGeometry args={[.081,24,12,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color={led?'#ff6452':'#a23b42'} emissive="#ff2f1a" emissiveIntensity={led?3.0:0}/>
    </mesh>
    {led&&<pointLight position={[2.12,.57,.57]} distance={1.2} intensity={.9} color="#ff3b20"/>}
    <Box at={[3.03,.259,.87]} size={[.33,.088,.33]} color={selected===3?'#707757':'#343d45'}/>
    <mesh position={[3.03,pressed?.314:.354,.87]}>
      <cylinderGeometry args={[.101,.101,.105,22]}/><meshStandardMaterial color={pressed?'#acddae':'#485258'}/>
    </mesh>
    <mesh position={[-2.88,.299,.92]}>
      <sphereGeometry args={[.031,12,8]}/><meshStandardMaterial color="#93ba70" emissive="#7aff5d" emissiveIntensity={running?2:0}/>
    </mesh>
    <ContactShadows position={[0,.002,0]} color="#1b2b32" scale={10} blur={2.4} opacity={.56}/>
    {labels&&tags.map((tag,i)=><group key={i}><Line points={[points[i],tag]} lineWidth={1.3} color={selected===i?'#ffe09c':'#c0d0da'}/>
      <WorldLabel position={tag} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={markers[i][0]} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}</button></WorldLabel>
    </group>)}
  </>;
}

export default function PiClimateDemo() {
  const [running,setRunning]=useState(false);
  const [temperature,setTemperature]=useState(24);
  const [humidity,setHumidity]=useState(52);
  const [threshold,setThreshold]=useState(piBench.threshold);
  const [fault,setFault]=useState(false);
  const [selected,select]=useState(0);
  const [labels,setLabels]=useState(true);
  const [records,setRecords]=useState<Reading[]>([]);
  const [notice,setNotice]=useState('Run the bench to start receiving sensor readings.');
  const [pressed,setPressed]=useState(false);
  const pressTimer=useRef(0);
  useEffect(()=>()=>window.clearTimeout(pressTimer.current),[]);
  const valid=running&&!fault;
  const led=valid&&temperature>=threshold;
  function capture() {
    select(3);
    window.clearTimeout(pressTimer.current);
    setPressed(true);
    pressTimer.current=window.setTimeout(()=>setPressed(false),250);
    if (!valid) {
      setNotice('Capture skipped. There is no valid reading.');
      return;
    }
    setRecords(entries=>[...entries,{time:new Date().toISOString(),temperature,humidity}]);
    setNotice('Saved a timestamped sensor reading.');
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive 3D Raspberry Pi climate bench">
        <Canvas dpr={[1,1.65]} camera={{position:[-.40,6.1,7.6],fov:40}} fallback={<p>The controls and data table are available without WebGL.</p>}>
          <Bench running={running} fault={fault} led={led} pressed={pressed} selected={selected} select={select} labels={labels}/>
          <OrbitControls target={[0,.28,.10]} minDistance={5.8} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Climate bench readings">
        <div><span>I²C reading</span><strong>{valid?`${temperature} °C · ${humidity}% RH`:running?'Sensor unavailable':'Waiting'}</strong></div>
        <div><span>GPIO27 LED</span><strong>{led?'On':'Off'}</strong></div>
        <div><span>Saved samples</span><strong>{records.length}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Run the bench and record a sample</h3>
      <p>Warm the simulated air above the threshold, press Capture, then inject a sensor fault and try again.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>{setRunning(value=>!value);setNotice(running?'Sampling stopped.':'Sampling the I²C sensor.');}}>{running?'Stop bench':'Run bench'}</button>
        <button type="button" className="gp-button gp-secondary" onClick={capture}>Press capture switch</button>
        <button type="button" aria-pressed={fault} onClick={()=>{setFault(value=>!value);setNotice(fault?'Sensor fault cleared.':'Sensor read failed. The LED turns off and captures are skipped.');}}>{fault?'Clear sensor fault':'Simulate sensor fault'}</button>
        <button type="button" aria-pressed={labels} onClick={()=>setLabels(value=>!value)}>Scene labels</button>
      </div>
      <label htmlFor="pi-demo-temp">Air temperature · {temperature} °C</label>
      <input id="pi-demo-temp" type="range" className="gp-lidar-range" min={16} max={40} value={temperature} onChange={event=>setTemperature(Number(event.target.value))}/>
      <label htmlFor="pi-demo-rh">Relative humidity · {humidity}%</label>
      <input id="pi-demo-rh" type="range" className="gp-lidar-range" min={15} max={90} value={humidity} onChange={event=>setHumidity(Number(event.target.value))}/>
      <label htmlFor="pi-demo-limit">LED threshold · {threshold} °C</label>
      <input id="pi-demo-limit" type="range" className="gp-lidar-range" min={20} max={37} value={threshold} onChange={event=>setThreshold(Number(event.target.value))}/>
      <p className="gp-demo-description" role="status">{notice}</p>
      <ol className="gp-demo-labels">{markers.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{markers[selected][1]}</p>
      {records.length>0&&<div className="gp-table"><table><caption>Latest saved samples</caption><thead><tr><th>Time</th><th>°C</th><th>% RH</th></tr></thead>
        <tbody>{records.slice(-5).reverse().map(({time,temperature,humidity},index)=><tr key={index}><td>{time.slice(11,19)} UTC</td><td>{temperature}</td><td>{humidity}</td></tr>)}</tbody>
      </table><button type="button" className="gp-button gp-secondary" onClick={()=>download('climate_log.csv', 'time,temperature_c,relative_humidity_pct\n'+records.map(record=>`${record.time},${record.temperature},${record.humidity}`).join('\n')+'\n')}>Download sample CSV</button></div>}
    </div>
  </div>;
}
