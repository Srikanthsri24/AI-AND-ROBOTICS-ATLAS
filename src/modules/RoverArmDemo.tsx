import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { jointNames } from '../data/rover-arm';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
const labels=[
  ['Ultrasonic sensor','Measures forward clearance. When the echo is missing, the rover stops.'],
  ['Differential drive','The TB6612 drives the wheels together to go straight and in opposite directions to turn.'],
  ['PCA9685 servo driver','Receives I²C commands and supplies a different pulse on each servo signal channel.'],
  ['Gripper','This is the sixth channel. It opens and closes the fingers without adding a sixth positioning joint.'],
] as const;

function Block({at,size,color,metal=0}: {at:Point;size:Point;color:string;metal?:number}) {
  return <RoundedBox position={at} args={size} radius={.021} smoothness={2}>
    <meshStandardMaterial color={color} metalness={metal} roughness={.58}/>
  </RoundedBox>;
}
function Disk({at,radius,height,color,axle=false}: {at:Point;radius:number;height:number;color:string;axle?:boolean}) {
  return <mesh position={at} rotation={axle?[0,0,Math.PI/2]:[0,0,0]}>
    <cylinderGeometry args={[radius,radius,height,30]}/><meshStandardMaterial color={color} metalness={.51} roughness={.44}/>
  </mesh>;
}

export function ArmPwmBoard({selected=false}: {selected?:boolean}) {
  return <>
    <Block at={[0,0,0]} size={[1.31,.069,.60]} color={selected?'#a4814f':'#23669a'}/>
    <Block at={[-.04,.064,-.09]} size={[.32,.048,.123]} color="#252e39"/>
    <Block at={[-.52,.114,-.12]} size={[.21,.18,.22]} color="#477d68"/>
    {Array.from({length:16},(_,i)=><Block key={i} at={[-.55+i*.072,.087,.186]} size={[.047,.114,.172]} color={i<6?'#baaa84':'#313c47'}/>)}
  </>;
}

export function TrainingArm({joint=-1,active=false,markers=false,selected=-1,select}: {
  joint?:number;active?:boolean;markers?:boolean;selected?:number;select?:(index:number)=>void;
}) {
  const base=useRef<Group>(null), shoulder=useRef<Group>(null), elbow=useRef<Group>(null);
  const pitch=useRef<Group>(null), roll=useRef<Group>(null), fingers=useRef<Group>(null);
  useFrame((_,delta)=>{
    const jog=(index:number)=>active && joint===index ? .19 : 0;
    if(base.current)base.current.rotation.y=MathUtils.damp(base.current.rotation.y,jog(0),10,delta);
    if(shoulder.current)shoulder.current.rotation.z=MathUtils.damp(shoulder.current.rotation.z,-.38+jog(1),10,delta);
    if(elbow.current)elbow.current.rotation.z=MathUtils.damp(elbow.current.rotation.z,-.83+jog(2),10,delta);
    if(pitch.current)pitch.current.rotation.z=MathUtils.damp(pitch.current.rotation.z,-.31+jog(3),10,delta);
    if(roll.current)roll.current.rotation.y=MathUtils.damp(roll.current.rotation.y,jog(4),10,delta);
    fingers.current?.children.forEach((finger,index)=>{
      const target=(index===0?-1:1)*(.13-jog(5)*.26);
      finger.position.x=MathUtils.damp(finger.position.x,target,10,delta);
    });
  });
  const channelLabel=(index:number,position:Point)=>markers&&joint===index&&active
    ? <WorldLabel position={position} className="gp-marker-anchor"><span className="gp-rocket-field-label">{jointNames[index]}</span></WorldLabel>
    : null;
  return <>
    <Block at={[0,.088,0]} size={[1.12,.15,.98]} color="#758487" metal={.55}/>
    <Disk at={[0,.231,0]} radius={.391} height={.18} color="#34414b"/>
    <group ref={base} position={[0,.33,0]}>
      {channelLabel(0,[-.43,.14,.35])}
      <Block at={[0,.16,0]} size={[.52,.30,.50]} color="#6f828d" metal={.57}/>
      <group ref={shoulder} position={[0,.31,0]} rotation={[0,0,-.38]}>
        {channelLabel(1,[-.43,.09,.28])}
        <Block at={[0,.41,0]} size={[.27,.88,.30]} color="#98a5ab" metal={.67}/>
        <Block at={[0,.41,.169]} size={[.14,.65,.056]} color="#3d545f"/>
        <Disk at={[0,.09,.185]} radius={.134} height={.09} color="#7d8a91" axle/>
        <group ref={elbow} position={[0,.89,0]} rotation={[0,0,-.83]}>
          {channelLabel(2,[-.39,.19,.27])}
          <Block at={[0,.06,0]} size={[.33,.22,.39]} color="#34444e"/>
          <Block at={[0,.35,0]} size={[.235,.67,.251]} color="#9daab0" metal={.67}/>
          <Block at={[0,.34,.14]} size={[.118,.37,.041]} color="#40535d"/>
          <group ref={pitch} position={[0,.66,0]} rotation={[0,0,-.31]}>
            {channelLabel(3,[-.33,.11,.24])}
            <Block at={[0,.074,0]} size={[.27,.22,.31]} color="#384b57"/>
            <group ref={roll} position={[0,.22,0]}>
              {channelLabel(4,[-.30,.07,.26])}
              {channelLabel(5,[-.29,.22,.30])}
              <Disk at={[0,0,0]} radius={.112} height={.096} color="#9aa7ad"/>
              <Block at={[0,.077,0]} size={[.27,.081,.14]} color={selected===3?'#d3ab68':'#9ca9ac'} metal={.62}/>
              <group ref={fingers}>
                {[-.13,.13].map(x=><Block key={x} at={[x,.204,0]} size={[.056,.228,.092]} color="#7f969f" metal={.58}/>)}
              </group>
              {markers&&<WorldLabel position={[.30,.41,.19]} className="gp-marker-anchor">
                <button className="gp-marker" type="button" aria-label="Gripper" aria-pressed={selected===3} onClick={()=>select?.(3)}>4</button>
              </WorldLabel>}
            </group>
          </group>
        </group>
      </group>
    </group>
  </>;
}

