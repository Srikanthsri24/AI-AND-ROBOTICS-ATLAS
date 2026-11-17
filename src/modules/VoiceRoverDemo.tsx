import { useEffect,useRef,useState } from 'react';
import { Canvas,useFrame } from '@react-three/fiber';
import { ContactShadows,Line,OrbitControls } from '@react-three/drei';
import type { Group, Mesh } from 'three';
import { resolveVoiceCommand,voiceCommands,voicePulse,voiceStop,type VoiceCommand } from '../data/voice-rover';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { BluetoothMotorDriver,Esp32Board } from './ProjectDemo';
import { VoiceConsolePart } from './VoiceConsolePart';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Recognition={
  lang:string;processLocally:boolean;continuous:boolean;interimResults:boolean;
  onresult:((event:{results:ArrayLike<ArrayLike<{transcript:string}>>})=>void)|null;
  onerror:((event:{error:string})=>void)|null;onend:(()=>void)|null;
  start:()=>void;abort:()=>void;
};
type RecognitionClass={
  new():Recognition;
  available?:(options:{langs:string[];processLocally:true})=>Promise<string>;
  install?:(options:{langs:string[];processLocally:true})=>Promise<boolean>;
};
const labels = [
  ['Computer microphone','The microphone captures one phrase when you press Listen. Local recognition produces a transcript.'],
  ['ESP32 receiver','The console sends the matched command as a single serial letter. The ESP32 decodes the letter and times the 850 ms drive pulse.'],
  ['Motor driver','The TB6612FNG uses GPIO speed and direction signals to control the two AA-powered motors. Standby cuts both motors.'],
  ['Left wheel','Forward and reverse drive both wheels together. Left turns reverse this wheel and drive the right wheel forward.'],
  ['Right wheel','Right turns reverse this wheel and drive the left wheel forward. Opposite wheel directions make the rover pivot.'],
] as const;
const examples=[...voiceCommands.map(({word})=>({word,phrase:'rover '+word})),{word:'unknown',phrase:'hello there'}];

function Marker({part,at,selected,select}:{part:number;at:Point;selected:number;select:(i:number)=>void}){
  return <WorldLabel className="gp-marker-anchor" position={at}><button className="gp-marker" type="button"
    aria-label={labels[part][0]} aria-pressed={part===selected} onClick={()=>select(part)}>
    {part+1}{part===selected&&<span className="gp-demo-marker-name">{labels[part][0]}</span>}
  </button></WorldLabel>;
}

