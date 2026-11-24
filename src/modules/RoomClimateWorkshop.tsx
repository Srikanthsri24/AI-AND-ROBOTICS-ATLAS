import {useEffect,useLayoutEffect,useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,Grid,OrbitControls} from '@react-three/drei';
import {Group,InstancedMesh,Object3D} from 'three';
import {ChevronLeft,ChevronRight,Layers,Play,RotateCcw} from 'lucide-react';
import {Mount,Uno,Wire} from './RoverWorkshopModel';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';
import '../styles/rover-workshop.css';
import '../styles/room-climate-workshop.css';

type Point=[number,number,number];
type Part='board'|'sensor'|'supply'|'signal'|'uno'|'resistor'|'led'|'reference';
const parts:{id:Part;name:string;purpose:string;connection:string}[]=[
 {id:'board',name:'Breadboard terminal rows',purpose:'The sockets hold the leads apart. Each group of five terminal sockets connects internally.',connection:'Place each sensor lead in a separate row. The supply and ground rails run along the outer edges.'},
 {id:'sensor',name:'TMP36 · three-lead sensor',purpose:'The output voltage rises about 10 mV per °C, with 500 mV at 0 °C.',connection:'With the flat face toward you and leads down: left → 5 V, middle → A0, right → GND.'},
 {id:'supply',name:'5 V and ground connections',purpose:'The sensor needs a stable supply and a shared reference for its output voltage.',connection:'Uno 5 V → TMP36 left lead. Uno GND → TMP36 right lead and LED cathode.'},
 {id:'signal',name:'Analog temperature signal · A0',purpose:'The Uno measures the middle lead’s voltage and converts it to an estimated temperature.',connection:'TMP36 middle lead → Uno A0. Temperature = (voltage − 0.5) × 100.'},
 {id:'uno',name:'Arduino Uno controller',purpose:'Averages readings and retains the LED state inside a one-degree hold band.',connection:'A0 reads the sensor. D8 drives the LED. The physical guide changes the warning setpoint using + and − in Serial Monitor.'},
 {id:'resistor',name:'330 Ω LED resistor',purpose:'Limits current when the warning output is HIGH.',connection:'Uno D8 → resistor → LED anode. Use one series resistor for this LED.'},
 {id:'led',name:'Temperature warning LED',purpose:'Switches on at the warning point and clears at one degree below it.',connection:'The long anode lead connects through the resistor to D8. The cathode connects to ground.'},
 {id:'reference',name:'Reference thermometer',purpose:'Provides an independent reading beside the sensor for comparison after settling.',connection:'Place the reference and TMP36 in the same air. It has no electrical connection to the Uno.'},
];
const steps:{title:string;part:Part;text:string;check:string}[]=[
 {title:'Breadboard',part:'board',text:'Inspect the two socket banks and outer power rails. Find three separate terminal rows for the TMP36 leads.',check:'The three sensor pins will not share one connected row.'},
 {title:'Sensor',part:'sensor',text:'Fit the TMP36 with its flat face toward the front. Identify supply, output and ground from left to right.',check:'All three legs enter separate rows with no bent-lead short.'},
 {title:'Controller',part:'uno',text:'Mount the Uno beside the breadboard with the USB socket accessible.',check:'The board is clear of metal parts and the sensor is away from its heat.'},
 {title:'Supply',part:'supply',text:'With power off, join Uno 5 V to the sensor’s left pin and GND to its right pin.',check:'Follow the red supply lead and black return to their actual endpoints.'},
 {title:'Signal',part:'signal',text:'Connect the middle sensor lead to A0. Keep the wire short and clear of the other two legs.',check:'The signal runs from the middle pin to the analog header.'},
 {title:'Indicator',part:'resistor',text:'Connect D8 through the 330 Ω resistor to the LED anode, with the cathode returning to GND.',check:'The resistor and LED share a series path.'},
 {title:'Compare',part:'reference',text:'Place a reference thermometer near the sensor. Compare both readings after the air and probes have settled.',check:'A consistent difference points to calibration or placement that needs checking.'},
 {title:'Test',part:'led',text:'Warm past the warning point, then cool through the one-degree hold band. Observe the LED state from both directions.',check:'The same in-band temperature can leave the LED on or off depending on the previous reading.'},
];
export function Breadboard({active}:{active:boolean}){
 const holes=useRef<InstancedMesh>(null);
 useLayoutEffect(()=>{
  const socket=new Object3D();let index=0;
  for(let x=0;x<20;x++)for(const z of [-.47,-.37,-.27,-.17,-.07,.07,.17,.27,.37,.47]){
   socket.position.set(-.95+x*.10,.071,z);socket.updateMatrix();holes.current!.setMatrixAt(index++,socket.matrix);
  }
  holes.current!.instanceMatrix.needsUpdate=true;
 },[]);
 return <>
  <Box at={[0,0,0]} size={[2.23,.14,1.34]} color={active?'#d6c2eb':'#e5e2d5'}/>
  <Box at={[0,.073,0]} size={[2.06,.008,.031]} color='#9a9b94'/>
  <instancedMesh ref={holes} args={[undefined,undefined,200]}><boxGeometry args={[.033,.008,.033]}/><meshStandardMaterial color='#727a7e' roughness={.8}/></instancedMesh>
  {[-1,1].map(side=><group key={side}>
   <Box at={[0,.077,side*.57]} size={[2.05,.006,.012]} color={side<0?'#c35c51':'#4f7da2'}/>
   <Box at={[0,.077,side*.62]} size={[2.05,.006,.010]} color={side<0?'#4f7da2':'#c35c51'}/>
  </group>)}
 </>;
}
function TemperatureSensor({active}:{active:boolean}){
 return <>
  {[-.10,0,.10].map(x=><Box key={x} at={[x,.19,0]} size={[.021,.38,.025]} color='#aab3ba' metal={.8}/>)}
  <mesh position={[0,.47,0]} rotation={[0,Math.PI/2,0]} castShadow><cylinderGeometry args={[.16,.16,.24,40,1,false,0,Math.PI]}/><meshStandardMaterial color={active?'#a982ce':'#30383f'} roughness={.45}/></mesh>
  <Box at={[0,.47,.008]} size={[.32,.24,.025]} color={active?'#b18ad8':'#354049'}/>
  <Box at={[0,.47,.023]} size={[.15,.008,.002]} color='#adb5ad'/>
 </>;
}
function ClimateScene({step,temperature,on,selected,select,explode}:{step:number;temperature:number;on:boolean;selected:Part;select:(part:Part)=>void;explode:boolean}){
 const sensor=useRef<Group>(null);
 useFrame((_,dt)=>{if(sensor.current)sensor.current.position.y+=((explode?.78:0)-sensor.current.position.y)*Math.min(dt*7,1);});
 const choose=(part:Part)=>(event:{stopPropagation:()=>void})=>{event.stopPropagation();select(part);};
 const anchors:Record<Part,Point>={board:[-.60,.62,.55],sensor:[-.50,1.05,.20],supply:[-.98,.54,-.40],signal:[-.10,.62,.80],uno:[1.10,.52,.48],resistor:[.18,.47,.20],led:[.67,.75,.23],reference:[-1.35,1.63,-.65]};
 return <>
  <group position={[-.32,.17,.20]} onClick={choose('board')}><Breadboard active={selected==='board'}/></group>
  {step>=1&&<group ref={sensor}><Mount from={[0,.75,0]}><group position={[-.66,.25,.19]} onClick={choose('sensor')}><TemperatureSensor active={selected==='sensor'}/></group></Mount></group>}
  {step>=2&&<Mount from={[.6,.3,0]}><group position={[1.35,.15,.55]} rotation={[0,.18,0]} onClick={choose('uno')}><Uno active={selected==='uno'}/></group></Mount>}
  {step>=3&&<group onClick={choose('supply')}>
   <Wire points={[[1.05,.23,.87],[.56,.30,.97],[-1.35,.32,.89],[-1.35,.25,-.38],[-.76,.25,.19]]} color={selected==='supply'?'#bc88eb':'#bd554b'}/>
   <Wire points={[[1.04,.23,.94],[.55,.19,1.13],[-1.45,.20,.96],[-1.39,.25,-.31],[-.56,.25,.19]]} color={selected==='supply'?'#bc88eb':'#303a45'}/>
  </group>}
  {step>=4&&<group onClick={choose('signal')}><Wire points={[[-.66,.25,.19],[-.66,.50,.42],[.15,.50,.85],[1.05,.25,.71]]} color={selected==='signal'?'#bc88eb':'#d5a74a'}/></group>}
  {step>=5&&<Mount from={[0,.55,0]}>
   <group position={[.10,.30,.22]} rotation={[0,0,Math.PI/2]} onClick={choose('resistor')}>
    <mesh castShadow><cylinderGeometry args={[.043,.043,.26,20]}/><meshStandardMaterial color={selected==='resistor'?'#c291e6':'#d0b687'} roughness={.65}/></mesh>
    {['#dd803c','#dd803c','#75503a','#c2a252'].map((color,index)=><mesh key={index} position={[0,(index-1.5)*.05,0]}><cylinderGeometry args={[.044,.044,.018,20]}/><meshStandardMaterial color={color}/></mesh>)}
   </group>
   <group onClick={choose('led')}>
    {[-.04,.04].map(x=><Box key={x} at={[.51+x,.37,.22]} size={[.015,.25,.015]} color='#abb5bc' metal={.8}/>)}
    <mesh position={[.51,.54,.22]} castShadow><capsuleGeometry args={[.065,.06,5,20]}/><meshPhysicalMaterial color={selected==='led'?'#ba8ce0':on?'#ff583f':'#8e342d'} roughness={.18} clearcoat={1} emissive={on?'#ee442d':'#000'} emissiveIntensity={on?2.5:0}/></mesh>
    {on&&<pointLight position={[.51,.58,.22]} color='#ef5d3c' intensity={.20} distance={.45}/>}
   </group>
   <Wire points={[[1.13,.24,.20],[.92,.32,-.23],[-.19,.31,-.13],[-.03,.30,.22]]} color='#b68547' width={2.1}/>
   <Wire points={[[.23,.30,.22],[.37,.30,.21],[.47,.26,.22]]} color='#b1bac1' width={1.5}/>
   <Wire points={[[.55,.25,.22],[.76,.25,.73],[-1.44,.24,.71],[-1.40,.25,-.31]]} color='#303a45' width={2.1}/>
  </Mount>}
  {step>=6&&<Mount from={[0,.7,0]}><group position={[-1.60,0,-.68]} onClick={choose('reference')}>
   <Box at={[0,.10,0]} size={[.44,.20,.37]} color='#717d8a' metal={.5}/><Box at={[0,.80,0]} size={[.30,1.36,.055]} color={selected==='reference'?'#bf9bdf':'#e6dfcb'}/>
   <Box at={[0,.77,.045]} size={[.045,1.17,.027]} color='#b8c0c4' metal={.2}/>
   <Box at={[0,.27+((temperature-15)/25)*.45,.065]} size={[.028,.10+((temperature-15)/25)*.90,.012]} color='#c85548'/>
   <WorldLabel position={[0,1.55,.05]} className='rw-label-anchor'><span className='cw-thermometer-reading'>{temperature.toFixed(1)} °C</span></WorldLabel>
   {Array.from({length:11},(_,index)=><Box key={index} at={[.08,.25+index*.105,.038]} size={[index%2?.045:.075,.007,.012]} color='#5b6670'/>)}
  </group></Mount>}
  <WorldLabel position={anchors[selected]} className='rw-label-anchor'><span className='rw-world-label'>{parts.find(part=>part.id===selected)?.name}<small>{selected==='sensor'?'Flat face · 5 V / A0 / GND':selected==='led'?'D8 · warning output':selected==='signal'?'10 mV / °C · 500 mV at 0 °C':'Select to trace the actual connection'}</small></span></WorldLabel>
 </>;
}
const cycleTemperatures=[24,27.5,28,27.5,27,29,27.5,26];
export default function RoomClimateWorkshop(){
 const [step,setStep]=useState(0),[selected,select]=useState<Part>('board'),[replay,setReplay]=useState(0),[explode,setExplode]=useState(false);
 const [temperature,setTemperature]=useState(24),[setpoint,setSetpoint]=useState(28),[on,setOn]=useState(false),[cycling,setCycling]=useState(false),[cycleIndex,setCycleIndex]=useState(0),[offset,setOffset]=useState(0);
 const measured=temperature+offset;
 useEffect(()=>{if(measured>=setpoint)setOn(true);else if(measured<=setpoint-1)setOn(false);},[measured,setpoint]);
 useEffect(()=>{
  if(!cycling)return;
  const timer=window.setTimeout(()=>{
   const next=cycleIndex+1;
   if(next>=cycleTemperatures.length){setCycling(false);return;}
   setCycleIndex(next);setTemperature(cycleTemperatures[next]);
  },1600);
  return ()=>window.clearTimeout(timer);
 },[cycling,cycleIndex]);
 function reset(){setCycling(false);setTemperature(24);setSetpoint(28);setOn(false);setOffset(0);setCycleIndex(0);}
 function stage(index:number){setCycling(false);setStep(index);select(steps[index].part);setExplode(false);}
 const part=parts.find(item=>item.id===selected)!;
 const available=parts.filter(item=>({board:0,sensor:1,uno:2,supply:3,signal:4,resistor:5,led:5,reference:6})[item.id]<=step);
 const band=measured>setpoint-1&&measured<setpoint;
 const voltage=.5+measured*.01;
 return <div className='rw-workshop cw-workshop'>
  <div className='rw-heading'><div><p className='rw-eyebrow'>Analog temperature workshop</p><h3>Read the temperature. Follow the warning.</h3><p>Wire a TMP36 and LED, compare a reference thermometer, and test the one-degree hold band.</p></div><span className='rw-chip'>TMP36 · Arduino Uno · A0 / D8</span></div>
  <div className='rw-layout'>
   <div className='rw-view'>
    <div className='rw-view-top'><span><i/>{step>=6?'Temperature test bench':'Sensor assembly bench'}</span><div><button type='button' onClick={()=>setReplay(value=>value+1)}><RotateCcw size={15}/>Replay assembly</button>{step>=1&&<button type='button' aria-pressed={explode} onClick={()=>setExplode(!explode)}><Layers size={15}/>{explode?'Assembled':'Lift sensor'}</button>}</div></div>
    <div className='rw-canvas' role='region' aria-label='Room climate 3D workshop'>
     <Canvas shadows dpr={[1,1.6]} camera={{position:[2.5,3.5,5.5],fov:40}} fallback={<p>WebGL is required to view this circuit.</p>}>
      <color attach='background' args={['#eef0f8']}/><hemisphereLight args={['#fff2df','#7d8299',2.15]}/><directionalLight position={[-3,7,5]} intensity={2.8} color='#fff0db' castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5}/>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.025,0]} receiveShadow><planeGeometry args={[40,40]}/><meshStandardMaterial color='#e6e8ef' roughness={.86}/></mesh>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,.001,0]} receiveShadow><planeGeometry args={[4.6,3.3]}/><meshStandardMaterial color='#65728a' roughness={.82}/></mesh><Grid args={[4.6,3.3]} position={[0,.006,0]} cellSize={.2} sectionSize={1} cellColor='#9caac0' sectionColor='#c3cddc' cellThickness={.4} sectionThickness={.7} fadeDistance={12}/>
      <ClimateScene key={replay} {...{step,selected,select,explode,temperature}} on={step>=5&&on&&!explode}/><ContactShadows position={[0,.009,0]} opacity={.29} scale={5.1} far={2} resolution={256} frames={1}/><OrbitControls target={[0,.56,.25]} enablePan={false} minDistance={3.2} maxDistance={9} maxPolarAngle={Math.PI/2-.05}/>
     </Canvas>
    </div>
    <div className='rw-view-footer'><span>Drag to orbit · Inspect the pin order and circuit parts</span><span>{step+1} / {steps.length}</span></div>
    <nav className='rw-build-strip' aria-label='Climate workshop assembly stages'>{steps.map((item,index)=><button key={item.title} type='button' aria-current={step===index?'step':undefined} onClick={()=>stage(index)}><span>{String(index+1).padStart(2,'0')}</span>{item.title}</button>)}</nav>
   </div>
   <aside className='rw-panel'>
    <div className='rw-panel-title'><span>{step+1}</span><div><p className='rw-eyebrow'>{step>=6?'Compare & test':'Assemble & inspect'}</p><h4>{steps[step].title}</h4></div></div><p>{steps[step].text}</p>
    {step>=6&&<>
     <div className='cw-readings' aria-label='Climate workshop readings'><div><span>Sensor reading</span><strong>{measured.toFixed(1)} °C</strong></div><div><span>Reference</span><strong>{temperature.toFixed(1)} °C</strong></div><div><span>A0 voltage</span><strong>{voltage.toFixed(3)} V</strong></div><div><span>Warning LED</span><strong>{on&&!explode?'On':'Off'}</strong></div></div>
     <label className='rw-range'>Air temperature <output>{temperature.toFixed(1)} °C</output><input aria-label='Air temperature' type='range' min='15' max='40' step='.5' value={temperature} onChange={event=>{setCycling(false);setTemperature(event.target.valueAsNumber);}}/></label>
     <label className='rw-range'>Warning setpoint <output>{setpoint} °C</output><input aria-label='Warning setpoint' type='range' min='18' max='35' value={setpoint} onChange={event=>{setCycling(false);setSetpoint(event.target.valueAsNumber);}}/></label>
     <div className='cw-band' aria-label='Warning switch points'><span>Clear at ≤ {setpoint-1} °C</span><span className={band?'cw-active':''}>Hold previous state</span><span>Warn at ≥ {setpoint} °C</span></div>
     <div className='rw-run'><button type='button' className='rw-primary' disabled={explode} onClick={()=>{if(cycling){setCycling(false);return;}setOffset(0);setSetpoint(28);setCycleIndex(0);setTemperature(cycleTemperatures[0]);setCycling(true);}}><Play size={15}/>{cycling?'Pause cycle':'Run warm / cool cycle'}</button><button type='button' onClick={reset}><RotateCcw size={15}/>Reset</button></div>
     <div className='rw-step-actions'><button type='button' aria-pressed={offset!==0} onClick={()=>{setCycling(false);setOffset(2);select('reference');}}>Add +2 °C offset</button><button type='button' disabled={offset===0} onClick={()=>{setOffset(0);select('reference');}}>Correct offset</button></div>
     <div className='rw-explain' role='status'><strong>{explode?'Sensor lifted · reconnect it before testing.':band?`Inside the hold band · LED remains ${on?'on':'off'}.`:on?'Warning point reached · D8 HIGH · LED on.':'Below the clear point · D8 LOW · LED off.'}</strong><p>{offset?'The sensor reads 2 °C above the reference. Compare before adjusting calibration.':'At a fixed temperature inside the band, the warning remembers which threshold was crossed last.'}</p></div>
     <p className='cw-note'>Readings are simulated. Compare a physical sensor and reference only after both have settled in the same air.</p>
    </>}
    <div className='rw-inspect'><p className='rw-eyebrow'>Inspect the actual circuit</p><div className='rw-part-list' role='group' aria-label='Inspect climate workshop parts'>{available.map(item=><button key={item.id} type='button' aria-pressed={selected===item.id} onClick={()=>select(item.id)}>{item.name}</button>)}</div><h5>{part.name}</h5><p>{part.purpose}</p><div className='rw-connections'><strong>How it connects</strong><p>{part.connection}</p></div></div>
    <div className='rw-check'><p>{steps[step].check}</p></div>
    {step<7&&<div className='rw-step-actions'><button type='button' disabled={step===0} onClick={()=>stage(step-1)}><ChevronLeft size={15}/>Previous</button><button type='button' className='rw-primary' onClick={()=>stage(step+1)}>{step===5?'Compare the readings':'Next step'}<ChevronRight size={15}/></button></div>}
   </aside>
  </div>
 </div>;
}
