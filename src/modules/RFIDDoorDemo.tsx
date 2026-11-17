import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { latchMs } from '../data/rfid-door';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Tag='A'|'B';
type Bench={ present:Tag|null; enrolled:Tag|null; enrolling:boolean; released:boolean; rejected:boolean; events:string[] };
type Action='arm'|'remove'|'relock'|Tag;
const initial:Bench={present:null,enrolled:null,enrolling:false,released:false,rejected:false,events:[]};
const trial:{action:Action; delay:number}[]=[
  {action:'arm',delay:500},{action:'A',delay:550},{action:'remove',delay:1000},
  {action:'B',delay:500},{action:'remove',delay:1050},{action:'A',delay:500},
];

function operate(bench:Bench, action:Action):Bench {
  const report=(changes:Partial<Bench>,message:string)=>({...bench,...changes,events:[message,...bench.events].slice(0,4)});
  if(action==='arm'){
    return !bench.released&&!bench.present ? report({enrolling:true,rejected:false},'Enrollment armed') : bench;
  }
  if(action==='remove') return {...bench,present:null};
  if(action==='relock') return bench.released ? report({released:false},'Relocked after three seconds') : bench;
  if(bench.present) return bench;
  if(bench.released) return {...bench,present:action};
  if(bench.enrolling) return report({present:action,enrolled:action,enrolling:false,rejected:false},`Tag ${action} enrolled`);
  if(action===bench.enrolled) return report({present:action,released:true,rejected:false},`Tag ${action} accepted · latch released`);
  return report({present:action,rejected:true},`Tag ${action} rejected · latch stayed locked`);
}

function Panel({at,size,color,metal=0,radius=.019}: {at:Point;size:Point;color:string;metal?:number;radius?:number}) {
  return <RoundedBox position={at} args={size} radius={radius} smoothness={2}>
    <meshStandardMaterial color={color} metalness={metal} roughness={.59}/>
  </RoundedBox>;
}

export function PN532Shield({selected=false}: {selected?:boolean}) {
  return <>
    <Panel at={[0,.025,0]} size={[2.08,.052,.94]} color={selected?'#356895':'#17478f'}/>
    {[-.83,.86].flatMap(x=>[-.355,.355].map(z=><mesh key={`${x}:${z}`} position={[x,.055,z]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[.032,.053,18]}/><meshStandardMaterial color="#b99962" metalness={.71}/>
    </mesh>))}
    {Array.from({length:4},(_,i)=>{
      const gap=i*.035;
      return <Line key={i} points={[[.10+gap,.055,-.34+gap],[.92-gap,.055,-.34+gap],[.92-gap,.055,.34-gap],[.10+gap,.055,.34-gap],[.10+gap,.055,-.34+gap]]}
        color={selected?'#81c6d2':'#5e8fb7'} lineWidth={1.0}/>;
    })}
    <Panel at={[-.35,.076,.06]} size={[.22,.038,.22]} color="#2a303a"/>
    {Array.from({length:8},(_,i)=><Panel key={i} at={[-.54+i*.066,.067,-.19]} size={[.036,.019,.049]} color={i%2?'#c1b7a2':'#242a35'}/>)}
    {[-.405,.405].map(z=><group key={z}>
      <Panel at={[-.48,.082,z]} size={[.96,.079,.059]} color="#2d343e"/>
      {Array.from({length:11},(_,i)=><mesh key={i} position={[-.89+i*.078,.126,z]}>
        <boxGeometry args={[.031,.025,.030]}/><meshStandardMaterial color="#adafaf" metalness={.74}/>
      </mesh>)}
    </group>)}
  </>;
}

export function TagCard({tag='A'}:{tag?:Tag}) {
  return <Panel at={[0,0,0]} size={[.76,.032,.48]} color={tag==='A'?'#e7d9ab':'#d6e2e6'} radius={.033}/>;
}

const detail=[
  ['PN532 reader','Its antenna reads one classroom tag. The shield sends the identifier over I²C and uses D2 for its IRQ signal.'],
  ['Classroom tag','The Uno compares the identifier with the one enrolled for this session. Enrollment teaches the Uno which tag to accept.'],
  ['Servo latch','The servo turns the cam away from the strike during the three-second release window. It returns to the strike after the timer expires.'],
  ['Status LEDs','D6 lights red for a rejected scan. D7 lights green during the release window. Each LED has its own current-limiting resistor.'],
] as const;

