import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { daytimeBeam, headlightStep, lightLimits } from '../data/smart-headlights';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
const labels=[
  ['Roof light sensor','The ambient divider determines when the controller enters or leaves night mode.'],
  ['Forward glare sensor','A hood shields this sensor from the model’s own headlights. An oncoming light makes the high beam dip.'],
  ['Low and high lamps','Each model LED has its own series resistor. Beam reach changes when the controller switches modes.'],
  ['Oncoming vehicle','As this vehicle approaches, its light raises the forward sensor reading. The high beam waits for clearance before returning.'],
] as const;
function Marker({i,at,selected,select}:{i:number;at:Point;selected:number;select:(i:number)=>void}){
  return <WorldLabel position={at} className="gp-marker-anchor">
    <button type="button" className="gp-marker" aria-pressed={i===selected} aria-label={labels[i][0]} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{labels[i][0]}</span>}</button>
  </WorldLabel>;
}
function Wheels(){
  return <>{[-.41,.41].map(x=>[-.32,.32].map(z=><group key={x+':'+z} position={[x,.12,z]}>
    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.123,.123,.08,26]}/><meshStandardMaterial color="#20272d" roughness={.88}/></mesh>
    <mesh position={[0,0,Math.sign(z)*.045]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.075,.075,.019,20]}/><meshStandardMaterial color="#9b9e9f" metalness={.55}/></mesh>
  </group>))}</>;
}
function Car({color}:{color:string}){
  return <>
    <Box at={[0,.18,0]} size={[1.27,.22,.64]} color={color} metal={.31}/>
    <Box at={[-.15,.33,0]} size={[.63,.18,.54]} color="#324752" metal={.24}/>
    <Box at={[-.17,.442,0]} size={[.54,.062,.51]} color={color} metal={.37}/>
    <Box at={[.65,.145,0]} size={[.10,.089,.60]} color="#a0a4a3" metal={.50}/>
    <Wheels/>
  </>;
}
function Road({mode,selected,select,dark,pass,front}:{mode:'Off'|'Low'|'High';selected:number;select:(i:number)=>void;dark:boolean;pass:number|null;front:number}){
  const carX=pass===null?2.15:2.18-3.46*pass, width=mode==='High'?.77:.56;
  const length=mode==='High'?2.80:1.46;
  return <>
    <color attach="background" args={[dark?'#1b2942':'#496478']}/>
    <hemisphereLight args={['#dceaff','#64554d',dark?1.45:2.45]}/>
    <directionalLight position={[-4,7,5]} intensity={dark?1.65:2.39}/>
    <Box at={[0,-.13,0]} size={[6.51,.24,3.76]} color="#65766d"/>
    <Box at={[0,.011,.02]} size={[6.37,.035,2.29]} color="#3d4854"/>
    {[-1.06,1.06].map(z=><Box key={z} at={[0,.032,z]} size={[6.08,.011,.033]} color="#abb6b7"/>)}
    {Array.from({length:10},(_,i)=><Box key={i} at={[i*.602-2.7,.033,.0]} size={[.31,.010,.035]} color="#d1af68"/>)}
    <group position={[-1.65,.042,.51]}>
      <Car color="#527998"/>
      <group onClick={()=>select(0)}><Box at={[-.21,.475,0]} size={[.13,.068,.13]} color={selected===0?'#e3bd72':'#c5a173'}/></group>
      <Marker i={0} at={[-.26,.69,-.08]} {...{selected,select}}/>
      <group onClick={()=>select(1)}>
        <Box at={[.43,.322,0]} size={[.17,.112,.13]} color={selected===1?'#d6b46d':'#242f38'}/>
        <Box at={[.521,.322,.0]} size={[.015,.064,.068]} color={front>=lightLimits.glare?'#deb379':'#605c58'}/>
      </group>
      <Marker i={1} at={[.49,.50,-.25]} {...{selected,select}}/>
      {[-.217,.217].map(z=><group key={z} onClick={()=>select(2)}>
        <mesh position={[.647,.234,z]}><sphereGeometry args={[.059,20,16]}/><meshStandardMaterial color={selected===2?'#f5d78d':'#d1d7d4'} emissive="#fff0b6" emissiveIntensity={mode==='Off'?0:mode==='Low'?1.9:4}/></mesh>
        {mode!=='Off'&&<mesh position={[.66+length/2,.011,z]} rotation={[0,0,-Math.PI/2]}>
          <cylinderGeometry args={[width*.55,.08,length,28,1,true]}/>
          <meshBasicMaterial color={mode==='High'?'#fff0bc':'#e8dba5'} transparent opacity={mode==='High'?.15:.12} depthWrite={false}/>
        </mesh>}
      </group>)}
      {mode!=='Off'&&<pointLight position={[.82,.20,0]} color="#ffdf9d" distance={length+1} intensity={mode==='High'?5.7:2.1}/>}
      <Marker i={2} at={[.70,.36,.41]} {...{selected,select}}/>
    </group>
    <group position={[carX,.043,-.51]} rotation={[0,Math.PI,0]} onClick={()=>select(3)}>
      <Car color={selected===3?'#ae815b':'#798078'}/>
      {[-.217,.217].map(z=><mesh key={z} position={[.647,.232,z]}><sphereGeometry args={[.054,18,15]}/><meshStandardMaterial color="#d1d7d4" emissive="#ffe2ad" emissiveIntensity={pass!==null?2.8:.15}/></mesh>)}
      {pass!==null&&<pointLight position={[.81,.21,0]} color="#ffe09a" intensity={4} distance={3}/>}
      <Marker i={3} at={[.04,.65,.08]} {...{selected,select}}/>
    </group>
    <group position={[-1.85,.08,1.42]} scale={1.23}><Uno at={[0,0,0]}/></group>
    <Line points={[[-1.27,.11,1.28],[-1.02,.12,.95],[-1.45,.22,.72]]} color="#d79662" lineWidth={2.6}/>
  </>;
}

