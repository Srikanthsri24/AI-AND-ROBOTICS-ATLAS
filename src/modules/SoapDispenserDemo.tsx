import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { MathUtils, Vector2, type Group } from 'three';
import { soapTiming } from '../data/soap-dispenser';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Mode='clear'|'ready'|'press'|'refill';
type Controller={mode:Mode;streak:number;changed:number;strokes:number};
const baseState:Controller={mode:'clear',streak:0,changed:0,strokes:0};
const trayDistance=25;
function sample(state:Controller,cm:number|null,now:number):Controller{
  if(state.mode==='press') return now-state.changed>=soapTiming.pressMs ? {...state,mode:'refill',changed:now} : state;
  if(state.mode==='refill') return now-state.changed>=soapTiming.refillMs ? {...state,mode:'clear',changed:now} : state;
  const qualifies=cm!==null&&(state.mode==='clear'
    ? cm>=soapTiming.clearMin
    : cm>=soapTiming.nearMin&&cm<=soapTiming.nearMax);
  if(!qualifies) return state.streak ? {...state,streak:0} : state;
  if(state.streak+1<soapTiming.confirm) return {...state,streak:state.streak+1};
  const press=state.mode==='ready';
  return {mode:press?'press':'ready',changed:now,streak:0,strokes:state.strokes+(press?1:0)};
}

const inspection=[
  ['Ultrasonic sensor','D2 starts a pulse. D3 measures the echo. Three valid echoes in the 4–12 cm range trigger one stroke after the dispenser is armed.'],
  ['Servo horn','D9 sets the servo angle. The short horn presses the pump head, then backs away to let its spring return.'],
  ['Pump bottle','The head moves the pump piston. Keep the bottle upright and prime the pump before the first test.'],
  ['Arduino Uno','The Uno remembers the completed stroke. Three valid clear readings at 18 cm or farther are required before it can dispense again.'],
] as const;

function Panel({at,size,color,metal=0,radius=.019}: {at:Point;size:Point;color:string;metal?:number;radius?:number}) {
  return <RoundedBox position={at} args={size} radius={radius} smoothness={2}>
    <meshStandardMaterial color={color} metalness={metal} roughness={.6}/>
  </RoundedBox>;
}

export function PumpBottle({press=false,selected=false}: {press?:boolean;selected?:boolean}) {
  const head=useRef<Group>(null);
  const vessel=useMemo(()=>[[0,.02],[.39,.02],[.45,.08],[.46,.17],[.46,1.05],[.44,1.17],[.38,1.25],
    [.29,1.31],[.235,1.39],[.235,1.45],[0,1.45]].map(([r,y])=>new Vector2(r,y)),[]);
  const fill=useMemo(()=>[[0,.045],[.38,.045],[.428,.107],[.434,.18],[.434,1.07],[.42,1.14],[0,1.14]]
    .map(([r,y])=>new Vector2(r,y)),[]);
  useFrame((_,delta)=>{
    if(head.current) head.current.position.y=MathUtils.damp(head.current.position.y,press?1.69:1.82,15,delta);
  });
  return <>
    <mesh><latheGeometry args={[fill,48]}/><meshStandardMaterial color={selected?'#408eab':'#246da8'} roughness={.33} metalness={.11}/></mesh>
    <mesh renderOrder={1}><latheGeometry args={[vessel,56]}/>
      <meshPhysicalMaterial color="#b8d3dd" roughness={.19} metalness={.07} clearcoat={.92} opacity={.34} transparent depthWrite={false}/>
    </mesh>
    <mesh position={[0,1.465,0]}><cylinderGeometry args={[.245,.26,.205,36]}/><meshStandardMaterial color="#e1ded4" roughness={.55}/></mesh>
    {Array.from({length:22},(_,i)=>{
      const turn=i*Math.PI*2/22;
      return <mesh key={i} position={[.253*Math.sin(turn),1.457,.253*Math.cos(turn)]}><boxGeometry args={[.014,.154,.014]}/><meshStandardMaterial color="#c9c9c1"/></mesh>;
    })}
    <group ref={head} position={[0,1.82,0]}>
      <mesh position={[0,-.176,0]}><cylinderGeometry args={[.073,.073,.255,20]}/><meshStandardMaterial color="#dfded7"/></mesh>
      <Panel at={[0,-.021,.182]} size={[.306,.145,.636]} color="#ede8d9" radius={.055}/>
      <Panel at={[0,-.098,.449]} size={[.189,.066,.106]} color="#d8d5ca"/>
    </group>
  </>;
}

