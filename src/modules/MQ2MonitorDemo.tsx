import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { CanvasTexture, RepeatWrapping, type Group } from 'three';
import { aboveBaseline, mq2Thresholds, mq2Window } from '../data/mq2-monitor';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Scenario='air'|'gas'|'perfume';
const scenarioTarget={air:174,gas:388,perfume:388};
const benchParts=[
  {name:'MQ-2 sensor',at:[-1.77,.65,-.27],tag:[-2.14,1.19,-.14],explanation:'The metal mesh surrounds the heated sensing element. Both simulated sources can raise AOUT, so the reading alone cannot tell them apart.'},
  {name:'Signal divider',at:[-.25,.255,.65],tag:[-.59,.86,.78],explanation:'Two equal 10 kΩ resistors reduce the AOUT voltage seen by A0. The ground reference is shared across both supplies.'},
  {name:'Arduino Uno',at:[1.32,.30,-.36],tag:[1.62,1.08,-.32],explanation:'The Uno averages eight readings, subtracts the saved baseline, and switches D6 using separate rising and falling thresholds.'},
  {name:'Red threshold LED',at:[.46,.43,.64],tag:[.76,.94,1.02],explanation:'D6 supplies current through the 220 Ω resistor. The light shows that the averaged reading crossed the experimental limit.'},
] satisfies {name:string;at:Point;tag:Point;explanation:string}[];

function Panel({at,size,color,metal=0}: {at:Point;size:Point;color:string;metal?:number}) {
  return <RoundedBox position={at} args={size} radius={.021} smoothness={2}>
    <meshStandardMaterial color={color} metalness={metal} roughness={.62}/>
  </RoundedBox>;
}

export function MQ2Module({selected=false}: {selected?:boolean}) {
  const meshTexture=useMemo(()=>{
    const canvas=document.createElement('canvas');
    canvas.width=16;canvas.height=16;
    const context=canvas.getContext('2d');
    if(context){
      context.fillStyle='#3b4144';context.fillRect(0,0,16,16);
      context.strokeStyle='#a0a5a7';context.lineWidth=4;
      context.beginPath();context.moveTo(0,0);context.lineTo(16,16);context.stroke();
      context.strokeStyle='#c0c4c4';context.lineWidth=3;
      context.beginPath();context.moveTo(0,16);context.lineTo(16,0);context.stroke();
    }
    const texture=new CanvasTexture(canvas);
    texture.wrapS=texture.wrapT=RepeatWrapping;
    texture.repeat.set(20,13);
    return texture;
  },[]);
  useEffect(()=>()=>meshTexture.dispose(),[meshTexture]);
  return <>
    <Panel at={[0,.02,0]} size={[1.33,.06,.70]} color={selected?'#517e9e':'#194b89'}/>
    {[[-.59,-.27],[-.59,.27],[.58,-.27],[.58,.27]].map(([x,z])=><mesh key={`${x}:${z}`} position={[x,.058,z]} rotation={[-Math.PI/2,0,0]}>
      <ringGeometry args={[.032,.054,18]}/><meshStandardMaterial color="#c0c5c2" metalness={.66}/>
    </mesh>)}
    <mesh position={[-.30,.103,0]}><cylinderGeometry args={[.297,.297,.089,42]}/><meshStandardMaterial color="#bac1be" metalness={.72} roughness={.31}/></mesh>
    <mesh position={[-.30,.233,0]}><cylinderGeometry args={[.226,.236,.224,44]}/><meshStandardMaterial color="#d7d6cc" metalness={.42} roughness={.57} map={meshTexture}/></mesh>
    <mesh position={[-.30,.348,0]} rotation={[-Math.PI/2,0,0]}><circleGeometry args={[.217,44]}/>
      <meshStandardMaterial color="#d7d6cc" metalness={.38} roughness={.62} map={meshTexture}/>
    </mesh>
    <Panel at={[.50,.094,0]} size={[.15,.125,.43]} color="#252b34"/>
    {[-.156,-.052,.052,.156].map(z=><Panel key={z} at={[.664,.10,z]} size={[.25,.029,.029]} color="#bec1ba" metal={.69}/>)}
    <Panel at={[.28,.065,-.17]} size={[.15,.041,.090]} color="#232830"/>
    <Panel at={[.256,.065,.16]} size={[.090,.042,.063]} color="#bbe37f"/>
    <Panel at={[.404,.065,-.21]} size={[.075,.042,.055]} color="#d2d5c8"/>
  </>;
}

