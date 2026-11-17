import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { MathUtils } from 'three';
import { armHome, armKeys, armLift, armLimits, armNames, armPickup, armPlace } from '../data/ble-arm';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { ArmPwmBoard } from './RoverArmDemo';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type State={pose:number[];held:boolean;block:Point;delivered:boolean};
const deg=MathUtils.degToRad;
const upper=.99,lower=.90,jawReach=.46,pivot=.58;
function jawCenter(pose:number[]):Point{
  const [yaw,shoulder,elbow,wrist]=pose;
  const phi=deg(30+shoulder), psi=phi+deg(72+elbow), omega=psi+deg(30+wrist);
  const distance=upper*Math.sin(phi)+lower*Math.sin(psi)+jawReach*Math.sin(omega);
  return [distance*Math.sin(deg(yaw)),pivot+upper*Math.cos(phi)+lower*Math.cos(psi)+jawReach*Math.cos(omega),distance*Math.cos(deg(yaw))];
}
const dock=(point:Point):Point=>[point[0],.131,point[2]];
const loadDock=dock(jawCenter(armPickup));
const unloadDock=dock(jawCenter(armPlace));
const initial:State={pose:armHome,held:false,block:loadDock,delivered:false};
const distance=(a:Point,b:Point)=>Math.hypot(...a.map((n,i)=>n-b[i]));
function advance(state:State,target:number[]):State{
  const pose=state.pose.map((n,i)=>n===target[i]?n:n+Math.sign(target[i]-n)*Math.min(1,Math.abs(target[i]-n)));
  if (pose.every((n,i)=>n===state.pose[i])) return state;
  const tip=jawCenter(pose);
  if(state.held&&pose[5]<=6){
    const delivered=distance(dock(tip),unloadDock)<.21&&tip[1]<.30;
    return {pose,held:false,block:delivered?unloadDock:dock(tip),delivered};
  }
  if(state.held||pose[5]>=17&&distance(tip,state.block)<.15)return {pose,held:true,block:tip,delivered:false};
  return {...state,pose};
}

