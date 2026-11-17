import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import type { Group } from 'three';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { Uno } from './ClassroomStationsDemo';
import { BalanceImu } from './PickBalanceDemo';
import { Sonar } from './DetectionBenchDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Command='Neutral'|'Forward'|'Reverse'|'Left'|'Right'|'Raise'|'Lower'|'Close'|'Open';
type State={x:number;z:number;angle:number;lift:number;grip:number;held:boolean;block:Point;delivered:boolean};
const original:State={x:-2.15,z:.14,angle:0,lift:0,grip:0,held:false,block:[-1.15,.115,.14],delivered:false};
const bin:Point=[2.05,.115,.14];
const obstruction:Point=[.56,.28,.14];
const descriptions=[
  ['Front sonar','The sonar blocks forward motion when a target is too close or an echo is unavailable. Reverse stays available.'],
  ['Lift linkage','Pitch raises or lowers the foam block when the pad is in gripper mode.'],
  ['Gripper jaws','Roll closes or opens the jaws. Drive is disabled in gripper mode.'],
  ['Tilt pad','Enable must be released before switching between drive and gripper modes.'],
  ['Drop zone','Lower the carried block over the green station, then open the jaws.'],
] as const;
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
function tip(s:State):Point{return [s.x+.84*Math.cos(s.angle),.12+s.lift*.48,s.z-.84*Math.sin(s.angle)];}
function separation(a:Point,b:Point){return Math.hypot(a[0]-b[0],a[2]-b[2]);}
function clearance(s:State,obstacle:boolean){
  if(!obstacle)return 80;
  const dx=obstruction[0]-s.x,dz=obstruction[2]-s.z;
  const ahead=dx*Math.cos(s.angle)-dz*Math.sin(s.angle);
  const cross=dx*Math.sin(s.angle)+dz*Math.cos(s.angle);
  return ahead>.16&&Math.abs(cross)<.44?Math.max(0,Math.round((ahead-.44)*38)):80;
}
function advance(previous:State,command:Command,gripper:boolean,barrier:boolean,echo:boolean):State{
  if(command==='Neutral')return previous;
  const next={...previous};
  if(gripper){
    if(command==='Raise'||command==='Lower')next.lift=clamp(next.lift+(command==='Raise'?.075:-.075),0,1);
    if(command==='Close'||command==='Open')next.grip=clamp(next.grip+(command==='Close'?.115:-.115),0,1);
  }else if(command==='Left'||command==='Right'){
    next.angle+=command==='Left'?.081:-.081;
  }else if(command==='Reverse'||command==='Forward'&&echo&&clearance(previous,barrier)>=18){
    const speed=command==='Reverse'?-.049:.060;
    next.x=clamp(next.x+speed*Math.cos(next.angle),-2.24,2.36);
    next.z=clamp(next.z-speed*Math.sin(next.angle),-.83,.90);
  }
  const end=tip(next);
  if(next.held&&next.grip<=.26){
    next.held=false;
    next.delivered=separation(end,bin)<.25&&next.lift<.32;
    next.block=next.delivered?bin:[end[0],.115,end[2]];
  }else if(next.held||next.grip>=.72&&next.lift<.23&&separation(end,next.block)<.21){
    next.held=true;
    next.delivered=false;
    next.block=end;
  }
  return next;
}

