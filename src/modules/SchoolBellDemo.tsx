import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import type { Mesh } from 'three';
import { bellLength, bellNotes, schoolBellSchedule } from '../data/school-bell';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Clock={day:number;seconds:number;rings:number;event:string|null};
const days=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const startClock:Clock={day:0,seconds:8*3600+29*60+55,rings:0,event:null};
const displayTime=(seconds:number)=>{
  const h=Math.floor(seconds/3600), m=Math.floor(seconds/60)%60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
};
function advance(clock:Clock,amount:number):Clock {
  const at=clock.seconds+amount;
  const seconds=at%86400;
  const day=(clock.day+Math.floor(at/86400))%7;
  const event=Math.floor(clock.seconds/60)!==Math.floor(at/60)&&day<5
    ? schoolBellSchedule.find(item=>item.hour*60+item.minute===Math.floor(seconds/60))?.name
    : undefined;
  return {day,seconds,rings:clock.rings+(event?1:0),event:event??clock.event};
}

function Part({at,size,color,metal=0}: {at:Point;size:Point;color:string;metal?:number}) {
  return <RoundedBox position={at} args={size} radius={.019} smoothness={2}>
    <meshStandardMaterial color={color} metalness={metal} roughness={.6}/>
  </RoundedBox>;
}

export function ClockBoard({selected=false}: {selected?:boolean}) {
  return <>
    <Part at={[0,.035,0]} size={[.73,.074,.59]} color={selected?'#846847':'#205489'}/>
    <Part at={[-.055,.104,.037]} size={[.33,.074,.26]} color="#30333d"/>
    {[-.15,.23].map(z=><Part key={z} at={[.01,.127,z]} size={[.24,.015,.060]} color="#adb0af" metal={.59}/>)}
    <Part at={[.26,.086,-.12]} size={[.10,.09,.31]} color="#deded3"/>
    {[-.21,-.12,-.03,.06].map(z=><Part key={z} at={[-.376,.066,z]} size={[.19,.025,.021]} color="#bfc0b7" metal={.65}/>)}
    <mesh position={[0,-.025,0]}><cylinderGeometry args={[.23,.23,.055,38]}/><meshStandardMaterial color="#aeb5b6" metalness={.71} roughness={.31}/></mesh>
    <Part at={[0,-.059,0]} size={[.37,.031,.075]} color="#7c8385" metal={.49}/>
  </>;
}

const segments=[
  {x:0,y:.227,w:.245,h:.045},{x:.144,y:.114,w:.042,h:.174},
  {x:.144,y:-.114,w:.042,h:.174},{x:0,y:-.227,w:.245,h:.045},
  {x:-.144,y:-.114,w:.042,h:.174},{x:-.144,y:.114,w:.042,h:.174},
  {x:0,y:0,w:.245,h:.044},
];
const font=['012345','12','01346','01236','1256','02356','023456','012','0123456','012356'];
export function ClockDisplay({time='08:30',selected=false}: {time?:string;selected?:boolean}) {
  return <>
    <Part at={[0,0,0]} size={[2.19,.79,.20]} color={selected?'#956d4d':'#2c3944'}/>
    <Part at={[0,0,.102]} size={[2.06,.66,.073]} color="#34292c"/>
    <Part at={[0,0,-.13]} size={[2.12,.69,.062]} color="#174a76"/>
    {time.replace(':','').split('').map((digit,index)=><group key={index} position={[[ -.71,-.29,.29,.71][index],0,.147]}>
      {segments.map(({x,y,w,h},i)=>{
        const on=font[Number(digit)]?.includes(String(i));
        return <mesh key={i} position={[x,y,0]}><boxGeometry args={[w,h,.009]}/>
          <meshStandardMaterial color={on?'#fc5944':'#563439'} emissive="#ef3924" emissiveIntensity={on?1.45:0}/>
        </mesh>;
      })}
    </group>)}
    {[-.105,.105].map(y=><mesh key={y} position={[0,y,.15]}>
      <boxGeometry args={[.044,.050,.015]}/><meshStandardMaterial color="#fa604b" emissive="#ec3923" emissiveIntensity={1.3}/>
    </mesh>)}
  </>;
}

const detail=[
  ['DS3231 clock','This board supplies the calendar day, hour and minute. The coin cell maintains its time when the Uno loses USB power.'],
  ['LED time display','The four digits and colon share SDA and SCL with the RTC. Their different I²C addresses let the Uno talk to each board separately.'],
  ['Arduino Uno','The Uno checks the time once each minute. A weekday must match a timetable entry before it starts the chime.'],
  ['Passive piezo','D9 sends two square-wave bursts through the 220 Ω resistor. The piezo vibrates at each frequency to produce two distinct tones.'],
] as const;

