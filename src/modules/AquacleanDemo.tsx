import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import type { Group } from 'three';
import { aquaclean, aquaLimits } from '../data/aquaclean';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
function Block({at,size,color,metalness=0}:{at:Point;size:Point;color:string;metalness?:number}) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.15} smoothness={2}>
    <meshStandardMaterial color={color} metalness={metalness} roughness={metalness>.4?.29:.65}/>
  </RoundedBox>;
}

export function EthernetShieldGeometry() {
  return <>
    <Block at={[0,0,0]} size={[.88,.057,.65]} color="#23769d"/>
    <Block at={[.27,.107,.017]} size={[.29,.17,.25]} color="#b9c2c6" metalness={.71}/>
    <Block at={[.424,.109,.017]} size={[.018,.102,.173]} color="#252b2d"/>
    <Block at={[-.08,.044,-.02]} size={[.175,.040,.15]} color="#272e35"/>
    <Block at={[-.27,.049,.082]} size={[.185,.044,.15]} color="#a4b0b4" metalness={.54}/>
    {[-.28,.27].map(z=><group key={z}>
      <Block at={[0,.055,z]} size={[.72,.048,.061]} color="#30373a"/>
      {Array.from({length:9},(_,i)=><Block key={i} at={[(i-4)*.07,.081,z]} size={[.019,.012,.024]} color="#bda777"/>)}
    </group>)}
    <Block at={[.32,.077,-.18]} size={[.047,.021,.037]} color="#57bd75"/>
  </>;
}

export function AquacleanChannel() {
  return <>
    <Block at={[0,.047,0]} size={[5.28,.12,1.74]} color="#7a9498"/>
    {[-.87,.87].map(z=><group key={z}>
      <mesh position={[0,.34,z]}><boxGeometry args={[5.29,.53,.045]}/>
        <meshStandardMaterial color="#9cd0d3" transparent opacity={.24} depthWrite={false}/></mesh>
      <Block at={[0,.616,z]} size={[5.34,.052,.063]} color="#8eafb3"/>
    </group>)}
    {[-2.64,2.64].map(x=><group key={x}>
      <mesh position={[x,.34,0]}><boxGeometry args={[.048,.53,1.73]}/>
        <meshStandardMaterial color="#9cd0d3" transparent opacity={.24} depthWrite={false}/></mesh>
      <Block at={[x,.616,0]} size={[.060,.05,1.78]} color="#8eafb3"/>
    </group>)}
    <group position={[.75,.58,0]} rotation={[0,0,.28]}>
      <Block at={[0,0,0]} size={[1.10,.076,1.12]} color="#c5c4ae"/>
      {[-.55,.55].map(z=><Block key={z} at={[0,.09,z]} size={[1.10,.17,.056]} color="#7c9594"/>)}
    </group>
    <Block at={[1.87,.682,0]} size={[1.27,.086,1.25]} color="#738c7b"/>
    {[-.62,.62].map(z=><group key={z}>
      <Block at={[1.87,.948,z]} size={[1.27,.054,.054]} color="#5c7966"/>
      {Array.from({length:11},(_,i)=><Block key={i} at={[1.30+i*.116,.826,z]} size={[.023,.258,.025]} color="#698c79"/>)}
      {Array.from({length:4},(_,i)=><Block key={i} at={[1.87,.729+i*.069,z]} size={[1.27,.021,.023]} color="#8d9d89"/>)}
    </group>)}
    {[1.25,2.50].map(x=><group key={x}>
      <Block at={[x,.948,0]} size={[.054,.054,1.25]} color="#5c7966"/>
      {Array.from({length:9},(_,i)=><Block key={i} at={[x,.826,-.55+i*.135]} size={[.023,.258,.025]} color="#698c79"/>)}
    </group>)}
  </>;
}

function Rotor({spinning}:{spinning:boolean}) {
  const rotor=useRef<Group>(null);
  useFrame((_,dt)=>{if(rotor.current&&spinning)rotor.current.rotation.z-=Math.min(dt,.07)*3.6;});
  return <>
    <Block at={[.12,.66,-.67]} size={[.18,1.12,.16]} color="#697c83" metalness={.52}/>
    <Block at={[.12,.79,-.81]} size={[.32,.25,.48]} color="#d6a029"/>
    <group ref={rotor} position={[.11,.79,0]}>
      <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.057,.057,1.27,25]}/>
        <meshStandardMaterial color="#a7bbc2" metalness={.65} roughness={.36}/></mesh>
      {Array.from({length:4},(_,index)=><group key={index} rotation={[0,0,index*Math.PI/2]}>
        <Block at={[0,-.19,0]} size={[.06,.38,.94]} color="#56808a"/>
        <Block at={[.034,-.36,0]} size={[.07,.13,.98]} color="#a8bdac"/>
      </group>)}
    </group>
  </>;
}

