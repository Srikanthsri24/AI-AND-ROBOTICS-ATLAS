import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import type { Group } from 'three';
import { ultrasonicRadar, sweepLimits } from '../data/ultrasonic-radar';
import { download } from './state';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Sample={angle:number;range:number|null};
type Scan={angle:number;direction:number;rows:Sample[]};
const start:Scan={angle:30,direction:1,rows:[]};
const radians=(angle:number)=>(angle-90)*Math.PI/180;
const cmScale=.021;
function position(angle:number,range:number,y=.03):Point {
  const turn=radians(angle);
  return [Math.sin(turn)*range*cmScale,y,Math.cos(turn)*range*cmScale];
}

function Panel({at,size,color,metal=0}:{at:Point;size:Point;color:string;metal?:number}) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.15} smoothness={2}>
    <meshStandardMaterial color={color} roughness={metal>.3?.36:.66} metalness={metal}/>
  </RoundedBox>;
}

function Scanner({angle}:{angle:number}) {
  const horn=useRef<Group>(null);
  useFrame((_,dt)=>{if(horn.current)horn.current.rotation.y+=(radians(angle)-horn.current.rotation.y)*Math.min(dt*13,1);});
  return <>
    <Panel at={[0,.14,-.09]} size={[.77,.26,.62]} color="#39545e"/>
    <Panel at={[0,.295,-.07]} size={[.37,.24,.42]} color="#225b91"/>
    <Panel at={[0,.39,-.07]} size={[.51,.082,.27]} color="#285f95"/>
    <group ref={horn} position={[0,.45,0]}>
      <Panel at={[0,.044,0]} size={[.50,.06,.26]} color="#d2d8cd"/>
      <Panel at={[0,.157,-.038]} size={[.57,.20,.070]} color="#65787d"/>
      <Panel at={[0,.247,.014]} size={[.68,.28,.039]} color="#277eac"/>
      {[-.176,.176].map(x=><group key={x} position={[x,.247,.069]} rotation={[Math.PI/2,0,0]}>
        <mesh><cylinderGeometry args={[.109,.109,.109,28]}/><meshStandardMaterial color="#bac5c7" metalness={.64} roughness={.33}/></mesh>
        <mesh position={[0,.057,0]}><cylinderGeometry args={[.084,.084,.010,26]}/><meshStandardMaterial color="#505c63"/></mesh>
      </group>)}
      <Panel at={[.100,.126,.031]} size={[.171,.047,.056]} color="#303c46"/>
    </group>
  </>;
}

const origins:Point[]=[[-1.32,.265,-.78],[0,.71,.11],[0,.37,-.06],[.90,.25,-.83],[-.64,.29,-.82]];
const labelPoints:Point[]=[[-1.55,.86,-.80],[.14,1.26,.09],[-.48,.69,.0],[1.09,.79,-.81],[-.84,.77,-.55]];

