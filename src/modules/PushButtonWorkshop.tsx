import {useEffect,useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,Grid,OrbitControls} from '@react-three/drei';
import {Group} from 'three';
import {ChevronLeft,ChevronRight,Layers,Play,RotateCcw} from 'lucide-react';
import {Breadboard} from './RoomClimateWorkshop';
import {Resistor} from './NightLightWorkshop';
import {Mount,Uno,Wire} from './RoverWorkshopModel';
import {SolarMeterSolid as Box} from './SolarMeterParts';
import {WorldLabel} from './LabWorkbench';
import '../styles/rover-workshop.css';
import '../styles/push-button-workshop.css';

type Point=[number,number,number];
type Part='board'|'button'|'contactA'|'contactB'|'uno'|'input'|'ground'|'resistor'|'led';
type Trace={time:number;raw:boolean;stable:boolean};
const parts:{id:Part;name:string;purpose:string;connection:string}[]=[
 {id:'board',name:'Breadboard and center gap',purpose:'Supports the switch while keeping separate contact sides on separate terminal rows.',connection:'Fit the tactile switch across the center gap. Verify its contacts with power disconnected.'},
 {id:'button',name:'Momentary switch and moving cap',purpose:'The cap returns when released. Pressing joins the normally open contact sides.',connection:'One selected side goes to D2. The opposite contact side goes to GND.'},
 {id:'contactA',name:'Contact side A · D2',purpose:'The two pins on this illustrated side are internally joined, even at rest.',connection:'The yellow input jumper connects this side to Uno D2. INPUT_PULLUP holds it HIGH while open.'},
 {id:'contactB',name:'Contact side B · ground',purpose:'The opposite contact side stays separate from side A until the switch closes.',connection:'The dark jumper connects it to GND. Pressing then pulls side A and D2 LOW.'},
 {id:'uno',name:'Arduino Uno · INPUT_PULLUP',purpose:'Accepts a new switch state only after it has remained unchanged for 25 ms.',connection:'D2 is the active-low input. D8 drives the LED after debounce. USB powers the Uno.'},
 {id:'input',name:'Yellow D2 input jumper',purpose:'Carries the raw contact state to the controller.',connection:'D2 → one normally open contact side. The internal pull-up supplies the released HIGH state.'},
 {id:'ground',name:'Shared ground return',purpose:'Completes both the switch circuit and the LED circuit.',connection:'Uno GND → breadboard ground rail → opposite switch contact and LED cathode.'},
 {id:'resistor',name:'330 Ω series resistor',purpose:'Limits the current in the green LED branch.',connection:'Uno D8 → resistor → LED anode. Orange, orange, brown, gold identifies this four-band value.'},
 {id:'led',name:'Green status LED · D8',purpose:'Lights while the accepted input is LOW and turns off after an accepted release.',connection:'Anode → series resistor. Cathode → shared GND. The output follows the debounced state.'},
];
const steps:{title:string;part:Part;text:string;check:string}[]=[
 {title:'Board',part:'board',text:'Find the breadboard center gap. Seat the switch so its contact sides stay on separate connected rows.',check:'No breadboard connection permanently shorts the two contact sides.'},
 {title:'Switch',part:'button',text:'Fit the four-pin tactile switch. Inspect its metal legs, top plate and spring-return cap.',check:'The cap moves freely and returns when released.'},
 {title:'Contacts',part:'contactA',text:'Use the cutaway to identify the contact sides. On a physical switch, use continuity mode to find pins joined only while pressed.',check:'Same-side pins can already be joined. Choose a normally open pair across the sides.'},
 {title:'Controller',part:'uno',text:'Mount the Uno beside the switch. Its internal pull-up will keep D2 HIGH at rest.',check:'The input is wired for an active-low press.'},
 {title:'Input',part:'input',text:'Run D2 to one contact side and GND to the opposite side. Keep USB disconnected while wiring.',check:'A held press creates a D2-to-ground path.'},
 {title:'Indicator',part:'resistor',text:'Connect D8 through 330 Ω to the green LED anode. Connect its cathode to the shared ground rail.',check:'The LED has a series resistor and a ground return.'},
 {title:'Inspect',part:'ground',text:'Trace the input and output separately. The input becomes LOW when pressed, while the output becomes HIGH to light the LED.',check:'The input polarity and output polarity are different.'},
 {title:'Operate',part:'button',text:'Hold and release the switch. Compare raw input, accepted state and LED, then replay contact bounce slowly.',check:'A held press produces one accepted press; release produces one accepted release.'},
];
function TactileSwitch({pressed,cutaway,selected,onSelect,onPress}:{pressed:boolean;cutaway:boolean;selected:Part;onSelect:(part:Part)=>void;onPress:()=>void}){
 const cap=useRef<Group>(null),bridge=useRef<Group>(null);
 useFrame((_,dt)=>{
  if(cap.current)cap.current.position.y+=((pressed?.115:.17)-cap.current.position.y)*Math.min(dt*18,1);
  if(bridge.current)bridge.current.position.y+=((pressed?.085:.112)-bridge.current.position.y)*Math.min(dt*18,1);
 });
 const choose=(part:Part)=>(event:{stopPropagation:()=>void})=>{event.stopPropagation();onSelect(part);};
 return <>
  <group onClick={choose('button')}>
   <mesh position={[0,.04,0]} castShadow raycast={cutaway?()=>{}:undefined}><boxGeometry args={[.38,.13,.35]}/><meshPhysicalMaterial color={selected==='button'?'#9f78ce':'#26323c'} roughness={.5} transparent={cutaway} opacity={cutaway?.20:1} depthWrite={!cutaway}/></mesh>
   {!cutaway&&<>{[-.13,.13].map(z=><Box key={z} at={[0,.125,z]} size={[.38,.024,.08]} color='#b0bac1' metal={.8}/>)}{[-.15,.15].map(x=><Box key={x} at={[x,.125,0]} size={[.08,.024,.18]} color='#b0bac1' metal={.8}/>)}</>}
  </group>
  {[-1,1].map(side=><group key={side} onClick={choose(side<0?'contactA':'contactB')}>
   <Box at={[side*.11,.082,0]} size={[.037,.012,.27]} color={selected===(side<0?'contactA':'contactB')?'#be87e6':'#b08c55'} metal={.7}/>
   {[-.12,.12].map(z=><group key={z}><Box at={[side*.21,-.015,z]} size={[.11,.019,.035]} color='#b8c1c7' metal={.8}/><Box at={[side*.245,-.038,z]} size={[.023,.057,.035]} color='#b8c1c7' metal={.8}/></group>)}
  </group>)}
  <group ref={bridge} position={[0,.112,0]}><Box at={[0,0,0]} size={[.23,.012,.07]} color='#c0aa75' metal={.8}/><Box at={[0,.02,0]} size={[.045,.035,.05]} color='#8d969f' metal={.6}/></group>
  <group ref={cap} position={[0,.17,0]} onClick={choose('button')} onPointerDown={event=>{event.stopPropagation();onPress();}}>
   <mesh name='status-switch-cap' castShadow><cylinderGeometry args={[.092,.104,.10,32]}/><meshStandardMaterial color={selected==='button'?'#af84da':'#35414b'} roughness={.43}/></mesh>
  </group>
 </>;
}
function PanelScene({step,pressed,lit,selected,select,cutaway,onPress}:{step:number;pressed:boolean;lit:boolean;selected:Part;select:(part:Part)=>void;cutaway:boolean;onPress:()=>void}){
 const choose=(part:Part)=>(event:{stopPropagation:()=>void})=>{event.stopPropagation();select(part);};
 const anchors:Record<Part,Point>={board:[-.30,.61,.50],button:[-.67,.94,.32],contactA:[-.94,.77,.32],contactB:[-.36,.77,.32],uno:[-1.55,.58,-.9],input:[-1.01,.72,.11],ground:[.65,.51,1.0],resistor:[.25,.59,.54],led:[1.50,1.17,-.31]};
 return <>
  <group position={[-.05,.17,.34]} onClick={choose('board')}><Breadboard active={selected==='board'}/></group>
  {step>=1&&<Mount from={[0,.65,0]}><group position={[-.67,.29,.32]}><TactileSwitch {...{pressed,cutaway,selected}} onSelect={select} onPress={onPress}/></group></Mount>}
  {step>=3&&<Mount from={[-.5,.25,0]}><group position={[-1.55,.15,-.90]} onClick={choose('uno')}><Uno active={selected==='uno'}/></group><Box at={[-1.74,.24,-1.44]} size={[.18,.10,.18]} color='#354252'/><Wire points={[[-1.74,.24,-1.53],[-1.67,.13,-1.74],[-.83,.06,-1.83]]} color='#4d7095' connectors={false} width={4}/></Mount>}
  {step>=4&&<>
   <group onClick={choose('input')}><Wire points={[[-1.24,.24,-1.1],[-1.09,.52,-.25],[-.92,.37,.24],[-.915,.25,.44]]} color={selected==='input'?'#bd87e7':'#dfb04a'}/></group>
   <group onClick={choose('ground')}><Wire points={[[-.425,.25,.44],[-.29,.28,.66],[.80,.25,.91],[-1.07,.21,1.09],[-1.24,.24,-.65]]} color={selected==='ground'?'#bd87e7':'#303a45'}/></group>
  </>}
  {step>=5&&<Mount from={[0,.6,0]}>
   <group onClick={choose('resistor')}><Resistor at={[.25,.30,.54]} colors={['#dd7b3a','#dd7b3a','#77523b','#bfa15c']} selected={selected==='resistor'}/></group>
   <group onClick={choose('led')}>
    <Box at={[1.50,.09,-.45]} size={[.66,.17,.53]} color='#4b596a' metal={.45}/><Box at={[1.50,.58,-.45]} size={[.51,.84,.075]} color='#8594a7' metal={.5}/>
    <mesh position={[1.50,.75,-.395]}><torusGeometry args={[.105,.018,10,36]}/><meshStandardMaterial color='#c5cbd0' metalness={.85} roughness={.23}/></mesh>
    <mesh name='status-panel-led' position={[1.50,.75,-.365]} castShadow><sphereGeometry args={[.084,28,20]}/><meshPhysicalMaterial color={selected==='led'?'#b88ae0':lit?'#67df93':'#347c51'} roughness={.19} clearcoat={1} emissive={lit?'#3ad877':'#000'} emissiveIntensity={lit?2.2:0}/></mesh>
    {lit&&<pointLight position={[1.50,.75,-.24]} intensity={.15} distance={.60} color='#57d38a'/>}
    <WorldLabel position={[1.50,1.08,-.37]} className='bw-panel-label'><span>STATUS</span></WorldLabel>
   </group>
   <group onClick={choose('resistor')}><Wire points={[[-1.24,.24,-.93],[-.65,.32,-.28],[.04,.35,.30],[.11,.30,.54]]} color='#d39243' width={2.3}/><Wire points={[[.39,.30,.54],[1.05,.17,.45],[1.46,.26,-.45],[1.46,.67,-.45]]} color='#5d94b4' width={2.3}/></group>
   <group onClick={choose('ground')}><Wire points={[[1.54,.67,-.45],[1.69,.17,-.27],[1.26,.14,1.04],[.80,.25,.91]]} color={selected==='ground'?'#bd87e7':'#303a45'} width={2.3}/></group>
  </Mount>}
  <WorldLabel position={anchors[selected]} className='rw-label-anchor'><span className='rw-world-label'>{parts.find(part=>part.id===selected)?.name}<small>{selected==='button'?'Momentary · release to open':selected==='contactA'?'D2 · HIGH at rest':selected==='contactB'?'Ground · LOW when joined':selected==='led'?'D8 · follows the accepted press':'Select to trace the actual connection'}</small></span></WorldLabel>
 </>;
}
const bounceEvents=[{time:6,pressed:true},{time:10,pressed:false},{time:14,pressed:true},{time:18,pressed:false},{time:22,pressed:true},{time:95,pressed:false},{time:99,pressed:true},{time:103,pressed:false},{time:107,pressed:true},{time:111,pressed:false}];
export default function PushButtonWorkshop(){
 const [step,setStep]=useState(0),[selected,setSelected]=useState<Part>('board'),[replay,setReplay]=useState(0),[cutaway,setCutaway]=useState(false);
 const [raw,setRaw]=useState(false),[stable,setStable]=useState(false),[rawEdges,setRawEdges]=useState(0),[accepted,setAccepted]=useState(0),[replaying,setReplaying]=useState(false);
 const [trace,setTrace]=useState<Trace[]>([{time:0,raw:false,stable:false}]);
 const [events,setEvents]=useState(['Released · D2 HIGH · LED off']);
 const shortPulse=useRef(false);
 const rawRef=useRef(false),stableRef=useRef(false),origin=useRef(performance.now()),pulseTimer=useRef<number|undefined>(undefined);
 function record(time:number,input:boolean,output:boolean){setTrace(previous=>[...previous,{time,raw:input,stable:output}].slice(-40));}
 function changeInput(value:boolean){
  if(replaying||rawRef.current===value)return;
  rawRef.current=value;setRaw(value);setRawEdges(count=>count+1);record(performance.now()-origin.current,value,stableRef.current);
 }
 function beginHold(){window.clearTimeout(pulseTimer.current);shortPulse.current=false;changeInput(true);}
 function pulse(duration:number){beginHold();shortPulse.current=duration<25;pulseTimer.current=window.setTimeout(()=>{shortPulse.current=false;changeInput(false);},duration);}
 function select(part:Part){setSelected(part);if(part==='contactA'||part==='contactB')setCutaway(true);}
 useEffect(()=>{
  if(replaying||shortPulse.current||raw===stableRef.current)return;
  const timer=window.setTimeout(()=>{
   if(raw===stableRef.current)return;
   stableRef.current=raw;setStable(raw);setAccepted(count=>count+1);record(performance.now()-origin.current,raw,raw);
   setEvents(previous=>[raw?'Pressed · D2 LOW · LED on':'Released · D2 HIGH · LED off',...previous].slice(0,7));
  },25);
  return ()=>window.clearTimeout(timer);
 },[raw,replaying]);
 useEffect(()=>{
  const release=()=>changeInput(false);
  window.addEventListener('pointerup',release);window.addEventListener('pointercancel',release);window.addEventListener('blur',release);
  return ()=>{window.removeEventListener('pointerup',release);window.removeEventListener('pointercancel',release);window.removeEventListener('blur',release);};
 },[replaying]);
 useEffect(()=>()=>window.clearTimeout(pulseTimer.current),[]);
 function reset(){window.clearTimeout(pulseTimer.current);shortPulse.current=false;setReplaying(false);rawRef.current=false;stableRef.current=false;setRaw(false);setStable(false);setRawEdges(0);setAccepted(0);origin.current=performance.now();setTrace([{time:0,raw:false,stable:false}]);setEvents(['Released · D2 HIGH · LED off']);}
 function stage(index:number){reset();setStep(index);select(steps[index].part);}
 useEffect(()=>{
  if(!replaying)return;
  let frame:number,index=0,lastChange=0,input=false,output=false;
  const started=performance.now();
  rawRef.current=false;stableRef.current=false;setRaw(false);setStable(false);setRawEdges(0);setAccepted(0);setTrace([{time:0,raw:false,stable:false}]);setEvents(['Slow motion · the debounce window is 25 virtual ms.']);
  function acceptAt(time:number){
   if(input===output||time-lastChange<25)return;
   output=input;stableRef.current=output;setStable(output);setAccepted(count=>count+1);record(lastChange+25,input,output);setEvents(previous=>[`${(lastChange+25).toFixed(0)} ms · ${output?'Accepted press · LED on':'Accepted release · LED off'}`,...previous].slice(0,7));
  }
  function tick(now:number){
   const time=(now-started)/12;
   while(index<bounceEvents.length&&time>=bounceEvents[index].time){
    const event=bounceEvents[index++];acceptAt(event.time);input=event.pressed;lastChange=event.time;rawRef.current=input;setRaw(input);setRawEdges(count=>count+1);record(event.time,input,output);
   }
   acceptAt(time);
   if(time<165)frame=requestAnimationFrame(tick);else{setReplaying(false);origin.current=performance.now()-165;}
  }
  frame=requestAnimationFrame(tick);return ()=>cancelAnimationFrame(frame);
 },[replaying]);
 const part=parts.find(item=>item.id===selected)!;
 const available=parts.filter(item=>({board:0,button:1,contactA:1,contactB:1,uno:3,input:4,ground:4,resistor:5,led:5})[item.id]<=step);
 const last=trace[trace.length-1]?.time??0,first=Math.max(0,last-2500),duration=Math.max(160,last-first);
 function path(key:'raw'|'stable',high:number,low:number){return trace.map((point,index)=>{
  const x=8+Math.max(0,point.time-first)/duration*284;
  const y=point[key]?low:high;
  return index===0?`M ${x} ${y}`:`H ${x} V ${y}`;
 }).join(' ');}
 return <div className='rw-workshop bw-workshop'>
  <div className='rw-heading'><div><p className='rw-eyebrow'>Active-low input workshop</p><h3>Press the switch. Trace the response.</h3><p>Inspect the contact sides, build the input and LED paths, then compare raw contact bounce with the accepted state.</p></div><span className='rw-chip'>D2 INPUT_PULLUP · 25 ms debounce · D8 LED</span></div>
  <div className='rw-layout'>
   <div className='rw-view'>
    <div className='rw-view-top'><span><i/>{step===7?'Switch response bench':'Status panel assembly bench'}</span><div><button type='button' onClick={()=>setReplay(value=>value+1)}><RotateCcw size={15}/>Replay assembly</button>{step>=1&&<button type='button' aria-pressed={cutaway} onClick={()=>setCutaway(!cutaway)}><Layers size={15}/>{cutaway?'Close switch case':'Switch cutaway'}</button>}</div></div>
    <div className='rw-canvas' role='region' aria-label='Push-button status 3D workshop'>
     <Canvas shadows dpr={[1,1.6]} camera={{position:[3.1,3.2,5.9],fov:40}} fallback={<p>WebGL is required for the switch workbench.</p>}>
      <color attach='background' args={['#eef0f8']}/><hemisphereLight args={['#fff2df','#788099',2.1]}/><directionalLight position={[-3,7,5]} color='#fff0dc' intensity={2.8} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5}/>
      <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.025,0]} receiveShadow><planeGeometry args={[40,40]}/><meshStandardMaterial color='#e2e6ef' roughness={.86}/></mesh><mesh rotation={[-Math.PI/2,0,0]} position={[0,.001,0]} receiveShadow><planeGeometry args={[4.6,3.7]}/><meshStandardMaterial color='#68758b' roughness={.82}/></mesh><Grid args={[4.6,3.7]} position={[0,.006,0]} cellSize={.2} sectionSize={1} cellColor='#9eacc1' sectionColor='#c3cedd' cellThickness={.4} sectionThickness={.7} fadeDistance={12}/>
      <PanelScene key={replay} {...{step,selected,select,cutaway}} pressed={step===7&&raw} lit={step>=5&&stable} onPress={()=>{select('button');if(step===7)beginHold();}}/><ContactShadows position={[0,.010,0]} opacity={.28} scale={5.0} far={2.1} resolution={256} frames={1}/><OrbitControls target={[0,.65,.12]} enablePan={false} minDistance={3.3} maxDistance={10} maxPolarAngle={Math.PI/2-.05}/>
     </Canvas>
    </div>
    <div className='rw-view-footer'><span>Drag to orbit · In Operate, hold the actual switch cap</span><span>{step+1} / {steps.length}</span></div>
    <nav className='rw-build-strip' aria-label='Button workshop assembly stages'>{steps.map((item,index)=><button type='button' key={item.title} aria-current={step===index?'step':undefined} onClick={()=>stage(index)}><span>{String(index+1).padStart(2,'0')}</span>{item.title}</button>)}</nav>
   </div>
   <aside className='rw-panel'>
    <div className='rw-panel-title'><span>{step+1}</span><div><p className='rw-eyebrow'>{step===7?'Press & diagnose':'Assemble & inspect'}</p><h4>{steps[step].title}</h4></div></div><p>{steps[step].text}</p>
    {step===7&&<>
     <div className='bw-readings' aria-label='Button workshop readings'><div><span>Raw D2</span><strong>{raw?'LOW':'HIGH'}</strong></div><div><span>Accepted D2</span><strong>{stable?'LOW':'HIGH'}</strong></div><div><span>LED</span><strong>{stable?'On':'Off'}</strong></div></div>
     <button type='button' className='bw-hold' aria-pressed={raw} disabled={replaying} onPointerDown={event=>{event.preventDefault();beginHold();}} onKeyDown={event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();beginHold();}}} onKeyUp={event=>{if(event.key===' '||event.key==='Enter'){event.preventDefault();changeInput(false);}}}>Hold to light the LED</button>
     <div className='rw-step-actions'><button type='button' disabled={replaying} onClick={()=>pulse(180)}>Tap switch</button><button type='button' disabled={replaying} onClick={()=>pulse(10)}>10 ms noise pulse</button></div>
     <div className='rw-run'><button type='button' className='rw-primary' disabled={replaying} onClick={()=>{window.clearTimeout(pulseTimer.current);setReplaying(true);}}><Play size={15}/>{replaying?'Replaying bounce…':'Replay contact bounce'}</button><button type='button' onClick={reset}><RotateCcw size={15}/>Reset</button></div>
     <div className='bw-trace' aria-label='Contact bounce waveform'><div><span>Raw contacts</span><span>Accepted input</span></div><svg viewBox='0 0 300 86' role='img' aria-label='Raw and debounced input traces'><path d='M8 8H292M8 31H292M8 51H292M8 74H292' stroke='#e2d8f0' fill='none'/><path d={path('raw',8,31)} stroke='#9b8aaf' strokeWidth='2' fill='none'/><path d={path('stable',51,74)} stroke='#8d55d0' strokeWidth='2.5' fill='none'/></svg><p>{replaying?'12× slower playback · 25 virtual ms debounce':`Trace span ${Math.round(duration)} ms · LOW is the lower line`}</p></div>
     <div className='bw-counts' aria-label='Button transition counts'><span>Raw edges <strong>{rawEdges}</strong></span><span>Accepted edges <strong>{accepted}</strong></span></div>
     <div className='rw-explain' role='status'><strong>{replaying?'Watch the raw contacts change before the input is accepted.':stable?'Accepted press · D2 LOW · D8 HIGH · LED on.':'Released · pull-up holds D2 HIGH · LED off.'}</strong><p>The input must stay unchanged for 25 ms. The replay shows ten raw contact edges producing one accepted press and one accepted release.</p></div>
     <details className='rw-log' open><summary>Accepted event monitor</summary><ol aria-label='Button accepted events'>{events.map((event,index)=><li key={`${event}-${index}`}>{event}</li>)}</ol></details><p className='bw-note'>The cutaway illustrates the contact bridge. Verify the actual contact pairs on a physical switch with continuity mode.</p>
    </>}
    <div className='rw-inspect'><p className='rw-eyebrow'>Inspect the actual connections</p><div className='rw-part-list' role='group' aria-label='Inspect button workshop parts'>{available.map(item=><button type='button' key={item.id} aria-pressed={selected===item.id} onClick={()=>select(item.id)}>{item.name}</button>)}</div><h5>{part.name}</h5><p>{part.purpose}</p><div className='rw-connections'><strong>How it connects</strong><p>{part.connection}</p></div></div>
    <div className='rw-check'><p>{steps[step].check}</p></div>
    {step<7&&<div className='rw-step-actions'><button type='button' disabled={step===0} onClick={()=>stage(step-1)}><ChevronLeft size={15}/>Previous</button><button type='button' className='rw-primary' onClick={()=>stage(step+1)}>{step===6?'Try the switch':'Next step'}<ChevronRight size={15}/></button></div>}
   </aside>
  </div>
 </div>;
}
