import {useEffect,useRef,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const markers:{name:string;at:Point;detail:string}[]=[
  {name:'Chamber air probe',at:[.68,1.32,.44],detail:'The TMP36 reads the air away from the test block. At 37 °C the alarm latches.'},
  {name:'Latched warning LED',at:[-1.36,.81,.75],detail:'D8 remains on after the chamber cools. A reset press at 35 °C or below clears it.'},
  {name:'Pulsed piezo sounder',at:[-.64,.69,.85],detail:'D9 pulses the sounder until an acknowledgment or reset press.'},
  {name:'Acknowledge and reset button',at:[-.01,.53,1.23],detail:'Above 35 °C a press silences the sounder. At 35 °C or below it clears the entire alarm.'},
];

function Chamber({latched,pulse,selected,select,press}:{latched:boolean;pulse:boolean;selected:number;select:(i:number)=>void;press:()=>void}){
  return <>
    <color attach="background" args={['#334b5d']}/>
    <hemisphereLight args={['#e2efff','#786e60',2.04]}/>
    <directionalLight position={[-3,6,5]} intensity={2.15} color="#fff0d6"/>
    <Box at={[0,-.097,0]} size={[4.82,.195,3.04]} color="#617782"/>
    <Box at={[.79,.173,-.18]} size={[2.76,.254,1.87]} color="#657680"/>
    <Box at={[.79,1.133,-1.08]} size={[2.72,1.71,.13]} color="#bdc2b7"/>
    <Box at={[.79,2.051,-.18]} size={[2.87,.168,1.96]} color="#8395a0" metal={.43}/>
    <Box at={[.79,1.996,.80]} size={[2.74,.084,.051]} color="#bac5c5" metal={.54}/>
    {[-.53,2.10].flatMap(x=>[-1.07,.74].map(z=><Box key={x+':'+z} at={[x,1.15,z]} size={[.053,1.72,.053]} color="#8c9fa8" metal={.6}/>))}
    <mesh position={[2.11,1.13,-.165]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[1.82,1.69]}/><meshStandardMaterial transparent opacity={.17} depthWrite={false} side={2} color="#afd2d2"/></mesh>
    <mesh position={[.81,1.13,.756]}><planeGeometry args={[2.59,1.64]}/><meshStandardMaterial transparent opacity={.09} depthWrite={false} side={2} color="#bae2e1"/></mesh>
    <Box at={[1.75,1.17,.779]} size={[.054,.29,.079]} color="#73858f" metal={.54}/>
    <Box at={[.77,.49,-.17]} size={[2.43,.067,1.53]} color="#a0a89f" metal={.44}/>
    {Array.from({length:9},(_,i)=><Box key={i} at={[-.29+i*.259,.529,-.19]} size={[.049,.006,1.38]} color="#6f8487"/>)}
    <Box at={[.80,.65,-.15]} size={[.65,.24,.50]} color="#ab9475"/>
    <Box at={[.80,.78,-.15]} size={[.42,.021,.31]} color="#c8bc9f"/>
    <group onClick={()=>select(0)}>
      <Box at={[.64,.92,.36]} size={[.066,.66,.064]} color="#768b90"/>
      <Box at={[.64,1.261,.36]} size={[.147,.103,.098]} color={selected===0?'#dcad77':'#2c3a43'}/>
      {[-.044,0,.044].map(x=><Box key={x} at={[.64+x,1.191,.413]} size={[.017,.104,.016]} color="#aebbc1" metal={.7}/>)}
    </group>
    <Box at={[-1.01,.244,.94]} size={[1.73,.435,.74]} color="#52616d"/>
    <group onClick={()=>select(1)}>
      <Box at={[-1.38,.479,.91]} size={[.29,.03,.28]} color={selected===1?'#c28e5c':'#7b8e96'}/>
      <mesh position={[-1.38,.526,.91]}><sphereGeometry args={[.077,24,16]}/><meshStandardMaterial color={latched?'#ff694b':'#a74740'} emissive="#ff5f38" emissiveIntensity={latched?2.35:0}/></mesh>
      {latched&&<pointLight position={[-1.38,.59,.94]} color="#ff7248" intensity={1.15} distance={.95}/>}
    </group>
    <group onClick={()=>select(2)}>
      <mesh position={[-.65,.509,.90]}><cylinderGeometry args={[.144,.144,.087,30]}/><meshStandardMaterial color={selected===2?'#c29866':'#28333b'}/></mesh>
      <mesh position={[-.65,.555,.90]}><cylinderGeometry args={[.042,.042,.009,20]}/><meshStandardMaterial color="#161f28"/></mesh>
      {pulse&&[.18,.235].map(radius=><mesh key={radius} position={[-.65,.574,.90]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[radius,.009,8,26]}/><meshBasicMaterial color="#f6c779"/></mesh>)}
    </group>
    <group onClick={()=>{select(3);press();}}>
      <Box at={[-.06,.173,1.19]} size={[.35,.14,.29]} color="#6d7e87"/>
      <Box at={[-.06,.265,1.19]} size={[.174,.058,.15]} color={selected===3?'#e6ae69':'#b8724f'}/>
    </group>
    <Box at={[-1.50,.137,-.45]} size={[.84,.076,.51]} color="#28809a"/>
    <Box at={[-1.76,.197,-.38]} size={[.18,.114,.155]} color="#aebdc3" metal={.72}/>
    <Box at={[-1.42,.198,-.45]} size={[.27,.056,.116]} color="#283640"/>
    {[-.62,-.28].map(z=><Box key={z} at={[-1.42,.192,z]} size={[.51,.056,.053]} color="#283640"/>)}
    <Line points={[[.64,1.16,.42],[.62,.84,.53],[.27,.23,.55],[-.70,.23,.03],[-1.38,.198,-.27]]} color="#dca258" lineWidth={3}/>
    <Line points={[[-1.38,.46,.68],[-1.53,.28,.52],[-1.35,.226,.03],[-1.32,.198,-.29]]} color="#b36354" lineWidth={3}/>
    <Line points={[[-.64,.46,.66],[-.68,.20,.44],[-1.03,.18,-.11],[-1.22,.196,-.29]]} color="#648caf" lineWidth={2.5}/>
    <Line points={[[-.02,.211,1.09],[-.16,.21,.83],[-.48,.18,.04],[-1.53,.198,-.29]]} color="#384554" lineWidth={2}/>
    {markers.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.008,0]} opacity={.33} scale={5.2} far={1.4} resolution={128} frames={1}/>
  </>;
}