function Workbench({angle,targetAngle,targetDistance,visible,echo,selected,select}:{
  angle:number;targetAngle:number;targetDistance:number;visible:boolean;echo:number|null;selected:number;select:(n:number)=>void;
}) {
  const senseLine=position(angle,echo??sweepLimits.rangeCm,.697);
  return <>
    <Panel at={[0,-.11,1.02]} size={[7.0,.19,5.02]} color="#304852"/>
    <Panel at={[0,.005,1.20]} size={[6.46,.06,4.34]} color="#596e70"/>
    {[50,100,150].map(radius=><Line key={radius}
      points={Array.from({length:37},(_,i)=>position(sweepLimits.min+i*(sweepLimits.max-sweepLimits.min)/36,radius))}
      color="#9fb0a8" lineWidth={1.15}/>)}
    {[30,60,90,120,150].map(value=><Line key={value} points={[[0,.035,0],position(value,150)]}
      color="#8d9e9a" lineWidth={.84}/>)}
    <Scanner angle={angle}/>
    <Panel at={[-1.35,.19,-.79]} size={[.86,.15,.57]} color="#266c9e"/>
    <Panel at={[-1.07,.275,-.79]} size={[.17,.058,.19]} color="#b4c1c9" metal={.59}/>
    <Panel at={[-1.53,.281,-.78]} size={[.18,.041,.17]} color="#2c333b"/>
    <Panel at={[-.60,.211,-.79]} size={[.42,.13,.48]} color="#d3d9d1"/>
    <Panel at={[.93,.17,-.8]} size={[.72,.23,.52]} color="#354047"/>
    <Line points={[[-1.02,.28,-.80],[-.51,.35,-.69],[-.22,.45,-.16]]}
      color="#dda665" lineWidth={1.95}/>
    <Line points={[[.72,.27,-.79],[.45,.35,-.67],[.16,.39,-.20]]}
      color="#e57b6d" lineWidth={1.85}/>
    <Line points={[[0,.697,.081],senseLine]} color={echo===null?'#a1ccd4':'#91f2c4'} dashed dashSize={.085} gapSize={.05} lineWidth={1.75}/>
    {visible&&<group position={position(targetAngle,targetDistance,.035)} rotation={[0,radians(targetAngle),0]}>
      <Panel at={[0,.05,.068]} size={[.58,.094,.34]} color="#897052"/>
      <Panel at={[0,.458,.014]} size={[.57,.83,.044]} color="#d7bd83"/>
      <Line points={[[-.19,.39,-.013],[.19,.39,-.013]]} color="#9e8456" lineWidth={1.25}/>
      <WorldLabel position={[0,1.04,0]} className="gp-marker-anchor"><span className="gp-rocket-field-label">Flat test target</span></WorldLabel>
    </group>}
    {Array.from(new Set([1,2,selected])).map(index=><group key={index}>
      <Line points={[origins[index],labelPoints[index]]} color={index===selected?'#ffe18b':'#b3cfd1'} lineWidth={1.4}/>
      <WorldLabel position={labelPoints[index]} className="gp-marker-anchor">
        <button className="gp-marker" type="button" aria-label={ultrasonicRadar.parts[index][0]} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}</button>
      </WorldLabel>
    </group>)}
    <ContactShadows position={[0,-.008,1.0]} scale={8} opacity={.31} blur={2.5} far={4}/>
  </>;
}

function EchoPlot({angle,rows}:{angle:number;rows:Sample[]}) {
  const plot=useRef<HTMLCanvasElement>(null);
  useEffect(()=>{
    const context=plot.current?.getContext('2d');
    if(!context)return;
    const width=640,height=300,originX=320,originY=259,scale=1.47;
    context.fillStyle='#142d37';context.fillRect(0,0,width,height);
    const point=(bearing:number,range:number)=>{
      const turn=radians(bearing);return [originX+Math.sin(turn)*range*scale,originY-Math.cos(turn)*range*scale] as const;
    };
    context.strokeStyle='#527882';context.lineWidth=1;context.font='14px system-ui';context.fillStyle='#a5c5c8';
    [50,100,150].forEach(radius=>{
      context.beginPath();
      for(let a=30;a<=150;a+=2){const [x,y]=point(a,radius);if(a===30)context.moveTo(x,y);else context.lineTo(x,y);}
      context.stroke();
      context.fillText(radius+' cm',originX+9,originY-radius*scale-6);
    });
    [30,60,90,120,150].forEach(bearing=>{
      const [x,y]=point(bearing,150);
      context.beginPath();context.moveTo(originX,originY);context.lineTo(x,y);context.stroke();
      context.fillText(bearing+'°',x+(bearing<90?-29:7),y+1);
    });
    const [x,y]=point(angle,150);
    context.strokeStyle='#66d0c4';context.lineWidth=2;
    context.beginPath();context.moveTo(originX,originY);context.lineTo(x,y);context.stroke();
    context.fillStyle='#f2bf6e';
    rows.forEach(row=>{
      if(row.range===null)return;
      const [x2,y2]=point(row.angle,row.range);
      context.beginPath();context.arc(x2,y2,4.4,0,Math.PI*2);context.fill();
    });
  },[angle,rows]);
  return <canvas ref={plot} className="gp-radar-plot" width={640} height={300} role="img"
    aria-label={`Echo plot: sweep at ${angle} degrees, ${rows.filter(row=>row.range!==null).length} marked angles`}/>;
}

