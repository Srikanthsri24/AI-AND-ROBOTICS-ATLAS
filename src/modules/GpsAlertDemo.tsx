import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { gpsFreshMs, gpsHoldMs } from '../data/gps-alert';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
const markers=[
 ['GPS antenna','The ceramic patch faces the sky. The breakout’s UART sends one position sentence per second.'],
 ['Alert button','A press shorter than 650 ms is ignored. A completed hold starts the local test alert even without a fix.'],
 ['Alert LED','The LED stays lit while the test is active. The receiving operator can acknowledge and stop sharing.'],
 ['USB test receiver','The prototype sends fresh position data here over USB. The classroom scene uses invented positions.'],
] as const;

function Box({at,size,color,metal=0}: {at:Point;size:Point;color:string;metal?:number}){
 return <RoundedBox position={at} args={size} radius={.022} smoothness={2}><meshStandardMaterial color={color} metalness={metal} roughness={.57}/></RoundedBox>;
}
export function GpsBreakout({selected=false}: {selected?:boolean}){
 return <>
  <Box at={[0,.022,0]} size={[.83,.047,1.07]} color={selected?'#926e42':'#263e60'}/>
  <Box at={[0,.122,-.19]} size={[.55,.154,.54]} color="#ded7bc"/>
  <Box at={[0,.206,-.19]} size={[.50,.013,.48]} color="#aaa99a" metal={.42}/>
  <Box at={[.085,.066,.22]} size={[.25,.039,.17]} color="#30333d"/>
  {Array.from({length:7},(_,i)=><mesh key={i} position={[-.318+i*.106,.052,.435]} rotation={[-Math.PI/2,0,0]}>
   <ringGeometry args={[.024,.037,15]}/><meshStandardMaterial color="#c9a76c" metalness={.66}/>
  </mesh>)}
 </>;
}

function Bench({active,signal,holding,selected,select}:{active:boolean;signal:boolean;holding:boolean;selected:number;select:(n:number)=>void}){
 const anchors=[
  {at:[-1.87,.58,-.31],tag:[-2.08,1.21,-.40]},
  {at:[-1.24,.39,.80],tag:[-1.29,.85,1.13]},
  {at:[-.84,.38,.80],tag:[-.65,.89,.70]},
  {at:[1.36,1.19,-.36],tag:[1.91,1.75,-.20]},
 ] satisfies {at:Point;tag:Point}[];
 return <>
  <color attach="background" args={['#263e52']}/><ambientLight intensity={1.35}/>
  <directionalLight position={[4,7,5]} intensity={2.54}/><directionalLight position={[-5,4,-3]} color="#b7cde5" intensity={1.3}/>
  <Box at={[0,-.13,0]} size={[6.4,.23,3.75]} color="#917052"/>
  <Box at={[0,.014,0]} size={[6.27,.069,3.61]} color="#617d76"/>
  <Box at={[-1.37,.172,.20]} size={[2.41,.22,2.06]} color="#a6b7bd" metal={.41}/>
  <Box at={[-1.85,.339,-.32]} size={[1.05,.118,1.30]} color="#667d89"/>
  <group position={[-1.86,.417,-.32]}><GpsBreakout selected={selected===0}/></group>
  <Box at={[-.88,.350,-.29]} size={[.64,.093,.89]} color="#247e98"/>
  <Box at={[-.85,.42,-.62]} size={[.23,.078,.19]} color="#aeb8bc" metal={.59}/>
  <Box at={[-.87,.426,-.33]} size={[.25,.05,.15]} color="#2a3339"/>
  <Box at={[-1.09,.333,.68]} size={[1.03,.133,.52]} color="#dddcd1"/>
  <Box at={[-1.30,.419,.75]} size={[.24,.064,.24]} color="#39404a"/>
  <mesh position={[-1.30,holding ? .443 : .485,.75]}><cylinderGeometry args={[.091,.096,.081,20]}/>
   <meshStandardMaterial color={selected===1?'#e1ae69':'#bd5950'}/>
  </mesh>
  <mesh position={[-.85,.456,.77]}><cylinderGeometry args={[.065,.065,.141,20]}/>
   <meshStandardMaterial color={active?'#ff493e':'#783b42'} emissive="#ff4331" emissiveIntensity={active?2.25:0}/>
  </mesh>
  <Line points={[[-1.56,.46,.08],[-1.35,.54,.16],[-1.16,.483,.05],[-.91,.43,-.09]]} color="#d9ae65" lineWidth={1.85}/>
  <Line points={[[-.74,.41,-.62],[-.42,.22,-1.08],[.73,.25,-1.04],[1.02,.25,-.60]]} color={active?'#eab879':'#93a2a6'} lineWidth={2.1}/>
  <Box at={[1.46,.142,.12]} size={[2.35,.15,1.52]} color="#818d94" metal={.55}/>
  <Box at={[1.46,.223,.15]} size={[1.94,.027,.84]} color="#394650"/>
  {Array.from({length:5},(_,row)=>Array.from({length:13},(_,i)=><Box key={`${row}:${i}`} at={[.63+i*.134,.246,-.19+row*.115]} size={[.105,.028,.086]} color="#455865"/>))}
  <Box at={[1.48,.222,.62]} size={[.61,.022,.19]} color="#929ea2"/>
  <Box at={[1.45,.939,-.60]} size={[2.29,1.48,.11]} color="#606d75" metal={.48}/>
  <Box at={[1.45,.958,-.532]} size={[2.08,1.28,.028]} color="#1e333b"/>
  <Box at={[1.45,1.24,-.511]} size={[1.60,.115,.018]} color={active?'#b87552':'#536b70'}/>
  {[-.016,.126,.271].map(y=><Box key={y} at={[1.42,.77+y,-.508]} size={[.95,.057,.021]} color={active&&signal?'#8cbea9':'#71888b'}/>)}
  {signal&&[0,.11,.22].map(radius=><mesh key={radius} position={[-1.85,.76+radius,-.32]} rotation={[-Math.PI/2,0,0]}>
   <ringGeometry args={[.21+radius,.225+radius,32]}/><meshBasicMaterial color="#8bd8d6" transparent opacity={.52}/>
  </mesh>)}
  {anchors.map(({at,tag},index)=><group key={index}>
   <Line points={[at,tag]} color={selected===index?'#ffe09a':'#beccd3'} lineWidth={1.35}/>
   <WorldLabel position={tag} className="gp-marker-anchor">
    <button className="gp-marker" type="button" aria-label={markers[index][0]} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button>
   </WorldLabel>
  </group>)}
  <ContactShadows position={[0,.040,0]} scale={8} opacity={.42} blur={2.35} far={4}/>
 </>;
}