function Sonar({selected}: {selected:boolean}) {
  return <group position={[.28,1.72,.65]}>
    <Panel at={[0,0,0]} size={[.65,.041,.325]} color={selected?'#388ca8':'#2677a4'}/>
    {[-.155,.155].map(x=><group key={x} position={[x,-.072,0]}>
      <mesh><cylinderGeometry args={[.107,.107,.117,28]}/><meshStandardMaterial color="#b6bec2" metalness={.67} roughness={.31}/></mesh>
      <mesh position={[0,-.065,0]}><cylinderGeometry args={[.082,.082,.014,24]}/><meshStandardMaterial color="#525d62"/></mesh>
    </group>)}
  </group>;
}

function Hand({at}: {at:Point}) {
  return <group position={at}>
    <Panel at={[0,-.048,.09]} size={[.42,.108,.41]} color="#c9a287" radius={.066}/>
    {[-.157,-.053,.053,.156].map((x,index)=><Panel key={x} at={[x,-.037,-.16+(index===0||index===3 ? .036 : 0)]}
      size={[.082,.082,index===0||index===3 ? .259 : .338]} color="#c9a287" radius={.036}/>)}
    <group position={[-.235,-.052,.12]} rotation={[0,-.48,0]}>
      <Panel at={[0,0,-.10]} size={[.088,.086,.23]} color="#c9a287" radius={.039}/>
    </group>
    <Panel at={[0,-.064,.43]} size={[.28,.124,.36]} color="#5f7490" radius={.046}/>
  </group>;
}

function Drops({flow,handY}: {flow:boolean;handY:number}) {
  const group=useRef<Group>(null);
  const elapsed=useRef(0);
  useFrame((_,delta)=>{
    if(!flow){elapsed.current=0;return;}
    elapsed.current+=delta;
    group.current?.children.forEach((drop,i)=>{
      const t=elapsed.current*3.6-i*.23;
      drop.visible=t>=0&&t<1;
      if(drop.visible)drop.position.set(0,MathUtils.lerp(1.66,handY,t*t),.475);
    });
  });
  return <group ref={group} visible={flow}>{[0,1,2,3].map(i=><mesh key={i} scale={[.8,1,.8]}>
    <sphereGeometry args={[.041,14,10]}/><meshStandardMaterial color="#54ade3" roughness={.22} metalness={.17}/>
  </mesh>)}</group>;
}

