import {useEffect,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Water reference',at:[.58,1.71,-.27],detail:'The virtual reference reads the test water. In the physical trial, use a separate water-rated thermometer.'},
  {name:'Dry wall sensor · A0',at:[1.93,.76,.64],detail:'The TMP36 stays against the outside face. Its reading follows the water gradually through the tank wall.'},
  {name:'Warning LED · D8',at:[-.31,.47,1.02],detail:'The warning turns on when the wall reaches 28 °C and clears when it falls to 26 °C.'},
  {name:'Arduino Uno',at:[-1.20,.46,1.02],detail:'The Uno reads only the dry wall sensor. It does not read the separate water thermometer.'},
];

function Tank({water,wall,flag,selected,select}:{water:number;wall:number;flag:boolean;selected:number;select:(i:number)=>void}){
  return <>
    <color attach="background" args={['#304a5e']}/>
    <hemisphereLight args={['#deefff','#746e64',2.05]}/>
    <directionalLight position={[-3,6,4]} intensity={2.19} color="#fff2db"/>
    <Box at={[0,-.085,0]} size={[4.91,.171,3.03]} color="#667b87"/>
    <Box at={[.80,.088,-.23]} size={[2.94,.169,1.96]} color="#485d68"/>
    <Box at={[.80,.215,-.23]} size={[2.64,.092,1.69]} color="#a09073"/>
    {[[.04,-.53],[.38,.18],[1.18,-.41],[1.48,.35],[1.65,-.61]].map(([x,z],i)=><mesh key={x} position={[x,.29,z]} scale={[.14+i*.01,.079,.095]}><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color={i%2?'#9c9e8e':'#777d79'} roughness={.84}/></mesh>)}
    {[[.02,-.61],[1.36,-.53],[1.83,.20]].map(([x,z],i)=><group key={x} position={[x,.24,z]}>
      <Line points={[[0,0,0],[-.03,.20,0],[.025,.39,-.035],[-.01,.54,-.02]]} color="#70a68b" lineWidth={2}/>
      {[-1,1].map(side=><mesh key={side} position={[side*.075,.32+i*.03,0]} rotation={[.2,0,side*.50]} scale={[.12,.041,.057]}><sphereGeometry args={[1,17,9]}/><meshStandardMaterial color="#72977b"/></mesh>)}
    </group>)}
    <mesh position={[.8,.775,-.23]}><boxGeometry args={[2.60,1.03,1.63]}/><meshStandardMaterial color={water>28?'#6bb6c2':'#66a8bc'} transparent opacity={.28} depthWrite={false} roughness={.63}/></mesh>
    {[-.52,2.13].flatMap(x=>[-1.077,.614].map(z=><Box key={x+':'+z} at={[x,.897,z]} size={[.039,1.40,.043]} color="#8da4aa" metal={.54}/>))}
    {[-1.07,.615].map(z=><Box key={z} at={[.81,1.61,z]} size={[2.68,.058,.054]} color="#819ba6" metal={.56}/>)}
    <mesh position={[.805,.906,.621]}><planeGeometry args={[2.62,1.36]}/><meshStandardMaterial color="#bedfeb" transparent opacity={.085} side={2} depthWrite={false}/></mesh>
    <mesh position={[2.128,.905,-.228]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[1.68,1.39]}/><meshStandardMaterial color="#add7e5" transparent opacity={.15} side={2} depthWrite={false}/></mesh>
    <group onClick={()=>select(0)}>
      <Box at={[.57,1.36,-.64]} size={[.09,.43,.094]} color={selected===0?'#dcb47e':'#d2d8ca'}/>
      <Box at={[.57,1.377,-.586]} size={[.029,.323,.022]} color="#6f95ac"/>
      <Box at={[.57,1.213,-.58]} size={[.042,.052,.024]} color="#647c9a"/>
    </group>
    <group onClick={()=>select(1)}>
      <Box at={[1.87,.69,.651]} size={[.36,.26,.093]} color={selected===1?'#d3ac7d':'#a6b5b2'}/>
      <Box at={[1.86,.681,.718]} size={[.151,.102,.081]} color={wall>=28?'#875046':'#37464d'}/>
      {[-.047,0,.047].map(x=><Box key={x} at={[1.86+x,.609,.747]} size={[.014,.086,.014]} color="#a9b8be" metal={.66}/>)}
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[-1.32,.128,1.01]} size={[.87,.079,.51]} color={selected===3?'#bd8d58':'#267a93'}/>
      <Box at={[-1.61,.21,1.09]} size={[.18,.12,.158]} color="#b2bdc4" metal={.7}/>
      <Box at={[-1.22,.196,1.01]} size={[.25,.056,.128]} color="#26313a"/>
      {[.834,1.19].map(z=><Box key={z} at={[-1.22,.188,z]} size={[.51,.056,.058]} color="#28343c"/>)}
    </group>
    <group onClick={()=>select(2)}>
      <Box at={[-.46,.131,1.01]} size={[.55,.101,.46]} color={selected===2?'#dfbb8c':'#dedacf'}/>
      <Box at={[-.49,.203,.97]} size={[.34,.021,.022]} color="#aab6bb" metal={.67}/>
      <Box at={[-.49,.21,.97]} size={[.157,.05,.052]} color="#bea179"/>
      <mesh position={[-.27,.259,1.10]}><sphereGeometry args={[.066,21,14]}/><meshStandardMaterial color={flag?'#ff7253':'#994843'} emissive="#ff5c3b" emissiveIntensity={flag?2.1:0}/></mesh>
      {flag&&<pointLight position={[-.27,.32,1.12]} color="#ff7954" intensity={1.08} distance={.9}/>}
    </group>
    <Line points={[[1.86,.59,.74],[1.71,.42,.86],[1.34,.21,.98],[.56,.19,.86],[-1.07,.199,.831]]} color="#dca158" lineWidth={3}/>
    <Line points={[[1.81,.59,.74],[1.64,.39,.88],[1.28,.19,1.11],[.40,.177,1.24],[-1.16,.195,1.19]]} color="#35404a" lineWidth={2}/>
    <Line points={[[1.9,.60,.74],[1.77,.38,.88],[1.49,.18,.97],[.48,.195,.94],[-1.25,.201,.83]]} color="#b96555" lineWidth={2}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.32} scale={5.2} far={1.3} resolution={128} frames={1}/>
  </>;
}

