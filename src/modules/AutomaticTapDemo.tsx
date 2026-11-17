import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { CatmullRomCurve3, Vector3, type Group } from 'three';
import { tapLimits } from '../data/automatic-tap';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Mode='clear'|'ready'|'flow';
type Tap={mode:Mode;streak:number;started:number;stop:string};
const initial:Tap={mode:'clear',streak:0,started:0,stop:''};
const detail=[
  ['Hand sensor','The HC-SR04 measures the nearest flat surface. Three close echoes in the 4–13 cm band start the pump if the controller is armed.'],
  ['Level interlock','The SEN0485 senses through the tank wall. Its output changes to HIGH when water drops below the marked level, cutting pump power.'],
  ['Peristaltic pump','Motor-driven rollers squeeze the silicone tube to move water. The water stays inside the tube and returns through the basin drain.'],
  ['MOSFET driver','D9 controls the MOSFET. It switches current from the independent 5 V supply, with a shared ground to the Uno.'],
] as const;

function update(previous:Tap,cm:number|null,water:boolean,now:number):Tap {
  if(!water){
    return previous.mode==='clear'&&previous.streak===0&&previous.stop==='Reservoir low'
      ? previous : {...initial,stop:'Reservoir low'};
  }
  if(previous.mode==='flow'){
    if(now-previous.started>=tapLimits.maxMs) return {...initial,stop:'Four-second limit reached'};
    if(cm===null) return {...initial,stop:'Echo lost'};
    if(cm<tapLimits.startMin||cm>tapLimits.holdMax) return {...initial,stop:'Hand out of range'};
    return previous;
  }
  const qualifies=cm!==null&&(previous.mode==='clear'
    ? cm>=tapLimits.clearMin : cm>=tapLimits.startMin && cm<=tapLimits.startMax);
  if(!qualifies) return previous.streak ? {...previous,streak:0} : previous;
  if(previous.streak+1<tapLimits.confirm) return {...previous,streak:previous.streak+1};
  return previous.mode==='clear' ? {...initial,mode:'ready'} : {...initial,mode:'flow',started:now};
}

function Box({at,size,color,metal=0}: {at:Point;size:Point;color:string;metal?:number}) {
  return <RoundedBox position={at} args={size} radius={.018} smoothness={2}>
    <meshStandardMaterial color={color} metalness={metal} roughness={.59}/>
  </RoundedBox>;
}

const inlet:Point[]=[[-1.01,.25,-.22],[-1.01,.67,-.22],[-1.38,.69,-.28],[-1.99,.60,-.42]];
const outlet:Point[]=[[-1.99,.65,-.54],[-1.69,.73,-.73],[.35,.76,-.81],[1.01,.76,-.78],[1.08,1.46,-.78],[1.02,1.88,-.71],[.63,1.96,-.20],[.63,1.88,.21],[.63,1.70,.34]];

function Tube({points,chrome=false,flow=false}: {points:Point[];chrome?:boolean;flow?:boolean}) {
  const path=useMemo(()=>new CatmullRomCurve3(points.map(p=>new Vector3(...p))),[points]);
  return <mesh><tubeGeometry args={[path,44,chrome ? .052 : .028,10,false]}/>
    <meshStandardMaterial color={chrome?'#b8c5c8':flow?'#5fbad9':'#b8d0d3'}
      metalness={chrome ? .72 : .12} roughness={chrome ? .26 : .34}/>
  </mesh>;
}

