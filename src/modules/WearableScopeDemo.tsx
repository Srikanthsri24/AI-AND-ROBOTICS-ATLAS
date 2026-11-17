import { useEffect, useMemo, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { CanvasTexture, NearestFilter, SRGBColorSpace } from 'three';
import { sampleScope, scopePeriods, scopeSignals, type ScopePeriod, type ScopeSignal } from '../data/wearable-scope';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { NanoBoard, ScopeOled } from './WearableScopeParts';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
const parts=[
  ['128×64 OLED','The Nano sends each captured frame to the OLED over A4 and A5. One sample maps to each column.'],
  ['Classic Nano','A0 reads the signal while the Nano’s hardware timer supplies the built-in test wave on D9.'],
  ['TIME · D2','Press to change the distance in time between display samples. The longer window shows more cycles.'],
  ['HOLD · D3','Freeze the last frame so you can compare peaks and count cycles. Press it again to resume.'],
  ['Signal connection · A0','The 1 kΩ resistor connects the source to A0. The bench source and Nano share a ground.'],
] as const;
const positions:Point[]=[[-.44,.86,.85],[-.44,.62,-.75],[.66,.67,-.21],[.66,.67,.39],[1.19,.32,.31]];

function Pixels({samples,period,hold}:{samples:number[];period:ScopePeriod;hold:boolean}){
  const texture=useMemo(()=>{
    const canvas=document.createElement('canvas');
    canvas.width=128;canvas.height=64;
    const value=new CanvasTexture(canvas);
    value.colorSpace=SRGBColorSpace;
    value.magFilter=NearestFilter;
    value.minFilter=NearestFilter;
    return value;
  },[]);
  useEffect(()=>()=>texture.dispose(),[texture]);
  useEffect(()=>{
    const ctx=texture.image.getContext('2d') as CanvasRenderingContext2D|null;
    if(!ctx)return;
    ctx.fillStyle='#0b1821';ctx.fillRect(0,0,128,64);
    ctx.fillStyle='#99d8ea';ctx.font='8px monospace';ctx.fillText(`${hold?'HOLD':'LIVE'}  ${period} ms/sample`,3,8);
    ctx.fillStyle='#2e4b5d';
    for(let x=0;x<128;x+=16)for(let y=12;y<64;y+=4)ctx.fillRect(x,y,1,1);
    for(let y=12;y<64;y+=17)for(let x=0;x<128;x+=4)ctx.fillRect(x,y,1,1);
    ctx.strokeStyle='#e0faff';ctx.lineWidth=1.4;ctx.beginPath();
    samples.forEach((v,i)=>i===0?ctx.moveTo(.5,62-v*9.7):ctx.lineTo(i+.5,62-v*9.7));
    ctx.stroke();texture.needsUpdate=true;
  },[texture,samples,period,hold]);
  return <mesh position={[0,.14,.02]} rotation={[-Math.PI/2,0,0]}>
    <planeGeometry args={[1.28,.64]}/><meshBasicMaterial map={texture} toneMapped={false}/>
  </mesh>;
}

function Watch({samples,period,hold,selected,select,switchTime,switchHold,source,volts}:{
  samples:number[];period:ScopePeriod;hold:boolean;selected:number;select:(index:number)=>void;
  switchTime:()=>void;switchHold:()=>void;source:ScopeSignal;volts:number;
}){
  return <>
    <color attach="background" args={['#222d3d']}/>
    <hemisphereLight args={['#e5f1ff','#58493c',2.35]}/>
    <directionalLight position={[-4,7,4]} intensity={2.4}/>
    <Box at={[0,-.125,0]} size={[5.82,.23,4.24]} color="#5c7384"/>
    <Box at={[-.42,.07,0]} size={[1.26,.13,3.77]} color="#262e35"/>
    {Array.from({length:11},(_,i)=><Box key={i} at={[-.42,.139,1.3+i*.043]} size={[1.17,.012,.011]} color="#49535a"/>)}
    <Box at={[-.42,.15,-1.72]} size={[1.34,.16,.29]} color="#64707b" metal={.50}/>
    <Box at={[-.12,.24,0]} size={[2.26,.19,2.32]} color="#bf9e78"/>
    <Box at={[-.12,.343,0]} size={[2.21,.028,2.25]} color="#685c55"/>
    {[-.91,.04].map(x=><Box key={x} at={[x,.412,.51]} size={[.14,.14,.1]} color="#c8bfac"/>)}
    <group position={[-.45,.52,.47]} onClick={()=>select(0)}>
      <ScopeOled selected={selected===0}/><Pixels {...{samples,period,hold}}/>
    </group>
    <group position={[-.44,.445,-.63]} onClick={()=>select(1)}><NanoBoard selected={selected===1}/></group>
    <Box at={[.65,.41,.10]} size={[.42,.09,1.19]} color="#f0efea"/>
    {[-.21,.39].map((z,i)=><group key={z} position={[.65,.50,z]} onClick={()=>{select(i+2);(i===0?switchTime:switchHold)();}}>
      <Box at={[0,0,0]} size={[.32,.13,.30]} color="#2b3441"/>
      <mesh position={[0,.095,0]}><cylinderGeometry args={[.101,.101,.08,28]}/>
        <meshStandardMaterial color={selected===i+2?'#dec36d':i===0?'#529db7':hold?'#dd9d52':'#58588d'}/>
      </mesh>
    </group>)}
    <Box at={[1.85,.13,.84]} size={[1.33,.19,1.42]} color={selected===4?'#ccae60':'#3c4655'}/>
    <Box at={[1.85,.235,.80]} size={[1.19,.029,1.20]} color="#333d49"/>
    <group position={[1.96,.345,.81]} rotation={[0,-volts*.45,0]}>
      <mesh><cylinderGeometry args={[.26,.28,.18,32]}/><meshStandardMaterial color={source.shape==='dc'?'#1d648f':'#283744'} roughness={.56}/></mesh>
      <Box at={[0,.093,.14]} size={[.035,.008,.15]} color="#b9d6de"/>
    </group>
    <Box at={[1.59,.265,.37]} size={[.39,.034,.22]} color="#5c6d78"/>
    <mesh position={[1.19,.23,.30]} rotation={[0,0,Math.PI/2]} onClick={()=>select(4)}>
      <cylinderGeometry args={[.046,.046,.22,22]}/><meshStandardMaterial color={selected===4?'#e9c36f':'#c4a47d'}/>
    </mesh>
    {source.shape==='square'?<Line points={[[.096,.498,-.91],[.55,.47,-.86],[1.41,.18,-.65],[1.33,.23,.30]]} color="#ebbc63" lineWidth={3}/>:<Line points={[[1.55,.29,.40],[1.33,.23,.30]]} color="#ebbc63" lineWidth={3}/>}
    <Line points={[[1.06,.23,.30],[.73,.16,.22],[.58,.40,-.72],[.15,.498,-.86]]} color={selected===4?'#ffe18b':'#d69b51'} lineWidth={3}/>
    <Line points={[[1.73,.29,.40],[1.27,.18,.20],[.50,.39,-.49],[.12,.497,-.38]]} color="#182634" lineWidth={3}/>
    {['#cc695d','#202936','#73cba2','#6eb2da'].map((color,i)=><Line key={color} points={[
      [-.60+.09*i,.60,-.15],[-.61+.12*i,.54,-.31],[-.74+.15*i,.499,-.39],
    ]} color={color} lineWidth={2.5}/>)}
    <Line points={[[.64,.50,-.36],[.58,.46,-.61],[-.01,.498,-.35]]} color="#6cbad2" lineWidth={2.4}/>
    <Line points={[[.52,.50,.39],[.40,.42,.35],[.46,.43,-.45],[.10,.498,-.35]]} color="#a78bc8" lineWidth={2.4}/>
    <Line points={[[-1.32,.54,-.63],[-1.63,.45,-.58],[-1.9,.16,-.38],[-2.80,.15,-.91]]} color="#aeb6b9" lineWidth={5}/>
    {positions.map((position,i)=><WorldLabel key={i} position={position} className="gp-marker-anchor">
      <button type="button" className="gp-marker" aria-label={parts[i][0]} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{parts[i][0]}</span>}</button>
    </WorldLabel>)}
  </>;
}

