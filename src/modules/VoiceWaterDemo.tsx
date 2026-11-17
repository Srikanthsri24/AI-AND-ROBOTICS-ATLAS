import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls } from '@react-three/drei';
import type { Group } from 'three';
import { waterCommands, waterPulseMs, waterSamples } from '../data/voice-water';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { WorldLabel } from './LabWorkbench';

type Channel='warm'|'cold';
type Point=[number,number,number];
const labels:[string,Point,string][]=[
 ['Warm reservoir',[-1.24,1.42,-.76],'The red reservoir represents the warm selection. Both demonstration reservoirs use room-temperature test water.'],
 ['Cold reservoir',[1.12,1.42,-.76],'The blue reservoir uses a separate tube and pump. Its water stays separate from the red path until it enters the cup.'],
 ['Catch cup',[.12,.66,1.19],'The selected tube empties into this cup. Empty it between trials when needed.'],
 ['Pump drivers',[-1.55,.59,.66],'The Uno drives one MOSFET at a time. It stops the motor on Stop or when the two-second timer ends.'],
];
const colors={warm:'#d96156',cold:'#4f9cdd'};

function Dispenser({active,level,selected,select}:{active:Channel|null;level:number;selected:number;select:(i:number)=>void}){
 const droplets=useRef<Group>(null);
 useFrame(({clock})=>{
  if(droplets.current&&active) droplets.current.children.forEach((drop,index)=>{
   const progress=(clock.elapsedTime*2.8+index/5)%1;
   drop.position.y=1.43-progress*1.12;
  });
 });
 return <>
  <color attach="background" args={['#243b4b']}/><hemisphereLight args={['#e3efff','#836b5d',2.2]}/><directionalLight position={[-3,7,5]} intensity={2.7} color="#fff2df"/>
  <Box at={[0,-.12,0]} size={[5.13,.23,3.62]} color="#647d83"/>
  <Box at={[.02,.08,-.49]} size={[3.47,.18,1.24]} color="#85928e" metal={.46}/>
  <Box at={[.02,1.43,-.51]} size={[3.27,.10,.35]} color="#5a7078" metal={.56}/>
  {[-1.54,1.58].map(x=><Box key={x} at={[x,.78,-.52]} size={[.13,1.23,.17]} color="#6e838d" metal={.55}/>)}
  {(['warm','cold'] as const).map((mode,index)=>{
   const x=index?1.12:-1.20;
   const spout=index ? .34 : -.30;
   return <group key={mode}>
    <group position={[x,0,-.65]} onClick={()=>select(index)}>
     <mesh position={[0,.66,0]}><cylinderGeometry args={[.335,.335,.94,36,1,true]}/><meshPhysicalMaterial color={selected===index?'#ffe0ac':'#daeaf1'} transparent opacity={.40} side={2} metalness={.12} roughness={.25}/></mesh>
     <mesh position={[0,.47,0]}><cylinderGeometry args={[.301,.301,.53,36]}/><meshStandardMaterial color={colors[mode]} roughness={.23} metalness={.21}/></mesh>
     <mesh position={[0,1.15,0]}><cylinderGeometry args={[.344,.344,.087,36]}/><meshStandardMaterial color="#a3b2b7" metalness={.63} roughness={.34}/></mesh>
    </group>
    <group position={[x,.47,.21]} onClick={()=>select(3)}>
     <Box at={[0,-.16,0]} size={[.63,.25,.43]} color={selected===3?'#c8a16b':'#365266'} metal={.37}/>
     <mesh position={[0,.063,.074]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.18,.18,.19,28]}/><meshStandardMaterial color="#b3bfc4" metalness={.69} roughness={.37}/></mesh>
     <mesh position={[0,.063,.17]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.094,.094,.019,24]}/><meshStandardMaterial color={active===mode?colors[mode]:'#425665'} emissive={colors[mode]} emissiveIntensity={active===mode ? .76 : 0}/></mesh>
    </group>
    <Line points={[[x,.14,-.65],[x,.21,-.27],[x,.50,.18],[x*.69,1.12,.16],[spout,1.58,.34],[spout,1.49,.85]]} color={colors[mode]} lineWidth={4}/>
    <Box at={[spout,1.47,.85]} size={[.13,.15,.12]} color="#abbaba" metal={.69}/>
   </group>;
  })}
  <Box at={[0,.045,.90]} size={[1.35,.073,1.01]} color="#4d606b" metal={.42}/>
  <group position={[.02,0,.85]} onClick={()=>select(2)}>
   <mesh position={[0,.31,0]}><cylinderGeometry args={[.47,.35,.46,36,1,true]}/><meshPhysicalMaterial color={selected===2?'#ffdfad':'#c3e2e8'} transparent opacity={.40} roughness={.24} side={2}/></mesh>
   {level>0&&<mesh position={[0,.1+.16*level,0]}><cylinderGeometry args={[.33+.10*level,.33,.32*level,32]}/><meshStandardMaterial color="#78b5ca" roughness={.20} metalness={.12}/></mesh>}
  </group>
  <Box at={[-1.62,.14,.85]} size={[.79,.10,.49]} color={selected===3?'#ceaa70':'#2e7792'} metal={.24}/>
  <Box at={[-1.63,.223,.85]} size={[.20,.07,.134]} color="#253038"/>
  <Line points={[[-1.61,.23,.65],[-1.20,.27,.38],[1.12,.25,.38]]} color="#3d4f58" lineWidth={2.6}/>
  {active&&<group ref={droplets} position={[active==='warm'?-.30:.34,0,.85]}>{Array.from({length:5},(_,i)=><mesh key={i}><sphereGeometry args={[.039,11,8]}/><meshStandardMaterial color={colors[active]} metalness={.31} roughness={.2}/></mesh>)}</group>}
  {labels.map(([name,at],i)=><WorldLabel position={at} key={name} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
  <ContactShadows position={[0,.009,0]} opacity={.39} scale={5.1} far={1.25} resolution={128} frames={1}/>
 </>;
}

export default function VoiceWaterDemo(){
 const [active,setActive]=useState<Channel|null>(null);
 const [level,setLevel]=useState(0);
 const [selected,select]=useState(0);
 const [message,setMessage]=useState('Choose a sample phrase to start.');
 const [byte,setByte]=useState('—');
 const timer=useRef<number|undefined>(undefined);
 const audio=useRef<HTMLAudioElement|null>(null);
 useEffect(()=>()=>{window.clearTimeout(timer.current);const clip=audio.current;audio.current=null;clip?.pause();},[]);
 useEffect(()=>{
  if(!active) return;
  const interval=window.setInterval(()=>setLevel(value=>Math.min(1,value+.019)),80);
  return ()=>window.clearInterval(interval);
 },[active]);
 function stop(){
  const clip=audio.current;audio.current=null;clip?.pause();
  window.clearTimeout(timer.current);timer.current=undefined;setActive(null);setByte('S');setMessage('Stopped · Both pumps off');
 }
 function run(phrase:string){
  const command=waterCommands.find(item=>item.phrase===phrase);
  if(!command){setByte('—');setMessage('Unknown phrase · No command sent');return;}
  if(command.mode==='stop'){stop();return;}
  if(timer.current!==undefined)return;
  setByte(command.byte);setActive(command.mode);setMessage(command.mode==='warm'?'Warm channel selected':'Cold channel selected');
  timer.current=window.setTimeout(()=>{timer.current=undefined;setActive(null);setMessage('Timed cutoff · Both pumps off');},waterPulseMs);
 }
 function sample(phrase:string){
  const old=audio.current;audio.current=null;old?.pause();
  const clip=new Audio(`./audio/voice-water/${phrase.replaceAll(' ','-')}.m4a`);
  audio.current=clip;setMessage('Playing a recorded phrase…');
  const done=()=>{if(audio.current===clip){audio.current=null;run(phrase);}};
  clip.onended=done;clip.onerror=done;void clip.play().catch(done);
 }
 return <div className="gp-split gp-demo">
  <div className="gp-story-stage"><div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D dual-channel water dispenser">
    <Canvas camera={{position:[2.85,3.2,5.8],fov:43}} dpr={[1,1.6]} fallback={<p>Follow the serial and pump readings below.</p>}><Dispenser {...{active,level,selected,select}}/><OrbitControls target={[0,.56,0]} minDistance={3.6} maxDistance={10} enablePan={false}/></Canvas>
  </div><div className="gp-demo-result" aria-label="Dispenser readings"><div><span>Serial byte</span><strong>{byte}</strong></div><div><span>Warm pump</span><strong>{active==='warm'?'On':'Off'}</strong></div><div><span>Cold pump</span><strong>{active==='cold'?'On':'Off'}</strong></div></div></div>
  <div className="gp-guide"><h3>Choose a channel</h3><p>Play a prerecorded phrase to send its transcript. Follow the selected tube and watch the flow stop.</p>
   <div className="gp-steps">{waterSamples.map(text=><button type="button" key={text} disabled={Boolean(active)&&text!=='water stop'&&text!=='hello there'} onClick={()=>sample(text)}>{text}</button>)}</div>
   <div className="gp-steps"><button type="button" onClick={stop}>Stop now</button><button type="button" disabled={Boolean(active)} onClick={()=>setLevel(0)}>Empty cup</button></div>
   <p role="status">{message}</p><p>Each activation lasts up to two seconds. The red and blue channels represent temperature choices using room-temperature test water.</p>
   <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p className="gp-demo-description">{labels[selected][2]}</p>
  </div>
 </div>;
}
