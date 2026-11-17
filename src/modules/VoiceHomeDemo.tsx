import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls } from '@react-three/drei';
import type { FormEvent } from 'react';
import type { Mesh } from 'three';
import { homeVoiceSamples, resolveHomeVoice, type HomeVoiceByte } from '../data/voice-home';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { Esp32Board } from './ProjectDemo';
import { VoiceConsolePart } from './VoiceConsolePart';
import { WorldLabel } from './LabWorkbench';

type Point = [number,number,number];
type Lights = {desk:boolean; hall:boolean};
const labels: {name:string; at:Point; detail:string}[] = [
  {name:'Computer microphone',at:[-1.76,1.0,.66],detail:'The computer listens for one complete phrase. On the physical build, the Python console runs Vosk locally.'},
  {name:'ESP32 serial receiver',at:[-.50,.55,.83],detail:'One printable byte arrives over USB. The ESP32 updates the lamp GPIO and replies with both output states.'},
  {name:'Desk lamp · GPIO25',at:[.34,1.43,-.63],detail:'GPIO25 drives the lamp through its own 220 Ω resistor. Uppercase D turns it on and lowercase d turns it off.'},
  {name:'Hall lamp · GPIO26',at:[1.66,1.50,-.67],detail:'GPIO26 drives the separate hall lamp. Uppercase H turns it on, lowercase h turns it off, and S turns both lamps off.'},
];
const cable:Point[]=[[-1.75,.11,.52],[-1.44,.10,.96],[-1.03,.09,1.19],[-.65,.16,.96]];
const outputs: Record<HomeVoiceByte,(lights:Lights)=>Lights> = {
 D:lights=>({...lights,desk:true}),d:lights=>({...lights,desk:false}),
 H:lights=>({...lights,hall:true}),h:lights=>({...lights,hall:false}),S:()=>({desk:false,hall:false}),
};

function Lamp({at,on,selected,select}:{at:Point;on:boolean;selected:boolean;select:()=>void}) {
  return <group position={at} onClick={select}>
    <Box at={[0,.04,-.115]} size={[.23,.16,.09]} color={selected?'#f2be6f':'#526069'} metal={.6}/>
    <mesh><cylinderGeometry args={[.075,.142,.16,30]}/><meshStandardMaterial color="#606d74" metalness={.62} roughness={.37}/></mesh>
    <mesh position={[0,-.087,0]}><sphereGeometry args={[.052,20,14]}/><meshStandardMaterial color={on?'#fff2c4':'#a5a6a0'} emissive="#ffd178" emissiveIntensity={on?2.6:0}/></mesh>
    {on&&<pointLight position={[0,-.12,.08]} color="#ffcf83" intensity={4} distance={2.3}/>}
  </group>;
}

function VoiceBench({lights,signal,selected,select,talking,connected}:{lights:Lights;signal:number;selected:number;select:(i:number)=>void;talking:boolean;connected:boolean}) {
  const pulse=useRef<Mesh>(null);
  const progress=useRef({event:0,elapsed:1});
  useFrame((_,delta)=>{
    if(!pulse.current) return;
    if(progress.current.event!==signal) progress.current={event:signal,elapsed:0};
    const value=progress.current;
    value.elapsed+=delta;
    pulse.current.visible=connected&&signal>0&&value.elapsed<.7;
    if(!pulse.current.visible) return;
    const point=value.elapsed/.7*(cable.length-1);
    const segment=Math.floor(point), mix=point-segment;
    const from=cable[segment],to=cable[segment+1];
    pulse.current.position.set(from[0]+(to[0]-from[0])*mix,from[1]+(to[1]-from[1])*mix+.03,from[2]+(to[2]-from[2])*mix);
  });
  return <>
    <color attach="background" args={['#263b4d']}/>
    <hemisphereLight args={['#e8f3ff','#7e655a',1.87]}/>
    <directionalLight position={[-5,8,5]} color="#fff2df" intensity={2.24}/>
    <Box at={[0,-.11,-.05]} size={[5.35,.20,3.24]} color="#677b83"/>
    <Box at={[1.03,.12,-.54]} size={[2.61,.23,1.86]} color="#a18b77"/>
    <Box at={[.42,.91,-1.41]} size={[1.42,1.44,.13]} color="#c0b4a3"/>
    <Box at={[1.69,.91,-1.41]} size={[1.11,1.44,.13]} color="#a2aea9"/>
    <Box at={[1.06,.88,-.74]} size={[.113,1.37,1.31]} color="#d4c3a8"/>
    <Box at={[.443,.254,-.56]} size={[1.31,.048,1.69]} color="#ad855e"/>
    {Array.from({length:9},(_,i)=><Box key={i} at={[-.20+i*.155,.28,-.56]} size={[.012,.003,1.67]} color="#765c48"/>)}
    <Box at={[1.68,.253,-.56]} size={[1.1,.048,1.69]} color="#798a8f"/>
    {Array.from({length:6},(_,i)=><Box key={i} at={[1.68,.278,-1.35+i*.27]} size={[1.07,.005,.012]} color="#5e717b"/>)}
    <Box at={[.325,.62,-.83]} size={[.93,.075,.65]} color="#87684e" metal={.10}/>
    {[-.04,.69].map(x=><Box key={x} at={[x,.433,-.83]} size={[.072,.36,.53]} color="#67584b"/>)}
    <Box at={[.32,.676,-.70]} size={[.32,.035,.19]} color="#dcd5be"/>
    <Box at={[1.76,.64,-1.335]} size={[.40,.63,.039]} color="#667f79"/>
    <Box at={[1.76,.92,-1.304]} size={[.42,.034,.063]} color="#a1aaa1"/>
    <Lamp at={[.34,1.15,-1.29]} on={lights.desk} selected={selected===2} select={()=>select(2)}/>
    <Lamp at={[1.66,1.23,-1.29]} on={lights.hall} selected={selected===3} select={()=>select(3)}/>
    <group position={[-1.69,.08,.03]} onClick={()=>select(0)}><VoiceConsolePart active={talking} selected={selected===0}/></group>
    <group position={[-.48,.113,.81]} rotation={[0,Math.PI/2,0]} onClick={()=>select(1)}>
      <Box at={[0,-.046,0]} size={[.76,.075,1.14]} color={selected===1?'#d9ad76':'#c4c9c6'}/>
      <Esp32Board receiving={connected}/>
    </group>
    <Line points={cable} color="#282f37" lineWidth={4}/>
    <Line points={[[-.39,.162,.67],[-.24,.15,.44],[-.16,.31,-1.34],[.34,1.12,-1.38]]} color="#c87857" lineWidth={3}/>
    <Line points={[[-.40,.17,.89],[-.17,.12,.68],[1.9,.11,.48],[2.21,.5,-1.24],[1.67,1.22,-1.38]]} color="#5a9ab4" lineWidth={3}/>
    <mesh ref={pulse} visible={false}><sphereGeometry args={[.054,16,12]}/><meshBasicMaterial color="#8ff3d9"/></mesh>
    {labels.map(({name,at},index)=><WorldLabel key={name} position={at} className="gp-marker-anchor">
      <button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===index} onClick={()=>select(index)}>
        {index+1}{selected===index&&<span className="gp-demo-marker-name">{name}</span>}
      </button>
    </WorldLabel>)}
    <ContactShadows position={[0,.004,0]} opacity={.34} scale={5.6} far={1.2} resolution={128} frames={1}/>
  </>;
}