function DoorBench({bench,selected,select}:{bench:Bench;selected:number;select:(index:number)=>void}) {
  const servoArm=useRef<Group>(null);
  const cardA=useRef<Group>(null);
  const cardB=useRef<Group>(null);
  useFrame((_,delta)=>{
    if(servoArm.current) servoArm.current.rotation.z=MathUtils.damp(servoArm.current.rotation.z,bench.released?-1.23:0,9,delta);
    ([['A',cardA],['B',cardB]] as const).forEach(([tag,card],i)=>{
      const object=card.current;
      if(!object) return;
      const active=bench.present===tag;
      object.position.x=MathUtils.damp(object.position.x,active?-1.23:-2.18+i*.93,10,delta);
      object.position.y=MathUtils.damp(object.position.y,active ? .64 : .133,10,delta);
      object.position.z=MathUtils.damp(object.position.z,active ? -.12 : 1.31,10,delta);
    });
  });
  return <>
    <color attach="background" args={['#23384a']}/>
    <ambientLight intensity={1.30}/><directionalLight position={[3,7,4]} intensity={2.65}/>
    <directionalLight position={[-5,4,-3]} color="#b8cde9" intensity={1.3}/>
    <Panel at={[0,-.125,0]} size={[6.27,.22,3.52]} color="#8c674f"/>
    <Panel at={[0,.012,0]} size={[6.14,.063,3.37]} color="#637c76"/>
    <Panel at={[1.32,.101,-.57]} size={[2.70,.13,.67]} color="#9a775d"/>
    <Panel at={[1.04,1.86,-.55]} size={[2.12,.16,.23]} color="#a58262"/>
    {[.04,2.04].map(x=><Panel key={x} at={[x,.995,-.55]} size={[.17,1.81,.25]} color="#ac8869"/>)}
    <Panel at={[1.00,.995,-.55]} size={[1.72,1.69,.111]} color="#b29474"/>
    <Panel at={[1.00,.696,-.475]} size={[1.48,.72,.035]} color="#9c7c60"/>
    <Panel at={[1.00,1.35,-.475]} size={[1.48,.43,.035]} color="#a58667"/>
    {[.42,1.53].map(x=><Panel key={x} at={[x,1.35,-.449]} size={[.054,.40,.014]} color="#8d775f"/>)}
    <Panel at={[.18,.76,-.456]} size={[.16,.26,.038]} color="#6d777d" metal={.45}/>
    <Panel at={[1.66,.93,-.410]} size={[.22,.055,.06]} color="#626c75" metal={.58}/>
    <Panel at={[1.81,.96,-.375]} size={[.23,.123,.064]} color="#959b9b" metal={.68}/>
    <Panel at={[2.17,.95,-.49]} size={[.35,.27,.16]} color="#8b9292" metal={.45}/>
    <Panel at={[2.32,.95,-.373]} size={[.395,.466,.21]} color={selected===2?'#a37d47':'#27526f'}/>
    <Panel at={[2.32,.958,-.25]} size={[.135,.12,.06]} color="#ddded1"/>
    <group ref={servoArm} position={[2.31,.96,-.20]}>
      <Panel at={[-.23,0,0]} size={[.58,.084,.081]} color={selected===2?'#e0bf7e':'#d8ddce'} metal={.32}/>
      <mesh position={[0,0,.049]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[.041,.041,.035,12]}/><meshStandardMaterial color="#a0a9ad" metalness={.62}/>
      </mesh>
    </group>
    <Panel at={[-1.87,.151,-.13]} size={[1.13,.092,1.01]} color="#20889c"/>
    <Panel at={[-2.42,.245,-.25]} size={[.243,.12,.24]} color="#aeb5b8" metal={.67}/>
    <Panel at={[-2.39,.241,.23]} size={[.21,.114,.173]} color="#252d35"/>
    <group position={[-1.65,.33,-.13]}><PN532Shield selected={selected===0}/></group>
    <group ref={cardA} position={[-2.18,.133,1.31]}><TagCard tag="A"/><WorldLabel position={[0,.10,.16]} className="gp-marker-anchor"><span className="gp-rocket-field-label">Tag A</span></WorldLabel></group>
    <group ref={cardB} position={[-1.25,.133,1.31]}><TagCard tag="B"/><WorldLabel position={[0,.10,.16]} className="gp-marker-anchor"><span className="gp-rocket-field-label">Tag B</span></WorldLabel></group>
    <Panel at={[.51,.141,1.04]} size={[1.23,.16,.61]} color="#e2dfd5"/>
    <Panel at={[.51,.232,1.02]} size={[1.16,.013,.068]} color="#a9aaa2"/>
    {[-1,1].map((side,i)=>{
      const on=i===0?bench.rejected&&!bench.released:bench.released;
      const color=i===0?'#ff493a':'#73e9a1';
      return <group key={side} position={[.50+side*.23,0,1.14]}>
        <mesh position={[0,.286,0]}><cylinderGeometry args={[.059,.066,.115,22]}/><meshStandardMaterial color={on?color:i===0?'#773d3c':'#397352'} emissive={color} emissiveIntensity={on?2.20:0}/></mesh>
        <mesh position={[0,.342,0]}><sphereGeometry args={[.059,16,9,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color={on?color:'#739187'} emissive={color} emissiveIntensity={on?2.4:0}/></mesh>
        <mesh position={[0,.244,-.209]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.026,.026,.20,15]}/><meshStandardMaterial color={selected===3?'#e2bc71':'#c4a686'}/></mesh>
      </group>;
    })}
    <Panel at={[2.32,.171,1.18]} size={[.69,.24,.49]} color="#343c45"/>
    <Line points={[[-1.33,.38,.25],[-1.13,.34,.61],[-.51,.25,.76],[.17,.25,.88]]} color="#a679b3" lineWidth={1.7}/>
    <Line points={[[-1.52,.38,.25],[-1.16,.42,.56],[-.42,.38,.65],[.64,.26,.88]]} color="#7dbfa0" lineWidth={1.7}/>
    <Line points={[[-.83,.33,-.34],[-.62,.17,-.91],[1.87,.17,-1.04],[2.28,.50,-.54],[2.30,.75,-.41]]} color="#ddbc6b" lineWidth={1.8}/>
    <Line points={[[2.25,.24,.92],[2.49,.23,.41],[2.50,.23,-.20],[2.39,.64,-.31]]} color="#cb6c5e" lineWidth={1.8}/>
    {([{at:[-1.02,.38,-.11],tag:[-1.98,.94,-.28]},
      {at:[bench.present==='A'? -1.25 : -2.18,.14,1.28],tag:[-2.52,.68,1.02]},
      {at:[2.27,.96,-.18],tag:[2.65,1.52,.15]},
      {at:[.51,.32,1.14],tag:[.47,.77,1.38]}] satisfies {at:Point;tag:Point}[]).map(({at,tag},index)=><group key={index}>
      <Line points={[at,tag]} color={selected===index?'#ffe094':'#bfd0d6'} lineWidth={1.4}/>
      <WorldLabel position={tag} className="gp-marker-anchor">
        <button type="button" className="gp-marker" aria-label={detail[index][0]} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button>
      </WorldLabel>
    </group>)}
    <ContactShadows position={[0,.035,0]} opacity={.40} blur={2.45} scale={8} far={4}/>
  </>;
}

export default function RFIDDoorDemo() {
  const [bench,setBench]=useState(initial);
  const [playing,setPlaying]=useState<number|null>(null);
  const [selected,setSelected]=useState(0);
  const dispatch=(action:Action)=>setBench(previous=>operate(previous,action));
  useEffect(()=>{
    if(!bench.released) return;
    const timer=window.setTimeout(()=>dispatch('relock'),latchMs);
    return ()=>window.clearTimeout(timer);
  },[bench.released]);
  useEffect(()=>{
    if(playing===null) return;
    const {action,delay}=trial[playing];
    const timer=window.setTimeout(()=>{
      dispatch(action);
      setPlaying(playing===trial.length-1?null:playing+1);
    },delay);
    return ()=>window.clearTimeout(timer);
  },[playing]);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive RFID door latch">
        <Canvas dpr={[1,1.5]} camera={{position:[3.4,4.0,7.7],fov:42}} fallback={<p>The enclosure controls and scan log are available without WebGL.</p>}>
          <DoorBench bench={bench} selected={selected} select={setSelected}/>
          <OrbitControls target={[0,.64,0]} minDistance={4} maxDistance={14} enablePan={false} maxPolarAngle={Math.PI/2.05}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="RFID latch readings">
        <div><span>Tag at reader</span><strong>{bench.present?`Tag ${bench.present}`:'None'}</strong></div>
        <div><span>Enrolled ID</span><strong>{bench.enrolled?`Tag ${bench.enrolled}`:'None'}</strong></div>
        <div><span>Servo latch</span><strong>{bench.released?'Released':'Locked'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Enroll and compare two tags</h3>
      <p>Arm enrollment with the reader clear. Present one tag, remove it, then compare a scan of each tag. Keep the accepted tag by the reader until the latch relocks.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={bench.released} onClick={()=>{
          if(playing!==null){setPlaying(null);return;}
          setBench(initial);setPlaying(0);
        }}>{playing===null?'Play example scans':'Stop example'}</button>
        <button type="button" onClick={()=>{setPlaying(null);setBench(initial);}}>Reset reader</button>
      </div>
      <div className="gp-steps">
        <button type="button" aria-pressed={bench.enrolling} disabled={playing!==null||!!bench.present||bench.released} onClick={()=>dispatch('arm')}>Arm enrollment</button>
        <button type="button" disabled={playing!==null||!!bench.present} onClick={()=>dispatch('A')}>Present tag A</button>
        <button type="button" disabled={playing!==null||!!bench.present} onClick={()=>dispatch('B')}>Present tag B</button>
        <button type="button" disabled={playing!==null||!bench.present} onClick={()=>dispatch('remove')}>Remove tag</button>
      </div>
      <p className="gp-demo-description" role="status">{bench.events[0]??'The latch is locked. No classroom tag is enrolled.'}</p>
      <ol className="gp-demo-labels" aria-label="Recent scan events">{bench.events.slice(1).map((event,i)=><li key={`${event}:${i}`}>{event}</li>)}</ol>
      <h4>Inspect the latch circuit</h4>
      <ol className="gp-demo-labels">{detail.map(([name],index)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{detail[selected][1]}</p>
    </div>
  </div>;
}
