import { useEffect,useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows,Line,OrbitControls } from '@react-three/drei';
import { WorldLabel } from './LabWorkbench';
import { SolarMeterSolid as Box } from './SolarMeterParts';

type Point=[number,number,number];
const labels:[string,Point,string][]=[
 ['Photoresistor',[-1.27,.77,.54],'Shading increases the resistance of the photoresistor and lowers the A0 reading.'],
 ['10 kΩ divider resistor',[-.60,.55,.97],'This resistor connects A0 to ground. Together, the two parts turn the light level into a voltage.'],
 ['Arduino Uno',[.33,.60,.84],'The Uno remembers the last lamp state while A0 is between 360 and 460.'],
 ['Night light',[1.26,1.48,-.13],'D8 feeds the lamp through the 330 Ω resistor on the blue wire. The dark wire returns to ground. The lamp turns on at or below 360 and off at or above 460.'],
];
const cycle=[740,570,460,411,360,170,250,411,459,460,740];
function Bench({raw,lit,selected,select}:{raw:number;lit:boolean;selected:number;select:(i:number)=>void}){
 const light=.65+raw/1023*2.35;
 return <>
  <color attach="background" args={[raw<360?'#1c2a3c':'#324850']}/>
  <hemisphereLight args={['#e6efff','#836d57',light]}/><directionalLight position={[-4,6,5]} intensity={light} color="#fff1d9"/>
  <Box at={[0,-.11,0]} size={[4.95,.22,3.2]} color="#70817f"/>
  <Box at={[0,.12,.12]} size={[4.34,.19,1.87]} color="#a38b71"/>
  {Array.from({length:9},(_,i)=><Box key={i} at={[-1.86+i*.45,.223,.1]} size={[.009,.005,1.80]} color="#826e5d"/>)}
  <Box at={[0,.99,-1.13]} size={[4.5,1.98,.13]} color="#a5b1ac"/>
  <Box at={[-1.28,1.32,-1.04]} size={[1.17,.91,.072]} color="#738792"/>
  <Box at={[-1.28,1.32,-.996]} size={[1.016,.76,.031]} color={raw<360?'#2e4659':'#799aac'} metal={.25}/>
  <Box at={[-1.28,1.32,-.961]} size={[.043,.78,.033]} color="#b5b7a8"/>
  <Box at={[-1.28,1.32,-.961]} size={[1.03,.043,.033]} color="#b5b7a8"/>
  <Box at={[.20,.76,-.54]} size={[.14,1.07,.62]} color="#695e56"/>
  <Box at={[-1.03,.267,.52]} size={[1.41,.101,.64]} color="#dddcd2"/>
  {[-.19,.19].flatMap(z=>Array.from({length:19},(_,i)=><Box key={z+':'+i} at={[-1.63+i*.067,.325,.52+z]} size={[.018,.007,.018]} color="#747570"/>))}
  <group position={[-1.27,.51,.52]} onClick={()=>select(0)}>
   <mesh position={[0,0,0]}><cylinderGeometry args={[.092,.092,.048,26]}/><meshStandardMaterial color={selected===0?'#f1bc78':'#c3ad83'}/></mesh>
   <Line points={[[-.06,.027,-.04],[.06,.027,-.04],[.06,.027,-.016],[-.055,.027,-.016],[-.055,.027,.016],[.06,.027,.016],[.06,.027,.043],[-.06,.027,.043]]} color="#794637" lineWidth={1.5}/>
   {[-.054,.054].map(x=><Box key={x} at={[x,-.10,0]} size={[.019,.19,.016]} color="#acbaba" metal={.7}/>)}
  </group>
  <group position={[-.65,.37,.68]} onClick={()=>select(1)}>
   <Box at={[0,0,0]} size={[.49,.026,.022]} color="#abb9bb" metal={.72}/>
   <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.045,.045,.25,18]}/><meshStandardMaterial color={selected===1?'#ffc67c':'#c2ac7c'}/></mesh>
   {['#73513c','#282c2a','#ca6846','#bb9b67'].map((color,i)=><Box key={color} at={[-.083+.055*i,.014,0]} size={[.024,.068,.082]} color={color}/>)}
  </group>
  <group position={[.29,.283,.63]} onClick={()=>select(2)}>
   <Box at={[0,0,0]} size={[.95,.07,.66]} color={selected===2?'#dfb579':'#267294'}/>
   <Box at={[.074,.079,.022]} size={[.28,.062,.18]} color="#242f36"/>
   <Box at={[-.33,.105,.13]} size={[.18,.14,.17]} color="#a9bac2" metal={.66}/>
   {[-.25,.25].map(z=><group key={z}>
    <Box at={[.05,.06,z]} size={[.68,.08,.07]} color="#27323a"/>
    {Array.from({length:10},(_,i)=><Box key={i} at={[-.237+i*.064,.106,z]} size={[.019,.007,.019]} color="#beab7b" metal={.65}/>)}
   </group>)}
   <Box at={[-.24,.065,-.116]} size={[.19,.09,.14]} color="#232b30"/>
   <Box at={[.27,.058,.11]} size={[.08,.06,.12]} color="#a4adb0" metal={.63}/>
  </group>
  <group position={[1.32,.23,-.13]} onClick={()=>select(3)}>
   <Box at={[0,.028,0]} size={[.58,.061,.52]} color="#495e69" metal={.56}/>
   <Box at={[0,.52,0]} size={[.075,.94,.082]} color="#8c9ba0" metal={.71}/>
   <mesh position={[0,.986,0]}><cylinderGeometry args={[.18,.31,.23,32,1,true]}/><meshStandardMaterial color={selected===3?'#e9b870':'#657b81'} side={2} metalness={.49}/></mesh>
   <mesh position={[0,.866,0]}><sphereGeometry args={[.085,22,16]}/><meshStandardMaterial color={lit?'#fff0c0':'#a9aaa3'} emissive="#ffd485" emissiveIntensity={lit?2.7:0}/></mesh>
   {lit&&<pointLight position={[0,.83,.04]} color="#ffd48b" intensity={4.2} distance={2.2}/>}
  </group>
  <Line points={[[-1.324,.325,.52],[-1.324,.44,.42],[-1.08,.54,.37],[-.35,.53,.31],[.30,.39,.38]]} color="#cb5446" lineWidth={3}/>
  <Line points={[[-1.216,.325,.52],[-1.13,.41,.57],[-.89,.38,.68]]} color="#e4af56" lineWidth={3}/>
  <Line points={[[-.89,.37,.68],[-.81,.47,.82],[-.38,.47,.94],[.18,.39,.88]]} color="#c08241" lineWidth={3}/>
  <Line points={[[-.405,.37,.68],[-.31,.43,.74],[-.08,.44,.78],[.11,.39,.88]]} color="#333c46" lineWidth={3}/>
  <group onClick={()=>select(3)}>
   <Box at={[.90,.27,.56]} size={[.28,.023,.023]} color="#b2baba" metal={.67}/>
   <Box at={[.90,.27,.56]} size={[.13,.054,.058]} color="#c1a374"/>
   {['#e69547','#e69547','#614439'].map((color,i)=><Box key={i} at={[.86+i*.035,.274,.56]} size={[.011,.059,.063]} color={color}/>)}
   <Line points={[[.58,.39,.38],[.74,.41,.43],[.76,.27,.56]]} color="#638bb9" lineWidth={3}/>
   <Line points={[[1.04,.27,.56],[1.18,.253,.37],[1.38,.25,.02]]} color="#638bb9" lineWidth={3}/>
   <Line points={[[1.44,.25,.02],[1.50,.252,.53],[1.21,.26,.91],[.57,.40,.88]]} color="#353e46" lineWidth={3}/>
  </group>
  {labels.map(([name,at],i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
  <ContactShadows position={[0,.005,0]} opacity={.35} scale={4.9} far={1.2} resolution={128} frames={1}/>
 </>;
}
function read(previous:{raw:number;lit:boolean},raw:number){return {raw,lit:raw<=360||(raw<460&&previous.lit)};}
export default function NightLightDemo(){
 const [state,setState]=useState({raw:740,lit:false});
 const [phase,setPhase]=useState(-1);
 const [selected,select]=useState(0);
 useEffect(()=>{
  if(phase<0)return;
  const timer=window.setTimeout(()=>{
   if(phase>=cycle.length){setPhase(-1);return;}
   setState(current=>read(current,cycle[phase]));setPhase(phase+1);
  },370);
  return ()=>window.clearTimeout(timer);
 },[phase]);
 function control(raw:number){setPhase(-1);setState(current=>read(current,raw));}
 const {raw,lit}=state;
 return <div className="gp-split gp-demo">
  <div className="gp-story-stage"><div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D automatic night light bench">
   <Canvas camera={{position:[2.72,3.18,5.55],fov:42}} dpr={[1,1.6]} fallback={<p>Follow the light and lamp readings below.</p>}><Bench {...{raw,lit,selected,select}}/><OrbitControls target={[0,.70,-.18]} minDistance={3.5} maxDistance={10} enablePan={false}/></Canvas>
  </div><div className="gp-demo-result" aria-label="Night light readings"><div><span>Raw A0</span><strong>{raw}</strong></div><div><span>Divider voltage</span><strong>{(raw*5/1023).toFixed(2)} V</strong></div><div><span>Lamp</span><strong>{lit?'On':'Off'}</strong></div></div></div>
  <div className="gp-guide"><h3>Try daylight, shade and dusk</h3>
   <label className="gp-home-light">Ambient light reading <output>{raw}</output><input type="range" min={0} max={1023} value={raw} onChange={event=>control(event.target.valueAsNumber)}/></label>
   <div className="gp-steps"><button type="button" onClick={()=>control(740)}>Daylight</button><button type="button" onClick={()=>control(411)}>Dusk</button><button type="button" onClick={()=>control(170)}>Shade sensor</button></div>
   <div className="gp-steps"><button type="button" className="gp-button" onClick={()=>{setState({raw:740,lit:false});setPhase(0);}}>Play dusk and dawn</button><button type="button" onClick={()=>setPhase(-1)} disabled={phase<0}>Stop cycle</button></div>
   <p role="status">{lit?'Lamp on':'Lamp off'}{raw>360&&raw<460?' · Within the gap, holding the previous state':''}</p>
   <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p className="gp-demo-description">{labels[selected][2]}</p>
  </div>
 </div>;
}
