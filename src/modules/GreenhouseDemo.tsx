import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { type Group } from 'three';
import { greenhouse } from '../data/smart-greenhouse';
import { TapPump } from './AutomaticTapDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Watering='Idle'|'Watering'|'Soaking';
type Conditions={soil:number;temp:number;fan:boolean;stage:Watering;until:number};
const initial:Conditions={soil:62,temp:24,fan:false,stage:'Idle',until:0};
const details=[
 ['Soil probe','A0 reads the soil probe. The controller compares its relative index with the dry threshold after converting between two measured references.'],
 ['Air temperature','The shaded TMP36 sends its reading to A1. The fan starts at 29 °C and stops at 26 °C, leaving a gap where it keeps its previous state.'],
 ['Irrigation outlet','The pump doses water for 1.4 seconds, then waits 12 seconds so water can soak down toward the probe.'],
 ['Exhaust fan','D6 switches the fan through its own MOSFET board. The fan draws air out through the high vent.'],
 ['Ethernet shield','The shield reports the latest controller readings. Unplugging Ethernet leaves the Uno in control of the fan and pump.'],
] as const;

function Box({at,size,color,metal=0}: {at:Point;size:Point;color:string;metal?:number}){
 return <RoundedBox position={at} args={size} radius={.018} smoothness={2}><meshStandardMaterial color={color} metalness={metal} roughness={.6}/></RoundedBox>;
}

export function MoistureProbe({selected=false}: {selected?:boolean}){
 return <>
  <Box at={[0,.02,0]} size={[.32,.035,1.14]} color={selected?'#b79a60':'#303737'}/>
  <Box at={[0,.042,.30]} size={[.186,.032,.41]} color="#465653"/>
  <Box at={[0,.071,-.377]} size={[.204,.078,.152]} color="#dedbd0"/>
  <Box at={[.04,.051,-.22]} size={[.105,.045,.084]} color="#252b29"/>
  <Line points={[[-.12,.044,-.052],[.12,.044,-.052]]} color="#afbdad" lineWidth={1.25}/>
 </>;
}

export function GreenhouseFan({running=false,selected=false}: {running?:boolean;selected?:boolean}){
 const rotor=useRef<Group>(null);
 useFrame((_,dt)=>{if(running&&rotor.current) rotor.current.rotation.z+=dt*20;});
 return <>
  {[-.33,.33].map(value=><group key={value}>
   <Box at={[value,0,0]} size={[.109,.72,.13]} color={selected?'#a8824d':'#313942'}/>
   <Box at={[0,value,0]} size={[.63,.109,.13]} color={selected?'#a8824d':'#313942'}/>
  </group>)}
  <mesh><torusGeometry args={[.305,.023,12,42]}/><meshStandardMaterial color="#323a42"/></mesh>
  <group ref={rotor}>
   {[0,1.257,2.514,3.771,5.028].map(angle=><group key={angle} rotation={[0,0,angle]}>
    <mesh position={[.183,.039,.02]} rotation={[0,0,.35]} scale={[.127,.066,.019]}><sphereGeometry args={[1,14,10]}/><meshStandardMaterial color="#718892"/></mesh>
   </group>)}
   <mesh position={[0,0,.031]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.093,.093,.073,24]}/><meshStandardMaterial color="#465460"/></mesh>
  </group>
  {[.09,.18,.26].map(radius=><mesh key={radius} position={[0,0,.09]}>
   <torusGeometry args={[radius,.008,8,33]}/><meshStandardMaterial color="#7a888b" metalness={.56}/>
  </mesh>)}
 </>;
}

function WaterDrops({wet}:{wet:boolean}){
 const group=useRef<Group>(null);
 useFrame(({clock})=>{
  if(wet)group.current?.children.forEach((drop,i)=>{const t=(clock.elapsedTime*2.0+i*.19)%1;drop.position.set(.27,.99-.47*t*t,-.40);});
 });
 return <group ref={group} visible={wet}>{[0,1,2,3,4].map(i=><mesh key={i} scale={[.78,1.30,.78]}>
  <sphereGeometry args={[.031,12,8]}/><meshStandardMaterial color="#78cce5" roughness={.17}/>
 </mesh>)}</group>;
}