export default function SmartHeadlightsDemo(){
  const [ambient,setAmbient]=useState(740);
  const [extra,setExtra]=useState(140);
  const [manual,setManual]=useState(false);
  const [pass,setPass]=useState<number|null>(null);
  const [selected,select]=useState(0);
  const [beam,setBeam]=useState(daytimeBeam);
  const front=pass===null?extra:Math.max(extra,Math.round(190+720*Math.sin(pass*Math.PI)));
  useEffect(()=>{
    if(pass===null)return;
    const timer=window.setTimeout(()=>setPass(pass>=1?null:Math.min(1,pass+.028)),55);
    return ()=>window.clearTimeout(timer);
  },[pass]);
  useEffect(()=>{
    setBeam(previous=>headlightStep(previous,ambient,front,manual,0));
    const timer=window.setInterval(()=>setBeam(previous=>{
      const next=headlightStep(previous,ambient,front,manual,50);
      return next.dark===previous.dark&&next.glare===previous.glare&&next.elapsed===previous.elapsed&&next.mode===previous.mode?previous:next;
    }),50);
    return ()=>window.clearInterval(timer);
  },[ambient,front,manual]);
  const status=manual?'Manual override · Low beam':beam.mode==='Off'?'Daylight · Beams off':beam.glare?'Oncoming glare · Low beam':beam.mode==='Low'?'Clearance delay · Low beam':'Dark and clear · High beam';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D automatic headlight road">
        <Canvas camera={{position:[3.65,5.9,6.8],fov:42}} dpr={[1,1.6]} fallback={<p>Follow the beam readout while changing the light inputs.</p>}>
          <Road mode={beam.mode} dark={beam.dark} {...{selected,select,pass,front}}/>
          <OrbitControls target={[0,.27,.10]} minDistance={4.6} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Headlight readings">
        <div><span>Ambient</span><strong>{ambient} counts</strong></div>
        <div><span>Forward</span><strong>{front} counts</strong></div>
        <div><span>Beam</span><strong>{beam.mode}</strong></div>
        <div><span>Clear time</span><strong>{beam.elapsed} ms</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Test dusk, glare and recovery</h3>
      <p>Switch to dusk and wait for high beam. Pass an oncoming car to see it dip, then watch the delay as the road clears.</p>
      <div className="gp-steps">
        <button type="button" onClick={()=>setAmbient(740)}>Daylight</button>
        <button type="button" onClick={()=>setAmbient(220)}>Dusk</button>
        <button type="button" className="gp-button" disabled={pass!==null} onClick={()=>setPass(0)}>Pass oncoming car</button>
        <button type="button" aria-pressed={manual} onClick={()=>setManual(!manual)}>Manual low beam</button>
      </div>
      <label className="gp-solar-light">Ambient light · {ambient} <input type="range" min="0" max="1023" value={ambient} onChange={event=>setAmbient(Number(event.target.value))}/></label>
      <label className="gp-solar-light">Forward light · {extra} <input type="range" min="0" max="1023" value={extra} onChange={event=>setExtra(Number(event.target.value))}/></label>
      <p role="status" className="gp-demo-description">{status}</p>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