const course=[{x:-2.35,z:1.44,yaw:Math.PI},{x:-2.35,z:.66,yaw:Math.PI},{x:-2.35,z:.66,yaw:Math.PI/2},
  {x:-1.09,z:.66,yaw:Math.PI/2},{x:-1.09,z:-.63,yaw:Math.PI}];
function Rover({step,obstacle,echo,selected,select}: {step:number;obstacle:boolean;echo:boolean;selected:number;select:(i:number)=>void}) {
  const rover=useRef<Group>(null);
  const pose=obstacle?course[step]:{x:-2.35,z:1.44-step*.56,yaw:Math.PI};
  useFrame((_,delta)=>{
    if(!rover.current)return;
    rover.current.position.x=MathUtils.damp(rover.current.position.x,pose.x,7,delta);
    rover.current.position.z=MathUtils.damp(rover.current.position.z,pose.z,7,delta);
    rover.current.rotation.y=MathUtils.damp(rover.current.rotation.y,pose.yaw,8,delta);
  });
  return <group ref={rover} position={[-2.35,0,1.44]} rotation={[0,Math.PI,0]}>
    <Block at={[0,.208,0]} size={[.68,.084,.91]} color="#344856" metal={.55}/>
    {[-.37,.37].map(x=><group key={x}>
      <Disk at={[x,.194,-.13]} radius={.189} height={.095} color="#282f34" axle/>
      <Disk at={[x*1.15,.194,-.13]} radius={.113} height={.044} color="#cba144" axle/>
    </group>)}
    <Block at={[0,.274,-.16]} size={[.44,.049,.38]} color="#2993a5"/>
    <Block at={[0,.316,-.27]} size={[.21,.047,.097]} color="#252f38"/>
    <Block at={[0,.303,.30]} size={[.48,.149,.035]} color={selected===0?'#bd9856':'#257aa5'}/>
    {[-.122,.122].map(x=><mesh key={x} position={[x,.31,.348]} rotation={[Math.PI/2,0,0]}>
      <cylinderGeometry args={[.081,.081,.086,22]}/><meshStandardMaterial color="#afb9bb" metalness={.69}/>
    </mesh>)}
    {echo&&<Line points={[[0,.313,.40],[0,.313,obstacle && step===1 ? .92 : 1.20]]} color="#93dccc" dashed dashSize={.065} gapSize={.044} lineWidth={1.4}/>}
    <WorldLabel position={[-.18,.72,.30]} className="gp-marker-anchor">
      <button className="gp-marker" type="button" aria-label="Ultrasonic sensor" aria-pressed={selected===0} onClick={()=>select(0)}>1</button>
    </WorldLabel>
    <WorldLabel position={[.27,.53,-.27]} className="gp-marker-anchor">
      <button className="gp-marker" type="button" aria-label="Differential drive" aria-pressed={selected===1} onClick={()=>select(1)}>2</button>
    </WorldLabel>
  </group>;
}

