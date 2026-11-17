import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { lightCycleMs } from '../data/light-interlock';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';
import { SolarMeterSolid as Box } from './SolarMeterParts';

type Point=[number,number,number];
const labels=[
  ['Hinged lid','The lid carries the magnet. Lifting it breaks the contact and interrupts the cycle.'],
  ['Magnetic contact · D2','The contact pulls D2 to ground when the lid closes. An open contact or unplugged lead reads HIGH.'],
  ['Start button · D3','A fresh press requests one cycle. Closing the lid by itself never starts it.'],
  ['Visible LED · D9','The white LED represents the timer output. The glow switches off when the lid opens or the timer ends.'],
  ['Arduino Uno','The Uno reads both inputs and sends the LED output through a 220 Ω resistor.'],
] as const;
const targets:Point[]=[[-.72,1.32,1.12],[1.88,.48,1.13],[-1.85,.72,.50],[1.95,.45,-.74]];

function Bench({closed,lit,connected,selected,select,toggleLid,start}:{closed:boolean;lit:boolean;connected:boolean;selected:number;select:(i:number)=>void;toggleLid:()=>void;start:()=>void}){
  const lid=useRef<Group>(null);
  useFrame((_,dt)=>{if(lid.current)lid.current.rotation.x=MathUtils.damp(lid.current.rotation.x,closed?0:-1.24,11,dt);});
  const card='#bd9060';
  const active='#efbb52';
  return <>
    <color attach="background" args={['#263445']}/>
    <hemisphereLight args={['#e7edff','#654e38',2.1]}/>
    <directionalLight position={[-4,7,4]} intensity={2.6}/>
    <Box at={[0,-.12,0]} size={[6.05,.22,4.1]} color="#4d6372"/>
    <group position={[-.75,.02,0]}>
      <Box at={[0,.08,0]} size={[2.45,.14,2.16]} color={card}/>
      <Box at={[0,.68,-1.05]} size={[2.45,1.1,.09]} color={card}/>
      <Box at={[-1.19,.68,0]} size={[.09,1.10,2.15]} color={card}/>
      <Box at={[1.19,.68,0]} size={[.09,1.10,2.15]} color={card}/>
      <Box at={[0,.27,1.05]} size={[2.45,.26,.09]} color={card}/>
      <Box at={[0,.22,.05]} size={[1.72,.15,1.42]} color={lit?'#eee0b0':'#a9764d'}/>
      <Box at={[.17,.42,.02]} size={[.64,.29,.52]} color={lit?'#80beec':'#357eae'}/>
      {[-.55,.55].map(x=><Box key={x} at={[x,1.23,-1.03]} size={[.45,.1,.16]} color="#8a6045"/>)}
      <group ref={lid} position={[0,1.25,-1.07]} rotation={[-1.24,0,0]} onClick={()=>{select(0);toggleLid();}}>
        <Box at={[0,0,1.07]} size={[2.43,.09,2.15]} color={selected===0?active:card}/>
        <Box at={[.03,-.045,2.03]} size={[.32,.10,.17]} color={selected===1?active:'#eae7db'}/>
        <WorldLabel position={[0,.10,1.12]} className="gp-marker-anchor">
          <button type="button" className="gp-marker" aria-label={labels[0][0]} aria-pressed={selected===0} onClick={()=>select(0)}>1{selected===0&&<span className="gp-demo-marker-name">{labels[0][0]}</span>}</button>
        </WorldLabel>
      </group>
      <group onClick={()=>select(1)}>
        <Box at={[.03,.69,1.02]} size={[.16,.84,.13]} color={card}/>
        <Box at={[.03,1.12,1.05]} size={[.33,.12,.20]} color={selected===1?active:'#dddcd1'}/>
      </group>
      <group onClick={()=>select(3)}>
        <mesh position={[-1.085,.59,.5]}><sphereGeometry args={[.082,20,14]}/><meshStandardMaterial color={selected===3?active:'#fff2cc'} emissive="#fff1bb" emissiveIntensity={lit?3:0}/></mesh>
      </group>
      {lit&&<pointLight position={[-.70,.64,.52]} color="#fff2bb" intensity={6} distance={2.8}/>}
    </group>
    <group position={[1.92,.02,-.72]} scale={1.52} onClick={()=>select(4)}><Uno at={[0,0,0]} highlighted={selected===4}/></group>
    <Box at={[1.85,.11,.85]} size={[1.65,.15,.92]} color="#e5e8e8"/>
    {Array.from({length:10},(_,i)=><Box key={i} at={[1.17+i*.15,.19,.65]} size={[.043,.014,.043]} color="#89949c"/>)}
    <group onClick={()=>{select(2);start();}}>
      <Box at={[1.88,.24,1.03]} size={[.39,.11,.37]} color="#232c34"/>
      <mesh position={[1.88,.35,1.03]}><cylinderGeometry args={[.127,.127,.13,28]}/><meshStandardMaterial color={selected===2?active:'#439e7c'}/></mesh>
    </group>
    <Line points={[[2.22,.27,-.33],[2.55,.16,.26],[2.42,.20,.65]]} color="#e79c3e" lineWidth={3}/>
    <mesh position={[2.19,.20,.65]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.05,.05,.21,18]}/><meshStandardMaterial color="#c8a478"/></mesh>
    <Line points={[[2.42,.20,.65],[1.96,.20,.65]]} color="#b4bac2" lineWidth={2}/>
    <Line points={[[1.96,.20,.65],[-.29,.14,1.35],[-1.75,.59,.5]]} color={lit?'#ffe173':'#e79c3e'} lineWidth={3}/>
    <Line points={[[2.12,.28,-.33],[2.36,.15,.36],[2.04,.23,1.08]]} color="#4583d0" lineWidth={3}/>
    <Line points={[[-.72,1.12,1.16],[.54,.3,1.37],[connected?2.02:1.27,.27,connected?-.33:.15]]} color={selected===1?active:'#63cf96'} lineWidth={3}/>
    <Line points={[[1.2,.24,-.95],[.91,.12,-1.41],[-.19,.12,-1.56]]} color="#abb8c0" lineWidth={5}/>
    <Line points={[[1.82,.27,-.35],[.81,.12,.31],[.94,.12,1.44],[-1.77,.53,.52]]} color="#222b34" lineWidth={3}/>
    {targets.map((position,index)=>{const i=index+1;return <WorldLabel key={i} position={position} className="gp-marker-anchor">
      <button type="button" className="gp-marker" aria-label={labels[i][0]} aria-pressed={i===selected} onClick={()=>select(i)}>{i+1}{i===selected&&<span className="gp-demo-marker-name">{labels[i][0]}</span>}</button>
    </WorldLabel>;})}
  </>;
}

