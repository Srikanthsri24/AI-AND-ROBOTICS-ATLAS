import { useEffect,useRef,useState } from 'react';
import { Canvas,useFrame } from '@react-three/fiber';
import { ContactShadows,Line,OrbitControls } from '@react-three/drei';
import type { Group } from 'three';
import { starterPulse,starterWindow } from '../data/fingerprint-starter';
import { FingerprintReader } from './FingerprintReader';
import { Drv8833Part } from './TrolleyParts';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
const parts=[
  ['Fingerprint reader','The reader compares a scan to the template stored in slot 1. Its UART reports a match to the Mega.'],
  ['Start button','A new press is required within five seconds of the match. Starting uses up that authorization.'],
  ['Motor driver','The Mega enables the DRV8833 only for the start pulse. Releasing Start ends the physical pulse early.'],
  ['Raised starter wheel','The motor turns for at most 650 ms. The stand holds the vehicle clear of the bench.'],
] as const;
const anchors:Point[]=[[-1.75,.80,.52],[-.64,.57,1.14],[.28,.63,-.55],[1.71,.88,.86]];
function Bench({armed,denied,spinning,selected,select}:{armed:boolean;denied:boolean;spinning:boolean;selected:number;select:(i:number)=>void}){
 const wheel=useRef<Group>(null);
 useFrame((_,dt)=>{if(spinning&&wheel.current)wheel.current.rotation.x+=dt*23;});
 return <>
   <color attach="background" args={['#243a4d']}/>
   <hemisphereLight args={['#e4f1ff','#715b4d',2.25]}/>
   <directionalLight position={[-4,7,5]} intensity={2.7}/>
   <Box at={[0,-.14,0]} size={[6.2,.25,3.8]} color="#5f717b"/>
   <Box at={[-1.53,.080,.65]} size={[1.90,.145,.91]} color="#4c6073" metal={.31}/>
   <group position={[-1.79,.27,.48]} onClick={()=>select(0)}><FingerprintReader active={armed||denied} selected={selected===0}/></group>
   <group position={[-.82,.18,.91]} onClick={()=>select(1)}>
     <Box at={[0,0,0]} size={[.22,.10,.22]} color={selected===1?'#d5a969':'#253143'}/>
     <mesh position={[0,.076,0]}><cylinderGeometry args={[.076,.076,.086,22]}/><meshStandardMaterial color="#b64c3b"/></mesh>
   </group>
   {[-1.19,-1.00].map((x,i)=><mesh key={x} position={[x,.20,.63]}>
     <sphereGeometry args={[.043,18,14]}/><meshStandardMaterial color={i?'#a45e52':'#568767'} emissive={i?'#f3392c':'#55e28b'} emissiveIntensity={(i?denied:armed)?1.8:0}/>
   </mesh>)}
   <Box at={[1.07,.054,-.02]} size={[2.21,.11,1.75]} color="#6b7679" metal={.42}/>
   {[-.53,.53].map(x=><group key={x} position={[1.05+x,.21,.08]}>
     <Box at={[0,0,0]} size={[.23,.36,1.23]} color="#947745" metal={.38}/>
     <Box at={[0,.20,0]} size={[.31,.089,1.24]} color="#c6a462"/>
   </group>)}
   <Box at={[1.05,.51,-.23]} size={[1.76,.09,1.18]} color="#4b777a" metal={.55}/>
   <Box at={[1.05,.66,-.53]} size={[1.62,.22,.46]} color="#45646d" metal={.44}/>
   <Box at={[.89,.819,-.44]} size={[.69,.11,.44]} color="#78949a" metal={.47}/>
   <group position={[.48,.59,-.40]} scale={.61} onClick={()=>select(2)}><Drv8833Part/></group>
   <group position={[1.51,.51,.40]} onClick={()=>select(3)}>
     <Box at={[-.26,0,0]} size={[.38,.27,.32]} color="#c6973f"/>
     <group ref={wheel}>
       <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.28,.28,.17,32]}/><meshStandardMaterial color="#252c33" roughness={.84}/></mesh>
       <mesh position={[.096,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.178,.178,.025,28]}/><meshStandardMaterial color={selected===3?'#e5b96a':'#a4b0b0'} metalness={.49}/></mesh>
       {Array.from({length:6},(_,i)=><group key={i} rotation={[i*Math.PI/3,0,0]}><Box at={[.112,.102,0]} size={[.021,.069,.038]} color="#4a575d"/></group>)}
     </group>
   </group>
   <Line points={[[-1.80,.22,.20],[-1.64,.19,-.15],[-.48,.18,-.30],[.43,.58,-.43]]} color="#d18b64" lineWidth={3}/>
   <Line points={[[.49,.66,-.42],[.75,.63,-.09],[1.27,.53,.35]]} color={spinning?'#92ddbd':'#6b939b'} lineWidth={3}/>
   {anchors.map((at,i)=><WorldLabel position={at} key={i} className="gp-marker-anchor"><button type="button"
     className="gp-marker" aria-label={parts[i][0]} aria-pressed={selected===i} onClick={()=>select(i)}>
     {i+1}{selected===i&&<span className="gp-demo-marker-name">{parts[i][0]}</span>}
   </button></WorldLabel>)}
   <ContactShadows position={[0,.023,0]} opacity={.38} scale={6.3} far={1.3} resolution={128} frames={1}/>
 </>;
}
export default function FingerprintStarterDemo(){
 const [selected,select]=useState(0);
 const [connected,setConnected]=useState(true);
 const [enrolled,setEnrolled]=useState(false);
 const [first,setFirst]=useState(false);
 const [left,setLeft]=useState(0);
 const [running,setRunning]=useState(false);
 const [message,setMessage]=useState('Enroll a sample to begin.');
 const expires=useRef(0);
 const pulse=useRef<number|undefined>(undefined);
 const armed=left>0&&connected;
 useEffect(()=>{
   const timer=window.setInterval(()=>{
     if(!expires.current)return;
     const remaining=Math.max(0,expires.current-performance.now());setLeft(remaining);
     if(!remaining){expires.current=0;setMessage('Authorization expired · Scan again');}
   },100);
   return ()=>{window.clearInterval(timer);window.clearTimeout(pulse.current);};
 },[]);
 function lock(){expires.current=0;setLeft(0);}
 function scan(match:boolean){
   lock();
   if(!connected){setMessage('Reader unavailable · Starter locked');return;}
   if(!enrolled||!match){setMessage('Scan denied · Starter locked');return;}
   expires.current=performance.now()+starterWindow;setLeft(starterWindow);setMessage('Match · Press Start within five seconds');
 }
 function start(){
   if(!armed||performance.now()>=expires.current){lock();setMessage('Start refused · Scan an enrolled sample');return;}
   lock();setRunning(true);setMessage('Starter pulse · Authorization consumed');
   pulse.current=window.setTimeout(()=>{setRunning(false);setMessage('Starter off · New match required');},starterPulse);
 }
 function stop(){
   window.clearTimeout(pulse.current);setRunning(false);setMessage('Starter stopped · New match required');
 }
 return <div className="gp-split gp-demo">
   <div className="gp-story-stage">
     <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D fingerprint starter test stand">
       <Canvas camera={{position:[2.6,4.5,6.3],fov:43}} dpr={[1,1.6]} fallback={<p>Watch the authorization and motor readings below.</p>}>
         <Bench {...{armed,selected,select}} spinning={running} denied={!connected||message.startsWith('Scan denied')}/>
         <OrbitControls target={[0,.33,.05]} minDistance={3.5} maxDistance={15} enablePan={false}/>
       </Canvas>
     </div>
     <div className="gp-demo-result" aria-label="Fingerprint starter readings">
       <div><span>Reader</span><strong>{connected?'Online':'Offline'}</strong></div>
       <div><span>Authorization</span><strong>{armed?(left/1000).toFixed(1)+' s':'Locked'}</strong></div>
       <div><span>Starter wheel</span><strong>{running?'Turning':'Off'}</strong></div>
     </div>
   </div>
   <div className="gp-guide">
     <h3>Enroll, scan and start</h3>
     <p>The browser uses sample buttons for the fingerprint steps. Capture the same sample twice, then scan it to authorize a separate start command.</p>
     <div className="gp-steps">
       <button type="button" disabled={!connected||enrolled||running} onClick={()=>{
         if(first){setEnrolled(true);setFirst(false);setMessage('Sample enrolled · Starter locked');}
         else{setFirst(true);setMessage('First capture saved · Lift and capture again');}
       }}>{first?'Capture sample again':'Capture first sample'}</button>
       <button type="button" disabled={!connected||!enrolled||running} onClick={()=>{setEnrolled(false);setFirst(false);lock();setMessage('Sample deleted · Starter locked');}}>Delete sample</button>
     </div>
     <div className="gp-steps">
       <button type="button" disabled={running} onClick={()=>scan(true)}>Scan enrolled sample</button>
       <button type="button" disabled={running} onClick={()=>scan(false)}>Scan different sample</button>
       <button type="button" disabled={running} onClick={()=>{lock();setFirst(false);setConnected(!connected);setMessage(connected?'Reader unavailable · Starter locked':'Reader ready · Scan again');}}>{connected?'Disconnect reader':'Reconnect reader'}</button>
     </div>
     <div className="gp-steps">
       <button type="button" className="gp-button" disabled={running} onClick={start}>Press Start</button>
       <button type="button" disabled={!running} onClick={stop}>Release Start</button>
     </div>
     <p role="status" className="gp-demo-description">{message}</p>
     <ol className="gp-demo-labels">{parts.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={i===selected} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
     <p className="gp-demo-description">{parts[selected][1]}</p>
   </div>
 </div>;
}
