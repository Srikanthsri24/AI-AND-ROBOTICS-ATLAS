import { useEffect,useRef,useState } from 'react';
import { Canvas,useFrame } from '@react-three/fiber';
import { ContactShadows,Line,OrbitControls } from '@react-three/drei';
import type { Mesh } from 'three';
import { billedCurrent,creditTopUp,differenceLimit,faultSamples,initialMeter,meterPeriod,meterSample } from '../data/prepaid-meter';
import { SolarMeterSensor,SolarMeterSolid as Box } from './SolarMeterParts';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
const stationLabels: {at:Point;name:string}[]=[
  {at:[-2.41,.217,-.54],name:'5 V DC'},
  {at:[-1.25,.166,-.22],name:'SUPPLY · 0x40'},
  {at:[.29,.167,-.44],name:'BILLED · 0x41'},
  {at:[1.49,.17,-.34],name:'BILLED LOAD'},
  {at:[1.53,.17,1.01],name:'TEST LOAD'},
];
const parts=[
  ['5 V circuit supply','The bench supply powers the two resistive branches. USB powers the Uno and its logic. The two circuits share ground.'],
  ['Upstream monitor','The 0x40 INA219 measures both branches because it sits before the junction.'],
  ['Billed monitor','The 0x41 INA219 measures the switched billed branch. Its voltage and current determine how quickly credit is spent.'],
  ['220 Ω billed load','D9 drives the MOSFET. The resistor receives power only while there is credit and the alarm is clear.'],
  ['Mismatch test resistor','The marked test branch adds a known current after the upstream monitor. It remains powered only while the physical test switch is held or the demo switch is on.'],
  ['Controller and alarm','The Uno cuts off the billed load after four consecutive mismatches above 10 mA. Release the test switch and reset to restore the remaining credit.'],
] as const;
const anchors:Point[]=[[-2.35,.66,-.91],[-1.24,.71,-.40],[.34,.76,-.75],[1.84,.61,-.59],[1.72,.52,.70],[-1.65,.72,.85]];
const billedWires:Point[]=[[-1.08,.18,-.39],[-.46,.16,-.45],[.16,.17,-.74],[.65,.19,-.74],[1.40,.22,-.64]];
const faultWires:Point[]=[[-.46,.17,-.44],[-.18,.18,.17],[.58,.18,.71],[1.20,.21,.71],[1.53,.21,.69]];

