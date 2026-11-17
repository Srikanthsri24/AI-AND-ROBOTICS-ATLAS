import {useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import type {Group} from 'three';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

const parts=[
  ['Door magnet and reed switch',[1.15,1.83,.66],'The magnet closes the reed switch when the door shuts. With the door open, the Uno’s pull-up holds D2 HIGH.'],
  ['Room-light sensor',[-1.43,.63,.60],'This photoresistor sits outside the cabinet, away from the shelf light. The divider converts room light into a reading on A0.'],
  ['Shelf LED',[.33,2.06,.59],'D8 supplies the LED through a 220 Ω resistor. The lamp turns on only when the door is open and the room is dim.'],
  ['Arduino Uno',[-1.26,.42,1.03],'The Arduino combines the brightness and door inputs. It keeps the last dim or bright classification between 32% and 42%.'],
] as const;

function Wardrobe({open,level,lit,selected,select}:{open:boolean;level:number;lit:boolean;selected:number;select:(i:number)=>void}){
  const door=useRef<Group>(null);
  useFrame((_,delta)=>{
    if(door.current)door.current.rotation.y+=(-Number(open)*1.84-door.current.rotation.y)*(1-Math.exp(-12*delta));
  });
  const light=.38+level*.021;
  return <>
    <color attach="background" args={[level<42?'#202c40':'#405367']}/>
    <hemisphereLight args={['#d6e9fa','#7b665b',light]}/>
    <directionalLight position={[-3,6,5]} intensity={light} color="#ffebd3"/>
    <Box at={[0,-.09,0]} size={[4.8,.18,3]} color="#525d6d"/>
    <Box at={[.32,1.12,-.55]} size={[1.80,2.17,.15]} color="#9b7457"/>
    {[-.57,1.22].map(x=><Box key={x} at={[x,1.12,-.01]} size={[.12,2.17,1.18]} color="#ad8466"/>)}
    {[.10,.96,2.19].map(y=><Box key={y} at={[.32,y,-.01]} size={[1.78,.11,1.19]} color="#bc9171"/>)}
    <Line points={[[-.48,1.80,-.01],[1.13,1.80,-.01]]} color="#a6a9aa" lineWidth={4}/>
    {['#6a8495','#a87968','#9e9c80'].map((color,i)=><group key={color} position={[-.23+i*.42,1.5,-.07]}>
      <Line points={[[-.14,.16,.08],[0,.26,0],[.14,.16,-.08],[-.14,.16,.08]]} color="#73787e" lineWidth={1}/>
      <Box at={[0,-.07,0]} size={[.28,.38,.18]} color={color}/>
    </group>)}
    {['#738489','#a99473','#a77b70'].map((color,i)=><Box key={color} at={[.69,1.045+i*.054,.24]} size={[.5,.048,.4]} color={color}/>)}
    <group ref={door} position={[-.52,1.13,.60]} onClick={()=>select(0)}>
      <Box at={[.85,0,0]} size={[1.74,2.02,.095]} color="#a77c5e"/>
      <Box at={[.85,0,.051]} size={[1.48,1.73,.018]} color="#b68b6e"/>
      <Box at={[1.46,.05,.116]} size={[.063,.30,.103]} color="#aab1b2" metal={.68}/>
      <Box at={[1.62,.51,-.06]} size={[.18,.091,.061]} color={selected===0?'#f0b066':'#e1dcd0'}/>
      {[-.67,.65].map(y=><Box key={y} at={[0,y,.066]} size={[.05,.24,.07]} color="#b3ada4" metal={.64}/>)}
    </group>
    <group onClick={()=>select(0)}>
      <Box at={[1.14,1.64,.49]} size={[.21,.1,.09]} color={selected===0?'#eda354':'#e5dfd6'}/>
      <Line points={[[1.14,1.64,.49],[1.21,1.55,.48],[1.26,.24,.55],[.13,.21,.9],[-1.04,.23,.97]]} color="#c49357" lineWidth={2}/>
    </group>
    <group onClick={()=>select(2)}>
      <Box at={[.29,2.094,.29]} size={[.64,.054,.13]} color={selected===2?'#d6a56d':'#626665'}/>
      <mesh position={[.29,2.062,.29]}><boxGeometry args={[.53,.022,.092]}/><meshStandardMaterial color="#efe0b9" emissive="#ffd794" emissiveIntensity={lit?2.4:0}/></mesh>
      {lit&&<pointLight position={[.29,1.98,.36]} color="#ffce88" intensity={9} distance={2.4}/>}
      <Line points={[[.05,2.07,.35],[-.52,2.04,.4],[-.60,.24,.62],[-1,.21,.83]]} color="#536a9b" lineWidth={2}/>
    </group>
    <group onClick={()=>select(1)}>
      <Box at={[-1.42,.18,.36]} size={[.43,.17,.37]} color="#ded9c8"/>
      <mesh position={[-1.42,.29,.36]}><cylinderGeometry args={[.084,.084,.053,24]}/><meshStandardMaterial color={selected===1?'#f2b572':'#c7a481'}/></mesh>
      <Line points={[[-1.47,.319,.32],[-1.37,.319,.32],[-1.37,.319,.36],[-1.47,.319,.36],[-1.47,.319,.40],[-1.37,.319,.40]]} color="#81513c" lineWidth={2}/>
      <Line points={[[-1.43,.23,.48],[-1.76,.23,.63],[-1.65,.20,.86],[-1.42,.23,.9]]} color="#cf6a50" lineWidth={3}/>
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[-1.39,.17,.99]} size={[.85,.07,.48]} color={selected===3?'#b98151':'#257d94'}/>
      <Box at={[-1.66,.235,1.0]} size={[.17,.13,.15]} color="#a7b2ba" metal={.7}/>
      <Box at={[-1.34,.237,.99]} size={[.23,.066,.139]} color="#26313a"/>
      {[-.17,.17].map(z=><Box key={z} at={[-1.27,.231,.99+z]} size={[.51,.067,.06]} color="#28333a"/>)}
      <Box at={[-.75,.13,1.05]} size={[.37,.085,.39]} color="#dedbd0"/>
      <Box at={[-.75,.19,1.05]} size={[.25,.052,.059]} color="#bca17b"/>
      <Line points={[[-1.02,.22,1.11],[-1.00,.23,1.24],[-.55,.22,1.16]]} color="#ae6c51" lineWidth={2}/>
    </group>
    {parts.map(([name,at],i)=><WorldLabel key={name} position={[...at]} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.34} scale={4.9} far={1.4} resolution={128} frames={1}/>
  </>;
}

export default function WardrobeLightDemo(){
  const [open,setOpen]=useState(false);
  const [{level,dim},setRoom]=useState({level:75,dim:false});
  const [selected,select]=useState(0);
  const lit=open&&dim;
  function changeLevel(level:number){
    setRoom(previous=>({level,dim:level<=32||(level<42&&previous.dim)}));
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D wardrobe light">
        <Canvas camera={{position:[-.95,4.1,6.4],fov:41}} dpr={[1,1.6]} fallback={<p>Try the door and light controls below.</p>}>
          <Wardrobe {...{open,level,lit,selected,select}}/>
          <OrbitControls target={[0,1.05,0]} minDistance={3.5} maxDistance={9} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Wardrobe light readings">
        <div><span>D2 door input</span><strong>{open?'HIGH · Open':'LOW · Closed'}</strong></div>
        <div><span>Room light</span><strong>{level}% · {dim?'Dim':'Bright'}</strong></div>
        <div><span>Shelf lamp</span><strong>{lit?'On':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Try the door in two light levels</h3>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>setOpen(!open)}>{open?'Close door':'Open door'}</button>
        <button type="button" onClick={()=>changeLevel(75)}>Bright room</button>
        <button type="button" onClick={()=>changeLevel(22)}>Dim room</button>
      </div>
      <label className="gp-home-light">Room brightness <output>{level}%</output><input aria-label="Room brightness" type="range" min="0" max="100" value={level} onChange={event=>changeLevel(event.target.valueAsNumber)}/></label>
      <p role="status">{lit?'Lamp on · Door open in a dim room.':open?'Lamp off · Room is bright.':'Lamp off · Door is closed.'}</p>
      <ol className="gp-demo-labels">{parts.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{parts[selected][2]}</p>
    </div>
  </div>;
}
