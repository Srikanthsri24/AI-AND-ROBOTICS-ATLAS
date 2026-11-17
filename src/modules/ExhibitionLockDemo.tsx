import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { MathUtils, Vector3, type Group, type Mesh } from 'three';
import { exhibitCode, keypadKeys, relockDelay } from '../data/exhibition-lock';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Door={digits:string;open:boolean;released:boolean;rejected:boolean;notice:string};
const initial:Door={digits:'',open:false,released:false,rejected:false,notice:'The exhibit door is locked. Enter the public code.'};
const detail=[
 ['Matrix keypad','The Uno scans four rows and three columns to find the key. Use # to submit the public code or * to clear it.'],
 ['Reed contact','The magnet moves with the door. When it lines up with the wired contact, D4 reads LOW and the close timer starts.'],
 ['Sliding bolt','The servo horn moves a rod along a guide. The bolt retracts before the model door moves and extends into the strike after the close delay.'],
 ['Status LEDs','Green means the bolt is retracted. Red marks a rejected code while the bolt stays extended.'],
] as const;

function accept(door:Door,value:string):Door {
 if(value==='*')return {...door,digits:'',rejected:false,notice:'Code cleared.'};
 if(value!=='#')return {...door,digits:(door.digits+value).slice(0,5)};
 if(door.released)return {...door,digits:'',notice:door.notice};
 if(door.digits===exhibitCode)return {...door,digits:'',released:true,rejected:false,notice:'Code accepted. Open the door before the bolt relocks.'};
 return {...door,digits:'',rejected:true,notice:'Code rejected. The bolt remains extended.'};
}
function moveDoor(door:Door):Door{
 if(!door.released)return door;
 return {...door,open:!door.open,notice:door.open?'Door closed. The bolt will extend after three continuous seconds.':'Door open. The bolt stays retracted.'};
}

function Box({at,size,color,metal=0}: {at:Point;size:Point;color:string;metal?:number}){
 return <RoundedBox position={at} args={size} radius={.019} smoothness={2}>
  <meshStandardMaterial color={color} metalness={metal} roughness={.59}/>
 </RoundedBox>;
}

export function MatrixPad({current='',onKey,labels=false}: {current?:string;onKey?:(s:string)=>void;labels?:boolean}){
 return <>
  <Box at={[0,0,0]} size={[.76,1.00,.06]} color="#283947"/>
  <Box at={[0,.402,.041]} size={[.62,.09,.023]} color="#5e8195"/>
  {keypadKeys.map((key,index)=>{
   const x=(index%3-1)*.208,y=.267-Math.floor(index/3)*.185;
   return <group key={key} position={[x,y,.051]} onClick={onKey?event=>{event.stopPropagation();onKey(key);}:undefined}>
    <Box at={[0,0,0]} size={[.170,.144,.027]} color={current===key?'#d2a45e':key==='*'||key==='#'?'#648698':'#778ca0'}/>
    {labels&&<WorldLabel position={[-.041,.043,.018]} className="gp-marker-anchor"><span className="gp-exhibit-keyface">{key}</span></WorldLabel>}
   </group>;
  })}
  <Box at={[0,-.59,-.015]} size={[.243,.209,.023]} color="#a99871"/>
  {Array.from({length:7},(_,i)=><Box key={i} at={[-.098+i*.033,-.683,.0]} size={[.012,.061,.012]} color="#d7c398" metal={.56}/>)}
 </>;
}

export function ReedPair({split=.28}: {split?:number}){
 return <>
  {[-split,split].map((x,index)=><group key={x}>
   <Box at={[x,0,0]} size={[.30,.12,.17]} color={index?'#e2ddd0':'#ece8dc'}/>
   {[-.10,.10].map(dx=><mesh key={dx} position={[x+dx,.064,0]}><cylinderGeometry args={[.025,.025,.014,12]}/><meshStandardMaterial color="#818b91" metalness={.67}/></mesh>)}
  </group>)}
  <Line points={[[-split-.126,.025,.035],[-split-.24,.02,.11],[-split-.36,.01,.12]]} color="#79838a" lineWidth={1.5}/>
 </>;
}

const linkStart=new Vector3(),linkEnd=new Vector3(),linkDirection=new Vector3(),up=new Vector3(0,1,0);
const tour=[{kind:'wrong',delay:700},{kind:'right',delay:1050},{kind:'door',delay:700},{kind:'door',delay:2300}] as const;

