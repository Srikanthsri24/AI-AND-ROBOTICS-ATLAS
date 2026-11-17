import { useEffect,useRef,useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows,Line,OrbitControls } from '@react-three/drei';
import { Shape } from 'three';
import { initialShake,shakeLimits,shakeSample,type Acceleration,type ShakeState } from '../data/shake-monitor';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { Uno } from './ClassroomStationsDemo';
import { ShakeSensorPart } from './ShakeMonitorParts';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Mode='quiet'|'tap'|'shake';
const labels=[
  ['Sliding shake plate','The rails constrain motion to one direction. The house and sensor move with the plate while the Uno stays on the base.'],
  ['MPU6050 accelerometer','The sensor measures acceleration on three axes. The Uno removes the slowly changing baseline, then combines the changes into one reading in g.'],
  ['Arduino Uno','The Uno compares recent motion with 0.16 g. It needs 30 consecutive samples above that line to latch the alert.'],
  ['Alert LEDs and piezo','Green indicates monitoring. A shake alert pulses the red lamp and piezo. A steady red lamp indicates a missing sensor.'],
  ['Reset switch','Reset clears the latched alert once the rolling reading has been below 0.06 g for a full second.'],
] as const;

const roofGable=new Shape();
roofGable.moveTo(-.59,.825);
roofGable.lineTo(.59,.825);
roofGable.lineTo(0,1.04);
roofGable.closePath();

function House(){
  return <group position={[-.24,.12,-.14]}>
    <Box at={[0,.022,0]} size={[1.47,.07,.98]} color="#8c8580"/>
    <Box at={[0,.452,0]} size={[1.18,.78,.81]} color="#c8ab82"/>
    <mesh position={[0,0,-.405]}><extrudeGeometry args={[roofGable,{depth:.81,bevelEnabled:false}]}/><meshStandardMaterial color="#c8ab82"/></mesh>
    {[-.25,.25].map(side=><group key={side} position={[side,.955,0]} rotation={[0,0,side<0?.34:-.34]}>
      <Box at={[0,.014,0]} size={[.69,.072,.98]} color="#635a5f" metal={.20}/>
      {Array.from({length:5},(_,i)=><Box key={i} at={[0,.057,(i-2)*.17]} size={[.63,.013,.019]} color="#777076"/>)}
    </group>)}
    {[-.342,.34].map(x=><group key={x} position={[x,.48,.416]}>
      <Box at={[0,0,0]} size={[.219,.239,.025]} color="#786653"/>
      <Box at={[0,0,.015]} size={[.165,.189,.012]} color="#7697a0" metal={.27}/>
      <Box at={[0,0,.029]} size={[.012,.19,.012]} color="#aa997a"/>
    </group>)}
    <Box at={[.005,.247,.418]} size={[.238,.39,.028]} color="#77634e"/>
    <Box at={[.074,.247,.438]} size={[.024,.025,.017]} color="#d1af70" metal={.38}/>
  </group>;
}
function Marker({i,at,selected,select}:{i:number;at:Point;selected:number;select:(i:number)=>void}){
  return <WorldLabel position={at} className="gp-marker-anchor">
    <button type="button" className="gp-marker" aria-label={labels[i][0]} aria-pressed={selected===i} onClick={()=>select(i)}>
      {i+1}{selected===i&&<span className="gp-demo-marker-name">{labels[i][0]}</span>}
    </button>
  </WorldLabel>;
}
function ShakeBench({travel,alarm,ready,fault,pulse,selected,select}:{
  travel:number;alarm:boolean;ready:boolean;fault:boolean;pulse:boolean;selected:number;select:(id:number)=>void;
}){
  return <>
    <color attach="background" args={['#243a4b']}/>
    <hemisphereLight args={['#e2efff','#665442',2.29]}/>
    <directionalLight position={[-4,7,5]} intensity={2.66}/>
    <Box at={[0,-.14,0]} size={[6.48,.25,4.11]} color="#556c78"/>
    <Box at={[-.83,.055,-.16]} size={[3.90,.11,2.16]} color="#6b7369"/>
    {[-.96,.67].map(z=><group key={z} position={[-.83,.178,z]}>
      <Box at={[0,-.057,0]} size={[3.59,.067,.14]} color="#4c5c63"/>
      <mesh rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.034,.034,3.52,20]}/><meshStandardMaterial color="#a3b2b5" metalness={.68}/></mesh>
      {[-1.69,1.69].map(x=><Box key={x} at={[x,.002,0]} size={[.17,.16,.18]} color="#54616a"/>)}
    </group>)}
    <group position={[-.91+travel,.255,-.15]}>
      <group onClick={()=>select(0)}>
        <Box at={[0,0,0]} size={[2.64,.092,1.55]} color={selected===0?'#ba9460':'#7d9193'} metal={.46}/>
        <Box at={[0,.057,0]} size={[2.50,.033,1.43]} color="#9b9f91"/>
        {[-1.08,1.06].flatMap(x=>[-.69,.68].map(z=><Box key={x+':'+z} at={[x,-.10,z]} size={[.25,.13,.18]} color="#5b717d" metal={.46}/>))}
        <Box at={[-1.51,.05,.34]} size={[.51,.055,.106]} color="#667780" metal={.56}/>
        <Box at={[-1.76,.05,.34]} size={[.19,.15,.38]} color="#38474e"/>
      </group>
      <House/>
      <group position={[.88,.114,.40]} rotation={[0,Math.PI/2,0]} scale={.75} onClick={()=>select(1)}><ShakeSensorPart selected={selected===1}/></group>
      <Marker i={0} at={[-1.06,.39,.65]} {...{selected,select}}/>
      <Marker i={1} at={[.79,.48,.58]} {...{selected,select}}/>
    </group>
    <group position={[1.81,.095,-.40]} onClick={()=>select(2)}>
      <Box at={[0,-.066,0]} size={[1.43,.092,1.11]} color={selected===2?'#c6a170':'#596f79'}/>
      <group scale={1.45}><Uno at={[0,0,0]}/></group>
    </group>
    <Line points={[[travel-.03,.38,.21],[travel+.48,.27,.49],[.66,.16,.46],[1.22,.21,-.27]]} color="#d49868" lineWidth={2.7}/>
    <group position={[1.73,.105,.76]}>
      <Box at={[0,-.015,0]} size={[1.49,.153,.66]} color="#3d5967"/>
      <group onClick={()=>select(3)}>
        {[-.49,-.23].map((x,i)=><mesh key={x} position={[x,.108,.087]}>
          <sphereGeometry args={[.063,22,17]}/><meshStandardMaterial color={i?'#984347':'#377650'} emissive={i?'#ff3627':'#4fdd81'} emissiveIntensity={(i?fault||pulse:ready&&!alarm)?1.8:0}/>
        </mesh>)}
        <mesh position={[.096,.12,.05]}><cylinderGeometry args={[.098,.098,.104,25]}/><meshStandardMaterial color={selected===3?'#d4a46e':'#252f38'}/></mesh>
        <mesh position={[.096,.175,.05]}><cylinderGeometry args={[.027,.027,.012,18]}/><meshBasicMaterial color="#181e25"/></mesh>
      </group>
      <group position={[.49,.088,.096]} onClick={()=>select(4)}>
        <Box at={[0,0,0]} size={[.192,.077,.213]} color="#27323a"/>
        <mesh position={[0,.06,0]}><cylinderGeometry args={[.064,.064,.056,22]}/><meshStandardMaterial color={selected===4?'#e5bc79':'#64738f'}/></mesh>
      </group>
    </group>
    {pulse&&<pointLight position={[1.51,.32,.87]} color="#ff6250" intensity={3} distance={1.18}/>}
    <Marker i={2} at={[1.72,.59,-.43]} {...{selected,select}}/>
    <Marker i={3} at={[1.50,.52,.77]} {...{selected,select}}/>
    <Marker i={4} at={[2.30,.39,1.01]} {...{selected,select}}/>
    <ContactShadows position={[0,.024,0]} opacity={.37} scale={6.4} blur={2.3} far={1.3} resolution={128} frames={1}/>
  </>;
}