function Molecules({scenario}: {scenario:Scenario}) {
  const cloud=useRef<Group>(null);
  useFrame(({clock})=>{
    cloud.current?.children.forEach((particle,i)=>{
      const t=(clock.elapsedTime*.48+i*.127)%1;
      particle.position.set(-3.02+t*1.08,.52+t*.22+Math.sin(i*2+t*6)*.16,-.49+Math.sin(i*.9+t*4)*.29);
      particle.scale.setScalar(.4+Math.sin(t*Math.PI)*.62);
    });
  });
  return <group ref={cloud} visible={scenario!=='air'}>
    {Array.from({length:8},(_,i)=><mesh key={i}><sphereGeometry args={[.085,12,8]}/>
      <meshBasicMaterial color={scenario==='gas'?'#ffca79':'#ba9de6'} opacity={.46} transparent/>
    </mesh>)}
  </group>;
}

const Workbench=memo(function Workbench({scenario,alert,selected,select}: {
  scenario:Scenario;alert:boolean;selected:number;select:(index:number)=>void;
}) {
  return <>
    <color attach="background" args={['#24394a']}/>
    <ambientLight intensity={1.24}/><directionalLight position={[3,7,5]} intensity={2.73}/>
    <directionalLight position={[-5,5,-3]} intensity={1.28} color="#b2c9ed"/>
    <Panel at={[0,-.125,0]} size={[6.58,.22,3.52]} color="#846451"/>
    <Panel at={[0,.013,0]} size={[6.45,.066,3.39]} color="#526e72"/>
    <Panel at={[-1.55,.13,-.24]} size={[1.59,.16,1.02]} color="#aeb6b7" metal={.42}/>
    <group position={[-1.55,.25,-.24]}><MQ2Module selected={selected===0}/></group>
    <Panel at={[.06,.148,.70]} size={[1.59,.206,.83]} color="#e1ded4"/>
    <Panel at={[.06,.253,.68]} size={[1.46,.014,.077]} color="#a3a6a4"/>
    {Array.from({length:14},(_,column)=>[.392,.481,.58,.79,.88,.965].map(z=>
      <Panel key={`${column}:${z}`} at={[-.59+column*.10,.254,z]} size={[.029,.01,.029]} color="#747b7d"/>
    ))}
    {[-.36,-.05].map(x=><group key={x} position={[x,.306,.54]}>
      <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.038,.038,.21,18]}/>
        <meshStandardMaterial color={selected===1?'#e4bb6c':'#cdb087'}/>
      </mesh>
      {[-.07,-.034,.006,.064].map((z,i)=><mesh key={z} position={[0,0,z]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[.039,.039,.018,14]}/><meshStandardMaterial color={['#69402b','#27282a','#dc8148','#ae935b'][i]}/>
      </mesh>)}
    </group>)}
    <Panel at={[1.31,.18,-.39]} size={[1.42,.09,.86]} color={selected===2?'#b9884d':'#16849a'}/>
    <Panel at={[.73,.28,-.40]} size={[.20,.158,.30]} color="#b5c3c7" metal={.66}/>
    <Panel at={[1.20,.25,-.21]} size={[.31,.060,.18]} color="#2a333d"/>
    {[-.73,-.07].map(z=><Panel key={z} at={[1.53,.262,z]} size={[.88,.08,.074]} color="#293137"/>)}
    <Panel at={[1.64,.251,-.41]} size={[.17,.038,.11]} color="#a1acb1" metal={.50}/>
    <mesh position={[.46,.361,.64]}><cylinderGeometry args={[.075,.075,.18,24]}/>
      <meshStandardMaterial color={alert?'#ff4534':selected===3?'#b85946':'#7e3739'} emissive="#ff2818" emissiveIntensity={alert?2.7:0}/>
    </mesh>
    <mesh position={[.46,.449,.64]}><sphereGeometry args={[.075,20,12,0,Math.PI*2,0,Math.PI/2]}/>
      <meshStandardMaterial color={alert?'#ff7045':'#8d4141'} emissive="#ff2514" emissiveIntensity={alert?2.9:0}/>
    </mesh>

    <group position={[.57,.294,.81]} rotation={[0,0,Math.PI/2]}>
      <mesh><cylinderGeometry args={[.027,.027,.155,16]}/><meshStandardMaterial color="#cab08a"/></mesh>
      {[-.052,-.022,.018,.049].map((y,i)=><mesh key={y} position={[0,y,0]}>
        <cylinderGeometry args={[.028,.028,.013,12]}/><meshStandardMaterial color={['#aa3f36','#aa3f36','#74442e','#b8a259'][i]}/>
      </mesh>)}
    </group>
    <Line points={[[.49,.294,.81],[.42,.264,.80],[.428,.26,.648]]} color="#a1a5a2" lineWidth={1.5}/>
    <pointLight position={[.46,.50,.64]} intensity={alert ? .71 : 0} color="#ff4828" distance={1.0}/>
    <Panel at={[2.54,.20,.62]} size={[.91,.29,.66]} color="#363e46"/>
    <Panel at={[2.20,.29,.62]} size={[.12,.115,.19]} color="#607464"/>
    <Line points={[[2.2,.28,.64],[1.94,.34,1.17],[.46,.18,1.30],[-1.26,.18,1.15],[-.84,.37,-.11]]} color="#c6655c" lineWidth={2.3}/>
    <Line points={[[-.83,.36,-.13],[-.60,.40,.05],[-.69,.28,.55],[-.36,.30,.54],[-.19,.31,.58],[.43,.32,.35],[.95,.29,-.05]]}
      color="#e2ba72" lineWidth={2.1}/>
    <Line points={[[2.2,.26,.69],[2.0,.34,1.20],[.70,.20,1.44],[-.54,.20,1.33],[-.86,.35,-.21]]} color="#343d43" lineWidth={2.1}/>
    <Line points={[[1.44,.29,-.05],[1.37,.45,.24],[.87,.39,.54],[.65,.294,.81]]} color={alert?'#ffad67':'#9b83ad'} lineWidth={2.1}/>
    <Molecules scenario={scenario}/>
    {benchParts.map(({name,at,tag},index)=><group key={name}>
      <Line points={[at,tag]} color={selected===index?'#ffdf95':'#bfcdd7'} lineWidth={1.42}/>
      <WorldLabel position={tag} className="gp-marker-anchor">
        <button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button>
      </WorldLabel>
    </group>)}
    <ContactShadows position={[0,.03,0]} opacity={.43} blur={2.25} scale={8} far={4}/>
  </>;
});