function Scene({door,current,press,selected,select}: {door:Door;current:string;press:(s:string)=>void;selected:number;select:(i:number)=>void}){
 const hinge=useRef<Group>(null), slider=useRef<Group>(null), horn=useRef<Group>(null), link=useRef<Mesh>(null);
 useFrame((_,delta)=>{
  if(hinge.current) hinge.current.rotation.y=MathUtils.damp(hinge.current.rotation.y,door.open?-.92:0,8,delta);
  if(slider.current) slider.current.position.x=MathUtils.damp(slider.current.position.x,door.released?1.48:1.14,12,delta);
  if(horn.current) horn.current.rotation.z=MathUtils.damp(horn.current.rotation.z,door.released?-.69:0,12,delta);
  if(slider.current&&horn.current&&link.current){
   linkStart.set(-.26,.08,0).applyEuler(horn.current.rotation).add(horn.current.position);
   linkEnd.copy(slider.current.position).add(linkDirection.set(.183,0,.028));
   link.current.position.copy(linkStart).add(linkEnd).multiplyScalar(.5);
   linkDirection.subVectors(linkEnd,linkStart);
   link.current.scale.y=linkDirection.length();
   link.current.quaternion.setFromUnitVectors(up,linkDirection.normalize());
  }
 });
 const markers=[
  {at:[-1.98,1.03,.65],tag:[-2.30,1.75,.72]},
  {at:[1.04,1.79,-.43],tag:[1.32,2.27,-.29]},
  {at:[1.27,1.02,-.25],tag:[1.87,1.41,-.14]},
  {at:[-1.65,.32,1.43],tag:[-1.20,.80,1.49]},
 ] satisfies {at:Point;tag:Point}[];
 return <>
  <color attach="background" args={['#273e50']}/><ambientLight intensity={1.31}/>
  <directionalLight position={[4,7,5]} intensity={2.57}/><directionalLight position={[-5,4,-3]} color="#b6cce7" intensity={1.36}/>
  <Box at={[0,-.13,0]} size={[6.32,.23,3.79]} color="#927256"/>
  <Box at={[0,.014,0]} size={[6.19,.068,3.65]} color="#617d75"/>
  <Box at={[.02,.136,-.45]} size={[3.10,.173,.69]} color="#977a61"/>
  <Box at={[-1.19,1.06,-.45]} size={[.18,1.89,.25]} color="#a58669"/>
  <Box at={[1.04,1.06,-.45]} size={[.20,1.89,.25]} color="#a58669"/>
  <Box at={[-.077,2.017,-.45]} size={[2.44,.19,.25]} color="#b28e6d"/>
  <group ref={hinge} position={[-1.09,.204,-.445]}>
   <Box at={[1.01,.873,0]} size={[2.02,1.72,.122]} color="#729295"/>
   <Box at={[1.01,.494,.077]} size={[1.65,.62,.038]} color="#5f7d82"/>
   <Box at={[1.01,1.14,.077]} size={[1.65,.49,.038]} color="#89a6a8"/>
   <Box at={[1.88,.82,.101]} size={[.22,.18,.070]} color="#98a7ad" metal={.59}/>
   <Box at={[1.84,1.56,.102]} size={[.178,.092,.16]} color="#e0ded3"/>
   {[-.03,.03].map(x=><Box key={x} at={[1.67+x,.74,.11]} size={[.031,.071,.044]} color="#526169"/>)}
  </group>
  <Box at={[1.03,1.78,-.315]} size={[.19,.091,.164]} color={selected===1?'#d3b576':'#e6e2d6'}/>
  <Line points={[[1.08,1.79,-.32],[1.31,1.83,-.50],[1.43,.26,-.57],[-1.42,.24,.49]]} color="#a98875" lineWidth={1.52}/>
  <Box at={[1.41,.961,-.40]} size={[.619,.361,.21]} color="#7a8281" metal={.45}/>
  <Box at={[1.64,.906,-.228]} size={[.39,.33,.24]} color={selected===2?'#a37a48':'#285677'}/>
  <group ref={horn} position={[1.62,1.01,-.096]}>
   <Box at={[-.13,.08,0]} size={[.341,.071,.082]} color="#d9d5c8"/>
  </group>
  <group ref={slider} position={[1.14,1.02,-.258]}>
   <Box at={[0,0,0]} size={[.55,.072,.073]} color="#c0c8c7" metal={.71}/>
   <Box at={[.183,0,.028]} size={[.064,.066,.071]} color="#8c989c" metal={.52}/>
  </group>
  <mesh ref={link}><cylinderGeometry args={[.017,.017,1,12]}/><meshStandardMaterial color="#aab5b7" metalness={.67}/></mesh>
  <Box at={[1.13,1.02,-.32]} size={[.17,.161,.053]} color="#969e9e" metal={.55}/>
  <Box at={[-1.98,.135,.63]} size={[.94,.145,.68]} color="#9f866c"/>
  <Box at={[-1.98,.63,.57]} size={[.131,.96,.139]} color="#75858c" metal={.49}/>
  <group position={[-1.98,1.05,.66]}><MatrixPad current={current} onKey={press} labels/></group>
  <Box at={[-1.74,.145,1.43]} size={[1.26,.16,.54]} color="#dfdfd3"/>
  {[-1,1].map((side,index)=>{
   const on=index===0?door.rejected&&!door.released:door.released;
   const color=index===0?'#ed473f':'#72e69f';
   return <mesh key={side} position={[-1.74+side*.19,.29,1.45]}><cylinderGeometry args={[.065,.061,.154,21]}/>
    <meshStandardMaterial color={on?color:index===0?'#7e3a36':'#34624a'} emissive={color} emissiveIntensity={on?2.1:0}/>
   </mesh>;
  })}
  <Box at={[.57,.137,1.15]} size={[.99,.08,.57]} color="#247e99"/>
  <Box at={[.19,.212,1.15]} size={[.18,.10,.215]} color="#afb9bb" metal={.65}/>
  <Box at={[.63,.192,1.18]} size={[.24,.044,.133]} color="#303943"/>
  <Box at={[2.08,.153,.76]} size={[.70,.235,.49]} color="#343b43"/>
  <Line points={[[-1.96,.38,.67],[-1.64,.27,.67],[-.96,.26,.84],[.25,.22,1.07]]} color="#d7b67a" lineWidth={1.8}/>
  <Line points={[[.78,.23,1.05],[.61,.28,.71],[1.24,.52,.14],[1.57,.83,-.12]]} color="#d8ac64" lineWidth={1.74}/>
  <Line points={[[1.91,.26,.65],[1.72,.42,.46],[1.68,.79,-.12]]} color="#c87d69" lineWidth={1.7}/>
  {markers.map(({at,tag},index)=><group key={index}>
   <Line points={[at,tag]} color={selected===index?'#ffe297':'#c2d1d5'} lineWidth={1.4}/>
   <WorldLabel position={tag} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={detail[index][0]}
    aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button></WorldLabel>
  </group>)}
  <ContactShadows position={[0,.037,0]} scale={8} opacity={.39} blur={2.4} far={4}/>
 </>;
}

