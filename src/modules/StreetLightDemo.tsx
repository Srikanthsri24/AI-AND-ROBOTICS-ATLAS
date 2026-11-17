import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { Color } from 'three';
import { lampsOn, streetLightLimits } from '../data/street-light';
import { WorldLabel } from './LabWorkbench';

type Point = [number,number,number];
const day = 850;
const dusk = 400;
const night = 115;
const shade = 105;
const lampPositions = [-2.6,0,2.6];
const inspection = [
  {name:'Photoresistor',at:[-3.62,.43,1.46],tag:[-3.76,1.06,1.62],description:'The sensor is exposed to the sky and faces away from the street lamps. Its resistance rises when the sensor gets darker, so the A0 voltage falls.'},
  {name:'Divider resistor',at:[-3.30,.24,2.07],tag:[-3.08,.69,2.31],description:'The 10 kΩ resistor connects A0 to ground. The photoresistor connects 5 V to A0. Together they set the voltage the controller reads.'},
  {name:'Arduino Uno',at:[-2.54,.29,2.12],tag:[-2.07,.87,2.66],description:'The Uno compares A0 with two limits, remembers the previous setting between those limits and drives D5, D6 and D7.'},
  {name:'LED street lamps',at:[0,1.27,-.36],tag:[.50,1.78,-.16],description:'Each lamp has one white LED and one 220 Ω resistor. Three separate outputs switch together, while the return wires share ground.'},
] satisfies {name:string;at:Point;tag:Point;description:string}[];

function Solid({at,size,color,radius=.025,metal=0}: {at:Point;size:Point;color:string;radius?:number;metal?:number}) {
  return <RoundedBox args={size} position={at} radius={radius} smoothness={2}>
    <meshStandardMaterial color={color} metalness={metal} roughness={.68}/>
  </RoundedBox>;
}

function House({x,color,roof}: {x:number;color:string;roof:string}) {
  return <group position={[x,0,-2.07]}>
    <Solid at={[0,.32,0]} size={[1.44,.53,.79]} color={color}/>
    {[-1,1].map(side=><mesh key={side} position={[0,.68,side*.22]} rotation={[side*Math.PI/6,0,0]}>
      <boxGeometry args={[1.59,.09,.58]}/><meshStandardMaterial color={roof} roughness={.92}/>
    </mesh>)}
    <Solid at={[0,.22,.411]} size={[.23,.34,.035]} color="#604734"/>
    <Solid at={[0,.054,.45]} size={[.31,.07,.15]} color="#959083"/>
    {[-.44,.44].map(offset=><group key={offset} position={[offset,.32,.417]}>
      <Solid at={[0,0,0]} size={[.28,.24,.045]} color="#d4c6a1"/>
      <Solid at={[0,0,.027]} size={[.205,.17,.014]} color="#32474d" metal={.34}/>
      <Solid at={[0,0,.04]} size={[.019,.17,.017]} color="#d4c6a1"/>
    </group>)}
  </group>;
}

function StreetLamp({x,on,selected}: {x:number;on:boolean;selected:boolean}) {
  const casing=selected?'#bd965a':'#49555d';
  return <group position={[x,0,-.92]}>
    <Solid at={[0,.108,0]} size={[.21,.071,.21]} color="#747777"/>
    <mesh position={[0,.66,0]}><cylinderGeometry args={[.033,.048,1.15,20]}/><meshStandardMaterial color={casing} metalness={.58} roughness={.41}/></mesh>
    <Solid at={[0,1.22,.23]} size={[.059,.053,.52]} color={casing} metal={.56}/>
    <Solid at={[0,1.21,.55]} size={[.24,.105,.39]} color={casing} radius={.045} metal={.42}/>
    <mesh position={[0,1.151,.57]}>
      <boxGeometry args={[.173,.031,.275]}/>
      <meshStandardMaterial color="#e7dfcf" emissive="#ffe7af" emissiveIntensity={on?3.0:0}/>
    </mesh>
    <pointLight position={[0,1.097,.58]} color="#ffce84" intensity={on?10:0} distance={2.3} decay={2}/>
  </group>;
}