export default function LightInterlockDemo(){
  const [closed,setClosed]=useState(false);
  const [connected,setConnected]=useState(true);
  const [deadline,setDeadline]=useState(0);
  const [remaining,setRemaining]=useState(0);
  const [selected,select]=useState(0);
  const [status,setStatus]=useState('Lid open · Start blocked');
  const lit=closed&&connected&&deadline!==0;
  useEffect(()=>{
    if(!deadline)return;
    const timer=window.setInterval(()=>{
      const rest=Math.max(0,deadline-performance.now());
      setRemaining(rest);
      if(rest===0){setDeadline(0);setStatus('Cycle complete · LED off');}
    },50);
    return ()=>window.clearInterval(timer);
  },[deadline]);
  function stop(message:string){setDeadline(0);setRemaining(0);setStatus(message);}
  function toggleLid(){
    setClosed(!closed);
    if(closed)stop(lit?'Cycle interrupted · Lid opened':'Lid open · Start blocked');
    else setStatus(connected?'Ready · Press Start':'Contact unplugged · Start blocked');
  }
  function toggleContact(){
    setConnected(!connected);
    if(connected)stop(lit?'Cycle interrupted · Contact unplugged':'Contact unplugged · Start blocked');
    else setStatus(closed?'Ready · Press Start':'Lid open · Start blocked');
  }
  function start(){
    if(lit)return;
    if(!closed||!connected){setStatus('Start blocked · Close the lid and connect the contact');return;}
    setRemaining(lightCycleMs);
    setDeadline(performance.now()+lightCycleMs);
    setStatus('Cycle running · LED on');
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D visible-light interlock bench">
        <Canvas camera={{position:[4,5.9,7.2],fov:42}} dpr={[1,1.6]} fallback={<p>Test the interlock using the lid and Start controls.</p>}>
          <Bench {...{closed,connected,lit,selected,select,toggleLid,start}}/>
          <OrbitControls target={[0,.75,0]} minDistance={5} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Interlock readings">
        <div><span>Door input</span><strong>{closed&&connected?'LOW':'HIGH'}</strong></div>
        <div><span>Visible LED</span><strong>{lit?'On':'Off'}</strong></div>
        <div><span>Time left</span><strong>{(remaining/1000).toFixed(1)} s</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Try to interrupt the cycle</h3>
      <p>Close the lid, press Start and open it before the timer ends. Close it again and watch what happens. Try the same test by unplugging the simulated contact wire.</p>
      <div className="gp-steps">
        <button type="button" onClick={toggleLid}>{closed?'Open lid':'Close lid'}</button>
        <button type="button" className="gp-button" onClick={start} disabled={lit}>Start cycle</button>
        <button type="button" onClick={toggleContact}>{connected?'Unplug contact':'Reconnect contact'}</button>
      </div>
      <p role="status" className="gp-demo-description">{status}</p>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
      <p>This classroom model uses visible light and demonstrates control logic.</p>
    </div>
  </div>;
}