function Joint({at,selected,axis='z'}:{at:Point;selected:boolean;axis?:'z'|'x'|'y'}){
  return <group position={at} rotation={axis==='x'?[0,0,Math.PI/2]:axis==='z'?[Math.PI/2,0,0]:[0,0,0]}>
    <mesh><cylinderGeometry args={[.145,.145,.22,28]}/><meshStandardMaterial color={selected?'#d7a254':'#283340'} metalness={.45} roughness={.38}/></mesh>
    <mesh position={[0,.112,0]}><cylinderGeometry args={[.078,.078,.025,20]}/><meshStandardMaterial color="#c4ccd2" metalness={.74} roughness={.33}/></mesh>
  </group>;
}
function Marker({index,at,selected,select}:{index:number;at:Point;selected:number;select:(i:number)=>void}){
  return <WorldLabel position={at} className="gp-marker-anchor">
    <button type="button" className="gp-marker" aria-pressed={selected===index} aria-label={armNames[index]} onClick={()=>select(index)}>
      {index+1}{selected===index&&<span className="gp-demo-marker-name">{armNames[index]}</span>}
    </button>
  </WorldLabel>;
}
function Links({length,highlighted}:{length:number;highlighted:boolean}){
  const color=highlighted?'#d7b46e':'#8694a2';
  return <>
    {[-.10,.10].map(x=><Box key={x} at={[x,length/2,0]} size={[.071,length*.9,.16]} color={color} metal={.57}/>)}
    <Box at={[0,length*.41,.013]} size={[.137,length*.55,.074]} color="#28353d"/>
    <Line points={[[.16,.04,.04],[.14,length*.42,.10],[.12,length*.91,.05]]} color="#b86e49" lineWidth={2.2}/>
  </>;
}
function Workbench({state,selected,select,labels,connected}:{state:State;selected:number;select:(i:number)=>void;labels:boolean;connected:boolean}){
  const [yaw,shoulder,elbow,wrist,roll,grip]=state.pose;
  const marker=(index:number,at:Point)=>labels?<Marker {...{index,at,selected,select}}/>:null;
  return <>
    <color attach="background" args={['#263346']}/>
    <hemisphereLight args={['#e6efff','#736050',2.32]}/>
    <directionalLight position={[-4,7,5]} intensity={2.46}/>
    <Box at={[0,-.125,.4]} size={[5.66,.23,4.0]} color="#506175"/>
    <Box at={[0,.045,0]} size={[1.07,.12,.91]} color="#293342"/>
    {[-.44,.44].map(x=><Box key={x} at={[x,.106,.32]} size={[.092,.027,.095]} color="#b3baba" metal={.65}/>)}
    <group onClick={()=>select(0)}><Joint at={[0,.19,0]} selected={selected===0} axis="y"/></group>
    {marker(0,[-.61,.22,.42])}
    <group rotation={[0,deg(yaw),0]}>
      <Box at={[0,.34,0]} size={[.31,.41,.45]} color="#455363" metal={.45}/>
      <group position={[0,pivot,0]}>
        <group onClick={()=>select(1)}><Joint at={[0,0,0]} axis="x" selected={selected===1}/></group>
        {marker(1,[-.55,.14,-.30])}
        <group rotation={[deg(30+shoulder),0,0]}>
          <Links length={upper} highlighted={selected===1}/>
          <group position={[0,upper,0]}>
            <group onClick={()=>select(2)}><Joint at={[0,0,0]} axis="x" selected={selected===2}/></group>
            {marker(2,[.22,.40,-.25])}
            <group rotation={[deg(72+elbow),0,0]}>
              <Links length={lower} highlighted={selected===2}/>
              <group position={[0,lower,0]}>
                <group onClick={()=>select(3)}><Joint at={[0,0,0]} axis="x" selected={selected===3}/></group>
                {marker(3,[-.47,.14,-.13])}
                <group rotation={[deg(30+wrist),0,0]}>
                  <Box at={[0,.098,0]} size={[.23,.16,.19]} color={selected===3?'#cfaa61':'#6c7987'} metal={.4}/>
                  <group position={[0,.205,0]} rotation={[0,deg(roll),0]}>
                    <group onClick={()=>select(4)}><Joint at={[0,0,0]} axis="y" selected={selected===4}/></group>
                    {marker(4,[.54,.0,.07])}
                    <group onClick={()=>select(5)}>
                      <Box at={[0,.115,0]} size={[.31,.08,.17]} color={selected===5?'#dfb96d':'#526275'} metal={.4}/>
                      {[-1,1].map(side=><group key={side} position={[side*(.121-grip*.0031),.155,0]}>
                        <Box at={[0,.069,0]} size={[.052,.17,.119]} color={selected===5?'#dcb978':'#6d7f8c'} metal={.56}/>
                        <Box at={[-side*.014,.134,0]} size={[.073,.049,.127]} color="#212c35"/>
                      </group>)}
                    </group>
                    {marker(5,[.04,.44,.29])}
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
      </group>
    </group>
    {[loadDock,unloadDock].map(([x,,z],i)=><group key={i} position={[x,.018,z]}>
      <Box at={[0,0,0]} size={[.42,.05,.38]} color={i?'#6baf9a':'#d9aa61'}/>
      <Box at={[0,.028,.13]} size={[.30,.009,.026]} color={i?'#c0e3d0':'#f5d5a4'}/>
    </group>)}
    <Box at={state.block} size={[.128,.169,.154]} color={state.held?'#f6e2a4':'#e7cf9a'}/>
    <group position={[-1.68,.10,-.58]} scale={1.45}><Uno at={[0,0,0]}/></group>
    <group position={[-1.62,.17,.41]} scale={.95}><ArmPwmBoard/></group>
    <Box at={[-1.61,.115,1.12]} size={[.64,.10,.42]} color="#325487"/>
    <Box at={[-1.55,.18,1.11]} size={[.23,.035,.19]} color="#242e38"/>
    <mesh position={[-1.86,.175,1.24]}><sphereGeometry args={[.032,16,12]}/><meshStandardMaterial color="#7cbcd7" emissive="#349ddf" emissiveIntensity={connected?2:0}/></mesh>
    {['#d26b54','#21303d','#71b7a8'].map((color,i)=><Line key={color} points={[
      [-1.84+i*.14,.13,.92],[-1.99+i*.17,.124,.75],[-1.99+i*.17,.13,-.19],[-1.74+i*.12,.34,-.212],
    ]} color={color} lineWidth={2.4}/>)}
    <Line points={[[-1.08,.23,.41],[-.68,.13,.14],[-.41,.32,.04],[0,.52,.19]]} color="#d8a35b" lineWidth={3.2}/>
    <Box at={[1.75,.12,.25]} size={[.58,.19,.96]} color="#253245"/>
    <Box at={[1.75,.222,.25]} size={[.50,.018,.80]} color={connected?'#416e7a':'#404e59'}/>
  </>;
}