export function TapPump({running=false,selected=false}: {running?:boolean;selected?:boolean}) {
  const rotor=useRef<Group>(null);
  useFrame((_,delta)=>{if(rotor.current&&running)rotor.current.rotation.y+=delta*7;});
  return <>
    <Box at={[0,.04,0]} size={[.56,.084,.51]} color="#30343a"/>
    <mesh position={[0,.23,0]}><cylinderGeometry args={[.20,.20,.34,34]}/><meshStandardMaterial color="#bac1c1" metalness={.55}/></mesh>
    <mesh position={[0,.427,0]}><cylinderGeometry args={[.238,.238,.14,36]}/><meshStandardMaterial color={selected?'#ab8352':'#252c32'}/></mesh>
    <mesh position={[0,.508,0]}><cylinderGeometry args={[.191,.191,.027,34]}/>
      <meshPhysicalMaterial color="#b1cbd1" opacity={.35} transparent depthWrite={false}/></mesh>
    <group ref={rotor} position={[0,.50,0]}>
      {[0,2.094,4.189].map(angle=><mesh key={angle} position={[Math.cos(angle)*.126,0,Math.sin(angle)*.126]}>
        <cylinderGeometry args={[.038,.038,.022,13]}/><meshStandardMaterial color="#9aaab0" metalness={.64}/>
      </mesh>)}
    </group>
    {[-.103,.103].map(z=><Box key={z} at={[.229,.449,z]} size={[.114,.055,.066]} color="#c0c8c5"/>)}
  </>;
}

export function TapLevel({selected=false}: {selected?:boolean}) {
  return <group rotation={[Math.PI/2,0,0]}>
    <mesh><cylinderGeometry args={[.205,.205,.122,30]}/><meshStandardMaterial color={selected?'#ad8050':'#2f363e'}/></mesh>
    <mesh position={[0,.069,0]}><cylinderGeometry args={[.166,.166,.025,28]}/><meshStandardMaterial color="#4d5157"/></mesh>
    <Box at={[.198,.002,0]} size={[.158,.091,.094]} color="#383c43"/>
  </group>;
}

function Stream({active,hand}: {active:boolean;hand:boolean}) {
  const drops=useRef<Group>(null);
  useFrame(({clock})=>{
    if(!active)return;
    drops.current?.children.forEach((drop,i)=>{
      const t=(clock.elapsedTime*2.65+i*.12)%1;
      drop.position.set(.63+Math.sin(i*6)*.026,1.70-t*t*(hand ? .43 : .78),.34+Math.cos(i*7)*.026);
    });
  });
  return <group ref={drops} visible={active}>{Array.from({length:10},(_,i)=><mesh key={i} scale={[.62,1.65,.62]}>
    <sphereGeometry args={[.036,12,8]}/><meshStandardMaterial color="#8fd9f0" metalness={.22} roughness={.17}/>
  </mesh>)}</group>;
}

