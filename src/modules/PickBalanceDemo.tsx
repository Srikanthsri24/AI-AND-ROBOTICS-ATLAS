import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { balanceLimit, pickStages } from '../data/pick-balance';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
const pickTimes=[350,450,850,450,300];
const detail=[
 ['Lift and jaws','PCA9685 channel 0 lifts the arm. Channel 1 closes and opens the gripper around a foam block.'],
 ['Rover drive','Both motors receive the same signed command during the timed transfer. The destination depends on speed, grip and travel time.'],
 ['MPU-6050','The IMU supplies the gravity estimate and the pitch rate. The controller uses both to keep the body above its axle.'],
 ['Balancing wheels','Both wheels roll toward the lean. A tilt past the cutoff disarms the controller until the robot is reset upright.'],
] as const;

function Part({at,size,color,metal=0}: {at:Point;size:Point;color:string;metal?:number}){
 return <RoundedBox position={at} args={size} radius={.018} smoothness={2}><meshStandardMaterial color={color} roughness={.58} metalness={metal}/></RoundedBox>;
}
function Wheel({at,radius}: {at:Point;radius:number}){
 return <group position={at} rotation={[0,0,Math.PI/2]}>
  <mesh><cylinderGeometry args={[radius,radius,.17,32]}/><meshStandardMaterial color="#272e34"/></mesh>
  {[-.105,.105].map(y=><mesh key={y} position={[0,y,0]}><cylinderGeometry args={[radius*.61,radius*.61,.032,24]}/><meshStandardMaterial color="#d0a84e" metalness={.44}/></mesh>)}
 </group>;
}

export function BalanceImu({selected=false}: {selected?:boolean}){
 return <>
  <Part at={[0,.025,0]} size={[.79,.05,.54]} color={selected?'#927245':'#25689b'}/>
  <Part at={[0,.063,0]} size={[.20,.045,.19]} color="#2c333b"/>
  {[-.285,.285].map(x=><Part key={x} at={[x,.077,0]} size={[.16,.085,.25]} color="#d9d6c9"/>)}
  {[-.25,-.15,-.05,.05,.15,.25].map(x=><Part key={x} at={[x,.057,.20]} size={[.047,.019,.043]} color="#bf9c59" metal={.72}/>)}
 </>;
}

function Tag({index,position,selected,select}: {index:number;position:Point;selected:number;select:(n:number)=>void}){
 return <WorldLabel position={position} className="gp-marker-anchor">
   <button className="gp-marker" type="button" aria-label={detail[index][0]} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button>
 </WorldLabel>;
}

function PickRover({step,selected,select}: {step:number;selected:number;select:(i:number)=>void}){
 const chassis=useRef<Group>(null), lift=useRef<Group>(null), jaws=useRef<Group>(null), foam=useRef<Group>(null);
 useFrame((_,dt)=>{
  if(!chassis.current||!lift.current||!jaws.current||!foam.current)return;
  const position=chassis.current.position;
  position.z=MathUtils.damp(position.z,step>=3?-.97:.87,6,dt);
  const reach=lift.current.position;
  reach.y=MathUtils.damp(reach.y,step===2||step===3 ? .69 : .26,9,dt);
  jaws.current.children.forEach((finger,i)=>{finger.position.x=MathUtils.damp(finger.position.x,(i===0?-1:1)*(step>=1&&step<=4 ? .134 : .244),11,dt);});
  if(step>=1&&step<=4)foam.current.position.set(-2.05,reach.y-.14,position.z-.79);
  else foam.current.position.set(-2.05,.12,step===5?-1.76:.08);
 });
 return <>
  <group ref={chassis} position={[-2.05,0,.87]}>
   <Part at={[0,.198,0]} size={[.81,.12,.95]} color="#354a58" metal={.43}/>
   {[-.47,.47].map(x=><Wheel key={x} at={[x,.252,.19]} radius={.21}/>)}
   <Part at={[0,.312,.14]} size={[.55,.09,.48]} color={selected===1?'#a3834c':'#298297'}/>
   <Part at={[.10,.366,.22]} size={[.23,.04,.15]} color="#2b353c"/>
   <Part at={[0,.31,-.24]} size={[.34,.17,.31]} color="#2e566e"/>
   <Part at={[0,.404,-.355]} size={[.10,.515,.105]} color="#778e96" metal={.61}/>
   <group ref={lift} position={[0,.26,0]}>
    <Part at={[0,.037,-.54]} size={[.16,.11,.51]} color={selected===0?'#aa8950':'#a1adb0'} metal={.63}/>
    <group ref={jaws} position={[0,-.015,-.77]}>
     {[-.244,.244].map(x=><Part key={x} at={[x,0,-.014]} size={[.078,.115,.30]} color="#8ea0a8" metal={.62}/>)}
    </group>
    <Tag index={0} position={[-.41,.34,-.81]} selected={selected} select={select}/>
   </group>
   <Tag index={1} position={[.48,.58,.30]} selected={selected} select={select}/>
  </group>
  <group ref={foam} position={[-2.05,.12,.08]}>
   <Part at={[0,0,0]} size={[.21,.15,.24]} color="#dd995e"/>
  </group>
 </>;
}

