import {useEffect,useRef,useState} from 'react';
import {Canvas,useFrame} from '@react-three/fiber';
import {ContactShadows,Grid,OrbitControls} from '@react-three/drei';
import {Group} from 'three';
import {ChevronLeft,ChevronRight,Layers,Play,RotateCcw} from 'lucide-react';
import {WorldLabel} from './LabWorkbench';
import {Mount,Uno,Wire} from './RoverWorkshopModel';
import {SolarMeterSolid as Box} from './SolarMeterParts';
import '../styles/rover-workshop.css';
import '../styles/tendon-hand-workshop.css';

type Point=[number,number,number];
type Part='palm'|'proximal'|'distal'|'servo'|'tendon'|'elastic'|'uno'|'power'|'wiring';
const parts:{id:Part;name:string;purpose:string;connection:string}[]=[
 {id:'palm',name:'Palm frame and support',purpose:'The doubled card palm provides a rigid base. The stand keeps the hinge and tendon visible.',connection:'The first finger pin passes through the palm tabs. The wrist bracket carries the servo.'},
 {id:'proximal',name:'First finger link and hinge',purpose:'The first link rotates around a smooth metal pin when the tendon pulls below the hinge axis.',connection:'Its guide keeps the cord on the palm side. The second link pivots at its free end.'},
 {id:'distal',name:'Fingertip link and hinge',purpose:'The fingertip shares the same tendon, so one actuator can bend both joints.',connection:'Tie the cord near the fingertip. The guide keeps it below the second pin.'},
 {id:'servo',name:'Wrist servo and horn',purpose:'A 25° command sweep takes up a short length of cord at the horn.',connection:'Signal → Uno D9. Power → external regulated 5 V. Ground → supply return and Uno GND.'},
 {id:'tendon',name:'Nylon pull tendon',purpose:'The cord transmits a pulling force. Any initial slack is taken up before it bends the finger.',connection:'Servo horn → palm-side guides → fingertip anchor. Keep the route below both pivot axes.'},
 {id:'elastic',name:'Elastic return band',purpose:'Stretch along the back stores energy during the curl. The elastic opens the finger as the servo releases the cord.',connection:'Back of palm → back of fingertip, above both hinges. It needs light pretension at the open position.'},
 {id:'uno',name:'Arduino Uno',purpose:'The controller commands open and curl positions, using 80° and 105° in this guide.',connection:'D9 → servo signal. Uno GND joins the external servo supply return. USB connects to the programming computer.'},
 {id:'power',name:'Regulated servo supply',purpose:'The servo draws its motor current from a separate 5 V supply.',connection:'Supply + → servo positive. Supply return → servo ground and Uno GND. Keep USB 5 V and external + separate.'},
 {id:'wiring',name:'Three servo connections',purpose:'Orange carries the command, red supplies power, and black provides the return and common reference.',connection:'Trace D9, external 5 V and GND independently. The cord is a mechanical tendon, separate from these electrical wires.'},
];
const steps:{title:string;part:Part;instruction:string;check:string}[]=[
 {title:'Palm',part:'palm',instruction:'Cut and laminate the palm frame. Mount it securely with room below the finger for a curl.',check:'The support stays firm while the finger moves.'},
 {title:'Hinges',part:'proximal',instruction:'Fit two lightweight finger links with smooth pins through overlapping tabs. Inspect both joints before routing cord.',check:'Both links turn freely, with clearance between the card layers.'},
 {title:'Servo',part:'servo',instruction:'Secure the servo at the wrist. Leave the tendon off the horn for the first power-up.',check:'The horn can move from 80° to 105° without touching the frame.'},
 {title:'Tendon',part:'tendon',instruction:'Tie the nylon cord near the fingertip and route it below both hinges, through the guides, to the servo horn.',check:'Pulling the loose cord bends both joints.'},
 {title:'Return',part:'elastic',instruction:'Fit the elastic along the back of the finger. Use light pretension so it can straighten the links without a hard pull.',check:'Release the cord and watch the elastic open both joints.'},
 {title:'Controller',part:'uno',instruction:'Mount the Uno on an insulated base beside the finger and connect USB for programming.',check:'The controller remains clear of the moving finger and its tendon.'},
 {title:'Wiring',part:'wiring',instruction:'With power off, connect D9 to the servo signal. Use the external regulated 5 V supply and join grounds.',check:'Confirm the three separate electrical paths before powering the servo.'},
 {title:'Calibrate',part:'servo',instruction:'Command 80° with the tendon detached. Turn power off, attach the horn and tie the cord with a little slack.',check:'Start with a small travel and confirm neither hinge reaches a hard stop.'},
 {title:'Operate',part:'tendon',instruction:'Pull and release the tendon, then explore excess slack and an unhooked return band. Compare the servo command with the actual finger movement.',check:'Complete a curl and return cycle with the tendon and return band attached.'},
];
function offset(at:Point,x:number,y:number,angle:number,z=0):Point{return [at[0]+x*Math.cos(angle)-y*Math.sin(angle),at[1]+x*Math.sin(angle)+y*Math.cos(angle),at[2]+z];}
function Pin(){return <group>
 <mesh rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.055,.055,.51,24]}/><meshStandardMaterial color='#b5c0c8' metalness={.8} roughness={.22}/></mesh>
 {[-.265,.265].map(z=><mesh key={z} position={[0,0,z]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.082,.082,.025,6]}/><meshStandardMaterial color='#bfc7cb' metalness={.8} roughness={.25}/></mesh>)}
 </group>;}