function Sounder({ring,selected}: {ring:boolean;selected:boolean}) {
  const cap=useRef<Mesh>(null);
  useFrame(({clock})=>{
    if(cap.current) cap.current.position.y=.339+(ring?Math.sin(clock.elapsedTime*53)*.021:0);
  });
  return <group position={[1.69,0,.85]}>
    <mesh position={[0,.196,0]}><cylinderGeometry args={[.31,.32,.273,36]}/><meshStandardMaterial color={selected?'#a77e4b':'#303843'}/></mesh>
    <mesh ref={cap} position={[0,.339,0]}><cylinderGeometry args={[.28,.28,.019,36]}/><meshStandardMaterial color="#333b47"/></mesh>
    <mesh position={[0,.354,0]}><cylinderGeometry args={[.045,.045,.012,18]}/><meshStandardMaterial color={ring?'#e6ad58':'#181b21'} emissive="#ffba65" emissiveIntensity={ring ? .86 : 0}/></mesh>
    {ring&&[.38,.49,.60].map(radius=><mesh key={radius} position={[0,.583,0]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[radius,radius+.013,38]}/><meshBasicMaterial color="#ffca81" transparent opacity={.62}/>
    </mesh>)}
  </group>;
}

function Scene({time,ring,selected,select}: {time:string;ring:boolean;selected:number;select:(index:number)=>void}) {
  return <>
    <color attach="background" args={['#263b4f']}/>
    <ambientLight intensity={1.35}/><directionalLight position={[3,7,5]} intensity={2.58}/>
    <directionalLight position={[-5,4,-3]} intensity={1.21} color="#b0c6dd"/>
    <Part at={[0,-.13,0]} size={[5.89,.22,3.52]} color="#8f684c"/>
    <Part at={[0,.014,0]} size={[5.74,.069,3.42]} color="#617d73"/>
    <Part at={[-.26,.136,-.80]} size={[2.61,.19,.89]} color="#a68561"/>
    {[-1.15,.62].map(x=><Part key={x} at={[x,.60,-.97]} size={[.15,.86,.17]} color="#aa895f"/>)}
    <group position={[-.27,.99,-.80]}><ClockDisplay time={time} selected={selected===1}/></group>
    <Part at={[-1.82,.13,.46]} size={[.98,.15,.81]} color="#b3aaa0"/>
    <group position={[-1.86,.302,.46]}><ClockBoard selected={selected===0}/></group>
    <Part at={[-.12,.142,.58]} size={[1.42,.10,.85]} color={selected===2?'#ab844e':'#248394'}/>
    <Part at={[-.74,.231,.59]} size={[.23,.12,.26]} color="#a3afb4" metal={.68}/>
    <Part at={[-.15,.23,.70]} size={[.29,.059,.127]} color="#262f3a"/>
    {[-.28,.28].map(offset=><Part key={offset} at={[.06,.226,.58+offset]} size={[.98,.067,.064]} color="#323a43"/>)}
    <Part at={[1.52,.12,.77]} size={[1.25,.15,.88]} color="#deddd2"/>
    <mesh position={[1.12,.211,.83]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.037,.037,.19,18]}/><meshStandardMaterial color="#c5a678"/></mesh>
    {[-.055,-.014,.026,.066].map((dx,i)=><mesh key={dx} position={[1.12+dx,.211,.83]} rotation={[0,0,Math.PI/2]}>
      <cylinderGeometry args={[.038,.038,.012,14]}/><meshStandardMaterial color={['#a74435','#a74435','#674030','#a58753'][i]}/>
    </mesh>)}
    <Sounder ring={ring} selected={selected===3}/>
    {['#dfb873','#94b4c7'].map((color,i)=><Line key={i} points={[[.26+i*.11,.255,.324],[-.38+i*.11,.30,.11],[-1.18+i*.11,.26,.24],[-1.52,.31,.39+i*.09],[-1.94,.28,-.17],[-1.17,.29,-.92+i*.08],[-1.12,.72,-.88+i*.08]]} color={color} lineWidth={1.95}/>)}
    <Line points={[[.31,.24,.891],[.72,.36,.90],[1.0,.217,.83]]} color={ring?'#ffab6c':'#b67d69'} lineWidth={2}/>
    <Line points={[[1.23,.21,.83],[1.42,.25,.88],[1.5,.18,.85]]} color={ring?'#ffab6c':'#b67d69'} lineWidth={2}/>
    <Line points={[[1.87,.21,1.01],[1.68,.22,1.24],[.61,.22,1.20],[.11,.23,.88]]} color="#3c474f" lineWidth={1.9}/>
    {([{at:[-1.86,.39,.48],tag:[-2.10,.94,.69]},
      {at:[-.22,1.23,-.68],tag:[-.67,1.53,-.52]},
      {at:[-.15,.25,.68],tag:[-.21,.76,1.07]},
      {at:[1.68,.36,.86],tag:[2.05,.87,1.14]}] satisfies {at:Point;tag:Point}[]).map(({at,tag},index)=><group key={index}>
      <Line points={[at,tag]} color={selected===index?'#ffe297':'#bfccd8'} lineWidth={1.42}/>
      <WorldLabel position={tag} className="gp-marker-anchor">
        <button type="button" className="gp-marker" aria-label={detail[index][0]} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button>
      </WorldLabel>
    </group>)}
    <ContactShadows position={[0,.035,0]} opacity={.40} blur={2.4} scale={8} far={4}/>
  </>;
}

