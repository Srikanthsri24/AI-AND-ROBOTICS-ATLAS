import { useEffect, useReducer, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { CatmullRomCurve3, MathUtils, Vector3, type Group } from 'three';
import { tankLimits } from '../data/tank-refill';
import { TapLevel, TapPump } from './AutomaticTapDemo';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Fault='Sensor conflict'|'Run timeout'|null;
type Cycle={target:number; source:number; demand:boolean; pumping:boolean; elapsed:number; jammed:boolean; conflict:boolean; fault:Fault};
type Action={type:'tick'|'reset'}|{type:'target'|'source';value:number}|{type:'jammed'|'conflict';value:boolean};
const initial:Cycle={target:45,source:86,demand:false,pumping:false,elapsed:0,jammed:false,conflict:false,fault:null};
const markers = [
  ['Supply tank sensor','Detects water just above the inlet. A low source reading blocks pumping.'],
  ['Peristaltic pump','The rotating rollers push water through the tube. The motor stays outside the tray.'],
  ['Lower receiving sensor','Starts a refill when the surface goes below this mark.'],
  ['Upper receiving sensor','Stops the refill when water reaches this mark.'],
  ['Arduino and MOSFET driver','The Uno commands D9. The driver switches power from a separate low-voltage supply.'],
] as const;
const feedPath=new CatmullRomCurve3([[-2.33,.27,.1],[-2.33,1.56,.09],[-2.00,1.76,.03],[-1.40,1.22,.04],[-.99,.66,.07],[-.56,.763,-.06]].map(point=>new Vector3(...point)));
const outletPath=new CatmullRomCurve3([[-.56,.763,-.263],[-.34,.90,-.26],[.08,1.47,-.21],[.69,1.92,-.10],[1.32,1.86,.03],[1.47,1.68,.08]].map(point=>new Vector3(...point)));

function decide(state:Cycle):Cycle{
  const high=state.target>=tankLimits.high;
  const demand=state.conflict?state.demand:high?false:state.target<tankLimits.low?true:state.demand;
  const fault=state.conflict?'Sensor conflict':state.fault;
  const pumping=demand&&!high&&!fault&&state.source>tankLimits.reserve;
  return {...state,demand,fault,pumping,elapsed:pumping?(state.pumping?state.elapsed:0):0};
}

function reducer(state:Cycle,action:Action):Cycle {
  if(action.type==='tick'){
    if(!state.pumping)return state;
    const elapsed=state.elapsed+1;
    if (elapsed>=tankLimits.runLimit) return {...state,pumping:false,elapsed,fault:'Run timeout'};
    const volume=state.jammed?0:Math.min(tankLimits.fillPerSecond,tankLimits.high-state.target,state.source-tankLimits.reserve);
    return decide({...state,target:state.target+volume,source:state.source-volume,elapsed});
  }
  if(action.type==='reset')return state.conflict||state.source<=tankLimits.reserve?state:decide({...state,fault:null,pumping:false,elapsed:0});
  if('value' in action) return decide({...state,[action.type]:action.value});
  return state;
}

function Box({at,size,color,metal=0}:{at:Point;size:Point;color:string;metal?:number}){
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.16} smoothness={3} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={metal?.34:.65} metalness={metal}/>
  </RoundedBox>;
}