function VoiceScene({command,selected,select,halt,talking}:{
  command:VoiceCommand;selected:number;select:(i:number)=>void;halt:()=>void;talking:boolean;
}){
  const rover=useRef<Group>(null);
  const wheels=useRef<Group>(null);
  const radio=useRef<Mesh>(null);
  const moving=command.letter!=='S';
  useFrame(({clock},rawStep)=>{
    if(!rover.current||!wheels.current||!moving)return;
    const dt=Math.min(rawStep,.035);
    const steering=(command.left-command.right)*1.02;
    const travel=(command.left+command.right)*.61;
    const yaw=rover.current.rotation.y+dt*steering;
    const x=rover.current.position.x+Math.sin(yaw)*travel*dt;
    const z=rover.current.position.z+Math.cos(yaw)*travel*dt;
    if(x<-.34||x>2.16||z>1.43||z< -1.27){halt();return;}
    rover.current.position.set(x,.03,z);
    rover.current.rotation.y=yaw;
    wheels.current.children[0].rotation.x+=command.left*4.8*dt;
    wheels.current.children[1].rotation.x+=command.right*4.8*dt;
    const p=(clock.elapsedTime%1.2)/1.2;
    radio.current?.position.set(-2.51+(x+2.51)*p,.69+Math.sin(p*Math.PI)*.53,-1.40+(z+1.40)*p);
  });
  return <>
    <color attach="background" args={['#263d4c']}/>
    <hemisphereLight args={['#e4f3ff','#6b5748',2.15]}/>
    <directionalLight position={[-4,6,5]} intensity={2.85}/>
    <Box at={[0,-.15,0]} size={[7.14,.28,4.92]} color="#536b74"/>
    <Box at={[0,.006,0]} size={[7.04,.034,4.82]} color="#637d82"/>
    {[-.95,2.78].map(x=><Box key={x} at={[x,.030,.095]} size={[.028,.016,3.93]} color="#e2bf74"/>)}
    {[-1.87,2.06].map(z=><Box key={z} at={[.915,.030,z]} size={[3.73,.016,.027]} color="#e2bf74"/>)}
    <Line points={[[.47,.044,.81],[.47,.044,1.45],[1.15,.044,1.45],[1.15,.044,.81]]} color="#d4e5d3" lineWidth={2}/>
    {[.28,.68,1.08,1.48].map(z=><Box key={z} at={[-.66,.032,z]} size={[.19,.010,.043]} color="#b9d1c7"/>)}
    <Box at={[-2.40,.095,-1.40]} size={[1.55,.15,1.12]} color="#465465" metal={.34}/>
    <group position={[-2.40,.18,-1.44]} onClick={()=>select(0)}><VoiceConsolePart active={talking} selected={selected===0}/></group>
    <Marker part={0} at={[-2.40,1.02,-1.18]} {...{selected,select}}/>
    {moving&&<mesh ref={radio} position={[-2.51,.69,-1.40]}><sphereGeometry args={[.048,14,12]}/><meshBasicMaterial color="#7dfde1"/></mesh>}
    <group ref={rover} position={[.65,.03,-.12]}>
      <Box at={[0,.242,0]} size={[.81,.068,1.14]} color="#586a74" metal={.58}/>
      <Box at={[0,.342,.014]} size={[.76,.051,1.09]} color="#bc8850" metal={.47}/>
      <Box at={[0,.31,.582]} size={[.66,.077,.13]} color="#566d73" metal={.51}/>
      <Box at={[0,.368,.548]} size={[.18,.015,.095]} color="#eee4d0"/>
      {[-.27,.27].flatMap(x=>[-.425,.436].map(z=><mesh key={x+':'+z} position={[x,.383,z]}><cylinderGeometry args={[.027,.027,.025,14]}/><meshStandardMaterial color="#a3b4bb" metalness={.73}/></mesh>))}
      <group ref={wheels}>
        {[-.478,.478].map((x,i)=><group key={x} position={[x,.179,.212]} onClick={()=>select(i+3)}>
          <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.178,.178,.119,30]}/><meshStandardMaterial color="#20272a" roughness={.90}/></mesh>
          {Array.from({length:16},(_,rib)=><group key={rib} rotation={[rib*Math.PI/8,0,0]}><Box at={[0,.173,0]} size={[.119,.023,.029]} color="#333a3d"/></group>)}
          <mesh position={[Math.sign(x)*.069,0,0]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.121,.121,.018,24]}/><meshStandardMaterial color={selected===i+3?'#fff0a0':'#c5965a'} metalness={.56}/></mesh>
          <Box at={[Math.sign(x)*.079,.052,0]} size={[.016,.048,.027]} color="#655039"/>
        </group>)}
      </group>
      <mesh position={[0,.089,-.43]}><sphereGeometry args={[.089,18,16]}/><meshStandardMaterial color="#8b9bac" metalness={.63}/></mesh>
      <Box at={[0,.423,-.37]} size={[.57,.113,.27]} color="#282d32"/>
      <group position={[.16,.406,.15]} rotation={[0,Math.PI,0]} scale={.55} onClick={()=>select(1)}>
        <Box at={[0,-.036,0]} size={[.55,.045,.97]} color={selected===1?'#f5c97e':'#6a7b88'}/>
        <Esp32Board receiving={moving}/>
      </group>
      <group position={[-.218,.408,.208]} scale={.65} onClick={()=>select(2)}>
        <Box at={[0,-.018,0]} size={[.46,.041,.47]} color={selected===2?'#ffdb83':'#82726c'}/>
        <BluetoothMotorDriver/>
      </group>
      <Line points={[[.119,.435,.16],[.005,.514,.24],[-.13,.452,.23]]} color="#63abe4" lineWidth={2.6}/>
      <Line points={[[.138,.416,-.29],[-.11,.454,-.19],[-.20,.421,.166]]} color="#d76953" lineWidth={2.4}/>
      <Marker part={1} at={[.25,.84,.18]} {...{selected,select}}/>
      <Marker part={2} at={[-.23,.69,.075]} {...{selected,select}}/>
      <Marker part={3} at={[-.61,.35,.35]} {...{selected,select}}/>
      <Marker part={4} at={[.62,.35,.31]} {...{selected,select}}/>
    </group>
    <ContactShadows position={[0,.042,0]} opacity={.36} scale={6.7} blur={2.2} far={1.2} resolution={128}/>
  </>;
}

