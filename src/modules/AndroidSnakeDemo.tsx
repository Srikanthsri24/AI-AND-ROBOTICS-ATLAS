import { useEffect, useReducer, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { snakeAngles, snakeCommands, snakeMotion, type SnakeCommand } from '../data/android-snake';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Motion={command:SnakeCommand;elapsed:number;angles:number[]};
type Action={command:SnakeCommand}|{delta:number};
const initial:Motion={command:'S',elapsed:0,angles:[0,0,0]};
const tips=[
  ['Head and radio','The Arduino reads single-character commands from the Android phone through the Bluefruit UART breakout.'],
  ['Joint 1 · D5','The head servo turns the second link. Its target comes first in the wave.'],
  ['Joint 2 · D6','The middle servo follows one-third of a cycle later. Its horn carries the next link.'],
  ['Joint 3 · D9','The tail servo follows another third of a cycle later.'],
  ['Tail skid','Felt pads support the links on a flat bench and let each segment slide as it bends.'],
] as const;

function motionReducer(state:Motion,action:Action):Motion{
  if('command' in action)return {...state,command:action.command,elapsed:0};
  let next=state;
  for(let remaining=action.delta;remaining>0;remaining-=20){
    const tick=Math.min(remaining,20);
    const elapsed=next.command==='S'?next.elapsed:Math.min(snakeMotion.burstMs,next.elapsed+tick);
    const targets=snakeAngles(next.command,elapsed);
    const max=snakeMotion.stepDegrees*tick/20;
    const angles=next.angles.map((value,index)=>value+MathUtils.clamp(Math.round(targets[index])-value,-max,max));
    next={command:elapsed>=snakeMotion.burstMs?'S':next.command,elapsed,angles};
  }
  return next;
}

function Box({at,size,color,metal=0}:{at:Point;size:Point;color:string;metal?:number}){
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.16} smoothness={2} receiveShadow castShadow>
    <meshStandardMaterial color={color} roughness={metal?.34:.68} metalness={metal}/>
  </RoundedBox>;
}

export function CardLink({highlighted=false}:{highlighted?:boolean}){
  return <>
    <Box at={[0,.09,0]} size={[1.02,.094,.62]} color={highlighted?'#e6bf64':'#c49965'}/>
    <Box at={[0,.146,0]} size={[.94,.042,.55]} color="#d3ae7e"/>
    {[-.30,.29].map(x=><Box key={x} at={[x,.028,0]} size={[.20,.05,.39]} color="#535b59"/>)}
    {Array.from({length:9},(_,i)=><Box key={i} at={[-.41+.103*i,.084,.310]} size={[.021,.027,.011]} color="#836240"/>)}
  </>;
}

function Joint({index,angle,selected,select,labels,children}:{
  index:number;angle:number;selected:number;select:(i:number)=>void;labels:boolean;children:ReactNode;
}) {
  const hinge=useRef<Group>(null);
  useFrame((_,delta)=>{
    if(hinge.current)hinge.current.rotation.y=MathUtils.damp(hinge.current.rotation.y,MathUtils.degToRad(angle),17,delta);
  });
  return <group position={[1.13,0,0]}>
    <Box at={[-.07,.215,0]} size={[.31,.196,.27]} color={selected===index?'#5c9cc0':'#2f6f9d'}/>
    <mesh position={[0,.327,0]}><cylinderGeometry args={[.088,.088,.039,20]}/><meshStandardMaterial color="#d6dbd8" metalness={.32}/></mesh>
    <mesh position={[0,.349,0]}><cylinderGeometry args={[.035,.035,.020,15]}/><meshStandardMaterial color="#acb3b3" metalness={.72}/></mesh>
    <group ref={hinge}>
      <Box at={[.22,.239,0]} size={[.20,.155,.18]} color="#a18c70"/>
      <Box at={[.149,.32,0]} size={[.28,.048,.091]} color="#e4d4a8"/>
      <Line points={[[.03,.260,.135],[.129,.366,.208],[.344,.269,.20],[.54,.187,.19]]}
        color="#bd6054" lineWidth={1.72}/>
      {children}
    </group>
    {labels&&<Marker index={index} at={[0,.34,0]} tag={[0,.82,-.12]} selected={selected} select={select}/>}
  </group>;
}

function Marker({index,at,tag,selected,select}:{index:number;at:Point;tag:Point;selected:number;select:(i:number)=>void}){
  return <><Line points={[at,tag]} color={selected===index?'#ffe297':'#c3d5de'} lineWidth={1.3}/>
    <WorldLabel position={tag} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={tips[index][0]}
      aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button></WorldLabel>
  </>;
}

