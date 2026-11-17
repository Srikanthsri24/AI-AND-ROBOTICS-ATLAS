import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
type Zone={temperature:number;flag:boolean};
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Left TMP36 · A0',at:[-.95,.70,.16],detail:'The left probe measures air over the left half and reports it to A0.'},
  {name:'Right TMP36 · A1',at:[1.10,.70,.16],detail:'The right probe sits at the same height. Its reading can differ even though both probes use the same supply.'},
  {name:'Left flag · D8',at:[.38,.45,1.00],detail:'The red LED flags 26 °C or above on the left. Cooling the left side to 25 °C clears it.'},
  {name:'Right flag · D9',at:[1.16,.47,1.10],detail:'The green LED flags warmth on the right. Each LED responds to its own probe.'},
];

function Tray({zones,selected,select}:{zones:[Zone,Zone];selected:number;select:(i:number)=>void}){
  return <>
    <color attach="background" args={['#354b57']}/>
    <hemisphereLight args={['#e2f0fd','#827065',2.1]}/>
    <directionalLight position={[-3,6,4]} intensity={2.2} color="#fff1d7"/>
    <Box at={[0,-.095,0]} size={[4.8,.19,2.96]} color="#657882"/>
    <Box at={[0,.083,-.39]} size={[4.05,.15,1.67]} color="#84948e"/>
    {[-.96,1.06].map((center,side)=><group key={center} position={[center,0,0]} onClick={()=>select(side)}>
      <Box at={[0,.205,-.34]} size={[1.83,.169,1.29]} color={selected===side?'#a78763':'#373f41'}/>
      {[-.66,-.28].flatMap((z,row)=>[-.57,0,.57].map((x,col)=><group key={x+':'+z} position={[x,.303,z]}>
        <Box at={[0,0,0]} size={[.46,.061,.32]} color="#75604b"/>
        <mesh position={[0,.10,0]}><cylinderGeometry args={[.012,.015,.19,9]}/><meshStandardMaterial color="#608962"/></mesh>
        {[-1,1].map(sign=><mesh key={sign} position={[sign*.061,.183+(col%2)*.018,0]} rotation={[.1,row*.52,sign*.26]} scale={[.107,.022,.057]}><sphereGeometry args={[1,14,8]}/><meshStandardMaterial color="#83a471"/></mesh>)}
      </group>))}
      <Box at={[0,.36,.12]} size={[.063,.238,.067]} color="#7a8c85"/>
      <Box at={[0,.505,.12]} size={[.145,.089,.115]} color={selected===side?'#dbac73':'#30393f'}/>
      {[-.045,0,.045].map(x=><Box key={x} at={[x,.439,.165]} size={[.013,.094,.016]} color="#adb7bd" metal={.67}/>)}
    </group>)}
    <Box at={[.05,.207,-.34]} size={[.116,.17,1.36]} color="#b0bbb0"/>
    <Box at={[-1.35,.107,1.03]} size={[.87,.078,.54]} color="#2b7890"/>
    <Box at={[-1.64,.188,1.12]} size={[.18,.12,.16]} color="#b2bdc3" metal={.69}/>
    <Box at={[-1.24,.169,1.03]} size={[.28,.055,.12]} color="#25303d"/>
    {[.84,1.22].map(z=><Box key={z} at={[-1.24,.17,z]} size={[.51,.052,.064]} color="#27343f"/>)}
    <Box at={[-.54,.105,1.03]} size={[.53,.09,.45]} color="#dbdacf"/>
    {[.94,1.12].map(z=><group key={z} position={[-.54,.173,z]}><Box at={[0,0,0]} size={[.32,.024,.021]} color="#b3bbbf" metal={.68}/><Box at={[0,.008,0]} size={[.143,.049,.051]} color="#c5a980"/></group>)}
    {[.39,1.17].map((x,side)=>{
      const color=side===0?'#ff6756':'#67f286';
      return <group key={x} onClick={()=>select(side+2)}>
        <Box at={[x,.105,1.06]} size={[.41,.11,.33]} color={selected===side+2?'#b68b60':'#526473'} metal={.44}/>
        <mesh position={[x,.188,1.06]}><sphereGeometry args={[.069,22,14]}/><meshStandardMaterial color={zones[side].flag?color:side===0?'#994c46':'#467855'} emissive={color} emissiveIntensity={zones[side].flag?2.2:0}/></mesh>
        {zones[side].flag&&<pointLight position={[x,.26,1.10]} color={color} intensity={.89} distance={.78}/>}
      </group>;
    })}
    <Line points={[[-.96,.427,.17],[-.87,.28,.31],[-.95,.17,.51],[-1.15,.19,.84]]} color="#d69e51" lineWidth={3}/>
    <Line points={[[1.06,.427,.17],[1.10,.25,.35],[.72,.175,.55],[-.42,.166,.61],[-1.08,.19,.84]]} color="#628db1" lineWidth={3}/>
    <Line points={[[.39,.166,1.23],[.17,.16,1.33],[-.31,.174,.94],[-1.24,.19,1.22]]} color="#b3685c" lineWidth={2.5}/>
    <Line points={[[1.17,.161,1.21],[.92,.16,1.31],[-.39,.172,1.12],[-1.18,.19,1.22]]} color="#609579" lineWidth={2.5}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.006,0]} opacity={.34} scale={5.1} far={1.3} resolution={128} frames={1}/>
  </>;
}

const initial:[Zone,Zone]=[{temperature:23,flag:false},{temperature:23,flag:false}];
function read(previous:Zone,temperature:number):Zone{
  return {temperature,flag:temperature>=26||(temperature>25&&previous.flag)};
}
export default function SeedTrayTemperatureDemo(){
  const [zones,setZones]=useState(initial);
  const [selected,select]=useState(0);
  const [left,right]=zones;
  function change(side:number,temperature:number){
    setZones(previous=>side===0?[read(previous[0],temperature),previous[1]]:[previous[0],read(previous[1],temperature)]);
  }
  const text=left.flag&&right.flag?'Both flags on.':left.flag?'Left flag on.':right.flag?'Right flag on.':'Both flags clear.';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D seed tray temperature flag">
        <Canvas camera={{position:[2.15,3.52,6.05],fov:40}} dpr={[1,1.6]} fallback={<p>Compare both tray readings below.</p>}>
          <Tray {...{zones,selected,select}}/><OrbitControls target={[0,.38,0]} enablePan={false} minDistance={3.4} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Seed tray readings">
        <div><span>Left A0</span><strong>{left.temperature.toFixed(1)} °C</strong></div>
        <div><span>Right A1</span><strong>{right.temperature.toFixed(1)} °C</strong></div>
        <div><span>Difference</span><strong>{Math.abs(left.temperature-right.temperature).toFixed(1)} °C</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Warm each side independently</h3>
      {zones.map(({temperature},side)=><label className="gp-home-light" key={side}>{side===0?'Left temperature':'Right temperature'} <output>{temperature.toFixed(1)} °C</output><input aria-label={side===0?'Left temperature':'Right temperature'} type="range" min="18" max="34" step=".5" value={temperature} onChange={e=>change(side,e.target.valueAsNumber)}/></label>)}
      <div className="gp-steps">
        <button type="button" onClick={()=>change(0,28)}>Warm left</button>
        <button type="button" onClick={()=>change(1,28)}>Warm right</button>
        <button type="button" onClick={()=>setZones(initial)}>Reset both sides</button>
      </div>
      <p role="status">{text}</p>
      <p>Each flag turns on at 26 °C and clears at 25 °C. Between those readings, it keeps its previous state.</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
