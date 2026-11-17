import { useEffect,useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows,Line,OrbitControls } from '@react-three/drei';
import { omniActions,omniExample,omniLimit,omniWheels,parseOmni,type OmniAction,type OmniKey } from '../data/omni-arm';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { OmniWheelPart } from './OmniWheelPart';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
const pickup:Point=[-1.49,.445,.15],drop:Point=[.89,.445,.15];
const anchors:Point[]=[[0,.51,-.48],[-.86,.45,.40],[.85,.45,.43],[.01,1.55,-.26]];
const labels=[
  ['Chassis and wheel shield','The shield sends four independent motor directions. Opposite wheel pairs are used for sideways movement.'],
  ['Left Mecanum wheels','Rollers sit at an angle to the axle. During a right slide, the front-left wheel drives forward and the rear-left wheel reverses.'],
  ['Right Mecanum wheels','During a right slide, the front-right wheel reverses and the rear-right wheel drives forward. The chassis keeps its heading.'],
  ['Shoulder and elbow','The programmed poses lower, lift and carry the payload. The vehicle’s wheels stay stopped while the arm moves.'],
  ['Gripper','Close grips the foam block when it is within reach. Open releases it over the drop dock.'],
] as const;
const ARM_ORIGIN=.70,L1=.67,L2=.70;
const angles={pick:-1.25,place:1.25};
type Pose={yaw:number;reach:number;height:number;grip:number};
const stow:Pose={yaw:0,reach:.36,height:1.33,grip:0};
type Rover={x:number;z:number;yaw:number;spin:number[];arm:Pose;stowed:boolean;holding:boolean;block:Point;delivered:boolean};
const initial:Rover={x:-1.20,z:-1.13,yaw:0,spin:[0,0,0,0],arm:stow,stowed:true,holding:false,block:pickup,delivered:false};
type Run={steps:OmniAction[];index:number;at:number;start:Rover};
const wheelPoints:Point[]=[[-.68,.212,.45],[.68,.212,.45],[-.68,.212,-.45],[.68,.212,-.45]];

