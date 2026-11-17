import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { CatmullRomCurve3, Vector3, type Mesh } from 'three';
import { pianoKeys } from '../data/electronic-piano';
import { WorldLabel } from './LabWorkbench';

type Point = [number,number,number];
const keyColors=['#ae554a','#c47f4f','#b59c53','#6b9869','#559795','#5b80aa','#766da6','#a66f8d'];
const keyX=(index:number)=>(index-3.5)*.56;
const melody=[0,2,4,7,4,2,0];
const inspection=[
  {name:'Key switches',position:[-1.98,.29,.31],tag:[-2.51,.61,.44],description:'Press a key to connect its input to ground. The Uno sees LOW and looks up the pitch for that pin.'},
  {name:'Arduino Uno',position:[-.92,.25,-1.02],tag:[-1.48,.84,-1.19],description:'The internal pull-ups hold the idle inputs HIGH. The Uno reads D2 through D9, then sends one note to D10.'},
  {name:'220 Ω resistor',position:[1.04,.20,-.74],tag:[.81,.65,-1.13],description:'The series resistor limits current while the piezo charges and discharges on the edges of the square wave.'},
  {name:'Passive piezo',position:[1.93,.35,-.91],tag:[2.21,.88,-1.06],description:'The piezo bends as the voltage changes. A faster square wave moves it more times per second and raises the pitch.'},
] satisfies {name:string;position:Point;tag:Point;description:string}[];

function Block({at,size,color,metal=0}: {at:Point;size:Point;color:string;metal?:number}) {
  return <RoundedBox position={at} args={size} radius={.023} smoothness={2}>
    <meshStandardMaterial color={color} metalness={metal} roughness={.6}/>
  </RoundedBox>;
}

function Wire({points,color}: {points:Point[];color:string}) {
  const curve=useMemo(()=>new CatmullRomCurve3(points.map(point=>new Vector3(...point))),[points]);
  return <mesh><tubeGeometry args={[curve,24,.022,7,false]}/><meshStandardMaterial color={color} roughness={.55}/></mesh>;
}

function Sounder({playing,selected}: {playing:boolean;selected:boolean}) {
  const membrane=useRef<Mesh>(null);
  useFrame(({clock})=>{
    if(membrane.current) membrane.current.position.y=.393+(playing?Math.sin(clock.elapsedTime*34)*.018:0);
  });
  return <group position={[1.93,0,-.91]}>
    <mesh position={[0,.235,0]}><cylinderGeometry args={[.29,.29,.25,40]}/><meshStandardMaterial color={selected?'#866a41':'#252b33'} roughness={.65}/></mesh>
    <mesh position={[0,.374,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.136,.259,42]}/><meshStandardMaterial color="#171c21"/></mesh>
    <mesh ref={membrane} position={[0,.393,0]}><cylinderGeometry args={[.133,.133,.018,36]}/>
      <meshStandardMaterial color={playing?'#e8b870':'#b99b65'} metalness={.65} roughness={.36}/></mesh>
  </group>;
}

