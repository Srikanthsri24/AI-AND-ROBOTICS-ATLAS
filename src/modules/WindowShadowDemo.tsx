import {useEffect,useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import type {Group} from 'three';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Window and sill',at:[.59,2.55,-.26],detail:'The sill holds the sensor in an illuminated area. Try a gradual daylight change to see the baseline follow it.'},
  {name:'Shadow card',at:[.12,1.92,.54],detail:'The moving card blocks the light quickly. Removing it allows the event detector to rearm.'},
  {name:'Sill photoresistor',at:[.55,1.04,.63],detail:'A0 reads the divider. The sketch compares a new sample with the recent baseline.'},
  {name:'Arduino and event LED',at:[-1.25,.62,1.11],detail:'D8 lights while a shadow is active. Holding one shadow keeps the count at one.'},
];
type Sample={reading:number;baseline:number;active:boolean;events:number};
const initial:Sample={reading:780,baseline:780,active:false,events:0};
function sample(previous:Sample,reading:number):Sample{
  const {baseline,active,events}=previous;
  const drop=baseline-reading;
  const nextActive=active?drop>90:baseline>=260&&drop>=180;
  const nextBaseline=nextActive?baseline:baseline+Math.trunc((reading-baseline)/8);
  if(reading===previous.reading&&nextActive===active&&nextBaseline===baseline)return previous;
  return {reading,active:nextActive,baseline:nextBaseline,events:events+Number(!active&&nextActive)};
}

function Bench({ambient,covered,active,selected,select}:{ambient:number;covered:boolean;active:boolean;selected:number;select:(value:number)=>void}){
  const card=useRef<Group>(null);
  useFrame((_,delta)=>{
    if(card.current)card.current.position.x+=((covered?.54:-.82)-card.current.position.x)*(1-Math.exp(-15*delta));
  });
  const light=.48+ambient/390;
  return <>
    <color attach="background" args={['#304859']}/>
    <hemisphereLight args={['#e4f1ff','#7b6a5d',light]}/>
    <directionalLight position={[-4,6,4]} intensity={light} color="#fff3d9"/>
    <Box at={[0,-.08,0]} size={[4.68,.16,2.83]} color="#677986"/>
    <Box at={[.52,1.36,-.34]} size={[2.59,2.47,.13]} color={selected===0?'#c19a70':'#b7b0a0'}/>
    <group onClick={()=>select(0)}>
      <Box at={[.52,1.60,-.25]} size={[2.24,1.67,.071]} color="#617f90" metal={.37}/>
      <Box at={[.52,1.58,-.204]} size={[.083,1.65,.065]} color="#c5c3ad"/>
      <Box at={[.52,1.59,-.197]} size={[2.20,.074,.075]} color="#c6c0aa"/>
      <Box at={[.52,1.59,-.183]} size={[2.26,1.69,.013]} color="#9bb7c2" metal={.35}/>
      <Box at={[.52,1.59,-.169]} size={[.067,1.62,.022]} color="#d1ccba"/>
      <Box at={[.52,1.59,-.167]} size={[2.20,.061,.023]} color="#ccc6b3"/>
      <Box at={[.51,.72,.17]} size={[2.78,.11,1.08]} color="#ccb196"/>
      {[-.63,1.64].map(x=><Box key={x} at={[x,.31,-.13]} size={[.15,.63,.28]} color="#a18e7b"/>)}
    </group>
    <group position={[-.82,1.23,.48]} ref={card} onClick={()=>select(1)}>
      <Box at={[0,0,0]} size={[.89,.054,.76]} color={selected===1?'#bd895a':'#4a555e'}/>
      <Box at={[-.22,.066,.265]} size={[.065,.12,.07]} color="#9b866e"/>
      <Box at={[-.22,.13,.32]} size={[.068,.077,.22]} color="#a58e76"/>
    </group>
    <group onClick={()=>select(2)}>
      <Box at={[.54,.793,.47]} size={[.28,.051,.21]} color="#ddd7c4"/>
      <mesh position={[.54,.859,.47]}><cylinderGeometry args={[.063,.065,.033,22]}/><meshStandardMaterial color={selected===2?'#ffcc84':'#ba9c77'}/></mesh>
      <Line points={[[.496,.878,.448],[.581,.878,.448],[.581,.878,.47],[.502,.878,.47],[.502,.878,.491],[.581,.878,.491]]} color="#7e543e" lineWidth={2}/>
      {covered&&<mesh position={[.54,.823,.47]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[.64,.357]}/><meshBasicMaterial color="#252d3d" transparent opacity={.32} depthWrite={false}/></mesh>}
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[-1.39,.133,.98]} size={[.86,.078,.52]} color={selected===3?'#c18b5d':'#27758f'}/>
      <Box at={[-1.64,.21,1.07]} size={[.18,.128,.16]} color="#a9b5bd" metal={.69}/>
      <Box at={[-1.29,.197,.98]} size={[.27,.056,.123]} color="#27313b"/>
      {[.80,1.16].map(z=><Box key={z} at={[-1.28,.186,z]} size={[.52,.060,.056]} color="#27313b"/>)}
      <Box at={[-.67,.132,.98]} size={[.49,.093,.48]} color="#ddd8cb"/>
      {[.89,1.05].map(z=><group key={z} position={[-.67,.205,z]}><Box at={[0,0,0]} size={[.33,.02,.021]} color="#a9b5ba" metal={.64}/><Box at={[0,.007,0]} size={[.16,.048,.051]} color="#bea17b"/></group>)}
      <mesh position={[-.48,.278,1.11]}><sphereGeometry args={[.060,18,12]}/><meshStandardMaterial color={active?'#ff7646':'#9d4340'} emissive="#ff6740" emissiveIntensity={active?2.2:0}/></mesh>
      {active&&<pointLight position={[-.48,.34,1.11]} color="#ff7e55" intensity={1.1} distance={.85}/>}
    </group>
    <Line points={[[.53,.81,.56],[.18,.75,.63],[.09,.36,.62],[-.25,.20,.77],[-.54,.226,.91],[-1.22,.214,.79]]} color="#d99b53" lineWidth={3}/>
    <Line points={[[.61,.811,.54],[.31,.794,.57],[.22,.28,.63],[-.35,.192,.72],[-1.43,.20,.80]]} color="#b16052" lineWidth={2}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={i===1?[covered?.54:-.82,1.43,.52]:at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.006,0]} opacity={.33} scale={5} far={1.3} resolution={128} frames={1}/>
  </>;
}

