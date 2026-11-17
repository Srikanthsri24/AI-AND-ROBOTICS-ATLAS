import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls } from '@react-three/drei';
import { trackCommand } from '../data/pi-object-follower';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { WorldLabel } from './LabWorkbench';

type Pose={x:number;z:number;yaw:number;turn:number;spin:number};
const resetPose:Pose={x:0,z:1.6,yaw:0,turn:0,spin:0};
const locations=[{name:'Left marker',x:-1.14,z:-1.68},{name:'Center marker',x:0,z:-1.68},{name:'Right marker',x:1.14,z:-1.68},{name:'Near marker',x:0,z:.62}];
const parts=[
 ['Orange marker','The high-contrast patch is the tracking target. The model stops if it leaves camera view.'],
 ['Front camera','The camera measures horizontal position and apparent width. A larger image usually means the same marker is closer.'],
 ['Pi and drive boards','The Pi selects a command from the bounding box. The Uno and motor breakout apply it to the two wheel channels.'],
 ['Drive wheels','The inside wheel slows for a turn. Both stop on a hold or lost-target decision.'],
];
function measurement(pose:Pose,target:{x:number;z:number},visible:boolean){
 const dx=target.x-pose.x,dz=target.z-pose.z;
 const cross=Math.cos(pose.yaw)*dx-Math.sin(pose.yaw)*dz;
 const forward=-Math.sin(pose.yaw)*dx-Math.cos(pose.yaw)*dz;
 const x=160+cross/Math.max(forward,.1)*115;
 const width=Math.min(220,128/Math.max(forward,.1));
 return visible&&forward>0&&x>16&&x<304?{x,width,decision:trackCommand(x,width)}:{x:160,width:0,decision:'Lost'};
}
function Course({pose,target,visible,selected,select}:{pose:Pose;target:{x:number;z:number};visible:boolean;selected:number;select:(v:number)=>void}){
 return <>
  <color attach="background" args={['#273c4a']}/><hemisphereLight args={['#e5efff','#8c725b',2.04]}/><directionalLight position={[-4,7,5]} intensity={2.7}/>
  <Box at={[0,-.11,0]} size={[5.5,.21,5.45]} color="#5d7078"/>
  {[-2,-1,0,1,2].map(x=><Box key={x} at={[x,.006,0]} size={[.014,.008,4.9]} color="#778b90"/>)}
  {[-2,-1,0,1,2].map(z=><Box key={z} at={[0,.007,z]} size={[4.9,.008,.014]} color="#778b90"/>)}
  <Line points={[[-2.23,.024,-2.22],[2.23,.024,-2.22],[2.23,.024,2.22],[-2.23,.024,2.22],[-2.23,.024,-2.22]]} lineWidth={2} color="#e9c681"/>
  {visible&&<group position={[target.x,0,target.z]} onClick={()=>select(0)}>
    <Box at={[0,.048,0]} size={[.62,.086,.49]} color="#636969" metal={.48}/>
    <Box at={[0,.37,-.05]} size={[.10,.63,.073]} color="#777c7d" metal={.57}/>
    <Box at={[0,.53,0]} size={[.62,.58,.075]} color={selected===0?'#ffbe66':'#e68035'}/>
    <Box at={[0,.53,.044]} size={[.54,.47,.014]} color="#f19b4d"/>
  </group>}
  <group position={[pose.x,.045,pose.z]} rotation={[0,pose.yaw,0]}>
    <Box at={[0,.26,0]} size={[.94,.104,1.16]} color="#3c6469" metal={.58}/>
    <Box at={[0,.39,.20]} size={[.53,.14,.43]} color="#343d43"/>
    <group onClick={()=>select(2)}>
      <Box at={[0,.50,.22]} size={[.60,.053,.47]} color={selected===2?'#e2ab65':'#377a68'}/>
      <Box at={[0,.55,.20]} size={[.21,.052,.18]} color="#262d32"/>
      <Box at={[.224,.571,.21]} size={[.12,.12,.30]} color="#a4b5b7" metal={.68}/>
      <Box at={[0,.37,-.13]} size={[.47,.068,.30]} color="#2b6b91"/>
    </group>
    <group onClick={()=>select(1)}><Box at={[0,.56,-.46]} size={[.37,.24,.12]} color={selected===1?'#d5a567':'#404d55'} metal={.48}/>
      <mesh position={[0,.56,-.54]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.073,.073,.067,22]}/><meshStandardMaterial color="#242e3c" metalness={.61}/></mesh>
    </group>
    {[-.56,.56].map((x,i)=><group key={x} position={[x,.227,.08]} onClick={()=>select(3)} rotation={[(pose.spin+(i?pose.turn:-pose.turn)),0,0]}>
      <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.232,.232,.14,30]}/><meshStandardMaterial color="#23292e" roughness={.87}/></mesh>
      <mesh rotation={[0,0,Math.PI/2]} position={[x*.14,0,0]}><cylinderGeometry args={[.153,.153,.024,24]}/><meshStandardMaterial color={selected===3?'#ffcd83':'#b0a482'} metalness={.57}/></mesh>
      {Array.from({length:7},(_,i)=><group key={i} rotation={[i*Math.PI*2/7,0,0]}><Box at={[x*.16,.100,0]} size={[.018,.056,.022]} color="#4e5558"/></group>)}
    </group>)}
  </group>
  {parts.map(([name],i)=>{
    if(i===0&&!visible)return null;
    const anchors:[number,number,number][]=[[target.x,.98,target.z],[pose.x-.36,.82,pose.z-.44],[pose.x+.30,.82,pose.z+.12],[pose.x+.58,.40,pose.z+.47]];
    return <WorldLabel key={name} position={anchors[i]} className="gp-marker-anchor"><button type="button" aria-label={name} aria-pressed={selected===i} className="gp-marker" onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>;
  })}
  <ContactShadows position={[0,.022,0]} opacity={.38} scale={5.1} far={1.2} resolution={128}/>
 </>;
}

