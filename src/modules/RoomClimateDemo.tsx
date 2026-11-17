import { useEffect,useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows,Line,OrbitControls } from '@react-three/drei';
import { WorldLabel } from './LabWorkbench';
import { SolarMeterSolid as Box } from './SolarMeterParts';

type Point=[number,number,number];
const labels:[string,Point,string][]=[
 ['TMP36 sensor',[-1.02,1.02,.56],'The middle lead sends an analog voltage to A0. The two outer pins power the sensor.'],
 ['Arduino Uno',[.40,.58,.93],'The Uno averages samples and compares the temperature with the two switch points.'],
 ['Warning LED',[1.34,.75,.71],'The LED lights at the setpoint. After it turns on, cooling by one full degree below the setpoint clears the warning.'],
 ['Reference thermometer',[-1.42,1.60,-.61],'The thermometer represents an independent reading next to the sensor. Compare them after both have settled.'],
];
const temperatureOffsets=[-5,-2,-1,0,2,4,1,0,-.5,-1,-5];
function Bench({temperature,on,selected,select}:{temperature:number;on:boolean;selected:number;select:(i:number)=>void}){
 const column=.18+(temperature-15)/25*.66;
 return <>
   <color attach="background" args={['#2a4151']}/><hemisphereLight args={['#e6f0ff','#9b7e64',2.13]}/><directionalLight position={[-3,6,6]} intensity={2.55} color="#fff3de"/>
   <Box at={[0,-.10,0]} size={[4.95,.20,3.15]} color="#697d83"/>
   <Box at={[0,1.02,-1.13]} size={[4.4,2.04,.13]} color="#b8bbc0"/>
   {Array.from({length:7},(_,i)=><Box key={i} at={[-1.82+i*.29,.91,-1.057]} size={[.009,1.79,.007]} color="#9dabb0"/>)}
   <Box at={[1.02,1.30,-1.042]} size={[1.18,.60,.052]} color="#647783" metal={.37}/>
   {Array.from({length:6},(_,i)=><Box key={i} at={[1.02,1.09+i*.082,-1.002]} size={[1.03,.024,.030]} color="#435961"/>)}
   <Box at={[.0,.181,.17]} size={[4.18,.16,1.64]} color="#b29a80"/>
   {[-1.75,1.75].map(x=><Box key={x} at={[x,.07,.18]} size={[.15,.15,1.41]} color="#6c6864"/>)}
   <group position={[-1.44,.36,-.77]} onClick={()=>select(3)}>
    <Box at={[0,.55,0]} size={[.36,1.13,.065]} color={selected===3?'#ebc684':'#e2dfce'}/>
    <Box at={[0,.54,.053]} size={[.051,1.02,.025]} color="#a6b6b8" metal={.27}/>
    <Box at={[0,.05+column*.5,.071]} size={[.039,column,.019]} color="#d65749"/>
    {Array.from({length:9},(_,i)=><Box key={i} at={[.086,.135+i*.101,.039]} size={[i%2===0 ? .084 : .051,.008,.014]} color="#46555a"/>)}
   </group>
   <group position={[-.99,.33,.46]} onClick={()=>select(0)}>
    <Box at={[0,0,0]} size={[.85,.125,.59]} color={selected===0?'#f1d0a0':'#d6d9d4'}/>
    {[-.18,.18].flatMap(z=>Array.from({length:12},(_,i)=><Box key={z+':'+i} at={[-.33+i*.06,.067,z]} size={[.019,.011,.022]} color="#62686a"/>))}
    {[-.07,0,.07].map(x=><Box key={x} at={[x,.18,.03]} size={[.021,.24,.025]} color="#a9b9b7" metal={.75}/>)}
    <mesh position={[0,.327,.03]}><cylinderGeometry args={[.143,.143,.218,24,1,false,0,Math.PI]}/><meshStandardMaterial color="#343a3f" roughness={.49}/></mesh>
    <Box at={[0,.324,.032]} size={[.273,.208,.037]} color={selected===0?'#6f5947':'#35434b'}/>
   </group>
   <group position={[.39,.285,.69]} onClick={()=>select(1)}>
    <Box at={[0,0,0]} size={[1.04,.071,.73]} color="#277398"/>
    <Box at={[.05,.074,.04]} size={[.30,.066,.19]} color="#262d35"/>
    <Box at={[-.33,.094,.15]} size={[.21,.171,.22]} color={selected===1?'#edce90':'#a9b5bf'} metal={.67}/>
    {[-.27,.26].map(z=><Box key={z} at={[.07,.063,z]} size={[.69,.072,.077]} color="#252e36"/>)}
   </group>
   <group position={[1.38,.36,.58]} onClick={()=>select(2)}>
    <Box at={[0,-.046,0]} size={[.48,.102,.41]} color={selected===2?'#e8bc77':'#5d6770'}/>
    <mesh position={[0,.112,0]}><sphereGeometry args={[.075,20,14]}/><meshStandardMaterial color={on?'#ff7869':'#803c3d'} emissive="#ff4736" emissiveIntensity={on?2.5:0}/></mesh>
    {on&&<pointLight position={[0,.16,0]} color="#ff6049" intensity={.4} distance={1.2}/>}
   </group>
   <Line points={[[-1.06,.409,.49],[-.82,.41,.67],[-.39,.3,.87],[.04,.34,.88]]} lineWidth={3} color="#bb8c60"/>
   <Line points={[[.80,.33,.77],[1.03,.33,.88],[1.37,.39,.61]]} lineWidth={3} color="#567e9e"/>
   {labels.map(([name,at],i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
   <ContactShadows position={[0,.006,0]} opacity={.35} scale={4.8} far={1.2} resolution={128} frames={1}/>
 </>;
}
function update(previous:{temperature:number;setpoint:number;on:boolean},temperature:number,setpoint:number){
 return {temperature,setpoint,on:temperature>=setpoint||(temperature>setpoint-1&&previous.on)};
}
export default function RoomClimateDemo(){
 const [state,setState]=useState({temperature:23,setpoint:28,on:false});
 const [phase,setPhase]=useState(-1);
 const [selected,select]=useState(0);
 useEffect(()=>{
  if(phase<0)return;
  const timer=window.setTimeout(()=>{
   if(phase>=temperatureOffsets.length){setPhase(-1);return;}
   setState(current=>update(current,Math.max(15,current.setpoint+temperatureOffsets[phase]),current.setpoint));
   setPhase(phase+1);
  },370);
  return ()=>window.clearTimeout(timer);
 },[phase]);
 const {temperature,setpoint,on}=state;
 return <div className="gp-split gp-demo">
  <div className="gp-story-stage"><div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D room climate monitor bench">
   <Canvas camera={{position:[2.72,3.25,5.55],fov:42}} dpr={[1,1.6]} fallback={<p>Follow the temperature and warning readings below.</p>}><Bench {...{temperature,on,selected,select}}/><OrbitControls target={[0,.68,-.18]} minDistance={3.5} maxDistance={10} enablePan={false}/></Canvas>
  </div><div className="gp-demo-result" aria-label="Room monitor readings"><div><span>Temperature</span><strong>{temperature} °C</strong></div><div><span>Sensor voltage</span><strong>{(.5+temperature*.01).toFixed(3)} V</strong></div><div><span>Warning</span><strong>{on?'On':'Off'}</strong></div></div></div>
  <div className="gp-guide"><h3>Raise and lower the temperature</h3>
   <label className="gp-home-light">Room temperature <output>{temperature} °C</output><input type="range" min={15} max={40} step={.5} value={temperature} onChange={event=>{setPhase(-1);setState(update(state,event.target.valueAsNumber,setpoint));}}/></label>
   <label className="gp-home-light">Warning setpoint <output>{setpoint} °C</output><input type="range" min={18} max={35} value={setpoint} onChange={event=>setState(update(state,temperature,event.target.valueAsNumber))}/></label>
   <div className="gp-steps"><button type="button" className="gp-button" onClick={()=>{setState(update(state,Math.max(15,setpoint-5),setpoint));setPhase(0);}}>Play warming and cooling</button><button type="button" onClick={()=>setPhase(-1)} disabled={phase<0}>Stop cycle</button></div>
   <p role="status">{on?'Warning on':'Warning off'} · Switch on at {setpoint} °C and clear at {setpoint-1} °C.</p>
   <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p className="gp-demo-description">{labels[selected][2]}</p>
  </div>
 </div>;
}
