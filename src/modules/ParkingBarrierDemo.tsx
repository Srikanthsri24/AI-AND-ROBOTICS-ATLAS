import {useEffect,useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import type {Group} from 'three';
import {WorldLabel} from './LabWorkbench';
import {ParkingLane,ParkingToyCar,StripedArm} from './ParkingBarrierParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const parts:{name:string;at:Point;detail:string}[]=[
  {name:'Approach beam · D2',at:[-.55,.56,.70],detail:'The first beam detects a car arriving. Its receiver pulls D2 low and the arm opens.'},
  {name:'Under-arm beam · D3',at:[.10,.56,.70],detail:'The second beam detects the car beneath the arm. Either blocked beam keeps the arm raised.'},
  {name:'Barrier arm and servo · D9',at:[.36,.97,-.42],detail:'The servo raises the arm while either beam is blocked. Both beams must stay clear for 1.5 seconds before lowering.'},
  {name:'Arduino Uno',at:[1.33,.32,1.23],detail:'The Uno monitors the receivers. A separate 5 V supply powers the servo, with ground shared between both supplies.'},
];
const stations=[
  {name:'Before lane',x:-1.47},
  {name:'Approach',x:-.68},
  {name:'Under arm',x:.16},
  {name:'Beyond lane',x:1.27},
];
const beams=[-.57,.10];
const clearMs=1500;

function Bench({index,approach,under,raised,selected,select}:{index:number;approach:boolean;under:boolean;raised:boolean;selected:number;select:(i:number)=>void}){
  const car=useRef<Group>(null);
  const arm=useRef<Group>(null);
  useFrame((_,delta)=>{
    const blend=1-Math.exp(-11*delta);
    if(car.current)car.current.position.x+=(stations[index].x-car.current.position.x)*blend;
    if(arm.current)arm.current.rotation.z+=((raised?1.40:0)-arm.current.rotation.z)*blend;
  });
  return <>
    <color attach="background" args={['#40535e']}/>
    <hemisphereLight args={['#e9f4ff','#947e66',2.08]}/>
    <directionalLight position={[-3,6,4]} color="#fff1db" intensity={2.15}/>
    <Box at={[0,-.095,0]} size={[4.75,.19,3.18]} color="#81908a"/>
    <group position={[0,.008,-.09]} scale={[1.13,1,1.18]}><ParkingLane/></group>
    <group ref={car} position={[stations[0].x,.117,-.09]}><ParkingToyCar/></group>
    {beams.map((x,i)=>{
      const blocked=i===0?approach:under;
      return <group key={x} onClick={()=>select(i)}>
        {[-.73,.56].map(z=><group key={z} position={[x,.169,z]}>
          <Box at={[0,.052,0]} size={[.19,.10,.17]} color={selected===i?'#d9b080':'#596c72'}/>
          <Box at={[0,.173,0]} size={[.11,.16,.13]} color="#303e44"/>
          <mesh position={[0,.189,z<0?.079:-.079]}><sphereGeometry args={[.023,17,11]}/><meshStandardMaterial color={blocked?'#dc9c6c':'#72c6d5'}/></mesh>
        </group>)}
        <Line points={blocked?[[x,.358,-.65],[x,.358,-.35]]:[[x,.358,-.65],[x,.358,.48]]} color={blocked?'#ef9e62':'#6fceda'} lineWidth={2.3} dashed dashSize={.061} gapSize={.048}/>
      </group>;
    })}
    <group position={[.33,.16,-.83]} onClick={()=>select(2)}>
      <Box at={[0,.065,0]} size={[.42,.13,.39]} color="#6b7578"/>
      <Box at={[0,.28,0]} size={[.31,.42,.27]} color={selected===2?'#d8a97a':'#426170'}/>
      <Box at={[0,.56,0]} size={[.35,.23,.29]} color="#2c3b47"/>
      <group position={[0,.58,.02]} rotation={[0,-Math.PI/2,0]}><group ref={arm}><StripedArm/></group></group>
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[1.30,.102,1.13]} size={[.94,.086,.51]} color={selected===3?'#74aca7':'#287b8a'}/>
      <Box at={[.95,.174,1.19]} size={[.18,.111,.143]} color="#becacf" metal={.62}/>
      <Box at={[1.41,.168,1.12]} size={[.24,.057,.104]} color="#26363c"/>
      {[.95,1.32].map(z=><Box key={z} at={[1.36,.162,z]} size={[.61,.054,.044]} color="#25343a"/>)}
    </group>
    {beams.map((x,i)=><Line key={x} points={[[x,.26,.57],[x,.14,.76],[.75,.107,.86],[1.11+i*.19,.18,.95]]} color={i===0?'#e3aa70':'#77bbca'} lineWidth={2.7}/>)}
    <Line points={[[.38,.40,-.78],[.65,.16,-1.0],[1.73,.10,-.75],[1.79,.11,.64],[1.62,.17,.93]]} color="#c97866" lineWidth={2.7}/>
    {parts.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.34} scale={5.2} far={1.8} resolution={128} frames={1}/>
  </>;
}

export default function ParkingBarrierDemo(){
  const [index,setIndex]=useState(0);
  const [raised,setRaised]=useState(false);
  const [selected,select]=useState(0);
  const [approach,under]=beams.map(x=>Math.abs(stations[index].x-x)<.425);
  const occupied=approach||under;
  useEffect(()=>{
    if(occupied){
      setRaised(true);
      return;
    }
    if(!raised)return;
    const timer=window.setTimeout(()=>setRaised(false),clearMs);
    return ()=>window.clearTimeout(timer);
  },[occupied,raised]);

  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D model parking barrier">
        <Canvas camera={{position:[2.02,3.32,6.3],fov:40}} dpr={[1,1.6]} fallback={<p>Use the car position and beam readouts below.</p>}><Bench {...{index,approach,under,raised,selected,select}}/><OrbitControls target={[0,.56,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Parking barrier readings"><div><span>Approach beam</span><strong>{approach?'Blocked':'Clear'}</strong></div><div><span>Under-arm beam</span><strong>{under?'Blocked':'Clear'}</strong></div><div><span>Arm command</span><strong>{raised?'Raised':'Lowered'}</strong></div></div>
    </div>
    <div className="gp-guide">
      <h3>Move a toy car through the barrier</h3>
      <p>Start at the approach, pause under the arm, then exit. Move back under the arm during the clear delay to see how it resets.</p>
      <div className="gp-steps">{stations.map(({name},i)=><button type="button" key={name} className={i===1?'gp-button':'gp-button gp-secondary'} aria-pressed={index===i} onClick={()=>{setIndex(i);select(i===1?0:i===2?1:2);}}>{name}</button>)}</div>
      <p role="status">{occupied?'Beam blocked. Hold the arm up.':raised?'Both beams clear. Waiting 1.5 seconds.':'Arm lowered. Lane clear.'}</p>
      <ol className="gp-demo-labels">{parts.map(({name},i)=><li key={name}><button className="gp-part-label" type="button" aria-pressed={i===selected} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{parts[selected].detail}</p>
    </div>
  </div>;
}
