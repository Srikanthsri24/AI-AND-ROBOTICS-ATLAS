import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import type { Group } from 'three';
import { roomFanOn } from '../data/room-controller';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { SoloKnob } from './BellowsSimulatorPart';
import { Uno } from './ClassroomStationsDemo';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Reading={temperature:number;target:number;sensor:boolean;fan:boolean};
const initial:Reading={temperature:26,target:25,sensor:true,fan:true};
const labels=[
  ['Room sensor','The SHT31 measures air temperature. It is mounted inside the room, away from the fan and the simulated heat source.'],
  ['Target dial','The potentiometer selects a target temperature. The controller switches on 0.5 °C above it and off 0.5 °C below it.'],
  ['Exhaust fan','The fan moves warm air out through a guarded vent. The inlet allows replacement air to enter.'],
  ['MOSFET switch','The Uno controls the switch at D6. The motor uses the independent 5 V supply.'],
] as const;
const points:Point[]=[[-.68,.86,-.73],[1.80,.48,.97],[.38,1.73,-.96],[1.45,.47,-.57]];
function Airflow({on,inlet}:{on:boolean;inlet:boolean}){
  const flow=useRef<Group>(null);
  useFrame(({clock})=>{if(flow.current)flow.current.position.z=-.20*(clock.elapsedTime%1);});
  return <group ref={flow} visible={on}>
    {[-.32,0,.29].map((x,i)=><Line key={x} points={[
      [-1.50+x,.53+i*.12,.94],[-.46+x,.74+i*.14,.37],[.14+x*.6,1.14+i*.08,-.55],[.39+x*.6,1.38,-1.08],
    ]} color="#83d3eb" lineWidth={2} dashSize={.12} gapSize={.073} dashed transparent opacity={inlet?.66:.19}/>)}
  </group>;
}
function Room({reading,selected,select,inlet}:{reading:Reading;selected:number;select:(i:number)=>void;inlet:boolean}){
  const blade=useRef<Group>(null);
  useFrame((_,dt)=>{if(blade.current&&reading.fan)blade.current.rotation.z-=dt*28;});
  return <>
    <color attach="background" args={['#263449']}/>
    <hemisphereLight args={['#e5efff','#705d4b',2.35]}/>
    <directionalLight position={[-4,7,5]} intensity={2.3}/>
    <Box at={[0,-.13,0]} size={[6.02,.24,4.21]} color="#5d6f7e"/>
    <Box at={[-.70,.036,.08]} size={[2.96,.12,2.73]} color="#c4a481"/>
    <Box at={[-.70,.89,-1.24]} size={[2.95,1.66,.10]} color="#af9273"/>
    <Box at={[-2.13,.89,-.61]} size={[.11,1.66,1.19]} color="#b99a7c"/>
    <Box at={[-2.13,.37,.72]} size={[.11,.63,1.40]} color="#bea080"/>
    <Box at={[-2.13,1.50,.70]} size={[.11,.38,1.40]} color="#c5a383"/>
    {[-.10,.22,.53,.86,1.18,1.41].map(z=><Box key={z} at={[-2.13,1.03,z]} size={[.045,.73,.037]} color={inlet?'#8c9a9d':'#c5aa89'} metal={inlet?.55:.05}/>)}
    {!inlet&&<Box at={[-2.13,1.03,.68]} size={[.085,.72,1.40]} color="#c2a383"/>}
    <Box at={[-1.27,.30,-.30]} size={[1.12,.094,.60]} color="#8d6b57"/>
    {[-1.72,-.82].map(x=><Box key={x} at={[x,.167,-.27]} size={[.081,.24,.40]} color="#71594c"/>)}
    <Box at={[-1.45,.39,-.30]} size={[.37,.09,.31]} color={reading.temperature>reading.target+.5?'#bd7854':'#aca37e'}/>
    <Box at={[-1.45,.454,-.30]} size={[.31,.035,.26]} color="#9e7560"/>
    <group position={[-.69,.70,-1.06]} onClick={()=>select(0)}>
      <Box at={[0,0,0]} size={[.36,.31,.075]} color={selected===0?'#e0bb69':'#356d8f'}/>
      <Box at={[0,.028,.047]} size={[.103,.10,.032]} color={reading.sensor?'#263743':'#9b493f'}/>
      {[-.115,-.041,.041,.115].map(x=><Box key={x} at={[x,-.102,.043]} size={[.029,.059,.025]} color="#cdb475" metal={.51}/>)}
    </group>
    <group position={[.37,1.34,-1.125]} onClick={()=>select(2)}>
      <Box at={[0,0,0]} size={[.70,.70,.086]} color={selected===2?'#ddbc72':'#324752'}/>
      <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.31,.31,.10,36]}/><meshStandardMaterial color="#1a2830" metalness={.33}/></mesh>
      <group ref={blade} position={[0,0,.065]}>
        {Array.from({length:5},(_,i)=><group key={i} rotation={[0,0,i*Math.PI*2/5]}>
          <group position={[0,.144,0]} rotation={[.26,0,-.31]}><Box at={[0,0,0]} size={[.122,.214,.034]} color="#8b9da5" metal={.41}/></group>
        </group>)}
        <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.082,.082,.067,20]}/><meshStandardMaterial color="#495d67" metalness={.49}/></mesh>
      </group>
      {[-.22,-.11,0,.11,.22].map(x=><Box key={x} at={[x,0,.118]} size={[.017,.585,.021]} color="#a9b1b5" metal={.56}/>)}
    </group>
    <Airflow on={reading.fan} inlet={inlet}/>
    <group position={[1.64,.08,-.99]} scale={1.46}><Uno at={[0,0,0]}/></group>
    <group position={[1.46,.19,-.50]} onClick={()=>select(3)}>
      <Box at={[0,0,0]} size={[.40,.063,.36]} color={selected===3?'#d9b66c':'#34476b'}/>
      <Box at={[0,.048,0]} size={[.11,.035,.12]} color="#29313b"/>
      <Box at={[0,.057,.121]} size={[.24,.06,.11]} color="#70a68e"/>
    </group>
    <group position={[1.81,.163,.89]} onClick={()=>select(1)}>
      <Box at={[0,0,0]} size={[.67,.22,.60]} color="#4d6472"/>
      <group position={[0,.175,0]}><SoloKnob value={(reading.target-18)*100/14} active={selected===1}/></group>
    </group>
    <Box at={[2.23,.13,-.38]} size={[.52,.22,.44]} color="#303c4a"/>
    <Box at={[2.05,.21,-.38]} size={[.09,.079,.20]} color="#434b52"/>
    <Line points={[[2.00,.21,-.38],[1.72,.12,-.30],[1.47,.25,-.38]]} color="#8f5d56" lineWidth={2.6}/>
    <Line points={[[.55,1.26,-1.04],[.82,.16,-1.08],[1.37,.21,-.72],[1.44,.25,-.42]]} color={reading.fan?'#eeaf66':'#b17a5a'} lineWidth={3.2}/>
    <Line points={[[-.62,.61,-1.01],[-.45,.19,-1.0],[.57,.14,-1.06],[1.20,.34,-.61]]} color="#74aac5" lineWidth={3}/>
    <Line points={[[1.78,.18,.59],[1.96,.09,.21],[1.81,.125,-.16],[1.78,.34,-.63]]} color="#cc9868" lineWidth={2.6}/>
    {points.map((at,i)=><WorldLabel key={i} position={at} className="gp-marker-anchor">
      <button type="button" className="gp-marker" aria-label={labels[i][0]} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{labels[i][0]}</span>}</button>
    </WorldLabel>)}
  </>;
}