function jawWorld(rover:Rover):Point{
  const yaw=rover.yaw+rover.arm.yaw;
  return [rover.x+Math.sin(yaw)*rover.arm.reach,rover.arm.height,rover.z+Math.cos(yaw)*rover.arm.reach];
}
function finish(step:OmniKey,rover:Rover):Rover{
  if(step==='C'&&!rover.holding){
    const jaw=jawWorld(rover);
    if(Math.hypot(jaw[0]-rover.block[0],jaw[2]-rover.block[2])<.24&&Math.abs(jaw[1]-rover.block[1])<.18){
      return {...rover,holding:true,delivered:false};
    }
  }
  if((step==='O'||step==='H'||step==='P')&&rover.holding){
    const jaw=jawWorld(rover);
    const onPad=Math.hypot(jaw[0]-drop[0],jaw[2]-drop[2])<.26&&Math.abs(jaw[1]-drop[1])<.18;
    return {...rover,stowed:step==='H',holding:false,block:onPad?drop:[jaw[0],.20,jaw[2]],delivered:onPad};
  }
  return {...rover,stowed:step==='H'||rover.stowed};
}
function stepPose(step:OmniAction,start:Rover,fraction:number):Rover{
  if('drive' in step){
    const [f,s,turn]=step.drive;
    const x=start.x+(Math.sin(start.yaw)*f+Math.cos(start.yaw)*s)*.9*fraction;
    const z=start.z+(Math.cos(start.yaw)*f-Math.sin(start.yaw)*s)*.9*fraction;
    return {...start,x:Math.max(-2.3,Math.min(2.3,x)),z:Math.max(-1.72,Math.min(1.72,z)),
      yaw:start.yaw+turn*(Math.PI/3)*fraction,spin:omniWheels(f,s,turn).map((value,i)=>start.spin[i]+value*fraction*4.2)};
  }
  const target={...start.arm};
  switch(step.key){
    case 'P':Object.assign(target,{yaw:angles.pick,reach:1.21,height:.445,grip:0});break;
    case 'C':target.grip=1;break;
    case 'U':Object.assign(target,{reach:1.03,height:1.05});break;
    case 'T':target.yaw=angles.place;break;
    case 'D':Object.assign(target,{reach:1.21,height:.445});break;
    case 'O':target.grip=0;break;
    case 'H':Object.assign(target,stow);break;
  }
  const t=fraction*fraction*(3-2*fraction);
  return {...start,stowed:false,arm:{
    yaw:start.arm.yaw+(target.yaw-start.arm.yaw)*t,
    reach:start.arm.reach+(target.reach-start.arm.reach)*t,
    height:start.arm.height+(target.height-start.arm.height)*t,
    grip:start.arm.grip+(target.grip-start.arm.grip)*t,
  }};
}
function Marker({index,at,selected,select}:{index:number;at:Point;selected:number;select:(i:number)=>void}){
  return <WorldLabel position={at} className="gp-marker-anchor">
    <button type="button" className="gp-marker" aria-label={labels[index][0]} aria-pressed={selected===index} onClick={()=>select(index)}>
      {index+1}{selected===index&&<span className="gp-demo-marker-name">{labels[index][0]}</span>}
    </button>
  </WorldLabel>;
}
function Mechanism({pose,selected,select}:{pose:Pose;selected:number;select:(id:number)=>void}){
  const rise=pose.height-ARM_ORIGIN;
  const cosine=(pose.reach**2+rise**2-L1**2-L2**2)/(2*L1*L2);
  const elbow=-Math.acos(Math.max(-1,Math.min(1,cosine)));
  const shoulder=Math.atan2(rise,pose.reach)-Math.atan2(L2*Math.sin(elbow),L1+L2*Math.cos(elbow));
  const metal=selected===3?'#cba56c':'#adb7b9';
  return <group position={[0,ARM_ORIGIN,0]} rotation={[0,pose.yaw,0]}>
    <mesh position={[0,-.175,0]}><cylinderGeometry args={[.25,.27,.17,36]}/><meshStandardMaterial color="#56606b" metalness={.61}/></mesh>
    <Box at={[0,-.073,0]} size={[.37,.14,.27]} color="#3c4852" metal={.45}/>
    <group rotation={[-shoulder,0,0]}>
      <group onClick={()=>select(3)}>
        {[-.105,.105].map(x=><Box key={x} at={[x,0,.305]} size={[.064,.136,.635]} color={metal} metal={.57}/>)}
        <Box at={[0,.052,.095]} size={[.16,.18,.20]} color="#34424b"/>
      </group>
      <group position={[0,0,L1]} rotation={[-elbow,0,0]}>
        <group onClick={()=>select(3)}>
          <Box at={[0,0,0]} size={[.24,.19,.18]} color="#41505b" metal={.46}/>
          {[-.085,.085].map(x=><Box key={x} at={[x,0,.305]} size={[.052,.102,.61]} color={metal} metal={.61}/>)}
          <Line points={[[-.13,.07,0],[-.13,.12,.30],[-.09,.066,.53]]} color="#77516b" lineWidth={2.2}/>
        </group>
        <group position={[0,0,L2]} rotation={[shoulder+elbow,0,0]} onClick={()=>select(4)}>
          <Box at={[0,.085,-.01]} size={[.25,.113,.19]} color={selected===4?'#dab47a':'#617481'} metal={.46}/>
          {[-1,1].map(s=><Box key={s} at={[s*(.142-pose.grip*.061),-.005,.015]} size={[.047,.185,.108]} color={selected===4?'#e0ba7b':'#a4b0b4'} metal={.56}/>)}
        </group>
      </group>
    </group>
  </group>;
}
function Field({rover,selected,select}:{rover:Rover;selected:number;select:(id:number)=>void}){
  return <>
    <color attach="background" args={['#273d4c']}/>
    <hemisphereLight args={['#e0f1ff','#776453',2.26]}/>
    <directionalLight position={[-4,7,5]} intensity={2.74}/>
    <Box at={[0,-.14,0]} size={[6.80,.26,4.96]} color="#586d7b"/>
    <Box at={[0,.01,0]} size={[6.68,.036,4.82]} color="#738a90"/>
    {[pickup,drop].map((at,i)=><group key={i} position={[at[0],.06,at[2]]}>
      <Box at={[0,.124,0]} size={[.72,.245,.68]} color={i?'#436d68':'#62717a'} metal={.32}/>
      <Box at={[0,.258,0]} size={[.64,.033,.59]} color={i?'#81ac8f':'#b49870'}/>
      {[-.20,.20].map(z=><Box key={z} at={[0,.280,z]} size={[.45,.013,.035]} color={i?'#d6e7bd':'#e1c68e'}/>)}
      <WorldLabel position={[0,.13,.40]} className="gp-omni-dock"><span>{i?'DROP':'PICKUP'}</span></WorldLabel>
    </group>)}
    {[-1.19,-.30].map(x=><Box key={x} at={[x,.041,-.66]} size={[.037,.011,.63]} color="#e4c17d"/>)}
    <Line points={[[-1.2,.039,-1.13],[-.3,.039,-1.13],[-.3,.039,-.23]]} color="#b4ded7" dashed dashSize={.07} gapSize={.06} lineWidth={2}/>
    <Line points={[[-.62,.042,-1.24],[-.47,.042,-1.13],[-.62,.042,-1.02]]} color="#d8e9df" lineWidth={2}/>
    <Line points={[[-.40,.042,-.63],[-.30,.042,-.48],[-.20,.042,-.63]]} color="#d8e9df" lineWidth={2}/>
    <group position={[rover.x,.035,rover.z]} rotation={[0,rover.yaw,0]}>
      <group onClick={()=>select(0)}>
        <Box at={[0,.29,0]} size={[1.18,.095,1.41]} color={selected===0?'#b08352':'#37616c'} metal={.41}/>
        <Box at={[0,.388,0]} size={[1.04,.085,1.28]} color="#697981" metal={.55}/>
        <Box at={[0,.448,-.43]} size={[.53,.075,.26]} color="#283844"/>
        <Box at={[-.33,.449,.27]} size={[.23,.062,.35]} color="#3f6981"/>
        <Box at={[.36,.449,.28]} size={[.22,.061,.32]} color="#375b51"/>
        <Box at={[0,.353,.708]} size={[.96,.10,.11]} color="#82929a" metal={.43}/>
      </group>
      {wheelPoints.map((at,i)=><group key={i} position={at} rotation={[rover.spin[i],0,0]} onClick={()=>select(i%2?2:1)}>
        <OmniWheelPart hand={i===0||i===3?1:-1} selected={selected===(i%2?2:1)}/>
      </group>)}
      <Line points={[[.38,.48,.28],[.29,.54,.09],[.26,.49,-.37],[.09,.51,-.46]]} color="#d58659" lineWidth={2}/>
      <Line points={[[-.34,.48,.23],[-.27,.49,-.16],[-.19,.57,-.30]]} color="#75a9cf" lineWidth={2}/>
      <Mechanism pose={{...rover.arm,height:rover.arm.height-.035}} {...{selected,select}}/>
      {anchors.map((at,i)=><Marker key={i} index={i} at={at} {...{selected,select}}/>)}
    </group>
    <Marker index={4} at={(()=>{const p=jawWorld(rover);return [p[0]+.18,p[1]+.22,p[2]+.13];})()} {...{selected,select}}/>
    <Box at={rover.holding?jawWorld(rover):rover.block} size={[.147,.184,.155]} color={rover.delivered?'#b9d7a2':'#e5ad65'}/>
    <ContactShadows position={[0,.031,0]} opacity={.38} scale={6.7} blur={2.2} far={1.2} resolution={128}/>
  </>;
}

