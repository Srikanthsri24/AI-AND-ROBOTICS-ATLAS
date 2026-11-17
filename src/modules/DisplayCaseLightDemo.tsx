import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {Vector2} from 'three';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

const parts=[
  ['Ambient sensor',[-1.65,.62,.51],'A0 reads room light from outside the cover. The baffle prevents the exhibit lamp from shining on it.'],
  ['PWM exhibit lamp',[.55,2.30,.40],'D9 sends pulses to the LED through its 220 Ω resistor. More on-time means a brighter lamp.'],
  ['Exhibit plinth',[.81,.69,.66],'The plinth holds the exhibit in the downward light. Compare what you can see in the dusk and dark trials.'],
  ['Arduino and divider',[-.79,.51,1.09],'The Uno switches on at 37% or below and off at 47% or above. While lit, its duty changes with ambient light.'],
] as const;

function Exhibit({ambient,duty,selected,select}:{ambient:number;duty:number;selected:number;select:(i:number)=>void}){
  const light=.32+ambient*.024;
  return <>
    <color attach="background" args={[ambient<37?'#1d2940':'#3e5267']}/>
    <hemisphereLight args={['#e4efff','#736553',light]}/>
    <directionalLight position={[-3,6,4]} intensity={light} color="#fff0d4"/>
    <Box at={[0,.015,0]} size={[4.65,.19,2.79]} color="#526174"/>
    <Box at={[.53,.22,-.14]} size={[2.47,.22,1.77]} color="#383e45"/>
    <Box at={[.53,1.16,-.99]} size={[2.4,1.76,.06]} color="#786b59"/>
    {[-.67,1.73].flatMap(x=>[-.96,.68].map(z=><Box key={x+':'+z} at={[x,1.18,z]} size={[.048,1.77,.045]} color="#8a969c" metal={.65}/>))}
    {[-.96,.68].map(z=><Box key={z} at={[.53,2.06,z]} size={[2.43,.052,.055]} color="#94a1a6" metal={.64}/>)}
    <Box at={[.53,2.07,-.14]} size={[2.42,.064,1.68]} color="#65757d" metal={.51}/>
    <mesh position={[1.725,1.17,-.14]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[1.63,1.73]}/><meshStandardMaterial color="#9ccdc9" side={2} transparent opacity={.18} depthWrite={false}/></mesh>
    <mesh position={[.53,1.17,.686]}><planeGeometry args={[2.38,1.73]}/><meshStandardMaterial color="#adcdd4" side={2} transparent opacity={.085} depthWrite={false}/></mesh>
    <group onClick={()=>select(1)}>
      <Box at={[.52,2.002,.31]} size={[.76,.083,.23]} color={selected===1?'#baa277':'#a4abad'} metal={.59}/>
      <mesh position={[.52,1.951,.31]}><boxGeometry args={[.66,.025,.165]}/><meshStandardMaterial color="#e4dfc9" emissive="#ffcb85" emissiveIntensity={duty/78}/></mesh>
      {duty>0&&<pointLight position={[.52,1.83,.36]} color="#ffd39a" intensity={duty*.040} distance={2.8}/>}
      <Line points={[[.15,2.00,.32],[-.63,1.96,.27],[-.68,.37,.28],[-.68,.23,.92]]} color="#6e91b8" lineWidth={2}/>
    </group>
    <group onClick={()=>select(2)}>
      <Box at={[.59,.42,.05]} size={[1.2,.19,.91]} color={selected===2?'#c18f62':'#515c64'}/>
      <mesh position={[.57,.84,.04]}><latheGeometry args={[potteryProfile,48]}/><meshStandardMaterial color="#b27452" roughness={.57}/></mesh>
      <mesh position={[.57,.849,.04]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.317,.012,12,40]}/><meshStandardMaterial color="#d19b74"/></mesh>
      <mesh position={[.57,.811,.04]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.315,.012,12,40]}/><meshStandardMaterial color="#d19b74"/></mesh>
      <Box at={[.58,.371,.49]} size={[.40,.057,.024]} color="#aeb2a9"/>
    </group>
    <group onClick={()=>select(0)}>
      <Box at={[-1.63,.185,.35]} size={[.39,.13,.43]} color="#dbd7ca"/>
      <Box at={[-1.38,.298,.35]} size={[.062,.35,.43]} color="#596d70"/>
      <mesh position={[-1.64,.28,.35]}><cylinderGeometry args={[.074,.074,.043,24]}/><meshStandardMaterial color={selected===0?'#efc176':'#c3a97f'}/></mesh>
      <Line points={[[-1.69,.306,.32],[-1.59,.306,.32],[-1.59,.306,.347],[-1.69,.306,.347],[-1.69,.306,.375],[-1.59,.306,.375]]} color="#86503c" lineWidth={2}/>
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[-1.19,.166,1.04]} size={[.84,.078,.48]} color={selected===3?'#ba8755':'#24778c'}/>
      <Box at={[-1.44,.232,1.11]} size={[.166,.115,.14]} color="#bec6c9" metal={.71}/>
      <Box at={[-1.09,.221,1.04]} size={[.24,.052,.124]} color="#26313a"/>
      {[.87,1.20].map(z=><Box key={z} at={[-1.10,.219,z]} size={[.52,.052,.062]} color="#28333a"/>)}
      <Box at={[-.63,.16,1.04]} size={[.34,.085,.40]} color="#ddd9ce"/>
      {[.96,1.12].map(z=><group key={z} position={[-.63,.236,z]}><Box at={[0,0,0]} size={[.28,.02,.022]} color="#adb5bb" metal={.67}/><Box at={[0,.003,0]} size={[.14,.053,.051]} color="#bba27a"/></group>)}
    </group>
    <Line points={[[-1.61,.24,.50],[-1.57,.25,.69],[-1.28,.243,.78],[-1.05,.236,.87]]} color="#c08051" lineWidth={3}/>
    <Line points={[[-1.69,.24,.46],[-1.84,.25,.70],[-1.64,.25,.81],[-1.41,.241,.86]]} color="#a25751" lineWidth={2}/>
    <Line points={[[.50,2.00,.27],[1.65,1.95,.28],[1.63,.25,.36],[.38,.20,1.15],[-1.10,.23,1.2]]} color="#34404c" lineWidth={2}/>
    {parts.map(([name,at],i)=><WorldLabel key={name} position={[...at]} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.116,0]} opacity={.3} scale={5} far={1.3} resolution={128} frames={1}/>
  </>;
}

