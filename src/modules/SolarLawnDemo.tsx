import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { lawnCells, lawnColumns, lawnRows } from '../data/solar-lawn';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { TrackerPanel } from './SolarTrackerParts';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
const labels=[
  ['Solar panel','The solar USB output is measured at the divider. When it drops below the threshold, the controller pauses drive.'],
  ['Coverage indicator','The onboard indicator lights during a straight pass. The lawn in the browser depicts the resulting covered strip.'],
  ['Wheel drive','The motor driver reverses one wheel for each end turn. The AA motor rail stays separate from the solar input.'],
  ['Lawn grid','The alternating route covers every row. Covered cells get shorter and change color.'],
] as const;
const unit=.65, pace=360, duration=lawnCells.length*pace;
const xFor=(column:number)=>(column-(lawnColumns-1)/2)*unit;
const zFor=(row:number)=>(row-(lawnRows-1)/2)*unit;
function headingFor(row:number){return row%2?Math.PI:0;}
function pose(time:number){
  const i=Math.min(lawnCells.length-1,Math.floor(time/pace));
  const a=lawnCells[i], b=lawnCells[i+1]??a;
  const fraction=(time%pace)/pace;
  const shifting=a.row!==b.row;
  const sc=shifting?MathUtils.clamp((fraction-.25)*2,0,1):fraction;
  let yaw=headingFor(a.row);
  if(shifting)yaw=MathUtils.lerp(yaw,headingFor(b.row),fraction);
  return {x:MathUtils.lerp(xFor(a.column),xFor(b.column),sc),z:MathUtils.lerp(zFor(a.row),zFor(b.row),sc),yaw,row:a.row,shifting};
}
function Marker({i,at,selected,select}:{i:number;at:Point;selected:number;select:(i:number)=>void}){
  return <WorldLabel position={at} className="gp-marker-anchor">
    <button type="button" className="gp-marker" aria-label={labels[i][0]} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{labels[i][0]}</span>}</button>
  </WorldLabel>;
}
function Lawn({time,running,shade,selected,select}:{time:number;running:boolean;shade:boolean;selected:number;select:(i:number)=>void}){
  const rover=useRef<Group>(null);
  const wheels=useRef<(Group|null)[]>([]);
  const place=pose(time);
  const count=Math.min(lawnCells.length,Math.floor(time/pace));
  const covering=running&&!place.shifting;
  useFrame((_,dt)=>{
    if(rover.current){
      rover.current.position.x=MathUtils.damp(rover.current.position.x,place.x,18,dt);
      rover.current.position.z=MathUtils.damp(rover.current.position.z,place.z,18,dt);
      rover.current.rotation.y=MathUtils.damp(rover.current.rotation.y,place.yaw,19,dt);
    }
    if(running)wheels.current.forEach(wheel=>{if(wheel)wheel.rotation.z-=dt*7;});
  });
  return <>
    <color attach="background" args={['#273648']}/>
    <hemisphereLight args={['#dcecff','#655944',2.35]}/>
    <directionalLight position={[-4,7,6]} intensity={shade?1:2.5}/>
    <Box at={[0,-.154,0]} size={[5.62,.25,4.66]} color="#8b795f"/>
    <Box at={[0,-.023,0]} size={[4.88,.052,3.87]} color="#466846"/>
    {lawnCells.map(({row,column},i)=>{
      const visited=i<count;
      const x=xFor(column),z=zFor(row);
      return <group key={i} position={[x,.013,z]} onClick={()=>select(3)}>
        <Box at={[0,0,0]} size={[.625,.018,.625]} color={visited?(row%2?'#91a85a':'#9aaf64'):(row%2?'#547d44':'#628b4d')}/>
        {Array.from({length:8},(_,n)=><mesh key={n}
          position={[(n%4-1.5)*.12+(n%2)*.019,visited?.025:.052,(Math.floor(n/4)-.5)*.27]}
          rotation={[.12*(n%3-1),n, .09*(n%3-1)]}>
          <coneGeometry args={[visited?.024:.033,visited?.028:.095,3]}/><meshStandardMaterial color={visited?'#b4b972':'#82a85c'}/>
        </mesh>)}
      </group>;
    })}
    {[-2.22,2.22].map(x=><Box key={x} at={[x,.021,0]} size={[.033,.015,3.47]} color="#caaa67"/>)}
    {[-1.73,1.73].map(z=><Box key={z} at={[0,.021,z]} size={[4.47,.015,.033]} color="#caaa67"/>)}
    <Marker i={3} at={[-1.52,.19,1.76]} {...{selected,select}}/>
    <group ref={rover} position={[xFor(0),.063,zFor(0)]}>
      <Box at={[0,.136,0]} size={[1.02,.089,.57]} color="#354759"/>
      <Box at={[-.14,.20,0]} size={[.46,.11,.48]} color="#263340"/>
      <group position={[.14,.22,0]} scale={.54}><Uno at={[0,0,0]}/></group>
      {[-1,1].map((sign,i)=><group key={sign} ref={node=>{wheels.current[i]=node;}} position={[-.13,.103,sign*.312]} onClick={()=>select(2)}>
        <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.139,.139,.087,28]}/><meshStandardMaterial color={selected===2?'#9d7649':'#202930'} roughness={.92}/></mesh>
        <mesh position={[0,0,sign*.048]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.086,.086,.022,20]}/><meshStandardMaterial color="#ac965c" metalness={.46}/></mesh>
        <Box at={[.031,0,sign*.062]} size={[.083,.020,.009]} color="#6d5e3d"/>
      </group>)}
      <Marker i={2} at={[-.19,.212,.46]} {...{selected,select}}/>
      <group position={[-.07,.39,0]} scale={.48} onClick={()=>select(0)}><TrackerPanel light={shade?10:86} selected={selected===0}/></group>
      <Marker i={0} at={[-.31,.53,-.26]} {...{selected,select}}/>
      <group position={[.46,.14,0]} onClick={()=>select(1)}>
        <Box at={[0,0,0]} size={[.16,.092,.39]} color={selected===1?'#d5ae62':'#455c66'}/>
        <mesh position={[.014,.067,0]}><sphereGeometry args={[.038,18,16]}/><meshStandardMaterial color="#81ac7c" emissive="#83ef77" emissiveIntensity={covering?2.2:0}/></mesh>
      </group>
      <Marker i={1} at={[.48,.28,.17]} {...{selected,select}}/>
      <Line points={[[-.36,.38,-.14],[-.42,.29,-.09],[-.40,.22,.14],[-.11,.21,.19]]} color="#b66d48" lineWidth={2}/>
    </group>
  </>;
}