type AudioOutput={context:AudioContext;level:GainNode};
function chime(output:AudioOutput){
  const {context,level}=output;
  let start=context.currentTime;
  for(const {pitch,duration} of bellNotes){
    const end=start+duration/1000;
    if(pitch){
      const tone=context.createOscillator();
      const envelope=context.createGain();
      tone.type='square';
      tone.frequency.setValueAtTime(pitch,start);
      envelope.gain.setValueAtTime(.001,start);
      envelope.gain.linearRampToValueAtTime(1,start+.023);
      envelope.gain.exponentialRampToValueAtTime(.001,end);
      tone.connect(envelope);envelope.connect(level);
      tone.start(start);tone.stop(end);
      tone.onended=()=>{tone.disconnect();envelope.disconnect();};
    }
    start=end;
  }
}

export default function SchoolBellDemo() {
  const [clock,setClock]=useState(startClock);
  const [running,setRunning]=useState(false);
  const [ring,setRing]=useState(false);
  const [muted,setMuted]=useState(false);
  const [selected,setSelected]=useState(0);
  const [slot,setSlot]=useState(0);
  const audio=useRef<AudioOutput|null>(null);
  function enableAudio(){
    if(!window.AudioContext) return;
    if(!audio.current){
      const context=new AudioContext();
      const level=context.createGain();
      level.gain.value=muted?0:.035;
      level.connect(context.destination);
      audio.current={context,level};
    }
    void audio.current.context.resume().catch(()=>{});
  }

  useEffect(()=>{
    if(!running) return;
    const timer=window.setInterval(()=>setClock(value=>advance(value,1)),200);
    return ()=>window.clearInterval(timer);
  },[running]);
  useEffect(()=>{
    if(clock.rings===0) return;
    setRing(true);
    if(audio.current) chime(audio.current);
    const timer=window.setTimeout(()=>setRing(false),bellLength+280);
    return ()=>window.clearTimeout(timer);
  },[clock.rings]);
  useEffect(()=>{
    const sound=audio.current;
    if(sound) sound.level.gain.setTargetAtTime(muted?0:.035,sound.context.currentTime,.020);
  },[muted]);
  useEffect(()=>()=>{if(audio.current){void audio.current.context.close();audio.current=null;}},[]);

  function reset(day:number,index:number) {
    const {hour,minute}=schoolBellSchedule[index];
    setClock({day,seconds:hour*3600+minute*60-5,rings:0,event:null});
    setRing(false);setRunning(false);
  }

  const time=displayTime(clock.seconds);
  const seconds=String(clock.seconds%60).padStart(2,'0');
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive 3D school bell">
        <Canvas dpr={[1,1.5]} camera={{position:[2.8,3.6,6.8],fov:43}} fallback={<p>The clock controls and readings are available without WebGL.</p>}>
          <Scene time={time} ring={ring} selected={selected} select={setSelected}/>
          <OrbitControls target={[0,.50,0]} minDistance={4} maxDistance={13} enablePan={false} maxPolarAngle={Math.PI/2.06}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="School bell readings">
        <div><span>{days[clock.day]}</span><strong>{time}:{seconds}</strong></div>
        <div><span>Piezo state</span><strong>{ring?'Ringing':'Quiet'}</strong></div>
        <div><span>Chimes this trial</span><strong>{clock.rings}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Run the school timetable</h3>
      <p>Start five seconds before a scheduled bell, then run the clock or step forward. Compare Monday and Saturday at the same time.</p>
      <label htmlFor="school-bell-slot">Scheduled event</label>
      <select id="school-bell-slot" value={slot} onChange={event=>{
        const index=Number(event.target.value);setSlot(index);reset(clock.day,index);
      }}>{schoolBellSchedule.map(({hour,minute,name},index)=><option key={name} value={index}>{displayTime(hour*3600+minute*60)} · {name}</option>)}</select>
      <div className="gp-steps">
        <button type="button" onClick={()=>reset(0,slot)}>Set Monday</button>
        <button type="button" onClick={()=>reset(5,slot)}>Set Saturday</button>
      </div>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>{enableAudio();setRunning(value=>!value);}}>
          {running?'Pause clock':'Play clock (5×)'}
        </button>
        <button type="button" onClick={()=>{enableAudio();setClock(value=>advance(value,60));}}>Advance one minute</button>
        <button type="button" onClick={()=>setMuted(value=>!value)}>{muted?'Unmute':'Mute'}</button>
      </div>
      <p className="gp-demo-description" role="status">{clock.event?`Last scheduled bell: ${clock.event}.`:clock.day>=5?'Weekend mode. The schedule is inactive.':'School-day schedule active. Advance the clock to the selected event.'}</p>
      <h4>Inspect the clock circuit</h4>
      <ol className="gp-demo-labels">{detail.map(([name],index)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{detail[selected][1]}</p>
    </div>
  </div>;
}