export default function VoiceRoverDemo(){
  const [command,setCommand]=useState<VoiceCommand>(voiceStop);
  const [serial,setSerial]=useState('—');
  const [transcript,setTranscript]=useState('—');
  const [typed,setTyped]=useState('');
  const [source,setSource]=useState('Waiting for a phrase');
  const [status,setStatus]=useState('Choose a sample or type a phrase.');
  const [selected,select]=useState(0);
  const [run,resetScene]=useState(0);
  const [listening,setListening]=useState(false);
  const [sample,setSample]=useState<string|null>(null);
  const [pack,setPack]=useState(false);
  const clock=useRef<number|undefined>(undefined);
  const mic=useRef<Recognition|null>(null);
  const audio=useRef<HTMLAudioElement|null>(null);
  const inputRevision=useRef(0);
  useEffect(()=>{
    return ()=>{
      inputRevision.current++;
      window.clearTimeout(clock.current);
      const recognition=mic.current;
      mic.current=null;
      recognition?.abort();
      const clip=audio.current;
      audio.current=null;
      clip?.pause();
    };
  },[]);
  function halt(reason:string){
    window.clearTimeout(clock.current);
    setCommand(voiceStop);
    setStatus(reason);
  }
  function receive(phrase:string,input:string){
    const next=resolveVoiceCommand(phrase);
    setSource(input);
    setTranscript(phrase||'—');
    setSerial(next?.letter??'—');
    if(!next){
      setStatus('Unknown phrase · No command sent');
      return;
    }
    setCommand(next);
    window.clearTimeout(clock.current);
    if(next.letter==='S'){
      setStatus('Stop received · Both wheels disabled');
      return;
    }
    setStatus('Drive pulse active · '+next.word);
    clock.current=window.setTimeout(()=>halt('850 ms elapsed · Both wheels disabled'),voicePulse);
  }
  function cancelInput(){
    inputRevision.current++;
    const pending=mic.current;
    mic.current=null;
    pending?.abort();
    setListening(false);
    const clip=audio.current;
    audio.current=null;
    clip?.pause();
    setSample(null);
  }
  async function playExample(word:string,phrase:string){
    cancelInput();
    const clip=new Audio('./audio/voice-rover/'+word+'.m4a');
    audio.current=clip;
    setSample(word);
    setStatus('Playing a prerecorded phrase…');
    const finish=()=>{
      if(audio.current!==clip)return;
      audio.current=null;
      setSample(null);
      receive(phrase,'Sample transcript');
    };
    clip.onended=finish;
    try{await clip.play();}
    catch{finish();}
  }
  async function listen(){
    const browser=window as Window & {SpeechRecognition?:RecognitionClass;webkitSpeechRecognition?:RecognitionClass};
    const api=browser.SpeechRecognition??browser.webkitSpeechRecognition;
    if(!api?.available){
      setStatus('On-device speech is unavailable here. Try a sample or type a phrase.');
      return;
    }
    cancelInput();
    setListening(true);
    const revision=inputRevision.current;
    const options={langs:['en-US'],processLocally:true as const};
    try{
      let available=await api.available(options);
      if(revision!==inputRevision.current)return;
      if(pack&&available==='downloadable'&&api.install){
        setStatus('Installing the browser’s local English pack…');
        if(await api.install(options))available=await api.available(options);
      }
      if(revision!==inputRevision.current)return;
      if(available!=='available'){
        setPack(available==='downloadable');
        setStatus(available==='downloadable'?'Install the local English pack to use the microphone. Sample and typed phrases are ready now.':'On-device speech is unavailable here. Try a sample or type a phrase.');
        setListening(false);
        return;
      }
      const recognizer=new api();
      mic.current=recognizer;
      recognizer.lang='en-US';
      recognizer.processLocally=true;
      recognizer.continuous=false;
      recognizer.interimResults=false;
      recognizer.onresult=event=>{
        if(mic.current===recognizer)receive(event.results[0]?.[0]?.transcript??'','Microphone transcript');
      };
      recognizer.onerror=event=>{
        if(mic.current===recognizer)setStatus('Microphone '+event.error+' · Try a sample or type a phrase.');
      };
      recognizer.onend=()=>{
        if(mic.current!==recognizer)return;
        mic.current=null;
        setListening(false);
      };
      recognizer.start();
      setStatus('Listening locally · Say “rover” and one command.');
    }catch{
      if(revision!==inputRevision.current)return;
      mic.current=null;
      setListening(false);
      setStatus('Microphone unavailable · Try a sample or type a phrase.');
    }
  }
  const direction=(value:number)=>value>0?'Forward':value<0?'Reverse':'Stopped';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D voice rover training floor">
        <Canvas camera={{position:[3.0,5.0,6.7],fov:45}} dpr={[1,1.6]} fallback={<p>Use the transcript and wheel readings to follow each command.</p>}>
          <VoiceScene key={run} {...{command,selected,select}} halt={()=>halt('Course edge · Both wheels disabled')} talking={listening||sample!==null}/>
          <OrbitControls target={[0,.25,0]} minDistance={3.8} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Voice rover readings">
        <div><span>Serial command</span><strong>{serial}</strong></div>
        <div><span>Left wheel</span><strong>{direction(command.left)}</strong></div>
        <div><span>Right wheel</span><strong>{direction(command.right)}</strong></div>
      </div>
    </div>
    <div className="gp-guide gp-voice-controls">
      <h3>Say a command, then watch the wheels</h3>
      <p>Use “rover” followed by forward, reverse, left, right or stop. Each drive pulse lasts 850 ms.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={listening||sample!==null} onClick={()=>void listen()}>
          {listening?'Listening…':pack?'Install local English pack':'Listen on this device'}
        </button>
        <button type="button" onClick={()=>{cancelInput();receive('rover stop','Manual stop');}}>Stop now</button>
        <button type="button" onClick={()=>{cancelInput();halt('Rover reset');setSerial('—');setTranscript('—');setSource('Waiting for a phrase');resetScene(value=>value+1);}}>Reset rover</button>
      </div>
      <form onSubmit={event=>{event.preventDefault();cancelInput();receive(typed,'Typed phrase');}}>
        <label htmlFor="voice-rover-phrase">Type a phrase</label>
        <div>
          <input id="voice-rover-phrase" value={typed} onChange={event=>setTyped(event.target.value)} placeholder="rover forward"/>
          <button className="gp-button gp-secondary" type="submit">Send phrase</button>
        </div>
      </form>
      <div className="gp-steps" role="group" aria-label="Prerecorded speech examples">
        {examples.map(({word,phrase})=><button key={word} type="button" aria-pressed={sample===word} onClick={()=>void playExample(word,phrase)}>{word==='unknown'?'Unknown phrase':phrase}</button>)}
      </div>
      <p className="gp-voice-transcript"><span>{source}</span><strong>{transcript}</strong></p>
      <p role="status" className="gp-demo-description">{status}</p>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
