import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { gateMs, parkingCapacity, phases } from '../data/traffic-parking';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Color='Red'|'Amber'|'Green';
const lampColors={Red:'#ff5045',Amber:'#ffbd48',Green:'#52e291'};
const offColors={Red:'#712e30',Amber:'#6a4b2d',Green:'#326349'};
const bays=[.73,1.62,2.51];
const inspection=[
  ['Main signal','D2 through D4 select one lamp. Its green is followed by amber and then red before cross traffic gets green.'],
  ['Cross signal','D5 through D7 select the second signal. Both roads get a brief red interval between directions.'],
  ['Parking barrier','The Uno opens the D9 servo for one approved request. The barrier timer runs independently from the junction.'],
  ['Full indicator','D10 lights when all three spaces have been reserved. Confirming an exit clears the indicator and frees a bay.'],
] as const;

function Block({at,size,color,metal=0}: {at:Point;size:Point;color:string;metal?:number}) {
  return <RoundedBox position={at} args={size} radius={.02} smoothness={2}>
    <meshStandardMaterial color={color} roughness={.63} metalness={metal}/>
  </RoundedBox>;
}

function Lamp({position,color,on}: {position:Point;color:Color;on:boolean}) {
  return <mesh position={position} rotation={[Math.PI/2,0,0]}>
    <cylinderGeometry args={[.064,.064,.046,20]}/>
    <meshStandardMaterial color={on?lampColors[color]:offColors[color]} emissive={lampColors[color]} emissiveIntensity={on?2.12:0}/>
  </mesh>;
}

function Signal({x,z,color,selected}: {x:number;z:number;color:Color;selected:boolean}) {
  return <group position={[x,0,z]}>
    <Block at={[0,.10,0]} size={[.25,.10,.24]} color="#838780"/>
    <Block at={[0,.48,0]} size={[.065,.72,.072]} color={selected?'#b68e4c':'#5d6669'} metal={.56}/>
    <Block at={[0,.98,0]} size={[.214,.49,.164]} color="#282e32"/>
    {(['Red','Amber','Green'] as const).map((name,i)=><group key={name} position={[0,1.13-i*.15,.094]}>
      <Block at={[0,.050,.065]} size={[.171,.031,.119]} color="#303639"/>
      <Lamp position={[0,0,.030]} color={name} on={name===color}/>
    </group>)}
  </group>;
}

function Gate({open,selected}: {open:boolean;selected:boolean}) {
  const arm=useRef<Group>(null);
  useFrame((_,delta)=>{
    if(arm.current) arm.current.rotation.z=MathUtils.damp(arm.current.rotation.z,open?1.40:0,9,delta);
  });
  return <group position={[.56,0,1.05]}>
    <Block at={[0,.11,0]} size={[.28,.12,.30]} color="#8b8b80"/>
    <Block at={[0,.28,0]} size={[.222,.245,.235]} color={selected?'#a48251':'#275575'}/>
    <Block at={[.07,.416,0]} size={[.123,.100,.136]} color="#dddccc"/>
    <group ref={arm} position={[.09,.417,.01]}>
      <Block at={[.42,0,0]} size={[.94,.09,.084]} color="#eae2c9"/>
      {[.08,.30,.52,.74].map(x=><Block key={x} at={[x,.003,0]} size={[.10,.104,.099]} color="#c85146"/>)}
    </group>
  </group>;
}

function Car({index,parked}: {index:number;parked:boolean}) {
  const car=useRef<Group>(null);
  const travel=useRef(0);
  useFrame((_,delta)=>{
    if(!car.current) return;
    travel.current=MathUtils.clamp(travel.current+(parked?1:-1)*delta*.85,0,1);
    const t=travel.current;
    car.current.visible=t>0;
    const blend=(start:number,end:number,amount:number)=>MathUtils.lerp(start,end,MathUtils.clamp(amount,0,1));
    car.current.position.x=blend(parked?1.15:2.79,bays[index],(t-.34)/.32);
    car.current.position.z=blend(1.98,-.96,t<.66?t*.93:.61+(t-.66)*1.15);
  });
  return <group ref={car} visible={false}>
    <Block at={[0,.188,0]} size={[.49,.16,.81]} color={['#ad5850','#628eab','#d3a856'][index]}/>
    <Block at={[0,.303,-.045]} size={[.401,.143,.485]} color="#577779"/>
    <Block at={[0,.386,-.043]} size={[.374,.045,.33]} color={['#bd6d57','#799fba','#d8b366'][index]}/>
    {[-.229,.229].flatMap(x=>[-.245,.245].map(z=><mesh key={`${x}:${z}`} position={[x,.134,z]} rotation={[0,0,Math.PI/2]}>
      <cylinderGeometry args={[.087,.087,.059,18]}/><meshStandardMaterial color="#2a2e32"/>
    </mesh>))}
    {[-.155,.155].map(x=><Block key={x} at={[x,.20,-.408]} size={[.099,.057,.018]} color="#f0e2b1"/>)}
  </group>;
}

