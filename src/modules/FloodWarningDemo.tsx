import { useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { CatmullRomCurve3, Vector3 } from 'three';
import { floodLimits, floodState, floodWarning, type FloodState } from '../data/flood-warning';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];

function Block({at,size,color,metalness=0}: {at:Point;size:Point;color:string;metalness?:number}) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.14} smoothness={2}>
    <meshStandardMaterial color={color} roughness={metalness>.4?.34:.68} metalness={metalness}/>
  </RoundedBox>;
}

export function FloodPiezo() {
  return <>
    <mesh><cylinderGeometry args={[.20,.20,.15,36]}/><meshStandardMaterial color="#242a2e" roughness={.74}/></mesh>
    <mesh position={[0,.077,0]}><cylinderGeometry args={[.033,.033,.004,20]}/><meshStandardMaterial color="#11181a"/></mesh>
    {[-.079,.079].map(x=><Block key={x} at={[x,-.135,0]} size={[.029,.15,.027]} color="#a1a8ac" metalness={.65}/>)}
  </>;
}

const lamps=[{color:'#49e597',name:'Normal'},{color:'#ffb43c',name:'Watch'},{color:'#ff4b4b',name:'Warning'}] as const;
export function FloodSignalLights({state='Normal',flashing=true}: {state?:FloodState;flashing?:boolean}) {
  return <>
    <Block at={[0,0,0]} size={[.91,.07,.32]} color="#d1d7cf"/>
    {lamps.map(({color,name},index)=>{
      const lit=state===name||(index===1&&state==='Sensor unavailable'&&flashing);
      return <group key={name} position={[(index-1)*.27,.034,0]}>
        {[-.028,.028].map(x=><Block key={x} at={[x,.064,0]} size={[.012,.13,.014]} color="#b5bec1" metalness={.65}/>)}
        <mesh position={[0,.152,0]}><cylinderGeometry args={[.069,.069,.10,24]}/>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={lit?1.7:0} roughness={.28}/></mesh>
        <mesh position={[0,.202,0]}><sphereGeometry args={[.069,24,12,0,Math.PI*2,0,Math.PI/2]}/>
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={lit?2:0} roughness={.23}/></mesh>
      </group>;
    })}
  </>;
}

function SonarBoard() {
  return <>
    <Block at={[0,0,0]} size={[.64,.044,.30]} color="#1d6299"/>
    {[-.17,.17].map(x=><group key={x} position={[x,-.06,0]}>
      <mesh><cylinderGeometry args={[.101,.101,.11,32]}/><meshStandardMaterial color="#aab4ba" metalness={.72} roughness={.32}/></mesh>
      <mesh position={[0,-.056,0]}><cylinderGeometry args={[.079,.079,.009,28]}/><meshStandardMaterial color="#40474c" roughness={.83}/></mesh>
    </group>)}
    <Block at={[0,.025,-.083]} size={[.145,.036,.056]} color="#242b31"/>
  </>;
}

export function FloodBasin({demo=false}: {demo?:boolean}) {
  const width=demo?2.24:2.35;
  const length=demo?4.75:1.7;
  const height=demo?.72:.57;
  return <>
    <Block at={[0,.03,0]} size={[width,.06,length]} color="#657f7d"/>
    {[-1,1].map(side=><group key={side}>
      <mesh position={[side*width/2,height/2,0]}><boxGeometry args={[.045,height,length]}/>
        <meshStandardMaterial color="#ade2df" opacity={.24} transparent depthWrite={false}/></mesh>
      <mesh position={[0,height/2,side*length/2]}><boxGeometry args={[width,height,.045]}/>
        <meshStandardMaterial color="#ade2df" opacity={.20} transparent depthWrite={false}/></mesh>
      <Block at={[side*width/2,height,0]} size={[.07,.047,length+.07]} color="#81adae"/>
      <Block at={[0,height,side*length/2]} size={[width,.047,.075]} color="#81adae"/>
    </group>)}
    {!demo&&<>
      <Block at={[1.43,.76,.04]} size={[.10,1.52,.12]} color="#576879" metalness={.54}/>
      <Block at={[.83,1.48,.04]} size={[1.22,.088,.11]} color="#66798a" metalness={.54}/>
    </>}
  </>;
}

