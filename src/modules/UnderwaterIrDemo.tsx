import { useEffect,useRef,useState } from 'react';
import { Canvas,useFrame } from '@react-three/fiber';
import { Line,OrbitControls } from '@react-three/drei';
import type { Mesh } from 'three';
import { opticalBits,type OpticalMessage } from '../data/underwater-ir';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Outcome='idle'|'sending'|'accepted'|'rejected'|'no signal';
const names={ping:'PING',ready:'READY'};
const parts=[
  ['Transmitter Uno','D9 drives the MOSFET. It sends a long start pulse, then short and long pulses for the data and its complement.'],
  ['IR emitter','The MOSFET switches the emitter on and off. The purple beam in the demo makes otherwise invisible light visible.'],
  ['Clear water channel','The two dry optical heads face each other through short, parallel transparent walls. Put a card at a dry wall to interrupt the path.'],
  ['Optical receiver','The receiver reports whether it sees the beam. Changing the aim or blocking the path can cause the signal to disappear.'],
  ['Receiver Uno','D2 reads the pulse widths. The receiver accepts only a complete known message followed by its bitwise complement.'],
] as const;
const positions:Point[]=[[-2.48,.48,.60],[-1.22,.70,.10],[0,1.39,-.01],[1.18,.71,.12],[2.43,.51,.64]];