export default function SolarLawnDemo(){
  const [time,setTime]=useState(0);
  const [running,setRunning]=useState(false);
  const [shade,setShade]=useState(false);
  const [selected,select]=useState(0);
  const finished=time>=duration;
  const active=running&&!finished&&!shade;
  const layout=pose(time);
  const count=Math.min(lawnCells.length,Math.floor(time/pace));
  useEffect(()=>{
    if(!active)return;
    const timer=window.setInterval(()=>setTime(value=>Math.min(duration,value+40)),40);
    return ()=>window.clearInterval(timer);
  },[active]);
  const status=finished?'Coverage complete':shade?'Shade pause · Restore light before resuming':active?(layout.shifting?'Turning into the next strip':'Covering a strip'):time?'Paused · Ready to resume':'Ready to start';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D solar lawn coverage">
        <Canvas camera={{position:[3.2,6.8,6.9],fov:42}} dpr={[1,1.6]} fallback={<p>Use the readouts to follow the alternating coverage route.</p>}>
          <Lawn time={time} running={active} {...{shade,selected,select}}/>
          <OrbitControls target={[0,.26,0]} minDistance={4.6} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Lawn coverage readings">
        <div><span>Strip</span><strong>{layout.row+1} / {lawnRows}</strong></div>
        <div><span>Covered cells</span><strong>{count} / {lawnCells.length}</strong></div>
        <div><span>Panel sense</span><strong>{shade?'Below threshold':'Bright'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Cover the lawn strip by strip</h3>
      <p>Start in bright light. Cover the simulated panel mid-pass and see which cells are still tall. Restore the light and resume from the same spot.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={shade||finished} onClick={()=>setRunning(!running)}>{active?'Pause run':time?'Resume run':'Start run'}</button>
        <button type="button" aria-pressed={shade} onClick={()=>{if(!shade)setRunning(false);setShade(!shade);}}>{shade?'Restore light':'Cover panel'}</button>
        <button type="button" onClick={()=>{setRunning(false);setTime(0);}}>Reset lawn</button>
      </div>
      <p role="status" className="gp-demo-description">{status}</p>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