function Marker({i,at,selected,select}:{i:number;at:Point;selected:number;select:(i:number)=>void}){
  return <WorldLabel position={at} className="gp-marker-anchor"><button type="button" className="gp-marker"
    aria-label={descriptions[i][0]} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{descriptions[i][0]}</span>}</button></WorldLabel>;
}
function Bench({state,selected,select,command,enabled,blocked,barrier,labels}:{state:State;selected:number;select:(i:number)=>void;command:Command;enabled:boolean;blocked:boolean;barrier:boolean;labels:boolean}){
  const wheels=useRef<(Group|null)[]>([]);
  useFrame((_,dt)=>{
    if(enabled&&!blocked&&['Forward','Reverse','Left','Right'].includes(command))wheels.current.forEach((wheel,i)=>{
      if(wheel)wheel.rotation.z-=dt*(command==='Reverse'||command==='Left'&&i===0||command==='Right'&&i===1?-7:7);
    });
  });
  const mark=(i:number,at:Point)=>labels?<Marker {...{i,at,selected,select}}/>:null;
  return <>
    <color attach="background" args={['#28364a']}/>
    <hemisphereLight args={['#e5f0ff','#6d5a49',2.35]}/>
    <directionalLight position={[-4,7,6]} intensity={2.3}/>
    <Box at={[0,-.13,0]} size={[6.64,.24,3.81]} color="#8a7966"/>
    <Box at={[0,.0,.13]} size={[6.39,.027,2.36]} color="#526572"/>
    {[-.71,.90].map(z=><Box key={z} at={[0,.019,z]} size={[6.07,.013,.036]} color="#b5c2b6"/>)}
    <Box at={[-1.15,.028,.14]} size={[.52,.031,.49]} color="#d7aa65"/>
    <Box at={[bin[0],.028,bin[2]]} size={[.56,.031,.52]} color={selected===4?'#dcbe70':'#76ac98'}/>
    {mark(4,[bin[0],.19,.46])}
    {barrier&&<Box at={obstruction} size={[.24,.55,.63]} color="#b87555"/>}
    <Box at={state.block} size={[.17,.17,.17]} color={state.held?'#f4db9f':'#e5ce9a'}/>
    <group position={[state.x,.06,state.z]} rotation={[0,state.angle,0]}>
      <Box at={[0,.156,0]} size={[.99,.075,.65]} color="#35546a"/>
      <Box at={[-.23,.263,0]} size={[.44,.183,.43]} color="#354554"/>
      {[-1,1].map((sign,i)=><group key={i} ref={node=>{wheels.current[i]=node;}} position={[-.17,.113,sign*.36]}>
        <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.17,.17,.10,28]}/><meshStandardMaterial color="#22292f" roughness={.92}/></mesh>
        <mesh position={[0,0,sign*.05]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.10,.10,.026,20]}/><meshStandardMaterial color="#c6a261" metalness={.49}/></mesh>
        <Box at={[.026,0,sign*.068]} size={[.084,.022,.011]} color="#876b47"/>
      </group>)}
      <group position={[.040,.23,-.095]} scale={.48}><Uno at={[0,0,0]}/></group>
      <Box at={[.02,.215,.224]} size={[.29,.047,.14]} color="#7d3d4e"/>
      <Box at={[.02,.25,.224]} size={[.086,.028,.082]} color="#293039"/>
      <Box at={[.32,.42,0]} size={[.16,.41,.18]} color="#627880"/>
      <group position={[.425,.55,0]} rotation={[0,Math.PI/2,0]} scale={.65} onClick={()=>select(0)}><Sonar highlighted={selected===0}/></group>
      {mark(0,[.48,.76,-.17])}
      {enabled&&command==='Forward'&&<Line points={[[.52,.55,0],[blocked?.90:1.32,.55,0]]} color={blocked?'#f38a65':'#81c9db'} dashed dashSize={.065} gapSize={.048} lineWidth={2}/>}
      {[-.10,.10].map(z=>{
        const height=.08+state.lift*.48-.16;
        return <group key={z} position={[.29,.16+height/2,z]} rotation={[0,0,Math.atan2(height,.43)]}>
          <Box at={[0,0,0]} size={[Math.hypot(.43,height),.051,.047]} color={selected===1?'#e6bb71':'#a2abb2'} metal={.52}/>
        </group>;
      })}
      <group position={[.54,.08+state.lift*.48,0]} onClick={()=>select(1)}>
        <Box at={[0,0,0]} size={[.42,.095,.20]} color={selected===1?'#e6bb71':'#b5a180'} metal={.26}/>
        <Box at={[-.19,0,0]} size={[.10,.17,.24]} color="#3b5263"/>
      </group>
      {mark(1,[.57,.20+state.lift*.48,-.32])}
      <group position={[.75,.062+state.lift*.48,0]} onClick={()=>select(2)}>
        {[-1,1].map(sign=><Box key={sign} at={[.071,0,sign*(.145-state.grip*.054)]} size={[.22,.064,.032]} color={selected===2?'#dcbc76':'#334751'} metal={.50}/>)}
      </group>
      {mark(2,[.90,.18+state.lift*.48,.26])}
    </group>
    <group position={[-1.58,.13,-1.12]} rotation={[command==='Forward'||command==='Raise'?.24:command==='Reverse'||command==='Lower'?-.24:0,0,command==='Left'||command==='Open'?.19:command==='Right'||command==='Close'?-.19:0]} onClick={()=>select(3)}>
      <Box at={[0,0,0]} size={[1.23,.16,.74]} color={selected===3?'#d4b373':'#3b4e60'}/>
      <group position={[-.24,.104,0]} scale={.58}><BalanceImu selected={selected===3}/></group>
      {[-.16,.18].map((z,i)=><Box key={z} at={[.37,.10,z]} size={[.17,.095,.174]} color={i?'#686a9b':enabled?'#6cc38d':'#567d99'}/>)}
    </group>
    {mark(3,[-1.62,.39,-1.12])}
    <Line points={[[-1.12,.14,-.88],[-.89,.11,-.50],[state.x-.26,.11,-.46],[state.x-.14,.33,state.z-.13]]} color="#c4ad79" lineWidth={2.2}/>
  </>;
}