export default function WindowShadowDemo(){
  const [ambient,setAmbient]=useState(780);
  const [covered,setCovered]=useState(false);
  const [mode,setMode]=useState<'pass'|'fade'|null>(null);
  const [values,setValues]=useState(initial);
  const [selected,select]=useState(2);
  useEffect(()=>{
    const timer=window.setInterval(()=>setValues(previous=>sample(previous,covered?Math.max(0,ambient-330):ambient)),50);
    return ()=>window.clearInterval(timer);
  },[ambient,covered]);
  useEffect(()=>{
    if(mode==='pass'){
      const timer=window.setTimeout(()=>{setCovered(false);setMode(null);},750);
      return ()=>window.clearTimeout(timer);
    }
    if(mode==='fade'){
      const timer=window.setInterval(()=>setAmbient(value=>Math.max(400,value-15)),100);
      return ()=>window.clearInterval(timer);
    }
  },[mode]);
  useEffect(()=>{if(mode==='fade'&&ambient===400)setMode(null);},[ambient,mode]);
  function reset(){setMode(null);setCovered(false);setAmbient(780);setValues(initial);}
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D window shadow detector">
        <Canvas camera={{position:[2.82,3.52,6.52],fov:39}} dpr={[1,1.6]} fallback={<p>Compare the detector readings below.</p>}>
          <Bench {...{ambient,covered,active:values.active,selected,select}}/><OrbitControls target={[0,1.07,0]} enablePan={false} minDistance={3.6} maxDistance={9.7}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Window shadow readings">
        <div><span>Current A0</span><strong>{values.reading}</strong></div><div><span>Tracked baseline</span><strong>{values.baseline}</strong></div><div><span>Shadow events</span><strong>{values.events}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Compare a shadow and a gradual fade</h3>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={covered||mode!==null} onClick={()=>{setCovered(true);setMode('pass');}}>Pass the shadow card</button>
        <button type="button" disabled={mode!==null} onClick={()=>setCovered(!covered)}>{covered?'Uncover sill':'Hold card over sill'}</button>
        <button type="button" disabled={covered||mode!==null||ambient<=400} onClick={()=>setMode('fade')}>Fade daylight gradually</button>
        <button type="button" onClick={reset}>Reset detector</button>
      </div>
      <p role="status">{values.active?'Shadow detected · Event LED on.':mode==='fade'?'Daylight fading · Baseline tracking.':'Sill exposed · Event LED off.'}</p>
      <p>A drop of 180 counts triggers an event. The light must recover to within 90 counts of the baseline before the detector can count again.</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
