import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { parkingOrigin, parkingPhases } from '../data/self-parking';
import { ParkingBlock } from './SelfParkingParts';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { Uno } from './ClassroomStationsDemo';
import { Sonar } from './DetectionBenchDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Outcome='ready'|'running'|'parked'|'short'|'blocked'|'manual';
type Run={elapsed:number;outcome:Outcome};
const labels=[
  ['Right sonar','This sensor measures the distance toward the curb. A jump after the first block starts the gap timer.'],
  ['Rear sonar','The rear sensor monitors clearance while reversing. A close target stops the maneuver.'],
  ['Front sonar','The nose sensor monitors clearance while the rover scans forward.'],
  ['Motor driver','The driver runs the wheels at different speeds to make the two reverse arcs.'],
  ['Parking bay','The rover estimates the gap from its forward speed and how long the right sensor sees open space.'],
] as const;
const duration=parkingPhases.reduce((sum,phase)=>sum+phase.ms,0);
const stopForRear=parkingPhases[0].ms+640;
const curbThreshold=parkingPhases[0].ms;
const startRun:Run={elapsed:0,outcome:'ready'};

function getPose(elapsed:number){
  let start=0;
  for(const [index,phase] of parkingPhases.entries()){
    if(elapsed<=start+phase.ms){
      const previous=parkingPhases[index-1]??parkingOrigin;
      const t=MathUtils.clamp((elapsed-start)/phase.ms,0,1);
      return {
        x:MathUtils.lerp(previous.x,phase.x,t),
        z:MathUtils.lerp(previous.z,phase.z,t),
        heading:MathUtils.lerp(previous.heading,phase.heading,t),
        phase:index,
      };
    }
    start+=phase.ms;
  }
  return {...parkingPhases[3],phase:3};
}

function Marker({i,at,selected,select}:{i:number;at:Point;selected:number;select:(i:number)=>void}){
  return <WorldLabel position={at} className="gp-marker-anchor">
    <button type="button" className="gp-marker" aria-label={labels[i][0]} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{labels[i][0]}</span>}</button>
  </WorldLabel>;
}