function WaterLink({water,blocked,aligned,lit,result,selected,select}:{
  water:boolean;blocked:boolean;aligned:boolean;lit:boolean;result:Outcome;selected:number;select:(i:number)=>void;
}){
  const photon=useRef<Mesh>(null);
  const reached=blocked?-1.01:aligned?1.09:1.39;
  useFrame(({clock})=>{
    if(photon.current)photon.current.position.x=-1.10+((clock.elapsedTime*3.7)%1)*(reached+1.10);
  });
  return <>
    <color attach="background" args={['#233d51']}/>
    <hemisphereLight args={['#deefff','#6d6756',2.35]}/>
    <directionalLight position={[-4,7,5]} intensity={2.65}/>
    <Box at={[0,-.14,0]} size={[6.40,.26,4.18]} color="#536976"/>
    <Box at={[0,.039,0]} size={[2.52,.078,2.11]} color="#354f5d"/>
    <Box at={[0,.093,0]} size={[2.30,.04,1.88]} color={selected===2?'#d5ad66':'#687d85'}/>
    <group onClick={()=>select(2)}>
      {[[-.92,.647,0],[.92,.647,0],[0,.647,-.75],[0,.647,.75]].map((p,i)=><mesh key={i} position={p as Point} renderOrder={3}>
        <boxGeometry args={i<2?[.045,1.06,1.54]:[1.84,1.06,.045]}/>
        <meshStandardMaterial color={selected===2?'#e6c581':'#b7e2eb'} transparent opacity={.24} depthWrite={false} roughness={.16} metalness={.12}/>
      </mesh>)}
      {[-.92,.92].flatMap(x=>[-.75,.75].map(z=><Box key={x+':'+z} at={[x,.647,z]} size={[.035,1.06,.035]} color="#aac3cc" metal={.28}/>))}
      {[-.75,.75].map(z=><Box key={z} at={[0,1.18,z]} size={[1.86,.025,.034]} color="#b2cbd2" metal={.29}/>)}
      {[-.92,.92].map(x=><Box key={x} at={[x,1.18,0]} size={[.034,.025,1.53]} color="#b2cbd2" metal={.29}/>)}
      {water&&<>
        <mesh position={[0,.473,0]} renderOrder={2}>
          <boxGeometry args={[1.793,.714,1.451]}/>
          <meshStandardMaterial color="#3b95b6" transparent opacity={.43} depthWrite={false} roughness={.2}/>
        </mesh>
        {[.23,.46,.69].map(z=><Line key={z} points={[[-.80,.831,z],[.81,.831,z]]} color="#81c9dc" lineWidth={1.1} transparent opacity={.46}/>)}
      </>}
    </group>
    {[-1,1].map(side=><group key={side} position={[side*1.16,.11,0]} onClick={()=>select(side<0?1:3)}>
      <Box at={[0,.019,0]} size={[.30,.07,.36]} color="#7c7880"/>
      <Box at={[0,.238,0]} size={[.094,.41,.103]} color="#7f8e98" metal={.54}/>
      <group position={[0,.463,side>0&&!aligned?.39:0]}>
        <Box at={[0,0,0]} size={[.281,.16,.196]} color={selected===(side<0?1:3)?'#deb775':'#293841'}/>
        <mesh rotation={[0,0,Math.PI/2]} position={[-side*.14,0,0]}>
          <cylinderGeometry args={[.047,.047,.032,24]}/>
          <meshStandardMaterial color="#8c71a0" emissive="#aa69ee" emissiveIntensity={lit&&(side<0||(!blocked&&aligned))?2.4:0}/>
        </mesh>
      </group>
    </group>)}
    {[[-2.19,0],[2.19,4]].map(([x,i])=><group key={x} position={[x,.09,.17]} onClick={()=>select(i)}>
      <Box at={[0,-.05,0]} size={[1.17,.09,1.44]} color={selected===i?'#e1b878':'#374752'}/>
      <group position={[0,.03,-.15]} scale={1.39}><Uno at={[0,0,0]}/></group>
      <Box at={[.15,.083,.42]} size={[.66,.085,.33]} color="#bfc9cb"/>
      {i===0?<>{[-.04,.27].map(lx=><group key={lx} position={[lx,.155,.42]}>
        <Box at={[0,0,0]} size={[.128,.058,.129]} color="#26323a"/>
        <mesh position={[0,.04,0]}><cylinderGeometry args={[.038,.038,.036,18]}/><meshStandardMaterial color="#a2b6c0"/></mesh>
      </group>)}
        <Box at={[.40,.124,-.18]} size={[.199,.049,.267]} color="#315e70"/>
        <Box at={[.40,.161,-.18]} size={[.087,.025,.097]} color="#21292b"/>
        <Line points={[[.40,.16,-.12],[.31,.205,.11],[.02,.149,.34]]} color="#c75f50" lineWidth={2}/>
      </>: [false,true].map((bad,index)=><mesh key={index} position={[-.04+.31*index,.159,.42]}>
        <sphereGeometry args={[.048,18,14]}/>
        <meshStandardMaterial color={bad?'#863939':'#396e55'} emissive={bad?'#ec362e':'#36df7b'}
          emissiveIntensity={(bad?result==='rejected':result==='accepted')?1.4:0}/>
      </mesh>)}
    </group>)}
    {[-1,1].map(side=><WorldLabel key={side} position={[side*2.20,.17,.98]} className="gp-optical-station">
      <span>{side<0?'TX · SENDER':'RX · RECEIVER'}</span>
    </WorldLabel>)}
    {[-1,1].map(s=><Line key={s} points={[[s*1.27,.53,.03],[s*1.44,.15,.18],[s*1.87,.18,.34]]} color={s<0?'#d37f60':'#6dc1cb'} lineWidth={3}/>)}
    {blocked&&<Box at={[-1.002,.697,.01]} size={[.048,.70,.60]} color="#b68c6d"/>}
    {lit&&<>
      <Line points={[[-1.113,.573,0],[reached,.573,0]]} color="#c184f7" lineWidth={3.6}/>
      <mesh ref={photon} position={[-1.1,.573,0]}><sphereGeometry args={[.048,17,13]}/><meshBasicMaterial color="#f1c9ff"/></mesh>
    </>}
    {positions.map((at,i)=><WorldLabel className="gp-marker-anchor" key={i} position={i===3&&!aligned?[at[0],at[1],at[2]+.39]:at}>
      <button className="gp-marker" type="button" aria-label={parts[i][0]} aria-pressed={i===selected} onClick={()=>select(i)}>
        {i+1}{i===selected&&<span className="gp-demo-marker-name">{parts[i][0]}</span>}
      </button>
    </WorldLabel>)}
  </>;
}
type Frame={message:OpticalMessage;index:number;lit:boolean;seen:string[];outcome:Outcome};
const initial:Frame={message:'ping',index:-1,lit:false,seen:[],outcome:'idle'};
const bitWidth=(bit:number)=>bit===1?48:20;
const slowMotion=3;