type Lab={data:ShakeState;mode:Mode;phase:number;boot:number;trace:number[];motion:number;clock:number;fault:boolean};
const initialLab:Lab={data:initialShake,mode:'quiet',phase:0,boot:0,trace:[],motion:0,clock:0,fault:false};
function samplePattern(mode:Mode,phase:number):{values:Acceleration;travel:number}{
  if(mode==='tap'){
    const jolt=Math.max(0,1-phase/6);
    return {values:[.63*jolt,0,1],travel:.13*jolt*Math.sin(phase*1.8)};
  }
  if(mode==='shake'){
    const wave=phase*Math.PI*2/12;
    return {values:[.36*Math.sin(wave),.08*Math.cos(wave),1],travel:.15*Math.sin(wave)};
  }
  return {values:[0,0,1],travel:0};
}
function MotionTrace({trace}:{trace:number[]}){
  const ref=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const canvas=ref.current;
    const ctx=canvas?.getContext('2d');
    if(!canvas||!ctx)return;
    const w=canvas.width,h=canvas.height;
    const px=(value:number)=>h-12-Math.min(.38,value)/.38*(h-24);
    ctx.clearRect(0,0,w,h);
    ctx.strokeStyle='#284559';ctx.lineWidth=1;
    for(let col=1;col<8;col++){ctx.beginPath();ctx.moveTo(col*w/8,0);ctx.lineTo(col*w/8,h);ctx.stroke();}
    ctx.strokeStyle='#f2ae67';ctx.setLineDash([8,6]);ctx.beginPath();ctx.moveTo(0,px(shakeLimits.threshold));ctx.lineTo(w,px(shakeLimits.threshold));ctx.stroke();
    ctx.strokeStyle='#99e0d0';ctx.setLineDash([]);ctx.lineWidth=3;ctx.beginPath();
    trace.forEach((value,i)=>{const x=w-(trace.length-1-i)*w/109;if(i===0)ctx.moveTo(x,px(value));else ctx.lineTo(x,px(value));});
    ctx.stroke();
  },[trace]);
  return <figure className="gp-shake-trace">
    <figcaption><strong>Rolling motion</strong><span>Dashed line · 0.16 g</span></figcaption>
    <canvas width="700" height="118" ref={ref} role="img" aria-label="Recent motion values and 0.16 g alert threshold"/>
  </figure>;
}
export default function ShakeMonitorDemo(){
  const [lab,setLab]=useState(initialLab);
  const [selected,select]=useState(1);
  const [notice,setNotice]=useState('');
  const [sound,setSound]=useState(false);
  const audio=useRef<AudioContext|null>(null);
  useEffect(()=>{
    const timer=window.setInterval(()=>setLab(previous=>{
      if(previous.fault)return previous;
      if(previous.boot<50)return {...previous,boot:previous.boot+1};
      const phase=previous.phase+1;
      const pattern=samplePattern(previous.mode,phase);
      const state=shakeSample(previous.data,pattern.values);
      return {...previous,data:state,phase,clock:previous.clock+1,motion:pattern.travel,
        mode:previous.mode==='tap'&&phase>7?'quiet':previous.mode,
        trace:[...previous.trace.slice(-109),state.rms]};
    }),shakeLimits.sampleMs);
    return ()=>window.clearInterval(timer);
  },[]);
  const ready=lab.boot>=50&&!lab.fault;
  const pulse=ready&&lab.data.latched&&Math.floor(lab.clock/12)%2===0;
  useEffect(()=>{
    const context=audio.current;
    if(!sound||!pulse||!context||context.state==='closed')return;
    const tone=context.createOscillator(),gain=context.createGain();
    tone.frequency.value=1850;gain.gain.value=.025;
    tone.connect(gain).connect(context.destination);tone.start();
    return ()=>{tone.stop();tone.disconnect();gain.disconnect();};
  },[sound,pulse]);
  useEffect(()=>()=>{if(audio.current)void audio.current.close();},[]);
  async function toggleSound(){
    if(sound){setSound(false);return;}
    try{audio.current??=new AudioContext();await audio.current.resume();setSound(true);}
    catch{setNotice('Audio unavailable. Watch the red lamp.');}
  }
  function mode(value:Mode){setNotice('');setLab(previous=>({...previous,mode:value,phase:0}));}
  function reset(){
    if(!ready||lab.data.quiet<shakeLimits.quiet){setNotice('Reset needs one quiet second.');return;}
    setLab(previous=>({...previous,data:{...previous.data,latched:false}}));
    setNotice('Alert cleared.');
  }
  const status=lab.fault?'Sensor disconnected · Fault light on':!ready?'Calibrating · Keep the plate still'
    :lab.data.latched?'Shake alert latched':lab.data.high>0?'Checking sustained motion':'Monitoring the table';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D Arduino earthquake shake table">
        <Canvas camera={{position:[2.8,4.35,6.9],fov:43}} dpr={[1,1.6]} fallback={<p>Use the motion trace and status panel to run each trial.</p>}>
          <ShakeBench travel={lab.motion} alarm={lab.data.latched} fault={lab.fault} {...{ready,pulse,selected,select}}/>
          <OrbitControls target={[0,.33,.02]} minDistance={3.7} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Shake monitor readings">
        <div><span>Rolling motion</span><strong>{ready?lab.data.rms.toFixed(3)+' g':'—'}</strong></div>
        <div><span>Samples over threshold</span><strong>{lab.data.high} / 30</strong></div>
        <div><span>Quiet before reset</span><strong>{(lab.data.quiet*.02).toFixed(2)} s</strong></div>
      </div>
      <MotionTrace trace={lab.trace}/>
    </div>
    <div className="gp-guide">
      <h3>Compare a tap and sustained shaking</h3>
      <p>Tap once and watch how quickly the trace settles. Then shake the table to trigger the alert. Stop the platform and wait for one quiet second before resetting.</p>
      <div className="gp-steps">
        <button type="button" disabled={!ready||lab.mode==='shake'} onClick={()=>mode('tap')}>Tap the table</button>
        <button type="button" className="gp-button" disabled={!ready} onClick={()=>mode(lab.mode==='shake'?'quiet':'shake')}>{lab.mode==='shake'?'Stop shaking':'Shake the table'}</button>
        <button type="button" className="gp-button gp-secondary" onClick={reset}>Reset alert</button>
      </div>
      <div className="gp-steps">
        <button type="button" aria-pressed={lab.fault} onClick={()=>{setNotice('');setLab(previous=>{
          return {...initialLab,fault:!previous.fault,data:{...initialShake,latched:previous.data.latched}};
        });}}>{lab.fault?'Reconnect sensor':'Disconnect sensor'}</button>
        <button type="button" aria-pressed={sound} onClick={()=>void toggleSound()}>Alert sound</button>
      </div>
      <p role="status" className="gp-demo-description">{status}{notice&&' · '+notice}</p>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={i===selected} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