export default function RoomControllerDemo(){
  const [reading,setReading]=useState<Reading>(initial);
  const [selected,select]=useState(0);
  const [inlet,setInlet]=useState(true);
  function change(update:Partial<Reading>){
    setReading(previous=>{
      const next={...previous,...update};
      return {...next,fan:roomFanOn(previous.fan,next.temperature,next.target,next.sensor)};
    });
  }
  function step(){
    const exchange=reading.fan&&inlet?.47:reading.fan?.12:.035;
    change({temperature:Math.round((reading.temperature+.12+(20-reading.temperature)*exchange)*10)/10});
  }
  const band=reading.temperature>reading.target-.5&&reading.temperature<reading.target+.5;
  const text=!reading.sensor?'Sensor unavailable · Fan off':band?`Inside the band · Fan stays ${reading.fan?'on':'off'}`:reading.fan?'Above upper threshold · Fan on':'Below lower threshold · Fan off';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D room temperature controller">
        <Canvas camera={{position:[3.3,4.8,6.9],fov:43}} dpr={[1,1.6]} fallback={<p>Use the temperature and state readouts to follow the thermostat.</p>}>
          <Room {...{reading,selected,select,inlet}}/>
          <OrbitControls target={[0,.50,0]} minDistance={4.7} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Room controller readings">
        <div><span>Sensor</span><strong>{reading.sensor?`${reading.temperature.toFixed(1)} °C`:'Unavailable'}</strong></div>
        <div><span>Fan on at</span><strong>{(reading.target+.5).toFixed(1)} °C</strong></div>
        <div><span>Fan off at</span><strong>{(reading.target-.5).toFixed(1)} °C</strong></div>
        <div><span>Fan</span><strong>{reading.fan?'On':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Try both sides of the temperature band</h3>
      <p>Raise the room temperature until the fan starts. Bring the temperature back to the target, then a little below it. Compare that with raising the temperature to the target from below.</p>
      <label className="gp-solar-light">Simulated room temperature · {reading.temperature.toFixed(1)} °C <input type="range" min="18" max="36" step=".1" value={reading.temperature} onChange={event=>change({temperature:Number(event.target.value)})}/></label>
      <label className="gp-solar-light">Target temperature · {reading.target.toFixed(1)} °C <input type="range" min="18" max="32" step=".5" value={reading.target} onChange={event=>change({target:Number(event.target.value)})}/></label>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={step}>Advance room model</button>
        <button type="button" aria-pressed={inlet} onClick={()=>setInlet(value=>!value)}>Open air inlet</button>
        <button type="button" aria-pressed={!reading.sensor} onClick={()=>change({sensor:!reading.sensor})}>Disconnect sensor</button>
      </div>
      <p role="status" className="gp-demo-description">{text}</p>
      <ol className="gp-demo-labels">{labels.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected][1]}</p>
    </div>
  </div>;
}