function CurrentDot({path,color}:{path:Point[];color:string}){
  const ref=useRef<Mesh>(null);
  useFrame(({clock})=>{
    const position=(clock.elapsedTime*2.5)%(path.length-1);
    const i=Math.floor(position), fraction=position-i;
    const from=path[i],to=path[i+1];
    ref.current?.position.set(from[0]+(to[0]-from[0])*fraction,from[1]+(to[1]-from[1])*fraction+.018,from[2]+(to[2]-from[2])*fraction);
  });
  return <mesh ref={ref}><sphereGeometry args={[.048,16,14]}/><meshBasicMaterial color={color}/></mesh>;
}
function Resistor({active,color='#cbb08b'}:{active:boolean;color?:string}){
  return <group rotation={[0,0,Math.PI/2]}>
    <mesh><cylinderGeometry args={[.072,.072,.43,24]}/><meshStandardMaterial color={color} roughness={.58} emissive="#cb8a54" emissiveIntensity={active?.31:0}/></mesh>
    {[-.108,-.05,.016,.118].map((y,i)=><mesh key={y} position={[0,y,0]}><cylinderGeometry args={[.073,.073,.031,20]}/><meshStandardMaterial color={i===3?'#ae925b':'#a55242'}/></mesh>)}
    <mesh><cylinderGeometry args={[.016,.016,.68,16]}/><meshStandardMaterial color="#aab0b0" metalness={.66}/></mesh>
  </group>;
}
function MeterBench({enabled,fault,alarm,selected,select}:{
  enabled:boolean;fault:boolean;alarm:boolean;selected:number;select:(i:number)=>void;
}){
  return <>
    <color attach="background" args={['#263d4c']}/>
    <hemisphereLight args={['#e7f0fa','#705649',2.32]}/>
    <directionalLight position={[-3,7,5]} intensity={2.78}/>
    <Box at={[0,-.17,0]} size={[6.62,.30,4.04]} color="#536a76"/>
    <Box at={[.45,.041,-.12]} size={[4.60,.084,2.18]} color="#405560"/>
    <Box at={[-1.60,.047,.92]} size={[1.59,.084,1.27]} color="#6c7a79"/>
    <group position={[-2.40,.10,-.88]} onClick={()=>select(0)}>
      <Box at={[0,.19,0]} size={[.74,.40,.63]} color={selected===0?'#af8c52':'#778485'} metal={.44}/>
      <Box at={[0,.21,.318]} size={[.60,.266,.032]} color="#2f3942"/>
      <Box at={[-.11,.26,.337]} size={[.31,.11,.023]} color="#597c6e"/>
      {[.067,.210].map((x,i)=><mesh key={x} position={[x,.118,.339]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[.047,.047,.031,24]}/><meshStandardMaterial color={i?'#30373c':'#aa4c46'}/>
      </mesh>)}
    </group>
    {[[-1.28,-.51,.42,1],[.29,-.78,.52,2]].map(([x,z,scale,i])=><group key={x} position={[x,.148,z]} rotation={[0,Math.PI/2,0]} scale={scale} onClick={()=>select(i)}>
      <SolarMeterSensor selected={selected===i}/>
    </group>)}
    <group position={[1.50,.114,-.66]} onClick={()=>select(3)}>
      <Box at={[0,0,0]} size={[1.44,.12,.66]} color={selected===3?'#c89856':'#bfc9c8'}/>
      <group position={[0,.153,.01]}><Resistor active={enabled}/></group>
      <Box at={[.51,.091,.16]} size={[.31,.054,.26]} color="#326574"/>
      <Box at={[.51,.122,.16]} size={[.11,.025,.097]} color="#252d34"/>
      <Box at={[.50,.154,.082]} size={[.19,.063,.08]} color="#4b9297"/>
    </group>
    <group position={[1.56,.125,.70]} onClick={()=>select(4)}>
      <Box at={[0,0,0]} size={[1.41,.105,.64]} color={selected===4?'#d7ad65':'#849b99'}/>
      <group position={[-.08,.137,-.02]}><Resistor active={fault} color="#bc9b81"/></group>
      <Box at={[.47,.096,.046]} size={[.20,.064,.20]} color="#222f38"/>
      <mesh position={[.47,fault?.13:.166,.046]}><cylinderGeometry args={[.060,.060,.071,24]}/><meshStandardMaterial color={fault?'#c85e3e':'#b0885c'}/></mesh>
    </group>
    <group position={[-1.62,.17,.83]} onClick={()=>select(5)}>
      <group scale={1.45}><Uno at={[0,0,0]}/></group>
      <Box at={[.52,.027,.18]} size={[.64,.14,.48]} color={selected===5?'#d4a567':'#8292a0'}/>
      {[-.13,.13].map((dx,i)=><mesh key={dx} position={[.52+dx,.134,.23]}>
        <sphereGeometry args={[.059,20,15]}/>
        <meshStandardMaterial color={i?'#b64d41':'#488a66'} emissive={i?'#f13425':'#42e384'} emissiveIntensity={(i?alarm:enabled)?1.7:0}/>
      </mesh>)}
    </group>
    <Line points={[[-2.33,.22,-.52],[-1.92,.14,-.69],[-1.47,.17,-.53]]} color="#d77e68" lineWidth={3}/>
    <Line points={billedWires} color={enabled?'#82e3ba':'#689a94'} lineWidth={3}/>
    <Line points={faultWires} color={fault?'#f89d6a':'#b49878'} lineWidth={3}/>
    <Line points={[[1.95,.19,-.50],[2.25,.11,-.16],[1.94,.105,1.12],[-.73,.12,1.43],[-1.59,.17,1.01]]} color="#3d4c5c" lineWidth={2.5}/>
    <Line points={[[.29,.19,-.59],[.17,.13,-.10],[-.82,.15,.63],[-1.41,.18,.79]]} color="#86b6d9" lineWidth={2.3}/>
    {enabled&&<CurrentDot path={billedWires} color="#a1ffd3"/>}
    {fault&&<CurrentDot path={faultWires} color="#ffd096"/>}
    {stationLabels.map(({at,name})=><WorldLabel key={name} className="gp-meter-station" position={at}>
      <span>{name}</span>
    </WorldLabel>)}
    {anchors.map((point,i)=><WorldLabel className="gp-marker-anchor" key={i} position={point}>
      <button className="gp-marker" type="button" aria-label={parts[i][0]} aria-pressed={i===selected} onClick={()=>select(i)}>
        {i+1}{i===selected&&<span className="gp-demo-marker-name">{parts[i][0]}</span>}
      </button>
    </WorldLabel>)}
    <ContactShadows position={[0,.028,0]} opacity={.39} scale={6.4} blur={2.3} far={1.3} resolution={128}/>
  </>;
}