export default function BleArmDemo(){
  const [state,setState]=useState<State>(initial);
  const [target,setTarget]=useState<number[]>(armHome);
  const [connected,connect]=useState(false);
  const [homed,setHomed]=useState(false);
  const [selected,select]=useState(0);
  const [labels,setLabels]=useState(true);
  useEffect(()=>{
    if(!connected||!homed)return;
    const timer=window.setInterval(()=>setState(previous=>advance(previous,target)),25);
    return ()=>window.clearInterval(timer);
  },[target,connected,homed]);
  const enabled=connected&&homed;
  function sendPose(pose:number[]){if(enabled)setTarget(pose);}
  function jog(amount:number){
    if(enabled)setTarget(values=>values.map((value,i)=>i===selected?MathUtils.clamp(value+amount,armLimits[i][0],armLimits[i][1]):value));
  }
  const finish=state.delivered?'Block placed in the destination':state.held?'Block held in the jaws':!connected?'Phone disconnected':!homed?'Connected · Send H to home':target.some((n,i)=>n!==state.pose[i])?'Joint moving':'Arm ready';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D Bluetooth arm workbench">
        <Canvas camera={{position:[3.1,4.6,6.5],fov:41}} dpr={[1,1.6]} fallback={<p>Follow the joint commands and block state below.</p>}>
          <Workbench {...{state,selected,select,labels,connected}}/>
          <OrbitControls target={[0,.69,.40]} minDistance={3.8} maxDistance={14} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Arm readings">
        <div><span>{armNames[selected]} offset</span><strong>{state.pose[selected]}°</strong></div>
        <div><span>Target</span><strong>{target[selected]}°</strong></div>
        <div><span>Block</span><strong>{state.held?'Gripped':state.delivered?'Delivered':'On bench'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Connect, jog and transfer</h3>
      <p>Connect the simulated phone and send H. Move to Pickup and let the arm settle before closing the gripper. Lift the block, move to Place, then open the gripper. The pickup and place shortcuts are part of this browser workbench.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>{if(connected)setTarget(state.pose);connect(!connected);}}>{connected?'Disconnect phone':'Connect phone'}</button>
        <button type="button" disabled={!connected} onClick={()=>{setHomed(true);setTarget(armHome);}}>H · Home</button>
        <button type="button" disabled={!enabled} onClick={()=>setTarget(state.pose)}>S · Hold</button>
        <button type="button" aria-pressed={labels} onClick={()=>setLabels(value=>!value)}>Scene labels</button>
      </div>
      <div className="gp-steps" role="group" aria-label="Joint selection">
        {armNames.map((name,i)=><button key={name} type="button" aria-pressed={selected===i} onClick={()=>select(i)}>{name}</button>)}
      </div>
      <div className="gp-steps" role="group" aria-label="Selected joint commands">
        <button type="button" disabled={!enabled} onClick={()=>jog(-2)}>{armKeys[selected].toUpperCase()} · −2°</button>
        <button type="button" disabled={!enabled} onClick={()=>jog(2)}>{armKeys[selected]} · +2°</button>
      </div>
      <div className="gp-steps" role="group" aria-label="Block transfer">
        <button type="button" disabled={!enabled} onClick={()=>sendPose(armPickup)}>Pickup</button>
        <button type="button" disabled={!enabled} onClick={()=>sendPose([...state.pose.slice(0,5),24])}>Close gripper</button>
        <button type="button" disabled={!enabled} onClick={()=>sendPose([...armLift.slice(0,5),state.pose[5]])}>Lift</button>
        <button type="button" disabled={!enabled} onClick={()=>sendPose([...armPlace.slice(0,5),state.pose[5]])}>Place</button>
        <button type="button" disabled={!enabled} onClick={()=>sendPose([...state.pose.slice(0,5),0])}>Open gripper</button>
        <button type="button" onClick={()=>{setState(initial);setTarget(armHome);setHomed(false);}}>Reset trial</button>
      </div>
      <p className="gp-demo-description" role="status">{finish}</p>
      <p className="gp-demo-description">Channel {selected} controls {armNames[selected].toLowerCase()}. Commands change the requested angle in small steps.</p>
    </div>
  </div>;
}