const TapScene=memo(function TapScene({running,hand,water,echo,selected,select}: {
  running:boolean;hand:boolean;water:boolean;echo:boolean;selected:number;select:(index:number)=>void;
}) {
  return <>
    <color attach="background" args={['#273c50']}/>
    <ambientLight intensity={1.28}/><directionalLight position={[3,7,5]} intensity={2.63}/>
    <directionalLight position={[-5,4,-3]} intensity={1.36} color="#b7cfe7"/>
    <Box at={[0,-.13,0]} size={[6.57,.24,3.83]} color="#927056"/>
    <Box at={[0,.013,0]} size={[6.44,.069,3.72]} color="#607b76"/>
    <Box at={[.17,.139,.16]} size={[2.71,.18,1.90]} color="#97acb3" metal={.43}/>
    {[-1.22,1.56].map(x=><Box key={x} at={[x,.515,.16]} size={[.052,.58,1.89]} color="#8da4af" metal={.36}/>)}
    <Box at={[.17,.50,-.78]} size={[2.72,.61,.055]} color="#7292a0" metal={.27}/>
    <mesh position={[.17,.40,1.08]}><boxGeometry args={[2.71,.42,.038]}/>
      <meshPhysicalMaterial color="#91c4dd" roughness={.18} transparent opacity={.30} depthWrite={false}/>
    </mesh>
    <mesh position={[.17,water ? .442 : .263,.17]}><boxGeometry args={[2.58,water ? .40 : .056,1.70]}/>
      <meshPhysicalMaterial color="#3ca9cc" transparent opacity={.58} roughness={.19} depthWrite={false}/>
    </mesh>
    <Box at={[.18,.775,.20]} size={[2.83,.098,1.90]} color="#8d9b9f" metal={.63}/>
    {[-1.25,1.60].map(x=><Box key={x} at={[x,.879,.20]} size={[.086,.201,1.99]} color="#bbc7c9" metal={.67}/>)}
    {[-.79,1.23].map(z=><Box key={z} at={[.18,.879,z]} size={[2.90,.201,.088]} color="#bbc7c9" metal={.67}/>)}
    <mesh position={[.63,.834,.34]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.107,28]}/><meshStandardMaterial color="#394b55" metalness={.42}/></mesh>
    {[-.048,0,.048].map(x=><Box key={x} at={[.63+x,.839,.34]} size={[.015,.011,.139]} color="#959c9e"/>)}
    <Box at={[-.13,.836,.36]} size={[.49,.017,.53]} color="#b4aca0"/>
    <Tube points={inlet} flow={running}/>
    <Tube points={outlet} chrome flow={running}/>
    <group position={[-2.25,.15,-.49]} rotation={[0,Math.PI/2,0]}><TapPump running={running} selected={selected===2}/></group>
    <group position={[1.02,.48,1.118]}><TapLevel selected={selected===1}/></group>
    <Box at={[1.33,1.41,-.37]} size={[.073,1.10,.078]} color="#8f9da2" metal={.52}/>
    <Box at={[.61,1.92,-.37]} size={[1.49,.063,.085]} color="#9ca9a9" metal={.61}/>
    <Box at={[-.08,1.90,-.12]} size={[.07,.07,.52]} color="#9ca9a9" metal={.61}/>
    <group position={[-.12,1.87,.18]}>
      <Box at={[0,0,0]} size={[.66,.041,.32]} color={selected===0?'#478c9e':'#23769e'}/>
      {[-.16,.16].map(x=><mesh key={x} position={[x,-.085,0]}>
        <cylinderGeometry args={[.112,.111,.125,28]}/><meshStandardMaterial color="#aab8bd" metalness={.67}/>
      </mesh>)}
    </group>
    {echo&&<Line points={[[-.13,1.72,.18],[-.13,hand?1.30:.845,.18]]} color="#92e1ce" dashed gapSize={.047} dashSize={.06} lineWidth={1.55}/>}
    {hand&&<group position={[.26,1.22,.37]}>
      <Box at={[.14,.015,.04]} size={[.63,.135,.47]} color="#caa78f"/>
      {[.07,.19,.31,.43].map(z=><Box key={z} at={[-.29,.014,z-.21]} size={[.39,.089,.090]} color="#caa78f"/>)}
      <Box at={[.23,.022,-.256]} size={[.239,.088,.143]} color="#caa78f"/>
      <Box at={[.58,0,.095]} size={[.35,.157,.28]} color="#5d7894"/>
    </group>}
    <Stream active={running} hand={hand}/>
    <Box at={[-2.27,.12,.80]} size={[1.43,.143,1.40]} color="#93785e"/>
    <Box at={[-2.32,.262,.83]} size={[.96,.10,.62]} color="#257f98"/>
    <Box at={[-2.68,.339,.83]} size={[.196,.093,.235]} color="#b0bdc1" metal={.63}/>
    <Box at={[-2.25,.326,.91]} size={[.26,.05,.144]} color="#2c3440"/>
    <Box at={[-2.09,.292,1.34]} size={[.47,.05,.34]} color={selected===3?'#a7804c':'#293b43'}/>
    <Box at={[-1.93,.347,1.33]} size={[.14,.11,.24]} color="#4c7080"/>
    <Box at={[-2.22,.341,1.35]} size={[.12,.09,.22]} color="#e2dccf"/>
    <Line points={[[-2.05,.38,1.22],[-2.26,.37,.88],[-2.47,.45,.30],[-2.34,.46,-.36]]} color={running?'#ffab74':'#b96c61'} lineWidth={1.8}/>
    <Line points={[[1.06,.48,1.14],[.40,.26,1.41],[-.98,.24,1.41],[-1.99,.32,.98]]} color="#86bc99" lineWidth={1.8}/>
    <Line points={[[-.30,1.88,.17],[-.53,1.60,-.31],[-1.15,.37,-.40],[-1.91,.37,.64]]} color="#dfad5f" lineWidth={1.7}/>
    {([{at:[-.12,1.85,.22],tag:[-.54,2.32,.32]},
      {at:[1.03,.48,1.12],tag:[1.47,.98,1.51]},
      {at:[-2.26,.66,-.48],tag:[-2.60,1.23,-.38]},
      {at:[-2.08,.34,1.29],tag:[-1.91,.82,1.49]}] satisfies {at:Point;tag:Point}[]).map(({at,tag},index)=><group key={index}>
      <Line points={[at,tag]} color={selected===index?'#ffe197':'#bcced5'} lineWidth={1.42}/>
      <WorldLabel position={tag} className="gp-marker-anchor"><button className="gp-marker" type="button"
        aria-label={detail[index][0]} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button></WorldLabel>
    </group>)}
    <ContactShadows position={[0,.039,0]} opacity={.39} blur={2.42} scale={8} far={4}/>
  </>;
});

