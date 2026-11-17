import {useEffect,useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import type {Group} from 'three';
import {WorldLabel} from './LabWorkbench';
import {LiftCar,LiftShaft} from './ElevatorCallParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const parts:{name:string;at:Point;detail:string}[]=[
  {name:'Call button · D2',at:[.24,.66,.52],detail:'A fresh press while the car is away sends a request on D2.'},
  {name:'Sliding model car',at:[-.65,1.58,.14],detail:'Move the car by hand in the tabletop build. A tab on the car touches the roller only at the landing.'},
  {name:'Arrival roller · D3',at:[-.01,.41,.31],detail:'At the landing the tab pushes the roller, closing D3 to ground and clearing the call.'},
  {name:'Call indicator · D8',at:[.52,.93,.40],detail:'The LED stays lit while a call is waiting, even after the call button is released.'},
  {name:'Arduino and wiring',at:[1.42,.39,1.19],detail:'The Uno remembers the request and gives the landing switch priority.'},
];
const travelMs=850;
type CarPosition='away'|'landing'|'approaching'|'departing';

function Bench({position,pending,selected,select,onCall}:{position:CarPosition;pending:boolean;selected:number;select:(i:number)=>void;onCall:()=>void}){
  const car=useRef<Group>(null);
  const arrived=position==='landing';
  const target=position==='landing'||position==='approaching'?.14:1.30;
  useFrame((_,delta)=>{
    if(car.current)car.current.position.y+=(target-car.current.position.y)*(1-Math.exp(-8*delta));
  });
  return <>
    <color attach="background" args={['#40515e']}/>
    <hemisphereLight args={['#edf7ff','#967d69',2.08]}/><directionalLight position={[-3,6,4]} color="#fff2dd" intensity={2.12}/>
    <Box at={[0,-.095,0]} size={[4.79,.19,3.06]} color="#81908b"/>
    <group position={[-.64,.01,-.12]} scale={[1.12,1.02,1.08]}>
      <LiftShaft selected={selected===1}/>
      <group ref={car} position={[0,1.30,0]} onClick={()=>select(1)}><LiftCar selected={selected===1}/></group>
    </group>
    <Box at={[.55,.30,.15]} size={[.51,.53,.28]} color="#617780"/>
    <group onClick={onCall}>
      <Box at={[.47,.45,.319]} size={[.20,.18,.060]} color={selected===0?'#d9ad7a':'#344750'}/>
      <mesh position={[.47,.45,.365]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.064,.066,.055,25]}/><meshPhysicalMaterial color="#c79162" roughness={.41}/></mesh>
    </group>
    <group onClick={()=>select(2)}>
      <Box at={[-.057,.241,.038]} size={[.177,.145,.179]} color={selected===2?'#ddac78':'#2e3c44'}/>
      <group position={[-.06,.32,.037]} rotation={[0,0,arrived?.06:-.31]}>
        <Box at={[-.070,.020,0]} size={[.215,.031,.060]} color="#acbfc4" metal={.58}/>
        <mesh position={[-.176,.023,0]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.044,.044,.053,23]}/><meshStandardMaterial color="#adbdc1" metalness={.49}/></mesh>
      </group>
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[.63,.63,.322]} size={[.17,.16,.061]} color={selected===3?'#dab187':'#34454d'}/>
      <mesh position={[.63,.63,.372]}><sphereGeometry args={[.057,22,14]}/><meshStandardMaterial color={pending?'#ffc465':'#8a6241'} emissive="#ffad4a" emissiveIntensity={pending?2.75:0}/></mesh>
      {pending&&<pointLight position={[.63,.65,.43]} color="#ffb95e" intensity={1.25} distance={.75}/>}
    </group>
    <group onClick={()=>select(4)}>
      <Box at={[1.40,.112,1.12]} size={[1.02,.086,.54]} color={selected===4?'#71aaa6':'#287c8b'}/>
      <Box at={[1.02,.18,1.20]} size={[.18,.11,.145]} color="#bdcacc" metal={.62}/>
      <Box at={[1.52,.18,1.10]} size={[.24,.058,.112]} color="#263740"/>
      {[.91,1.31].map(z=><Box key={z} at={[1.44,.172,z]} size={[.63,.054,.047]} color="#27353d"/>)}
    </group>
    <Line points={[[.54,.43,.34],[.85,.39,.37],[.97,.18,.63],[1.13,.18,.92]]} color="#77b9cc" lineWidth={2.7}/>
    <Line points={[[.68,.61,.34],[.89,.54,.35],[1.01,.18,.64],[1.28,.18,.92]]} color="#e8b376" lineWidth={2.7}/>
    <Line points={[[.04,.23,.12],[.30,.15,.26],[.77,.13,.63],[1.48,.18,.92]]} color="#c27461" lineWidth={2.7}/>
    {parts.map(({name,at},i)=><WorldLabel key={name} position={i===1&&arrived?[-.85,.58,.14]:at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.34} scale={5.1} far={1.9} resolution={128} frames={1}/>
  </>;
}

export default function ElevatorCallDemo(){
  const [selected,select]=useState(0);
  const [position,setPosition]=useState<CarPosition>('away');
  const [pending,setPending]=useState(false);
  const arrived=position==='landing';
  const moving=position==='approaching'||position==='departing';
  useEffect(()=>{
    if(!moving)return;
    const id=window.setTimeout(()=>{
      if(position==='approaching'){
        setPending(false);
        setPosition('landing');
      }else setPosition('away');
    },travelMs);
    return ()=>window.clearTimeout(id);
  },[moving,position]);
  function onCall(){
    select(0);
    if(!arrived)setPending(true);
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D model elevator call light">
        <Canvas camera={{position:[2.04,3.18,6.45],fov:42}} dpr={[1,1.6]} fallback={<p>Use the lift controls and call readout below.</p>}><Bench {...{position,pending,selected,select,onCall}}/><OrbitControls target={[0,.76,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Elevator call readings">
        <div><span>Car position</span><strong>{arrived?'At landing':moving?'Moving':'Away'}</strong></div><div><span>Arrival switch</span><strong>{arrived?'Closed':'Open'}</strong></div><div><span>Call light</span><strong>{pending?'On':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Call the lift and move it to the landing</h3>
      <p>The CALL button sets the light. Use the travel control to move the hand-operated model. Watch what happens when the car touches the roller.</p>
      <div className="gp-steps">
        <button className="gp-button" type="button" onClick={onCall}>Press CALL</button>
        <button className="gp-button gp-secondary" type="button" disabled={moving} onClick={()=>{select(1);setPosition(arrived?'departing':'approaching');}}>{arrived?'Move car away':'Move car to landing'}</button>
        <button type="button" onClick={()=>{setPosition('away');setPending(false);select(0);}}>Reset model</button>
      </div>
      <p role="status">{arrived?'Arrival switch closed. Call light off.':pending?'Call waiting. The light is on.':'Call light off. Ready for a request.'}</p>
      <ol className="gp-demo-labels">{parts.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{parts[selected].detail}</p>
    </div>
  </div>;
}