function Street({ambient,covered,on,selected,select}: {ambient:number;covered:boolean;on:boolean;selected:number;select:(value:number)=>void}) {
  const daylight=ambient/1023;
  const sky=new Color('#172840').lerp(new Color('#889fb3'),daylight);
  return <>
    <color attach="background" args={[sky]}/>
    <ambientLight intensity={.52+daylight*1.20}/>
    <directionalLight position={[2,6,4]} color="#f7ddae" intensity={.25+daylight*2.1}/>
    <directionalLight position={[-4,3,-5]} color="#b6cfff" intensity={.7}/>
    <Solid at={[0,-.16,0]} size={[8.6,.29,5.35]} color="#8d603e" radius={.065}/>
    <Solid at={[0,.005,0]} size={[8.48,.055,5.26]} color="#657257"/>
    <Solid at={[0,.045,0]} size={[8.47,.05,1.56]} color="#42484f"/>
    {[-1,1].map(side=><group key={side}>
      <Solid at={[0,.072,side*.88]} size={[8.47,.09,.23]} color="#9b9990"/>
      <Solid at={[0,.078,side*.715]} size={[8.38,.010,.022]} color="#c8c9b6"/>
      {Array.from({length:16},(_,i)=><Solid key={i} at={[-4+i*.53,.119,side*.88]} size={[.012,.006,.215]} color="#777773"/>)}
    </group>)}
    {Array.from({length:12},(_,i)=><Solid key={i} at={[-3.95+i*.72,.078,0]} size={[.28,.012,.036]} color="#d1b57f"/>)}
    {[-2.65,-.70,1.25,3.10].map((x,i)=><House key={x} x={x} color={['#aa745d','#a39b71','#9a826f','#ae946f'][i]} roof={i%2?'#556266':'#68483b'}/>)}
    {[-3.76,-1.69,.25,2.12,3.97].map((x,i)=><group key={x} position={[x,0,-1.60-i%2*.15]}>
      <mesh position={[0,.19,0]}><cylinderGeometry args={[.038,.052,.32,10]}/><meshStandardMaterial color="#735744"/></mesh>
      <mesh position={[0,.42,0]}><icosahedronGeometry args={[.22,2]}/><meshStandardMaterial color={i%2?'#627249':'#4d6947'} roughness={.98}/></mesh>
    </group>)}
    {lampPositions.map(x=><StreetLamp key={x} x={x} on={on} selected={selected===3&&x===0}/>)}
    <Solid at={[-3.09,.084,1.95]} size={[2.02,.13,1.04]} color="#8b725b"/>
    <Solid at={[-2.54,.203,2.12]} size={[.75,.075,.55]} color={selected===2?'#b48d4f':'#237391'}/>
    <Solid at={[-2.83,.269,2.15]} size={[.18,.092,.18]} color="#9daab0" metal={.64}/>
    <Solid at={[-2.45,.263,2.18]} size={[.16,.055,.12]} color="#252c37"/>
    {[-.19,.19].map(z=><Solid key={z} at={[-2.48,.26,2.12+z]} size={[.55,.058,.037]} color="#273139"/>)}
    <Solid at={[-3.35,.223,2.05]} size={[.46,.105,.53]} color="#cecfc5"/>
    {[-.17,-.085,0,.085,.17].flatMap(x=>[-.15,-.075,0,.075,.15].map(z=>
      <Solid key={`${x}:${z}`} at={[-3.35+x,.278,2.05+z]} size={[.019,.006,.019]} color="#777878"/>))}
    <Solid at={[-3.62,.253,1.46]} size={[.082,.32,.088]} color="#686a60"/>
    <mesh position={[-3.62,.43,1.46]}><cylinderGeometry args={[.102,.102,.047,24]}/><meshStandardMaterial color={selected===0?'#e3b660':'#ba8c53'}/></mesh>
    <Line points={Array.from({length:10},(_,i)=>[-3.69+i*.015,.455,1.46+(i%2?.04:-.04)])} color="#674841" lineWidth={1.3}/>
    {covered&&<Solid at={[-3.62,.495,1.46]} size={[.36,.046,.28]} color="#574866"/>}
    <mesh position={[-3.33,.299,2.075]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.035,.035,.14,16]}/><meshStandardMaterial color={selected===1?'#e3b660':'#d0b07a'}/></mesh>
    {[-.047,-.016,.023].map((x,i)=><mesh key={x} position={[-3.33+x,.299,2.075]} rotation={[0,0,Math.PI/2]}>
      <cylinderGeometry args={[.037,.037,.013,16]}/><meshStandardMaterial color={['#705442','#3a3331','#d17342'][i]}/>
    </mesh>)}
    <Line points={[[-3.62,.42,1.46],[-3.71,.21,1.68],[-3.52,.28,1.9],[-3.36,.28,2.05],[-2.78,.27,1.97]]} color="#e4ad59" lineWidth={1.7}/>
    {lampPositions.map((x,i)=><Line key={x}
      points={[[-2.50+i*.08,.26,1.92],[-2.20+i*.16,.105,1.32],[-4.09+i*.055,.09,1.13],[-4.09+i*.055,.09,-1.04-i*.055],[x,.105,-1.04-i*.055],[x,.21,-.92]]}
      color={on?'#ffca7c':['#a0786a','#8b8a73','#939685'][i]} lineWidth={1.32}/>)}
    {inspection.map((part,index)=><group key={part.name}>
      <Line points={[part.at,part.tag]} color={index===selected?'#ffe29c':'#cedbe1'} lineWidth={1.3}/>
      <WorldLabel position={part.tag} className="gp-marker-anchor">
        <button type="button" className="gp-marker" aria-label={part.name} aria-pressed={index===selected} onClick={()=>select(index)}>{index+1}</button>
      </WorldLabel>
    </group>)}
    <ContactShadows position={[0,.035,0]} scale={10} opacity={.35} blur={2.4} far={4}/>
  </>;
}

