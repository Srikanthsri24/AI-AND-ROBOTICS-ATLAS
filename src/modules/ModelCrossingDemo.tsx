import {useEffect,useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import type {Group} from 'three';
import {WorldLabel} from './LabWorkbench';
import {CrossingMast,CrossingRoad} from './CrossingRequestParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
type Phase='Green'|'Amber'|'All stop'|'Walk'|'Clearance';
const limits:Record<Phase,number>={Green:3000,Amber:1200,'All stop':800,Walk:4000,Clearance:1500};
const next:Record<Phase,Phase>={Green:'Amber',Amber:'All stop','All stop':'Walk',Walk:'Clearance',Clearance:'Green'};
const parts:{name:string;at:Point;detail:string}[]=[
  {name:'Pedestrian request · D2',at:[.91,.43,.96],detail:'A press queues one request while the vehicle signal is green. The request waits for the minimum green time.'},
  {name:'Vehicle signal · D5–D7',at:[-1.20,1.81,-.62],detail:'Green changes to amber. Red then stays on through all-stop, WALK and clearance.'},
  {name:'Pedestrian signal · D8–D9',at:[.87,1.50,.68],detail:'WALK lights only after all-stop, with vehicles on red. WAIT returns for clearance.'},
  {name:'Arduino and wiring',at:[-1.18,.34,1.11],detail:'The Uno sequences both heads. Each of the five LEDs has its own series resistor.'},
];
const vehicle=(phase:Phase)=>phase==='Green'?'Green':phase==='Amber'?'Amber':'Red';

function Lens({at,color,lit}:{at:Point;color:string;lit:boolean}){
  return <group position={at}>
    <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.075,.073,.057,24]}/><meshStandardMaterial color="#202a30"/></mesh>
    <mesh position={[0,0,.030]}><sphereGeometry args={[.055,22,16]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={lit?2.7:0} roughness={lit?.35:.72}/></mesh>
    {lit&&<pointLight position={[0,0,.065]} color={color} intensity={.8} distance={.55}/>}
  </group>;
}

function Bench({phase,queued,selected,select,request}:{phase:Phase;queued:boolean;selected:number;select:(i:number)=>void;request:()=>void}){
  const person=useRef<Group>(null);
  const walking=useRef(false);
  const destination=useRef(-.77);
  useFrame((_,delta)=>{
    if(phase==='Walk'&&person.current){
      const {position}=person.current;
      if(!walking.current)destination.current=position.z>0?-.77:.76;
      const distance=destination.current-position.z;
      position.z+=Math.sign(distance)*Math.min(Math.abs(distance),delta*.56);
    }
    walking.current=phase==='Walk';
  });
  return <>
    <color attach="background" args={['#40525d']}/><hemisphereLight args={['#e9f4ff','#967f68',2.06]}/><directionalLight position={[-3,6,4]} color="#fff2de" intensity={2.15}/>
    <Box at={[0,-.095,0]} size={[4.79,.19,3.07]} color="#7f9088"/>
    <group position={[0,.01,-.18]} scale={[1.13,1,1.15]}><CrossingRoad/></group>
    <group position={[-1.23,.17,-.77]} onClick={()=>select(1)}>
      <CrossingMast/>
      {[['#ef6869',vehicle(phase)==='Red'],['#eeb64b',phase==='Amber'],['#6fd9a3',phase==='Green']].map(([color,lit],i)=><Lens key={i} at={[0,1.47-i*.18,.114]} color={String(color)} lit={Boolean(lit)}/>)}
    </group>
    <group position={[.86,.17,.67]} onClick={()=>select(2)}>
      <CrossingMast pedestrian/>
      <Lens at={[0,1.096,.114]} color="#e7775a" lit={phase!=='Walk'}/>
      <Lens at={[0,.925,.114]} color="#7cdbad" lit={phase==='Walk'}/>
    </group>
    <group onClick={request}>
      <Box at={[.92,.225,.92]} size={[.27,.106,.25]} color={selected===0?'#d8ab7e':'#49606a'}/>
      <mesh position={[.92,.308,.92]}><cylinderGeometry args={[.068,.07,.074,24]}/><meshStandardMaterial color={queued?'#ffbf67':'#b6784e'} emissive="#ffb755" emissiveIntensity={queued?1.40:0}/></mesh>
    </group>
    <group position={[-1.24,.17,.12]}>
      <Box at={[0,.145,0]} size={[.73,.20,.40]} color="#618b9a"/>
      <Box at={[-.04,.295,0]} size={[.37,.14,.34]} color="#8ca9b3"/>
      <Box at={[.130,.31,0]} size={[.032,.092,.30]} color="#354853"/>
      {[-.22,.23].flatMap(x=>[-.19,.19].map(z=><mesh key={x+','+z} position={[x,.077,z]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.073,.073,.052,16]}/><meshStandardMaterial color="#273139"/></mesh>))}
    </group>
    <group ref={person} position={[.14,.155,.76]}>
      <Box at={[0,.23,0]} size={[.12,.20,.081]} color="#b48760"/>
      {[-.035,.035].map(x=><Box key={x} at={[x,.078,.005]} size={[.047,.155,.054]} color="#495862"/>)}
      <mesh position={[0,.369,0]}><sphereGeometry args={[.058,19,12]}/><meshStandardMaterial color="#d7ab86"/></mesh>
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[-1.22,.10,1.11]} size={[.95,.085,.49]} color={selected===3?'#6daba7':'#297c89'}/>
      <Box at={[-1.57,.176,1.18]} size={[.17,.111,.14]} color="#c3cbd0" metal={.63}/>
      <Box at={[-1.10,.167,1.10]} size={[.23,.056,.108]} color="#26353d"/>
      {[.93,1.29].map(z=><Box key={z} at={[-1.17,.165,z]} size={[.62,.052,.045]} color="#24343b"/>)}
    </group>
    <Line points={[[.92,.23,.9],[.62,.12,1.14],[-.34,.10,1.29],[-.92,.18,1.27]]} color="#e4a06b" lineWidth={2.6}/>
    <Line points={[[.87,.18,.67],[.56,.13,.88],[-.60,.10,.91],[-.91,.18,.93]]} color="#75b9c8" lineWidth={2.6}/>
    <Line points={[[-1.23,.18,-.74],[-1.65,.11,-.49],[-1.78,.11,.62],[-1.29,.18,.93]]} color="#c98079" lineWidth={2.6}/>
    {parts.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.34} scale={5.2} far={1.9} resolution={128} frames={1}/>
  </>;
}

