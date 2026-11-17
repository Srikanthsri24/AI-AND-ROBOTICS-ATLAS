import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls } from '@react-three/drei';
import { GearWheel } from './GearWheel';
import { WorldLabel } from './LabWorkbench';
import { SolarMeterSolid as Box } from './SolarMeterParts';

type Point = [number,number,number];
const centers:Point[]=[[-1.10,1.58,.29],[.58,1.58,.29]];
const details:{name:string;at:Point;info:string}[]=[
  {name:'Hand crank',at:[-1.36,1.08,.99],info:'Turning the handle rotates the input shaft and the brass 12-tooth pinion together.'},
  {name:'12-tooth pinion',at:[-1.23,2.15,.62],info:'One input revolution moves twelve teeth past the mesh. This is one-third of the driven gear’s 36 teeth.'},
  {name:'36-tooth driven gear',at:[1.30,2.72,.56],info:'This gear turns in the opposite direction. Its witness mark returns home after three full input turns.'},
  {name:'Shaft and bearing supports',at:[1.72,.43,-.37],info:'The support and bearings keep the shafts parallel. The gears need aligned faces and a small amount of backlash to turn freely.'},
];

function GearBench({turns,selected,select}:{turns:number;selected:number;select:(i:number)=>void}) {
  const input=-2*Math.PI*turns;
  const output=2*Math.PI*turns/3+Math.PI/36;
  return <>
    <color attach="background" args={['#293b4b']}/>
    <hemisphereLight args={['#eff7ff','#71614e',2.1]}/>
    <directionalLight position={[-3.5,5,4]} intensity={2.2} color="#fff0dc"/>
    <group onClick={()=>select(3)}>
      <Box at={[0,.07,-.03]} size={[4.58,.18,2.24]} color="#598481" metal={.43}/>
      {[-1.95,1.95].flatMap(x=>[-.83,.73].map(z=><mesh key={x+':'+z} position={[x,.18,z]}><cylinderGeometry args={[.051,.051,.034,6]}/><meshStandardMaterial color="#c5cbd0" metalness={.75}/></mesh>))}
      <Box at={[.03,1.21,-.46]} size={[3.79,2.21,.14]} color={selected===3?'#ac7e54':'#546574'} metal={.43}/>
      {[-1.51,1.58].map(x=><group key={x}>
        <Box at={[x,.23,-.42]} size={[.42,.17,.77]} color="#3c4a52" metal={.56}/>
        <Box at={[x,.46,-.57]} size={[.29,.55,.24]} color="#50616a" metal={.61}/>
      </group>)}
      {centers.map(([x,y],i)=><group key={i}>
        <Box at={[x,y,-.34]} size={[.43,.44,.13]} color="#7a8890" metal={.63}/>
        <mesh position={[x,y,-.235]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.139,.139,.09,26]}/><meshStandardMaterial color="#b9c2c8" metalness={.69}/></mesh>
        <mesh position={[x,y,.06]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.066,.066,.76,20]}/><meshStandardMaterial color="#a9b2bb" metalness={.71}/></mesh>
      </group>)}
    </group>
    <group position={centers[1]} rotation={[0,0,output]} onClick={()=>select(2)}>
      <GearWheel teeth={36} pitch={1.26} metal={false} highlight={selected===2}/>
    </group>
    <group position={centers[0]} rotation={[0,0,input]}>
      <group onClick={()=>select(1)}><GearWheel teeth={12} pitch={.42} metal highlight={selected===1}/></group>
      <group onClick={()=>select(0)}>
        <Box at={[0,-.32,.38]} size={[.126,.67,.089]} color={selected===0?'#e5ac6d':'#9faab2'} metal={.67}/>
        <mesh position={[0,-.62,.54]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.078,.089,.31,24]}/><meshStandardMaterial color="#343e49" roughness={.61}/></mesh>
      </group>
    </group>
    <Box at={[-1.1,2.13,-.35]} size={[.082,.046,.26]} color="#eeab4e"/>
    <Box at={[.58,2.57,-.39]} size={[.056,.62,.08]} color="#627d89" metal={.44}/>
    <Box at={[.58,2.95,-.32]} size={[.082,.051,.27]} color="#62a8d0"/>
    <Line points={[[-1.1,.29,.62],[.58,.29,.62]]} color="#b8c7cf" dashed dashSize={.05} gapSize={.035} lineWidth={1}/>
    {details.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.012,0]} opacity={.36} far={1.4} scale={5.1} resolution={128} frames={1}/>
  </>;
}

const maxTurns=6;
function shown(turns:number) { return turns.toFixed(2); }

export default function GearReducerDemo() {
  const [turns,setTurns]=useState(0);
  const [target,setTarget]=useState<number|null>(null);
  const [selected,select]=useState(0);
  useEffect(()=>{
    if(target===null)return;
    let frame=0;
    let previous=performance.now();
    let current=0;
    const animate=(now:number)=>{
      const delta=Math.min(now-previous,50)*.00072;
      previous=now;
      current=Math.min(target,current+delta);
      setTurns(current);
      if(current<target)frame=requestAnimationFrame(animate);
      else setTarget(null);
    };
    frame=requestAnimationFrame(animate);
    return ()=>cancelAnimationFrame(frame);
  },[target]);
  function move(next:number) { setTarget(null);setTurns(Math.min(maxTurns,Math.max(0,next))); }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D hand-cranked gear reducer">
        <Canvas camera={{position:[2.7,3.15,6.85],fov:40}} dpr={[1,1.6]} fallback={<p>Compare the measured input and output turns below.</p>}>
          <GearBench {...{turns,selected,select}}/>
          <OrbitControls target={[0,1.29,0]} enablePan={false} minDistance={3.7} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Measured gear turns">
        <div><span>Input clockwise</span><strong>{shown(turns)}</strong></div>
        <div><span>Output counterclockwise</span><strong>{shown(turns/3)}</strong></div>
        <div><span>Reduction ratio</span><strong>3:1</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Measure the reduction</h3>
      <p>Watch the orange input mark and blue output mark. Predict where the output mark lands after just one turn of the crank.</p>
      <label className="gp-home-light">Crank turns <output>{shown(turns)}</output><input type="range" min={0} max={maxTurns} step={.25} value={turns} disabled={target!==null} onChange={event=>move(event.target.valueAsNumber)}/></label>
      <div className="gp-steps">
        <button className="gp-button" type="button" onClick={()=>{setTurns(0);setTarget(3);}} disabled={target!==null}>Run three turns</button>
        <button type="button" onClick={()=>move(turns+1)} disabled={target!==null||turns>=maxTurns}>Add one turn</button>
        <button type="button" onClick={()=>move(0)}>Reset marks</button>
      </div>
      <p role="status">{target!==null?'Running the three-turn trial.':turns===3?'Trial complete · Three input turns produced one output turn.':'Ready to compare the two marks.'}</p>
      <ol className="gp-demo-labels">{details.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{details[selected].info}</p>
    </div>
  </div>;
}