function Bench({hand,distance,echo,press,selected,select}: {
  hand:boolean;distance:number;echo:boolean;press:boolean;selected:number;select:(value:number)=>void;
}) {
  const arm=useRef<Group>(null);
  useFrame((_,delta)=>{
    if(arm.current)arm.current.rotation.z=MathUtils.damp(arm.current.rotation.z,press ? .27 : 0,15,delta);
  });
  const handY=Math.max(.209,1.575-distance*.057);
  return <>
    <color attach="background" args={['#273e51']}/>
    <ambientLight intensity={1.34}/><directionalLight position={[3,7,5]} intensity={2.62}/>
    <directionalLight position={[-4,4,-3]} intensity={1.38} color="#b7cbe8"/>
    <Panel at={[0,-.142,0]} size={[5.68,.25,3.74]} color="#967158"/>
    <Panel at={[0,.013,0]} size={[5.53,.075,3.62]} color="#607d75"/>
    <Panel at={[.34,.114,.24]} size={[2.30,.142,2.33]} color="#879da5" metal={.34}/>
    <Panel at={[.34,.193,.24]} size={[2.13,.03,2.15]} color="#4d6979"/>
    {[-.94,1.40].map(z=><Panel key={z} at={[.34,.195,z]} size={[2.32,.16,.087]} color="#a8bac0" metal={.32}/>)}
    {[-.84,1.50].map(x=><Panel key={x} at={[x,.196,.24]} size={[.091,.16,2.31]} color="#a8bac0" metal={.32}/>)}
    <Panel at={[.56,.224,.68]} size={[.77,.031,.73]} color="#aeada2"/>
    <Panel at={[0,.221,-.15]} size={[1.05,.073,.95]} color="#47798b" metal={.31}/>
    <group position={[0,.265,-.15]}><PumpBottle press={press} selected={selected===2}/></group>
    <group position={[0,.265,-.15]}><Drops flow={press} handY={hand?handY-.265:.01}/></group>
    <Panel at={[.97,1.055,-.26]} size={[.106,1.63,.113]} color="#929fa4" metal={.65}/>
    <Panel at={[.75,1.90,-.26]} size={[.55,.132,.115]} color="#9aa8ae" metal={.64}/>
    <Panel at={[.82,1.73,.23]} size={[.092,.085,1.11]} color="#a5aeb3" metal={.48}/>
    <Panel at={[.59,1.73,.72]} size={[.51,.085,.13]} color="#9caaae" metal={.47}/>
    <Panel at={[.59,2.02,-.17]} size={[.33,.303,.276]} color={selected===1?'#9f7952':'#285774'}/>
    <group ref={arm} position={[.51,2.21,.04]}>
      <Panel at={[-.259,0,0]} size={[.57,.078,.110]} color="#e3ded0"/>
      <Panel at={[-.51,-.040,0]} size={[.115,.047,.115]} color="#8a8e8b" metal={.52}/>
    </group>
    <Sonar selected={selected===0}/>
    {echo&&<Line points={[[.28,1.57,.65],[.28,hand?handY:.26,.65]]} color="#8edaca"
      dashed dashSize={.065} gapSize={.039} lineWidth={1.55}/>}
    {hand&&<Hand at={[.18,handY,.43]}/>}
    <Panel at={[-1.71,.156,.35]} size={[1.33,.162,1.43]} color="#99806b"/>
    <Panel at={[-1.77,.28,.30]} size={[1.04,.095,.65]} color={selected===3?'#b1834f':'#287f98'}/>
    <Panel at={[-2.15,.372,.30]} size={[.175,.103,.23]} color="#aeb8bb" metal={.59}/>
    <Panel at={[-1.70,.348,.35]} size={[.23,.042,.135]} color="#2b343c"/>
    {[-.235,.235].map(z=><Panel key={z} at={[-1.68,.356,.30+z]} size={[.75,.069,.049]} color="#2d363e"/>)}
    <Panel at={[-1.69,.278,-.36]} size={[.66,.121,.45]} color="#d1d2c6"/>
    <Panel at={[1.85,.191,-.69]} size={[.70,.261,.65]} color="#343b44"/>
    <Line points={[[-1.28,.36,.07],[-.98,.39,-.26],[-.57,.28,-.57],[.95,.36,-.54],[.99,1.65,-.31],[.84,1.74,.67]]}
      color="#ddb76c" lineWidth={1.84}/>
    <Line points={[[1.57,.27,-.66],[1.33,.34,-.56],[1.0,1.77,-.37],[.72,1.91,-.29]]} color="#ce7363" lineWidth={1.72}/>
    <Line points={[[-1.41,.36,.13],[-1.09,.41,-.35],[-.57,.37,-.70],[.94,.42,-.67],[.96,1.72,-.41],[.69,1.85,-.30]]}
      color="#8fd1d7" lineWidth={1.68}/>
    {([{at:[.28,1.62,.65],tag:[1.31,1.68,1.02]},{at:[.48,2.21,.03],tag:[.81,2.54,.31]},
      {at:[-.10,1.04,.27],tag:[-.64,1.24,.58]},{at:[-1.61,.34,.40],tag:[-1.85,.97,.58]}] satisfies {at:Point;tag:Point}[]).map(({at,tag},index)=><group key={index}>
      <Line points={[at,tag]} color={selected===index?'#ffe093':'#c3d3d7'} lineWidth={1.4}/>
      <WorldLabel position={tag} className="gp-marker-anchor">
        <button type="button" className="gp-marker" aria-label={inspection[index][0]} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button>
      </WorldLabel>
    </group>)}
    <ContactShadows position={[0,.039,0]} opacity={.40} blur={2.45} scale={7} far={4}/>
  </>;
}