function Scene({fan,wet,soil,online,selected,select}: {fan:boolean;wet:boolean;soil:number;online:boolean;selected:number;select:(n:number)=>void}){
 const anchors=[
  {at:[.10,.56,-.12],tag:[.58,1.13,.18]},
  {at:[-1.49,1.12,-.76],tag:[-1.85,1.61,-.24]},
  {at:[.28,1.02,-.40],tag:[.52,1.58,-.33]},
  {at:[1.04,1.64,-1.30],tag:[1.47,2.06,-.64]},
  {at:[-2.25,.27,1.03],tag:[-2.42,.95,1.12]},
 ] satisfies {at:Point;tag:Point}[];
 return <>
  <color attach="background" args={['#273f50']}/><ambientLight intensity={1.40}/>
  <directionalLight position={[3,7,5]} intensity={2.52}/><directionalLight position={[-5,4,-3]} color="#b8cce4" intensity={1.37}/>
  <Box at={[0,-.14,0]} size={[6.68,.25,4.48]} color="#947058"/>
  <Box at={[0,.015,0]} size={[6.54,.071,4.33]} color="#608174"/>
  <Box at={[-.09,.124,-.54]} size={[3.50,.149,2.16]} color="#8aa39c"/>
  {[-1.85,1.64].flatMap(x=>[-1.63,.52].map(z=><Box key={`${x}:${z}`} at={[x,1.097,z]} size={[.08,2.00,.085]} color="#7c9893" metal={.49}/>))}
  <Box at={[-.10,2.07,-1.61]} size={[3.58,.09,.09]} color="#8ba39e" metal={.43}/>
  <Box at={[-.10,1.96,.52]} size={[3.58,.087,.087]} color="#8ba39e" metal={.43}/>

  {([{at:[-.55,1.14,-1.62],size:[2.40,1.83,.022]},{at:[1.12,.735,-1.62],size:[.94,1.02,.022]},
     {at:[1.50,1.655,-1.62],size:[.18,.82,.022]}] satisfies {at:Point;size:Point}[]).map(({at,size})=>
    <mesh key={at.join(':')} position={at}><boxGeometry args={size}/>
      <meshPhysicalMaterial transparent opacity={.20} depthWrite={false} color="#a1ccd0" roughness={.2}/>
    </mesh>)}

  <mesh position={[1.64,1.13,-.56]}><boxGeometry args={[.022,1.86,2.06]}/><meshPhysicalMaterial transparent opacity={.26} depthWrite={false} color="#afc9d1" roughness={.19}/></mesh>
  <mesh position={[-.10,2.037,-.55]} rotation={[.053,0,0]}><boxGeometry args={[3.56,.025,2.16]}/><meshPhysicalMaterial transparent opacity={.19} depthWrite={false} color="#b2d5d8" roughness={.21}/></mesh>
  <group position={[1.02,1.63,-1.48]}><GreenhouseFan running={fan} selected={selected===3}/></group>
  <mesh position={[-.25,.386,-.40]}><cylinderGeometry args={[.53,.39,.40,36]}/><meshStandardMaterial color="#9a634e" roughness={.92}/></mesh>
  <mesh position={[-.25,.589,-.40]}><cylinderGeometry args={[.49,.49,.032,36]}/><meshStandardMaterial color={soil<=34?'#7c6043':'#503d31'} roughness={.94}/></mesh>
  <group position={[-.25,.54,-.40]}>
   {[-.19,0,.19].map((x,index)=><group key={x} position={[x,0,index*.06]} rotation={[.06,0,x]}>
    <Box at={[0,.37,0]} size={[.035,.75,.039]} color="#4b783e"/>
    {[-1,1].flatMap(side=>[.25,.47,.66].map((y,i)=><mesh key={`${side}:${y}`} position={[side*(.12+i*.025),y,side*.045]}
      rotation={[.24,side*.52,side*.25]} scale={[.19,.052,.13]}>
      <sphereGeometry args={[1,16,11]}/><meshStandardMaterial color={['#659e55','#79aa62','#4d8248'][(i+index)%3]} roughness={.74}/>
    </mesh>))}
   </group>)}
  </group>
  <group position={[.12,.68,-.12]} rotation={[Math.PI/2,0,0]} scale={.58}><MoistureProbe selected={selected===0}/></group>
  <Box at={[-1.48,1.10,-.78]} size={[.17,.25,.13]} color={selected===1?'#a78151':'#424951'}/>
  {[-.052,0,.052].map(x=><Box key={x} at={[-1.48+x,.916,-.78]} size={[.014,.14,.014]} color="#b9bcb8" metal={.62}/>)}
  <Box at={[2.29,.30,.60]} size={[.83,.45,.77]} color="#729a9a"/>
  <mesh position={[2.29,.45,.60]}><boxGeometry args={[.76,.066,.68]}/><meshStandardMaterial color="#6fbed3" metalness={.15} roughness={.27}/></mesh>
  <group position={[1.48,.084,1.34]} rotation={[0,-.12,0]}><TapPump running={wet} selected={selected===2}/></group>
  <Line points={[[2.23,.48,.66],[2.14,.57,1.03],[1.85,.52,1.32],[1.71,.54,1.34]]} color="#a9ccd0" lineWidth={2.05}/>
  <Line points={[[1.67,.56,1.32],[1.40,.65,1.20],[1.22,.96,.61],[.66,1.02,.33],[.28,1.02,-.40]]} color={wet?'#80daed':'#b8d2cd'} lineWidth={2.15}/>
  <WaterDrops wet={wet}/>
  <Box at={[-2.32,.124,1.10]} size={[1.39,.132,.96]} color="#9d8064"/>
  <Box at={[-2.27,.237,1.11]} size={[1.04,.13,.68]} color="#247b98"/>
  <Box at={[-2.27,.361,1.11]} size={[1.04,.077,.68]} color={selected===4?'#a78150':'#4d878d'}/>
  <Box at={[-2.65,.443,1.12]} size={[.23,.141,.31]} color="#b4bfc2" metal={.64}/>
  {online&&<Line points={[[-2.80,.437,1.10],[-3.01,.33,1.26],[-3.08,.22,1.76]]} color="#89aacf" lineWidth={2.4}/>}
  <Line points={[[-2.08,.43,.86],[-1.91,.36,.42],[-1.56,.82,-.45],[-1.48,1.05,-.78]]} color="#d8ac5e" lineWidth={1.8}/>
  {anchors.map(({at,tag},index)=><group key={index}>
   <Line points={[at,tag]} color={selected===index?'#ffe597':'#c6d3d5'} lineWidth={1.36}/>
   <WorldLabel position={tag} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={details[index][0]}
    aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button></WorldLabel>
  </group>)}
  <ContactShadows position={[0,.041,0]} scale={9} opacity={.35} blur={2.4} far={4}/>
 </>;
}