const potteryProfile=[
  [.13,-.32],[.20,-.31],[.27,-.22],[.31,-.11],[.32,.01],[.30,.13],[.23,.23],[.16,.30],[.13,.37],[.16,.39],[.16,.42],[.11,.42],[.10,.38],
].map(([radius,height])=>new Vector2(radius,height));

export default function DisplayCaseLightDemo(){
  const [{ambient,lit},setRoom]=useState({ambient:76,lit:false});
  const [selected,select]=useState(1);
  const duty=lit?220-Math.floor(Math.min(ambient,37)*140/37):0;
  function adjust(ambient:number){setRoom(previous=>({ambient,lit:ambient<=37||(ambient<47&&previous.lit)}));}
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D display case light">
        <Canvas camera={{position:[2.2,3.36,6.2],fov:40}} dpr={[1,1.6]} fallback={<p>Compare lamp readings below.</p>}>
          <Exhibit {...{ambient,duty,selected,select}}/><OrbitControls target={[0,.98,0]} enablePan={false} minDistance={3.5} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Display case readings">
        <div><span>Room light</span><strong>{ambient}%</strong></div><div><span>D9 PWM</span><strong>{duty} / 255</strong></div><div><span>Lamp</span><strong>{lit?'On':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Try dusk and darkness</h3>
      <label className="gp-home-light">Room light <output>{ambient}%</output><input type="range" aria-label="Room light" min="0" max="100" value={ambient} onChange={event=>adjust(event.target.valueAsNumber)}/></label>
      <div className="gp-steps">
        <button type="button" onClick={()=>adjust(76)}>Bright room</button>
        <button type="button" onClick={()=>adjust(37)}>Dusk</button>
        <button type="button" onClick={()=>adjust(8)}>Dark room</button>
      </div>
      <p role="status">{lit?'Exhibit lamp on.':'Exhibit lamp off.'}</p>
      <p>At or below 37% the lamp switches on. It stays on through twilight and switches off at 47%. Below 37%, darker readings increase the LED duty.</p>
      <ol className="gp-demo-labels">{parts.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{parts[selected][2]}</p>
    </div>
  </div>;
}
