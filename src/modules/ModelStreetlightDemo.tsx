import {useEffect,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Ambient light sensor',at:[-1.34,.61,-.48],detail:'The photoresistor sits outside the beam. The card baffle faces the lamp so its own light cannot raise the reading.'},
  {name:'Arduino and divider',at:[-.77,.47,.66],detail:'The Uno reads the divider on A0. A new state must persist for one second before D8 changes.'},
  {name:'Streetlight head',at:[1.23,2.03,-.30],detail:'D8 feeds the down-facing white LED through a 220 Ω resistor. The dark return wire leads back to ground.'},
  {name:'Pavement',at:[1.52,.20,.57],detail:'Compare the pavement in daylight and at dusk. The downward beam covers the footpath.'},
];
const phases=[
  {brightness:80,duration:1350},
  {brightness:30,duration:1450},
  {brightness:48,duration:650},
  {brightness:75,duration:1450},
];
function Road({lit,level,shadow,selected,select}:{lit:boolean;level:number;shadow:boolean;selected:number;select:(i:number)=>void}) {
  const ambient=.31+level/100*2.0;
  return <>
    <color attach="background" args={[level<45?'#15283a':'#374d62']}/>
    <hemisphereLight args={['#e1efff','#68656f',ambient]}/>
    <directionalLight position={[-3,5,4]} intensity={ambient} color="#f8edda"/>
    <Box at={[0,-.10,0]} size={[5,.2,3.1]} color="#52626e"/>
    <Box at={[0,.033,.76]} size={[4.74,.065,1.37]} color="#424a54"/>
    {Array.from({length:8},(_,i)=><Box key={i} at={[-2.07+i*.59,.072,.97]} size={[.29,.01,.042]} color="#d9a55a"/>)}
    <Box at={[0,.14,-.86]} size={[4.74,.27,.94]} color="#80918b"/>
    <group onClick={()=>select(3)}>
      {Array.from({length:12},(_,i)=><Box key={i} at={[-2.17+i*.392,.112,-.17]} size={[.38,.19,.42]} color={selected===3?'#dfbd92':i%2?'#adaaa2':'#b9b3a8'}/>)}
      <Box at={[0,.09,.064]} size={[4.73,.11,.069]} color="#d4cfc4"/>
      {lit&&<mesh position={[1.09,.211,-.079]} rotation={[-Math.PI/2,0,0]} scale={[1,.42,1]}>
        <circleGeometry args={[.64,36]}/><meshBasicMaterial color="#f5d296" transparent opacity={.36} depthWrite={false}/>
      </mesh>}
    </group>
    <group position={[-1.48,.26,-.58]} onClick={()=>select(0)}>
      <Box at={[0,.046,0]} size={[.37,.09,.36]} color="#dfd8c6"/>
      <Box at={[.24,.206,0]} size={[.07,.41,.39]} color={selected===0?'#d18458':'#667772'}/>
      <mesh position={[0,.156,0]}><cylinderGeometry args={[.075,.075,.044,22]}/><meshStandardMaterial color={selected===0?'#f9c274':'#c4ae86'}/></mesh>
      <Line points={[[-.047,.181,-.029],[.043,.181,-.029],[.043,.181,-.008],[-.038,.181,-.008],[-.038,.181,.013],[.046,.181,.013],[.046,.181,.029],[-.043,.181,.029]]} color="#8f4e32" lineWidth={1}/>
      {shadow&&<Box at={[0,.26,-.003]} size={[.21,.035,.23]} color="#2c3543"/>}
    </group>
    <group position={[-.79,.16,.62]} onClick={()=>select(1)}>
      <Box at={[0,0,0]} size={[.79,.07,.56]} color={selected===1?'#c49664':'#276e8a'}/>
      <Box at={[-.24,.083,.08]} size={[.17,.12,.16]} color="#afbac0" metal={.67}/>
      <Box at={[.07,.065,0]} size={[.27,.056,.13]} color="#252f35"/>
      {[-.20,.20].map(z=><Box key={z} at={[.06,.059,z]} size={[.52,.068,.062]} color="#29323c"/>)}
      <Box at={[.68,-.029,.001]} size={[.46,.105,.38]} color="#dbd6c9"/>
      {[.09,-.09].flatMap(z=>Array.from({length:7},(_,i)=><Box key={z+':'+i} at={[.49+.061*i,.027,z]} size={[.021,.005,.019]} color="#818681"/>))}
      <Box at={[.65,.061,0]} size={[.32,.024,.024]} color="#acb4b7" metal={.6}/>
      <Box at={[.65,.062,0]} size={[.15,.052,.052]} color="#bb9b71"/>
    </group>
    <group onClick={()=>select(2)}>
      <Box at={[.79,.30,-.39]} size={[.35,.095,.35]} color="#4c5c69" metal={.49}/>
      <mesh position={[.79,1.03,-.39]}><cylinderGeometry args={[.039,.064,1.42,26]}/><meshStandardMaterial color="#a9aca9" metalness={.61} roughness={.49}/></mesh>
      <Box at={[1.03,1.73,-.32]} size={[.55,.081,.13]} color="#9da7ac" metal={.58}/>
      <Box at={[1.31,1.735,-.28]} size={[.46,.14,.27]} color={selected===2?'#deac76':'#52636e'} metal={.48}/>
      <Box at={[1.31,1.65,-.28]} size={[.36,.033,.20]} color={lit?'#ffe8b4':'#bdbdb2'}/>
      {lit&&<pointLight position={[1.31,1.59,-.25]} color="#ffd28c" intensity={8} distance={3.6}/>}
    </group>
    <Line points={[[-1.5,.36,-.40],[-1.31,.36,-.17],[-1.0,.28,.25],[-.56,.22,.43]]} color="#dd9562" lineWidth={3}/>
    <Line points={[[-1.44,.32,-.39],[-1.22,.34,-.23],[-.83,.28,.12],[-.71,.23,.41]]} color="#bc5748" lineWidth={2}/>
    <Line points={[[.01,.22,.59],[.25,.20,.29],[.49,.23,-.19],[.77,.30,-.39]]} color="#5c88b3" lineWidth={3}/>
    <Line points={[[.77,.29,-.36],[.53,.20,-.17],[.43,.16,.52],[-.55,.23,.82]]} color="#303844" lineWidth={3}/>
    <Box at={[1.98,.37,-.94]} size={[.13,.19,.11]} color="#8a6b5b"/>
    <mesh position={[1.98,.63,-.94]} scale={[.28,.37,.27]}><sphereGeometry args={[1,18,14]}/><meshStandardMaterial color="#617a67"/></mesh>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.008,0]} opacity={.33} scale={5} far={1.6} resolution={128} frames={1}/>
  </>;
}
export default function ModelStreetlightDemo(){
  const [level,setLevel]=useState(80);
  const [lit,setLit]=useState(false);
  const [shadow,setShadow]=useState(false);
  const [phase,setPhase]=useState(-1);
  const [selected,select]=useState(2);
  const brightness=shadow?22:level;
  const qualifying=lit?brightness>=55:brightness<=40;
  useEffect(()=>{
    if(!qualifying)return;
    const timer=window.setTimeout(()=>setLit(!lit),1000);
    return ()=>window.clearTimeout(timer);
  },[qualifying,lit]);
  useEffect(()=>{
    if(!shadow)return;
    const timer=window.setTimeout(()=>setShadow(false),350);
    return ()=>window.clearTimeout(timer);
  },[shadow]);
  useEffect(()=>{
    if(phase<0)return;
    const timer=window.setTimeout(()=>{
      const next=phases[phase+1];
      if(next){setLevel(next.brightness);setPhase(phase+1);}
      else setPhase(-1);
    },phases[phase].duration);
    return ()=>window.clearTimeout(timer);
  },[phase]);
  function choose(next:number){setPhase(-1);setShadow(false);setLevel(next);}
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D model streetlight">
        <Canvas camera={{position:[2.5,3.55,6.1],fov:41}} dpr={[1,1.6]} fallback={<p>Use the light controls and readings below.</p>}>
          <Road {...{lit,level,shadow,selected,select}}/>
          <OrbitControls target={[0,.64,0]} enablePan={false} minDistance={3.3} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Streetlight readings">
        <div><span>Ambient light</span><strong>{brightness}%</strong></div>
        <div><span>A0 reading</span><strong>{Math.ceil(180+brightness*6.4)}</strong></div>
        <div><span>Streetlight</span><strong>{lit?'On':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Compare a shadow with sunset</h3>
      <label className="gp-home-light">Ambient brightness <output>{level}%</output><input aria-label="Ambient brightness" type="range" min="0" max="100" value={level} onChange={event=>choose(event.target.valueAsNumber)}/></label>
      <div className="gp-steps">
        <button type="button" onClick={()=>choose(80)}>Daylight</button>
        <button type="button" onClick={()=>choose(48)}>Twilight</button>
        <button type="button" onClick={()=>choose(30)}>Sustained dusk</button>
        <button type="button" onClick={()=>{setPhase(-1);setShadow(true);}}>Pass a shadow</button>
      </div>
      <button type="button" className="gp-button" disabled={phase>=0} onClick={()=>{choose(phases[0].brightness);setPhase(0);}}>Run dusk and dawn</button>
      <p role="status">{shadow?'Passing shadow · The sensor is shaded.':qualifying?lit?'Checking for sustained daylight.':'Checking for sustained dusk.':lit?'Lamp on · Pavement lit.':'Lamp off.'}</p>
      <p>At or below 40% for one second the lamp switches on. At or above 55% for one second it switches off. In between, it holds its previous state.</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