type Alarm={temperature:number;latched:boolean;muted:boolean};
const initial:Alarm={temperature:32,latched:false,muted:false};
export default function IncubatorTemperatureDemo(){
  const [{temperature,latched,muted},set]=useState(initial);
  const [selected,select]=useState(0);
  const [pulse,setPulse]=useState(false);
  const [audioEnabled,setAudioEnabled]=useState(false);
  const audio=useRef<AudioContext|null>(null);
  useEffect(()=>()=>{void audio.current?.close().catch(()=>{});audio.current=null;},[]);
  useEffect(()=>{
    const context=audio.current;
    if(!audioEnabled||!pulse||!context||context.state!=='running')return;
    const tone=context.createOscillator();
    const gain=context.createGain();
    tone.frequency.value=1800;
    gain.gain.value=.035;
    tone.connect(gain).connect(context.destination);
    tone.start();
    return ()=>{tone.stop();tone.disconnect();gain.disconnect();};
  },[audioEnabled,pulse]);
  async function toggleAudio(){
    if(audioEnabled){setAudioEnabled(false);return;}
    try {
      const context=audio.current??new AudioContext();
      audio.current=context;
      await context.resume();
      if(audio.current===context)setAudioEnabled(true);
    } catch {setAudioEnabled(false);}
  }
  const sounding=latched&&!muted;
  useEffect(()=>{
    if(!sounding){setPulse(false);return;}
    setPulse(true);
    const start=performance.now();
    const timer=window.setInterval(()=>setPulse((performance.now()-start)%800<180),32);
    return ()=>window.clearInterval(timer);
  },[sounding]);
  function change(temperature:number){set(previous=>({...previous,temperature,latched:previous.latched||temperature>=37}));}
  function press(){set(previous=>!previous.latched?previous:previous.temperature<=35?{...previous,latched:false,muted:false}:{...previous,muted:true});}
  const message=!latched?'Monitor ready.':temperature<=35?'Chamber cool · Press to reset.':muted?'Alarm acknowledged · LED remains on.':'High temperature · Alarm latched.';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D incubator alert model">
        <Canvas camera={{position:[2.20,3.28,6.75],fov:41}} dpr={[1,1.6]} fallback={<p>Follow the alert controls below.</p>}>
          <Chamber {...{latched,pulse,selected,select,press}}/><OrbitControls target={[0,.91,0]} enablePan={false} minDistance={3.7} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Incubator alert readings">
        <div><span>Chamber air</span><strong>{temperature} °C</strong></div><div><span>D8 warning</span><strong>{latched?'Latched':'Off'}</strong></div><div><span>D9 sounder</span><strong>{sounding?'Pulsing':muted?'Muted':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Trigger, acknowledge and reset</h3>
      <label className="gp-home-light">Chamber temperature <output>{temperature} °C</output><input type="range" aria-label="Chamber temperature" min="24" max="42" value={temperature} onChange={e=>change(e.target.valueAsNumber)}/></label>
      <div className="gp-steps">
        <button type="button" onClick={()=>change(39)}>Warm chamber</button>
        <button type="button" onClick={()=>change(34)}>Cool chamber</button>
        <button type="button" className="gp-button" disabled={!latched} onClick={press}>Press acknowledge/reset</button>
      </div>
      {typeof AudioContext!=='undefined'&&<button type="button" className="gp-button gp-secondary" aria-pressed={audioEnabled} onClick={toggleAudio}>{audioEnabled?'Mute browser sound':'Enable browser sound'}</button>}
      <p role="status">{message}</p>
      <p>The model shows the piezo pulses beside the lamp. The alarm stays latched until a cool reset.</p>
      <ol className="gp-demo-labels">{markers.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{markers[selected].detail}</p>
    </div>
  </div>;
}
