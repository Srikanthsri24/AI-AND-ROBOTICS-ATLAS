import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls } from '@react-three/drei';
import { flightAt, flightPoint, rocketLabSpeed } from '../data/water-rocket';
import { WorldLabel } from './LabWorkbench';
import { download } from './state';

type Point=[number,number,number];
type Flight=ReturnType<typeof flightAt>;
const scale=.49;
const startX=-3.8;
const baseline=.21;

export function VirtualBottleRocket() {
  return <>
    <mesh position={[0,.02,0]}>
      <cylinderGeometry args={[.108,.114,.52,32]}/>
      <meshPhysicalMaterial color="#95d7e1" metalness={.14} roughness={.27} clearcoat={.8}/>
    </mesh>
    <mesh position={[0,.34,0]}>
      <coneGeometry args={[.111,.126,32]}/><meshStandardMaterial color="#eacca0"/>
    </mesh>
    <mesh position={[0,-.26,0]}>
      <cylinderGeometry args={[.092,.063,.09,32]}/><meshStandardMaterial color="#263b49"/>
    </mesh>
    <mesh position={[0,.15,0]}>
      <cylinderGeometry args={[.111,.113,.11,32]}/><meshStandardMaterial color="#2b7c82"/>
    </mesh>
  </>;
}

export function VirtualLaunchStand({angle=45}: {angle?:number}) {
  return <>
    <mesh position={[0,-.125,0]}><boxGeometry args={[.65,.13,.58]}/><meshStandardMaterial color="#41546a"/></mesh>
    <mesh position={[0,-.015,0]}><boxGeometry args={[.20,.22,.15]}/><meshStandardMaterial color="#536776" metalness={.48}/></mesh>
    <group rotation={[0,0,(angle-90)*Math.PI/180]}>
      <mesh position={[0,.18,.16]}><boxGeometry args={[.045,.53,.065]}/><meshStandardMaterial color="#deb56e" metalness={.44}/></mesh>
    </group>
  </>;
}

export function VirtualLandingField({mini=false}: {mini?:boolean}) {
  return <group scale={mini?.5:1}>
    <mesh position={[0,-.09,0]}><boxGeometry args={[10.3,.15,4.8]}/><meshStandardMaterial color="#466854"/></mesh>
    <mesh position={[-.04,-.004,0]}><boxGeometry args={[8.35,.015,.85]}/><meshStandardMaterial color="#d4c4a3"/></mesh>
    {Array.from({length:16},(_,index)=><Line key={index}
      points={[[startX+index*scale,.015,-.38],[startX+index*scale,.015,index%5===0?.38:-.20]]}
      color={index%5===0?'#36454c':'#766b57'} lineWidth={index%5===0?2:1}/>)}
  </group>;
}

function worldFlightPoint(flight:Flight,time:number):Point {
  const [distance,height]=flightPoint(flight,time);
  return [startX+distance*scale,baseline+height*scale,0];
}

function LaunchField({flight,time}: {flight:Flight;time:number}) {
  const points=useMemo(()=>Array.from({length:61},(_,index)=>worldFlightPoint(flight,flight.time*index/60)),[flight]);
  const peak=points[30];
  const [x,y,z]=worldFlightPoint(flight,time);
  const last=points.at(-1)!;
  const grounded=time>=flight.time;
  // Vertical velocity changes sign halfway through the flight.
  const vy=flight.vy*(1-2*time/flight.time);
  const angle=grounded ? -Math.PI/2 : Math.atan2(vy,flight.vx)-Math.PI/2;
  return <>
    <VirtualLandingField/>
    <group position={[startX,baseline,0]}><VirtualLaunchStand angle={flight.angle}/></group>
    <Line points={points} color="#7ceadc" lineWidth={2.3}/>
    <Line points={[[peak[0],.02,0],peak]} color="#b6e5df" lineWidth={1.4} dashed dashSize={.13} gapSize={.09}/>
    <Line points={[[last[0],.03,-.56],[last[0],.03,.56]]} color="#dfad58" lineWidth={2.4}/>
    <group position={[x,grounded?.116:y,z]} rotation={[0,0,angle]}><VirtualBottleRocket/></group>
    <WorldLabel position={[peak[0],peak[1]+.39,0]} className="gp-marker-anchor">
      <span className="gp-rocket-field-label">Peak · {flight.height.toFixed(2)} m</span>
    </WorldLabel>
    <WorldLabel position={[last[0],.13,.60]} className="gp-marker-anchor">
      <span className="gp-rocket-field-label">Landing · {flight.range.toFixed(2)} m</span>
    </WorldLabel>
    <ContactShadows position={[0,.01,0]} opacity={.40} blur={2.6} scale={11} far={4.5}/>
  </>;
}