type Balance={angle:number;rate:number;travel:number;drive:number;fallen:boolean;active:boolean};
const initial:Balance={angle:0,rate:0,travel:0,drive:0,fallen:false,active:false};
function physics(value:Balance,feedback:boolean):Balance{
 if(!value.active||value.fallen)return value;
 const dt=.025;
 const drive=feedback?MathUtils.clamp(15*value.angle+4*value.rate,-6,6):0;
 const rate=value.rate+dt*(9*Math.sin(value.angle)-1.55*drive);
 const angle=value.angle+dt*rate;
 if(Math.abs(angle)>=MathUtils.degToRad(balanceLimit))
  return {...value,angle:MathUtils.clamp(angle,-.54,.54),rate:0,drive:0,fallen:true};
 return {angle,rate,drive,travel:MathUtils.clamp(value.travel+drive*dt*.30,-.63,.63),fallen:false,active:Math.abs(angle)+Math.abs(rate)>.003};
}

function BalanceBot({value,selected,select}: {value:Balance;selected:number;select:(i:number)=>void}){
 const body=useRef<Group>(null), base=useRef<Group>(null);
 useFrame((_,dt)=>{
  if(body.current)body.current.rotation.x=MathUtils.damp(body.current.rotation.x,value.angle,14,dt);
  if(base.current)base.current.position.z=MathUtils.damp(base.current.position.z,value.travel,12,dt);
 });
 return <group ref={base} position={[1.58,0,0]}>
  {[-.53,.53].map(x=><Wheel key={x} at={[x,.309,0]} radius={.26}/>)}
  <Part at={[0,.309,0]} size={[1.14,.089,.081]} color="#a6b1b5" metal={.67}/>
  <group ref={body} position={[0,.309,0]}>
   <Part at={[0,.11,0]} size={[.91,.13,.51]} color="#536f77" metal={.57}/>
   {[-.34,.34].map(x=><Part key={x} at={[x,.68,0]} size={[.09,1.10,.08]} color="#919fa4" metal={.64}/>)}
   <Part at={[0,.88,0]} size={[.75,.142,.58]} color="#384d5a"/>
   <Part at={[0,1.158,0]} size={[.76,.08,.47]} color="#78949b" metal={.51}/>
   <Part at={[0,.53,.19]} size={[.47,.28,.23]} color="#343d45"/>
   <group position={[0,1.22,0]} scale={.72}><BalanceImu selected={selected===2}/></group>
   <Tag index={2} position={[-.32,1.52,.24]} selected={selected} select={select}/>
  </group>
  <Tag index={3} position={[.59,.62,.23]} selected={selected} select={select}/>
 </group>;
}