type Sample={raw:number; average:number};
const firstSample={raw:174,average:174};
type Readings={signal:number; sample:number; history:Sample[]; baseline:number|null; alert:boolean};
const initial:Readings={signal:174,sample:0,history:[firstSample],baseline:null,alert:false};
function sample(previous:Readings,scenario:Scenario):Readings {
  const target=scenarioTarget[scenario];
  const rate=scenario==='perfume' ? .23 : scenario==='gas' ? .12 : .15;
  const signal=previous.signal+(target-previous.signal)*rate;
  const raw=Math.round(signal+3*Math.sin(previous.sample*1.7));
  const recent=[...previous.history.slice(1-mq2Window).map(row=>row.raw),raw];
  const average=Math.floor(recent.reduce((total,value)=>total+value,0)/recent.length);
  return {signal,sample:previous.sample+1,history:[...previous.history.slice(-89),{raw,average}],
    baseline:previous.baseline,alert:aboveBaseline(average,previous.baseline,previous.alert)};
}

function Trend({history,baseline}: {history:Sample[];baseline:number|null}) {
  const canvas=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const ctx=canvas.current?.getContext('2d');
    if(!ctx) return;
    const {width,height}=ctx.canvas;
    const y=(value:number)=>height-19-value*(height-34)/520;
    ctx.fillStyle='#162c39';ctx.fillRect(0,0,width,height);
    ctx.font='13px system-ui';ctx.fillStyle='#bacdd4';
    for(const value of [0,130,260,390,520]){
      ctx.strokeStyle='#3c5561';ctx.lineWidth=1;
      ctx.beginPath();ctx.moveTo(35,y(value));ctx.lineTo(width-8,y(value));ctx.stroke();
      ctx.fillText(String(value),4,y(value)+4);
    }
    if(baseline!==null){
      [[baseline,'#86a4b2'],[baseline+mq2Thresholds.on,'#e8b765'],[baseline+mq2Thresholds.off,'#c58b64']].forEach(([reading,color])=>{
        ctx.strokeStyle=String(color);
        ctx.setLineDash([5,4]);ctx.beginPath();ctx.moveTo(35,y(Number(reading)));ctx.lineTo(width-8,y(Number(reading)));ctx.stroke();
      });
      ctx.setLineDash([]);
    }
    (['raw','average'] as const).forEach(key=>{
      ctx.beginPath();ctx.strokeStyle=key==='raw'?'#718e9f':'#7ce3d5';ctx.lineWidth=key==='raw'?1:2.30;
      history.forEach((row,i)=>{
        const x=width-9-(history.length-1-i)*(width-46)/89;
        const value=y(row[key]);
        if(i===0)ctx.moveTo(x,value);else ctx.lineTo(x,value);
      });
      ctx.stroke();
    });
  },[history,baseline]);
  return <figure className="gp-mq2-trend">
    <canvas ref={canvas} width={640} height={168} aria-label="Recent raw and averaged ADC counts with baseline and threshold lines" role="img"/>
    <figcaption>Gray raw signal · Teal average · Dashed baseline and limits</figcaption>
  </figure>;
}

