import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Outdoor light sensor',at:[-1.61,.53,.48],detail:'A0 measures light from outside the display. The baffle keeps the model lamps from affecting the reading.'},
  {name:'Path light · D8',at:[1.26,1.13,.77],detail:'The path turns on at 45% or below and turns off at 55% or above.'},
  {name:'Classroom light · D9',at:[.13,1.51,.23],detail:'The paper diffuser spreads one LED’s light across the classroom windows. It turns on at 28% and clears at 38%.'},
  {name:'Arduino and resistors',at:[-1.10,.46,1.20],detail:'The Uno evaluates both lighting zones independently and sends them through separate current-limiting resistors.'},
];

function Campus({light,path,classroom,selected,select}:{light:number;path:boolean;classroom:boolean;selected:number;select:(i:number)=>void}){
  const ambient=.30+light*.024;
  return <>
    <color attach="background" args={[light<38?'#18283c':'#395467']}/>
    <hemisphereLight args={['#e2efff','#746d5a',ambient]}/>
    <directionalLight position={[-3,5,4]} intensity={ambient} color="#fff1dd"/>
    <Box at={[0,-.09,0]} size={[4.94,.18,3.18]} color="#566777"/>
    <Box at={[.52,.064,-.15]} size={[3.50,.126,2.76]} color="#71806a"/>
    <Box at={[.78,.16,-.49]} size={[2.65,.08,1.59]} color="#939c92"/>
    <Box at={[.76,.90,-.54]} size={[2.48,1.45,1.32]} color="#a9745e"/>
    <Box at={[.76,1.66,-.54]} size={[2.67,.13,1.48]} color="#5b666d"/>
    <Box at={[.76,1.756,-.54]} size={[2.49,.1,1.30]} color="#8d9390"/>
    <mesh position={[1.48,2.032,-.28]}><cylinderGeometry args={[.018,.018,.55,14]}/><meshStandardMaterial color="#9ea6aa" metalness={.66}/></mesh>
    <Box at={[1.68,2.225,-.28]} size={[.39,.181,.023]} color="#568299"/>
    <Box at={[1.68,2.168,-.265]} size={[.38,.044,.009]} color="#d9c48c"/>
    <Box at={[.76,.261,.127]} size={[2.46,.101,.037]} color="#aaa393"/>
    <group onClick={()=>select(2)}>
      {[-.15,.34,.83].map(x=><group key={x} position={[x,.96,.132]}>
        <Box at={[0,0,0]} size={[.37,.65,.046]} color={selected===2?'#d7a775':'#636e72'}/>
        <mesh position={[0,0,.026]}><boxGeometry args={[.30,.54,.024]}/><meshStandardMaterial color={classroom?'#ffdb9d':'#516879'} emissive="#ffcc85" emissiveIntensity={classroom?1.55:0}/></mesh>
        <Box at={[0,0,.045]} size={[.022,.55,.018]} color="#c1b4a0"/>
        <Box at={[0,.039,.044]} size={[.312,.022,.017]} color="#c1b4a0"/>
      </group>)}
      {classroom&&<pointLight position={[.33,.95,.28]} color="#ffce91" intensity={2.45} distance={1.25}/>}
    </group>
    <Box at={[1.49,.683,.14]} size={[.52,.97,.051]} color="#74818a"/>
    <Box at={[1.49,.684,.174]} size={[.41,.87,.023]} color="#445965"/>
    <Box at={[1.65,.64,.198]} size={[.055,.028,.013]} color="#bdab89"/>
    <Box at={[1.45,1.34,.174]} size={[.71,.094,.24]} color="#888d86" metal={.28}/>
    <Box at={[1.42,.135,.84]} size={[.73,.041,1.36]} color="#a5aba2"/>
    {Array.from({length:5},(_,i)=><Box key={i} at={[1.42,.162,.34+i*.245]} size={[.72,.007,.015]} color="#7e8986"/>)}
    <group onClick={()=>select(1)}>
      <Box at={[.94,.173,.75]} size={[.201,.089,.19]} color="#515f65"/>
      <mesh position={[.94,.563,.75]}><cylinderGeometry args={[.03,.045,.77,22]}/><meshStandardMaterial color="#94a0a2" metalness={.58}/></mesh>
      <Box at={[1.04,.952,.75]} size={[.27,.083,.15]} color={selected===1?'#c1945e':'#596b73'} metal={.53}/>
      <mesh position={[1.07,.895,.75]}><boxGeometry args={[.18,.041,.11]}/><meshStandardMaterial color="#dccfb2" emissive="#ffcf8b" emissiveIntensity={path?2.2:0}/></mesh>
      {path&&<pointLight position={[1.07,.82,.76]} color="#ffd798" intensity={3.2} distance={1.55}/>}
    </group>
    <group onClick={()=>select(0)}>
      <Box at={[-1.64,.156,.35]} size={[.4,.114,.42]} color="#ddd9cc"/>
      <Box at={[-1.41,.27,.35]} size={[.06,.34,.46]} color="#64726a"/>
      <mesh position={[-1.65,.23,.35]}><cylinderGeometry args={[.067,.068,.042,24]}/><meshStandardMaterial color={selected===0?'#ffd093':'#c6ad80'}/></mesh>
      <Line points={[[-1.69,.255,.323],[-1.61,.255,.323],[-1.61,.255,.35],[-1.69,.255,.35],[-1.69,.255,.373],[-1.61,.255,.373]]} color="#825543" lineWidth={2}/>
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[-1.33,.142,1.03]} size={[.84,.081,.49]} color={selected===3?'#c18a59':'#277991'}/>
      <Box at={[-1.60,.219,1.08]} size={[.18,.115,.16]} color="#abb7be" metal={.67}/>
      <Box at={[-1.27,.204,1.04]} size={[.24,.052,.12]} color="#25313b"/>
      {[.855,1.21].map(z=><Box key={z} at={[-1.22,.203,z]} size={[.47,.052,.052]} color="#26343e"/>)}
      <Box at={[-.58,.135,1.05]} size={[.55,.103,.49]} color="#dbd8ce"/>
      {[.90,1.05,1.20].map(z=><group key={z} position={[-.58,.215,z]}><Box at={[0,0,0]} size={[.35,.023,.021]} color="#a7b1b5" metal={.7}/><Box at={[0,.009,0]} size={[.15,.055,.053]} color="#c0a27b"/></group>)}
    </group>
    <Line points={[[-1.64,.204,.52],[-1.52,.206,.65],[-1.26,.218,.87],[-.76,.213,.90]]} color="#dba25a" lineWidth={3}/>
    <Line points={[[.94,.23,.75],[.73,.21,1.04],[.26,.20,1.24],[-.43,.212,1.2]]} color="#6d8db1" lineWidth={3}/>
    <Line points={[[.22,.45,.144],[.20,.24,.31],[-.08,.21,.70],[-.42,.21,1.05]]} color="#b75f58" lineWidth={3}/>
    <Line points={[[1.04,.23,.75],[.63,.18,1.38],[-1.25,.22,1.22]]} color="#303d48" lineWidth={2}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.006,0]} opacity={.32} scale={5.3} far={1.5} resolution={128} frames={1}/>
  </>;
}
export default function SchoolDioramaDemo(){
  const [{light,path,classroom},set]=useState({light:80,path:false,classroom:false});
  const [selected,select]=useState(2);
  function change(light:number){
    set(previous=>({light,path:light<=45||(light<55&&previous.path),classroom:light<=28||(light<38&&previous.classroom)}));
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D school diorama">
        <Canvas camera={{position:[2.55,3.24,6.25],fov:40}} dpr={[1,1.6]} fallback={<p>Compare the two zone readings below.</p>}>
          <Campus {...{light,path,classroom,selected,select}}/><OrbitControls target={[0,.78,0]} enablePan={false} minDistance={3.5} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="School diorama readings"><div><span>Room light</span><strong>{light}%</strong></div><div><span>Path D8</span><strong>{path?'On':'Off'}</strong></div><div><span>Classroom D9</span><strong>{classroom?'On':'Off'}</strong></div></div>
    </div>
    <div className="gp-guide">
      <h3>See when each zone lights</h3>
      <label className="gp-home-light">Room light <output>{light}%</output><input type="range" aria-label="Room light" min="0" max="100" value={light} onChange={e=>change(e.target.valueAsNumber)}/></label>
      <div className="gp-steps">
        <button type="button" onClick={()=>change(80)}>Daylight</button>
        <button type="button" onClick={()=>change(41)}>Dusk</button>
        <button type="button" onClick={()=>change(22)}>Night</button>
      </div>
      <p role="status">{classroom?'Path and classroom lights on.':path?'Path light on · Classroom off.':'Both zones off.'}</p>
      <p>When light returns, the classroom clears at 38% and the path clears at 55%.</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
