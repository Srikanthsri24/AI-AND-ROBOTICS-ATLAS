import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { faceSamples, imageHeight, imageWidth, renderFace, runSample, type Match } from '../data/attendance-engine.mjs';
import { faceLockDelay } from '../data/pi-face-lock';
import { WorldLabel } from './LabWorkbench';
import { SolarMeterSolid as Box } from './SolarMeterParts';

type Point=[number,number,number];
const labels:[string,string,Point][]=[
 ['Pi matcher','The model Pi compares the generated portrait with enrolled references. Only a clear result sends G over USB.',[-1.70,.65,.73]],
 ['Arduino latch controller','The Uno drives the servo and watches the frame contact. It waits through a stable closure before extending the bolt.',[1.62,.63,.92]],
 ['Servo and sliding bolt','The servo retracts the lightweight latch after an accepted grant. The exposed guide lets you follow the bolt travel.',[1.31,1.16,-.24]],
 ['Door contact','The magnet on the door must return beside the fixed contact. Opening the door restarts the closure timer.',[.93,1.67,-.34]],
];

function Model({open,released,selected,select}:{open:boolean;released:boolean;selected:number;select:(i:number)=>void}) {
 const hinge=useRef<Group>(null), bolt=useRef<Group>(null), horn=useRef<Group>(null);
 useFrame((_,dt)=>{
  if(hinge.current) hinge.current.rotation.y=MathUtils.damp(hinge.current.rotation.y,open?-1.17:0,11,dt);
  if(bolt.current) bolt.current.position.x=MathUtils.damp(bolt.current.position.x,released?1.13:.91,12,dt);
  if(horn.current) horn.current.rotation.z=MathUtils.damp(horn.current.rotation.z,released?-.60:0,12,dt);
 });
 return <>
  <color attach="background" args={['#293b4b']}/>
  <hemisphereLight args={['#e5f1ff','#8d6f5c',2.05]}/><directionalLight position={[-3,6,6]} intensity={2.8} color="#fff1d9"/>
  <Box at={[0,-.12,0]} size={[5.05,.24,3.35]} color="#748584"/>
  <Box at={[0,.12,-.42]} size={[2.67,.235,.85]} color="#987d63"/>
  {[-1.07,1.08].map(x=><Box key={x} at={[x,1.02,-.43]} size={[.18,1.88,.25]} color="#a1826b"/>)}
  <Box at={[0,1.93,-.43]} size={[2.31,.20,.26]} color="#b59677"/>
  <group ref={hinge} position={[-.962,.236,-.37]}>
   <Box at={[.974,.79,0]} size={[1.95,1.57,.12]} color="#426386"/>
   {Array.from({length:8},(_,i)=><Box key={i} at={[.174+i*.225,.78,.066]} size={[.018,1.37,.009]} color="#344b68"/>)}
   <Box at={[1.61,.83,.099]} size={[.19,.22,.045]} color="#475b6f" metal={.56}/>
   <Box at={[1.62,.84,.14]} size={[.076,.14,.057]} color="#b7a282" metal={.66}/>
   <Box at={[1.82,1.37,.098]} size={[.19,.083,.08]} color="#dbe2d7"/>
   <Box at={[1.84,.77,.103]} size={[.14,.13,.075]} color="#677782" metal={.6}/>
  </group>
  <group onClick={()=>select(2)}>
   <Box at={[1.15,.99,-.269]} size={[.40,.24,.068]} color="#5b6469" metal={.63}/>
   <Box at={[1.40,.98,-.14]} size={[.32,.25,.25]} color={selected===2?'#e0a960':'#315e84'}/>
   <group ref={bolt} position={[.91,1.01,-.112]}><Box at={[0,0,0]} size={[.44,.075,.08]} color="#adb8ba" metal={.72}/></group>
   <group ref={horn} position={[1.38,.98,.012]}><Box at={[-.108,.045,0]} size={[.25,.059,.049]} color="#cbd0c7"/></group>
  </group>
  <group onClick={()=>select(3)}><Box at={[1.083,1.604,-.27]} size={[.18,.084,.095]} color={selected===3?'#edc179':'#e1e3d8'}/></group>
  <Line points={[[1.18,1.60,-.26],[1.34,1.33,-.26],[1.49,.29,-.23],[1.51,.13,.71]]} lineWidth={2.7} color="#d49b68"/>
  <Line points={[[1.40,.91,-.12],[1.66,.51,-.04],[1.75,.17,.66]]} lineWidth={2.5} color="#aa7c61"/>
  {[-1.63,1.61].map((x,i)=><group key={x} position={[x,.105,.80]} onClick={()=>select(i)}>
   <Box at={[0,-.055,0]} size={[.91,.084,.63]} color={selected===i?'#cda361':'#70808a'}/>
   <Box at={[0,.012,0]} size={[.81,.047,.54]} color={i?'#2872a3':'#37735c'}/>
   <Box at={[.058,.065,0]} size={[.20,.05,.22]} color="#222b33"/>
   <Box at={[-.31,.089,-.08]} size={[.18,.135,.20]} color="#a5b5c3" metal={.68}/>
   {[-.22,.22].map(z=><group key={z}><Box at={[.052,.064,z]} size={[.56,.055,.067]} color="#2b333a"/>
    {Array.from({length:12},(_,k)=><Box key={k} at={[-.171+k*.041,.098,z]} size={[.017,.013,.022]} color="#c4aa70" metal={.45}/>)}</group>)}
  </group>)}
  <Line points={[[-1.92,.13,.78],[-2.11,.11,1.31],[-.54,.065,1.38],[1.31,.11,1.32],[1.30,.15,.71]]} color="#303740" lineWidth={4}/>
  {labels.map(([name,,at],i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" aria-label={name} aria-pressed={selected===i} className="gp-marker" onClick={()=>select(i)}>
   {i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}
  </button></WorldLabel>)}
  <ContactShadows position={[0,.004,0]} opacity={.32} scale={5} far={1.22} resolution={128} frames={1}/>
 </>;
}

export default function PiFaceLockDemo(){
 const [sample,setSample]=useState(faceSamples[0]);
 const [result,setResult]=useState<Match|null>(null);
 const [selected,select]=useState(0);
 const [released,setReleased]=useState(false);
 const [open,setOpen]=useState(false);
 const [grant,setGrant]=useState(0);
 const [message,setMessage]=useState('Door closed · Bolt extended');
 const portrait=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const context=portrait.current?.getContext('2d');
  if(!context)return;
  const pixels=renderFace(sample.shape,sample.offset,sample.brightness), image=context.createImageData(imageWidth,imageHeight);
  pixels.forEach((shade,i)=>image.data.set([shade,shade,shade,255],i*4));
  context.putImageData(image,0,0);
 },[sample]);
 useEffect(()=>{
  if(!released||open) return;
  const timer=window.setTimeout(()=>{setReleased(false);setMessage('Door stayed closed · Bolt relocked');},faceLockDelay);
  return ()=>window.clearTimeout(timer);
 },[released,open,grant]);
 function scan(){
  const next=runSample(sample.id);
  setResult(next);
  if(next.status!=='match'){
   setMessage(next.status==='review'?'Ambiguous portrait · No grant sent':'Unknown visitor · No grant sent');
   return;
  }
  setReleased(true);
  setGrant(value=>value+1);
  setMessage('Matched · G sent · Bolt retracted');
 }
 return <div className="gp-split gp-demo">
  <div className="gp-story-stage">
   <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D Raspberry Pi face latch model">
    <Canvas camera={{position:[3.1,3.2,6.0],fov:43}} dpr={[1,1.6]} fallback={<p>Follow the latch and door readings below.</p>}>
     <Model {...{open,released,selected,select}}/><OrbitControls target={[0,.68,-.10]} minDistance={3.6} maxDistance={10} enablePan={false}/>
    </Canvas>
   </div>
   <div className="gp-demo-result" aria-label="Face lock readings"><div><span>Door</span><strong>{open?'Open':'Closed'}</strong></div><div><span>Bolt</span><strong>{released?'Retracted':'Extended'}</strong></div><div><span>Contact</span><strong>{open?'High':'Low'}</strong></div></div>
  </div>
  <div className="gp-guide">
   <h3>Compare a generated portrait</h3>
   <div className="gp-face-lock-input"><canvas ref={portrait} width={imageWidth} height={imageHeight} role="img" aria-label={`Generated portrait · ${sample.name}`}/>
    <div><label htmlFor="pi-face-lock-sample">Visitor sample</label><select id="pi-face-lock-sample" value={sample.id} onChange={event=>{setSample(faceSamples.find(item=>item.id===event.target.value)??faceSamples[0]);setResult(null);}}>
     {faceSamples.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}
    </select><button type="button" className="gp-button" onClick={scan}>Scan portrait</button></div></div>
   {result&&<p>Closest distances {result.candidates.map(item=>`${item.name} ${item.distance.toFixed(3)}`).join(' · ')}</p>}
   <div className="gp-steps"><button type="button" disabled={!released&&!open} onClick={()=>{setOpen(!open);setMessage(open?'Door closed · Waiting to relock':'Door open · Latch held retracted');}}>{open?'Close door':'Open door'}</button></div>
   <p role="status">{message}</p>
   <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" aria-pressed={selected===i} className="gp-part-label" onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
   <p className="gp-demo-description">{labels[selected][1]}</p>
  </div>
 </div>;
}
