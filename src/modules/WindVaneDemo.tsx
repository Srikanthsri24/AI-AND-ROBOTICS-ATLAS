import {useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import type {Group} from 'three';
import {WorldLabel} from './LabWorkbench';
import {AS5600Breakout,VanePointer,WindVanePivot} from './WindVaneParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const parts:{name:string;at:Point;detail:string}[]=[
  {name:'Arrow and tail fin',at:[-.57,1.33,-.32],detail:'Air pushes the broad tail downstream. The smaller arrowhead points back toward the source of the air.'},
  {name:'Shaft and rotating magnet',at:[-.47,.69,.47],detail:'The magnet turns with the vane. Its two poles lie across its diameter.'},
  {name:'AS5600 breakout · I²C',at:[.15,.39,.76],detail:'The stationary chip reads the magnet across a small gap. I²C carries the raw angle to the Uno.'},
  {name:'Calibrated compass base',at:[-1.24,.28,.60],detail:'North sets zero. East determines which way the raw count changes over a clockwise quarter turn.'},
];
const compass=[
  {name:'N',degrees:0,at:[-.48,.17,-.74]},
  {name:'E',degrees:90,at:[.22,.17,-.04]},
  {name:'S',degrees:180,at:[-.48,.17,.67]},
  {name:'W',degrees:270,at:[-1.18,.17,-.04]},
] satisfies {name:string;degrees:number;at:Point}[];
const wrap=(value:number,period:number)=>((value%period)+period)%period;
const sensorCount=(degrees:number)=>wrap(760-Math.round(degrees*4096/360),4096);

function Bench({degrees,wind,selected,select}:{degrees:number;wind:boolean;selected:number;select:(i:number)=>void}){
  const vane=useRef<Group>(null);
  const target=Math.PI/2-degrees*Math.PI/180;
  useFrame((_,delta)=>{
    if(!vane.current)return;
    const distance=target-vane.current.rotation.y;
    vane.current.rotation.y+=Math.atan2(Math.sin(distance),Math.cos(distance))*(1-Math.exp(-8*delta));
  });
  return <>
    <color attach="background" args={['#41545d']}/>
    <hemisphereLight args={['#eaf6ff','#967c67',2.10]}/><directionalLight position={[-3,6,4]} color="#fff0d9" intensity={2.16}/>
    <Box at={[0,-.095,0]} size={[4.74,.19,3.10]} color="#82928a"/>
    <group position={[-.48,.03,-.04]} onClick={()=>select(3)}><WindVanePivot/></group>
    <group ref={vane} position={[-.48,.87,-.04]} rotation={[0,Math.PI/2,0]} onClick={()=>select(0)}><VanePointer/></group>
    <group position={[-.48,.29,-.04]} onClick={()=>select(1)}>
      <mesh><cylinderGeometry args={[.122,.122,.055,30]}/><meshStandardMaterial color={selected===1?'#d1ac77':'#a9bdc3'} metalness={.63}/></mesh>
    </group>
    <group position={[-.48,.145,-.04]} onClick={()=>select(2)}>
      <AS5600Breakout/>
    </group>
    <Box at={[1.34,.11,1.06]} size={[.96,.088,.49]} color="#287b8a"/>
    <Box at={[.98,.18,1.12]} size={[.18,.107,.145]} color="#bfcbcf" metal={.64}/>
    <Box at={[1.47,.174,1.05]} size={[.23,.055,.106]} color="#26343c"/>
    {[.86,1.24].map(z=><Box key={z} at={[1.39,.166,z]} size={[.63,.052,.046]} color="#27353b"/>)}
    {['#dbab69','#77bdc9','#b57166','#344652'].map((color,i)=><Line key={color} points={[[ -.21,.205,-.04+i*.024],[.34,.13,.03+i*.045],[.78,.15,.66+i*.03],[1.09+i*.14,.18,.87]]} color={color} lineWidth={2.5}/>)}
    {wind&&<group position={[-.48,.91,-.04]} rotation={[0,target,0]}>
      {[-.28,0,.28].map(z=><Line key={z} points={[[1.65,0,z],[1.08,0,z]]} color="#81ccdb" lineWidth={2} dashed dashSize={.074} gapSize={.046}/>)}
    </group>}
    {compass.map(({name,at})=><WorldLabel key={name} position={at} className="gp-marker-anchor"><span className="gp-vane-cardinal">{name}</span></WorldLabel>)}
    {parts.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.34} scale={5.2} far={1.8} resolution={128} frames={1}/>
  </>;
}

export default function WindVaneDemo(){
  const [degrees,setDegrees]=useState(0);
  const [north,setNorth]=useState<number|null>(null);
  const [direction,setDirection]=useState(0);
  const [wind,setWind]=useState(false);
  const [invalidEast,setInvalidEast]=useState(false);
  const [selected,select]=useState(0);
  const raw=sensorCount(degrees);
  const heading=north===null||!direction?null:wrap(Math.round(wrap((raw-north)*direction,4096)*360/4096),360);
  function captureEast(){
    if(north===null)return;
    const delta=wrap(raw-north+2048,4096)-2048;
    const valid=Math.abs(Math.abs(delta)-1024)<=256;
    setInvalidEast(!valid);
    if(valid)setDirection(Math.sign(delta));
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D model wind vane pointer">
        <Canvas camera={{position:[2.15,3.35,6.03],fov:40}} dpr={[1,1.6]} fallback={<p>Use the direction controls and readouts below.</p>}><Bench {...{degrees,wind,selected,select}}/><OrbitControls target={[0,.58,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Wind vane readings">
        <div><span>Base position</span><strong>{degrees}°</strong></div><div><span>Raw sensor count</span><strong>{raw}</strong></div><div><span>Calibrated heading</span><strong>{heading===null?'—':heading+'°'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Calibrate the base and turn the vane</h3>
      <p>Set the arrow to N and capture north. Turn to E and capture east. Then switch on the simulated airflow and try other directions, including just before north.</p>
      <label className="gp-home-light">Direction <output>{degrees}°</output><input aria-label="Vane direction" type="range" min="0" max="359" value={degrees} onChange={event=>{setDegrees(event.target.valueAsNumber);select(0);}}/></label>
      <div className="gp-steps">{compass.map(({name,degrees})=><button key={name} type="button" className="gp-button gp-secondary" onClick={()=>{setDegrees(degrees);select(0);}}>{name}</button>)}</div>
      <div className="gp-steps">
        <button className="gp-button" type="button" onClick={()=>{setNorth(raw);setDirection(0);setInvalidEast(false);}}>Capture north</button>
        <button className="gp-button gp-secondary" type="button" disabled={north===null} onClick={captureEast}>Capture east</button>
        <button type="button" onClick={()=>setWind(!wind)}>{wind?'Turn airflow off':'Turn airflow on'}</button>
        <button type="button" onClick={()=>{setDegrees(0);setNorth(null);setDirection(0);setWind(false);setInvalidEast(false);select(0);}}>Reset vane</button>
      </div>
      <p role="status">{invalidEast?'East must be near a quarter turn from north.':north===null?'Capture north to set zero.':!direction?'North saved. Turn to east and capture it.':`Heading ${heading}° relative to the base.`}</p>
      <ol className="gp-demo-labels">{parts.map(({name},i)=><li key={name}><button className="gp-part-label" type="button" aria-pressed={i===selected} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{parts[selected].detail}</p>
    </div>
  </div>;
}