function House({at,roof}:{at:Point;roof:string}) {
  return <group position={at}>
    <Block at={[0,.24,0]} size={[.57,.47,.48]} color="#e4d5bc"/>
    <mesh position={[0,.55,0]} rotation={[0,Math.PI/4,0]}>
      <coneGeometry args={[.44,.32,4]}/><meshStandardMaterial color={roof} roughness={.8}/>
    </mesh>
    <Block at={[0,.138,.244]} size={[.11,.26,.018]} color="#765f52"/>
    {[-.17,.17].map(x=><Block key={x} at={[x,.30,.247]} size={[.095,.095,.019]} color="#60909f"/>)}
  </group>;
}

const routePoints:Point[]=[[1.49,.52,1.32],[1.83,.53,.95],[2.13,.61,.48],[2.36,.84,.16],[2.54,1.045,-.21],[2.83,1.04,-1.36]];
const route=new CatmullRomCurve3(routePoints.map(point=>new Vector3(...point)));
const routeLine=route.getPoints(30).map(point=>point.toArray() as Point);
const anchorPoints:Point[]=[[-2.59,.78,.56],[0,1.58,.48],[-2.63,.88,-.10],[-2.08,.74,-.68],[-2.58,.72,-.18],[.95,.57,-1.49]];
const markerPoints:Point[]=[[-2.88,1.43,.87],[-.22,2.17,.53],[-2.80,1.43,-.07],[-2.09,1.36,-.85],[-3.03,1.43,-.53],[.82,1.26,-1.51]];
const stateColor:Record<FloodState,string>={Normal:'#77ecbb',Watch:'#ffca67',Warning:'#ff8c7d','Sensor unavailable':'#ffca67'};