export default function MQ2MonitorDemo() {
  const [scenario,setScenario]=useState<Scenario>('air');
  const [readings,setReadings]=useState(initial);
  const [selected,setSelected]=useState(0);
  const last=readings.history.at(-1)??firstSample;
  const captureReady=scenario==='air'&&Math.abs(readings.signal-scenarioTarget.air)<7&&readings.history.length>=mq2Window;
  useEffect(()=>{
    const timer=window.setInterval(()=>setReadings(previous=>sample(previous,scenario)),100);
    return ()=>window.clearInterval(timer);
  },[scenario]);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive 3D MQ-2 bench">
        <Canvas dpr={[1,1.5]} camera={{position:[2.8,4.7,7.6],fov:41}} fallback={<p>The exposure controls and signal plot are available without WebGL.</p>}>
          <Workbench scenario={scenario} alert={readings.alert} selected={selected} select={setSelected}/>
          <OrbitControls target={[0,.20,0]} minDistance={4} maxDistance={12} enablePan={false} maxPolarAngle={Math.PI/2.08}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="MQ-2 readings">
        <div><span>Average A0</span><strong>{last.average} counts</strong></div>
        <div><span>Change from baseline</span><strong>{readings.baseline===null?'Set baseline':`${last.average-readings.baseline} counts`}</strong></div>
        <div><span>Threshold LED</span><strong>{readings.alert?'On':'Off'}</strong></div>
      </div>
      <Trend history={readings.history} baseline={readings.baseline}/>
    </div>
    <div className="gp-guide">
      <h3>Compare two simulated sources</h3>
      <p>Capture a clean-air baseline first. Apply either source and watch the raw reading, the average and the LED. Return to clean air to see the recovery.</p>
      <div className="gp-steps">
        <button className="gp-button" type="button" disabled={!captureReady}
          onClick={()=>setReadings(previous=>({...previous,baseline:previous.history.at(-1)?.average??null,alert:false}))}>Capture baseline</button>
        <button type="button" onClick={()=>{setScenario('air');setReadings(initial);}}>Reset bench</button>
      </div>
      <div className="gp-steps" aria-label="Exposure choice">
        <button type="button" aria-pressed={scenario==='air'} onClick={()=>setScenario('air')}>Clean air</button>
        <button type="button" aria-pressed={scenario==='gas'} disabled={readings.baseline===null} onClick={()=>setScenario('gas')}>Simulate gas</button>
        <button type="button" aria-pressed={scenario==='perfume'} disabled={readings.baseline===null} onClick={()=>setScenario('perfume')}>Simulate perfume</button>
      </div>
      <p className="gp-demo-description" role="status">
        {readings.baseline===null?'Wait for eight clean-air samples, then capture the baseline.':readings.alert?'The signal reached the upper limit. The indicator stays on until the average falls to the lower limit.':'The indicator is off. It turns on when the average rises 90 counts above baseline.'}
      </p>
      <p>Both scenarios deliberately converge near the same reading. The plotted values are simulated ADC counts.</p>
      <h4>Inspect the bench</h4>
      <ol className="gp-demo-labels">{benchParts.map(({name},index)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{benchParts[selected].explanation}</p>
    </div>
  </div>;
}
