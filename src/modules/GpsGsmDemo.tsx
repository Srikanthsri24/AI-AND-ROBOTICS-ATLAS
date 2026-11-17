import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { checkpoints, fixLifetime } from '../data/gps-gsm';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { FonaBattery, FonaModule } from './GsmEnergyParts';
import { MegaBoard } from './GpsGsmParts';
import { GpsBreakout } from './GpsAlertDemo';
import { WorldLabel } from './LabWorkbench';

type Fix={index:number;at:number};
type Point=[number,number,number];
const labels=[
  ['GPS patch','The ceramic antenna faces upward. A fresh fix is required when the button is pressed.'],
  ['Send button · D7','A press captures one coordinate pair if the last position is still fresh.'],
  ['GSM radio','Its independent battery powers transmission. GPS and GSM use different UARTs on the Mega.'],
  ['Phone inbox','The receiving phone shows the snapshot from the instant you pressed Send.'],
] as const;
function Marker({i,at,selected,select}:{i:number;at:Point;selected:number;select:(i:number)=>void}){
  return <WorldLabel position={at} className="gp-marker-anchor">
    <button type="button" className="gp-marker" aria-pressed={selected===i} aria-label={labels[i][0]} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{labels[i][0]}</span>}</button>
  </WorldLabel>;
}
function Field({index,online,selected,select,send,delivered,locked}:{locked:boolean;index:number;online:boolean;selected:number;select:(i:number)=>void;send:()=>void;delivered:boolean}){
  const cart=useRef<Group>(null);
  useFrame((_,dt)=>{
    if(!cart.current)return;
    cart.current.position.x=MathUtils.damp(cart.current.position.x,checkpoints[index].x,6,dt);
    cart.current.position.z=MathUtils.damp(cart.current.position.z,checkpoints[index].z,6,dt);
  });
  return <>
    <color attach="background" args={['#253347']}/>
    <hemisphereLight args={['#e8f1ff','#625139',2.4]}/>
    <directionalLight position={[-4,7,5]} intensity={2.3}/>
    <Box at={[0,-.12,0]} size={[6.7,.23,4.28]} color="#566b61"/>
    <Box at={[-.23,.011,.21]} size={[5.85,.020,1.09]} color="#6d7173"/>
    <Box at={[1.60,.012,-.64]} size={[2.12,.021,1.68]} color="#78817c"/>
    {Array.from({length:9},(_,i)=><Box key={i} at={[i*.54-2.43,.028,.19]} size={[.31,.008,.042]} color="#c7ba89"/>)}
    {checkpoints.map((p,i)=><Box key={p.name} at={[p.x,.033,p.z+.56]} size={[.49,.021,.084]} color={index===i?'#e9c775':'#9ba7a0'}/>)}
    {[.96,2.33].map(x=><Box key={x} at={[x,.45,-1.31]} size={[.075,.902,.08]} color="#464f54" metal={.47}/>)}
    <Box at={[1.65,.92,-.67]} size={[1.57,.075,1.56]} color="#68747a" metal={.41}/>
    <group ref={cart} position={[checkpoints[0].x,.05,checkpoints[0].z]}>
      <Box at={[0,.13,0]} size={[1.66,.13,1.06]} color="#374858"/>
      {[-.61,.61].map(x=>[-.43,.43].map(z=><mesh key={x+':'+z} position={[x,.069,z]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[.105,.105,.10,20]}/><meshStandardMaterial color="#262d35" roughness={.83}/>
      </mesh>))}
      <group position={[-.04,.205,-.23]} scale={.72}><MegaBoard/></group>
      <group position={[-.55,.221,.25]} scale={.49} onClick={()=>select(0)}><GpsBreakout selected={selected===0}/></group>
      {locked&&[-.17,.03,.23].map((dx,i)=><Line key={dx} points={[
        [-.55+dx,.43,.20],[-.55+dx*2,.83+i*.12,.14],
      ]} color="#8bceec" transparent opacity={.63} lineWidth={1.8} dashed dashSize={.055} gapSize={.05}/>)}
      <Marker i={0} at={[-.63,.44,.31]} {...{selected,select}}/>
      <group position={[.36,.225,.24]} scale={.56} onClick={()=>select(2)}><FonaModule selected={selected===2} {...{online}}/></group>
      <group position={[.62,.207,-.11]} scale={.45}><FonaBattery/></group>
      <Box at={[.23,.221,.484]} size={[.64,.031,.065]} color="#242d38"/>
      <Line points={[[.53,.258,.16],[.60,.228,.32],[.47,.240,.484]]} color="#313943" lineWidth={2}/>
      <Line points={[[.67,.236,-.34],[.78,.235,-.25],[.75,.239,.09],[.57,.257,.23]]} color="#992f38" lineWidth={2}/>
      <Marker i={2} at={[.46,.49,.13]} {...{selected,select}}/>
      <group onClick={()=>{select(1);send();}}>
        <Box at={[-.13,.229,.35]} size={[.17,.072,.15]} color="#253039"/>
        <mesh position={[-.13,.287,.35]}><cylinderGeometry args={[.058,.058,.055,20]}/><meshStandardMaterial color={selected===1?'#eac25c':'#689dae'}/></mesh>
      </group>
      <Marker i={1} at={[-.09,.36,.58]} {...{selected,select}}/>
      {['#ca6d55','#579aa7','#d9b26b'].map((color,i)=><Line key={color} points={[
        [[-.55,.27,.29],[-.13,.24,.35],[.37,.25,.38]][i] as Point,[-.20+i*.15,.235,.075],[-.26+i*.14,.325,-.01],
      ]} color={color} lineWidth={2}/>)}
    </group>
    <group position={[2.34,.11,1.42]} rotation={[0,-.22,0]} onClick={()=>select(3)}>
      <Box at={[0,0,0]} size={[.66,.16,1.12]} color={selected===3?'#caaa65':'#262f3b'}/>
      <Box at={[0,.083,0]} size={[.59,.015,1.01]} color="#293d54"/>
      {delivered&&<><Box at={[0,.095,-.10]} size={[.47,.007,.23]} color="#6bb8a6"/>
        {[-.15,-.05].map(z=><Box key={z} at={[0,.101,z]} size={[.33,.006,.022]} color="#d9eeea"/>)}</>}
    </group>
    <Marker i={3} at={[2.36,.36,1.45]} {...{selected,select}}/>
  </>;
}