function FingerLink({length,selected}:{length:number;selected:boolean}){return <>
 <Box at={[length/2,0,0]} size={[length,.15,.39]} color={selected?'#bb91e4':'#bd9a72'}/>
 {[-.06,0,.06].map(y=><Box key={y} at={[length/2,y,0]} size={[length-.035,.018,.37]} color={selected?'#d7b4f4':y===0?'#886c4e':'#ddc29a'}/>)}
 <Box at={[length*.65,-.10,.17]} size={[.065,.063,.055]} color='#919da3' metal={.75}/>
 <Pin/>
 </>;}
function HandModel({step,amount,servo,slack,tendonAttached,elasticAttached,selected,select,explode}:{step:number;amount:number;servo:number;slack:number;tendonAttached:boolean;elasticAttached:boolean;selected:Part;select:(part:Part)=>void;explode:boolean}){
 const a=-amount*.72,b=a-amount*.78;
 const base:Point=[-.12,1.42,.12];
 const middle=offset(base,.86,0,a),tip=offset(middle,.70,0,b);
 const tendon:Point[]=[offset([-1.18,1.03,.40],.19,.12,-servo*.44),[-.66,1.22,.33],offset(base,.03,-.12,a,.20),offset(middle,.04,-.12,b,.20),offset(tip,-.10,-.09,b,.20)];
 if(slack>0&&servo*8<slack)tendon.splice(2,0,[-.36,1.05-slack*.025,.33]);
 if(!tendonAttached)tendon[tendon.length-1]=[.66,.68,.39];
 const elastic:Point[]=[[-.67,1.56,.20],offset(base,.08,.13,a,.09),offset(middle,.08,.13,b,.09),offset(tip,-.12,.09,b,.09)];
 if(!elasticAttached)elastic[elastic.length-1]=[.20,1.76,.28];
 const elevated=useRef<Group>(null);
 useFrame((_,dt)=>{if(elevated.current)elevated.current.position.y+=((explode?.65:0)-elevated.current.position.y)*Math.min(dt*6,1);});
 const choose=(part:Part)=>(event:{stopPropagation:()=>void})=>{event.stopPropagation();select(part);};
 const anchor:Record<Part,Point>={palm:[-.76,1.86,0],proximal:offset(base,.3,.34,a,.1),distal:offset(middle,.4,.38,b,.1),servo:[-1.25,1.56,.57],tendon:offset(middle,0,-.39,b,.30),elastic:offset(tip,0,.35,b,0),uno:[-1.35,.50,1.0],power:[1.25,.49,1.1],wiring:[-.75,.65,.72]};
 return <>
 <group onClick={choose('palm')}><Box at={[-.92,.14,0]} size={[.92,.25,.94]} color='#777d89' metal={.6}/><Box at={[-.94,.70,0]} size={[.16,1.03,.54]} color='#9aa4ad' metal={.7}/><Box at={[-.76,1.35,0]} size={[1.25,.16,.74]} color={selected==='palm'?'#bd93df':'#b99a72'}/><Box at={[-.76,1.442,0]} size={[1.20,.025,.69]} color='#d7bd93'/></group>
 <group ref={elevated}>
 {step>=1&&<Mount from={[0,.75,0]}><group position={base} rotation={[0,0,a]} onClick={choose('proximal')}><FingerLink length={.86} selected={selected==='proximal'}/></group><group position={middle} rotation={[0,0,b]} onClick={choose('distal')}><FingerLink length={.70} selected={selected==='distal'}/></group></Mount>}
 {step>=2&&<Mount from={[-.6,.25,0]}><group onClick={choose('servo')}><Box at={[-1.18,1.01,.27]} size={[.45,.33,.30]} color={selected==='servo'?'#ba8de2':'#225e9f'}/><Box at={[-1.18,1.03,.44]} size={[.14,.14,.045]} color='#aebcc6' metal={.75}/><group position={[-1.18,1.03,.48]} rotation={[0,0,-servo*.44]}><Box at={[.10,.07,0]} size={[.31,.07,.035]} color='#e6e0d0'/>{[-.02,.09,.20].map(x=><mesh key={x} position={[x,.07,.022]}><circleGeometry args={[.015,12]}/><meshStandardMaterial color='#747e82'/></mesh>)}</group></group></Mount>}
 {step>=3&&<group onClick={choose('tendon')}><Wire connectors={false} points={tendon} color={selected==='tendon'?'#c484f1':'#d8a34d'} width={selected==='tendon'?3:1.6}/></group>}
 {step>=4&&<group onClick={choose('elastic')}><Wire connectors={false} points={elastic} color={selected==='elastic'?'#bf7cea':'#478bb0'} width={selected==='elastic'?3.6:2.5}/></group>}
 </group>
 {step>=5&&<Mount from={[0,.7,0]}><group position={[-1.40,.17,.98]} rotation={[0,.3,0]} onClick={choose('uno')}><Uno active={selected==='uno'}/></group></Mount>}
 {step>=6&&<><Mount from={[.5,.2,0]}><group onClick={choose('power')}><Box at={[1.26,.16,1.02]} size={[.72,.29,.50]} color={selected==='power'?'#9470bc':'#333f4b'}/><Box at={[1.26,.312,1.02]} size={[.49,.016,.32]} color='#e3ded4'/><Box at={[1.26,.323,1.02]} size={[.30,.008,.018]} color='#555c64'/></group></Mount><group onClick={choose('wiring')}>
 <Wire points={[[-1.18,.25,.59],[-1.45,.38,.51],[-1.45,.70,.46],[-1.37,1.0,.42]]} color={selected==='wiring'?'#be85ed':'#dc9951'}/>
 <Wire points={[[.91,.19,1.04],[.30,.10,.84],[-.72,.35,.57],[-1.36,.96,.42]]} color={selected==='wiring'?'#be85ed':'#bb554d'}/>
 <Wire points={[[.94,.15,.96],[.2,.08,.73],[-.85,.20,.58],[-1.34,.96,.38]]} color={selected==='wiring'?'#be85ed':'#28343e'}/>
 <Wire points={[[-1.17,.24,.99],[-.55,.10,1.36],[.48,.09,1.28],[.92,.16,1.0]]} color={selected==='wiring'?'#be85ed':'#28343e'}/>
 </group></>}
 <WorldLabel position={anchor[selected]} className='rw-label-anchor'><span className='rw-world-label'>{parts.find(part=>part.id===selected)?.name}<small>{selected==='servo'?'D9 · 80° open / 105° curl':selected==='tendon'?'Pull side · below both pins':selected==='elastic'?'Return side · above both pins':'Select the physical part to inspect'}</small></span></WorldLabel>
 </>;
}
export default function TendonHandWorkshop(){
 const [step,setStep]=useState(0),[selected,select]=useState<Part>('palm');
 const [replay,setReplay]=useState(0),[explode,setExplode]=useState(false);
 const [command,setCommand]=useState(0),[servo,setServo]=useState(0),[finger,setFinger]=useState(0);
 const [slack,setSlack]=useState(1),[tendonAttached,setTendonAttached]=useState(true),[elasticAttached,setElasticAttached]=useState(true);
 const [cycling,setCycling]=useState(false),[cycles,setCycles]=useState(0);
 const operating=step===8;
 const takeup=servo*8;
 const pull=tendonAttached?Math.max(0,(takeup-slack)/8):0;
 const target=elasticAttached?pull:Math.max(finger,pull);
 const moving=Math.abs(servo-command)>.001||Math.abs(finger-target)>.001;
 useEffect(()=>{
  if(Math.abs(servo-command)<.001)return;
  const timer=window.setTimeout(()=>setServo(value=>Math.abs(command-value)<.035?command:value+Math.sign(command-value)*.035),25);
  return ()=>window.clearTimeout(timer);
 },[servo,command]);
 useEffect(()=>{
  if(Math.abs(finger-target)<.001)return;
  const timer=window.setTimeout(()=>setFinger(value=>Math.abs(target-value)<.04?target:value+Math.sign(target-value)*.04),25);
  return ()=>window.clearTimeout(timer);
 },[finger,target]);
 useEffect(()=>{
  if(!cycling||moving)return;
  const timer=window.setTimeout(()=>{
   if(command===1)setCommand(0);
   else{setCycling(false);if(finger<.01)setCycles(count=>count+1);}
  },450);
  return ()=>window.clearTimeout(timer);
 },[cycling,moving,command,finger]);
 function stage(index:number){setCycling(false);setCommand(0);setServo(0);setFinger(0);setStep(index);select(steps[index].part);setExplode(false);}
 function reset(){setCycling(false);setCommand(0);setServo(0);setFinger(0);setSlack(1);setTendonAttached(true);setElasticAttached(true);setCycles(0);}
 const available=parts.filter(part=>({palm:0,proximal:1,distal:1,servo:2,tendon:3,elastic:4,uno:5,power:6,wiring:6})[part.id]<=step);
 const part=parts.find(part=>part.id===selected)!;
 const status=!tendonAttached?'Tendon unhooked · the servo cannot pull the finger.':!elasticAttached&&command===0&&finger>.03?'Return unhooked · the finger stays bent after the cord releases.':moving?pull>0?'Tendon pulling · both hinges are bending.':'Taking up slack or releasing the cord.':servo>.99&&finger>.01?'Curled · tendon held under tension.':finger<.01?'Open · return band has straightened the finger.':'Finger held between the endpoints.';
 return <div className='rw-workshop hw-workshop'>
 <div className='rw-heading'><div><p className='rw-eyebrow'>Tendon-driven mechanism workshop</p><h3>One tendon. Two moving joints.</h3><p>Assemble the finger, trace the pull and return paths, then test how slack and the elastic change its motion.</p></div><span className='rw-chip'>Arduino Uno · 80°–105° servo sweep</span></div>
 <div className='rw-layout'>
  <div className='rw-view'>
   <div className='rw-view-top'><span><i/>{operating?'Tendon test bench':'Finger assembly bench'}</span><div><button type='button' onClick={()=>setReplay(value=>value+1)}><RotateCcw size={15}/>Replay assembly</button>{step>=1&&<button type='button' aria-pressed={explode} onClick={()=>setExplode(!explode)}><Layers size={15}/>{explode?'Assembled':'Exploded view'}</button>}</div></div>
   <div className='rw-canvas' role='region' aria-label='Tendon hand 3D workshop'>
    <Canvas shadows dpr={[1,1.6]} camera={{position:[2.0,3.2,6.1],fov:39}} fallback={<p>WebGL is required to view the finger mechanism.</p>}>
     <color attach='background' args={['#edf0f7']}/><hemisphereLight args={['#fff4e5','#7b809b',2.1]}/><directionalLight position={[-3,6,5]} color='#fff0d8' intensity={2.8} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5}/>
     <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.02,0]} receiveShadow><planeGeometry args={[40,40]}/><meshStandardMaterial color='#e4e7f0' roughness={.82}/></mesh>
     <mesh rotation={[-Math.PI/2,0,0]} position={[0,.001,0]} receiveShadow><planeGeometry args={[4.8,3.5]}/><meshStandardMaterial color='#657286' roughness={.8}/></mesh><Grid args={[4.8,3.5]} position={[0,.005,0]} cellSize={.2} sectionSize={1} cellColor='#99a6b9' sectionColor='#bdc8d7' cellThickness={.4} sectionThickness={.7} fadeDistance={12}/>
     <HandModel key={replay} {...{step,selected,select,explode,slack,tendonAttached,elasticAttached}} amount={finger} servo={servo}/><ContactShadows position={[0,.012,0]} opacity={.3} scale={5.1} far={2} resolution={256} frames={1}/>
     <OrbitControls target={[0,.87,.20]} enablePan={false} minDistance={3.4} maxDistance={9} maxPolarAngle={Math.PI/2-.05}/>
    </Canvas>
   </div>
   <div className='rw-view-footer'><span>Drag to orbit · Select a link, cord or circuit part</span><span>{step+1} / {steps.length}</span></div>
   <nav className='rw-build-strip' aria-label='Hand workshop assembly stages'>{steps.map((item,index)=><button type='button' key={item.title} aria-current={index===step?'step':undefined} onClick={()=>stage(index)}><span>{String(index+1).padStart(2,'0')}</span>{item.title}</button>)}</nav>
  </div>
  <aside className='rw-panel'>
   <div className='rw-panel-title'><span>{step+1}</span><div><p className='rw-eyebrow'>{operating?'Operate & diagnose':'Assemble & inspect'}</p><h4>{steps[step].title==='Operate'?'Pull, release and compare':steps[step].title}</h4></div></div><p>{steps[step].instruction}</p>
   {operating&&<>
    <div className='hw-readings' aria-label='Hand workshop readings'><div><span>Servo command</span><strong>{Math.round(80+25*servo)}°</strong></div><div><span>First joint</span><strong>{Math.round(finger*41)}°</strong></div><div><span>Second joint</span><strong>{Math.round(finger*45)}°</strong></div><div><span>Full cycles</span><strong>{cycles}</strong></div></div>
    <div className='rw-run'><button className='rw-primary' type='button' disabled={cycling} onClick={()=>{setCycling(true);setCommand(1);}}><Play size={15}/>Curl and release</button><button type='button' onClick={reset}><RotateCcw size={15}/>Reset</button></div>
    <div className='rw-step-actions'><button type='button' onClick={()=>{setCycling(false);setCommand(1);}}>Pull tendon</button><button type='button' onClick={()=>{setCycling(false);setCommand(0);}}>Release tendon</button></div>
    <label className='rw-range'>Servo travel <output>{Math.round(command*100)}%</output><input aria-label='Hand servo travel' type='range' min='0' max='100' value={command*100} onChange={event=>{setCycling(false);setCommand(event.target.valueAsNumber/100);}}/></label>
    <label className='rw-range'>Initial tendon slack <output>{slack} mm</output><input aria-label='Initial tendon slack' type='range' min='0' max='6' value={slack} onChange={event=>{setCycling(false);setSlack(event.target.valueAsNumber);}}/></label>
    <div className='hw-faults'><button type='button' aria-pressed={tendonAttached} onClick={()=>{setCycling(false);setTendonAttached(!tendonAttached);select('tendon');}}>{tendonAttached?'Unhook tendon':'Reattach tendon'}</button><button type='button' aria-pressed={elasticAttached} onClick={()=>{setCycling(false);setElasticAttached(!elasticAttached);select('elastic');}}>{elasticAttached?'Unhook return':'Reattach return'}</button></div>
    <div className='rw-explain' role='status'><strong>{status}</strong><p>The hinge angles and 8 mm cord take-up illustrate the mechanism. Measure the travel and tension on a physical build.</p></div>
   </>}
   <div className='rw-inspect'><p className='rw-eyebrow'>Select the actual part or its label</p><div className='rw-part-list' role='group' aria-label='Inspect hand workshop parts'>{available.map(item=><button type='button' key={item.id} aria-pressed={selected===item.id} onClick={()=>select(item.id)}>{item.name}</button>)}</div><h5>{part.name}</h5><p>{part.purpose}</p><div className='rw-connections'><strong>How it connects</strong><p>{part.connection}</p></div></div>
   <div className='rw-check'><p>{steps[step].check}</p></div>
   {!operating&&<div className='rw-step-actions'><button type='button' disabled={step===0} onClick={()=>stage(step-1)}><ChevronLeft size={15}/>Previous</button><button type='button' className='rw-primary' onClick={()=>stage(step+1)}>{step===7?'Test the finger':'Next step'}<ChevronRight size={15}/></button></div>}
  </aside>
 </div>
 </div>;
}