type Signal={phase:Phase;started:number;queued:boolean};
export default function ModelCrossingDemo(){
  const [signal,setSignal]=useState<Signal>(()=>({phase:'Green',started:performance.now(),queued:false}));
  const [selected,select]=useState(0);
  const {phase,started,queued}=signal;
  useEffect(()=>{
    if(phase==='Green'&&!queued)return;
    const id=window.setTimeout(()=>setSignal({phase:next[phase],started:performance.now(),queued:false}),Math.max(0,limits[phase]-(performance.now()-started)));
    return ()=>window.clearTimeout(id);
  },[phase,started,queued]);
  function request(){
    select(0);
    setSignal(previous=>previous.phase==='Green'&&!previous.queued?{...previous,queued:true}:previous);
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D model crossing request">
        <Canvas camera={{position:[2.1,3.33,6.35],fov:41}} dpr={[1,1.6]} fallback={<p>Use the signal readouts below.</p>}><Bench {...{phase,queued,selected,select,request}}/><OrbitControls target={[0,.57,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Crossing signal readings">
        <div><span>Vehicle signal</span><strong>{vehicle(phase)}</strong></div><div><span>Pedestrian signal</span><strong>{phase==='Walk'?'WALK':'WAIT'}</strong></div><div><span>Phase</span><strong>{phase}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Request a crossing and follow both signals</h3>
      <p>Press just after a reset to see the request queue. Vehicle green runs for at least three seconds. Follow amber, all-stop, WALK and clearance as the model changes.</p>
      <div className="gp-steps">
        <button className="gp-button" type="button" onClick={request}>Press crossing button</button>
        <button type="button" onClick={()=>{setSignal({phase:'Green',started:performance.now(),queued:false});select(0);}}>Reset crossing</button>
      </div>
      <p role="status">{queued?'Crossing queued. Waiting for the minimum green time.':phase==='Green'?'Ready to accept a request.':`${phase} phase. The request is being served.`}</p>
      <ol className="gp-demo-labels">{parts.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{parts[selected].detail}</p>
    </div>
  </div>;
}