export default function PickBalanceDemo(){
 const [step,setStep]=useState(0), [state,setState]=useState(initial);
 const [transfer,setTransfer]=useState(0);
 const [feedback,setFeedback]=useState(true), [selected,setSelected]=useState(0);
 useEffect(()=>{
  if(step===0||step===5)return;
  const timer=window.setTimeout(()=>setStep(step+1),pickTimes[step-1]);
  return ()=>window.clearTimeout(timer);
 },[step]);
 useEffect(()=>{
  const timer=window.setInterval(()=>setState(value=>physics(value,feedback)),25);
  return ()=>window.clearInterval(timer);
 },[feedback]);
 const nudge=(direction:number)=>setState(value=>value.fallen?value:{...value,
   angle:value.angle+direction*.10,rate:value.rate+direction*.20,active:true,
 });
 const response=state.fallen?'Tilt cutoff':!state.active?'Upright':feedback?'Correcting lean':'Drifting without feedback';
 return <div className="gp-split gp-demo">
  <div className="gp-story-stage">
   <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive gripper rover and balancing robot">
    <Canvas dpr={[1,1.5]} camera={{position:[3.2,4.6,8.7],fov:43}} fallback={<p>The experiment controls and readouts are available without WebGL.</p>}>
     <color attach="background" args={['#293f51']}/><ambientLight intensity={1.35}/>
     <directionalLight position={[3,6,5]} intensity={2.6}/><directionalLight position={[-5,4,-3]} intensity={1.25} color="#b7cde9"/>
     <Part at={[0,-.14,0]} size={[6.97,.26,4.54]} color="#947154"/>
     <Part at={[-1.76,.024,0]} size={[3.32,.079,4.42]} color="#5c6d74"/>
     <Part at={[1.73,.024,0]} size={[3.42,.079,4.42]} color="#617e71"/>
     <Part at={[0,.10,0]} size={[.066,.112,4.39]} color="#b9c1bd"/>
     {[.08,-1.76].map(z=><Part key={z} at={[-2.05,.076,z]} size={[.65,.026,.61]} color="#a18751"/>)}
     <Line points={[[-2.98,.073,1.72],[-2.98,.073,-1.88]]} color="#c2c1ab" lineWidth={2}/>
     <Line points={[[.44,.071,0],[3.12,.071,0]]} color="#b9c3ae" dashed dashSize={.10} gapSize={.085}/>
     <PickRover key={transfer} step={step} selected={selected} select={setSelected}/>
     <BalanceBot value={state} selected={selected} select={setSelected}/>
     <WorldLabel position={[-2.04,.13,1.75]} className="gp-marker-anchor"><span className="gp-rocket-field-label">Foam-block transfer</span></WorldLabel>
     <WorldLabel position={[1.59,.13,1.38]} className="gp-marker-anchor"><span className="gp-rocket-field-label">Balance test</span></WorldLabel>
     <ContactShadows position={[0,.045,0]} scale={9} opacity={.39} blur={2.4} far={4}/>
     <OrbitControls target={[0,.55,0]} minDistance={4} maxDistance={14} enablePan={false}/>
    </Canvas>
   </div>
   <div className="gp-demo-result" aria-label="Transfer and balance readings">
    <div><span>Transfer</span><strong>{pickStages[step]}</strong></div>
    <div><span>Pitch</span><strong>{MathUtils.radToDeg(state.angle).toFixed(1)}°</strong></div>
    <div><span>Balance</span><strong>{response}</strong></div>
   </div>
  </div>
  <div className="gp-guide">
   <h3>Move a foam block</h3>
   <div className="gp-steps">
    <button type="button" className="gp-button" disabled={step!==0&&step!==5} onClick={()=>{setTransfer(value=>value+1);setStep(1);}}>{step===5?'Replay transfer':'Run transfer'}</button>
    <button type="button" onClick={()=>{setTransfer(value=>value+1);setStep(0);}}>Reset transfer</button>
   </div>
   <p>Watch the gripper close, lift, move, lower and release the block.</p>
   <h3>Disturb the balancing platform</h3>
   <div className="gp-steps">
    <button type="button" disabled={state.fallen} onClick={()=>nudge(1)}>Nudge forward</button>
    <button type="button" disabled={state.fallen} onClick={()=>nudge(-1)}>Nudge backward</button>
    <button type="button" aria-pressed={feedback} onClick={()=>setFeedback(value=>!value)}>{feedback?'Disable feedback':'Enable feedback'}</button>
    <button type="button" onClick={()=>setState(initial)}>Reset upright</button>
   </div>
   <p><strong>Simulated wheel command</strong> <output aria-label="Wheel effort">{Math.round(state.drive/6*100)}%</output></p>
   <p className="gp-demo-description">Compare the same nudge with and without feedback. The model stops past {balanceLimit}°.</p>
   <h4>Inspect the mechanisms</h4>
   <ol className="gp-demo-labels">{detail.map(([name],index)=><li key={name}>
    <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
   </li>)}</ol>
   <p className="gp-demo-description">{detail[selected][1]}</p>
  </div>
 </div>;
}