export default function UltrasonicRadarDemo() {
  const [scan,setScan]=useState(start);
  const [running,setRunning]=useState(false);
  const [visible,setVisible]=useState(true);
  const [targetAngle,setTargetAngle]=useState(90);
  const [targetDistance,setTargetDistance]=useState(55);
  const [selected,setSelected]=useState(1);
  const latest=scan.rows.find(row=>row.angle===scan.angle);
  function step(current:Scan):Scan {
    const direction=current.angle>=sweepLimits.max?-1:current.angle<=sweepLimits.min?1:current.direction;
    const angle=current.rows.length ? current.angle+sweepLimits.step*direction : current.angle;
    const range=visible&&Math.abs(angle-targetAngle)<=8?targetDistance:null;
    return {angle,direction,rows:[...current.rows.filter(row=>row.angle!==angle),{angle,range}].sort((a,b)=>a.angle-b.angle)};
  }
  useEffect(()=>{
    if(!running)return;
    const timer=window.setInterval(()=>setScan(current=>step(current)),150);
    return ()=>window.clearInterval(timer);
  },[running,visible,targetAngle,targetDistance]);
  const changeTarget=(setter:(n:number)=>void,value:number)=>{setter(value);setScan(start);};
  return <>
    <div className="gp-split gp-demo">
      <div className="gp-story-stage">
        <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive ultrasonic scanning workbench">
          <Canvas dpr={[1,1.5]} camera={{position:[3.8,5.3,7.1],fov:43}} fallback={<p>The controls and echo plot remain available without WebGL.</p>}>
            <color attach="background" args={['#203741']}/>
            <ambientLight intensity={1.23}/><directionalLight position={[1,6,4]} intensity={2.35}/>
            <Workbench angle={scan.angle} targetAngle={targetAngle} targetDistance={targetDistance} visible={visible}
              echo={latest?.range??null} selected={selected} select={setSelected}/>
            <OrbitControls target={[0,.38,1.10]} minDistance={4} maxDistance={14} enablePan={false}/>
          </Canvas>
        </div>
        <div className="gp-demo-result" aria-label="Ultrasonic scan measurements">
          <div><span>Sweep angle</span><strong>{scan.angle}°</strong></div>
          <div><span>Latest echo</span><strong>{latest ? latest.range===null?'No return':`${latest.range} cm`:'Awaiting sample'}</strong></div>
          <div><span>Marked angles</span><strong>{scan.rows.filter(row=>row.range!==null).length}</strong></div>
        </div>
        <EchoPlot angle={scan.angle} rows={scan.rows}/>
      </div>
      <div className="gp-guide">
        <h3>Move the test target</h3>
        <p>The green line shows the direction of the sonar. Amber dots show valid returns. The tabletop simulation uses a simplified beam and one flat target.</p>
        <label htmlFor="gp-radar-angle">Target angle · {targetAngle}°</label>
        <input className="gp-lidar-range" id="gp-radar-angle" type="range" min={sweepLimits.min} max={sweepLimits.max} step={5}
          value={targetAngle} onChange={event=>changeTarget(setTargetAngle,Number(event.target.value))}/>
        <label htmlFor="gp-radar-distance">Target distance · {targetDistance} cm</label>
        <input className="gp-lidar-range" id="gp-radar-distance" type="range" min={25} max={135} step={5}
          value={targetDistance} onChange={event=>changeTarget(setTargetDistance,Number(event.target.value))}/>
        <div className="gp-steps">
          <button className="gp-button" type="button" onClick={()=>setRunning(value=>!value)}>{running?'Pause sweep':'Start sweep'}</button>
          <button type="button" disabled={running} onClick={()=>setScan(current=>step(current))}>Sample next angle</button>
          <button type="button" aria-pressed={visible} onClick={()=>{setVisible(value=>!value);setScan(start);}}>{visible?'Remove target':'Place target'}</button>
        </div>
        <button className="gp-button gp-secondary" type="button" disabled={!scan.rows.length} onClick={()=>download('ultrasonic_scan.csv',
          ['angle_deg,range_cm',...scan.rows.map(row=>`${row.angle},${row.range??-1}`)].join('\n')+'\n')}>Download scan</button>
        <h4>Inspect the scanner</h4>
        <ol className="gp-demo-labels">{ultrasonicRadar.parts.map(([name],index)=><li key={name}>
          <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
        </li>)}</ol>
        <p className="gp-demo-description">{ultrasonicRadar.parts[selected][2]}</p>
      </div>
    </div>
  </>;
}