export default function UnderwaterIrDemo(){
  const [water,setWater]=useState(true);
  const [blocked,setBlocked]=useState(false);
  const [aligned,setAligned]=useState(true);
  const [frame,setFrame]=useState(initial);
  const [selected,select]=useState(2);
  const seenPulse=useRef(true);
  const pathClear=!blocked&&aligned;
  const path=useRef(pathClear);
  useEffect(()=>{
    path.current=pathClear;
    if(!pathClear)seenPulse.current=false;
  },[pathClear]);
  const bits=opticalBits(frame.message);
  useEffect(()=>{
    if(frame.outcome!=='sending')return;
    const duration=frame.lit?(frame.index<0?120:bitWidth(opticalBits(frame.message)[frame.index])):28;
    const timer=window.setTimeout(()=>{
      if(frame.lit){
        const seen=[...frame.seen,seenPulse.current?(frame.index<0?'start':String(opticalBits(frame.message)[frame.index])):'×'];
        setFrame({...frame,lit:false,seen});
      }else if(frame.index===15){
        const acquired=frame.seen[0]==='start';
        const okay=acquired&&frame.seen.slice(1).join('')===opticalBits(frame.message).join('');
        setFrame({...frame,outcome:okay?'accepted':acquired?'rejected':'no signal'});
      }else{
        seenPulse.current=path.current;
        setFrame({...frame,index:frame.index+1,lit:true});
      }
    },duration*slowMotion);
    return ()=>window.clearTimeout(timer);
  },[frame]);
  function send(message:OpticalMessage){
    seenPulse.current=pathClear;
    setFrame({message,index:-1,lit:true,seen:[],outcome:'sending'});
  }
  const text=frame.outcome==='accepted'?'Valid frame · '+names[frame.message]
    :frame.outcome==='rejected'?'Frame rejected · Pulse missing after start'
    :frame.outcome==='no signal'?'No frame decoded · Start pulse missing'
    :frame.outcome==='sending'?'Sending '+names[frame.message]:'Ready to send a frame';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D underwater infrared channel">
        <Canvas camera={{position:[2.7,4.4,6.6],fov:43}} dpr={[1,1.6]} fallback={<p>Use the pulse rows to compare transmitted and received bits.</p>}>
          <WaterLink {...{water,blocked,aligned,selected,select}} lit={frame.lit} result={frame.outcome}/>
          <OrbitControls target={[0,.43,.07]} minDistance={3.5} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Optical link readings">
        <div><span>Medium</span><strong>{water?'Clear water':'Air'}</strong></div>
        <div><span>Path</span><strong>{blocked?'Blocked':aligned?'Aligned':'Misaligned'}</strong></div>
        <div><span>Decoded</span><strong>{frame.outcome==='accepted'?names[frame.message]:'—'}</strong></div>
      </div>
      <div className="gp-optical-trace" aria-label="Pulse comparison">
        <div><strong>Sent</strong><output>{frame.outcome==='idle'?'—':bits.map((bit,i)=><span key={i} data-active={frame.outcome==='sending'&&frame.index===i}>{bit}</span>)}</output></div>
        <div><strong>Received</strong><output>{frame.seen.length<=1?'—':frame.seen.slice(1).map((bit,i)=><span key={i} data-missing={bit==='×'}>{bit}</span>)}</output></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Send and interrupt a message</h3>
      <p>The animation slows each pulse down so you can follow it. Frame timing and acceptance are simulated. A short pulse sends 0 and a long pulse sends 1. The final eight bits are the inverse of the first eight.</p>
      <div className="gp-steps" role="group" aria-label="Optical path controls">
        <button type="button" aria-pressed={water} onClick={()=>setWater(!water)}>Fill with water</button>
        <button type="button" aria-pressed={blocked} onClick={()=>setBlocked(!blocked)}>Block beam</button>
        <button type="button" aria-pressed={!aligned} onClick={()=>setAligned(!aligned)}>Misalign receiver</button>
      </div>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={frame.outcome==='sending'} onClick={()=>send('ping')}>Send PING</button>
        <button type="button" className="gp-button gp-secondary" disabled={frame.outcome==='sending'} onClick={()=>send('ready')}>Send READY</button>
      </div>
      <p role="status" className="gp-demo-description">{text}</p>
      <ol className="gp-demo-labels">{parts.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={i===selected} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{parts[selected][1]}</p>
    </div>
  </div>;
}