function PianoScene({active,selected,select,play}: {active:number|null;selected:number;select:(index:number)=>void;play:(index:number)=>void}) {
  return <>
    <color attach="background" args={['#293c4d']}/>
    <ambientLight intensity={1.45}/>
    <directionalLight position={[4,7,3]} intensity={2.7}/>
    <directionalLight position={[-4,3,-3]} color="#aec4ea" intensity={1.3}/>
    <Block at={[0,-.113,0]} size={[5.72,.19,3.52]} color="#8f674b"/>
    <Block at={[0,0,0]} size={[5.59,.08,3.39]} color="#42666c"/>
    <Block at={[0,.111,.48]} size={[4.78,.18,1.40]} color="#e0e1da"/>
    <Block at={[0,.210,.47]} size={[4.64,.028,.095]} color="#a8aaa5"/>
    {Array.from({length:34},(_,index)=><group key={index} position={[-2.18+index*.132,0,0]}>
      {[.075,.195,.337,.594,.716,.835,.951].map(z=><mesh key={z} position={[0,.204,z]}>
        <boxGeometry args={[.033,.013,.037]}/><meshStandardMaterial color="#7b8281"/>
      </mesh>)}
    </group>)}
    <Line points={[[-2.25,.213,1.04],[2.25,.213,1.04]]} color="#648bb2" lineWidth={1.7}/>
    <Block at={[-.91,.134,-.995]} size={[1.59,.10,1.03]} color={selected===1?'#a07c4c':'#188398'}/>
    <Block at={[-1.62,.228,-1.05]} size={[.24,.16,.36]} color="#b2c0c5" metal={.68}/>
    <Block at={[-1.60,.231,-.71]} size={[.23,.13,.17]} color="#3a404b"/>
    <Block at={[-.98,.217,-1.12]} size={[.42,.057,.22]} color="#2c323e"/>
    <Block at={[-.66,.213,-.87]} size={[.17,.049,.115]} color="#748187" metal={.48}/>
    {[-1.39,-.61].map(z=><Block key={z} at={[-.70,.216,z]} size={[.95,.074,.09]} color="#272d37"/>)}
    {Array.from({length:8},(_,i)=><mesh key={i} position={[-1.09+i*.11,.261,-.61]}>
      <boxGeometry args={[.039,.013,.039]}/><meshStandardMaterial color="#939398" metalness={.53}/>
    </mesh>)}
    {pianoKeys.map((key,index)=>{
      const x=keyX(index);
      const down=active===index;
      const color=keyColors[index];
      return <group key={key.note}>
        <Wire points={[[-1.09+index*.11,.26,-.61],[-1.02+index*.24,.52+index*.024,-.36],[x,.33,-.115],[x,.215,.145]]} color={down?'#ffc868':color}/>
        <Wire points={[[x,.226,.72],[x+.045,.28,.84],[x+.068,.217,.966]]} color="#384750"/>
        <group position={[x,0,.46]} onClick={event=>{event.stopPropagation();play(index);}}>
          {[-.11,.11].flatMap(leg=>[-.22,.22].map(z=><Block key={`${leg}:${z}`} at={[leg,.211,z]} size={[.045,.019,.114]} color="#a6abad" metal={.7}/>))}
          <Block at={[0,.253,0]} size={[.36,.10,.34]} color={selected===0?'#3c4349':'#252a30'}/>
          <Block at={[0,.309,0]} size={[.30,.043,.28]} color="#a3a7a7" metal={.58}/>
          <mesh position={[0,down ? .331 : .373,0]}>
            <cylinderGeometry args={[.116,.126,.13,24]}/>
            <meshStandardMaterial color={down?'#ffc965':color} roughness={.43} emissive="#ec981e" emissiveIntensity={down ? .36 : 0}/>
          </mesh>
        </group>
        <WorldLabel position={[x,.27,.85]} className="gp-marker-anchor">
          <button type="button" className="gp-piano-marker" aria-label={`Play ${key.note} on the 3D keypad`} aria-pressed={down}
            onClick={()=>play(index)}>{key.note}</button>
        </WorldLabel>
      </group>;
    })}
    <Wire points={[[-1.03,.237,-1.39],[-1.88,.34,-1.51],[-2.59,.18,-.67],[-2.56,.14,.63],[-2.23,.218,.968]]} color="#29333a"/>
    <Wire points={[[.08,.25,-1.37],[.44,.31,-1.19],[.60,.28,-.84],[.82,.199,-.74]]} color={active===null?'#b15140':'#ff965a'}/>
    <Wire points={[[1.26,.20,-.74],[1.48,.26,-.74],[1.76,.20,-.76]]} color={active===null?'#b15140':'#ff965a'}/>
    <Wire points={[[1.93,.21,-1.14],[1.56,.25,-1.42],[.24,.24,-1.46],[-.21,.24,-1.39]]} color="#424850"/>
    <mesh position={[1.04,.20,-.74]} rotation={[0,0,Math.PI/2]}>
      <cylinderGeometry args={[.054,.054,.27,20]}/><meshStandardMaterial color={selected===2?'#f2ce77':'#c6a57b'}/>
    </mesh>
    {[-.094,-.049,.002,.077].map((offset,i)=><mesh key={offset} position={[1.04+offset,.20,-.74]} rotation={[0,0,Math.PI/2]}>
      <cylinderGeometry args={[.056,.056,.026,20]}/><meshStandardMaterial color={['#a53232','#a53232','#704832','#c4ab53'][i]}/>
    </mesh>)}
    <Sounder playing={active!==null} selected={selected===3}/>
    {inspection.map(({name,position,tag},index)=><group key={name}>
      <Line points={[position,tag]} color={selected===index?'#ffda8a':'#c6d2dd'} lineWidth={1.35}/>
      <WorldLabel position={tag} className="gp-marker-anchor">
        <button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button>
      </WorldLabel>
    </group>)}
    <ContactShadows position={[0,.019,0]} scale={7} opacity={.39} blur={2.2} far={3}/>
  </>;
}

