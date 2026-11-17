import { useEffect,useRef,useState } from 'react';
import { Canvas,useFrame } from '@react-three/fiber';
import { ContactShadows,Line,OrbitControls } from '@react-three/drei';
import { MathUtils,type Group,type Mesh } from 'three';
import { accessWindowMs,chargeCeiling,loadMinimumVolts,loadWindowMs,storageCapacitance } from '../data/footstep-rfid';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { HarvestCapacitor,PiezoDisc,RectifierBridge } from './FootstepRfidParts';
import { PN532Shield,TagCard } from './RFIDDoorDemo';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Tag='A'|'B';
const parts=[
  ['Press tile and stops','Pressing the model bends the supported ceramic discs slightly. This generates a brief electrical pulse.'],
  ['Piezo discs','Both push and release can produce charge. Each disc has its own bridge so the two AC sources stay separate.'],
  ['Bridge rectifiers','Four diodes per disc steer the positive and negative pulses into the same DC storage rails.'],
  ['Storage capacitor','The capacitor accumulates charge and a Zener limits its voltage. While waiting, the measurement divider slowly drains it.'],
  ['RFID shield','The USB-powered controller matches a tag ID and enables one test for eight seconds. The tag does not supply the energy.'],
  ['Harvested-energy load','D9 turns on a MOSFET for 180 ms. Current then flows from the capacitor through the red test LED and its resistor.'],
] as const;
const anchors:Point[]=[[-1.80,1.08,-.40],[-1.88,.49,.61],[-.53,.60,.28],[.35,.58,.73],[1.80,.67,-.26],[2.05,.57,.80]];
const elapsedLoad=(v:number,ms:number)=>1.76+(v-1.76)*Math.exp(-ms/(4700*storageCapacitance*1000));
const idleDrain=(v:number,ms:number)=>v*Math.exp(-ms/(940000*storageCapacitance*1000));