export default function SoapDispenserDemo() {
  const [hand,setHand]=useState(false);
  const [distance,setDistance]=useState(8);
  const [echo,setEcho]=useState(true);
  const [controller,setController]=useState(baseState);
  const [selected,setSelected]=useState(0);
  const measured=echo?(hand?distance:trayDistance):null;
  useEffect(()=>{
    const timer=window.setInterval(()=>setController(previous=>sample(previous,measured,performance.now())),soapTiming.sampleMs);
    return ()=>window.clearInterval(timer);
  },[measured]);
  const labels:Record<Mode,string>={clear:'Waiting for clear',ready:'Armed',press:'Pressing pump',refill:'Refilling'};
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive 3D soap dispenser">
        <Canvas dpr={[1,1.5]} camera={{position:[3.3,3.75,6.5],fov:43}} fallback={<p>The dispenser controls and readings are available without WebGL.</p>}>
          <Bench hand={hand} distance={distance} echo={echo} press={controller.mode==='press'} selected={selected} select={setSelected}/>
          <OrbitControls target={[0,.93,0]} minDistance={4} maxDistance={13} enablePan={false} maxPolarAngle={Math.PI/2.05}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Dispenser readings">
        <div><span>Measured echo</span><strong>{measured===null?'No echo':`${measured} cm`}</strong></div>
        <div><span>Controller</span><strong>{labels[controller.mode]}</strong></div>
        <div><span>Pump strokes</span><strong>{controller.strokes}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Trigger one pump stroke</h3>
      <p>Present a hand at 8 cm. Keep it there after the stroke, then withdraw it and watch the controller arm again.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>setHand(value=>!value)}>{hand?'Withdraw hand':'Present hand'}</button>
        <button type="button" aria-pressed={!echo} onClick={()=>setEcho(value=>!value)}>{echo?'Block echo':'Restore echo'}</button>
        <button type="button" onClick={()=>{setHand(false);setDistance(8);setEcho(true);setController(baseState);}}>Reset trial</button>
      </div>
      <label htmlFor="soap-distance">Hand distance · {distance} cm</label>
      <input className="gp-lidar-range" id="soap-distance" type="range" min={2} max={22} step={1} value={distance}
        onChange={event=>{setHand(true);setDistance(Number(event.target.value));}}/>
      <p className="gp-demo-description" role="status">
        {controller.mode==='press'?'The servo depresses the pump head once.':controller.mode==='refill'?'The head is returning so the pump can refill.':
          controller.mode==='ready'?'Three clear readings received. A hand between 4 and 12 cm can trigger the next stroke.':
            'The controller needs three clear readings at 18 cm or farther to arm. A missing echo does not count.'}
      </p>
      <h4>Inspect the dispenser</h4>
      <ol className="gp-demo-labels">{inspection.map(([name],index)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{inspection[selected][1]}</p>
    </div>
  </div>;
}
