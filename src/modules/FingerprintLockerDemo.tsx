import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { lockerReleaseMs } from '../data/fingerprint-locker';
import { FingerprintReader } from './FingerprintReader';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';
import { SolarMeterSolid as Box } from './SolarMeterParts';

type Point=[number,number,number];
type LockerState='locked'|'released'|'open';
const parts=[
  ['Optical reader','The sensor compares the scan with its local templates and returns the stored ID to D2.'],
  ['Servo latch · D9','The servo rotates the tab clear of the keeper after ID 1 is recognized. It moves back when the door closes or release expires.'],
  ['Door contact · D4','The frame contact and door magnet report closure. The latch remains clear while the door is open.'],
  ['Arduino Uno','The Uno reads the ID and door position, then controls the latch.'],
  ['5 V distribution','The external supply powers the reader and servo. Its ground is shared with the USB-powered Uno.'],
] as const;
const anchors:Point[]=[[1.53,.49,1.54],[.63,1.17,.64],[.56,1.76,.75],[1.55,.45,-.80],[2.12,.29,.40]];

function Locker({state,selected,select,scan,indicator,toggleDoor}:{state:LockerState;selected:number;select:(value:number)=>void;scan:()=>void;indicator:boolean;toggleDoor:()=>void}){
  const door=useRef<Group>(null);
  const tab=useRef<Group>(null);
  useFrame((_,dt)=>{
    if(door.current)door.current.rotation.y=MathUtils.damp(door.current.rotation.y,state==='open'?-1.20:0,11,dt);
    if(tab.current)tab.current.rotation.z=MathUtils.damp(tab.current.rotation.z,state==='locked'?0:-1.13,12,dt);
  });
  const cardboard='#b78a62';
  const trim='#865e48';
  const highlight='#edc771';
  return <>
    <color attach="background" args={['#222a3d']}/>
    <hemisphereLight args={['#e5eeff','#685238',2.25]}/>
    <directionalLight position={[-5,7,4]} intensity={2.6}/>
    <Box at={[0,-.12,0]} size={[5.7,.22,3.9]} color="#424e62"/>
    <group position={[-.70,.02,-.10]}>
      <Box at={[0,.08,0]} size={[2.42,.13,1.72]} color={cardboard}/>
      <Box at={[0,2.03,0]} size={[2.42,.13,1.72]} color={cardboard}/>
      <Box at={[0,1.05,-.83]} size={[2.42,1.94,.09]} color={trim}/>
      {[-1.17,1.17].map(x=><Box key={x} at={[x,1.05,0]} size={[.09,1.94,1.72]} color={cardboard}/>)}
      <Box at={[0,.72,-.07]} size={[2.23,.072,1.53]} color="#9a6c50"/>
      <Box at={[.30,.83,-.17]} size={[.68,.17,.40]} color="#649bb7"/>
      <Box at={[.97,1.11,.800]} size={[.34,.30,.18]} color={trim}/>
      <group ref={door} position={[-1.15,.10,.86]} onClick={toggleDoor}>
        <Box at={[1.13,.95,.015]} size={[2.29,1.89,.07]} color={cardboard}/>
        <Box at={[1.13,.95,.055]} size={[2.12,1.70,.025]} color="#c29367"/>
        {[.28,1.49].map(y=><Box key={y} at={[.095,y,.073]} size={[.27,.14,.045]} color={trim}/>)}
        <Box at={[1.80,.99,.13]} size={[.37,.10,.13]} color="#262f39"/>
        <Box at={[2.19,1.65,.034]} size={[.17,.19,.11]} color={selected===2?highlight:'#f2ead2'}/>
      </group>
      <group position={[1.25,1.07,.86]} onClick={()=>select(1)}>
        <Box at={[.035,0,0]} size={[.34,.37,.29]} color={selected===1?highlight:'#176d9d'}/>
        <mesh rotation={[Math.PI/2,0,0]} position={[-.16,0,.085]}><cylinderGeometry args={[.077,.077,.06,22]}/><meshStandardMaterial color="#e5e7df"/></mesh>
        <group ref={tab} position={[-.195,0,.08]}><Box at={[-.12,0,.065]} size={[.39,.115,.13]} color={selected===1?highlight:'#ded7b5'}/></group>
      </group>
      <group onClick={()=>select(2)}><Box at={[1.25,1.71,.82]} size={[.25,.19,.12]} color={selected===2?highlight:'#e7e5db'}/></group>
    </group>
    <group position={[1.51,.22,1.38]} onClick={()=>{select(0);scan();}}><FingerprintReader active={indicator} selected={selected===0}/></group>
    <group position={[1.56,.04,-.74]} scale={1.65} onClick={()=>select(3)}><Uno at={[0,0,0]} highlighted={selected===3}/></group>
    <group onClick={()=>select(4)}>
      <Box at={[2.16,.10,.36]} size={[.50,.19,.42]} color={selected===4?highlight:'#365a60'}/>
      {[-.12,.12].map(x=><Box key={x} at={[2.16+x,.206,.36]} size={[.12,.025,.10]} color="#b1b9bb" metal={.58}/>)}
    </group>
    {['#5ab38f','#6eaddf'].map((color,i)=><Line key={color} points={[[1.47+.09*i,.22,.84],[1.72+.09*i,.10,.69],[1.75+.08*i,.14,.09],[1.68-.115*i,.32,-.329]]} color={color} lineWidth={2.7}/>)}
    <Line points={[[1.60,.23,.84],[1.86,.123,.77],[2.04,.21,.36],[2.54,.13,.50],[2.91,.17,.68]]} color="#d66a57" lineWidth={3}/>
    <Line points={[[1.38,.23,.84],[1.66,.12,.78],[2.28,.21,.36],[2.60,.13,.45],[2.91,.17,.65]]} color="#141c28" lineWidth={3}/>
    <Line points={[[2.28,.21,.36],[2.31,.16,.06],[1.84,.32,-.329]]} color="#161f2a" lineWidth={3}/>
    <Line points={[[.72,.98,.66],[.80,.18,.37],[1.29,.16,.28],[2.04,.21,.36]]} color="#d66a57" lineWidth={2.8}/>
    <Line points={[[.66,.96,.66],[.74,.16,.39],[1.23,.14,.34],[2.28,.21,.36]]} color="#171e27" lineWidth={2.8}/>
    <Line points={[[.71,1.71,.73],[.87,1.48,.60],[.90,.15,.34],[1.31,.31,-.329]]} color="#59af6b" lineWidth={3}/>
    <Line points={[[.71,1.06,.66],[.82,.82,.44],[.82,.12,.12],[1.90,.31,-.329]]} color="#d19b52" lineWidth={3}/>
    {anchors.map((position,i)=><WorldLabel key={i} position={position} className="gp-marker-anchor">
      <button type="button" className="gp-marker" aria-label={parts[i][0]} onClick={()=>select(i)} aria-pressed={selected===i}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{parts[i][0]}</span>}</button>
    </WorldLabel>)}
  </>;
}