function Rover({run,gap,obstacle,selected,select}:{run:Run;gap:boolean;obstacle:boolean;selected:number;select:(index:number)=>void}){
  const shell=useRef<Group>(null);
  const wheels=useRef<(Group|null)[]>([]);
  const pose=getPose(run.elapsed);
  useFrame((_,dt)=>{
    if(shell.current){
      shell.current.position.x=MathUtils.damp(shell.current.position.x,pose.x,15,dt);
      shell.current.position.z=MathUtils.damp(shell.current.position.z,pose.z,15,dt);
      shell.current.rotation.y=MathUtils.damp(shell.current.rotation.y,MathUtils.degToRad(pose.heading),14,dt);
    }
    if(run.outcome==='running'){
      const speeds=pose.phase===0?[6,6]:pose.phase===1?[-7,-4]:pose.phase===2?[-4,-7]:[-5,-5];
      wheels.current.forEach((wheel,i)=>{if(wheel)wheel.rotation.z-=dt*speeds[i];});
    }
  });
  return <group ref={shell} position={[parkingOrigin.x,.02,parkingOrigin.z]}>
    <Box at={[0,.205,0]} size={[1.30,.089,.74]} color="#253442"/>
    <Box at={[0,.294,0]} size={[1.20,.11,.69]} color="#435e68" metal={.34}/>
    {[-1,1].map((sign,i)=><group key={sign} ref={node=>{wheels.current[i]=node;}} position={[-.27,.222,sign*.44]}>
      <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.217,.217,.126,36]}/><meshStandardMaterial color="#20272e" roughness={.92}/></mesh>
      <mesh position={[0,0,sign*.068]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.140,.140,.032,22]}/><meshStandardMaterial color="#dbae54" metalness={.48}/></mesh>
      {Array.from({length:15},(_,j)=><group key={j} rotation={[0,0,j*Math.PI*2/15]}><Box at={[.213,0,0]} size={[.021,.057,.126]} color="#41484e"/></group>)}
      {[0,1,2,3,4].map(j=><group key={j} rotation={[0,0,j*Math.PI*2/5]}><Box at={[.073,0,sign*.091]} size={[.080,.025,.012]} color="#97682d"/></group>)}
    </group>)}
    <mesh position={[.46,.093,0]}><sphereGeometry args={[.08,16,14]}/><meshStandardMaterial color="#b0b8bd" metalness={.7}/></mesh>
    <group position={[.08,.36,.04]} scale={.67}><Uno at={[0,0,0]}/></group>
    <Box at={[-.38,.427,-.08]} size={[.41,.22,.41]} color="#333843"/>
    {[-.20,-.08,.04].map(z=><Box key={z} at={[-.38,.543,z]} size={[.34,.011,.030]} color="#6b8398"/>)}
    <group onClick={()=>select(3)}>
      <Box at={[.21,.392,-.24]} size={[.26,.062,.23]} color={selected===3?'#e0ae51':'#993e4b'}/>
      <Box at={[.21,.434,-.24]} size={[.098,.037,.10]} color="#202832"/>
      {[-.13,-.04,.04,.13].map(x=><Box key={x} at={[.21+x,.433,-.316]} size={[.028,.014,.06]} color="#d3b278" metal={.62}/>)}
    </group>
    {run.outcome==='running'&&pose.phase===0&&<Line points={[[0,.39,.44],[0,.39,gap?1.53:1.12]]} color={gap?'#68c1e4':'#ecc576'} lineWidth={2} dashed dashSize={.07} gapSize={.05}/>}
    {(run.outcome==='blocked'||run.outcome==='running'&&pose.phase>0)&&<Line points={[[-.72,.39,0],[obstacle?-1.05:-1.43,.39,0]]} color={obstacle?'#e87e62':'#78d8be'} lineWidth={2} dashed dashSize={.07} gapSize={.05}/>}
    <Marker i={3} at={[.22,.59,-.24]} {...{selected,select}}/>
    {([[0,.383,.37],[-.66,.383,0],[.66,.383,0]] as Point[]).map((at,i)=><group key={i} position={at}>
      <group rotation={[0,[0,-Math.PI/2,Math.PI/2][i],0]} scale={.62} onClick={()=>select(i)}><Sonar highlighted={selected===i}/></group>
      <Marker i={i} at={[0,.21,0]} {...{selected,select}}/>
    </group>)}
    {['#d65d59','#4e93bf','#a4bd61'].map((color,i)=><Line key={color} points={[
      [[0,.39,.35],[-.66,.37,.02],[.66,.37,.02]][i] as Point,
      [.30-i*.17,.36,.19], [.18-i*.07,.48,.035],
    ]} color={color} lineWidth={2}/>)}
  </group>;
}

function Course({run,narrow,obstacle,selected,select}:{run:Run;narrow:boolean;obstacle:boolean;selected:number;select:(i:number)=>void}){
  const bayHalf=narrow?.61:1.30;
  return <>
    <color attach="background" args={['#243043']}/>
    <hemisphereLight args={['#dceaff','#695745',2.55]}/>
    <directionalLight position={[-4,7,-5]} intensity={2.30}/>
    <Box at={[0,-.15,.12]} size={[8.45,.28,3.89]} color="#8b7561"/>
    <Box at={[0,.008,-.28]} size={[8.24,.029,2.89]} color="#3c4652"/>
    <Box at={[0,.062,1.33]} size={[8.27,.14,.49]} color="#a6a39b"/>
    <Box at={[0,.04,.94]} size={[8.02,.022,.086]} color="#ebc162"/>
    {Array.from({length:11},(_,i)=><Box key={i} at={[i*.70-3.5,.029,-1.13]} size={[.37,.009,.037]} color="#cdd7df"/>)}
    {[-1,1].map(sign=><group key={sign} position={[sign*(bayHalf+.60),.025,.61]}>
      <ParkingBlock color={sign<0?'#5a738e':'#926d53'}/>
    </group>)}
    <Box at={[3.81,.27,-.49]} size={[.18,.52,.89]} color="#cc9b51"/>
    <Box at={[-3.91,.27,-.51]} size={[.18,.52,.89]} color="#b77f53"/>
    <group onClick={()=>select(4)}>
      {[-1,1].map(sign=><Box key={sign} at={[sign*bayHalf,.029,.50]} size={[.045,.02,.79]} color={selected===4?'#ffd56b':'#e8e8db'}/>)}
      <Box at={[0,.029,.12]} size={[bayHalf*2,.016,.044]} color={selected===4?'#ffd56b':'#e8e8db'}/>
    </group>
    {obstacle&&<Box at={[.50,.23,.10]} size={[.36,.43,.38]} color="#dc815b"/>}
    <Marker i={4} at={[0,.095,.89]} {...{selected,select}}/>
    <Rover {...{run,obstacle,selected,select}} gap={getPose(run.elapsed).x>-bayHalf&&getPose(run.elapsed).x<bayHalf}/>
  </>;
}

