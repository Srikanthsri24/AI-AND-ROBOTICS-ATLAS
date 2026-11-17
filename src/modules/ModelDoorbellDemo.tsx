import {useEffect,useRef,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {DoorbellPanel} from './DoorbellPanelPart';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const parts:{name:string;at:Point;detail:string}[]=[
  {name:'Doorbell switch · D2',at:[.47,.74,.39],detail:'One stable press pulls D2 low and starts a chime when the controller is idle.'},
  {name:'Piezo sounder · D9',at:[.36,1.56,.21],detail:'The passive piezo plays 880 Hz, pauses for 90 ms, and plays 660 Hz. D9 feeds it through 220 Ω.'},
  {name:'Chime indicator · D8',at:[.96,.98,.24],detail:'The LED stays on throughout the whole sequence, including the silent gap.'},
  {name:'Arduino and wiring',at:[1.20,.38,1.06],detail:'The Uno debounces the switch and times the notes. Holding the switch does not create another press.'},
];
const phases=['Ready','High note · 880 Hz','Silent gap','Low note · 660 Hz'] as const;

function Bench({phase,held,selected,select,press}:{phase:number;held:boolean;selected:number;select:(i:number)=>void;press:()=>void}){
  const active=phase!==0;
  const sounding=phase===1||phase===3;
  return <>
    <color attach="background" args={['#405260']}/>
    <hemisphereLight args={['#eff5ff','#9a7e66',2.04]}/><directionalLight position={[-3,6,4]} color="#fff1dc" intensity={2.13}/>
    <Box at={[0,-.094,0]} size={[4.76,.19,3.06]} color="#818f8a"/>
    <group position={[-.23,.005,.03]} scale={[1.20,1,1]}><DoorbellPanel/></group>
    <Box at={[-.52,.11,.63]} size={[1.34,.07,.44]} color="#827569"/>
    {Array.from({length:11},(_,i)=><Box key={i} at={[-1.12+i*.12,.15,.63]} size={[.031,.012,.38]} color="#a69a86"/>)}
    <group onClick={press}>
      <Box at={[.442,.70,-.017]} size={[.155,.147,.079]} color={selected===0?'#dbac78':'#33434c'}/>
      <mesh position={[.442,.70,held?.039:.077]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.051,.055,.07,24]}/><meshPhysicalMaterial color="#c17d53" roughness={.39}/></mesh>
    </group>
    <group onClick={()=>select(1)}>
      <mesh position={[.39,1.36,-.014]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.108,.108,.082,30]}/><meshStandardMaterial color={selected===1?'#d4a973':'#273742'}/></mesh>
      <mesh position={[.39,1.36,.032]}><circleGeometry args={[.057,27]}/><meshStandardMaterial color={sounding?'#ffca83':'#66534b'} emissive="#ffab58" emissiveIntensity={sounding?.85:0}/></mesh>
      {sounding&&[.14,.21,.28].map(radius=><mesh key={radius} position={[.39,1.36,.071+radius*.8]}><torusGeometry args={[radius,.006,8,36]}/><meshBasicMaterial color="#ffcb79" transparent opacity={.65-radius}/></mesh>)}
    </group>
    <group onClick={()=>select(2)}>
      <Box at={[.75,1.02,-.037]} size={[.16,.16,.061]} color={selected===2?'#dcac76':'#36454d'}/>
      <mesh position={[.75,1.02,.036]}><sphereGeometry args={[.057,23,16]}/><meshStandardMaterial color={active?'#ffbd59':'#8f633c'} emissive="#ffa643" emissiveIntensity={active?2.75:0}/></mesh>
      {active&&<pointLight position={[.75,1.03,.11]} color="#ffb65d" intensity={1.25} distance={.79}/>}
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[1.21,.121,.95]} size={[.98,.09,.50]} color={selected===3?'#73a7a5':'#28808b'}/>
      <Box at={[.83,.19,1.011]} size={[.17,.108,.151]} color="#c1cad0" metal={.63}/>
      <Box at={[1.33,.182,.96]} size={[.24,.06,.112]} color="#27353d"/>
      {[.77,1.15].map(z=><Box key={z} at={[1.25,.176,z]} size={[.64,.053,.045]} color="#26343a"/>)}
    </group>
    {[[.44,.71,'#d98664'],[.39,1.36,'#e0b672'],[.76,1.02,'#76bdcc']].map(([x,y,color],i)=><Line key={String(color)} points={[[Number(x)+.09,Number(y)-.034,.027],[.89+i*.036,Number(y)-.10,-.03],[.90+i*.049,.224,.48],[.99+i*.17,.189,.78]]} color={String(color)} lineWidth={2.6}/>)}
    {parts.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.34} scale={5.1} far={1.8} resolution={128} frames={1}/>
  </>;
}

export default function ModelDoorbellDemo(){
  const [phase,setPhase]=useState(0);
  const [held,setHeld]=useState(false);
  const [muted,setMuted]=useState(false);
  const [selected,select]=useState(0);
  const [count,setCount]=useState(0);
  const audio=useRef<HTMLAudioElement>(null);
  const timers=useRef<number[]>([]);
  useEffect(()=>()=>timers.current.forEach(window.clearTimeout),[]);
  function press(){
    select(0);
    setHeld(!held);
    if(held||phase!==0)return;
    setCount(previous=>previous+1);
    setPhase(1);
    audio.current?.play().catch(()=>{});
    timers.current=[[180,2],[270,3],[570,0]].map(([delay,next])=>window.setTimeout(()=>setPhase(next),delay));
  }

  return <div className="gp-split gp-demo">
    <audio ref={audio} src="./audio/doorbell/two-note-chime.wav" muted={muted} preload="auto"/>
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D model doorbell panel">
        <Canvas camera={{position:[2.0,3.11,6.31],fov:40}} dpr={[1,1.6]} fallback={<p>Use the controls and phase readouts below.</p>}><Bench {...{phase,held,selected,select,press}}/><OrbitControls target={[0,.68,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Doorbell readings">
        <div><span>Button</span><strong>{held?'Held':'Released'}</strong></div><div><span>Indicator</span><strong>{phase!==0?'On':'Off'}</strong></div><div><span>Sequences started</span><strong>{count}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Play the chime once per press</h3>
      <p>The LED stays on through both notes and the pause. Leave the button held when the sound finishes to see that it does not repeat.</p>
      <div className="gp-steps">
        <button className="gp-button" type="button" onClick={press}>{held?'Release doorbell':'Press doorbell'}</button>
        <button className="gp-button gp-secondary" type="button" onClick={()=>setMuted(!muted)}>{muted?'Unmute chime':'Mute chime'}</button>
      </div>
      <p role="status">{phases[phase]}</p>
      <ol className="gp-demo-labels">{parts.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{parts[selected].detail}</p>
    </div>
  </div>;
}