function control(state:Conditions,now:number):Conditions{
 let {stage,until,soil}=state;
 const fan=state.temp>=greenhouse.fanOn||(state.temp>greenhouse.fanOff&&state.fan);
 if(stage==='Watering'&&now>=until){stage='Soaking';until=now+greenhouse.soakMs;soil=Math.min(100,soil+8);}
 else if(stage==='Soaking'&&now>=until){stage='Idle';until=0;}
 else if(stage==='Idle'&&soil<=greenhouse.dry){stage='Watering';until=now+greenhouse.pulseMs;}
 return stage===state.stage&&fan===state.fan ? state : {...state,soil,stage,until,fan};
}

export default function GreenhouseDemo(){
 const [state,setState]=useState(initial), [online,setOnline]=useState(true);
 const [remote,setRemote]=useState(initial), [selected,setSelected]=useState(0);
 const latest=useRef(state);
 useEffect(()=>{latest.current=state;},[state]);
 useEffect(()=>{
  const timer=window.setInterval(()=>setState(previous=>control(previous,performance.now())),100);
  return ()=>window.clearInterval(timer);
 },[]);
 useEffect(()=>{
  if(!online)return;
  setRemote(latest.current);
  const timer=window.setInterval(()=>setRemote(latest.current),2000);
  return ()=>window.clearInterval(timer);
 },[online]);
 return <div className="gp-split gp-demo">
  <div className="gp-story-stage">
   <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive 3D smart greenhouse">
    <Canvas dpr={[1,1.5]} camera={{position:[3.4,4.35,8.25],fov:43}} fallback={<p>The controls and dashboard are available without WebGL.</p>}>
     <Scene fan={state.fan} wet={state.stage==='Watering'} soil={state.soil} online={online} selected={selected} select={setSelected}/>
     <OrbitControls target={[0,.62,0]} minDistance={5} maxDistance={15} enablePan={false}/>
    </Canvas>
   </div>
   <div className="gp-demo-result" aria-label="Greenhouse controller readings">
    <div><span>Soil index</span><strong>{state.soil} / 100</strong></div>
    <div><span>Irrigation</span><strong>{state.stage}</strong></div>
    <div><span>Exhaust fan</span><strong>{state.fan?'On':'Off'}</strong></div>
   </div>
  </div>
  <div className="gp-guide">
   <h3>Change growing conditions</h3>
   <label htmlFor="greenhouse-soil">Relative soil index · {state.soil}</label>
   <input className="gp-lidar-range" id="greenhouse-soil" type="range" min={0} max={100} value={state.soil}
    onChange={event=>{const soil=Number(event.target.value);setState(value=>({...value,soil}));}}/>
   <label htmlFor="greenhouse-temp">Air temperature · {state.temp} °C</label>
   <input className="gp-lidar-range" id="greenhouse-temp" type="range" min={18} max={39} value={state.temp}
    onChange={event=>{const temp=Number(event.target.value);setState(value=>({...value,temp}));}}/>
   <p>Set the soil to {greenhouse.dry} or lower for a watering pulse. Try 29 °C, then 27 °C, then 26 °C to see when the fan changes state.</p>
   <h3>Local Ethernet dashboard</h3>
   <div className="gp-steps">
    <button type="button" aria-pressed={!online} onClick={()=>setOnline(value=>!value)}>{online?'Disconnect Ethernet':'Reconnect Ethernet'}</button>
   </div>
   <p className="gp-demo-description" aria-label="Remote greenhouse readings"><strong>{online?'Live · refreshes every 2 s':'Stale · Ethernet disconnected'}</strong><br/>
    Soil {remote.soil} / 100 · {remote.temp} °C · Pump {remote.stage.toLowerCase()} · Fan {remote.fan?'on':'off'}</p>
   <h4>Inspect the greenhouse</h4>
   <ol className="gp-demo-labels">{details.map(([name],index)=><li key={name}>
    <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
   </li>)}</ol>
   <p className="gp-demo-description">{details[selected][1]}</p>
  </div>
 </div>;
}