type Reading={wall:number;flag:boolean};
export default function AquariumTemperatureDemo(){
  const [water,setWater]=useState(24);
  const [{wall,flag},setReading]=useState<Reading>({wall:24,flag:false});
  const [selected,select]=useState(1);
  useEffect(()=>{
    if(wall===water)return;
    const timer=window.setTimeout(()=>setReading(previous=>{
      const wall=previous.wall+Math.sign(water-previous.wall);
      return {wall,flag:wall>=28||(wall>26&&previous.flag)};
    }),300);
    return ()=>window.clearTimeout(timer);
  },[wall,water]);
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D aquarium temperature model">
        <Canvas camera={{position:[2.75,3.32,6.60],fov:40}} dpr={[1,1.6]} fallback={<p>Compare both readings below.</p>}>
          <Tank {...{water,wall,flag,selected,select}}/><OrbitControls target={[0,.72,0]} enablePan={false} minDistance={3.7} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Aquarium model readings">
        <div><span>Water reference</span><strong>{water} °C</strong></div><div><span>Wall sensor A0</span><strong>{wall} °C</strong></div><div><span>Warning</span><strong>{flag?'On':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Watch the wall reading catch up</h3>
      <label className="gp-home-light">Water temperature <output>{water} °C</output><input type="range" aria-label="Water temperature" min="18" max="34" value={water} onChange={e=>setWater(e.target.valueAsNumber)}/></label>
      <div className="gp-steps">
        <button type="button" onClick={()=>setWater(31)}>Warm the water</button>
        <button type="button" onClick={()=>setWater(24)}>Cool the water</button>
        <button type="button" onClick={()=>{setWater(24);setReading({wall:24,flag:false});}}>Reset trial</button>
      </div>
      <p role="status">{flag?'Wall-temperature warning on.':'Wall-temperature warning off.'}</p>
      <p>The wall reading changes gradually in the simulation. The warning follows that reading. It turns on at 28 °C and clears at 26 °C.</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