const litter:Point[]=[[-.4,.445,.10],[-.78,.445,-.35],[-1.08,.445,.52],[-1.31,.445,-.10],
  [-1.61,.445,.17],[-1.89,.445,-.53],[-2.19,.445,.42],[-2.37,.445,-.03]];
const colors=['#f5bd72','#e7ded2','#f38968','#9cd0a5'];
const emptyGap=200;
const gapPerChip=15;
const isFull=(load:number)=>emptyGap-load*gapPerChip<=aquaLimits.fullMm;
const anchors:Point[]=[[-1.65,.48,-1.38],[-1.33,.57,-1.39],[1.91,1.49,.0],[.18,.52,-1.38],
  [.13,.90,-.66],[1.0,.48,-1.43],[-.49,.42,-1.40],[-.53,.46,-1.34],[1.84,.94,.49]];
const labels:Point[]=[[-1.71,1.00,-1.48],[-1.33,1.13,-1.41],[2.22,1.96,-.12],[.11,1.02,-1.39],
  [-.06,1.47,-.89],[1.18,.95,-1.42],[-.71,.95,-1.33],[-.62,.99,-1.39],[1.92,1.27,.89]];
type Model={running:boolean;fault:boolean;collected:number;load:number;progress:number};
const initial:Model={running:false,fault:false,collected:0,load:0,progress:0};

function chipPosition(start:Point,progress:number):Point {
  if(progress<.54) {
    const step=progress/.54;
    return [start[0]+(.35-start[0])*step,start[1],start[2]*(1-step)];
  }
  const step=(progress-.54)/.46;
  return [.35+1.48*step,.445+.32*step+.087*Math.sin(step*Math.PI),0];
}

function ChannelScene({model,selected,onSelect}:{model:Model;selected:number;onSelect:(value:number)=>void}) {
  return <>
    <Block at={[0,-.10,-.12]} size={[6.46,.17,4.04]} color="#3d5158"/>
    <AquacleanChannel/>
    <mesh position={[-1.06,.27,0]}>
      <boxGeometry args={[3.06,.34,1.68]}/><meshPhysicalMaterial color="#2c8ea5" transparent opacity={.57}
        roughness={.25} metalness={.26} depthWrite={false}/>
    </mesh>
    {[-.61,-.32,.08,.39,.62].map((z,i)=><Line key={z}
      points={Array.from({length:18},(_,j)=>[-2.50+j*.166,.443,z+Math.sin(j*.71+i)*.034] as Point)}
      color="#a8e2e6" transparent opacity={.62} lineWidth={1.2}/>)}
    <Rotor spinning={model.running}/>
    <Block at={[1.96,.84,-.84]} size={[.105,1.14,.10]} color="#8c9eaa" metalness={.52}/>
    <Block at={[1.96,1.47,-.45]} size={[.08,.07,.84]} color="#9babb3" metalness={.52}/>
    <Block at={[1.96,1.45,0]} size={[.47,.044,.24]} color="#26739b"/>
    {[-.115,.115].map(x=><mesh key={x} position={[1.96+x,1.389,.01]}>
      <cylinderGeometry args={[.074,.074,.104,25]}/><meshStandardMaterial color="#b1bdc4" metalness={.67} roughness={.34}/>
    </mesh>)}
    <Block at={[1.96,.758+model.load*.033,.0]} size={[.35,.032,.37]} color="#e7d4a0"/>
    {!model.fault&&<Line points={[[1.96,1.34,.0],[1.96,.775+model.load*.033,0]]}
      color="#a5f2de" dashed dashSize={.082} gapSize={.045} lineWidth={1.6}/>}
    <Block at={[0,.14,-1.38]} size={[4.08,.24,.66]} color="#243642"/>
    <Block at={[-1.44,.31,-1.39]} size={[.83,.09,.59]} color="#225f8c"/>
    <group position={[-1.43,.40,-1.39]} scale={.8}><EthernetShieldGeometry/></group>
    <Block at={[-.45,.304,-1.39]} size={[.67,.071,.39]} color="#ddd9cb"/>
    <Block at={[-.52,.379,-1.39]} size={[.11,.093,.116]} color="#30383e"/>
    <Block at={[.19,.343,-1.39]} size={[.42,.07,.34]} color="#2a74a6"/>
    <Block at={[1.02,.395,-1.39]} size={[.67,.20,.38]} color="#363d43"/>
    <Line points={[[-1.1,.48,-1.37],[-.68,.51,-1.46],[-.37,.39,-1.43]]} color="#f08b61" lineWidth={2.1}/>
    <Line points={[[.93,.49,-1.38],[.67,.57,-1.42],[.37,.40,-1.43]]} color="#e7bb67" lineWidth={2.0}/>
    <Line points={[[.22,.40,-1.40],[.09,.62,-1.05],[.11,.78,-.82]]} color="#71b9ec" lineWidth={2.0}/>
    {litter.map((start,index)=>{
      if(index<model.collected-model.load) return null;
      const inBasket=index<model.collected;
      const position:Point=inBasket?[1.54+(index%3)*.24,.738+Math.floor(index%6/3)*.048,-.42+(index%2)*.39]
        : index===model.collected ? chipPosition(start,model.progress) : start;
      return <mesh key={index} position={position} rotation={[0,index*.68,.19*(index%3)]}>
        <boxGeometry args={[.146,.029,.111]}/><meshStandardMaterial color={colors[index%colors.length]}/>
      </mesh>;
    })}
    <WorldLabel position={[-1.98,.46,.93]} className="gp-marker-anchor"><span className="gp-rocket-field-label">Floating litter</span></WorldLabel>
    {Array.from(new Set([2,4,8,selected])).map(index=><group key={index}>
      <Line points={[anchors[index],labels[index]]} color={index===selected?'#ffe18b':'#b9d6da'} lineWidth={1.4}/>
      <WorldLabel position={labels[index]} className="gp-marker-anchor">
        <button className="gp-marker" type="button" aria-label={aquaclean.parts[index][0]} aria-pressed={index===selected}
          onClick={()=>onSelect(index)}>{index+1}</button>
      </WorldLabel>
    </group>)}
    <ContactShadows position={[0,-.01,0]} opacity={.34} scale={7} far={4} blur={2.5}/>
  </>;
}

