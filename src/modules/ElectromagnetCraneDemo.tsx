import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { DoubleSide, MathUtils, type Group, type Mesh } from 'three';
import { coilMaxMs } from '../data/electromagnet-crane';
import { WorldLabel } from './LabWorkbench';

type Point = [number,number,number];
type Station = 'pickup' | 'delivery';
type Crane = { station:Station; low:boolean; power:'off'|'on'|'timeout'; washer:Station|'attached' };
type Command = 'lower'|'raise'|'slide'|'press'|'release'|'timeout';
const initial:Crane={station:'pickup',low:false,power:'off',washer:'pickup'};
const stations={pickup:-1.48,delivery:1.48};
const actions:Command[]=['lower','press','raise','slide','lower','release','raise'];
const measure=(crane:Crane)=>crane.low ? .34 : 1.17;
function change(crane:Crane,command:Command):Crane {
  if(command==='slide'&&crane.low) return crane;
  if(command==='press'&&crane.power!=='off') return crane;
  const next={...crane};
  if(command==='lower') next.low=true;
  if(command==='raise') next.low=false;
  if(command==='slide') next.station=crane.station==='pickup'?'delivery':'pickup';
  if(command==='press') next.power='on';
  if(command==='release'||command==='timeout'){
    next.power=command==='timeout'?'timeout':'off';
    if(crane.washer==='attached') next.washer=crane.station;
  }
  if(next.low&&next.power==='on'&&next.washer===next.station) next.washer='attached';
  return next;
}

function Panel({at,size,color,metal=0}: {at:Point;size:Point;color:string;metal?:number}) {
  return <RoundedBox position={at} args={size} radius={.022} smoothness={2}>
    <meshStandardMaterial color={color} metalness={metal} roughness={.57}/>
  </RoundedBox>;
}

export function CoilModel({selected=false,energized=false}: {selected?:boolean;energized?:boolean}) {
  return <>
    <mesh><cylinderGeometry args={[.238,.24,.27,40]}/><meshStandardMaterial color={selected?'#d3ab65':'#a5acb2'} metalness={.70} roughness={.36}/></mesh>
    <mesh position={[0,-.139,0]}><cylinderGeometry args={[.207,.207,.018,40]}/><meshStandardMaterial color="#383e45" metalness={.52}/></mesh>
    <mesh position={[0,-.153,0]}><cylinderGeometry args={[.092,.092,.021,28]}/>
      <meshStandardMaterial color="#afb7bb" metalness={.71} emissive="#dda558" emissiveIntensity={energized ? .38 : 0}/></mesh>
    <mesh position={[0,.156,0]}><cylinderGeometry args={[.066,.066,.052,18]}/><meshStandardMaterial color="#7c838e" metalness={.64}/></mesh>
  </>;
}

export function WasherModel({selected=false}: {selected?:boolean}) {
  return <mesh rotation={[-Math.PI/2,0,0]}>
    <ringGeometry args={[.075,.208,36]}/>
    <meshStandardMaterial color={selected?'#d0a65c':'#c0c6c9'} side={DoubleSide} metalness={.74} roughness={.34}/>
  </mesh>;
}

export function CoilDriver({selected=false,on=false}: {selected?:boolean;on?:boolean}) {
  return <>
    <Panel at={[0,0,0]} size={[.60,.053,.42]} color={selected?'#af8147':'#262d37'}/>
    <Panel at={[-.196,.065,0]} size={[.16,.125,.235]} color="#e9e5d8"/>
    <Panel at={[.202,.075,0]} size={[.177,.147,.28]} color="#426a79"/>
    <Panel at={[.025,.047,.074]} size={[.115,.040,.094]} color="#20262d"/>
    <Panel at={[.016,.056,-.082]} size={[.21,.045,.066]} color="#242934"/>
    <Panel at={[.074,.081,-.082]} size={[.025,.006,.065]} color="#a6abb1"/>
    <mesh position={[-.045,.052,.147]}><boxGeometry args={[.041,.03,.038]}/>
      <meshStandardMaterial color={on?'#ffe287':'#685837'} emissive="#ffd465" emissiveIntensity={on?1.4:0}/></mesh>
  </>;
}