function Bench({press,tag,load,armed,denied,selected,select}:{
  press:boolean;tag:Tag|null;load:boolean;armed:boolean;denied:boolean;selected:number;select:(n:number)=>void;
}){
  const plate=useRef<Group>(null);
  const visitor=useRef<Group>(null);
  const light=useRef<Mesh>(null);
  useFrame(({clock},dt)=>{
    if(plate.current)plate.current.position.y=MathUtils.damp(plate.current.position.y,press?.54:.71,17,dt);
    if(visitor.current)visitor.current.position.y=MathUtils.damp(visitor.current.position.y,tag?.56:1.08,11,dt);
    if(light.current)light.current.position.x=-1.46+(clock.elapsedTime*6%1)*1.85;
  });
  return <>
    <color attach="background" args={['#294450']}/>
    <hemisphereLight args={['#e2f2ff','#665347',2.27]}/>
    <directionalLight position={[-3,7,5]} intensity={2.62}/>
    <Box at={[0,-.14,0]} size={[6.45,.25,4.10]} color="#526a73"/>
    <Box at={[-1.77,.067,0]} size={[2.03,.12,1.66]} color="#66747b" metal={.41}/>
    {[-2.55,-.98].flatMap(x=>[-.58,.58].map(z=><group key={x+':'+z} position={[x,.15,z]}>
      <Box at={[0,0,0]} size={[.16,.07,.16]} color="#3b454a"/>
      <Box at={[0,.155,0]} size={[.133,.32,.142]} color="#424c50" />
      <Box at={[0,.316,0]} size={[.159,.051,.17]} color="#8b8c79" />
      {Array.from({length:4},(_,i)=><Box key={i} at={[0,.057+i*.057,.071]} size={[.127,.009,.006]} color="#687373"/>)}
    </group>))}
    {[-2.16,-1.48].map(x=><group key={x} position={[x,.26,.39]} onClick={()=>select(1)}><PiezoDisc selected={selected===1}/></group>)}
    <group ref={plate} position={[-1.77,.71,0]} onClick={()=>select(0)}>
      <Box at={[0,0,0]} size={[1.97,.148,1.56]} color={selected===0?'#b88d57':'#394b54'} metal={.30}/>
      <Box at={[0,.084,0]} size={[1.81,.033,1.40]} color={selected===0?'#bd955f':'#647078'}/>
      {Array.from({length:8},(_,i)=><Box key={i} at={[(i-3.5)*.20,.106,0]} size={[.059,.015,1.26]} color="#778990"/>)}
      {[-.34,.34].map(x=><Box key={x} at={[x,-.142,.392]} size={[.16,.14,.13]} color="#282e34"/>)}
    </group>
    <Box at={[.10,.070,.45]} size={[1.53,.102,.90]} color="#cbcfca"/>
    {[-.45,-.06].map(x=><group key={x} position={[x,.163,.40]} scale={.47} onClick={()=>select(2)}><RectifierBridge selected={selected===2}/></group>)}
    <group position={[.44,.216,.53]} onClick={()=>select(3)}>
      <HarvestCapacitor selected={selected===3}/>
      <Box at={[.265,-.08,0]} size={[.145,.063,.066]} color="#bd6950"/>
      <Box at={[.30,-.044,0]} size={[.02,.012,.068]} color="#393b3d"/>
    </group>
    <group position={[1.61,.096,-.49]} onClick={()=>select(4)}>
      <group scale={1.33}><Uno at={[0,0,0]}/></group>
      <group position={[0,.206,0]} scale={1.05}><PN532Shield selected={selected===4}/></group>
    </group>
    <group ref={visitor} position={[2.15,1.08,-.49]}>
      {!!tag&&<group scale={.71}><TagCard tag={tag}/></group>}
    </group>
    <group position={[1.77,.132,.67]} onClick={()=>select(5)}>
      <Box at={[0,-.027,0]} size={[1.17,.13,.60]} color={selected===5?'#bb945f':'#2d4a56'}/>
      <Box at={[-.31,.091,.05]} size={[.18,.104,.16]} color="#253238"/>
      <Box at={[.25,.063,.07]} size={[.18,.061,.055]} color="#ccb48b"/>
      <mesh position={[.39,.139,.07]}><sphereGeometry args={[.065,24,16]}/>
        <meshStandardMaterial color="#d43034" emissive="#ff5639" emissiveIntensity={load?3.4:0}/>
      </mesh>
      {[-.16,.08].map((x,i)=><mesh key={x} position={[x,.106,-.16]}><sphereGeometry args={[.043,20,14]}/>
        <meshStandardMaterial color={i?'#953a3a':'#327a59'} emissive={i?'#f35e48':'#51e68a'} emissiveIntensity={(i?denied:armed)?2.1:0}/>
      </mesh>)}
    </group>
    <Line points={[[-1.48,.26,.42],[-1.02,.19,.67],[-.74,.159,.70],[-.45,.16,.43]]} color="#bf6b58" lineWidth={2.8}/>
    <Line points={[[-.07,.164,.40],[.13,.183,.38],[.44,.20,.48],[1.06,.178,.77],[1.63,.19,.72]]} color="#e0b66c" lineWidth={2.7}/>
    <Line points={[[1.63,.25,-.21],[1.98,.16,.01],[1.57,.205,.76]]} color="#69a8cf" lineWidth={2}/>
    {press&&<mesh ref={light} position={[-1.48,.23,.51]}><sphereGeometry args={[.046,16,12]}/><meshBasicMaterial color="#ffde86"/></mesh>}
    {load&&<pointLight position={[2.16,.33,.74]} color="#ff754f" distance={.9} intensity={2.6}/>}
    {anchors.map((at,i)=><WorldLabel className="gp-marker-anchor" key={i} position={at}>
      <button type="button" className="gp-marker" aria-pressed={selected===i} aria-label={parts[i][0]} onClick={()=>select(i)}>
        {i+1}{selected===i&&<span className="gp-demo-marker-name">{parts[i][0]}</span>}
      </button>
    </WorldLabel>)}
    <ContactShadows position={[0,.022,0]} opacity={.42} scale={6.4} blur={2.4} far={1.2} resolution={128}/>
  </>;
}

type State={volts:number;pressUntil:number;tag:Tag|null;tagUntil:number;armedUntil:number;loadUntil:number;checkedAt:number;message:string;denied:boolean};
const initial:State={volts:0,pressUntil:0,tag:null,tagUntil:0,armedUntil:0,loadUntil:0,checkedAt:0,message:'Press the model tile to collect charge.',denied:false};
function tick(state:State,now:number):State{
  if(!state.volts&&!state.armedUntil&&!state.tagUntil&&!state.pressUntil&&!state.loadUntil)return state;
  const dt=Math.max(0,now-state.checkedAt);
  const activeLoad=state.loadUntil?Math.max(0,Math.min(now,state.loadUntil)-state.checkedAt):0;
  const voltage=idleDrain(activeLoad?elapsedLoad(state.volts,activeLoad):state.volts,Math.max(0,dt-activeLoad));
  const loadEnded=!!state.loadUntil&&now>=state.loadUntil;
  const expired=!!state.armedUntil&&now>=state.armedUntil;
  return {...state,volts:voltage<.001?0:voltage,checkedAt:now,
    pressUntil:now>=state.pressUntil?0:state.pressUntil,
    tagUntil:now>=state.tagUntil?0:state.tagUntil,
    loadUntil:loadEnded?0:state.loadUntil,
    armedUntil:expired?0:state.armedUntil,
    message:loadEnded?'Load pulse ended · Compare the remaining charge':expired?'Authorization expired · Tap Tag A again':state.message};
}