export default function MotionPickDemo(){
  const [state,setState]=useState<State>(original);
  const [command,choose]=useState<Command>('Neutral');
  const [gripper,setMode]=useState(false);
  const [enabled,enable]=useState(false);
  const [barrier,setBarrier]=useState(false);
  const [echo,setEcho]=useState(true);
  const [selected,select]=useState(0);
  const [labels,setLabels]=useState(true);
  useEffect(()=>{
    if(!enabled||command==='Neutral')return;
    const timer=window.setInterval(()=>setState(previous=>advance(previous,command,gripper,barrier,echo)),65);
    return ()=>window.clearInterval(timer);
  },[command,enabled,gripper,barrier,echo]);
  const cm=clearance(state,barrier);
  const blocked=enabled&&!gripper&&command==='Forward'&&(!echo||cm<18);
  const onTarget=separation(tip(state),state.block)<.21;
  const status=blocked?'Forward blocked · Check the sonar':state.delivered?'Foam block delivered':state.held?'Carrying foam block':!enabled?'Enable released':gripper?'Gripper mode · Wheels stopped':command==='Neutral'?'Waiting for tilt':'Drive mode';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D motion pick and place rover">
        <Canvas camera={{position:[3.3,5.6,7.4],fov:42}} dpr={[1,1.6]} fallback={<p>Use the readouts to run the tabletop trial.</p>}>
          <Bench {...{state,selected,select,command,enabled,blocked,barrier,labels}}/>
          <OrbitControls target={[0,.20,.0]} minDistance={4.7} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Rover readings">
        <div><span>Front echo</span><strong>{echo?`${cm} cm`:'Missing'}</strong></div>
        <div><span>Block</span><strong>{state.held?'Held':state.delivered?'Delivered':onTarget?'Within reach':'On bench'}</strong></div>
        <div><span>Lift</span><strong>{Math.round(state.lift*100)}%</strong></div>
        <div><span>At drop zone</span><strong>{separation(tip(state),bin)<.25?'Yes':'No'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Drive, grip and place</h3>
      <p>The jaws start beside the foam block. Release Enable to switch modes. Close the jaws and raise the block, then drive to the drop zone before lowering and opening.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>{enable(!enabled);if(enabled)choose('Neutral');}}>{enabled?'Release Enable':'Hold Enable'}</button>
        <button type="button" disabled={enabled} aria-pressed={gripper} onClick={()=>{setMode(!gripper);choose('Neutral');}}>Gripper mode</button>
        <button type="button" aria-pressed={labels} onClick={()=>setLabels(value=>!value)}>Scene labels</button>
      </div>
      <div className="gp-steps" role="group" aria-label="Tilt pad controls">
        {(gripper?['Raise','Lower','Close','Open','Neutral'] as const:['Forward','Reverse','Left','Right','Neutral'] as const).map(value=><button type="button"
          key={value} aria-pressed={command===value} disabled={!enabled} onClick={()=>choose(value)}>{value}</button>)}
      </div>
      <div className="gp-steps">
        <button type="button" aria-pressed={barrier} onClick={()=>setBarrier(!barrier)}>{barrier?'Remove obstacle':'Place obstacle'}</button>
        <button type="button" aria-pressed={echo} onClick={()=>setEcho(!echo)}>Sonar echo</button>
        <button type="button" onClick={()=>{setState(original);enable(false);choose('Neutral');setMode(false);setBarrier(false);setEcho(true);}}>Reset trial</button>
      </div>
      <p role="status" className="gp-demo-description">{status}</p>
      <ol className="gp-demo-labels">{descriptions.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{descriptions[selected][1]}</p>
    </div>
  </div>;
}