function FloodScene({depth,state,blink,progress,selected,onSelect}:{
  depth:number;state:FloodState;blink:boolean;progress:number|null;selected:number;onSelect:(index:number)=>void;
}) {
  const waterY=.06+depth*.065;
  const drill=progress===null?null:route.getPointAt(progress);
  const labelIndices=Array.from(new Set([1,2,selected]));
  return <>
    <Block at={[0,-.13,0]} size={[8.7,.23,5.95]} color="#354955"/>
    <FloodBasin demo/>
    {depth>0&&<mesh position={[0,waterY,.0]} rotation={[-Math.PI/2,0,0]}>
      <planeGeometry args={[2.18,4.68]}/>
      <meshPhysicalMaterial color="#2786a7" emissive="#183c52" emissiveIntensity={.38} opacity={.75} transparent
        roughness={.25} metalness={.34} clearcoat={.72} depthWrite={false}/>
    </mesh>}
    {depth>0&&[-1.8,-1.04,-.24,.83,1.77].map((z,i)=><Line key={z}
      points={Array.from({length:13},(_,j)=>[-1.02+j*.17,waterY+.007,z+Math.sin(j*.51+i)*.048] as Point)}
      color="#8ce1e4" transparent opacity={.46} lineWidth={1.1}/>)}
    <Block at={[-2.57,.23,0]} size={[2.72,.47,4.74]} color="#6a796f"/>
    <Block at={[2.49,.22,.10]} size={[2.63,.48,4.76]} color="#718861"/>
    <Block at={[2.80,.61,-1.01]} size={[1.90,.76,1.84]} color="#76865c"/>
    <mesh position={[2.34,.69,.27]} rotation={[.53,0,-.19]}><boxGeometry args={[.52,.09,1.33]}/><meshStandardMaterial color="#a9a888"/></mesh>
    <Block at={[0,.48,.99]} size={[2.55,.09,.54]} color={state==='Warning'?'#75888b':'#bdc0ac'}/>
    {[-.19,.19].map(offset=><Line key={offset} points={[[-1.23,.532,.99+offset],[1.23,.532,.99+offset]]}
      color={state==='Warning'?'#fa856a':'#e2d2ad'} transparent opacity={state==='Warning'?.62:.98} lineWidth={1.7}/>)}
    <House at={[2.52,.46,1.49]} roof="#b6694b"/>
    <House at={[3.31,.46,.83]} roof="#596b6e"/>
    <House at={[2.88,1.00,-1.43]} roof="#356d77"/>
    <Block at={[-2.61,.64,.22]} size={[1.69,.33,1.35]} color="#3b505c"/>
    <Block at={[-2.71,.835,.63]} size={[.72,.101,.38]} color="#26699c"/>
    <Block at={[-2.89,.899,.62]} size={[.12,.044,.14]} color="#242c31"/>
    <Block at={[-2.42,.881,.62]} size={[.133,.065,.18]} color="#a9b8bb" metalness={.65}/>
    <group position={[-2.64,.835,-.09]}><FloodSignalLights state={state} flashing={blink}/></group>
    <group position={[-2.08,.875,-.43]}><FloodPiezo/></group>
    <Line points={[[-2.4,.91,.62],[-2.1,.87,.49],[-2.20,.94,-.12]]} color="#ed796b" lineWidth={2}/>
    <Line points={[[-2.7,.90,.66],[-2.88,.92,.32],[-2.82,.90,-.08]]} color="#e9ca70" lineWidth={2}/>
    <Block at={[-1.42,.97,.48]} size={[.105,1.02,.135]} color="#778d9a" metalness={.56}/>
    <Block at={[-.71,1.55,.48]} size={[1.49,.075,.125]} color="#889aa4" metalness={.56}/>
    <group position={[0,1.49,.48]}><SonarBoard/></group>
    {state!=='Sensor unavailable'&&<Line points={[[0,1.37,.48],[0,waterY,.48]]}
      dashed dashSize={.10} gapSize={.065} color="#a9fff0" lineWidth={2}/>}
    {state==='Warning'&&<>
      <Line points={routeLine} color="#fff19b" lineWidth={3} dashed dashSize={.13} gapSize={.06}/>
      {drill&&<mesh position={[drill.x,drill.y+.085,drill.z]}>
        <sphereGeometry args={[.080,20,12]}/><meshStandardMaterial color="#ffda80" emissive="#ffbe58" emissiveIntensity={.85}/>
      </mesh>}
    </>}
    {labelIndices.map(index=><group key={index}>
      <Line points={[anchorPoints[index],markerPoints[index]]} color={selected===index?'#ffe08b':'#bdd5dc'} lineWidth={1.4}/>
      <WorldLabel position={markerPoints[index]} className="gp-marker-anchor">
        <button type="button" className="gp-marker" aria-label={floodWarning.parts[index][0]}
          aria-pressed={index===selected} onClick={()=>onSelect(index)}>{index+1}</button>
      </WorldLabel>
    </group>)}
    <WorldLabel position={[2.90,1.97,-1.43]} className="gp-marker-anchor"><span className="gp-rocket-field-label">High-ground shelter</span></WorldLabel>
    <WorldLabel position={[.12,.78,1.11]} className="gp-marker-anchor">
      <span className="gp-rocket-field-label">{state==='Warning'?'Low crossing closed':'Low crossing'}</span>
    </WorldLabel>
    <ContactShadows position={[0,-.006,0]} opacity={.36} scale={9} blur={2.3} far={4}/>
  </>;
}