function Tank({x,level,source,selected}:{x:number;level:number;source?:boolean;selected:number}){
  const water=useRef<Group>(null);
  const height=1.18, width=source?1.46:1.64, depth=1.22;
  useFrame((_,delta)=>{
    if(water.current)water.current.scale.y=MathUtils.damp(water.current.scale.y,Math.max(.002,level/100),10,delta);
  });
  const marks=source?[tankLimits.reserve]:[tankLimits.low,tankLimits.high];
  return <group position={[x,.137,.16]}>
    <Box at={[0,0,0]} size={[width+.15,.11,depth+.15]} color="#637887"/>
    <group ref={water} scale={[1,Math.max(.002,level/100),1]}>
      <mesh position={[0,height/2,0]}><boxGeometry args={[width-.13,height,depth-.12]}/><meshPhysicalMaterial color="#3aafd4" transparent opacity={.67} roughness={.27} depthWrite={false}/></mesh>
      <mesh position={[0,height,0]} rotation={[-Math.PI/2,0,0]}><planeGeometry args={[width-.13,depth-.12]}/><meshPhysicalMaterial color="#73d0e1" transparent opacity={.82} depthWrite={false}/></mesh>
    </group>
    {[-1,1].map(sign=><group key={sign}>
      <mesh position={[sign*width/2,(height+.08)/2,0]}>
        <boxGeometry args={[.06,height+.08,depth]}/><meshPhysicalMaterial color="#c3e2e3" transparent opacity={.26} roughness={.22} depthWrite={false}/></mesh>
      <mesh position={[0,(height+.08)/2,sign*depth/2]}>
        <boxGeometry args={[width,height+.08,.05]}/><meshPhysicalMaterial color="#c2e7ea" transparent opacity={sign===1?.16:.25} roughness={.22} depthWrite={false}/></mesh>
      <Box at={[sign*width/2,height+.08,0]} size={[.055,.054,depth+.07]} color="#b4ccd1" metal={.22}/>
      <Box at={[0,height+.08,sign*depth/2]} size={[width,.054,.050]} color="#b4ccd1" metal={.22}/>
    </group>)}
    {marks.map((mark,i)=><group key={mark} position={[source?.35:.53,height*mark/100,depth/2+.039]} scale={.54}>
      <TapLevel selected={selected===(source?0:i+2)}/>
      <Box at={[-1.25,.009,.035]} size={[1.56,.027,.036]} color={source?'#efb875':i?'#e6eeb3':'#a1e4e1'}/>
    </group>)}
  </group>;
}

function Flow({active,level}:{active:boolean;level:number}){
  const slugs=useRef<Group>(null);
  useFrame(({clock})=>{
    if(!active)return;
    slugs.current?.children.forEach((object,i)=>{
      const phase=(clock.elapsedTime*.72+i/8)%1;
      if(phase<.45)feedPath.getPointAt(phase/.45,object.position);
      else if(phase<.86)outletPath.getPointAt((phase-.45)/.41,object.position);
      else object.position.set(1.47,MathUtils.lerp(1.68,.15+level*.0118,(phase-.86)/.14),.08);
    });
  });
  return <group ref={slugs} visible={active}>{Array.from({length:8},(_,i)=><mesh key={i}>
    <sphereGeometry args={[.037,12,8]}/><meshBasicMaterial color="#6eddf4"/>
  </mesh>)}</group>;
}

function Bench({state,selected,select,labels}:{state:Cycle;selected:number;select:(i:number)=>void;labels:boolean}){
  const markersAt:Point[]=[[-1.95,.31,.85],[-.78,.64,-.1],[2.05,.49,.83],[2.05,1.03,.83],[.15,.28,1.30]];
  const tags:Point[]=[[-2.82,.79,1.15],[-.95,1.05,-.49],[2.77,.75,1.00],[2.85,1.54,.72],[.30,.73,1.64]];
  return <>
    <color attach="background" args={['#253744']}/>
    <ambientLight intensity={.62}/>
    <directionalLight position={[-4,8,6]} intensity={2.3} color="#fff1da"/>
    <directionalLight position={[6,6,-5]} intensity={1.35} color="#bfdef8"/>
    <Box at={[0,-.15,0]} size={[12,.28,7.5]} color="#45555d"/>
    <Box at={[-.21,.072,.09]} size={[6.28,.14,2.38]} color="#3c5761"/>
    {[-1.08,1.26].map(z=><Box key={z} at={[-.21,.167,z]} size={[6.28,.12,.060]} color="#71909a"/>)}
    {[-3.35,2.94].map(x=><Box key={x} at={[x,.167,.09]} size={[.06,.12,2.36]} color="#71909a"/>)}
    <Tank x={-2.35} level={state.source} source selected={selected}/>
    <Tank x={1.51} level={state.target} selected={selected}/>
    <Box at={[-.81,.24,-.16]} size={[.78,.14,.69]} color="#596a72"/>
    <group position={[-.81,.315,-.16]}><TapPump running={state.pumping} selected={selected===1}/></group>
    {[feedPath,outletPath].map((path,i)=><mesh key={i}>
      <tubeGeometry args={[path,45,.038,10,false]}/><meshPhysicalMaterial color="#c6d5d3" transparent opacity={.68} roughness={.32} depthWrite={false}/>
    </mesh>)}
    <Flow active={state.pumping&&!state.jammed} level={state.target}/>
    <Box at={[-.07,.04,1.58]} size={[1.88,.080,.59]} color="#67716d"/>
    <Uno at={[-.48,.11,1.52]} highlighted={selected===4}/>
    <Box at={[.28,.149,1.43]} size={[.32,.075,.25]} color="#2e3d42"/>
    <Box at={[.36,.206,1.43]} size={[.13,.084,.19]} color="#75948e"/>
    <mesh position={[.20,.204,1.37]}><sphereGeometry args={[.026,14,10]}/><meshStandardMaterial color="#bc6865" emissive="#f35746" emissiveIntensity={state.pumping?2.4:0}/></mesh>
    {['#d58e75','#dbaf63','#73b6ca'].map((color,i)=><Line key={color}
      points={[[.03+i*.06,.19,1.49],[.50+i*.06,.24,.99],i===0?[-1.76,.27,.82]:[2.14,i===1?.50:1.03,.83]]} color={color} lineWidth={1.65}/>)}
    <Line points={[[.43,.23,1.43],[.15,.29,.71],[-.36,.24,.35],[-.58,.50,-.06]]} color="#515c64" lineWidth={1.83}/>
    <ContactShadows position={[0,.003,0]} scale={11} opacity={.44} blur={2.6}/>
    {labels&&tags.map((tag,i)=><group key={i}>
      <Line points={[markersAt[i],tag]} color={selected===i?'#ffe2a4':'#bed2de'} lineWidth={1.3}/>
      <WorldLabel position={tag} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={markers[i][0]} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}</button></WorldLabel>
    </group>)}
  </>;
}