export default function FingerprintLockerDemo(){
  const [state,setState]=useState<LockerState>('locked');
  const [selected,select]=useState(0);
  const [message,setMessage]=useState('Locker secured · Present a sample');
  const [indicator,setIndicator]=useState(0);
  const [enrolled,setEnrolled]=useState(true);

  useEffect(()=>{
    if(state!=='released')return;
    const timer=window.setTimeout(()=>{setState('locked');setMessage('Release window ended · Latch secured');},lockerReleaseMs);
    return ()=>window.clearTimeout(timer);
  },[state]);
  useEffect(()=>{
    if(!indicator)return;
    const timer=window.setTimeout(()=>setIndicator(0),400);
    return ()=>window.clearTimeout(timer);
  },[indicator]);
  function scan(match:boolean){
    if(state!=='locked')return;
    setIndicator(value=>value+1);
    if(!match){setMessage('Access denied · Latch secured');return;}
    setState('released');setMessage('ID 1 accepted · Open within 5 seconds');
  }
  function toggleDoor(){
    if(state==='locked'){setMessage('Door held by the latch · Scan ID 1 first');return;}
    if(state==='released'){setState('open');setMessage('Door open · Latch stays clear');return;}
    setState('locked');setMessage('Door closed · Latch secured');
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D fingerprint locker">
        <Canvas camera={{position:[3.8,4.5,6.3],fov:42}} dpr={[1,1.6]} fallback={<p>Use the sample and door controls to test the locker.</p>}>
          <Locker {...{state,selected,select,toggleDoor}} indicator={indicator>0} scan={()=>scan(enrolled)}/>
          <OrbitControls target={[0,.85,0]} minDistance={4.5} maxDistance={14} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Locker readings">
        <div><span>Door</span><strong>{state==='open'?'Open':'Closed'}</strong></div>
        <div><span>Latch</span><strong>{state==='locked'?'Secured':'Retracted'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Try both samples</h3>
      <p>Choose a simulated fingerprint and scan it. After ID 1 is accepted, open the door before the five-second release window ends.</p>
      <div className="gp-steps" role="group" aria-label="Simulated fingerprint sample">
        <button type="button" aria-pressed={enrolled} onClick={()=>setEnrolled(true)}>Enrolled ID 1</button>
        <button type="button" aria-pressed={!enrolled} onClick={()=>setEnrolled(false)}>Unrecognized</button>
      </div>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>scan(enrolled)} disabled={state!=='locked'}>Scan sample</button>
        <button type="button" onClick={toggleDoor}>{state==='open'?'Close door':'Open door'}</button>
      </div>
      <p role="status" className="gp-demo-description">{message}</p>
      <ol className="gp-demo-labels">{parts.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{parts[selected][1]}</p>
      <p>The browser uses simulated samples and never asks for a fingerprint.</p>
    </div>
  </div>;
}