export default function RoverArmDemo(){
  const [step,setStep]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [obstacle,setObstacle]=useState(true);
  const [echo,setEcho]=useState(true);
  const [joint,setJoint]=useState(0);
  const [active,setActive]=useState(false);
  const [selected,setSelected]=useState(0);
  useEffect(()=>{
    if(!playing||!echo) return;
    const timer=window.setTimeout(()=>{
      const next=Math.min(course.length-1,step+1);
      setStep(next);
      if(next===course.length-1)setPlaying(false);
    },850);
    return ()=>window.clearTimeout(timer);
  },[playing,step,echo]);
  useEffect(()=>{
    if(!active)return;
    const timer=window.setTimeout(()=>setActive(false),650);
    return ()=>window.clearTimeout(timer);
  },[active]);
  const roverState=!echo?'Stopped · no echo':step===4?'Course complete':obstacle&&step===1?'Near echo · turning':'Path clear';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive 3D rover and servo arm">
        <Canvas dpr={[1,1.5]} camera={{position:[3.1,4.7,8.4],fov:42}} fallback={<p>Use the bench controls and readouts without WebGL.</p>}>
          <color attach="background" args={['#273e51']}/><ambientLight intensity={1.35}/>
          <directionalLight position={[4,7,5]} intensity={2.65}/><directionalLight position={[-5,3,-4]} intensity={1.3} color="#b3cbe4"/>
          <Block at={[0,-.14,0]} size={[7.03,.254,4.65]} color="#967457"/>
          <Block at={[-1.82,.025,0]} size={[3.36,.079,4.49]} color="#54636b"/>
          <Block at={[1.67,.025,0]} size={[3.49,.079,4.49]} color="#627f75"/>
          {[-3.35,-.20].map(x=><Block key={x} at={[x,.107,0]} size={[.076,.13,4.46]} color="#9caaae"/>)}
          {[-1.86,-1.31,-.76,.43,.98,1.54].map(z=><Block key={z} at={[-1.75,.072,z]} size={[.027,.012,.26]} color="#d3b774"/>)}
          {obstacle&&<Block at={[-2.32,.26,-.31]} size={[.67,.40,.38]} color="#a97c57"/>}
          <Rover step={step} obstacle={obstacle} echo={echo} selected={selected} select={setSelected}/>
          <group position={[.91,.068,-.29]}><TrainingArm joint={joint} active={active} markers selected={selected} select={setSelected}/></group>
          <group position={[1.22,.14,1.09]}><ArmPwmBoard selected={selected===2}/></group>
          <Line points={[[1.39,.17,.99],[1.59,.27,.61],[1.25,.19,.11],[1.04,.26,-.06]]} color="#e8b169" lineWidth={1.6}/>
          <Line points={[[1.10,.19,1.07],[.92,.30,.74],[.71,.23,.20],[.82,.27,-.08]]} color="#aa7b76" lineWidth={1.5}/>
          <WorldLabel position={[1.05,.77,1.14]} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label="PCA9685 servo driver" aria-pressed={selected===2} onClick={()=>setSelected(2)}>3</button></WorldLabel>
          <WorldLabel position={[1.06,.12,1.94]} className="gp-marker-anchor"><span className="gp-rocket-field-label">Arm station</span></WorldLabel>
          <WorldLabel position={[-2.35,.08,2.11]} className="gp-marker-anchor"><span className="gp-rocket-field-label">Rover course</span></WorldLabel>
          <ContactShadows position={[0,.049,0]} scale={9} opacity={.39} blur={2.4} far={4}/>
          <OrbitControls target={[0,.57,0]} minDistance={4} maxDistance={14} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Rover and arm readings">
        <div><span>Rover response</span><strong>{roverState}</strong></div>
        <div><span>Arm channel</span><strong>{jointNames[joint]}</strong></div>
        <div><span>Servo command</span><strong>{active?'Jogging':'Neutral'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Drive the rover</h3>
      <p>Start with a box on the course and watch the rover turn. Interrupt the echo to stop it.</p>
      <div className="gp-steps">
        <button className="gp-button" type="button" onClick={()=>{if(step===4)setStep(0);setPlaying(value=>!value);}}>{playing?'Pause rover':'Run rover'}</button>
        <button type="button" aria-pressed={obstacle} onClick={()=>{setPlaying(false);setStep(0);setObstacle(value=>!value);}}>{obstacle?'Remove obstacle':'Place obstacle'}</button>
        <button type="button" aria-pressed={!echo} onClick={()=>setEcho(value=>!value)}>{echo?'Block echo':'Restore echo'}</button>
      </div>
      <h3>Jog an arm channel</h3>
      <p>Choose a joint or the gripper. Jog moves one servo and returns it to neutral.</p>
      <label htmlFor="rover-arm-channel">Servo channel</label>
      <select id="rover-arm-channel" disabled={active} value={joint} onChange={event=>setJoint(Number(event.target.value))}>
        {jointNames.map((name,i)=><option value={i} key={name}>{i} · {name}</option>)}
      </select>
      <div className="gp-steps"><button type="button" disabled={active} onClick={()=>setActive(true)}>Jog selected channel</button></div>
      <h4>Inspect both builds</h4>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>setSelected(i)}><span>{i+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
