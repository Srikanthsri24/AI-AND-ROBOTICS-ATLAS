import {useEffect,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Bottom edge · D8',at:[1.27,.56,.94],detail:'D8 turns on as soon as the reading reaches 45% or below.'},
  {name:'Middle edge · D9',at:[1.34,.87,.33],detail:'D9 turns on after 250 ms while the bottom marker stays on.'},
  {name:'Top edge · D10',at:[1.43,1.22,-.31],detail:'D10 turns on after 500 ms. The three edges stay lit until the room reaches 55%.'},
  {name:'Room-light sensor',at:[-1.43,.48,.24],detail:'The photoresistor faces the room, away from the step lights. A0 reads its divider.'},
  {name:'Arduino and resistors',at:[-1.06,.40,1.02],detail:'Each output has its own 220 Ω series resistor. All three LED cathodes share ground.'},
];
const edges=[
  {z:.77,y:.29,wire:'#b2584d'},
  {z:.15,y:.61,wire:'#cca04f'},
  {z:-.47,y:.93,wire:'#527ca0'},
];

function Staircase({light,lit,selected,select}:{light:number;lit:number;selected:number;select:(i:number)=>void}){
  const illumination=.33+light*.024;
  return <>
    <color attach="background" args={[light<45?'#233047':'#405467']}/>
    <hemisphereLight args={['#dce9fc','#79695e',illumination]}/>
    <directionalLight position={[-3,5,5]} intensity={illumination} color="#fff1cf"/>
    <Box at={[0,-.095,0]} size={[4.75,.19,3]} color="#586979"/>
    <Box at={[.77,.046,-.02]} size={[2.74,.09,2.58]} color="#4d5b64"/>
    {edges.map(({z,y,wire},i)=>{
      const on=i<lit;
      return <group key={z} onClick={()=>select(i)}>
        <Box at={[.80,y/2,z-.24]} size={[2.34,y,.65+i*.012]} color={selected===i?'#b5875c':i%2?'#887466':'#9e8773'}/>
        <Box at={[.80,y-.009,z-.23]} size={[2.39,.076,.69]} color={selected===i?'#d5b087':'#b39a84'}/>
        <Box at={[.80,y-.027,z+.103]} size={[2.35,.068,.042]} color="#465461"/>
        <mesh position={[.80,y-.025,z+.131]}><boxGeometry args={[1.98,.028,.018]}/><meshStandardMaterial color={on?'#ffe7b8':'#a9b1b3'} emissive="#ffca80" emissiveIntensity={on?1.7:0}/></mesh>
        <mesh position={[.80,y-.025,z+.153]} scale={[1,1,.48]}><sphereGeometry args={[.055,18,12]}/><meshStandardMaterial color={on?'#ffdfab':'#d4d3c5'} emissive="#ffd08a" emissiveIntensity={on?2.1:0}/></mesh>
        {on&&<pointLight position={[.8,y+.03,z+.15]} color="#ffcd88" intensity={2.12} distance={1.35}/>}
        <Line points={[[1.85,y-.028,z+.131],[2.03,y-.04,z+.105],[2.04,.12,z+.04],[1.96,.108,1.10+i*.063],[.10,.175,1.02+i*.065]]} color={wire} lineWidth={2.5}/>
      </group>;
    })}
    <Line points={[[1.95,.127,-.39],[2.11,.117,.69],[2.06,.129,1.29],[.11,.162,1.27],[-.98,.22,1.21]]} color="#292f39" lineWidth={2.5}/>
    <group onClick={()=>select(3)}>
      <Box at={[-1.46,.132,.21]} size={[.39,.16,.36]} color="#dbd8cb"/>
      <mesh position={[-1.46,.253,.21]}><cylinderGeometry args={[.069,.069,.04,24]}/><meshStandardMaterial color={selected===3?'#edb575':'#c29e78'}/></mesh>
      <Line points={[[-1.50,.278,.178],[-1.42,.278,.178],[-1.42,.278,.21],[-1.50,.278,.21],[-1.50,.278,.24],[-1.42,.278,.24]]} color="#81523d" lineWidth={2}/>
      <Line points={[[-1.44,.19,.36],[-1.48,.22,.53],[-1.37,.22,.67],[-1.20,.21,.85]]} color="#dca255" lineWidth={3}/>
    </group>
    <group onClick={()=>select(4)}>
      <Box at={[-1.15,.145,1.04]} size={[.84,.077,.46]} color={selected===4?'#b98755':'#26738d'}/>
      <Box at={[-1.42,.214,1.09]} size={[.169,.117,.145]} color="#bac3c8" metal={.7}/>
      <Box at={[-1.06,.20,1.04]} size={[.23,.058,.12]} color="#28333b"/>
      {[.884,1.194].map(z=><Box key={z} at={[-1.01,.204,z]} size={[.48,.056,.057]} color="#27343d"/>)}
      <Box at={[-.34,.13,1.11]} size={[.58,.09,.46]} color="#dedacd"/>
      {[1,1.12,1.24].map(z=><group key={z} position={[-.34,.205,z]}><Box at={[0,0,0]} size={[.42,.023,.021]} color="#a9b3b7" metal={.69}/><Box at={[0,.006,0]} size={[.17,.052,.054]} color="#c3a97d"/></group>)}
      <Line points={[[-.93,.21,.885],[-.65,.213,.876],[-.50,.205,1.00]]} color="#b2584d" lineWidth={2}/>
    </group>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.006,0]} opacity={.34} scale={5} far={1.3} resolution={128} frames={1}/>
  </>;
}
export default function StairModelDemo(){
  const [{light,lit},set]=useState({light:78,lit:0});
  const [selected,select]=useState(0);
  useEffect(()=>{
    if(lit===0||lit===3)return;
    const timer=window.setTimeout(()=>set(previous=>previous.lit===lit?{...previous,lit:lit+1}:previous),250);
    return ()=>window.clearTimeout(timer);
  },[lit]);
  function adjust(light:number){
    set(previous=>({light,lit:light>=55?0:light<=45?Math.max(previous.lit,1):previous.lit}));
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D stair model marker">
        <Canvas camera={{position:[1.88,3.13,5.8],fov:40}} dpr={[1,1.6]} fallback={<p>Follow the step readings below.</p>}>
          <Staircase {...{light,lit,selected,select}}/><OrbitControls target={[0,.46,0]} enablePan={false} minDistance={3.4} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Stair marker readings">
        <div><span>Room light</span><strong>{light}%</strong></div>
        <div><span>Edges lit</span><strong>{lit} of 3</strong></div>
        <div><span>Outputs on</span><strong>{lit?['D8','D9','D10'].slice(0,lit).join(', '):'None'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Follow the markers up the stairs</h3>
      <label className="gp-home-light">Room light <output>{light}%</output><input type="range" aria-label="Room light" min="0" max="100" value={light} onChange={event=>adjust(event.target.valueAsNumber)}/></label>
      <div className="gp-steps">
        <button type="button" onClick={()=>adjust(78)}>Daylight</button>
        <button type="button" onClick={()=>adjust(50)}>Twilight</button>
        <button type="button" onClick={()=>adjust(30)}>Dim the room</button>
      </div>
      <p role="status">{['All markers off.','Bottom edge lit.','Bottom and middle edges lit.','All three edges lit.'][lit]}</p>
      <p>At 45% or below, the markers light 250 ms apart. Between 45% and 55% the light state holds. At 55% or above all markers turn off.</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