export default function TankRefillDemo(){
  const [state,dispatch]=useReducer(reducer,initial);
  const [running,setRunning]=useState(false),[selected,select]=useState(2),[labels,setLabels]=useState(true);
  useEffect(()=>{
    if(!running)return;
    const clock=window.setInterval(()=>dispatch({type:'tick'}),420);
    return ()=>window.clearInterval(clock);
  },[running]);
  const reason=state.fault??(state.source<=tankLimits.reserve?'Supply low':state.pumping?'Refilling':state.target>=tankLimits.high?'At upper mark':'Waiting for low mark');
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D two-tank refill bench">
        <Canvas camera={{position:[.06,5.85,7.55],fov:42}} dpr={[1,1.6]} fallback={<p>The controls and water levels are available below.</p>}>
          <Bench state={state} selected={selected} select={select} labels={labels}/>
          <OrbitControls target={[-.23,.45,.18]} minDistance={4.8} maxDistance={16} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Tank readings">
        <div><span>Receiving tank</span><strong>{state.target}%</strong></div>
        <div><span>Supply tank</span><strong>{state.source}%</strong></div>
        <div><span>Pump</span><strong>{state.pumping?'On':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Watch a refill cycle</h3>
      <p>Drain below {tankLimits.low}% to request a refill. The pump keeps going until the {tankLimits.high}% mark or a stop condition. Each step advances one simulated second.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>setRunning(value=>!value)}>{running?'Pause simulation':'Run simulation'}</button>
        <button type="button" onClick={()=>dispatch({type:'tick'})}>Step 1 s</button>
        <button type="button" onClick={()=>dispatch({type:'target',value:24})}>Drain below low mark</button>
        <button type="button" onClick={()=>dispatch({type:'source',value:8})}>Lower supply</button>
        <button type="button" onClick={()=>dispatch({type:'source',value:86})}>Refill supply</button>
      </div>
      <div className="gp-steps">
        <button type="button" aria-pressed={state.jammed} onClick={()=>dispatch({type:'jammed',value:!state.jammed})}>{state.jammed?'Restore flow':'Simulate blocked tube'}</button>
        <button type="button" aria-pressed={state.conflict} onClick={()=>dispatch({type:'conflict',value:!state.conflict})}>{state.conflict?'Restore sensors':'Simulate sensor conflict'}</button>
        <button type="button" disabled={!state.fault||state.conflict||state.source<=tankLimits.reserve} onClick={()=>dispatch({type:'reset'})}>Reset fault</button>
        <button type="button" aria-pressed={labels} onClick={()=>setLabels(value=>!value)}>Scene labels</button>
      </div>
      <p className="gp-demo-description" role="status">{reason}{state.pumping?` · Run timer ${state.elapsed}/${tankLimits.runLimit} s`:''}</p>
      <ol className="gp-demo-labels">{markers.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{markers[selected][1]}</p>
    </div>
  </div>;
}