function Street({phase,gate,occupied,selected,select}: {phase:number;gate:boolean;occupied:number;selected:number;select:(n:number)=>void}) {
  const signal=phases[phase];
  return <>
    <color attach="background" args={['#283e51']}/>
    <ambientLight intensity={1.34}/><directionalLight position={[3,7,5]} intensity={2.56}/>
    <directionalLight position={[-5,4,-3]} intensity={1.28} color="#bbd1ed"/>
    <Block at={[0,-.143,0]} size={[7.45,.25,5.31]} color="#936e50"/>
    <Block at={[0,.007,0]} size={[7.32,.066,5.18]} color="#697e62"/>
    <Block at={[-1.88,.049,0]} size={[1.36,.061,5.08]} color="#434b52"/>
    <Block at={[-1.80,.05,.18]} size={[3.68,.060,1.31]} color="#434b52"/>
    {[-2.58,-1.18].flatMap(x=>[-1.64,1.72].map(z=><Block key={`${x}:${z}`} at={[x,.085,z]} size={[.061,.055,1.63]} color="#adada4"/>))}
    {[-2.05,-1.52,-1,-.48,1.2,1.69,2.18].map(z=><Block key={z} at={[-1.88,.087,z]} size={[.026,.011,.22]} color="#d2b878"/>)}
    {[-3.30,-2.88,-.92,-.48].map(x=><Block key={x} at={[x,.088,.18]} size={[.22,.012,.027]} color="#d2b878"/>)}
    {[-.57,.91].map(z=><Block key={z} at={[-1.90,.088,z]} size={[1.25,.011,.042]} color="#e2dfd0"/>)}
    {[-2.64,-1.14].map(x=><Block key={x} at={[x,.088,.20]} size={[.044,.011,1.24]} color="#e2dfd0"/>)}
    <Block at={[1.74,.054,-.43]} size={[3.33,.068,2.50]} color="#4e575f"/>
    <Block at={[1.12,.054,1.27]} size={[1.07,.062,1.62]} color="#4e575f"/>
    <Block at={[2.75,.054,1.16]} size={[.90,.062,1.39]} color="#4e575f"/>

    <WorldLabel position={[1.05,.11,2.18]} className="gp-marker-anchor"><span className="gp-rocket-field-label">Entry</span></WorldLabel>
    <WorldLabel position={[2.77,.11,2.03]} className="gp-marker-anchor"><span className="gp-rocket-field-label">Exit</span></WorldLabel>
    <Block at={[1.63,.091,-1.51]} size={[2.76,.023,.054]} color="#c3c7b9"/>
    {[.28,1.17,2.07,2.95].map(x=><Block key={x} at={[x,.092,-.957]} size={[.040,.013,1.13]} color="#d2d1bc"/>)}
    {bays.map((x,index)=><group key={x}>
      <Block at={[x,.115,-1.40]} size={[.37,.050,.07]} color="#9c9f99"/>
      <WorldLabel position={[x,.11,-.19]} className="gp-marker-anchor"><span className="gp-rocket-field-label">{index+1}</span></WorldLabel>
      <Car index={index} parked={occupied>index}/>
    </group>)}
    <Signal x={-2.76} z={1.11} color={signal.main} selected={selected===0}/>
    <Signal x={-.91} z={-.65} color={signal.cross} selected={selected===1}/>
    <Gate open={gate} selected={selected===2}/>
    <Block at={[1.82,.38,.94]} size={[.229,.53,.21]} color={selected===3?'#a17d4d':'#536167'}/>
    <Block at={[1.82,.665,.94]} size={[.24,.19,.13]} color="#252c32"/>
    <Lamp position={[1.82,.665,1.03]} color="Red" on={occupied===parkingCapacity}/>
    <Block at={[-.86,.138,1.85]} size={[.83,.088,.58]} color="#238195"/>
    <Block at={[-1.16,.211,1.85]} size={[.186,.105,.218]} color="#aeb8bb" metal={.63}/>
    <Block at={[-.75,.216,1.90]} size={[.25,.043,.158]} color="#292f39"/>
    <Line points={[[-1.01,.243,1.82],[-1.67,.27,1.68],[-2.72,.19,1.08]]} color="#d0a76c" lineWidth={1.8}/>
    <Line points={[[-.56,.206,1.64],[-.43,.22,.55],[-.91,.33,-.60]]} color="#88aab8" lineWidth={1.7}/>
    <Line points={[[-.55,.211,1.98],[.20,.23,1.97],[.53,.29,1.08]]} color="#dd8c70" lineWidth={1.7}/>
    {([{at:[-2.76,1.05,1.17],tag:[-2.89,1.50,1.25]},
      {at:[-.91,1.02,-.54],tag:[-.93,1.46,-.65]},
      {at:[.63,.41,1.08],tag:[.36,1.02,1.40]},
      {at:[1.82,.67,1.03],tag:[2.18,.98,1.83]}] satisfies {at:Point;tag:Point}[]).map(({at,tag},index)=><group key={index}>
      <Line points={[at,tag]} color={selected===index?'#ffe597':'#c7d5d7'} lineWidth={1.4}/>
      <WorldLabel position={tag} className="gp-marker-anchor">
        <button type="button" className="gp-marker" aria-label={inspection[index][0]} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button>
      </WorldLabel>
    </group>)}
    <ContactShadows position={[0,.036,0]} opacity={.37} blur={2.35} scale={9} far={4}/>
  </>;
}