export default function AutomaticTapDemo(){
  const [hand,setHand]=useState(false);
  const [water,setWater]=useState(true);
  const [echo,setEcho]=useState(true);
  const [controller,setController]=useState(initial);
  const [selected,setSelected]=useState(0);
  const select=useCallback((index:number)=>setSelected(index),[]);
  const distance=echo?(hand?8:26):null;
  const running=controller.mode==='flow';
  useEffect(()=>{
    const timer=window.setInterval(()=>setController(previous=>update(previous,distance,water,performance.now())),tapLimits.sampleMs);
    return ()=>window.clearInterval(timer);
  },[distance,water]);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive 3D recirculating tap">
        <Canvas dpr={[1,1.5]} camera={{position:[3.6,4.0,7.7],fov:42}} fallback={<p>The controls and tap readings are available without WebGL.</p>}>
          <TapScene running={running} hand={hand} water={water} echo={echo} selected={selected} select={select}/>
          <OrbitControls target={[0,.64,.04]} minDistance={4} maxDistance={14} enablePan={false} maxPolarAngle={Math.PI/2.06}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Automatic tap readings">
        <div><span>Echo</span><strong>{distance===null?'No echo':`${distance} cm`}</strong></div>
        <div><span>Reservoir</span><strong>{water?'Water OK':'Water low'}</strong></div>
        <div><span>Pump</span><strong>{running?'Flowing':controller.mode==='ready'?'Ready':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Test three ways to stop the flow</h3>
      <p>Present a hand to start. Withdraw it, lower the reservoir, or hold the hand still until the four-second limit. Clear the sensor before trying again.</p>
      <div className="gp-steps">
        <button className="gp-button" type="button" onClick={()=>setHand(value=>!value)}>{hand?'Withdraw hand':'Present hand'}</button>
        <button type="button" aria-pressed={!water} onClick={()=>setWater(value=>!value)}>{water?'Lower reservoir level':'Refill reservoir'}</button>
        <button type="button" aria-pressed={!echo} onClick={()=>setEcho(value=>!value)}>{echo?'Block echo':'Restore echo'}</button>
      </div>
      <p className="gp-demo-description" role="status">{running?'The motor pumps water from the tank to the spout. The basin returns it to the tank.':
        controller.mode==='ready'?'The reservoir and echo are clear. Present a hand to start flow.':
          controller.stop?`${controller.stop}. The pump is off and needs a clear echo before restarting.`:'Waiting for three valid clear echoes and enough water.'}</p>
      <h4>Inspect the tap</h4>
      <ol className="gp-demo-labels">{detail.map(([name],index)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>select(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{detail[selected][1]}</p>
    </div>
  </div>;
}