export default function FloodWarningDemo() {
  const [depth,setDepth]=useState(2);
  const [fault,setFault]=useState(false);
  const [blink,setBlink]=useState(true);
  const [selected,setSelected]=useState(1);
  const [sound,setSound]=useState(false);
  const [progress,setProgress]=useState<number|null>(null);
  const audio=useRef<AudioContext|null>(null);
  const state=floodState(fault?null:depth);
  useEffect(()=>{
    if(state!=='Sensor unavailable') return;
    const timer=window.setInterval(()=>setBlink(previous=>!previous),400);
    return ()=>window.clearInterval(timer);
  },[state]);
  useEffect(()=>{
    const context=audio.current;
    if(!sound||state!=='Warning'||!context) return;
    function pulse() {
      if(context?.state!=='running') return;
      const oscillator=context.createOscillator();
      const gain=context.createGain();
      oscillator.frequency.value=1800;
      gain.gain.value=.032;
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime+.15);
      oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
    }
    pulse();
    const timer=window.setInterval(pulse,800);
    return ()=>window.clearInterval(timer);
  },[sound,state]);
  useEffect(()=>()=>{if(audio.current)void audio.current.close();},[]);
  const running=state==='Warning'&&progress!==null&&progress<1;
  useEffect(()=>{
    if(!running) return;
    const timer=window.setInterval(()=>setProgress(value=>value===null?null:Math.min(1,value+.025)),70);
    return ()=>window.clearInterval(timer);
  },[running]);
  function setLevel(value:number) {
    setDepth(value);
    if(value<floodLimits.warningCm) setProgress(null);
  }
  async function toggleSound() {
    if(sound) {setSound(false);return;}
    try {
      audio.current??=new AudioContext();
      await audio.current.resume();
      setSound(true);
    } catch {
      setSound(false);
    }
  }
  const description={
    Normal:'Green indicator · below the watch level.',
    Watch:'Amber indicator · check the rising water.',
    Warning:'Red indicator · warning tone pulses. The model low crossing is closed.',
    'Sensor unavailable':'Amber blinks · depth reading unavailable.',
  }[state];
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive flood warning neighborhood">
        <Canvas dpr={[1,1.5]} camera={{position:[5.9,6.5,8.8],fov:43}} fallback={<p>The controls and alarm readings are available without the 3D neighborhood.</p>}>
          <color attach="background" args={['#233440']}/>
          <ambientLight intensity={1.26}/>
          <directionalLight position={[2,7,4]} intensity={2.36}/>
          <FloodScene depth={depth} state={state} blink={blink} progress={progress} selected={selected} onSelect={setSelected}/>
          <OrbitControls target={[0,.53,0]} minDistance={5} maxDistance={16} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Simulated flood station measurements">
        <div><span>Measured depth</span><strong>{fault?'Unavailable':`${depth.toFixed(1)} cm`}</strong></div>
        <div><span>Air gap</span><strong>{fault?'No echo':`${(floodLimits.emptyMm/10-depth).toFixed(1)} cm`}</strong></div>
        <div><span>Station state</span><strong style={{color:'#243443',borderLeft:`4px solid ${stateColor[state]}`,paddingInlineStart:'.43em'}}>{state}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Raise the water</h3>
      <p>Watch begins at 5 cm. Warning begins at 8 cm. The route exercise is for this model neighborhood.</p>
      <label htmlFor="gp-flood-depth">Model water depth · {depth.toFixed(1)} cm</label>
      <input className="gp-lidar-range" id="gp-flood-depth" type="range" value={depth} min={0} max={floodLimits.maxCm} step={.5}
        onChange={event=>setLevel(Number(event.target.value))}/>
      <div className="gp-steps" role="group" aria-label="Depth checkpoints">
        {[2,5,8,10].map(level=><button type="button" key={level} aria-pressed={depth===level} onClick={()=>setLevel(level)}>{level} cm</button>)}
      </div>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={state!=='Warning'||running} onClick={()=>setProgress(0)}>
          {running?'Drill in progress':progress===1?'Replay response drill':'Run response drill'}
        </button>
        <button type="button" aria-pressed={fault} onClick={()=>{setFault(value=>!value);setProgress(null);}}>{fault?'Restore sensor':'Simulate missing echo'}</button>
        <button type="button" aria-pressed={sound} onClick={()=>void toggleSound()}>{sound?'Mute warning sound':'Enable warning sound'}</button>
      </div>
      <p className="gp-check" role="status">{state} · {description}{progress===1?' Drill complete · marker reached the shelter.':''}</p>
      <h4>Inspect the station</h4>
      <ol className="gp-demo-labels">{floodWarning.parts.map(([name],index)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={index===selected} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{floodWarning.parts[selected][2]}</p>
    </div>
  </div>;
}
