import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import type { Group } from 'three';
import { airExerciseThreshold, airWindow } from '../data/classroom-air';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Input='low'|'high'|'missing';
type Frame={raw:number|null;mean:number|null};
const parts=[
 ['Optical inlet','The fan draws air through this opening. Keep both vents unobstructed so particles can pass the optical chamber.'],
 ['PMSA003I breakout','The module uses scattered light to estimate particle size. I²C sends the environmental PM2.5 concentration to the Uno.'],
 ['Arduino Uno','The Uno computes an average over up to four valid readings. A missing frame clears its sample window.'],
 ['Status LEDs','Green shows a fresh average below 35 µg/m³. Red shows the exercise threshold was reached. Both turn off for a missing frame.'],
] as const;

function Box({at,size,color,metal=0}: {at:Point;size:Point;color:string;metal?:number}){
 return <RoundedBox position={at} args={size} radius={.021} smoothness={2}>
  <meshStandardMaterial color={color} metalness={metal} roughness={.57}/>
 </RoundedBox>;
}

export function ParticleBreakout({selected=false}: {selected?:boolean}){
 return <>
  <Box at={[0,.025,0]} size={[1.33,.05,.88]} color={selected?'#896f4d':'#28333e'}/>
  <Box at={[-.12,.193,0]} size={[.93,.28,.76]} color="#2678aa" metal={.60}/>
  <Box at={[-.12,.336,0]} size={[.85,.019,.68]} color="#4198c5" metal={.67}/>
  <Box at={[-.25,.364,.15]} size={[.42,.047,.39]} color="#3c444a" metal={.43}/>
  <Box at={[-.60,.194,0]} size={[.062,.188,.56]} color="#303a40"/>
  {[-.18,-.075,.075,.18].map(z=><Box key={z} at={[-.634,.203,z]} size={[.015,.115,.046]} color="#161e24"/>)}
  <Box at={[.29,.196,.295]} size={[.188,.108,.157]} color="#272e34"/>
  {[-.22,.22].map(z=><Box key={z} at={[.512,.095,z]} size={[.171,.122,.185]} color="#dddacb"/>)}
  {[-.48,.49].flatMap(x=>[-.365,.365].map(z=><mesh key={`${x}:${z}`} position={[x,.056,z]} rotation={[-Math.PI/2,0,0]}>
   <ringGeometry args={[.035,.053,18]}/><meshStandardMaterial color="#c0a374" metalness={.66}/>
  </mesh>))}
 </>;
}

function Airflow({input}:{input:Input}){
 const cloud=useRef<Group>(null);
 useFrame(({clock})=>{
  cloud.current?.children.forEach((dot,index)=>{
   const t=(clock.elapsedTime*.51+index*.173)%1;
   dot.position.set(-2.70+t*.90,.40+Math.sin(index*2.4+t*4)*.13,-.23+Math.cos(index*1.2+t*4)*.17);
   dot.visible=input==='high'||index<4;
  });
 });
 return <group ref={cloud} visible={input!=='missing'}>{Array.from({length:12},(_,i)=><mesh key={i}>
  <sphereGeometry args={[.026+(i%3)*.009,10,8]}/><meshBasicMaterial transparent opacity={.60} color={input==='high'?'#e6b57c':'#9dc4ce'}/>
 </mesh>)}</group>;
}

