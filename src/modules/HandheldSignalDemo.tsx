import {useEffect,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SignalPaddle} from './SignalPaddleParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const parts:{name:string;at:Point;detail:string}[]=[
  {name:'Diffuser and LED · D8',at:[-.79,1.56,.30],detail:'The diffuser spreads the light from the white LED. The Arduino sends three timed pulses through the 220 Ω resistor.'},
  {name:'Thumb switch · D2',at:[-.37,.80,.35],detail:'A new press starts the burst. Holding the switch down or tapping during a burst does not start another one.'},
  {name:'Handle and cable anchor',at:[-.85,.38,.41],detail:'The laminated handle supports the paddle. The anchor keeps a pull on the cable away from the component terminals.'},
  {name:'Arduino Uno',at:[1.02,.43,1.02],detail:'The Uno filters switch bounce and times each 240 ms flash and gap.'},
];
const burst=['Flash 1 of 3','Gap','Flash 2 of 3','Gap','Flash 3 of 3'] as const;
const flashMs=240;

function Bench({lit,held,selected,select,press}:{lit:boolean;held:boolean;selected:number;select:(i:number)=>void;press:()=>void}){
  return <>
    <color attach="background" args={['#40535d']}/>
    <hemisphereLight args={['#eaf5ff','#997e69',2.08]}/><directionalLight position={[-3,6,4]} color="#fff1de" intensity={2.15}/>
    <Box at={[0,-.094,0]} size={[4.74,.19,3.05]} color="#81928c"/>
    <Box at={[-.70,.083,-.16]} size={[1.39,.165,.89]} color={selected===2?'#b48d69':'#6b7778'}/>
    <group position={[-.73,.153,-.10]} rotation={[-.19,0,-.17]} onClick={press}><SignalPaddle lit={lit} pressed={held}/></group>
    {lit&&<pointLight position={[-.49,1.26,.38]} color="#ffe09d" intensity={2.2} distance={1.45}/>}
    <group onClick={()=>select(3)}>
      <Box at={[1.05,.105,1.06]} size={[1.04,.086,.55]} color={selected===3?'#71aaa6':'#287d89'}/>
      <Box at={[.65,.178,1.14]} size={[.18,.111,.148]} color="#bec9ce" metal={.62}/>
      <Box at={[1.19,.171,1.05]} size={[.24,.058,.108]} color="#25343c"/>
      {[.86,1.27].map(z=><Box key={z} at={[1.10,.165,z]} size={[.65,.055,.046]} color="#27353b"/>)}
    </group>
    <Box at={[1.23,.098,.32]} size={[.68,.102,.43]} color="#ddd9cc"/>
    <Box at={[1.22,.176,.32]} size={[.29,.039,.046]} color="#b5966a"/>
    {[1.115,1.17,1.27,1.32].map(x=><Box key={x} at={[x,.198,.32]} size={[.019,.009,.045]} color="#5b4638"/>)}
    <Line points={[[1.13,.18,.36],[.86,.14,.54],[.93,.18,.86]]} color="#d48464" lineWidth={2.8}/>
    <Line points={[[1.40,.18,.32],[.48,.15,.42],[-.20,.15,.31],[-.72,.23,-.06]]} color="#e2b476" lineWidth={3}/>
    <Line points={[[1.12,.17,.86],[.54,.13,.76],[-.36,.14,.57],[-.72,.20,-.08]]} color="#77b8c7" lineWidth={2.8}/>
    {parts.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.34} scale={5.1} far={1.8} resolution={128} frames={1}/>
  </>;
}

type Signal={held:boolean;phase:number;completed:number};
const ready:Signal={held:false,phase:-1,completed:0};

export default function HandheldSignalDemo(){
  const [signal,setSignal]=useState(ready);
  const [selected,select]=useState(0);
  const {held,phase,completed}=signal;
  const active=phase>=0;
  const lit=active&&phase%2===0;
  useEffect(()=>{
    if(!active)return;
    const timer=window.setTimeout(()=>setSignal(previous=>{
      if(previous.phase!==phase)return previous;
      return phase===burst.length-1?{...previous,phase:-1,completed:previous.completed+1}:{...previous,phase:phase+1};
    }),flashMs);
    return ()=>window.clearTimeout(timer);
  },[active,phase]);
  function press(){
    select(1);
    setSignal(previous=>({...previous,held:!previous.held,phase:!previous.held&&previous.phase<0?0:previous.phase}));
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D handheld signal paddle">
        <Canvas camera={{position:[2.05,3.06,6.26],fov:40}} dpr={[1,1.6]} fallback={<p>Use the flash readout and controls below.</p>}><Bench {...{lit,held,selected,select,press}}/><OrbitControls target={[0,.62,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Signal paddle readings"><div><span>Thumb switch</span><strong>{held?'Held':'Released'}</strong></div><div><span>Lamp</span><strong>{lit?'On':'Off'}</strong></div><div><span>Completed bursts</span><strong>{completed}</strong></div></div>
    </div>
    <div className="gp-guide">
      <h3>Send one burst of three flashes</h3>
      <p>Keep the button held until the burst finishes. Release it and press again to send another burst.</p>
      <div className="gp-steps"><button className="gp-button" type="button" onClick={press}>{held?'Release thumb switch':'Press thumb switch'}</button><button type="button" onClick={()=>{setSignal(ready);select(0);}}>Reset paddle</button></div>
      <p role="status">{active?burst[phase]:held?'Burst finished. Release the switch.':'Ready for a new press.'}</p>
      <ol className="gp-demo-labels">{parts.map(({name},i)=><li key={name}><button className="gp-part-label" type="button" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{parts[selected].detail}</p>
    </div>
  </div>;
}