export default function TrafficParkingDemo() {
  const [phase,setPhase]=useState(0);
  const [running,setRunning]=useState(false);
  const [lot,setLot]=useState({occupied:0,open:false,note:'The lot is empty. Request entry for one car.'});
  const [selected,setSelected]=useState(0);
  const next=()=>setPhase(value=>(value+1)%phases.length);
  useEffect(()=>{
    if(!running) return;
    const timer=window.setTimeout(next,phases[phase].ms);
    return ()=>window.clearTimeout(timer);
  },[running,phase]);
  useEffect(()=>{
    if(!lot.open) return;
    const timer=window.setTimeout(()=>setLot(value=>({...value,open:false,note:'The entrance barrier has closed.'})),gateMs);
    return ()=>window.clearTimeout(timer);
  },[lot.open]);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive 3D intersection and parking lot">
        <Canvas dpr={[1,1.5]} camera={{position:[3.6,6.6,9.3],fov:43}} fallback={<p>The traffic and parking controls are available without WebGL.</p>}>
          <Street phase={phase} gate={lot.open} occupied={lot.occupied} selected={selected} select={setSelected}/>
          <OrbitControls target={[0,.22,0]} minDistance={5} maxDistance={16} enablePan={false} maxPolarAngle={Math.PI/2.05}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Traffic and parking readings">
        <div><span>Main street</span><strong>{phases[phase].main}</strong></div>
        <div><span>Cross street</span><strong>{phases[phase].cross}</strong></div>
        <div><span>Free spaces</span><strong>{parkingCapacity-lot.occupied} of {parkingCapacity}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Run the junction and fill the lot</h3>
      <p>Run or step through the six traffic phases. Admit three cars, try a fourth, then free a bay with an exit.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>setRunning(value=>!value)}>{running?'Pause signals':'Run signals'}</button>
        <button type="button" onClick={()=>{setRunning(false);next();}}>Next traffic phase</button>
      </div>
      <div className="gp-steps" aria-label="Parking controls">
        <button type="button" disabled={lot.open} onClick={()=>setLot(value=>value.occupied===parkingCapacity
          ? {...value,note:'Entry denied. All three bays are occupied.'}
          : {occupied:value.occupied+1,open:true,note:'Entry approved. The barrier is open for one car.'})}>Request entry</button>
        <button type="button" disabled={lot.open||lot.occupied===0} onClick={()=>setLot(value=>({
          ...value,occupied:value.occupied-1,note:'Exit confirmed. One bay is free again.',
        }))}>Confirm exit</button>
      </div>
      <p className="gp-demo-description" role="status">{lot.note}</p>
      <h4>Inspect the model</h4>
      <ol className="gp-demo-labels">{inspection.map(([name],index)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{inspection[selected][1]}</p>
    </div>
  </div>;
}