export default function GpsGsmDemo(){
  const [index,setIndex]=useState(0);
  const [clock,setClock]=useState(0);
  const [fix,setFix]=useState<Fix|null>(null);
  const [online,setOnline]=useState(true);
  const [selected,select]=useState(0);
  const [inbox,setInbox]=useState<Fix|null>(null);
  const [pending,setPending]=useState<Fix|null>(null);
  const [status,setStatus]=useState('Ready · Acquire a fix in the open');
  const fresh=fix!==null&&clock-fix.at<fixLifetime;
  function move(next:number){
    setIndex(next);
    if(next!==2&&fix)setFix({index:next,at:clock});
  }
  useEffect(()=>{
    if(!pending)return;
    const timer=window.setTimeout(()=>{
      if(online){setInbox(pending);setStatus('Modem accepted SMS · Snapshot in inbox');}
      else setStatus('SMS failed · Network unavailable');
      setPending(null);
    },800);
    return ()=>window.clearTimeout(timer);
  },[pending,online]);
  function send(){
    if(pending)return;
    if(!fresh||!fix){setStatus('Send blocked · No fresh GPS fix');return;}
    setPending(fix);setStatus('Submitting location snapshot');
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D GPS and GSM tracker course">
        <Canvas camera={{position:[3.7,5.6,7.8],fov:43}} dpr={[1,1.6]} fallback={<p>Use the checkpoint and fix controls to test the tracker.</p>}>
          <Field {...{index,online,selected,select,send}} delivered={!!inbox} locked={fresh&&index!==2}/>
          <OrbitControls target={[0,.27,.16]} minDistance={4.9} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="GPS tracker readings">
        <div><span>Position</span><strong>{checkpoints[index].name}</strong></div>
        <div><span>Fix</span><strong>{fresh?'Fresh':fix?'Stale':'Unavailable'}</strong></div>
        <div><span>Fix age</span><strong>{fix?`${(clock-fix.at)/1000} s`:'—'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Test the fix before sending</h3>
      <p>Use a simulated position. Acquire a fix in the open, then move under the shelter and advance time. Compare expiry with what happens when the GSM network is off.</p>
      <div className="gp-steps" role="group" aria-label="Simulator checkpoints">
        {checkpoints.map((p,i)=><button type="button" key={p.name} aria-pressed={index===i} onClick={()=>move(i)}>{p.name}</button>)}
      </div>
      <div className="gp-steps">
        <button type="button" disabled={index===2} onClick={()=>{setFix({index,at:clock});setStatus('GPS fix acquired');}}>Acquire GPS fix</button>
        <button type="button" onClick={()=>{const next=clock+15000;setClock(next);if(index!==2&&fix)setFix({index,at:next});}}>Advance 15 s</button>
        <button type="button" aria-pressed={online} onClick={()=>setOnline(value=>!value)}>Simulated 2G</button>
        <button type="button" className="gp-button" disabled={!!pending} onClick={send}>Send snapshot</button>
      </div>
      <p role="status" className="gp-demo-description">{status}</p>
      {inbox&&<p className="gp-demo-description" aria-label="Location message">Atlas test location: {checkpoints[inbox.index].lat}, {checkpoints[inbox.index].lon}</p>}
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
