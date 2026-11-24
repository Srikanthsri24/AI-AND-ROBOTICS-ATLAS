import {useEffect,useMemo,useRef,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Grid,OrbitControls} from '@react-three/drei';
import {CanvasTexture,SRGBColorSpace} from 'three';
import {ChevronLeft,ChevronRight,Layers,Play,Power,RotateCcw} from 'lucide-react';
import {Mount,Uno,Wire} from './RoverWorkshopModel';
import {SolarMeterSolid as Box} from './SolarMeterParts';
import {WorldLabel} from './LabWorkbench';
import '../styles/rover-workshop.css';
import '../styles/desktop-servo-workshop.css';
type Point=[number,number,number];
type Part='fixture'|'servo'|'shaft'|'uno'|'power'|'signal'|'ground'|'horn'|'pointer'|'scale';
const pivot:Point=[.84,.82,-.47];
const parts:{id:Part;name:string;purpose:string;connection:string;stage:number;at:Point}[]=[
 {id:'fixture',name:'Base and servo mounting bracket',purpose:'A broad base and clamped mounting tabs keep the servo case from twisting as the shaft moves.',connection:'Fasten the servo by its tabs. The scale support sits below the pointer and leaves the whole 70°–110° sweep clear.',stage:0,at:[1.8,.66,-.45]},
 {id:'servo',name:'Micro servo case and gear train',purpose:'The motor and reduction gears inside the case position the output shaft. The cutaway illustrates this mechanical path.',connection:'Orange signal goes to Uno D9. Red goes to a separate regulated 5 V supply, and brown/black goes to its return.',stage:1,at:[.82,1.24,-.50]},
 {id:'shaft',name:'Output spline and center screw',purpose:'The spline transfers torque to the horn. Its retaining screw holds the horn on the shaft.',connection:'Center the bare shaft at 90° first. Disconnect servo power before fitting or reindexing the horn; never turn it forcibly by hand.',stage:1,at:[.84,1.13,-.25]},
 {id:'uno',name:'Arduino Uno · D9 command',purpose:'Runs the Servo library and sends 70°, 90° or 110° position commands. The sketch steps the command by 1° every 18 ms.',connection:'D9 → orange signal. Uno GND → external supply negative. USB powers the Uno; servo positive stays on the separate supply.',stage:2,at:[-1.34,.59,.83]},
 {id:'power',name:'Separate regulated 5 V supply',purpose:'Provides the servo’s motor current while USB powers the controller. Its green display shows the selected supply voltage.',connection:'Positive → servo red. Negative → servo ground AND Uno GND. Keep external +5 V separate from the Uno USB 5 V rail.',stage:3,at:[-1.40,1.02,-.67]},
 {id:'signal',name:'Orange D9 signal lead',purpose:'Carries servo command pulses; it does not supply the motor’s operating current.',connection:'Uno D9 → servo signal. Disconnecting it in this model prevents new motion commands from reaching the servo.',stage:4,at:[-.63,.74,-.12]},
 {id:'ground',name:'Shared ground and servo power leads',purpose:'The common ground gives D9 a shared electrical reference. The separate red and dark leads carry servo power.',connection:'Supply negative → servo ground and Uno GND. The fault switch lifts the Uno ground jumper so students can trace the missing reference.',stage:4,at:[-1.08,.60,.20]},
 {id:'horn',name:'Horn and retaining screw',purpose:'Fits onto the centered spline and carries the lightweight pointer. The small holes offer attachment points.',connection:'With power off and the shaft centered, secure the horn near 90°. Correct a mounting offset by reindexing the horn, rather than changing the scale.',stage:6,at:[.84,1.25,-.15]},
 {id:'pointer',name:'Lightweight pointer and tip',purpose:'The unloaded cardboard link makes shaft movement visible over the scale. The blue tip is the reading point.',connection:'Attach the light pointer along the horn and leave clearance above the scale. No payload or gripping load is used in this guide.',stage:6,at:[1.22,1.02,.80]},
 {id:'scale',name:'Fixed 70°–110° angle scale',purpose:'Shows the simulated physical pointer angle, including any horn mounting error. A command value alone does not prove the real angle.',connection:'The center of the scale must align with the shaft axis. Compare each of the six recorded endpoints against the command within ±5°.',stage:7,at:[1.55,.94,1.12]},
];
const steps=[
 {title:'Fixture',part:'fixture',text:'Fasten the servo support to a broad base. Keep room above the paper scale for an unloaded pointer to move freely.',check:'The support cannot twist and no part obstructs the sweep.'},
 {title:'Servo',part:'servo',text:'Mount the servo by its tabs with the shaft pointing up. Leave the horn off so the first center command cannot swing the pointer.',check:'The bare spline is visible and the case is held firmly.'},
 {title:'Controller',part:'uno',text:'Place the Uno on insulated supports beside the fixture. USB connects it to the computer and powers the controller.',check:'D9 and GND are accessible for the signal and common-reference jumpers.'},
 {title:'Supply',part:'power',text:'Set up a separate regulated 5 V supply for the servo. Leave it off while connecting the circuit.',check:'The servo positive lead will not connect to the Uno USB 5 V rail.'},
 {title:'Wiring',part:'signal',text:'With power off, route D9 to signal, supply positive to servo positive, and supply negative to servo ground and Uno GND.',check:'Trace all three paths independently and verify the actual servo connector pinout.'},
 {title:'Center',part:'shaft',text:'Power the bare servo and send C for a 90° command. Wait for its shaft to settle, then turn servo power off before fitting the horn.',check:'The bare shaft has settled at 90° and power is off.'},
 {title:'Horn',part:'horn',text:'Fit the horn near the center position, secure its screw and attach a lightweight pointer. This stage keeps servo power off.',check:'The pointer is secured near 90° with clearance below the link.'},
 {title:'Scale',part:'scale',text:'Align a fixed scale under the shaft and mark 70°, 90° and 110°. Read the tip without touching the moving assembly.',check:'The scale stays fixed while the horn and pointer rotate.'},
 {title:'Test',part:'pointer',text:'Send L, C and R, then run three cycles. Compare six physical model landings with the commands and investigate a mounting offset or missing connection.',check:'All six endpoint errors should be within ±5° with a centered, correctly mounted pointer.'},
] satisfies {title:string;part:Part;text:string;check:string}[];
const endpoints=[70,110,70,110,70,110];
function dialPoint(angle:number,radius:number,y:number):Point{const theta=(angle-90)*Math.PI/180;return [pivot[0]+Math.sin(theta)*radius,y,pivot[2]+Math.cos(theta)*radius];}
function AngleScale({selected}:{selected:boolean}){
 const texture=useMemo(()=>{
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=640;const ctx=canvas.getContext('2d')!;
  ctx.fillStyle=selected?'#eee1fc':'#f1ecdf';ctx.fillRect(0,0,1024,640);ctx.strokeStyle='#586e87';ctx.lineWidth=3;
  const centerX=512,centerY=-64,r=495;ctx.beginPath();ctx.arc(centerX,centerY,r,Math.PI*50/180,Math.PI*130/180);ctx.stroke();
  for(let angle=50;angle<=130;angle+=5){const a=(180-angle)*Math.PI/180,isMajor=[70,90,110].includes(angle);ctx.lineWidth=isMajor?5:2;ctx.strokeStyle=isMajor?'#654599':'#8993a1';ctx.beginPath();ctx.moveTo(centerX+Math.cos(a)*r,centerY+Math.sin(a)*r);ctx.lineTo(centerX+Math.cos(a)*(r-(isMajor?47:24)),centerY+Math.sin(a)*(r-(isMajor?47:24)));ctx.stroke();if(isMajor){ctx.fillStyle='#5e477f';ctx.font='bold 36px Arial';ctx.textAlign='center';ctx.fillText(angle+'°',centerX+Math.cos(a)*(r-87),centerY+Math.sin(a)*(r-87)+10);}}
  ctx.fillStyle='#8a7c90';ctx.font='20px Arial';ctx.textAlign='center';ctx.fillText('UNLOADED POINTER · READ THE BLUE TIP',512,620);const map=new CanvasTexture(canvas);map.colorSpace=SRGBColorSpace;return map;
 },[selected]);useEffect(()=>()=>texture.dispose(),[texture]);
 // The scale begins in front of the servo; its printed arc is centered on the shaft behind that edge.
 return <mesh position={[pivot[0],.744,pivot[2]+1.02]} rotation={[-Math.PI/2,0,0]} receiveShadow><planeGeometry args={[2.72,1.70]}/><meshStandardMaterial map={texture} roughness={.9}/></mesh>;
}
function ArmBench({step,angle,offset,selected,select,cutaway,powered,ground,signal}:{step:number;angle:number;offset:number;selected:Part;select:(part:Part)=>void;cutaway:boolean;powered:boolean;ground:boolean;signal:boolean}){
 const color=(part:Part,normal:string)=>selected===part?'#b58bdd':normal;
 const choose=(part:Part)=>(event:{stopPropagation:()=>void})=>{event.stopPropagation();select(part);};
 return <>
  <group onClick={choose('fixture')}><Box at={[0,.08,0]} size={[4.8,.16,3.0]} color={color('fixture','#a78a68')}/><Box at={[.81,.235,-.52]} size={[.91,.13,.64]} color='#68778a' metal={.56}/>{[.09,1.65].flatMap(x=>[.2,1.10].map(z=><Box key={x+':'+z} at={[x,.43,z]} size={[.08,.57,.08]} color='#aab4be' metal={.7}/>))}{[-2.15,2.15].flatMap(x=>[-1.2,1.2].map(z=><mesh key={x+':'+z} position={[x,.174,z]}><cylinderGeometry args={[.038,.038,.022,6]}/><meshStandardMaterial color='#c1cbd2' metalness={.8}/></mesh>))}</group>
  {step>=1&&<Mount from={[0,.65,0]}><group onClick={choose('servo')}>
   <Box at={[.81,.505,-.52]} size={[.62,.34,.34]} color={color('servo','#235f9c')}/><mesh position={[.81,.735,-.52]} castShadow raycast={cutaway?()=>{}:undefined}><boxGeometry args={[.64,.21,.36]}/><meshPhysicalMaterial color={color('servo','#447eac')} transparent={cutaway} opacity={cutaway?.2:1} roughness={.33} clearcoat={.8} depthWrite={!cutaway}/></mesh>
   {cutaway&&[0,1,2].map((i)=><group key={i} position={[.64+i*.095,.74,-.52]} rotation={[0,(angle-90)*Math.PI/180*(i===2?1:i===1?-3:9),0]}><mesh><cylinderGeometry args={[.075-i*.006,.075-i*.006,.025,20]}/><meshStandardMaterial color='#e4dcc2' roughness={.5}/></mesh>{Array.from({length:12},(_,j)=><Box key={j} at={[Math.cos(j*Math.PI/6)*(.075-i*.006),0,Math.sin(j*Math.PI/6)*(.075-i*.006)]} size={[.019,.024,.019]} color='#d7d0b8'/>)}</group>)}
   {[-.36,.36].map(dx=><Box key={dx} at={[.81+dx,.355,-.52]} size={[.11,.105,.25]} color='#8c99a6' metal={.6}/>)}<Box at={[.81,.43,-.52]} size={[.86,.055,.35]} color='#356e9f'/>{[-.36,.36].map(dx=><mesh key={dx} position={[.81+dx,.47,-.52]}><cylinderGeometry args={[.034,.034,.027,6]}/><meshStandardMaterial color='#d0d6dc' metalness={.8}/></mesh>)}
   <group name='desktop-servo-shaft' position={[pivot[0],.80,pivot[2]]} rotation={[0,(angle-90)*Math.PI/180,0]} onClick={choose('shaft')}><mesh><cylinderGeometry args={[.065,.065,.10,24]}/><meshStandardMaterial color={color('shaft','#e0dfd1')} roughness={.37}/></mesh><Box at={[0,.056,.02]} size={[.025,.012,.075]} color='#576c83'/></group>
  </group></Mount>}
  {step>=2&&<Mount from={[-.65,.2,0]}><group position={[-1.29,.22,.83]} onClick={choose('uno')}><Uno active={selected==='uno'}/></group><Wire connectors={false} width={4} points={[[-1.64,.30,.84],[-1.98,.26,1.14],[-2.40,.18,1.13]]} color='#50759c'/></Mount>}
  {step>=3&&<Mount from={[0,.65,0]}><group onClick={choose('power')}><Box at={[-1.40,.43,-.67]} size={[.91,.51,.77]} color={color('power','#465569')} metal={.45}/><Box at={[-1.40,.44,-.271]} size={[.73,.33,.025]} color='#253449'/><Box at={[-1.40,.53,-.248]} size={[.34,.10,.017]} color={powered?'#67b18c':'#344b46'}/><WorldLabel position={[-1.40,.53,-.225]} className='sw-voltage'><span>{powered?'5.00 V':'OFF'}</span></WorldLabel>{[-.15,.15].map((dx,i)=><mesh key={dx} position={[-1.40+dx,.35,-.23]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.047,.047,.07,20]}/><meshStandardMaterial color={i?'#c15e56':'#2c3643'} roughness={.36}/></mesh>)}</group></Mount>}
  {step>=4&&<>
   <group onClick={choose('signal')}><Wire points={[[-.98,.31,.62],[-.95,.48,.25],[-.65,.56,-.34],[-.40,.52,-.42],[signal?.53:.30,.51,-.55]]} color={selected==='signal'?'#c18be8':signal?'#dfa24e':'#a9a0a7'} width={2.7}/></group>
   <group onClick={choose('ground')}><Wire points={[[-1.25,.35,-.23],[-.99,.26,-.13],[-.12,.33,-.77],[.53,.47,-.51]]} color='#bf5d54' width={2.7}/><Wire points={[[-1.55,.35,-.23],[-1.18,.23,.05],[-.15,.25,-.88],[.53,.43,-.47]]} color={selected==='ground'?'#c18be8':'#2f3c49'} width={2.7}/><Wire points={[[-1.55,.35,-.23],[-1.70,.25,.29],[ground?-1.07:-.77,.31,.85]]} color={selected==='ground'?'#c18be8':ground?'#2f3c49':'#a7a0ad'} width={2.7}/></group>
  </>}
  {step>=6&&<Mount from={[0,.75,0]}><group name='desktop-servo-pointer' position={pivot} rotation={[0,(angle+offset-90)*Math.PI/180,0]}>
   <group onClick={choose('horn')}><Box at={[0,.064,.21]} size={[.17,.043,.53]} color={color('horn','#e7e2d1')}/><mesh position={[0,.094,0]}><cylinderGeometry args={[.039,.039,.026,6]}/><meshStandardMaterial color={color('shaft','#b5bec8')} metalness={.8}/></mesh>{[.10,.21,.32].map(z=><mesh key={z} position={[0,.092,z]}><cylinderGeometry args={[.016,.016,.006,14]}/><meshStandardMaterial color='#7a7e82'/></mesh>)}</group>
   <group onClick={choose('pointer')}><Box at={[0,.102,.78]} size={[.14,.035,1.16]} color={color('pointer','#c19466')}/><Box at={[0,.123,1.22]} size={[.14,.012,.15]} color='#3b678b'/><Box at={[0,.015,1.28]} size={[.025,.17,.03]} color='#385b7b'/>{[-.035,.035].map(x=><Box key={x} at={[x,.122,.31]} size={[.035,.012,.16]} color='#dbcba7'/>)}</group>
  </group></Mount>}
  {step>=7&&<Mount from={[0,.7,0]}><group onClick={choose('scale')}><Box at={[.84,.716,.55]} size={[2.76,.042,1.75]} color={color('scale','#d6ccba')}/><AngleScale selected={selected==='scale'}/></group></Mount>}
  <WorldLabel position={selected==='pointer'?dialPoint(angle+offset,1.1,1.22):parts.find(part=>part.id===selected)!.at} className='rw-label-anchor'><span className='rw-world-label'>{parts.find(part=>part.id===selected)!.name}<small>{selected==='pointer'?`Model pointer ${(angle+offset).toFixed(0)}° · read at blue tip`:selected==='signal'?'D9 → signal · orange':selected==='ground'?'Common ground · USB +5 V kept separate':'Select a physical part to trace its role'}</small></span></WorldLabel>
 </>;
}
export default function DesktopServoWorkshop(){
 const [step,setStep]=useState(0),[selected,select]=useState<Part>('fixture'),[replay,setReplay]=useState(0),[cutaway,setCutaway]=useState(false);
 const [angle,setAngle]=useState(90),[target,setTarget]=useState(90),[offset,setOffset]=useState(0),[powered,setPowered]=useState(false),[ground,setGround]=useState(true),[signal,setSignal]=useState(true),[trial,setTrial]=useState(-1),[landings,setLandings]=useState<{command:number;reading:number}[]>([]);
 const angleRef=useRef(90);const connected=powered&&ground&&signal&&step>=5;
 const settled=Math.abs(angle-target)<.001;
 useEffect(()=>{
  if(!connected||settled)return;
  let frame=0,previous=performance.now();
  function tick(now:number){const next=angleRef.current+Math.sign(target-angleRef.current)*Math.min(Math.abs(target-angleRef.current),(now-previous)/18);previous=now;angleRef.current=next;setAngle(next);if(next!==target)frame=requestAnimationFrame(tick);}
  frame=requestAnimationFrame(tick);return ()=>cancelAnimationFrame(frame);
 },[target,connected,settled]);
 useEffect(()=>{
  if(trial<0||!connected||!settled)return;
  const timer=window.setTimeout(()=>{setLandings(previous=>[...previous,{command:target,reading:angleRef.current+offset}]);if(trial===5)setTrial(-1);else{setTrial(trial+1);setTarget(endpoints[trial+1]);}},360);
  return ()=>window.clearTimeout(timer);
 },[trial,connected,settled,target,offset]);
 function command(value:number){setTrial(-1);setTarget(value);setLandings([]);}
 function stopTrial(){setTrial(-1);setTarget(angleRef.current);}
 function reset(){setTrial(-1);setTarget(90);setOffset(0);setGround(true);setSignal(true);setLandings([]);}
 function stage(index:number){setTrial(-1);setStep(index);select(steps[index].part);setGround(true);setSignal(true);setOffset(0);setLandings([]);setTarget(90);angleRef.current=index===5?75:90;setAngle(angleRef.current);setPowered(index===5||index===8);}
 const part=parts.find(item=>item.id===selected)!;
 const canFit=!powered&&Math.abs(angle-90)<.01;
 return <div className='rw-workshop sw-workshop'>
  <div className='rw-heading'><div><p className='rw-eyebrow'>Single-joint servo workshop</p><h3>Center the shaft. Measure the pointer.</h3><p>Build the fixture, trace a separately powered servo and compare commands with the physical model’s angle scale.</p></div><span className='rw-chip'>D9 · external 5 V · 70° / 90° / 110°</span></div>
  <div className='rw-layout'><div className='rw-view'><div className='rw-view-top'><span><i/>{step===8?'Servo endpoint test bench':'Servo arm assembly bench'}</span><div><button type='button' onClick={()=>setReplay(value=>value+1)}><RotateCcw size={15}/>Replay assembly</button>{step>=1&&<button type='button' aria-pressed={cutaway} onClick={()=>setCutaway(!cutaway)}><Layers size={15}/>{cutaway?'Close servo case':'Servo cutaway'}</button>}</div></div>
   <div className='rw-canvas' role='region' aria-label='Desktop servo 3D workshop'><Canvas shadows dpr={[1,1.6]} camera={{position:[2.38,3.9,5.37],fov:40}} fallback={<p>WebGL is required for the servo workbench.</p>}>
    <color attach='background' args={['#eef0f8']}/><hemisphereLight args={['#fff2df','#788099',2.1]}/><directionalLight position={[-3,7,5]} color='#fff0dc' intensity={2.8} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5}/><mesh rotation={[-Math.PI/2,0,0]} position={[0,-.025,0]} receiveShadow><planeGeometry args={[40,40]}/><meshStandardMaterial color='#e2e6ef' roughness={.86}/></mesh><Grid args={[5.4,3.8]} position={[0,.005,0]} cellSize={.2} sectionSize={1} cellColor='#b4bdcc' sectionColor='#8c9ab1' cellThickness={.4} sectionThickness={.7} fadeDistance={12}/>
    <ArmBench key={replay} {...{step,angle,offset,selected,select,cutaway,powered,ground,signal}}/><ContactShadows position={[0,.012,0]} opacity={.28} scale={5.4} far={2.1} resolution={256} frames={1}/><OrbitControls target={[0,.52,0]} enablePan={false} minDistance={3.6} maxDistance={11} maxPolarAngle={Math.PI/2-.05}/>
   </Canvas></div><div className='rw-view-footer'><span>Drag to orbit · Click the horn, tip, scale or actual wires</span><span>{step+1} / {steps.length}</span></div><nav className='rw-build-strip' aria-label='Desktop servo assembly stages'>{steps.map((item,index)=><button type='button' key={item.title} aria-current={step===index?'step':undefined} onClick={()=>stage(index)}><span>{String(index+1).padStart(2,'0')}</span>{item.title}</button>)}</nav>
  </div><aside className='rw-panel'><div className='rw-panel-title'><span>{step+1}</span><div><p className='rw-eyebrow'>{step===8?'Command & measure':'Assemble & inspect'}</p><h4>{steps[step].title}</h4></div></div><p>{steps[step].text}</p>
   {step>=5&&<><div className='sw-readings' aria-label='Desktop servo readings'><div><span>Command</span><strong>{target.toFixed(0)}°</strong></div><div><span>{step<6?'Bare shaft':'Model pointer'}</span><strong>{(angle+(step>=6?offset:0)).toFixed(0)}°</strong></div><div><span>Landings</span><strong>{landings.length}/6</strong></div></div>
    {(step===5||step===8)&&<div className='rw-run'><button type='button' className={powered?'':'rw-primary'} aria-pressed={powered} onClick={()=>{setPowered(!powered);setTrial(-1);}}><Power size={15}/>{powered?'Turn servo power off':'Turn servo power on'}</button></div>}
    {step===5&&<><button type='button' className='sw-center' disabled={!powered} onClick={()=>command(90)}>C · Center bare shaft at 90°</button><p className='sw-note'>{canFit?'Centered and power off · safe to fit the horn.':powered?'Wait for 90°, then turn servo power off.':'Power on and center the bare shaft before fitting the horn.'}</p></>}
    {step===6&&<p className='sw-note'>Power remains off for mechanical fitting. Fit the horn without moving the centered shaft, then secure the retaining screw.</p>}
   </>}
   {step===8&&<><div className='sw-commands' role='group' aria-label='Servo position commands'>{[[70,'L'],[90,'C'],[110,'R']].map(([value,key])=><button type='button' key={value} aria-pressed={target===value&&trial<0} disabled={!connected} onClick={()=>command(Number(value))}>{key} · {value}°</button>)}</div>
    <div className='rw-step-actions'><button type='button' className='rw-primary' disabled={!connected||trial>=0} onClick={()=>{setLandings([]);setTrial(0);setTarget(endpoints[0]);}}><Play size={15}/>Run three cycles</button><button type='button' disabled={trial<0} onClick={stopTrial}>Stop trial</button><button type='button' onClick={reset}><RotateCcw size={15}/>Reset setup</button></div>
    <div className='sw-faults' role='group' aria-label='Servo connection checks'><button type='button' aria-pressed={ground} onClick={()=>{setGround(!ground);setTrial(-1);}}>{ground?'Disconnect common ground':'Reconnect common ground'}</button><button type='button' aria-pressed={signal} onClick={()=>{setSignal(!signal);setTrial(-1);}}>{signal?'Disconnect D9 signal':'Reconnect D9 signal'}</button></div>
    <label className='rw-range'>Horn mounting error <output>{offset>0?'+':''}{offset}°</output><input type='range' min={-12} max={12} step={1} value={offset} disabled={powered||trial>=0} onChange={event=>{setOffset(event.target.valueAsNumber);setLandings([]);}}/></label><p className='sw-note'>Switch servo power off to simulate an incorrectly indexed horn. Center the shaft and turn power off before correcting it.</p><button type='button' className='sw-center' disabled={!canFit} onClick={()=>{setOffset(0);setLandings([]);}}>Reindex horn at 90°</button>
    <div className='rw-explain' role='status'><strong>{!powered?'Servo supply off · pointer holds its last model angle.':!ground?'Missing common ground · no valid command reference.':!signal?'D9 signal disconnected · new commands cannot move the shaft.':trial>=0?`Trial ${trial+1} of 6 · ${settled?'settling':'moving'} toward ${target}°.`:!settled?`Moving toward ${target}°.`:landings.length===6?'Trial complete · compare all six endpoint errors.':`At model pointer ${(angle+offset).toFixed(0)}° · command ${target.toFixed(0)}°.`}</strong><p>Angle values are simulated observations, not live servo feedback. On the real build, read the fixed protractor and record the blue tip’s position.</p></div>
    <div className='sw-results'><p className='rw-eyebrow'>Six endpoint observations · ±5° tolerance</p>{landings.length?<ol aria-label='Servo endpoint observations'>{landings.map((landing,index)=><li key={index}><span>{index+1}. {landing.command}° → {landing.reading.toFixed(0)}°</span><strong>{Math.abs(landing.reading-landing.command)<=5?'Within 5°':'Reindex horn'}</strong></li>)}</ol>:<p>Run the trial to record each settled endpoint.</p>}</div>
   </>}
   <div className='rw-inspect'><p className='rw-eyebrow'>Inspect the actual components</p><div className='rw-part-list' role='group' aria-label='Inspect desktop servo parts'>{parts.filter(item=>item.stage<=step).map(item=><button type='button' key={item.id} aria-pressed={selected===item.id} onClick={()=>select(item.id)}>{item.name}</button>)}</div><h5>{part.name}</h5><p>{part.purpose}</p><div className='rw-connections'><strong>How it connects</strong><p>{part.connection}</p></div></div><div className='rw-check'><p>{steps[step].check}</p></div>{step<8&&<div className='rw-step-actions'><button type='button' disabled={step===0} onClick={()=>stage(step-1)}><ChevronLeft size={15}/>Previous</button><button type='button' className='rw-primary' disabled={step===5&&!canFit} onClick={()=>stage(step+1)}>{step===7?'Test the endpoints':'Next step'}<ChevronRight size={15}/></button></div>}
  </aside></div>
 </div>;
}