export default function PiObjectFollowerDemo(){
 const [pose,setPose]=useState(resetPose);
 const [target,setTarget]=useState(locations[1]);
 const [visible,setVisible]=useState(true);
 const [running,setRunning]=useState(false);
 const [selected,select]=useState(0);
 const reading=measurement(pose,target,visible);
 const decision=running?reading.decision:'Parked';
 useEffect(()=>{
  if(!running)return;
  const timer=window.setInterval(()=>setPose(previous=>{
    const {decision}=measurement(previous,target,visible);
    if(decision==='Hold'||decision==='Lost')return previous;
    const steer=decision==='Left' ? .050:decision==='Right' ? -.050:0;
    const yaw=previous.yaw+steer;
    const travel=steer ? .026 : .043;
    return {yaw,x:previous.x-Math.sin(yaw)*travel,z:previous.z-Math.cos(yaw)*travel,turn:previous.turn+steer,spin:previous.spin+travel/.232};
  }),50);
  return ()=>window.clearInterval(timer);
 },[running,target,visible]);
 function place(location:typeof target){
  // Each preset starts from the same camera pose so the initial corrections can be compared.
  setPose(resetPose);setTarget(location);setVisible(true);setRunning(false);
 }
 return <div className="gp-split gp-demo">
  <div className="gp-story-stage">
   <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D Raspberry Pi object follower course">
    <Canvas camera={{position:[3.9,5.1,5.9],fov:42}} dpr={[1,1.6]} fallback={<p>Use the camera preview and decision readout.</p>}><Course {...{pose,target,visible,selected,select}}/><OrbitControls enablePan={false} minDistance={4.3} maxDistance={12}/></Canvas>
   </div>
   <div className="gp-demo-result" aria-label="Follower readings"><div><span>Target center</span><strong>{reading.width?Math.round(reading.x)+' px':'—'}</strong></div><div><span>Target width</span><strong>{reading.width?Math.round(reading.width)+' px':'—'}</strong></div><div><span>Drive decision</span><strong>{decision}</strong></div></div>
  </div>
  <div className="gp-guide">
   <h3>Track the orange card</h3><p>Place the marker, look at the camera preview, then start tracking. The presets reset the rover so you can compare directions from the same camera pose.</p>
   <div className="gp-steps">{locations.map(location=><button type="button" key={location.name} onClick={()=>place(location)}>{location.name}</button>)}</div>
   <div className="gp-steps"><button type="button" className="gp-button" onClick={()=>setRunning(!running)}>{running?'Stop tracking':'Start tracking'}</button><button type="button" onClick={()=>setVisible(!visible)}>{visible?'Hide marker':'Show marker'}</button></div>
   <div className="gp-follower-feed" role="img" aria-label={reading.width?'Camera preview with visible target and center line':'Camera preview with no visible target'}>
    <span className="gp-follower-center"/>{reading.width>0&&<span className="gp-follower-target" style={{left:reading.x/3.2+'%',width:reading.width/3.2+'%'}}/>}
   </div>
   <p role="status" className="gp-demo-description">{decision==='Lost'?'Target lost · Both wheels stopped':decision==='Hold'?'Target near · Both wheels stopped':decision==='Parked'?'Parked · Preview only':decision==='Forward'?'Following straight':`Correcting ${decision.toLowerCase()}`}</p>
   <ol className="gp-demo-labels">{parts.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={i===selected} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
   <p className="gp-demo-description">{parts[selected][1]}</p>
  </div>
 </div>;
}