export default function FootstepRfidDemo(){
  const [state,setState]=useState(initial);
  const [firm,setFirm]=useState(true);
  const [selected,select]=useState(0);
  useEffect(()=>{
    const timer=window.setInterval(()=>{const now=performance.now();setState(previous=>tick(previous,now));},45);
    return ()=>window.clearInterval(timer);
  },[]);
  function press(){
    const now=performance.now();
    setState(previous=>{
      const current=tick(previous,now);
      if(current.pressUntil||current.loadUntil)return current;
      return {...current,volts:Math.min(chargeCeiling,current.volts+(firm?.72:.31)),pressUntil:now+375,checkedAt:now,message:'Charge captured on the storage capacitor'};
    });
  }
  function tap(tag:Tag){
    const now=performance.now();
    setState(previous=>{
      const current=tick(previous,now);
      if(current.loadUntil)return current;
      return {...current,tag,tagUntil:now+700,armedUntil:tag==='A'?now+accessWindowMs:0,checkedAt:now,denied:tag==='B',
        message:tag==='A'?'Tag A accepted · Load test available for eight seconds':'Tag B denied · Load disabled'};
    });
  }
  function testLoad(){
    const now=performance.now();
    setState(previous=>{
      const current=tick(previous,now);
      if(current.loadUntil)return current;
      if(!current.armedUntil)return {...current,message:'Load refused · Tap Tag A first'};
      if(current.volts<loadMinimumVolts)return {...current,message:'Load refused · Charge is below 2.45 V'};
      return {...current,armedUntil:0,loadUntil:now+loadWindowMs,checkedAt:now,message:'Load pulse active · Energy goes to the red LED'};
    });
  }
  const energy=.5*storageCapacitance*state.volts**2*1e6;
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D piezo tile and RFID energy bench">
        <Canvas camera={{position:[2.8,4.3,6.7],fov:43}} dpr={[1,1.6]} fallback={<p>Watch the voltage and energy readings as you run the trial.</p>}>
          <Bench press={!!state.pressUntil} tag={state.tagUntil?state.tag:null} load={!!state.loadUntil} armed={!!state.armedUntil} denied={state.denied} {...{selected,select}}/>
          <OrbitControls target={[0,.27,.10]} minDistance={3.5} maxDistance={14} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Harvester readings">
        <div><span>Storage voltage</span><strong>{state.volts.toFixed(2)} V</strong></div>
        <div><span>Stored energy</span><strong>{energy.toFixed(0)} µJ</strong></div>
        <div><span>Test load</span><strong>{state.loadUntil?'On':state.armedUntil?'Authorized':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Collect charge and test the load</h3>
      <p>Press the tile several times. Tap the enrolled Tag A, then connect the test load once you have at least 2.45 V. Tag B lets you test a denied request.</p>
      <div className="gp-steps" role="group" aria-label="Tile press strength">
        <button type="button" aria-pressed={firm} onClick={()=>setFirm(true)}>Firm press</button>
        <button type="button" aria-pressed={!firm} onClick={()=>setFirm(false)}>Light press</button>
      </div>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={!!state.pressUntil||!!state.loadUntil} onClick={press}>Press tile</button>
        <button type="button" disabled={!!state.loadUntil} onClick={()=>tap('A')}>Tap Tag A</button>
        <button type="button" disabled={!!state.loadUntil} onClick={()=>tap('B')}>Tap Tag B</button>
        <button type="button" className="gp-button gp-secondary" disabled={!!state.loadUntil} onClick={testLoad}>Test load</button>
        <button type="button" onClick={()=>setState(initial)}>Reset bench</button>
      </div>
      <p role="status" className="gp-demo-description">{state.message}</p>
      <p>Press gains are illustrative. Stored energy uses ½ × capacitance × voltage² for the 22 µF capacitor.</p>
      <ol className="gp-demo-labels">{parts.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{parts[selected][1]}</p>
    </div>
  </div>;
}