export default function SelfParkingDemo(){
  const [run,setRun]=useState<Run>(startRun);
  const [narrow,setNarrow]=useState(false);
  const [obstacle,setObstacle]=useState(false);
  const [selected,select]=useState(0);
  const phase=getPose(run.elapsed).phase;
  useEffect(()=>{
    if(run.outcome!=='running')return;
    const timer=window.setInterval(()=>setRun(previous=>{
      if(previous.outcome!=='running')return previous;
      const time=previous.elapsed+50;
      if(narrow&&time>=curbThreshold)return {elapsed:curbThreshold,outcome:'short'};
      if(obstacle&&time>=stopForRear)return {elapsed:Math.min(time,Math.max(previous.elapsed,stopForRear)),outcome:'blocked'};
      if(time>=duration)return {elapsed:duration,outcome:'parked'};
      return {elapsed:time,outcome:'running'};
    }),50);
    return ()=>window.clearInterval(timer);
  },[run.outcome,narrow,obstacle]);
  const status={
    ready:'Ready to scan',running:parkingPhases[phase].name,parked:'Parked · Driver in standby',
    short:'Gap rejected · Too short',blocked:'Stopped · Rear obstacle',manual:'Stopped · Driver in standby',
  }[run.outcome];
  const scanPosition=getPose(run.elapsed).x;
  const observingGap=phase===0&&Math.abs(scanPosition)<(narrow?.61:1.30);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D automatic parking lane">
        <Canvas camera={{position:[3.6,6.4,-7.7],fov:45}} dpr={[1,1.6]} fallback={<p>Use the timeline and clearance readouts to follow the maneuver.</p>}>
          <Course {...{run,narrow,obstacle,selected,select}}/>
          <OrbitControls target={[0,.22,.04]} minDistance={5.1} maxDistance={17} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Parking readings">
        <div><span>Right sonar</span><strong>{observingGap?'Gap':'Curb edge'}</strong></div>
        <div><span>Rear clearance</span><strong>{obstacle&&phase>=1?'12 cm':'Clear'}</strong></div>
        <div><span>Motor driver</span><strong>{run.outcome==='running'?(phase?'Reverse':'Forward'):'Standby'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Run the parking trial</h3>
      <p>Start with the wide bay. Watch the scan and two reverse arcs, then try a narrow bay or place an obstacle behind the rover.</p>
      <div className="gp-steps" role="group" aria-label="Bay width">
        <button type="button" disabled={run.outcome==='running'} aria-pressed={!narrow} onClick={()=>{setNarrow(false);setRun(startRun);}}>Wide bay</button>
        <button type="button" disabled={run.outcome==='running'} aria-pressed={narrow} onClick={()=>{setNarrow(true);setRun(startRun);}}>Narrow bay</button>
      </div>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={run.outcome==='running'} onClick={()=>setRun({elapsed:0,outcome:'running'})}>Start parking</button>
        <button type="button" disabled={run.outcome!=='running'} onClick={()=>setRun({...run,outcome:'manual'})}>Stop rover</button>
        <button type="button" aria-pressed={obstacle} onClick={()=>setObstacle(value=>!value)}>{obstacle?'Remove rear obstacle':'Place rear obstacle'}</button>
      </div>
      <p role="status" className="gp-demo-description">{status}</p>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