export default function VoiceHomeDemo() {
  const [lights,setLights]=useState<Lights>({desk:false,hall:false});
  const [selected,select]=useState(0);
  const [phrase,setPhrase]=useState('');
  const [transcript,setTranscript]=useState('');
  const [byte,setByte]=useState('—');
  const [message,setMessage]=useState('Play a sample phrase or enter a transcript.');
  const [playing,setPlaying]=useState('');
  const [signal,setSignal]=useState(0);
  const [connected,setConnected]=useState(true);
  const audio=useRef<HTMLAudioElement|null>(null);
  useEffect(()=>()=>{const clip=audio.current;audio.current=null;clip?.pause();},[]);
  function stopAudio(){
    const clip=audio.current;
    audio.current=null;
    clip?.pause();
    setPlaying('');
  }
  function execute(text:string){
    const command=resolveHomeVoice(text);
    setTranscript(text);
    setByte('—');
    if(!command){setMessage('Unknown phrase · No command sent');return;}
    if(!connected){setMessage('Serial port closed · No command sent');return;}
    const next=outputs[command.byte](lights);
    setLights(next);
    setByte(command.byte);
    setSignal(current=>current+1);
    setMessage(`ESP32 replied · Desk=${Number(next.desk)} Hall=${Number(next.hall)}`);
  }
  async function playSample(sample:string) {
    stopAudio();
    const clip=new Audio(`./audio/voice-home/${sample.replaceAll(' ','-')}.m4a`);
    audio.current=clip;
    setPlaying(sample);
    setMessage('Playing a prerecorded phrase…');
    const finish=()=>{if(audio.current===clip){stopAudio();execute(sample);}};
    clip.onended=finish;
    clip.onerror=finish;
    try { await clip.play(); } catch { finish(); }
  }
  function submit(event:FormEvent){event.preventDefault();stopAudio();execute(phrase);}
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D voice-controlled lighting bench">
        <Canvas camera={{position:[2.7,4.1,6.4],fov:43}} dpr={[1,1.6]} fallback={<p>Follow the serial command and lamp readings below.</p>}>
          <VoiceBench {...{lights,signal,selected,select,connected}} talking={Boolean(playing)}/>
          <OrbitControls target={[0,.47,-.04]} minDistance={4} maxDistance={11} maxPolarAngle={1.48} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Voice home readings">
        <div><span>USB byte</span><strong>{byte}</strong></div>
        <div><span>Desk light</span><strong>{lights.desk?'On':'Off'}</strong></div>
        <div><span>Hall light</span><strong>{lights.hall?'On':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Voice command console</h3>
      <p>Play a sample to follow the supplied transcript to the ESP32, or type your own transcript. The moving dot shows the USB command path.</p>
      <div className="gp-steps" role="group" aria-label="Sample phrases">{homeVoiceSamples.map(sample=><button type="button" key={sample}
        aria-pressed={playing===sample} onClick={()=>void playSample(sample)}>{sample}</button>)}</div>
      <form className="gp-voice-home-entry" onSubmit={submit}>
        <label htmlFor="voice-home-input">Transcript to test</label>
        <input id="voice-home-input" value={phrase} onChange={event=>setPhrase(event.target.value)} placeholder="home desk on"/>
        <button className="gp-button gp-secondary" type="submit">Send transcript</button>
      </form>
      <p><strong>Transcript</strong> {transcript||'—'}</p>
      <p role="status">{message}</p>
      <button type="button" className="gp-button gp-secondary" onClick={()=>{
        stopAudio();setConnected(!connected);setByte('—');setMessage(connected?'Serial port closed · USB power remains on':'Serial port open · Ready for a command');
      }}>{connected?'Close simulated serial port':'Open simulated serial port'}</button>
      <ol className="gp-demo-labels">{labels.map(({name},index)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>select(index)}><span>{index+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
