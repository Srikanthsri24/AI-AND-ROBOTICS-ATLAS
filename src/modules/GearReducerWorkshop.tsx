import {useEffect,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Grid,OrbitControls} from '@react-three/drei';
import {ChevronLeft,ChevronRight,Layers,Pause,Play,RotateCcw} from 'lucide-react';
import {GearWheel} from './GearWheel';
import {Mount} from './RoverWorkshopModel';
import {SolarMeterSolid as Box} from './SolarMeterParts';
import {WorldLabel} from './LabWorkbench';
import '../styles/rover-workshop.css';
import '../styles/gear-reducer-workshop.css';
type Point=[number,number,number];
type Part='base'|'bearings'|'shafts'|'pinion'|'wheel'|'crank'|'marks';
type MeshSetting='correct'|'tight'|'apart';
const parts:{id:Part;name:string;purpose:string;connection:string;stage:number;at:Point}[]=[
 {id:'base',name:'Rigid base and adjustable support',purpose:'The base holds the two parallel shafts at the required spacing. The right bearing mount slides for mesh adjustment.',connection:'For equal tooth module, center distance equals half the sum of the two pitch diameters. Tighten the support after setting a small amount of backlash.',stage:0,at:[1.1,.65,-.25]},
 {id:'bearings',name:'Two bearing blocks',purpose:'Bearings locate the axes while allowing each shaft to rotate with low friction.',connection:'Bolt both blocks to the support plate. Align their axes parallel and check free rotation before fitting the gears.',stage:1,at:[.55,1.98,-.18]},
 {id:'shafts',name:'Input and output shafts',purpose:'The shafts carry rotation through the bearings. Collars limit axial sliding.',connection:'Fit the pinion and crank to the left shaft; fit the 36-tooth gear to the right shaft. Hubs must be secure and gear faces must align.',stage:2,at:[-1.1,1.9,.05]},
 {id:'pinion',name:'12-tooth input pinion',purpose:'One full input turn moves twelve teeth through the mesh. The brass-colored wheel is the fast input.',connection:'Its tooth pitch and pressure angle must match the large gear. It drives twelve of the larger gear’s 36 teeth per revolution.',stage:3,at:[-1.25,2.27,.45]},
 {id:'wheel',name:'36-tooth driven gear',purpose:'Three input turns move all 36 teeth, producing one output turn. The larger wheel rotates in the opposite direction.',connection:'Mesh the gear faces without rubbing or binding. This ideal 3:1 reducer trades speed for approximately three times the input torque before losses.',stage:4,at:[1.15,2.99,.45]},
 {id:'crank',name:'Hand crank and rotating grip',purpose:'The crank provides leverage so the input shaft can be turned by hand.',connection:'Secure the arm to the input shaft. The grip sits on its own pin; hold the grip and keep fingers clear of the exposed tooth mesh.',stage:5,at:[-1.50,1.1,1.05]},
 {id:'marks',name:'Witness marks and fixed references',purpose:'Orange and blue marks make fractional turns easy to compare against stationary pointers.',connection:'Start both marks at their reference positions. After three input turns, both return to their references, with the output moving in the opposite direction.',stage:6,at:[.58,3.18,.1]},
];
const steps=[
 {title:'Base',part:'base',text:'Place the rigid base and slotted support. Use pitch diameters, rather than outside tooth diameters, to lay out the shaft centers.',check:'The support is stable and the right-hand mount can be adjusted.'},
 {title:'Bearings',part:'bearings',text:'Bolt down the two bearing blocks. Keep the shaft axes parallel and the supports square to the gear faces.',check:'Both bearing openings face the same direction.'},
 {title:'Shafts',part:'shafts',text:'Slide a shaft through each bearing. Fit retaining collars, leaving the bearings free to rotate.',check:'Neither shaft slides out or binds in the bearing.'},
 {title:'Pinion',part:'pinion',text:'Fit the 12-tooth pinion to the left input shaft. Tighten its hub so the gear and shaft turn together.',check:'The pinion clears the support plate and is retained on its shaft.'},
 {title:'Driven gear',part:'wheel',text:'Fit the 36-tooth wheel to the right shaft. Bring the faces into alignment, then adjust the mesh to a small amount of free play.',check:'The full tooth width overlaps without the teeth bottoming out.'},
 {title:'Crank',part:'crank',text:'Attach the crank arm and its free-turning grip. Turn slowly to check the entire gear pair before using the trial controls.',check:'The crank rotates the pinion; the larger wheel turns the opposite way.'},
 {title:'References',part:'marks',text:'Fit fixed orange and blue references beside the moving witness marks. These let you count turns without touching the gears.',check:'Compare each moving mark with its own stationary pointer.'},
 {title:'Measure',part:'wheel',text:'Run three input turns and watch one opposite output turn. Try reverse rotation, pause mid-turn, or move the bearing support to inspect a mesh fault.',check:'Correct mesh gives a 3:1 reduction. A disconnected pair cannot transmit motion.'},
] satisfies {title:string;part:Part;text:string;check:string}[];
function Bench({step,turns,outputTurns,selected,select,exploded,mesh}:{step:number;turns:number;outputTurns:number;selected:Part;select:(part:Part)=>void;exploded:boolean;mesh:MeshSetting}){
 const outputX=.58+(mesh==='apart'?.34:mesh==='tight'?-.10:0);
 const inputAngle=-2*Math.PI*turns,outputAngle=2*Math.PI*outputTurns+Math.PI/36;
 const choose=(part:Part)=>(event:{stopPropagation:()=>void})=>{event.stopPropagation();select(part);};
 const color=(part:Part,normal:string)=>selected===part?'#ad83d5':normal;
 return <>
  <group onClick={choose('base')}><Box at={[0,.10,0]} size={[4.6,.20,2.4]} color={color('base','#67778c')} metal={.50}/><Box at={[0,1.21,-.46]} size={[3.8,2.21,.14]} color={color('base','#637182')} metal={.48}/>{[-1.95,1.95].flatMap(x=>[-.88,.85].map(z=><mesh key={x+':'+z} position={[x,.215,z]}><cylinderGeometry args={[.045,.045,.03,6]}/><meshStandardMaterial color='#c3cbd1' metalness={.8} roughness={.28}/></mesh>))}{[-1.55,1.55].map(x=><Box key={x} at={[x,.39,-.55]} size={[.38,.57,.33]} color='#465365' metal={.5}/>)}<Box at={[.65,1.58,-.372]} size={[.93,.065,.02]} color='#303c4b'/></group>
  {step>=1&&<Mount from={[0,.65,0]}><group onClick={choose('bearings')}>{[-1.1,outputX].map(x=><group key={x} position={[x,1.58,-.30]}><Box at={[0,0,0]} size={[.43,.43,.17]} color={color('bearings','#93a0ad')} metal={.7}/><mesh position={[0,0,.11]}><torusGeometry args={[.126,.024,12,32]}/><meshStandardMaterial color='#c4ccd3' metalness={.85} roughness={.23}/></mesh>{[-.15,.15].flatMap(dx=>[-.15,.15].map(dy=><mesh key={dx+':'+dy} position={[dx,dy,.10]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.025,.025,.025,6]}/><meshStandardMaterial color='#3d4753' metalness={.8}/></mesh>))}</group>)}</group></Mount>}
  {step>=2&&<Mount from={[0,0,.9]}><group onClick={choose('shafts')}>{[-1.1,outputX].map(x=><group key={x}><mesh position={[x,1.58,.07]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.064,.064,.85,24]}/><meshStandardMaterial color={color('shafts','#c5cdd4')} metalness={.82} roughness={.21}/></mesh>{[-.14,.13].map(z=><mesh key={z} position={[x,1.58,z]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.102,.102,.06,28]}/><meshStandardMaterial color='#8794a2' metalness={.72}/></mesh>)}</group>)}</group></Mount>}
  {step>=3&&<Mount from={[0,0,1]}><group position={[-1.1,1.58,exploded?.95:.29]}><group name='workshop-input-gear' rotation={[0,0,inputAngle]} onClick={choose('pinion')}><GearWheel teeth={12} pitch={.42} metal highlight={selected==='pinion'} highlightColor='#b58cda'/></group></group></Mount>}
  {step>=4&&<Mount from={[0,0,1.3]}><group position={[outputX,1.58,exploded?1.32:.29]}><group name='workshop-output-gear' rotation={[0,0,outputAngle]} onClick={choose('wheel')}><GearWheel teeth={36} pitch={1.26} metal={false} highlight={selected==='wheel'} highlightColor='#b58cda'/></group></group></Mount>}
  {step>=5&&<Mount from={[0,0,1.1]}><group name='workshop-crank' position={[-1.1,1.58,exploded?1.75:.29]} rotation={[0,0,inputAngle]} onClick={choose('crank')}><Box at={[0,-.32,.38]} size={[.126,.67,.089]} color={color('crank','#bbc4cc')} metal={.76}/><mesh position={[0,-.62,.54]} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[.078,.089,.31,32]}/><meshStandardMaterial color={color('crank','#344353')} roughness={.4}/></mesh><mesh position={[0,0,.44]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.062,.062,.04,6]}/><meshStandardMaterial color='#5e6d7d' metalness={.8}/></mesh></group></Mount>}
  {step>=6&&<Mount from={[0,.5,0]}><group onClick={choose('marks')}><Box at={[-1.1,2.13,-.26]} size={[.082,.046,.40]} color={color('marks','#eeab4e')}/><Box at={[outputX,2.64,-.33]} size={[.056,.63,.08]} color='#627d89' metal={.5}/><Box at={[outputX,2.97,-.22]} size={[.082,.051,.38]} color={color('marks','#62a8d0')}/></group></Mount>}
  <WorldLabel position={parts.find(part=>part.id===selected)!.at} className='rw-label-anchor'><span className='rw-world-label'>{parts.find(part=>part.id===selected)!.name}<small>{selected==='pinion'?'12 teeth · fast input':selected==='wheel'?'36 teeth · ⅓ speed · opposite direction':selected==='crank'?'Hand-powered · no electrical wiring':'Click the actual part to inspect its connection'}</small></span></WorldLabel>
 </>;
}
export default function GearReducerWorkshop(){
 const [step,setStep]=useState(0),[selected,select]=useState<Part>('base'),[replay,setReplay]=useState(0),[exploded,setExploded]=useState(false);
 const [turns,setTurns]=useState(0),[outputTurns,setOutputTurns]=useState(0),[running,setRunning]=useState(false),[target,setTarget]=useState<number|null>(null),[rpm,setRpm]=useState(24),[direction,setDirection]=useState(1),[mesh,setMesh]=useState<MeshSetting>('correct');
 const ready=step===7&&!exploded&&mesh!=='tight';
 useEffect(()=>{
  if(!running||!ready)return;
  let frame=0,last=performance.now(),current=turns,output=outputTurns;
  function tick(now:number){
   const delta=Math.min((now-last)/1000,.06)*rpm/60*direction;last=now;
   let next=current+delta;
   if(target!==null&&(direction>0?next>=target:next<=target))next=target;
   if(mesh==='correct')output+=(next-current)/3;
   current=next;setTurns(current);setOutputTurns(output);
   if(target!==null&&current===target){setRunning(false);setTarget(null);}else frame=requestAnimationFrame(tick);
  }
  frame=requestAnimationFrame(tick);return ()=>cancelAnimationFrame(frame);
 },[running,ready,rpm,direction,mesh,target]);
 function stop(){setRunning(false);setTarget(null);}
 function reset(){stop();setTurns(0);setOutputTurns(0);}
 function stage(index:number){reset();setExploded(false);setMesh('correct');setStep(index);select(steps[index].part);}
 function quarter(){stop();if(!ready)return;setTurns(value=>value+direction*.25);if(mesh==='correct')setOutputTurns(value=>value+direction/12);}
 const part=parts.find(item=>item.id===selected)!;
 return <div className='rw-workshop gw-workshop'>
  <div className='rw-heading'><div><p className='rw-eyebrow'>Mechanical transmission workshop</p><h3>Build the mesh. Measure the reduction.</h3><p>Assemble real mechanical parts, follow the witness marks and test how tooth count changes speed and direction.</p></div><span className='rw-chip'>12 → 36 teeth · 3:1 reduction · hand powered</span></div>
  <div className='rw-layout'><div className='rw-view'>
   <div className='rw-view-top'><span><i/>{step===7?'Gear ratio test bench':'Gear reducer assembly bench'}</span><div><button type='button' onClick={()=>{stop();setReplay(value=>value+1);}}><RotateCcw size={15}/>Replay assembly</button>{step>=3&&<button type='button' aria-pressed={exploded} onClick={()=>{stop();setExploded(!exploded);}}><Layers size={15}/>{exploded?'Assembled':'Exploded shafts'}</button>}</div></div>
   <div className='rw-canvas' role='region' aria-label='Gear reducer 3D workshop'><Canvas shadows dpr={[1,1.6]} camera={{position:[2.7,3.15,6.85],fov:40}} fallback={<p>WebGL is required for the gear workbench.</p>}>
    <color attach='background' args={['#eef0f8']}/><hemisphereLight args={['#fff2df','#788099',2.1]}/><directionalLight position={[-3,7,5]} color='#fff0dc' intensity={2.8} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-5} shadow-camera-right={5} shadow-camera-top={5} shadow-camera-bottom={-5}/>
    <mesh rotation={[-Math.PI/2,0,0]} position={[0,-.025,0]} receiveShadow><planeGeometry args={[40,40]}/><meshStandardMaterial color='#e2e6ef' roughness={.86}/></mesh><Grid args={[5.2,3.6]} position={[0,.005,0]} cellSize={.2} sectionSize={1} cellColor='#b4bdcc' sectionColor='#8c9ab1' cellThickness={.4} sectionThickness={.7} fadeDistance={12}/>
    <Bench key={replay} {...{step,turns,outputTurns,selected,select,exploded,mesh}}/><ContactShadows position={[0,.012,0]} opacity={.28} scale={5.4} far={2.1} resolution={256} frames={1}/><OrbitControls target={[0,1.29,0]} enablePan={false} minDistance={3.7} maxDistance={11} maxPolarAngle={Math.PI/2-.05}/>
   </Canvas></div>
   <div className='rw-view-footer'><span>Drag to orbit · Click a gear, bearing, shaft or crank</span><span>{step+1} / {steps.length}</span></div><nav className='rw-build-strip' aria-label='Gear reducer assembly stages'>{steps.map((item,index)=><button type='button' key={item.title} aria-current={step===index?'step':undefined} onClick={()=>stage(index)}><span>{String(index+1).padStart(2,'0')}</span>{item.title}</button>)}</nav>
  </div><aside className='rw-panel'>
   <div className='rw-panel-title'><span>{step+1}</span><div><p className='rw-eyebrow'>{step===7?'Turn & compare':'Assemble & inspect'}</p><h4>{steps[step].title}</h4></div></div><p>{steps[step].text}</p>
   {step===7&&<>
    <div className='gw-readings' aria-label='Gear reducer readings'><div><span>Input turns</span><strong>{turns.toFixed(2)}</strong></div><div><span>Output turns</span><strong>{outputTurns.toFixed(2)}</strong></div><div><span>Reduction</span><strong>3:1</strong></div></div>
    <div className='rw-run'><button type='button' className='rw-primary' disabled={!ready} onClick={()=>{if(running)stop();else{setTarget(null);setRunning(true);}}}>{running?<Pause size={15}/>:<Play size={15}/>} {running?'Pause crank':'Turn crank'}</button><button type='button' onClick={reset}><RotateCcw size={15}/>Reset marks</button></div>
    <div className='rw-step-actions'><button type='button' disabled={!ready||running} onClick={()=>{setTarget(turns+direction*3);setRunning(true);}}>Run three input turns</button><button type='button' disabled={!ready||running} onClick={quarter}>Advance ¼ turn</button></div>
    <label className='rw-range'>Input speed <output>{rpm} rpm</output><input type='range' min={12} max={60} step={6} value={rpm} onChange={event=>setRpm(event.target.valueAsNumber)}/></label>
    <div className='gw-output' aria-label='Gear speed and direction'><p><strong>{mesh==='correct'?(rpm/3).toFixed(0):'0'} rpm</strong> output at the selected input speed</p><span>{direction>0?'Input clockwise → output counterclockwise':'Input counterclockwise → output clockwise'}</span></div>
    <div className='gw-options' role='group' aria-label='Crank direction'>{[[1,'Clockwise'],[-1,'Counterclockwise']].map(([value,label])=><button type='button' key={label} aria-pressed={direction===value} onClick={()=>{stop();setDirection(Number(value));}}>{label}</button>)}</div>
    <fieldset className='gw-mesh'><legend>Adjust the bearing support</legend>{([['correct','Correct mesh'],['tight','Too tight'],['apart','Separated']] as const).map(([value,label])=><button type='button' key={value} aria-pressed={mesh===value} onClick={()=>{stop();setMesh(value);}}>{label}</button>)}</fieldset>
    <div className='rw-explain' role='status'><strong>{exploded?'Assemble the shafts before turning.':mesh==='tight'?'Mesh binds · loosen the support and restore clearance.':mesh==='apart'?'Disconnected · the crank turns but output stays still.':running?'Turning · count the orange and blue witness marks.':'Ready · three input turns produce one opposite output turn.'}</strong><p>{mesh==='correct'?'36 ÷ 12 = 3. The output speed is input speed ÷ 3; external gears reverse direction. Ideal output torque is ×3 before friction and other losses.':mesh==='tight'?'The mount is too close. Rotation is blocked in this diagnostic model; do not force a physical mechanism.':'Move the sliding support back toward the input gear to restore tooth engagement. Reset marks before a new ratio trial.'}</p></div>
    <p className='gw-note'>Mechanical demonstration: this project has no electronic circuit. The mesh fault controls illustrate assembly conditions rather than calculating tooth stress or friction.</p>
   </>}
   <div className='rw-inspect'><p className='rw-eyebrow'>Inspect the actual parts</p><div className='rw-part-list' role='group' aria-label='Inspect gear reducer parts'>{parts.filter(item=>item.stage<=step).map(item=><button type='button' key={item.id} aria-pressed={selected===item.id} onClick={()=>select(item.id)}>{item.name}</button>)}</div><h5>{part.name}</h5><p>{part.purpose}</p><div className='rw-connections'><strong>How it connects</strong><p>{part.connection}</p></div></div>
   <div className='rw-check'><p>{steps[step].check}</p></div>{step<7&&<div className='rw-step-actions'><button type='button' disabled={step===0} onClick={()=>stage(step-1)}><ChevronLeft size={15}/>Previous</button><button type='button' className='rw-primary' onClick={()=>stage(step+1)}>{step===6?'Measure the turns':'Next step'}<ChevronRight size={15}/></button></div>}
  </aside></div>
 </div>;
}
