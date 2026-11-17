import { useRef,useState } from 'react';
import { Canvas,useFrame } from '@react-three/fiber';
import { ContactShadows,Line,OrbitControls } from '@react-three/drei';
import { MathUtils,type Group } from 'three';
import { WorldLabel } from './LabWorkbench';
import { SolarMeterSolid as Box } from './SolarMeterParts';

type Point=[number,number,number];
const positions=[-1.45,0,1.45];
const sampleNames=['Dry reference','Damp reference','Test cup'];
const labels=[
 ['Capacitive probe','The coated blade stays at the marked depth. The board above the soil sends the analog value to A0.'],
 ['Calibration cups','The two references use the same soil and packing. Keep the insertion depth consistent when moving between them.'],
 ['Arduino Uno','The Uno averages eight analog readings, stores both references, and converts the live result to a relative score.'],
 ['Dry-soil LED','The indicator turns on below the calibrated midpoint. With missing or nearly equal references it stays off.'],
];
const grains=Array.from({length:40},(_,i)=>{
 const angle=i*2.39996;
 const radius=.39*Math.sqrt((i+.35)/40);
 return [Math.cos(angle)*radius,Math.sin(angle)*radius] as const;
});
function SoilBench({sample,wet,lit,selected,select}:{sample:number;wet:number;lit:boolean;selected:number;select:(i:number)=>void}){
 const probe=useRef<Group>(null);
 useFrame((_,delta)=>{
  if(!probe.current)return;
  const x=positions[sample], distance=Math.abs(probe.current.position.x-x);
  probe.current.position.x=MathUtils.damp(probe.current.position.x,x,7,delta);
  probe.current.position.y=MathUtils.damp(probe.current.position.y,distance>.09 ? .75 : .43,11,delta);
 });
 const anchors:Point[]=[[positions[sample],1.46,-.35],[-1.47,.64,.18],[-.58,.51,1.24],[1.24,.54,1.06]];
 return <>
  <color attach="background" args={['#273d49']}/><hemisphereLight args={['#e7f0fe','#7b624d',2.1]}/><directionalLight position={[-3,7,5]} intensity={2.7} color="#fff1dc"/>
  <Box at={[0,-.11,0]} size={[5.1,.21,3.24]} color="#788987"/>
  {positions.map((x,index)=>{
   const soil=['#8a6a4b','#4d392b',wet>=50?'#5a4132':'#826345'][index];
   return <group key={x} position={[x,0,-.38]} onClick={()=>select(1)}>
    <mesh position={[0,.343,0]}><cylinderGeometry args={[.50,.37,.62,32,1,true]}/><meshPhysicalMaterial color={selected===1?'#f1cda1':'#c4d4d7'} transparent opacity={.39} side={2} roughness={.31}/></mesh>
    <mesh position={[0,.033,0]}><cylinderGeometry args={[.385,.385,.042,32]}/><meshStandardMaterial color="#889c9e" metalness={.20}/></mesh>
    <mesh position={[0,.29,0]}><cylinderGeometry args={[.443,.365,.49,32]}/><meshStandardMaterial color={soil} roughness={.96}/></mesh>
    <mesh rotation={[Math.PI/2,0,0]} position={[0,.644,0]}><torusGeometry args={[.485,.025,10,32]}/><meshStandardMaterial color="#d1dada" metalness={.31}/></mesh>
    {grains.map(([gx,gz],i)=><mesh key={i} position={[gx,.548,gz]}><sphereGeometry args={[.013+i%4*.004,6,5]}/><meshStandardMaterial color={i%3===0?'#b49771':soil} roughness={.94}/></mesh>)}
    <Box at={[0,.19,.442]} size={[.34,.112,.027]} color={index===sample?'#b9d9ca':'#dce0d8'}/>
   </group>;
  })}
  <group ref={probe} position={[positions[0],.43,-.38]} onClick={()=>select(0)}>
   <Box at={[0,.36,0]} size={[.225,.77,.071]} color={selected===0?'#be965a':'#304e54'} metal={.21}/>
   <Box at={[0,.675,.016]} size={[.21,.22,.05]} color="#57746e"/>
   <Box at={[-.014,.728,.045]} size={[.103,.081,.042]} color="#282e33"/>
   <Box at={[0,.766,.027]} size={[.143,.063,.089]} color="#c6cac1"/>
   {[-.06,0,.06].map(x=><Box key={x} at={[x,.244,.041]} size={[.012,.416,.016]} color="#b9995f" metal={.54}/>)}
   <Line points={[[0,.805,.032],[.13,.93,.06],[.32,.90,.42]]} lineWidth={3.4} color="#3f5059"/>
  </group>
  <group position={[-.59,.10,1.03]} onClick={()=>select(2)}>
   <Box at={[0,0,0]} size={[1.11,.13,.73]} color={selected===2?'#c7a36a':'#637580'}/>
   <Box at={[0,.082,0]} size={[.97,.046,.62]} color="#22769b"/>
   <Box at={[.12,.137,0]} size={[.26,.066,.285]} color="#252c31"/>
   <Box at={[-.36,.153,.14]} size={[.22,.16,.21]} color="#a9bbbf" metal={.67}/>
   {[-.24,.24].map(z=><Box key={z} at={[.06,.14,z]} size={[.72,.089,.06]} color="#27343a"/>)}
  </group>
  <Line points={[[-.12,.20,1.19],[.33,.23,1.23],[.92,.12,1.21],[1.14,.23,1.05]]} lineWidth={3} color="#b58155"/>
  <group position={[1.18,.15,1.04]} onClick={()=>select(3)}>
   <Box at={[0,-.064,0]} size={[.58,.092,.38]} color={selected===3?'#dabb82':'#3c5d68'}/>
   <mesh position={[0,.088,0]}><sphereGeometry args={[.065,18,14]}/><meshStandardMaterial color={lit?'#ffe1a2':'#8c765b'} emissive="#ffb653" emissiveIntensity={lit?2.2:0}/></mesh>
  </group>
  {labels.map(([name],i)=><WorldLabel key={name} position={anchors[i]} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
  <ContactShadows position={[0,.004,0]} opacity={.34} scale={5} far={1.2} resolution={128} frames={1}/>
 </>;
}
export default function SoilCalibrationDemo(){
 const [sample,setSample]=useState(0);
 const [wet,setWet]=useState(30);
 const [dry,setDry]=useState<number|null>(null);
 const [damp,setDamp]=useState<number|null>(null);
 const [selected,select]=useState(0);
 const raw=[790,400,790-Math.round(390*wet/100)][sample];
 const valid=dry!==null&&damp!==null&&Math.abs(dry-damp)>=20;
 const moisture=valid?Math.max(0,Math.min(100,Math.trunc((raw-dry)*100/(damp-dry)))):null;
 const lit=moisture!==null&&moisture<50;
 return <div className="gp-split gp-demo">
  <div className="gp-story-stage"><div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D soil moisture calibration bench">
   <Canvas camera={{position:[2.9,3.4,5.7],fov:42}} dpr={[1,1.6]} fallback={<p>Follow the readings below.</p>}><SoilBench {...{sample,wet,lit,selected,select}}/><OrbitControls target={[0,.46,0]} minDistance={3.5} maxDistance={10} enablePan={false}/></Canvas>
  </div><div className="gp-demo-result" aria-label="Soil moisture readings"><div><span>Raw A0</span><strong>{raw}</strong></div><div><span>Relative moisture</span><strong>{moisture===null?'—':moisture+'%'}</strong></div><div><span>Dry LED</span><strong>{lit?'On':'Off'}</strong></div></div></div>
  <div className="gp-guide"><h3>Capture two references</h3><p>Move the probe into each reference cup and capture its reading. Then try the test cup and change its moisture.</p>
   <div className="gp-steps" aria-label="Probe position">{sampleNames.map((name,i)=><button type="button" key={name} aria-pressed={sample===i} onClick={()=>setSample(i)}>{name}</button>)}</div>
   <div className="gp-steps"><button type="button" onClick={()=>setDry(raw)}>Capture dry</button><button type="button" onClick={()=>setDamp(raw)}>Capture damp</button><button type="button" onClick={()=>{setDry(null);setDamp(null);}}>Reset references</button></div>
   <p>Dry {dry??'—'} · Damp {damp??'—'}</p>
   <label className="gp-home-light">Test cup moisture <output>{wet}%</output><input type="range" min="0" max="100" value={wet} onChange={event=>{setWet(event.target.valueAsNumber);setSample(2);}}/></label>
   <p role="status">{moisture===null?'Need distinct dry and damp references':lit?'Below midpoint · Dry LED on':'At or above midpoint · Dry LED off'}</p>
   <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
   <p className="gp-demo-description">{labels[selected][1]}</p>
  </div>
 </div>;
}