const inspections=[
  ['Trolley and hoist','Slide the trolley along the crossbar by hand. Pull or feed the cord to raise or lower the coil.'],
  ['Electromagnet','The coil has a steel core. Current creates a magnetic field, drawing the steel washer against the flat face.'],
  ['Steel washer','Use a light, flat steel washer. It stays with the magnet while current flows and drops to the tray when the current stops.'],
  ['MOSFET driver','D9 switches this board. The separate supply carries the coil current, and the onboard diode carries that current briefly after switch-off.'],
  ['Hold button','The button connects D2 to ground. The Uno allows up to eight seconds of current per press. Release before trying again.'],
] as const;

function CraneScene({crane,selected,select}: {crane:Crane;selected:number;select:(index:number)=>void}) {
  const trolley=useRef<Group>(null);
  const magnet=useRef<Group>(null);
  const cord=useRef<Mesh>(null);
  const washer=useRef<Group>(null);
  const targetX=stations[crane.station];
  const targetY=measure(crane);
  const powered=crane.power==='on';

  useFrame((_,delta)=>{
    if(!trolley.current||!magnet.current||!cord.current||!washer.current) return;
    const shift=trolley.current.position;
    const lift=magnet.current.position;
    shift.x=MathUtils.damp(shift.x,targetX,10,delta);
    lift.y=MathUtils.damp(lift.y,targetY,10,delta);
    const length=2.17-lift.y;
    cord.current.position.y=lift.y+length/2;
    cord.current.scale.y=length;
    const load=washer.current.position;
    if(crane.washer==='attached'){
      load.x=shift.x;
      load.y=Math.max(.163,lift.y-.171);
    }else{
      load.x=stations[crane.washer];
      load.y=Math.max(.163,load.y-delta*4.2);
    }
  });

  return <>
    <color attach="background" args={['#263a4a']}/>
    <ambientLight intensity={1.25}/>
    <directionalLight position={[4,7,4]} intensity={2.6}/>
    <directionalLight position={[-5,4,-4]} color="#adc3e1" intensity={1.5}/>
    <Panel at={[0,-.14,0]} size={[6.36,.23,3.60]} color="#8a6850"/>
    <Panel at={[0,.008,0]} size={[6.20,.07,3.47]} color="#58716d"/>
    <Panel at={[0,.096,0]} size={[4.37,.096,.99]} color="#566877"/>
    {[-.51,.51].map(z=><Panel key={z} at={[0,.14,z]} size={[4.46,.133,.077]} color="#91a2a9" metal={.45}/>)}
    {[-1,1].map(side=><group key={side}>
      <Panel at={[side*2.22,.14,0]} size={[.076,.133,.99]} color="#91a2a9" metal={.45}/>
      <Panel at={[side*2.42,.095,0]} size={[.40,.16,1.53]} color="#ae7e53"/>
      <Panel at={[side*2.42,1.21,0]} size={[.225,2.20,.25]} color="#bd8957"/>
      {[-1,1].map(brace=><group key={brace} position={[side*2.42,.54,brace*.38]} rotation={[brace*-.56,0,0]}>
        <Panel at={[0,0,0]} size={[.14,.94,.12]} color="#a9764c"/>
      </group>)}
      {[.26,1.94].map(y=><mesh key={y} position={[side*2.42,y,.131]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[.037,.037,.021,6]}/><meshStandardMaterial color="#9aa3aa" metalness={.64}/>
      </mesh>)}
    </group>)}
    <Panel at={[0,2.29,0]} size={[5.12,.23,.29]} color="#c58f5b"/>
    {(Object.keys(stations) as Station[]).map(name=><group key={name} position={[stations[name],.146,0]}>
      <Panel at={[0,0,0]} size={[.77,.023,.68]} color={name==='pickup'?'#a6854c':'#527e71'}/>
      <WorldLabel position={[0,.04,.64]} className="gp-marker-anchor"><span className="gp-rocket-field-label">{name==='pickup'?'Pickup':'Delivery'}</span></WorldLabel>
    </group>)}
    <group ref={trolley} position={[stations.pickup,0,0]}>
      <Panel at={[0,2.31,0]} size={[.44,.28,.39]} color={selected===0?'#cd9c50':'#54636d'} metal={.53}/>
      <mesh ref={cord} position={[0,1.67,0]}><cylinderGeometry args={[.014,.014,1,10]}/><meshStandardMaterial color="#ddd4bd"/></mesh>
      <group ref={magnet} position={[0,measure(initial),0]}>
        <CoilModel selected={selected===1} energized={powered}/>
        {powered&&[.29,.36].map(r=><mesh key={r} position={[0,-.17,0]} rotation={[-Math.PI/2,0,0]}>
          <ringGeometry args={[r,r+.014,42]}/><meshBasicMaterial color="#ffcc76" transparent opacity={.72}/>
        </mesh>)}
        <Line points={[[0,-.02,.24],[-.38,.26,.38],[-.58,.46,.40]]} color={selected===1?'#ffe096':'#bbcad1'} lineWidth={1.4}/>
        <WorldLabel position={[-.58,.46,.40]} className="gp-marker-anchor">
          <button className="gp-marker" type="button" aria-label="Electromagnet" aria-pressed={selected===1} onClick={()=>select(1)}>2</button>
        </WorldLabel>
      </group>
      <WorldLabel position={[0,2.58,.18]} className="gp-marker-anchor">
        <button className="gp-marker" type="button" aria-label="Trolley and hoist" aria-pressed={selected===0} onClick={()=>select(0)}>1</button>
      </WorldLabel>
    </group>
    <group ref={washer} position={[stations.pickup,.163,0]}>
      <WasherModel selected={selected===2}/>
      <Line points={[[0,.017,.16],[.37,.16,.32],[.54,.26,.48]]} color={selected===2?'#ffe096':'#bbcad1'} lineWidth={1.35}/>
      <WorldLabel position={[.54,.26,.48]} className="gp-marker-anchor">
        <button className="gp-marker" type="button" aria-label="Steel washer" aria-pressed={selected===2} onClick={()=>select(2)}>3</button>
      </WorldLabel>
    </group>
    <Panel at={[.29,.091,1.14]} size={[2.84,.107,.86]} color="#997c64"/>
    <Panel at={[-.47,.199,1.18]} size={[.91,.095,.60]} color="#25889d"/>
    <Panel at={[-.80,.29,1.18]} size={[.203,.088,.235]} color="#b4bfc5" metal={.62}/>
    <Panel at={[-.43,.267,1.25]} size={[.23,.052,.132]} color="#2b343b"/>
    <group position={[.62,.20,1.12]}><CoilDriver on={powered} selected={selected===3}/></group>
    <Panel at={[1.38,.208,1.29]} size={[.33,.09,.37]} color="#383f44"/>
    <mesh position={[1.38,powered ? .259 : .294,1.29]}><cylinderGeometry args={[.094,.097,.085,24]}/>
      <meshStandardMaterial color={selected===4?'#f2ac61':'#b24943'}/></mesh>
    <Line points={[[-.28,.266,.94],[.10,.37,.93],[.48,.26,1.12]]} color={powered?'#ffd680':'#c6a765'} lineWidth={1.8}/>
    <Line points={[[.71,.255,1.04],[1.51,.34,.94],[2.71,.29,.68],[2.66,2.3,.38],[targetX,2.4,.24],[targetX,targetY+.18,.10]]}
      color={powered?'#feaa74':'#833d3d'} lineWidth={1.55}/>
    <Line points={[[.73,.265,1.06],[1.52,.29,1.01],[2.77,.36,.72],[2.72,2.29,.43],[targetX,2.40,.27],[targetX,targetY+.17,.14]]} color="#343d47" lineWidth={1.4}/>
    {([{pos:[.62,.28,1.12],tag:[.58,.80,1.38],index:3},{pos:[1.38,.30,1.29],tag:[2.22,.88,1.55],index:4}] satisfies {pos:Point;tag:Point;index:number}[]).map(({pos,tag,index})=><group key={index}>
      <Line points={[pos,tag]} color={selected===index?'#ffe096':'#bbcad1'} lineWidth={1.35}/>
      <WorldLabel position={tag} className="gp-marker-anchor">
        <button className="gp-marker" type="button" aria-label={inspections[index][0]} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button>
      </WorldLabel>
    </group>)}
    <ContactShadows position={[0,.028,0]} opacity={.42} blur={2.4} scale={8} far={4}/>
  </>;
}