export default function PrepaidMeterDemo(){
  const [state,setState]=useState(initialMeter);
  const [selected,select]=useState(1);
  const [resetRefused,setResetRefused]=useState(false);
  const enabled=state.credit>0&&!state.alarm;
  const activeBilled=enabled?billedCurrent:0;
  const total=activeBilled+(state.faultPath?billedCurrent:0);
  const sampling=enabled||state.faultPath;
  useEffect(()=>{
    if(!sampling)return;
    let previous=performance.now();
    const timer=window.setInterval(()=>{
      const now=performance.now();
      const elapsed=now-previous;
      previous=now;
      setState(value=>meterSample(value,elapsed));
    },meterPeriod);
    return ()=>window.clearInterval(timer);
  },[sampling]);
  const status=resetRefused?'Reset refused · Switch off the test load'
    :state.alarm?'Mismatch latched · Billed branch off'
    :state.strikes?'Mismatch detected · Checking consecutive readings'
    :enabled?'Billed branch on · Credit is decreasing':'Zero credit · Billed branch off';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D prepaid energy meter bench">
        <Canvas camera={{position:[2.6,4.55,6.8],fov:43}} dpr={[1,1.6]} fallback={<p>Use the live meter readings to compare the two branches.</p>}>
          <MeterBench enabled={enabled} fault={state.faultPath} alarm={state.alarm} {...{selected,select}}/>
          <OrbitControls target={[0,.27,.11]} minDistance={3.6} maxDistance={14} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Prepaid meter readings">
        <div><span>Supply current</span><strong>{total.toFixed(1)} mA</strong></div>
        <div><span>Billed current</span><strong>{activeBilled.toFixed(1)} mA</strong></div>
        <div><span>Remaining credit</span><strong>{state.credit.toFixed(3)} mWh</strong></div>
      </div>
      <div className="gp-meter-progress">
        <label htmlFor="prepaid-mismatch">Consecutive differences above {differenceLimit} mA</label>
        <progress id="prepaid-mismatch" max={faultSamples} value={state.strikes}/>
        <span>{state.strikes} of {faultSamples}</span>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Top up, compare and reset</h3>
      <p>One top-up powers the billed resistor for about nine seconds. Add the test load and watch the two readings divide. After cutoff, switch off the test load and reset the alarm.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>{setResetRefused(false);setState(value=>({...value,credit:Math.min(3,value.credit+creditTopUp)}));}}>Top up 0.30 mWh</button>
        <button type="button" aria-pressed={state.faultPath} onClick={()=>{setResetRefused(false);setState(value=>({...value,faultPath:!value.faultPath,strikes:value.faultPath?0:value.strikes}));}}>{state.faultPath?'Switch off test load':'Switch on test load'}</button>
      </div>
      <div className="gp-steps">
        <button type="button" disabled={!state.alarm} onClick={()=>{
          if(state.faultPath)setResetRefused(true);
          else{setResetRefused(false);setState(value=>({...value,alarm:false,strikes:0}));}
        }}>Reset alarm</button>
        <button type="button" onClick={()=>{setResetRefused(false);setState(initialMeter);}}>Reset bench</button>
      </div>
      <p role="status" className="gp-demo-description">{status}</p>
      <ol className="gp-demo-labels">{parts.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{parts[selected][1]}</p>
    </div>
  </div>;
}
