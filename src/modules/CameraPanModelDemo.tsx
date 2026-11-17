import {useEffect,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {CardPanCamera,PanTarget} from './CameraPanParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const targets=[
  {name:'Left',angle:35,color:'#6babb8'},
  {name:'Center',angle:90,color:'#caa66c'},
  {name:'Right',angle:145,color:'#c18067'},
] as const;
const parts:{name:string;at:Point;detail:string}[]=[
  {name:'Mock camera and sight line',at:[0,1.03,-.66],detail:'The line shows where the card camera is aimed. Watch it move between the fixed targets.'},
  {name:'Pan servo · D9',at:[.56,.49,-.63],detail:'D9 sends the angle command. The servo rotates the camera around the vertical axis.'},
  {name:'Framing targets',at:[-.77,.47,1.27],detail:'The three markers correspond to servo commands of 35°, 90° and 145°. Return to center from either side to compare alignment.'},
  {name:'Uno and servo supply',at:[1.02,.37,-1.30],detail:'The Uno sends the signal, while a separate regulated 5 V supply powers the servo. Their grounds are shared.'},
];
const yawFor=(angle:number)=>(angle-90)*Math.PI/180;
const targetPoint=(angle:number):Point=>{
  const yaw=yawFor(angle);
  return [Math.sin(yaw)*1.59,.08,-.77+Math.cos(yaw)*1.59];
};

function Bench({angle,selected,select,aim}:{angle:number;selected:number;select:(i:number)=>void;aim:(value:number)=>void}){
  return <>
    <color attach="background" args={['#405360']}/>
    <hemisphereLight args={['#eaf6ff','#967d69',2.08]}/><directionalLight position={[-3,6,4]} color="#fff1df" intensity={2.15}/>
    <Box at={[0,-.095,0]} size={[4.78,.19,3.16]} color="#81928b"/>
    <group position={[0,.068,-.77]}>
      <mesh><cylinderGeometry args={[.53,.54,.135,42]}/><meshStandardMaterial color="#a88e70" roughness={.73}/></mesh>
      <group onClick={()=>select(1)}>
        <Box at={[0,.20,0]} size={[.51,.28,.40]} color={selected===1?'#d7a879':'#34596c'}/>
        <Box at={[0,.338,0]} size={[.52,.050,.41]} color="#547b89"/>
        <mesh position={[0,.382,0]}><cylinderGeometry args={[.126,.126,.059,24]}/><meshStandardMaterial color="#ded9c9"/></mesh>
      </group>
      <group rotation={[0,yawFor(angle),0]} position={[0,.413,0]} onClick={()=>select(0)}>
        <CardPanCamera selected={selected===0}/>
        <Line points={[[0,.149,.38],[0,.149,1.48]]} color="#f5d699" lineWidth={2.2} dashed dashSize={.071} gapSize={.048}/>
      </group>
    </group>
    {targets.map(({name,angle:targetAngle,color})=><group key={name} position={targetPoint(targetAngle)} rotation={[0,yawFor(targetAngle),0]} onClick={()=>aim(targetAngle)}>
      <group scale={[1,2.2,1]}><PanTarget color={color}/></group>
      {angle===targetAngle&&<pointLight position={[0,.34,.11]} color={color} intensity={.75} distance={.55}/>}
      <WorldLabel position={[0,1,0]} className="gp-marker-anchor"><span className="gp-vane-cardinal">{name}</span></WorldLabel>
    </group>)}
    <group onClick={()=>select(3)}>
      <Box at={[1.07,.104,-1.21]} size={[.88,.081,.50]} color={selected===3?'#72a9a5':'#287b89'}/>
      <Box at={[.75,.173,-1.16]} size={[.17,.106,.145]} color="#bcc8cb" metal={.63}/>
      <Box at={[1.17,.167,-1.22]} size={[.23,.054,.103]} color="#26343b"/>
      {[-1.39,-1.03].map(z=><Box key={z} at={[1.12,.161,z]} size={[.60,.052,.045]} color="#27353b"/>)}
      <Box at={[1.84,.111,-.79]} size={[.49,.152,.37]} color="#333e46"/>
      <Box at={[1.84,.197,-.79]} size={[.32,.024,.24]} color="#58656b"/>
    </group>
    <Line points={[[.24,.20,-.74],[.52,.12,-.68],[.69,.17,-1.02],[.97,.17,-1.03]]} color="#e0b06d" lineWidth={2.8}/>
    <Line points={[[.23,.17,-.83],[.57,.12,-.87],[1.38,.12,-.88],[1.60,.14,-.79]]} color="#ba6b61" lineWidth={2.8}/>
    <Line points={[[.24,.15,-.88],[.56,.095,-.96],[1.53,.095,-1.01],[1.66,.14,-.95]]} color="#212831" lineWidth={2.8}/>
    <Line points={[[1.33,.18,-1.03],[1.44,.13,-1.02],[1.53,.095,-1.01]]} color="#212831" lineWidth={2.8}/>
    {parts.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.34} scale={5.2} far={1.8} resolution={128} frames={1}/>
  </>;
}

export default function CameraPanModelDemo(){
  const [angle,setAngle]=useState(90);
  const [target,setTarget]=useState(90);
  const [selected,select]=useState(0);
  const label=targets.find(preset=>preset.angle===target)?.name??'Custom';
  const moving=angle!==target;
  useEffect(()=>{
    if(!moving)return;
    const id=window.setTimeout(()=>setAngle(previous=>previous+Math.sign(target-previous)*Math.min(2,Math.abs(target-previous))),20);
    return ()=>window.clearTimeout(id);
  },[angle,target,moving]);
  function aim(value:number){
    setTarget(value);
    select(2);
  }

  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D desktop camera pan model">
        <Canvas camera={{position:[2.11,3.35,6.15],fov:40}} dpr={[1,1.6]} fallback={<p>Use the angle controls and readouts below.</p>}><Bench {...{angle,selected,select,aim}}/><OrbitControls target={[0,.40,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Camera pan readings">
        <div><span>Target command</span><strong>{target}°</strong></div><div><span>Current command</span><strong>{angle}°</strong></div><div><span>Framing</span><strong>{moving?'Panning':label}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Frame a target and return to center</h3>
      <p>Choose a preset or set an angle within the model’s travel. Try changing targets while the camera is moving.</p>
      <div className="gp-steps">{targets.map(({name,angle})=><button className="gp-button gp-secondary" type="button" key={name} aria-pressed={target===angle} onClick={()=>aim(angle)}>Aim {name.toLowerCase()}</button>)}</div>
      <label className="gp-home-light">Pan angle <output>{target}°</output><input aria-label="Pan angle" type="range" min="35" max="145" value={target} onChange={event=>aim(event.target.valueAsNumber)}/></label>
      <p role="status">{moving?`Panning toward ${target}°.`:`Settled at ${target}°.`}</p>
      <ol className="gp-demo-labels">{parts.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={i===selected} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{parts[selected].detail}</p>
    </div>
  </div>;
}