export default function WaterRocketDemo() {
  const [angle,setAngle]=useState(45);
  const [time,setTime]=useState(0);
  const [running,setRunning]=useState(false);
  const [landed,setLanded]=useState(false);
  const [trials,setTrials]=useState<Flight[]>([]);
  const elapsed=useRef(0);
  const flight=useMemo(()=>flightAt(angle),[angle]);
  useEffect(()=>{
    if (!running) return;
    let frame=0, previous=performance.now();
    const trial=flightAt(angle);
    const tick=(now:number)=>{
      elapsed.current=Math.min(trial.time,elapsed.current+Math.min(.08,(now-previous)/1000));
      previous=now;
      setTime(elapsed.current);
      if(elapsed.current>=trial.time) {
        setRunning(false);
        setLanded(true);
        setTrials(history=>[...history.filter(item=>item.angle!==angle),trial].sort((a,b)=>a.angle-b.angle));
      } else frame=requestAnimationFrame(tick);
    };
    frame=requestAnimationFrame(tick);
    return ()=>cancelAnimationFrame(frame);
  },[angle,running]);

  function resetPlayback() {
    elapsed.current=0;
    setTime(0);
    setRunning(false);
    setLanded(false);
  }
  function run() {
    if(running) {setRunning(false);return;}
    if(elapsed.current>=flight.time) resetPlayback();
    setRunning(true);
  }

  return <>
    <div className="gp-split gp-demo">
      <div className="gp-story-stage">
        <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive virtual rocket field">
          <Canvas dpr={[1,1.5]} camera={{position:[2,4.5,11],fov:45}} fallback={<p>The comparison table is available without the 3D field.</p>}>
            <color attach="background" args={['#263e4d']}/>
            <ambientLight intensity={1.5}/>
            <directionalLight position={[-1,6,5]} intensity={2.5}/>
            <LaunchField flight={flight} time={time}/>
            <OrbitControls target={[0,1.15,0]} enablePan={false} minDistance={6} maxDistance={18}/>
          </Canvas>
        </div>
        <div className="gp-demo-result" aria-label="Predicted flight measurements">
          <div><span>Peak height</span><strong>{flight.height.toFixed(2)} m</strong></div>
          <div><span>Airtime</span><strong>{flight.time.toFixed(2)} s</strong></div>
          <div><span>Landing distance</span><strong>{flight.range.toFixed(2)} m</strong></div>
        </div>
      </div>
      <div className="gp-guide">
        <h3>Run a virtual launch</h3>
        <p>Compare angles at a fixed {rocketLabSpeed} m/s. The model starts after the initial push and assumes a level field with no drag.</p>
        <label htmlFor="gp-rocket-angle">Launch angle · {angle}°</label>
        <input className="gp-lidar-range" id="gp-rocket-angle" type="range" min={15} max={75} value={angle}
          onChange={event=>{resetPlayback();setAngle(Number(event.target.value));}}/>
        <div className="gp-steps" role="group" aria-label="Comparison angles">
          {[30,45,60].map(value=><button type="button" aria-pressed={angle===value} key={value} onClick={()=>{resetPlayback();setAngle(value);}}>{value}°</button>)}
        </div>
        <div className="gp-steps">
          <button type="button" className="gp-button" onClick={run}>{running?'Pause':landed?'Launch again':time>0?'Resume':'Launch'}</button>
          <button type="button" onClick={resetPlayback}>Return to start</button>
        </div>
        <p className="gp-check" role="status">{running?'In flight':landed?'Landed · trial recorded':time>0?'Playback paused':'Ready to launch'}</p>
        <label htmlFor="gp-rocket-time">Flight time · {time.toFixed(2)} s</label>
        <input className="gp-lidar-range" id="gp-rocket-time" type="range" min={0} max={flight.time} step="any" value={time}
          onChange={event=>{setRunning(false);setLanded(false);elapsed.current=Number(event.target.value);setTime(elapsed.current);}}/>
      </div>
    </div>
    <div className="gp-table"><table>
      <caption>Recorded flight trials</caption>
      <thead><tr><th>Launch angle</th><th>Peak height</th><th>Airtime</th><th>Landing distance</th></tr></thead>
      <tbody>{trials.length===0 ? <tr><td colSpan={4}>Complete a launch to add its measurements.</td></tr> : trials.map(item=>
        <tr key={item.angle}><td>{item.angle}°</td><td>{item.height.toFixed(2)} m</td><td>{item.time.toFixed(2)} s</td><td>{item.range.toFixed(2)} m</td></tr>)}</tbody>
    </table></div>
    <button className="gp-button gp-secondary" type="button" disabled={!trials.length} onClick={()=>download('virtual_water_rocket_trials.csv',
      ['angle_deg,peak_height_m,airtime_s,range_m',...trials.map(item=>`${item.angle},${item.height.toFixed(2)},${item.time.toFixed(2)},${item.range.toFixed(2)}`)].join('\n')+'\n')}>Download recorded trials</button>
  </>;
}