export default function WearableScopeDemo(){
  const [source,setSource]=useState<ScopeSignal>(scopeSignals[0]);
  const [period,setPeriod]=useState<ScopePeriod>(2);
  const [volts,setVolts]=useState(2.5);
  const [hold,setHold]=useState(false);
  const [selected,select]=useState(0);
  const [frame,setFrame]=useState(()=>({samples:sampleScope(scopeSignals[0],2,2.5,0),period:2 as ScopePeriod}));
  useEffect(()=>{
    if(hold)return;
    const capture=()=>setFrame({samples:sampleScope(source,period,volts,performance.now()),period});
    capture();
    const timer=window.setInterval(capture,128*period+30);
    return ()=>window.clearInterval(timer);
  },[source,period,volts,hold]);
  const switchTime=()=>{if(!hold)setPeriod(value=>value===2?4:2);};
  const switchHold=()=>setHold(value=>!value);
  const delta=Math.max(...frame.samples)-Math.min(...frame.samples);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D wearable oscilloscope">
        <Canvas camera={{position:[3,6.5,5.9],fov:38}} dpr={[1,1.6]} fallback={<p>Compare the trace measurements using the signal controls.</p>}>
          <Watch {...{hold,selected,select,switchTime,switchHold,source,volts}} samples={frame.samples} period={frame.period}/>
          <OrbitControls target={[0,.18,0]} minDistance={4.3} maxDistance={14} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Captured trace">
        <div><span>Mode</span><strong>{hold?'Hold':'Live'}</strong></div>
        <div><span>Trace span</span><strong>{127*frame.period} ms</strong></div>
        <div><span>Midframe sample</span><strong>{frame.samples[64].toFixed(2)} V</strong></div>
        <div><span>Peak-to-peak</span><strong>{delta.toFixed(2)} V</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Compare signals on the watch</h3>
      <p>Try the built-in square wave at both time settings. Then freeze the display and change the source. Resume to see the new trace. The sine wave represents a simulated bench generator.</p>
      <div className="gp-steps" role="group" aria-label="Signal source">
        {scopeSignals.map(value=><button key={value.shape} type="button" aria-pressed={source===value} onClick={()=>setSource(value)}>{value.name}</button>)}
      </div>
      {source.shape==='dc'&&<label className="gp-solar-light">DC level · {volts.toFixed(1)} V <input type="range" min="0" max="5" step=".1" value={volts} onChange={event=>setVolts(Number(event.target.value))}/></label>}
      <div className="gp-steps" role="group" aria-label="Time per sample">
        {scopePeriods.map(value=><button type="button" key={value} disabled={hold} aria-pressed={period===value} onClick={()=>setPeriod(value)}>{value} ms/sample</button>)}
        <button type="button" className="gp-button" onClick={switchHold}>{hold?'Resume capture':'Hold capture'}</button>
      </div>
      <ol className="gp-demo-labels">{parts.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{parts[selected][1]}</p>
    </div>
  </div>;
}