function Waveform({frequency}: {frequency:number|null}) {
  const plot=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const context=plot.current?.getContext('2d');
    if(!context) return;
    const {width,height}=context.canvas;
    const duration=.012;
    const baseline=height-24;
    const peak=18;
    context.fillStyle='#172c3a';context.fillRect(0,0,width,height);
    context.font='14px system-ui';context.fillStyle='#b4c8d0';
    context.fillText('5 V',5,peak+5);context.fillText('0 V',5,baseline+4);
    context.fillText('12 ms',width-50,height-6);
    context.strokeStyle='#466071';
    for(const y of [peak,baseline]){
      context.beginPath();context.moveTo(37,y);context.lineTo(width-9,y);context.stroke();
    }
    context.beginPath();context.strokeStyle='#73e4d4';context.lineWidth=2;
    const left=37, right=width-9;
    context.moveTo(left,frequency?peak:baseline);
    if(frequency){
      const halfPeriod=1/(2*frequency);
      let high=true;
      for(let time=halfPeriod;time<duration;time+=halfPeriod){
        const x=left+(right-left)*time/duration;
        context.lineTo(x,high?peak:baseline);high=!high;
        context.lineTo(x,high?peak:baseline);
      }
      context.lineTo(right,high?peak:baseline);
    }else context.lineTo(right,baseline);
    context.stroke();
  },[frequency]);
  return <canvas ref={plot} className="gp-piano-wave" width={640} height={105} role="img"
    aria-label={frequency?`D10 square wave at ${frequency} hertz over 12 milliseconds`:'D10 output at zero volts'}/>;
}

type Audio = { context:AudioContext; oscillator:OscillatorNode; gain:GainNode };