function Snake({angles,selected,select,labels,connected}:{
  angles:number[];selected:number;select:(i:number)=>void;labels:boolean;connected:boolean;
}){
  const controls={selected,select,labels};
  return <>
    <color attach="background" args={['#253747']}/>
    <ambientLight intensity={.64}/>
    <directionalLight intensity={2.48} position={[-5,8,7]} color="#fff0d6"/>
    <directionalLight intensity={1.35} position={[5,6,-6]} color="#c2dfff"/>
    <Box at={[0,-.16,.05]} size={[12,.30,8]} color="#435664"/>
    <Box at={[.13,.030,.16]} size={[6.48,.069,3.25]} color="#425d66"/>
    {Array.from({length:10},(_,i)=><Box key={i} at={[-2.94+.66*i,.068,.38]} size={[.028,.007,3.02]} color="#59757b"/>)}
    {Array.from({length:5},(_,i)=><Box key={i} at={[.10,.068,-1.12+.66*i]} size={[6.12,.008,.018]} color="#59757b"/>)}
    <group position={[-2.55,.141,-.33]}>
      <group position={[.56,0,0]}>
        <CardLink highlighted={selected===0}/>
        <group position={[-.12,.15,0]} scale={.77}><Uno at={[0,0,0]} highlighted={selected===0}/></group>
        <Box at={[-.36,.195,-.133]} size={[.18,.052,.29]} color="#275d92"/>
        <mesh position={[-.365,.238,-.207]}><sphereGeometry args={[.026,13,8]}/>
          <meshStandardMaterial color="#64aecb" emissive="#55c6ff" emissiveIntensity={connected?2.45:.1}/></mesh>
        <Box at={[-.51,.099,0]} size={[.18,.13,.40]} color="#748c85"/>
      </group>
      <Joint index={1} angle={angles[0]} {...controls}>
        <group position={[.55,0,0]}><CardLink highlighted={selected===1}/></group>
        <Joint index={2} angle={angles[1]} {...controls}>
          <group position={[.55,0,0]}><CardLink highlighted={selected===2}/></group>
          <Joint index={3} angle={angles[2]} {...controls}>
            <group position={[.55,0,0]}><CardLink highlighted={selected===3||selected===4}/></group>
            {labels&&<Marker index={4} at={[.66,.04,.24]} tag={[.92,.52,.50]} selected={selected} select={select}/>}
          </Joint>
        </Joint>
      </Joint>
      {labels&&<Marker index={0} at={[.30,.27,-.15]} tag={[.17,.82,-.23]} selected={selected} select={select}/>}
    </group>
    <Box at={[-2.53,.151,1.26]} size={[.73,.17,.95]} color="#26313d"/>
    <Box at={[-2.53,.246,1.26]} size={[.61,.025,.84]} color={connected?'#34607f':'#364758'}/>
    {[-.23,-.09,.05].map((z,i)=><Box key={z} at={[-2.52,.261,1.26+z]} size={[.39-i*.048,.011,.034]} color={connected?'#86bad2':'#576b83'}/>)}
    <Box at={[-1.55,.157,-1.27]} size={[.62,.13,.39]} color="#303b42"/>
    <Line points={[[-1.65,.226,-1.07],[-1.48,.157,-.85],[-1.81,.237,-.56],[-1.99,.33,-.37]]} color="#ca8370" lineWidth={1.73}/>
    <Line points={[[-1.76,.216,-1.07],[-1.58,.151,-.85],[-1.92,.228,-.57],[-2.04,.32,-.37]]} color="#28333a" lineWidth={1.73}/>
    <ContactShadows position={[0,.004,0]} scale={10} opacity={.46} blur={2.8}/>
  </>;
}

export default function AndroidSnakeDemo(){
  const [state,dispatch]=useReducer(motionReducer,initial);
  const [connected,setConnected]=useState(false),[clock,setClock]=useState(true),[selected,select]=useState(1),[labels,setLabels]=useState(true);
  const [notice,setNotice]=useState('Connect the simulated Android phone to send a command.');
  const active=state.command!=='S'||state.angles.some(angle=>angle!==0);
  useEffect(()=>{
    if(!clock||!active)return;
    const timer=window.setInterval(()=>dispatch({delta:40}),40);
    return ()=>window.clearInterval(timer);
  },[clock,active]);
  const posture=state.command==='W'?'Wave':state.command==='L'?'Bend left':state.command==='R'?'Bend right':active?'Centering':'Straight';

  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D Arduino snake robot">
        <Canvas camera={{position:[.27,6.25,7.55],fov:41}} dpr={[1,1.6]} fallback={<p>Use the controls and joint-angle readout to trace the waveform.</p>}>
          <Snake angles={state.angles} selected={selected} select={select} labels={labels} connected={connected}/>
          <OrbitControls target={[-.02,.20,.11]} minDistance={4.7} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Snake joint readings">
        {state.angles.map((angle,i)=><div key={i}><span>Joint {i+1} · D{[5,6,9][i]}</span><strong>{Math.round(angle)}°</strong></div>)}
      </div>
    </div>
    <div className="gp-guide">
      <h3>Watch the bend travel</h3>
      <p>Connect the phone and send W. Pause or advance one step to compare where each joint is in the wave.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>{
          setConnected(value=>!value);
          setNotice(connected?'Phone disconnected. An active burst finishes within its four-second limit.':'Phone connected. Choose a command.');
        }}>{connected?'Disconnect Android':'Connect Android'}</button>
        <button type="button" aria-pressed={labels} onClick={()=>setLabels(value=>!value)}>Scene labels</button>
      </div>
      <div className="gp-steps" role="group" aria-label="Snake commands">
        {snakeCommands.map(([command,label])=><button type="button" key={command} disabled={!connected}
          onClick={()=>{dispatch({command});setNotice(`Sent ${command}. ${label}.`);}}><code>{command}</code> {label}</button>)}
      </div>
      <div className="gp-steps">
        <button type="button" onClick={()=>setClock(value=>!value)}>{clock?'Pause time':'Resume time'}</button>
        <button type="button" onClick={()=>{setClock(false);dispatch({delta:250});}}>Step 250 ms</button>
      </div>
      <p className="gp-demo-description" role="status">{posture}{state.command!=='S'?` · ${(state.elapsed/1000).toFixed(2)} / 4 s`:''}</p>
      <p>{notice}</p>
      <ol className="gp-demo-labels">{tips.map(([name],i)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{tips[selected][1]}</p>
    </div>
  </div>;
}