function Bench({input,mean,selected,select}:{input:Input;mean:number|null;selected:number;select:(i:number)=>void}){
 const markers=[
  {at:[-1.84,.47,-.25],tag:[-2.24,1.07,-.28]},
  {at:[-1.16,.58,-.27],tag:[-.82,1.15,-.33]},
  {at:[.37,.39,-.37],tag:[.57,1.03,-.49]},
  {at:[1.72,.48,.66],tag:[2.03,1.04,.89]},
 ] satisfies {at:Point;tag:Point}[];
 return <>
  <color attach="background" args={['#273d50']}/><ambientLight intensity={1.31}/>
  <directionalLight position={[3,7,5]} intensity={2.62}/><directionalLight position={[-5,4,-3]} color="#b4cbe4" intensity={1.38}/>
  <Box at={[0,-.13,0]} size={[5.90,.24,3.51]} color="#957055"/>
  <Box at={[0,.013,0]} size={[5.77,.068,3.37]} color="#607d76"/>
  <Box at={[-1.21,.139,-.28]} size={[1.61,.19,1.13]} color="#a7b6b8" metal={.4}/>
  <group position={[-1.21,.234,-.28]}><ParticleBreakout selected={selected===1}/></group>
  <Line points={[[-2.66,.29,-.23],[-2.13,.29,-.23],[-1.85,.35,-.23]]} color={selected===0?'#e6be77':'#8ccfce'} dashed dashSize={.058} gapSize={.043} lineWidth={1.8}/>
  <Airflow input={input}/>
  <Box at={[.43,.188,-.38]} size={[1.27,.088,.86]} color={selected===2?'#a88250':'#28889f'}/>
  <Box at={[-.085,.277,-.39]} size={[.192,.134,.264]} color="#aeb9bc" metal={.67}/>
  {[.29,-.29].map(z=><Box key={z} at={[.52,.257,-.38+z]} size={[.83,.079,.051]} color="#293540"/>)}
  <Box at={[.42,.259,-.31]} size={[.289,.058,.142]} color="#2d353d"/>
  <Box at={[1.59,.161,.67]} size={[1.51,.18,.80]} color="#ddddd2"/>
  {Array.from({length:12},(_,i)=>[.40,.50,.60,.74,.85,.93].map(z=><Box key={`${i}:${z}`} at={[.96+i*.112,.255,z]} size={[.025,.008,.022]} color="#7f8583"/>))}
  {[-1,1].map((side,index)=>{
   const on=mean!==null&&(index===0?mean>=airExerciseThreshold:mean<airExerciseThreshold);
   const color=index===0?'#ff4d40':'#72eea0';
   return <group key={side} position={[1.60+side*.25,0,.70]}>
    <mesh position={[0,.33,0]}><cylinderGeometry args={[.071,.071,.139,20]}/>
     <meshStandardMaterial color={on?color:index===0?'#783934':'#396d51'} emissive={color} emissiveIntensity={on?2.4:0}/>
    </mesh>
    <mesh position={[0,.402,0]}><sphereGeometry args={[.071,18,10,0,Math.PI*2,0,Math.PI/2]}/>
     <meshStandardMaterial color={on?color:'#54625b'} emissive={color} emissiveIntensity={on?2.1:0}/>
    </mesh>
    <mesh position={[0,.270,-.23]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.035,.035,.18,16]}/>
     <meshStandardMaterial color={selected===3?'#e5b871':'#c1a67a'}/>
    </mesh>
   </group>;
  })}
  <Line points={[[-.70,.35,-.20],[-.47,.43,-.10],[-.20,.33,-.03],[.29,.28,-.08]]} color="#dcad66" lineWidth={1.9}/>
  <Line points={[[-.71,.34,-.35],[-.43,.36,-.11],[-.21,.27,.04],[.13,.29,-.07]]} color="#98c8ca" lineWidth={1.9}/>
  <Line points={[[.63,.28,-.07],[.88,.33,.08],[1.15,.30,.18],[1.37,.27,.48]]} color="#d98871" lineWidth={1.9}/>
  <Line points={[[.76,.29,-.07],[1.05,.31,.09],[1.42,.29,.26],[1.85,.27,.48]]} color="#75bba1" lineWidth={1.9}/>
  {markers.map(({at,tag},index)=><group key={index}>
   <Line points={[at,tag]} color={selected===index?'#ffe39b':'#bed0d4'} lineWidth={1.4}/>
   <WorldLabel position={tag} className="gp-marker-anchor">
    <button type="button" className="gp-marker" aria-label={parts[index][0]} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button>
   </WorldLabel>
  </group>)}
  <ContactShadows position={[0,.04,0]} scale={8} opacity={.43} blur={2.3} far={4}/>
 </>;
}