export default function ElectromagnetCraneDemo() {
  const [crane,setCrane]=useState(initial);
  const [run,setRun]=useState<number|null>(null);
  const [selected,setSelected]=useState(1);
  const dispatch=(command:Command)=>setCrane(previous=>change(previous,command));
  useEffect(()=>{
    if(crane.power!=='on') return;
    const timer=window.setTimeout(()=>dispatch('timeout'),coilMaxMs);
    return ()=>window.clearTimeout(timer);
  },[crane.power]);
  useEffect(()=>{
    if(run===null) return;
    const timer=window.setTimeout(()=>{
      dispatch(actions[run]);
      setRun(run===actions.length-1?null:run+1);
    },720);
    return ()=>window.clearTimeout(timer);
  },[run]);
  const status=crane.power==='timeout'
    ? 'The hold timer has cut power. Release the button before energizing the coil again.'
    : crane.washer==='attached'
    ? 'The powered coil holds the washer. Raise and slide the trolley to transfer it.'
    : crane.washer==='delivery'
    ? 'The washer is in the delivery tray. Switch off the coil between lifts.'
    : 'Lower the magnet over the pickup tray and hold the coil button to attach the washer.';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive electromagnet gantry">
        <Canvas dpr={[1,1.5]} camera={{position:[3.9,3.65,7.5],fov:43}} fallback={<p>The controls and readouts are available without WebGL.</p>}>
          <CraneScene crane={crane} selected={selected} select={setSelected}/>
          <OrbitControls target={[0,.78,0]} minDistance={4} maxDistance={14} enablePan={false} maxPolarAngle={Math.PI/2.07}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Crane readings">
        <div><span>Trolley</span><strong>{crane.station==='pickup'?'Pickup':'Delivery'}</strong></div>
        <div><span>Coil</span><strong>{crane.power==='on'?'Energized':crane.power==='timeout'?'Timed out':'Off'}</strong></div>
        <div><span>Washer</span><strong>{crane.washer==='attached'?'Attached':crane.washer==='pickup'?'On pickup tray':'In delivery tray'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Move a steel washer</h3>
      <p>Watch a full transfer, or move the crane by hand. The Hold coil control simulates keeping the physical button down.</p>
      <div className="gp-steps">
        <button className="gp-button" type="button" onClick={()=>{
          if(run!==null){setRun(null);dispatch('release');return;}
          setCrane(initial);setRun(0);
        }}>{run===null?'Play transfer':'Stop transfer'}</button>
        <button type="button" onClick={()=>{setRun(null);setCrane(initial);}}>Reset crane</button>
      </div>
      <div className="gp-steps" aria-label="Manual crane controls">
        <button type="button" disabled={run!==null} onClick={()=>dispatch(crane.low?'raise':'lower')}>{crane.low?'Raise magnet':'Lower magnet'}</button>
        <button type="button" disabled={run!==null||crane.low} onClick={()=>dispatch('slide')}>{crane.station==='pickup'?'Slide to delivery':'Slide to pickup'}</button>
        <button type="button" disabled={run!==null} aria-pressed={crane.power==='on'} onClick={()=>dispatch(crane.power==='off'?'press':'release')}>
          {crane.power==='off'?'Hold coil':'Release coil'}
        </button>
      </div>
      <p role="status" className="gp-demo-description">{status}</p>
      <h4>Inspect the crane</h4>
      <ol className="gp-demo-labels">{inspections.map(([name],index)=><li key={name}>
        <button className="gp-part-label" type="button" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{inspections[selected][1]}</p>
    </div>
  </div>;
}