const route=['N 14 m · E 8 m','N 19 m · E 8 m','N 23 m · E 11 m','N 27 m · E 13 m'];
export default function GpsAlertDemo(){
 const [signal,setSignal]=useState(true),[lastFix,setLastFix]=useState(()=>performance.now());
 const [now,setNow]=useState(lastFix),[holding,setHolding]=useState(false);
 const [active,setActive]=useState(false),[selected,setSelected]=useState(0),[waypoint,setWaypoint]=useState(0);
 const [notice,setNotice]=useState('Receiver idle');
 const fresh=now-lastFix<=gpsFreshMs;
 useEffect(()=>{
  const timer=window.setInterval(()=>{
   const timestamp=performance.now();
   setNow(timestamp);
   if(signal)setLastFix(timestamp);
  },200);
  return ()=>window.clearInterval(timer);
 },[signal]);
 useEffect(()=>{
  if(!holding)return;
  const timer=window.setTimeout(()=>{setHolding(false);setActive(true);setNotice('Test alert received over USB');},gpsHoldMs);
  return ()=>window.clearTimeout(timer);
 },[holding]);
 const position=active?(fresh?route[waypoint]:'No fresh GPS fix'):'Location sharing off';
 return <div className="gp-split gp-demo">
  <div className="gp-story-stage">
   <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive 3D GPS alert bench">
    <Canvas dpr={[1,1.5]} camera={{position:[3.2,3.8,7.5],fov:42}} fallback={<p>The receiver controls are available without WebGL.</p>}>
     <Bench active={active} signal={signal} holding={holding} selected={selected} select={setSelected}/>
     <OrbitControls target={[0,.55,0]} minDistance={4} maxDistance={14} enablePan={false}/>
    </Canvas>
   </div>
   <div className="gp-demo-result" aria-label="GPS alert readings">
    <div><span>GPS fix</span><strong>{fresh?'Fresh':'Stale'}</strong></div>
    <div><span>Test alert</span><strong>{active?'Active':'Idle'}</strong></div>
    <div><span>Receiver location</span><strong>{position}</strong></div>
   </div>
  </div>
  <div className="gp-guide">
   <h3>Send a test alert</h3>
   <p>Compare a short tap with a completed hold. Move along the fictional route, then interrupt satellite reception and wait for the fix to expire.</p>
   <div className="gp-steps">
    <button type="button" disabled={holding||active} onClick={()=>setNotice('Short tap ignored')}>Tap alert button</button>
    <button type="button" className="gp-button" disabled={holding||active} onClick={()=>setHolding(true)}>{holding?'Holding test button':'Hold alert button'}</button>
    <button type="button" disabled={!active} onClick={()=>{setActive(false);setNotice('Receiver acknowledged. Location sharing stopped.');}}>Acknowledge alert</button>
   </div>
   <div className="gp-steps">
    <button type="button" aria-pressed={!signal} onClick={()=>setSignal(value=>!value)}>{signal?'Interrupt GPS reception':'Restore GPS reception'}</button>
    <button type="button" disabled={!signal} onClick={()=>setWaypoint(value=>(value+1)%route.length)}>Move to next waypoint</button>
   </div>
   <p className="gp-demo-description" role="status">{notice}</p>
   <h4>Inspect the prototype</h4>
   <ol className="gp-demo-labels">{markers.map(([name],index)=><li key={name}>
    <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
   </li>)}</ol>
   <p className="gp-demo-description">{markers[selected][1]}</p>
  </div>
 </div>;
}