function Plot({history}:{history:Frame[]}){
 const canvas=useRef<HTMLCanvasElement>(null);
 useEffect(()=>{
  const ctx=canvas.current?.getContext('2d');
  if(!ctx)return;
  const {width,height}=ctx.canvas;
  const y=(value:number)=>height-16-(height-32)*value/60;
  ctx.fillStyle='#182e3b';ctx.fillRect(0,0,width,height);
  ctx.font='13px system-ui';ctx.fillStyle='#bed0d7';
  for(const row of [0,20,airExerciseThreshold,60]){
   ctx.strokeStyle=row===airExerciseThreshold?'#bea36e':'#415d68';ctx.lineWidth=1;
   ctx.beginPath();ctx.moveTo(30,y(row));ctx.lineTo(width-8,y(row));ctx.stroke();ctx.fillText(String(row),5,y(row)+4);
  }
  (['raw','mean'] as const).forEach(key=>{
   ctx.strokeStyle=key==='raw'?'#849ba8':'#7fe3d3';ctx.lineWidth=key==='raw'?1.2:2.25;ctx.beginPath();
   let started=false;
   history.forEach((row,index)=>{
    const value=row[key],x=width-10-(history.length-1-index)*(width-42)/35;
    if(value===null){started=false;return;}
    if(!started){ctx.moveTo(x,y(value));started=true;}else ctx.lineTo(x,y(value));
   });ctx.stroke();
  });
 },[history]);
 return <figure className="gp-mq2-trend"><canvas ref={canvas} width={640} height={150} role="img"
  aria-label="Practice PM2.5 trace with raw samples, moving average and gaps"/>
  <figcaption>Gray samples · Teal average · Gold exercise threshold</figcaption></figure>;
}

export default function ClassroomAirDemo(){
 const [input,setInput]=useState<Input>('low');
 const [history,setHistory]=useState<Frame[]>([]);
 const [selected,setSelected]=useState(0);
 const latest=history.at(-1);
 useEffect(()=>{
  const timer=window.setInterval(()=>{
   setHistory(rows=>{
    if(input==='missing') return [...rows.slice(-35),{raw:null,mean:null}];
    const raw=input==='low'?8:54;
    const prior:number[]=[];
    for(const row of rows.slice(1-airWindow).reverse()){
     if(row.raw===null)break;
     prior.push(row.raw);
    }
    const mean=Math.floor((raw+prior.reduce((sum,value)=>sum+value,0))/(prior.length+1));
    return [...rows.slice(-35),{raw,mean}];
   });
  },1000);
  return ()=>window.clearInterval(timer);
 },[input]);
 const indicator=latest?.mean==null?'No fresh frame':latest.mean>=airExerciseThreshold?'Red':'Green';
 return <div className="gp-split gp-demo">
  <div className="gp-story-stage">
   <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive 3D particle-monitor bench">
    <Canvas dpr={[1,1.5]} camera={{position:[2.8,3.7,6.6],fov:42}} fallback={<p>The readings and practice controls are available without WebGL.</p>}>
     <Bench input={input} mean={latest?.mean??null} selected={selected} select={setSelected}/>
     <OrbitControls target={[0,.33,0]} minDistance={4} maxDistance={13} enablePan={false}/>
    </Canvas>
   </div>
   <div className="gp-demo-result" aria-label="Particle monitor readings">
    <div><span>Practice sample</span><strong>{latest?.raw==null?'—':`${latest.raw} µg/m³`}</strong></div>
    <div><span>Moving average</span><strong>{latest?.mean==null?'—':`${latest.mean} µg/m³`}</strong></div>
    <div><span>Indicator</span><strong>{indicator}</strong></div>
   </div>
   <Plot history={history}/>
  </div>
  <div className="gp-guide">
   <h3>Compare particulate readings</h3>
   <p>Let four low samples fill the window, then switch to high. The latest sample changes first. The average and LED follow as older readings leave the window.</p>
   <div className="gp-steps">
    <button type="button" aria-pressed={input==='low'} onClick={()=>setInput('low')}>Low practice trace</button>
    <button type="button" aria-pressed={input==='high'} onClick={()=>setInput('high')}>High practice trace</button>
    <button type="button" aria-pressed={input==='missing'} onClick={()=>setInput('missing')}>Drop sensor frames</button>
   </div>
   <p className="gp-demo-description">Models and readings are simulations. The 35 µg/m³ threshold is for this classroom exercise.</p>
   <h4>Inspect the sensor bench</h4>
   <ol className="gp-demo-labels">{parts.map(([name],index)=><li key={name}>
    <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
   </li>)}</ol>
   <p className="gp-demo-description">{parts[selected][1]}</p>
  </div>
 </div>;
}