export default function AquacleanDemo() {
  const [model,setModel]=useState(initial);
  const [line,setLine]=useState(true);
  const [selected,setSelected]=useState(8);
  const full=isFull(model.load);
  const state=model.fault?'Sensor fault':full?'Basket full':model.running?'Collecting':'Stopped';
  const gap=model.fault?null:emptyGap-model.load*gapPerChip;

  useEffect(()=>{
    if(!model.running||model.collected>=litter.length) return;
    const timer=window.setInterval(()=>setModel(current=>{
      if(!current.running) return current;
      if(current.progress+.06<1) return {...current,progress:current.progress+.06};
      const load=current.load+1;
      return {...current,progress:0,collected:current.collected+1,load,running:!isFull(load)};
    }),65);
    return ()=>window.clearInterval(timer);
  },[model.running,model.collected]);

  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="Interactive AQUACLEAN skimmer">
        <Canvas dpr={[1,1.5]} camera={{position:[4.2,4.5,7.55],fov:44}} fallback={<p>The simulated controller and telemetry are available without WebGL.</p>}>
          <color attach="background" args={['#253a46']}/>
          <ambientLight intensity={1.28}/>
          <directionalLight position={[-2,7,4]} intensity={2.25}/>
          <ChannelScene model={model} selected={selected} onSelect={setSelected}/>
          <OrbitControls target={[0,.50,-.07]} minDistance={4} maxDistance={15} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Simulated skimmer readings">
        <div><span>Pieces collected</span><strong>{model.collected} / {litter.length}</strong></div>
        <div><span>Pieces in basket</span><strong>{model.load}</strong></div>
        <div><span>Basket gap</span><strong>{gap===null?'No echo':`${(gap/10).toFixed(1)} cm`}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Run the skimmer</h3>
      <p>The local controller stops the motor at a gap of 11.5 cm or less. The monitor displays the status over a simulated network link.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={model.fault||full} onClick={()=>setModel(previous=>({...previous,running:!previous.running}))}>
          {model.running?'Stop skimmer':'Start skimmer'}
        </button>
        <button type="button" disabled={model.running||model.load===0} onClick={()=>setModel(previous=>({...previous,load:0}))}>Empty basket</button>
        <button type="button" aria-pressed={model.fault} onClick={()=>setModel(previous=>({...previous,fault:!previous.fault,running:false}))}>
          {model.fault?'Restore echo':'Simulate missing echo'}
        </button>
        <button type="button" onClick={()=>{setModel(initial);setLine(true);}}>Reset tray</button>
      </div>
      <p className="gp-check" role="status">{state}{full?' · Empty the basket and press Start again.':model.fault?' · The motor is disabled.':''}</p>
      <section className="gp-program-card" aria-label="Simulated Ethernet monitor">
        <h4>Local Ethernet monitor</h4>
        <p><strong>{line?'Receiving telemetry':'No fresh telemetry'}</strong> · {line ? state : 'The Uno still controls the motor locally.'}</p>
        <button type="button" className="gp-button gp-secondary" aria-pressed={line} onClick={()=>setLine(value=>!value)}>
          {line?'Disconnect monitor':'Reconnect monitor'}
        </button>
      </section>
      <h4>Inspect the skimmer</h4>
      <ol className="gp-demo-labels">{aquaclean.parts.map(([name],index)=><li key={name}>
        <button type="button" className="gp-part-label" aria-pressed={index===selected} onClick={()=>setSelected(index)}><span>{index+1}</span>{name}</button>
      </li>)}</ol>
      <p className="gp-demo-description">{aquaclean.parts[selected][2]}</p>
    </div>
  </div>;
}
