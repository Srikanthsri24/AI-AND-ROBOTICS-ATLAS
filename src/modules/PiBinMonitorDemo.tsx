import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls } from '@react-three/drei';
import { emptyGap, fullGap } from '../data/pi-bin-monitor';
import { WorldLabel } from './LabWorkbench';
import { SolarMeterSolid as Box } from './SolarMeterParts';

type Point=[number,number,number];
const parts:[string,Point,string][]=[
 ['Sonar module',[-.46,1.98,-.01],'The two transducers send a pulse and listen for its echo. A closer target gives a shorter echo time.'],
 ['Flat fill target',[-.26,.48,.62],'The model uses a flat target for repeatable measurement. Moving it upward shrinks the air gap.'],
 ['Uno echo timer',[1.24,.45,.77],'The 5 V Uno times the echo and sends either a distance in millimeters or NO_ECHO over USB.'],
 ['Raspberry Pi monitor',[1.43,.48,-.49],'The Pi converts distance to fill percentage. The local dashboard hides the old value when packets stop arriving.'],
];

function Bench({fill,echo,connected,selected,select}:{fill:number;echo:boolean;connected:boolean;selected:number;select:(i:number)=>void}){
 const height=.26+fill*.0107;
 return <>
  <color attach="background" args={['#233b4a']}/>
  <hemisphereLight args={['#e6f2ff','#756657',2.2]}/><directionalLight position={[-3,6,5]} intensity={2.6} color="#fff1dc"/>
  <Box at={[0,-.11,0]} size={[4.9,.22,3.45]} color="#667f83"/>
  <Box at={[-.65,.12,-.18]} size={[2.18,.24,1.98]} color="#526461" metal={.23}/>
  <Box at={[-.65,.99,-1.12]} size={[2.06,1.57,.11]} color="#517775" metal={.36}/>
  {[-1.66,.36].map(x=><Box key={x} at={[x,.99,-.20]} size={[.13,1.57,1.90]} color="#5d8781" metal={.34}/>)}
  {[-1.72,.41].map(x=><Box key={x} at={[x,.99,.75]} size={[.10,1.59,.14]} color="#759593"/>)}
  <Box at={[-.66,1.81,-.16]} size={[2.23,.13,.44]} color="#8baca6" metal={.45}/>
  <group position={[-.60,1.70,-.11]} onClick={()=>select(0)}>
   <Box at={[0,0,0]} size={[.59,.05,.24]} color={selected===0?'#d6aa66':'#246982'}/>
   {[-.16,.16].map(x=><mesh key={x} position={[x,-.065,0]}><cylinderGeometry args={[.093,.093,.101,24]}/><meshStandardMaterial color="#a1b4b7" metalness={.76} roughness={.34}/></mesh>)}
  </group>
  <group onClick={()=>select(1)}>
   <Box at={[-.66,height,-.17]} size={[1.84,.080,1.62]} color={selected===1?'#f3cb91':'#ccae84'}/>
   {[.28,.57,.91].map(fraction=><Box key={fraction} at={[-.66,.22+(height-.22)*fraction,-.17]} size={[1.78,.063,1.49]} color="#9a886d"/>)}
  </group>
  {echo&&<><Line points={[[-.73,1.58,-.12],[-.60,height+.045,-.08]]} lineWidth={3} color="#a4def3"/><Line points={[[-.47,1.58,-.12],[-.60,height+.045,-.08]]} lineWidth={2} color="#68ccb8"/></>}
  {[true,false].map((uno,i)=><group key={i} position={[1.33,.087,uno ? .74 : -.51]} onClick={()=>select(uno?2:3)}>
   <Box at={[0,-.035,0]} size={[1.11,.105,.75]} color={selected===i+2?'#d6af78':'#65747b'}/>
   <Box at={[0,.026,0]} size={[.97,.047,.62]} color={uno?'#2e7295':'#356d59'}/>
   <Box at={[0,.071,-.012]} size={[.24,.062,.21]} color="#262e36"/>
   <Box at={[.39,.101,.08]} size={[.16,.115,.19]} color="#acbac1" metal={.7}/>
   {[-.24,.24].map(z=><Box key={z} at={[.01,.068,z]} size={[.75,.065,.07]} color="#242d33"/>)}
  </group>)}
  <Line points={[[-.34,1.72,-.16],[.37,1.78,-.19],[.63,.68,-.05],[.91,.14,.66]]} lineWidth={3.4} color="#b98259"/>
  <Line points={[[1.71,.17,.78],[1.94,.09,.88],[2.09,.13,.20],...(connected?[[1.71,.17,-.42] as Point]:[])]} lineWidth={4} color="#2c3840"/>
  {parts.map(([name,anchor],i)=><WorldLabel key={name} position={i===1?[anchor[0],height+.17,anchor[2]]:anchor} className="gp-marker-anchor">
   <button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button>
  </WorldLabel>)}
  <ContactShadows position={[0,.005,0]} opacity={.34} scale={4.9} far={1.2} resolution={128} frames={1}/>
 </>;
}
export default function PiBinMonitorDemo(){
 const [fill,setFill]=useState(20);
 const [echo,setEcho]=useState(true);
 const [connected,setConnected]=useState(true);
 const [selected,select]=useState(0);
 const [expired,setExpired]=useState(false);
 const [saved,setSaved]=useState({fill:20,echo:true});
 useEffect(()=>{
  if(connected) return;
  const timeout=window.setTimeout(()=>setExpired(true),3000);
  return ()=>window.clearTimeout(timeout);
 },[connected]);
 function toggleConnection(){
  if(connected) setSaved({fill,echo});
  setExpired(false);
  setConnected(!connected);
 }
 const reading=connected?{fill,echo}:saved;
 const gap=Math.round(emptyGap-(emptyGap-fullGap)*reading.fill/100);
 const status=expired?'Stale':!reading.echo?'Sensor unavailable':reading.fill>=80?'Collect':'Space remaining';
 const visible=!expired&&reading.echo;
 return <div className="gp-split gp-demo">
  <div className="gp-story-stage">
   <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D Raspberry Pi bin monitoring station">
    <Canvas camera={{position:[3.1,3.05,5.8],fov:43}} dpr={[1,1.6]} fallback={<p>Follow the distance and fill readings below.</p>}><Bench {...{fill,echo,connected,selected,select}}/>
     <OrbitControls target={[0,.68,-.10]} minDistance={3.8} maxDistance={10} enablePan={false}/></Canvas>
   </div>
   <div className="gp-demo-result" aria-label="Bin monitor readings"><div><span>Gap</span><strong>{visible?gap+' mm':'—'}</strong></div>
    <div><span>Estimated fill</span><strong>{visible?reading.fill+'%':'—'}</strong></div><div><span>Dashboard</span><strong>{status}</strong></div></div>
  </div>
  <div className="gp-guide">
   <h3>Measure the air gap</h3><p>Raise the target and see the two sonar paths shorten. Try the collection threshold, a missing echo, and a disconnected serial cable.</p>
   <label className="gp-home-light">Target height <output>{fill}%</output><input type="range" min="0" max="100" value={fill} onChange={event=>setFill(event.target.valueAsNumber)}/></label>
   <div className="gp-steps"><button type="button" onClick={()=>setFill(0)}>Empty reference</button><button type="button" onClick={()=>setFill(80)}>Collection threshold</button><button type="button" onClick={()=>setFill(100)}>Full reference</button></div>
   <div className="gp-steps"><button type="button" onClick={()=>setEcho(!echo)}>{echo?'Simulate no echo':'Restore echo'}</button><button type="button" onClick={toggleConnection}>{connected?'Disconnect serial':'Reconnect serial'}</button></div>
   <p role="status">{status}{visible?` · ${gap} mm · ${reading.fill}% full`: ' · No current fill estimate'}</p>
   <p>With the cable disconnected, the last packet remains visible for three seconds before the dashboard marks it stale.</p>
   <ol className="gp-demo-labels">{parts.map(([name],index)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>select(index)}><span>{index+1}</span>{name}</button></li>)}</ol>
   <p className="gp-demo-description">{parts[selected][2]}</p>
  </div>
 </div>;
}