export default function ElectronicPianoDemo() {
  const [held,setHeld]=useState<number[]>([]);
  const [tap,setTap]=useState<number|null>(null);
  const [melodyStep,setMelodyStep]=useState<number|null>(null);
  const [selected,setSelected]=useState(0);
  const [muted,setMuted]=useState(false);
  const [audioUnavailable,setAudioUnavailable]=useState(false);
  const audio=useRef<Audio|null>(null);
  const release=useRef<ReturnType<typeof setTimeout>|null>(null);
  const automatic=melodyStep!==null&&melodyStep%2===0 ? melody[melodyStep/2] : null;
  const playing=[...held,...(tap===null?[]:[tap]),...(automatic===null?[]:[automatic])];
  const active=playing.length ? Math.min(...playing) : null;
  const note=active===null ? null : pianoKeys[active];

  function unlockSound() {
    if(!window.AudioContext){setAudioUnavailable(true);return;}
    if(!audio.current){
      const context=new AudioContext();
      const gain=context.createGain();
      const oscillator=context.createOscillator();
      gain.gain.value=0;
      oscillator.type='square';
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      audio.current={context,oscillator,gain};
    }
    void audio.current.context.resume().catch(()=>setAudioUnavailable(true));
  }

  function play(index:number) {
    unlockSound();
    setMelodyStep(null);
    setTap(index);
    if(release.current!==null) clearTimeout(release.current);
    release.current=setTimeout(()=>setTap(null),550);
  }

  useEffect(()=>{
    const sound=audio.current;
    if(!sound) return;
    const {context,oscillator,gain}=sound;
    if(note) oscillator.frequency.setValueAtTime(note.pitch,context.currentTime);
    gain.gain.setTargetAtTime(note && !muted ? .028 : 0,context.currentTime,.012);
  },[note,muted]);

  useEffect(()=>{
    if(melodyStep===null) return;
    const timer=window.setTimeout(
      ()=>setMelodyStep(melodyStep+1<melody.length*2?melodyStep+1:null),
      melodyStep%2===0?370:85,
    );
    return ()=>window.clearTimeout(timer);
  },[melodyStep]);

  useEffect(()=>{
    const keyboardIndex=(event:KeyboardEvent)=>pianoKeys.findIndex(key=>key.shortcut===event.key.toUpperCase());
    const press=(event:KeyboardEvent)=>{
      if(event.repeat||event.altKey||event.metaKey||event.ctrlKey||event.shiftKey||event.defaultPrevented) return;
      if(event.target instanceof HTMLElement&&(event.target.matches('input, textarea, select')||event.target.isContentEditable)) return;
      const index=keyboardIndex(event);
      if(index<0) return;
      event.preventDefault();
      unlockSound();
      setMelodyStep(null);
      setTap(null);
      setHeld(previous=>previous.includes(index)?previous:[...previous,index]);
    };
    const lift=(event:KeyboardEvent)=>{
      const index=keyboardIndex(event);
      if(index>=0) setHeld(previous=>previous.filter(key=>key!==index));
    };
    const clear=()=>{setHeld([]);setTap(null);setMelodyStep(null);};
    window.addEventListener('keydown',press);
    window.addEventListener('keyup',lift);
    window.addEventListener('blur',clear);
    return ()=>{
      window.removeEventListener('keydown',press);
      window.removeEventListener('keyup',lift);
      window.removeEventListener('blur',clear);
      if(release.current!==null) clearTimeout(release.current);
      if(audio.current){void audio.current.context.close();audio.current=null;}
    };
  },[]);

  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive 3D electronic piano">
        <Canvas dpr={[1,1.5]} camera={{position:[1.3,4.4,6.5],fov:40}} fallback={<p>Use the note buttons and waveform to play without WebGL.</p>}>
          <PianoScene active={active} selected={selected} select={setSelected} play={play}/>
          <OrbitControls target={[0,.16,0]} minDistance={4} maxDistance={11} enablePan={false} maxPolarAngle={Math.PI/2.09}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Piano signal readings">
        <div><span>Key input</span><strong>{note?`D${note.pin} LOW`:'All HIGH'}</strong></div>
        <div><span>Note</span><strong>{note?.note??'Released'}</strong></div>
        <div><span>Piezo output</span><strong>{note?`${note.pitch} Hz`:'Silent'}</strong></div>
      </div>
      <Waveform frequency={note?.pitch??null}/>
    </div>
    <div className="gp-guide">
      <h3>Play the circuit</h3>
      <p>Tap a note or hold A, S, D, F, G, H, J or K. Try holding two keyboard keys to hear the lower note take priority.</p>
      <div className="gp-piano-pad" aria-label="Playable notes">
        {pianoKeys.map(({note,shortcut,pin},index)=><button type="button" key={note} aria-label={`Play ${note}`} aria-pressed={active===index}
          onClick={()=>play(index)}><strong>{note}</strong><span>{shortcut} · D{pin}</span></button>)}
      </div>
      <div className="gp-steps">
        <button className="gp-button" type="button" onClick={()=>{
          unlockSound();setHeld([]);setTap(null);
          setMelodyStep(melodyStep===null?0:null);
        }}>{melodyStep===null?'Play example melody':'Stop melody'}</button>
        <button type="button" onClick={()=>{unlockSound();setMuted(value=>!value);}}>{muted?'Unmute':'Mute'}</button>
      </div>
      {audioUnavailable&&<p role="status">Audio is unavailable. The note and waveform still respond.</p>}
      <h4>Inspect the signal path</h4>
      <ol className="gp-demo-labels">{inspection.map(({name},index)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{inspection[selected].description}</p>
    </div>
  </div>;
}
