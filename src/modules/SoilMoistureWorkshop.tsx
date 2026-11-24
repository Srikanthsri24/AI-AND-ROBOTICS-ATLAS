import {useEffect,useLayoutEffect,useMemo,useRef,useState} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {ContactShadows,Grid,OrbitControls} from '@react-three/drei';
import {CanvasTexture,Group,InstancedMesh,MathUtils,Object3D,Shape} from 'three';
import {ChevronLeft,ChevronRight,Layers,Play,RotateCcw} from 'lucide-react';
import {Mount,Uno,Wire} from './RoverWorkshopModel';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';
import {soilWorkshopReading} from '../data/soil-workshop';
import '../styles/rover-workshop.css';
import '../styles/soil-moisture-workshop.css';

type Point=[number,number,number];
type Part='cups'|'soil'|'blade'|'electronics'|'uno'|'wires'|'resistor'|'led';
const parts:{id:Part;name:string;purpose:string;connection:string}[]=[
 {id:'cups',name:'Three calibration cups',purpose:'Dry and damp references establish the scale. The third cup holds a separate test sample.',connection:'Use the same soil, packing and insertion depth in each cup. Keep the upper probe electronics above the soil.'},
 {id:'soil',name:'Soil and insertion mark',purpose:'The surrounding soil changes the probe’s capacitance. Different depths or packing can change the reading.',connection:'The coated sensing blade enters the sample. Match the marked depth before capturing either reference.'},
 {id:'blade',name:'Coated capacitive blade',purpose:'A conductive pattern beneath the coating senses changes around the blade without bare electrodes in the soil.',connection:'The sensing pattern connects to the small oscillator and analog circuit on the upper PCB.'},
 {id:'electronics',name:'Probe analog electronics',purpose:'The upper circuit converts the sensing response into an analog output voltage.',connection:'VCC → Uno 5 V. GND → Uno GND. AOUT → Uno A0. Keep this upper section dry.'},
 {id:'uno',name:'Arduino Uno · A0',purpose:'Averages the analog reading and scales it between the saved dry and damp endpoints.',connection:'A0 receives AOUT. D8 drives the dry indicator through a 330 Ω resistor. USB powers the Uno.'},
 {id:'wires',name:'Supply, ground and signal',purpose:'The three probe leads carry power and the analog measurement.',connection:'Red → 5 V. Black → GND. Yellow → A0. The LED cathode returns to the same ground.'},
 {id:'resistor',name:'330 Ω series resistor',purpose:'Limits current through the LED when D8 is HIGH.',connection:'Uno D8 → resistor → LED anode. The resistor and LED form one series path.'},
 {id:'led',name:'Dry-soil indicator LED',purpose:'Lights when a valid calibrated reading is below 50%. Invalid or incomplete calibration keeps it off.',connection:'Anode → series resistor. Cathode → GND. This is a relative dryness threshold for these calibration samples.'},
];
const positions=[-1.45,0,1.45];
const cups=['Dry reference','Damp reference','Test sample'];
const steps:{title:string;part:Part;instruction:string;check:string}[]=[
 {title:'Cups',part:'cups',instruction:'Label three cups and fill them to the same level with the same soil. Keep the test sample separate from the references.',check:'The cups match and have space above the soil for the probe electronics.'},
 {title:'Probe',part:'blade',instruction:'Inspect the coated sensing blade and the upper circuit. Mark one insertion depth on the blade before measuring.',check:'The insertion mark stays below the upper components.'},
 {title:'Controller',part:'uno',instruction:'Mount the Uno on an insulated base above the work surface. Leave power disconnected during wiring.',check:'The USB socket and analog header remain accessible.'},
 {title:'Wiring',part:'wires',instruction:'Connect probe VCC to 5 V, GND to ground, and AOUT to A0. Route the wires above the samples.',check:'Each of the three leads reaches the correct connection.'},
 {title:'LED',part:'resistor',instruction:'Connect D8 through a 330 Ω resistor to the LED anode. Connect its cathode to ground.',check:'The resistor is in series with the LED.'},
 {title:'Dry',part:'soil',instruction:'Place the probe at the marked depth in the dry reference. Wait for motion to finish and save the stable raw reading.',check:'A dry reference is saved at the current insertion depth.'},
 {title:'Damp',part:'soil',instruction:'Lift and clean the blade, then place it at the same depth in the damp reference. Save that raw reading.',check:'The two references differ by at least 20 ADC counts.'},
 {title:'Test',part:'led',instruction:'Move to the separate test sample. Change its moisture and watch the relative score, D8 state and actual LED.',check:'Below 50% lights the LED. At or above 50% turns it off.'},
];
function SoilGrains({wet,selected=false}:{wet:number;selected?:boolean}){
 const ref=useRef<InstancedMesh>(null);
 useLayoutEffect(()=>{
  const particle=new Object3D();
  for(let i=0;i<180;i++){
   const theta=i*2.39996323,radius=.435*Math.sqrt((i+.4)/180);
   const size=.010+(i%5)*.003;
   particle.position.set(Math.cos(theta)*radius,.65+(i%3)*.002,Math.sin(theta)*radius);
   particle.rotation.set(i*.31,i*.73,i*.13);particle.scale.set(size,size*.65,size*1.12);particle.updateMatrix();ref.current!.setMatrixAt(i,particle.matrix);
  }
  ref.current!.instanceMatrix.needsUpdate=true;
 },[]);
 return <instancedMesh ref={ref} args={[undefined,undefined,180]} castShadow receiveShadow><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color={selected?'#b68ad5':wet>50?'#5a4030':'#9c7c51'} roughness={wet>50?.79:.98}/></instancedMesh>;
}
function Cup({wet,selected,soilSelected,index,onSoil}:{wet:number;selected:boolean;soilSelected:boolean;index:number;onSoil:(event:{stopPropagation:()=>void})=>void}){
 return <>
  <mesh position={[0,.38,0]} castShadow receiveShadow><cylinderGeometry args={[.51,.38,.73,48,1,true]}/><meshPhysicalMaterial color={selected?'#c9b2e5':'#d4e0e5'} transparent opacity={selected?.34:.16} roughness={.12} metalness={.02} side={2} depthWrite={false}/></mesh>
  <mesh position={[0,.025,0]}><cylinderGeometry args={[.385,.385,.045,48]}/><meshStandardMaterial color='#bac6cc' roughness={.25}/></mesh>
  <mesh position={[0,.36,0]} castShadow receiveShadow userData={{partId:'soil'}} onClick={onSoil}><cylinderGeometry args={[.455,.375,.58,48]}/><meshStandardMaterial color={soilSelected?'#9a75b8':wet>50?'#50392c':'#856542'} roughness={wet>50?.84:.99}/></mesh>
  <mesh rotation={[Math.PI/2,0,0]} position={[0,.751,0]}><torusGeometry args={[.504,.022,10,48]}/><meshStandardMaterial color='#c0cdd2' metalness={.25} roughness={.28}/></mesh>
  <group userData={{partId:'soil'}} onClick={onSoil}><SoilGrains wet={wet} selected={soilSelected}/></group>
  <Box at={[0,.28,.465]} size={[.33,.16,.012]} color={selected?'#c4a5e8':'#f0e8d4'}/>
  <WorldLabel position={[0,.34,.58]} className='sw-cup-label'><span>{index===0?'DRY':index===1?'DAMP':'TEST'}</span></WorldLabel>
 </>;
}
function Probe({selected,depth}:{selected:boolean;depth:number}){
 const shape=useMemo(()=>{const s=new Shape();s.moveTo(0,0);s.lineTo(-.13,.14);s.lineTo(-.13,1.10);s.quadraticCurveTo(-.13,1.14,-.09,1.14);s.lineTo(.09,1.14);s.quadraticCurveTo(.13,1.14,.13,1.10);s.lineTo(.13,.14);s.closePath();return s;},[]);
 const print=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=256;canvas.height=1024;
  const context=canvas.getContext('2d')!;context.fillStyle='#273e40';context.fillRect(0,0,256,1024);
  context.strokeStyle='#9b9b5f';context.lineWidth=3;
  for(let n=0;n<7;n++){context.strokeRect(24+n*12,280+n*17,208-n*24,650-n*34);}
  context.fillStyle='#d7ddc7';context.font='bold 19px Arial';context.fillText('CAPACITIVE',52,65);context.font='16px Arial';context.fillText('AOUT  GND  VCC',20,114);
  return new CanvasTexture(canvas);
 },[]);
 useEffect(()=>()=>print.dispose(),[print]);
 return <>
  <mesh castShadow><extrudeGeometry args={[shape,{depth:.047,bevelEnabled:true,bevelSize:.008,bevelThickness:.006,bevelSegments:2,steps:1}]}/><meshStandardMaterial color={selected?'#aa79d7':'#283d3f'} roughness={.48}/></mesh>
  <mesh position={[0,.61,.055]}><planeGeometry args={[.235,.99]}/><meshStandardMaterial map={print} roughness={.65}/></mesh>
  <Box at={[0,.84,.073]} size={[.115,.12,.045]} color='#222a2e'/>
  {[-.083,.083].map(x=><Box key={x} at={[x,.91,.067]} size={[.035,.035,.023]} color='#b7a983' metal={.4}/>)}
  <Box at={[0,1.09,.077]} size={[.20,.09,.09]} color='#d7d6c5'/>
  {[-.064,0,.064].map(x=><Box key={x} at={[x,1.11,.127]} size={[.026,.04,.017]} color='#716c59' metal={.8}/>)}
  <Box at={[0,.38*depth/60,.067]} size={[.27,.012,.009]} color='#e0c370'/>
 </>;
}
function SoilScene({step,sample,wet,depth,selected,select,lit,onSettled,explode,onAssembly,focus,overview}:{step:number;sample:number;wet:number;depth:number;selected:Part;select:(part:Part)=>void;lit:boolean;onSettled:(settled:boolean)=>void;explode:boolean;onAssembly:(busy:boolean)=>void;focus:number;overview:number}){
 const {scene,camera,size}=useThree();const orbit=useRef<any>(null),assembly=useRef<boolean|null>(null);const [movingAnchor,setMovingAnchor]=useState<Point>([-1.45,1.05,-.55]);
 useEffect(()=>{assembly.current=null;},[step]);
 useEffect(()=>{if(!orbit.current)return;camera.position.set(...(size.width<500?[4.4,5.4,10] as Point:[3,3.6,6.4] as Point));orbit.current.target.set(0,.68,.2);orbit.current.update();},[size.width,overview,camera]);
 useEffect(()=>{if(!focus||!orbit.current)return;const at:Point=selected==='blade'||selected==='electronics'?[positions[sample],.65-.38*depth/60+(selected==='electronics'?.86:.6),-.48]:selected==='uno'?[-.9,.24,1.03]:selected==='led'?[1.48,.37,1.04]:selected==='resistor'?[.99,.18,1.01]:[positions[sample],.65,-.55];camera.position.set(at[0]+.5,at[1]+1.15,at[2]+2.1);orbit.current.target.set(...at);orbit.current.update();},[focus,camera]);
 const probe=useRef<Group>(null),probeTarget=useRef({sample:0,depth:60,phase:'insert' as 'lift'|'travel'|'insert'});
 const settled=useRef(false);
 const [lead,setLead]=useState<Point>([-1.45,2.16,-.423]);
 const lastLead=useRef(0);
 useEffect(()=>{probeTarget.current={sample,depth,phase:'lift'};settled.current=false;onSettled(false);},[sample,depth,explode,onSettled,step]);
 useFrame((_,delta)=>{
  const busy=scene.getObjectsByProperty('name','workshop-mount').some(o=>o.position.length()>1e-6);if(busy!==assembly.current){assembly.current=busy;onAssembly(busy);}
  if(!probe.current||step<1)return;
  const goal=probeTarget.current;
  const destination=positions[goal.sample];
  if(goal.phase==='lift'){
   probe.current.position.y=MathUtils.damp(probe.current.position.y,1.05,7,delta);
   if(probe.current.position.y>1.025)goal.phase='travel';
  }else if(goal.phase==='travel'){
   probe.current.position.x=MathUtils.damp(probe.current.position.x,destination,6,delta);
   if(Math.abs(probe.current.position.x-destination)<.012){probe.current.position.x=destination;goal.phase='insert';}
  }else{
   const y=.65-.38*goal.depth/60+(explode?.38:0);
   probe.current.position.y=MathUtils.damp(probe.current.position.y,y,8,delta);
   if(Math.abs(probe.current.position.y-y)<.008&&!settled.current){settled.current=true;onSettled(true);}
  }
  lastLead.current+=delta;
  const next:Point=[probe.current.position.x,probe.current.position.y+1.11,-.423];
  if(lastLead.current>.065&&next.some((value,index)=>Math.abs(value-lead[index])>.002)){lastLead.current=0;setLead(next);setMovingAnchor([probe.current.position.x,probe.current.position.y,-.55]);}
 });
 const choose=(part:Part)=>(event:{stopPropagation:()=>void})=>{event.stopPropagation();select(part);};
 const anchored:Record<Part,Point>={cups:[positions[sample],.28,-.079],soil:[positions[sample],.65,-.55],blade:[movingAnchor[0],movingAnchor[1]+.6,-.495],electronics:[movingAnchor[0],movingAnchor[1]+.86,-.427],uno:[-.90,.185,1.03],wires:lead,resistor:[.99,.225,1.01],led:[1.48,.43,1.04]};
 return <>
  {positions.map((x,index)=><Mount key={x} from={[0,.3,0]} delay={index*.1}><group position={[x,0,-.55]} userData={{partId:'cups'}} onClick={choose('cups')}><Cup index={index} onSoil={choose('soil')} soilSelected={selected==='soil'&&sample===index} wet={index===0?0:index===1?100:wet} selected={(selected==='cups'||selected==='soil')&&sample===index}/></group></Mount>)}
  {step>=1&&<group name="soil-workshop-probe" ref={probe} position={[positions[0],1.05,-.55]}><group userData={{partId:'blade'}} onClick={choose('blade')}><Probe depth={depth} selected={selected==='blade'||selected==='electronics'}/></group><group userData={{partId:'electronics'}} onClick={choose('electronics')}><Box at={[0,.86,.10]} size={[.115,.12,.046]} color={selected==='electronics'?'#c18be8':'#242e34'}/></group></group>}
  {step>=2&&<Mount from={[0,.8,0]}><group name='soil-uno' position={[-.90,.16,1.03]} userData={{partId:'uno'}} onClick={choose('uno')}><Uno active={selected==='uno'}/>{[-.28,.28].flatMap(x=>[-.41,.41].map(z=><Box key={`${x},${z}`} at={[x,-.084,z]} size={[.065,.123,.065]} color='#d0c3a2' metal={.4}/>))}</group></Mount>}
  {step>=3&&<group userData={{partId:'wires'}} onClick={choose('wires')}>
   <Wire points={[[-1.09,.25,.415],[-1.6,.19,.2],[-2.6,.07,.8]] as Point[]} color='#496b95' width={6}/>
   <Wire points={[[lead[0]-.064,lead[1],lead[2]],[lead[0]+.16,lead[1]+.24,-.2],[-.30,.48,.55],[-.59,.3025,1.34]]} color={selected==='wires'?'#bb83eb':'#d9aa43'}/>
   <Wire points={[[lead[0]+.064,lead[1],lead[2]],[lead[0]+.06,lead[1]+.22,-.1],[-.45,.38,.65],[-.59,.3025,.927]]} color={selected==='wires'?'#bb83eb':'#bc5346'}/>
   <Wire points={[[lead[0],lead[1],lead[2]],[lead[0]+.24,lead[1]+.20,-.1],[-.30,.31,.68],[-.59,.3025,1.045]]} color={selected==='wires'?'#bb83eb':'#303942'}/>
  </group>}
  {step>=4&&<Mount from={[.6,.2,0]}>
   <Box at={[1.22,.07,1.02]} size={[1.03,.11,.53]} color='#e9e5d9'/>
   {Array.from({length:15},(_,col)=>Array.from({length:5},(_,row)=><mesh key={`${col}-${row}`} position={[.77+col*.064,.126,.83+row*.085]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.013,8]}/><meshStandardMaterial color='#536071'/></mesh>))}
   <group userData={{partId:'resistor'}} onClick={choose('resistor')} position={[.99,.18,1.01]} rotation={[0,0,Math.PI/2]}>
    <mesh castShadow><cylinderGeometry args={[.045,.045,.24,20]}/><meshStandardMaterial color={selected==='resistor'?'#b98add':'#d4bd8e'} roughness={.7}/></mesh>
    {['#dc7939','#dc7939','#76513b','#bf9d55'].map((color,index)=><mesh key={index} position={[0,(index-1.5)*.046,0]}><cylinderGeometry args={[.046,.046,.018,20]}/><meshStandardMaterial color={color}/></mesh>)}
   </group>
   <group userData={{partId:'led'}} onClick={choose('led')}>
    {[-.034,.034].map(x=><Box key={x} at={[1.48+x,.23,1.04]} size={[.012,.24,.012]} color='#b6bdc0' metal={.8}/>)}
    <mesh name='soil-dry-led' position={[1.48,.37,1.04]} castShadow><capsuleGeometry args={[.063,.06,5,20]}/><meshPhysicalMaterial color={lit?'#ff5545':'#8d342e'} emissive={lit?'#f54325':'#000'} emissiveIntensity={lit?2.8:0} roughness={.18} clearcoat={1}/></mesh>
    {selected==='led'&&<mesh position={[1.48,.293,1.04]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.08,.012,10,28]}/><meshStandardMaterial color='#b58ae5'/></mesh>}
    {lit&&<pointLight position={[1.48,.43,1.04]} intensity={.22} color='#f45231' distance={.55}/>}
   </group>
   <Wire points={[[-1.21,.3025,1.222],[.28,.13,.81],[.79,.16,1.01],[.87,.18,1.01]]} color={selected==='wires'?'#bb83eb':'#dc9c48'} width={2.2}/>
   <Wire points={[[1.11,.18,1.01],[1.28,.17,1.02],[1.44,.18,1.04]]} color='#aeb8bf' width={1.5}/>
   <Wire points={[[1.52,.16,1.04],[1.65,.13,1.26],[.15,.13,1.42],[-.59,.3025,1.163]]} color={selected==='wires'?'#bb83eb':'#303942'} width={2.2}/>
  </Mount>}
  {!assembly.current&&<WorldLabel keepInView avoidOverlap position={anchored[selected]} className='rw-label-anchor'><span className='rw-world-label'>{parts.find(part=>part.id===selected)?.name}<small>{selected==='electronics'?'VCC · GND · AOUT':selected==='led'?'D8 → 330 Ω → anode':selected==='blade'?`Insertion mark · ${depth} mm`:'Select to inspect the actual component'}</small></span></WorldLabel>}
 {!assembly.current&&step>=3&&selected==='wires'&&<>{[["AOUT → A0",[-.59,.263,1.34]],["VCC → 5 V",[-.59,.263,.927]],["GND · common",[-.59,.263,1.045]]].map(([name,at])=><WorldLabel key={String(name)} keepInView avoidOverlap position={at as Point} className='rw-label-anchor'><span className='rw-world-label sw-pin-label'>{String(name)}</span></WorldLabel>)}</>}
 <OrbitControls ref={orbit} target={[0,.68,.2]} enablePan={false} minDistance={1.5} maxDistance={14} maxPolarAngle={Math.PI/2-.05}/>
 </>;
}
export default function SoilMoistureWorkshop(){
 const [step,setStep]=useState(0),[selected,select]=useState<Part>('cups');
 const [sample,setSample]=useState(0),[wet,setWet]=useState(30),[depth,setDepth]=useState(60);
 const [settled,setSettled]=useState(false),[replay,setReplay]=useState(0),[explode,setExplode]=useState(false);
 const [dry,setDry]=useState<{raw:number;depth:number}|null>(null),[damp,setDamp]=useState<{raw:number;depth:number}|null>(null);
 const [assembling,setAssembling]=useState(true),[focus,setFocus]=useState(0),[overview,setOverview]=useState(0);
 const [lesson,setLesson]=useState<number|null>(null),[observations,setObservations]=useState<string[]>([]);
 const [demo,setDemo]=useState(false),[message,setMessage]=useState('Prepare the matching cups before wiring.');
 const live=sample===0?790:sample===1?400:790-Math.round(390*wet/100);
 const raw=Math.round(900-(900-live)*depth/60);
 const separation=dry&&damp?Math.abs(dry.raw-damp.raw):0;
 const valid=dry!==null&&damp!==null&&separation>=20;
 const sameDepth=dry?.depth===depth&&damp?.depth===depth;
 const score=soilWorkshopReading(raw,dry,damp,depth);
 const lit=step>=4&&!assembling&&settled&&!explode&&score!==null&&score<50;
 const operating=step>=5;
 const part=parts.find(item=>item.id===selected)!;
 const available=parts.filter(item=>({cups:0,soil:0,blade:1,electronics:1,uno:2,wires:3,resistor:4,led:4})[item.id]<=step);
 function stage(index:number){setLesson(null);if(index===step)setReplay(v=>v+1);setAssembling(true);setSettled(false);setDemo(false);setStep(index);select(steps[index].part);if(index===5)setSample(0);if(index===6)setSample(1);if(index===7)setSample(2);}
 function capture(kind:'dry'|'damp'){
  if(!settled||assembling||explode||(kind==='dry'?sample!==0:sample!==1))return;
  const entry={raw,depth};
  if(kind==='dry')setDry(entry);else setDamp(entry);
  setMessage(`${kind==='dry'?'Dry':'Damp'} reference saved: ${raw} counts at ${depth} mm.`);
 }
 function reset(){setLesson(null);setObservations([]);setDemo(false);setDry(null);setDamp(null);setWet(30);setSample(0);setDepth(60);setExplode(false);setMessage('References cleared. Capture dry and damp readings.');}
 useEffect(()=>{
  if(!demo)return;
  let direction=1;let last=performance.now();
  const timer=window.setInterval(()=>{const now=performance.now(),dt=Math.min((now-last)/1000,.2);last=now;setWet(value=>{const next=value+direction*18*dt;if(next>=80){direction=-1;return 80;}if(next<=20){direction=1;return 20;}return next;});},50);
  return ()=>window.clearInterval(timer);
 },[demo]);
 const lessonText=[
  '1 / 5 · Lower the blade into dry soil at the 60 mm mark.',
  '2 / 5 · Lift, travel and insert into the damp reference at the same depth.',
  '3 / 5 · Test dry soil: follow AOUT → A0 → D8 → resistor → red LED.',
  '4 / 5 · Test damp soil: the relative reading rises and D8 switches off.',
  '5 / 5 · Complete. Compare both observed LED states, then try your own sample.',
 ];
 function startLesson(){
  setDemo(false);setDry(null);setDamp(null);setObservations([]);setExplode(false);
  setAssembling(true);setSettled(false);setStep(7);setReplay(v=>v+1);
  setDepth(60);setSample(0);setWet(20);select('blade');setLesson(0);
  setMessage('Guided demonstration started. Watch the blade lift before crossing between cups.');
 }
 useEffect(()=>{
  if(lesson===null||lesson===4||assembling||!settled||explode)return;
  // Each observation waits for the actual probe and assembly to settle.
  // Effects cancel pending captures when a student stops or changes stages.
  const timer=window.setTimeout(()=>{
   if(lesson===0){setDry({raw,depth});setObservations(rows=>[...rows,`Dry reference · ${raw} ADC counts · ${depth} mm`]);setSettled(false);setSample(1);select('blade');setLesson(1);}
   if(lesson===1){setDamp({raw,depth});setObservations(rows=>[...rows,`Damp reference · ${raw} ADC counts · ${depth} mm`]);setSettled(false);setSample(2);setWet(20);select('led');setLesson(2);}
   if(lesson===2&&score!==null&&lit){setObservations(rows=>[...rows,`Dry test · ${score}% relative · D8 HIGH · red LED ON`]);setWet(80);setLesson(3);}
   if(lesson===3&&score!==null&&!lit){setObservations(rows=>[...rows,`Damp test · ${score}% relative · D8 LOW · red LED OFF`]);setLesson(4);setMessage('Both LED states observed. The LED warns about dryness; it is not a blinking timer.');}
  },lesson<2?1800:3200);
  return ()=>window.clearTimeout(timer);
 },[lesson,assembling,settled,explode,raw,depth,score,lit]);
 const lessonRunning=lesson!==null&&lesson<4;
 const status=assembling?'Assembling · wait for the components to settle.':explode?'Probe lifted · lower it to the insertion mark before measuring.':!settled?'Probe moving · wait for the blade to reach its marked depth.':!dry||!damp?'Capture both references to calculate a relative moisture score.':!valid?'References are too similar. Capture dry and damp samples at least 20 counts apart.':!sameDepth?'Insertion depth changed. Recapture both references at this depth.':lit?'Below 50% · D8 HIGH · dry LED on.':'At or above 50% · D8 LOW · dry LED off.';
 return <div className='rw-workshop sw-workshop'>
  <div className='rw-heading'><div><p className='rw-eyebrow'>Capacitive sensing workshop</p><h3>Calibrate the probe. Read the soil.</h3><p>Build the circuit, capture two references, then test a separate sample and follow the LED response.</p></div><span className='rw-chip'>SEN0193 · Arduino Uno · A0 / D8</span></div>
  <section className='sw-lesson' aria-label='Guided calibration demonstration'>
   <div><p className='rw-eyebrow'>Watch → understand → try</p><h4>From dry soil to a visible warning</h4><p>{lesson===null?'Follow a complete dry / damp calibration and see the real 3D LED respond to each test sample.':lessonText[lesson]}</p></div>
   <button type='button' className='rw-primary' onClick={lessonRunning?()=>{setLesson(null);setMessage('Guided demonstration stopped. Saved references remain available for manual testing.');}:startLesson}>{lessonRunning?'Stop guided demo':lesson===4?'Replay guided demo':'Start guided demo'}</button>
   {observations.length>0&&<ol aria-label='Observed calibration results'>{observations.map(row=><li key={row}>{row}</li>)}</ol>}
  </section>
  <div className='rw-layout'>
   <div className='rw-view'>
    <div className='rw-view-top'><span><i/>{operating?'Calibration bench':'Circuit assembly bench'}</span><div><button type='button' onClick={()=>{setLesson(null);setDemo(false);setAssembling(true);setSettled(false);setReplay(value=>value+1);}}><RotateCcw size={15}/>Replay assembly</button>{step>=1&&<button type='button' aria-pressed={explode} onClick={()=>{setLesson(null);setSettled(false);setExplode(!explode);}}><Layers size={15}/>{explode?'Assembled':'Lift probe'}</button>}</div></div>
    <div className='sw-view-tools'><button type='button' onClick={()=>setFocus(v=>v+1)}>Focus selected part</button><button type='button' onClick={()=>setOverview(v=>v+1)}>Show whole bench</button><span>Click a component to trace its role and connections.</span></div>
    <div className='rw-canvas' role='region' aria-label='Soil moisture 3D workshop'>
     <Canvas shadows dpr={[1,1.6]} camera={{position:[3,3.6,6.4],fov:40}} fallback={<p>WebGL is required to view the calibration bench.</p>}>
      <color attach='background' args={['#eef0f8']}/><hemisphereLight args={['#fff3e1','#7b8197',2.1]}/><directionalLight position={[-3,7,5]} intensity={2.9} color='#fff0dc' castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5}/>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.025,0]} receiveShadow><planeGeometry args={[40,40]}/><meshStandardMaterial color='#e6e8ef' roughness={.85}/></mesh>
      <Box at={[0,-.09,0]} size={[5.25,.18,3.75]} color='#5b4278'/>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,.001,0]} receiveShadow><planeGeometry args={[5,3.5]}/><meshStandardMaterial color='#697489' roughness={.8}/></mesh><Grid args={[5,3.5]} position={[0,.005,0]} cellSize={.2} sectionSize={1} cellColor='#9eabc0' sectionColor='#c0cbd9' cellThickness={.4} sectionThickness={.7} fadeDistance={12}/>
      <SoilScene key={replay} {...{step,sample,wet,depth,selected,select,lit,explode,focus,overview}} onAssembly={setAssembling} onSettled={setSettled}/><ContactShadows position={[0,.009,0]} opacity={.28} scale={5.2} far={2} resolution={256} frames={1}/>
     </Canvas>
    </div>
    <div className='rw-view-footer'><span>Drag to orbit · Select the probe, cup or circuit part</span><span>{step+1} / {steps.length}</span></div>
    <nav className='rw-build-strip' aria-label='Soil workshop assembly stages'>{steps.map((item,index)=><button type='button' key={item.title} aria-current={step===index?'step':undefined} onClick={()=>stage(index)}><span>{String(index+1).padStart(2,'0')}</span>{item.title}</button>)}</nav>
   </div>
   <aside className='rw-panel'>
    <div className='rw-panel-title'><span>{step+1}</span><div><p className='rw-eyebrow'>{operating?'Calibrate & compare':'Assemble & inspect'}</p><h4>{operating?'Measure at the marked depth':steps[step].title}</h4></div></div><p>{steps[step].instruction}</p>
    {operating&&<>
     <div className='sw-readings' aria-label='Soil workshop readings'><div><span>Raw A0</span><strong>{settled&&!explode?raw:'—'}</strong></div><div><span>Relative score</span><strong>{settled&&!explode&&score!==null?score+'%':'—'}</strong></div><div><span>Dry LED</span><strong>{lit?'On':'Off'}</strong></div></div>
     <div className='rw-part-list' role='group' aria-label='Choose probe cup'>{cups.map((name,index)=><button type='button' key={name} aria-pressed={sample===index} onClick={()=>{setLesson(null);if(sample!==index)setSettled(false);setDemo(false);setSample(index);select('blade');}}>{name}</button>)}</div>
     <div className='rw-run'><button type='button' className='rw-primary' disabled={!settled||assembling||explode||sample!==0} onClick={()=>{setLesson(null);capture('dry');}}>Save dry</button><button type='button' className='rw-primary' disabled={!settled||assembling||explode||sample!==1} onClick={()=>{setLesson(null);capture('damp');}}>Save damp</button></div>
     <p className='sw-references'>Dry <strong>{dry?.raw??'—'}</strong> · Damp <strong>{damp?.raw??'—'}</strong> · separation <strong>{separation}</strong></p>
     <label className='rw-range'>Test sample moisture <output>{Math.round(wet)}%</output><input aria-label='Test sample moisture' type='range' min='0' max='100' value={wet} onChange={event=>{setLesson(null);if(sample!==2)setSettled(false);setDemo(false);setSample(2);setWet(event.target.valueAsNumber);}}/></label>
     <label className='rw-range'>Insertion depth <output>{depth} mm</output><input aria-label='Probe insertion depth' type='range' min='30' max='60' step='5' value={depth} onChange={event=>{setLesson(null);setSettled(false);setDemo(false);setDepth(event.target.valueAsNumber);}}/></label>
     <div className='rw-run'><button type='button' disabled={!valid||!sameDepth||explode||assembling} className='rw-primary' onClick={()=>{setLesson(null);if(sample!==2)setSettled(false);setSample(2);setDemo(!demo);}}><Play size={15}/>{demo?'Pause sample demo':'Run LED demo'}</button><button type='button' onClick={reset}><RotateCcw size={15}/>Reset</button></div>
     <div className='rw-explain' role='status'><strong>{status}</strong><p>{message}</p></div>
     <p className='sw-scale-note'>Sensor readings and moisture changes are simulated. The percentage is relative to these samples. It does not measure volumetric water content. Probe movement withholds the reading until insertion finishes. The demo gradually wets and dries a simulated sample; the LED is a dry-soil warning, not a timed blink.</p>
    </>}
    <div className='rw-inspect'><p className='rw-eyebrow'>Inspect the actual components</p><div className='rw-part-list' role='group' aria-label='Inspect soil workshop parts'>{available.map(item=><button key={item.id} type='button' aria-pressed={selected===item.id} onClick={()=>select(item.id)}>{item.name}</button>)}</div><h5>{part.name}</h5><p>{part.purpose}</p><div className='rw-connections'><strong>How it connects</strong><p>{part.connection}</p></div></div>
    <div className='rw-check'><p>{steps[step].check}</p></div>
    {step<7&&<div className='rw-step-actions'><button type='button' disabled={step===0} onClick={()=>stage(step-1)}><ChevronLeft size={15}/>Previous</button><button className='rw-primary' type='button' onClick={()=>stage(step+1)}>{step===4?'Start calibration':'Next step'}<ChevronRight size={15}/></button></div>}
   </aside>
  </div>
 </div>;
}