type SceneState = { ambient:number; covered:boolean; on:boolean };
const firstScene:SceneState={ambient:day,covered:false,on:false};
function setLighting(previous:SceneState,ambient:number,covered=previous.covered):SceneState {
  return {ambient,covered,on:lampsOn(covered?shade:ambient,previous.on)};
}

export default function StreetLightDemo() {
  const [scene,setScene]=useState(firstScene);
  const [cycle,setCycle]=useState(false);
  const [selected,setSelected]=useState(0);
  const direction=scene.ambient<=night?1:-1;
  const [rising,setRising]=useState(false);
  const raw=scene.covered?shade:scene.ambient;
  useEffect(()=>{
    if(!cycle) return;
    const timer=window.setInterval(()=>{
      setScene(previous=>{
        const next=rising?Math.min(day,previous.ambient+14):Math.max(night,previous.ambient-14);
        return setLighting(previous,next);
      });
    },70);
    return ()=>window.clearInterval(timer);
  },[cycle,rising]);
  useEffect(()=>{
    if(!cycle) return;
    if(!rising&&direction===1) setRising(true);
    if(rising&&scene.ambient>=day) setCycle(false);
  },[cycle,scene.ambient,rising,direction]);
  const manual=(ambient:number)=>{
    setCycle(false);
    setScene(previous=>setLighting(previous,ambient));
  };
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive 3D model street">
        <Canvas dpr={[1,1.5]} camera={{position:[4.25,5.25,8.8],fov:44}} fallback={<p>The light controls and readings are available without WebGL.</p>}>
          <Street {...scene} selected={selected} select={setSelected}/>
          <OrbitControls target={[0,.26,0]} minDistance={4} maxDistance={14} enablePan={false} maxPolarAngle={Math.PI/2.08}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Street light readings">
        <div><span>Ambient light setting</span><strong>{scene.ambient} / 1023</strong></div>
        <div><span>A0 sensor reading</span><strong>{raw} / 1023</strong></div>
        <div><span>Street lamps</span><strong>{scene.on?'On · 3 lamps':'Off · 0 lamps'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Change the daylight</h3>
      <p>Choose Day, then Twilight. Next try Night, then Twilight. Compare the lamps at the same ADC reading.</p>
      <label htmlFor="street-daylight">Ambient light setting · {scene.ambient}</label>
      <input className="gp-lidar-range" id="street-daylight" type="range" min={0} max={1023} value={scene.ambient}
        onChange={event=>manual(Number(event.target.value))}/>
      <div className="gp-steps" aria-label="Daylight presets">
        <button type="button" onClick={()=>manual(day)}>Day</button>
        <button type="button" onClick={()=>manual(dusk)}>Twilight</button>
        <button type="button" onClick={()=>manual(night)}>Night</button>
      </div>
      <div className="gp-steps">
        <button className="gp-button" type="button" onClick={()=>{
          if(cycle){setCycle(false);return;}
          setScene(firstScene);setRising(false);setCycle(true);
        }}>{cycle?'Stop day–night cycle':'Play day–night cycle'}</button>
        <button type="button" aria-pressed={scene.covered} onClick={()=>setScene(previous=>setLighting(previous,previous.ambient,!previous.covered))}>
          {scene.covered?'Uncover sensor':'Cover sensor'}
        </button>
      </div>
      <p className="gp-demo-description" role="status">
        {raw<=streetLightLimits.on?'Below the daylight band. The controller switches the lamps on.':raw>=streetLightLimits.off?'Enough daylight. The controller switches the lamps off.':'In the twilight band. The controller keeps the previous lamp state.'}
      </p>
      <h4>Inspect the circuit</h4>
      <ol className="gp-demo-labels">{inspection.map(({name},index)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{inspection[selected].description}</p>
    </div>
  </div>;
}