export default function ExhibitionLockDemo(){
 const [door,setDoor]=useState(initial),[selected,setSelected]=useState(0);
 const [current,setCurrent]=useState(''),[tourStep,setTourStep]=useState<number|null>(null);
 const highlight=useRef<number | undefined>(undefined);
 function press(value:string){
  if(tourStep!==null)return;
  setCurrent(value);window.clearTimeout(highlight.current);
  highlight.current=window.setTimeout(()=>setCurrent(''),170);
  setDoor(previous=>accept(previous,value));
 }
 useEffect(()=>()=>window.clearTimeout(highlight.current),[]);
 useEffect(()=>{
  if(!door.released||door.open)return;
  const timer=window.setTimeout(()=>setDoor(previous=>previous.open?previous:{...initial,notice:'Closed for three seconds. The bolt is locked.'}),relockDelay);
  return ()=>window.clearTimeout(timer);
 },[door.released,door.open]);
 useEffect(()=>{
  if(tourStep===null)return;
  const phase=tour[tourStep];
  const timer=window.setTimeout(()=>{
   setDoor(previous=>phase.kind==='door'?moveDoor(previous):accept({...previous,digits:phase.kind==='wrong'?'1111':exhibitCode},'#'));
   setTourStep(tourStep===tour.length-1?null:tourStep+1);
  },phase.delay);
  return ()=>window.clearTimeout(timer);
 },[tourStep]);
 return <div className="gp-split gp-demo">
  <div className="gp-story-stage">
   <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive 3D exhibition door">
    <Canvas dpr={[1,1.5]} camera={{position:[3,3.6,7.5],fov:42}} fallback={<p>The keypad and door controls are available without WebGL.</p>}>
     <Scene door={door} current={current} press={press} selected={selected} select={setSelected}/>
     <OrbitControls target={[0,.85,0]} minDistance={4} maxDistance={14} enablePan={false}/>
    </Canvas>
   </div>
   <div className="gp-demo-result" aria-label="Exhibition door readings">
    <div><span>Entered</span><strong>{door.digits?'•'.repeat(door.digits.length):'—'}</strong></div>
    <div><span>Contact</span><strong>{door.open?'Open · HIGH':'Closed · LOW'}</strong></div>
    <div><span>Bolt</span><strong>{door.released?'Retracted':'Extended'}</strong></div>
   </div>
  </div>
  <div className="gp-guide">
   <h3>Operate the exhibit keypad</h3>
   <p>Try 1111, then use the public code <strong>{exhibitCode}</strong>. Press # to submit. Open the door while the bolt is retracted.</p>
   <div className="gp-piano-pad gp-exhibit-pad" aria-label="Exhibition keypad">
    {keypadKeys.map(value=><button key={value} type="button" disabled={tourStep!==null} aria-label={value==='*'?'Clear code':value==='#'?'Submit code':`Key ${value}`}
     aria-pressed={current===value} onClick={()=>press(value)}><strong>{value}</strong></button>)}
   </div>
   <div className="gp-steps">
    <button className="gp-button" type="button" disabled={!door.released||tourStep!==null} onClick={()=>setDoor(moveDoor)}>{door.open?'Close door':'Open door'}</button>
    <button type="button" onClick={()=>{if(tourStep!==null){setTourStep(null);return;}setDoor(initial);setTourStep(0);}}>{tourStep===null?'Play demonstration':'Stop demonstration'}</button>
   </div>
   <p className="gp-demo-description" role="status">{door.notice}</p>
   <h4>Inspect the door</h4>
   <ol className="gp-demo-labels">{detail.map(([name],index)=><li key={name}>
    <button className="gp-part-label" type="button" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
   </li>)}</ol>
   <p className="gp-demo-description">{detail[selected][1]}</p>
  </div>
 </div>;
}