export default function OmniArmVehicleDemo(){
  const [draft,setDraft]=useState(omniExample);
  const [rover,setRover]=useState(initial);
  const [run,setRun]=useState<Run|null>(null);
  const [status,setStatus]=useState('Ready to run the example program');
  const [selected,select]=useState(0);
  const action=run?.steps[run.index];
  const [forward,side,turn]=action&&'drive' in action?action.drive:[0,0,0];
  const wheels=omniWheels(forward,side,turn);
  const visibleSteps=run?.steps??parseOmni(draft);
  useEffect(()=>{
    if(!run)return;
    const step=run.steps[run.index];
    const timer=window.setInterval(()=>{
      const now=performance.now();
      const progress=Math.min(1,(now-run.at)/step.ms);
      const next=stepPose(step,run.start,progress);
      if(progress<1){setRover(next);return;}
      window.clearInterval(timer);
      const finished=finish(step.key,next);
      setRover(finished);
      const nextStep=run.steps[run.index+1];
      if(!nextStep){
        setRun(null);
        setStatus(finished.delivered?'Program complete · Block delivered':finished.holding?'Program complete · Block held':'Program complete · Block undelivered');
      }else if('drive' in nextStep&&!finished.stowed){
        setRun(null);setStatus('Drive interlock · Stow arm with H before moving');
      }else{
        setRun({...run,index:run.index+1,at:now,start:finished});
        setStatus('Running · '+nextStep.label);
      }
    },25);
    return ()=>window.clearInterval(timer);
  },[run]);
  function start(){
    const steps=parseOmni(draft);
    if(!steps){setStatus('Enter 1–12 valid action letters');return;}
    if('drive' in steps[0]&&!rover.stowed){setStatus('Drive interlock · Stow arm with H before moving');return;}
    setRun({steps,index:0,at:performance.now(),start:rover});
    setStatus('Running · '+steps[0].label);
  }
  function stop(){
    setRun(null);
    if(action&&!('drive' in action))setRover(value=>({...value,stowed:false}));
    setStatus('Stopped · Wheel drive disabled and queue cleared');
  }
  const armState=rover.holding?'Holding block':rover.stowed?'Stowed':'Deployed';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D Mecanum arm transfer course">
        <Canvas camera={{position:[2.8,4.05,5.45],fov:44}} dpr={[1,1.6]} fallback={<p>Use the action and wheel readouts to follow the program.</p>}>
          <Field {...{rover,selected,select}}/>
          <OrbitControls target={[0,.48,.06]} minDistance={3.4} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Omni vehicle readings">
        <div><span>Current action</span><strong>{action?.label??'Stopped'}</strong></div>
        <div><span>Arm</span><strong>{armState}</strong></div>
        <div><span>Payload</span><strong>{rover.delivered?'Delivered':rover.holding?'Held':'On surface'}</strong></div>
      </div>
      <div className="gp-omni-wheels" aria-label="Four wheel directions">
        {['Front left','Front right','Rear left','Rear right'].map((name,i)=><div key={name}><span>{name}</span><strong>{wheels[i]>0?'Forward':wheels[i]<0?'Reverse':'Off'}</strong></div>)}
      </div>
    </div>
    <div className="gp-guide gp-omni-program">
      <h3>Program a block transfer</h3>
      <p>Run the example from the starting mark or build your own sequence. Use Reset course to put the vehicle and block back at their original positions.</p>
      <form onSubmit={event=>{event.preventDefault();start();}}>
        <label htmlFor="omni-program">Action sequence</label>
        <input id="omni-program" autoComplete="off" spellCheck={false} value={draft} disabled={!!run} onChange={event=>setDraft(event.target.value)} maxLength={35}/>
        <div className="gp-steps">
          <button type="submit" className="gp-button" disabled={!!run}>Run program</button>
          <button type="button" disabled={!run} onClick={stop}>Stop program</button>
          <button type="button" disabled={!!run} onClick={()=>setDraft(omniExample)}>Load example</button>
          <button type="button" onClick={()=>{setRun(null);setRover(initial);setStatus('Course reset · Ready to run');}}>Reset course</button>
        </div>
      </form>
      {!!visibleSteps&&<ol className="gp-omni-queue" aria-label="Program steps">
        {visibleSteps.map((step,i)=><li key={i} aria-current={run?.index===i?'step':undefined}>
          <span>{i+1}</span>{step.label}
        </li>)}
      </ol>}
      <div className="gp-steps" role="group" aria-label="Add program actions">
        {omniActions.map(({key,label})=><button key={key} type="button" title={label}
          aria-label={'Add '+label} disabled={!!run||draft.replace(/\s/g,'').length>=omniLimit}
          onClick={()=>setDraft(value=>value+key)}><kbd>{key}</kbd> {label}</button>)}
      </div>
      <p role="status" className="gp-demo-description">{status}</p>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={i===selected} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
