import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const zones=[
  {name:'Below band',color:'#f4b64e',pin:'D8'},
  {name:'In band',color:'#65df82',pin:'D9'},
  {name:'Warm',color:'#ff625b',pin:'D10'},
];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Desk-air sensor',at:[-.83,.70,.30],detail:'The TMP36 samples air at the study spot. A0 measures its voltage.'},
  {name:'Temperature threshold dial',at:[1.51,.63,.83],detail:'The dial sets the upper threshold. The lower edge of the comfort band is four degrees below it.'},
  {name:'Three status LEDs',at:[1.35,.70,-.30],detail:'D8 lights amber below the band, D9 lights green within the band, and D10 lights red when the reading reaches the upper threshold.'},
  {name:'Arduino Uno',at:[.25,.42,1.03],detail:'The Uno averages each analog input and rounds to whole degrees before comparing temperature with the chosen band.'},
];
function Desk({high,zone,selected,select}:{high:number;zone:number;selected:number;select:(i:number)=>void}){
  return <>
    <color attach="background" args={['#354a5f']}/>
    <hemisphereLight args={['#e5f0ff','#816d62',2.1]}/>
    <directionalLight position={[-3,6,4]} intensity={2.2} color="#fff2d8"/>
    <Box at={[0,.028,0]} size={[4.8,.22,2.93]} color="#a18368"/>
    {Array.from({length:9},(_,i)=><Box key={i} at={[-2.14+i*.50,.143,0]} size={[.009,.006,2.87]} color="#8b715f"/>)}
    <group position={[-1.11,.19,-.47]} rotation={[0,.12,0]}>
      <Box at={[0,0,.15]} size={[1.5,.083,.96]} color="#75828b" metal={.56}/>
      <Box at={[0,.06,.06]} size={[1.24,.021,.46]} color="#35414d"/>
      {Array.from({length:6},(_,i)=><Box key={i} at={[-.47+i*.187,.074,.053]} size={[.025,.004,.43]} color="#6e7c85"/>)}
      <Box at={[0,.061,.43]} size={[.33,.012,.22]} color="#9aa6ae" metal={.5}/>
      <group position={[0,.09,-.32]} rotation={[-.23,0,0]}>
        <Box at={[0,.45,0]} size={[1.50,.91,.074]} color="#61727d" metal={.49}/>
        <Box at={[0,.46,.044]} size={[1.33,.76,.025]} color="#3e6179"/>
        {[.37,.50,.63].map((y,i)=><Box key={y} at={[-.29+i*.07,y,.059]} size={[.59-i*.09,.029,.008]} color="#829fab"/>)}
      </group>
    </group>
    <group onClick={()=>select(0)}>
      <Box at={[-.76,.203,.37]} size={[.40,.093,.34]} color="#d7d6cb"/>
      <Box at={[-.76,.352,.37]} size={[.059,.24,.059]} color="#809181"/>
      <Box at={[-.76,.487,.37]} size={[.142,.092,.108]} color={selected===0?'#d2a675':'#333f45'}/>
      {[-.044,0,.044].map(x=><Box key={x} at={[-.76+x,.429,.413]} size={[.014,.096,.015]} color="#adbbbf" metal={.64}/>)}
    </group>
    <Box at={[-1.52,.184,.56]} size={[.48,.071,.41]} color="#7d9c9b"/>
    <Box at={[-1.52,.227,.56]} size={[.36,.024,.29]} color="#d0ddd4"/>
    <group position={[1.48,.174,.83]} onClick={()=>select(1)}>
      <Box at={[0,0,0]} size={[.40,.08,.40]} color="#677982"/>
      <mesh position={[0,.056,0]}><cylinderGeometry args={[.17,.17,.028,27]}/><meshStandardMaterial color="#ddd6c6"/></mesh>
      <group position={[0,.143,0]} rotation={[0,(high-28)*.46,0]}>
        <mesh><cylinderGeometry args={[.113,.128,.139,28]}/><meshStandardMaterial color={selected===1?'#c18f5a':'#334452'}/></mesh>
        <Box at={[0,.074,.036]} size={[.022,.008,.08]} color="#e7d5b0"/>
      </group>
    </group>
    <group onClick={()=>select(2)}>
      <Box at={[1.36,.218,-.37]} size={[1.11,.153,.39]} color={selected===2?'#b78c61':'#566a75'} metal={.4}/>
      {zones.map(({pin,color},i)=><group key={pin} position={[1.00+i*.35,.333,-.34]}>
        <mesh><cylinderGeometry args={[.082,.085,.053,22]}/><meshStandardMaterial color="#26323c"/></mesh>
        <mesh position={[0,.034,0]} scale={[1,.83,1]}><sphereGeometry args={[.061,20,12]}/><meshStandardMaterial color={color} emissive={color} emissiveIntensity={zone===i?2.15:0} roughness={.53}/></mesh>
        {zone===i&&<pointLight position={[0,.085,.034]} color={color} intensity={.76} distance={.78}/>}
      </group>)}
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[.31,.203,1.04]} size={[.88,.076,.53]} color={selected===3?'#c28a56':'#27798e'}/>
      <Box at={[.04,.270,1.12]} size={[.18,.111,.15]} color="#b1bec1" metal={.7}/>
      <Box at={[.407,.266,1.04]} size={[.24,.059,.124]} color="#26313b"/>
      {[.862,1.23].map(z=><Box key={z} at={[.38,.26,z]} size={[.53,.052,.059]} color="#29333a"/>)}
      <Box at={[.48,.182,.34]} size={[.56,.084,.47]} color="#e1ded1"/>
      {[.22,.35,.48].map(z=><group key={z} position={[.49,.252,z]}><Box at={[0,0,0]} size={[.35,.02,.022]} color="#afb9be" metal={.65}/><Box at={[0,.008,0]} size={[.16,.048,.049]} color="#bfa482"/></group>)}
    </group>
    <Line points={[[-.76,.416,.42],[-.65,.27,.53],[-.28,.28,.73],[.29,.26,.86]]} color="#d8a056" lineWidth={3}/>
    <Line points={[[1.47,.213,.96],[1.30,.239,1.13],[.81,.245,1.24],[.52,.269,1.23]]} color="#648db4" lineWidth={3}/>
    <Line points={[[1.01,.253,-.19],[.88,.24,.04],[.74,.241,.15],[.66,.252,.22],[.42,.277,.86]]} color="#d6a05e" lineWidth={2.5}/>
    <Line points={[[1.35,.253,-.20],[1.10,.234,.02],[.72,.23,.26],[.65,.251,.35],[.51,.269,.86]]} color="#669383" lineWidth={2.5}/>
    <Line points={[[1.70,.258,-.21],[1.32,.241,.095],[1.04,.24,.32],[.66,.24,.48],[.57,.269,.86]]} color="#b46759" lineWidth={2.5}/>
    <Line points={[[1.65,.225,-.18],[1.24,.215,.20],[1.03,.211,.61],[.90,.22,1.25],[.56,.268,1.23]]} color="#3b454e" lineWidth={2}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.147,0]} opacity={.32} scale={5} far={1.3} resolution={128} frames={1}/>
  </>;
}

export default function DeskComfortDemo(){
  const [temperature,setTemperature]=useState(25);
  const [high,setHigh]=useState(27);
  const [selected,select]=useState(0);
  const low=high-4;
  const zone=temperature<low?0:temperature>=high?2:1;
  const active=zones[zone];
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D desk comfort monitor">
        <Canvas camera={{position:[2.42,3.55,6.05],fov:40}} dpr={[1,1.6]} fallback={<p>Compare the two inputs below.</p>}>
          <Desk {...{high,zone,selected,select}}/><OrbitControls target={[0,.38,0]} enablePan={false} minDistance={3.4} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Desk monitor readings"><div><span>Desk air</span><strong>{temperature} °C</strong></div><div><span>Selected band</span><strong>{low}–{high-1} °C</strong></div><div><span>Active output</span><strong>{active.pin} · {active.name}</strong></div></div>
    </div>
    <div className="gp-guide">
      <h3>Change the air or the threshold</h3>
      <label className="gp-home-light">Desk temperature <output>{temperature} °C</output><input aria-label="Desk temperature" type="range" min="16" max="36" value={temperature} onChange={e=>setTemperature(e.target.valueAsNumber)}/></label>
      <label className="gp-home-light">Upper threshold <output>{high} °C</output><input aria-label="Upper threshold" type="range" min="24" max="32" value={high} onChange={e=>setHigh(e.target.valueAsNumber)}/></label>
      <div className="gp-steps">
        <button type="button" onClick={()=>setTemperature(22)}>Cool desk</button>
        <button type="button" onClick={()=>setTemperature(30)}>Warm desk</button>
        <button type="button" onClick={()=>{setTemperature(25);setHigh(27);}}>Reset trial</button>
      </div>
      <p role="status">{['Amber · Below chosen band.','Green · Within chosen band.','Red · Warm threshold reached.'][zone]}</p>
      <p>The band is a setting for the experiment. Keep the air reading fixed and adjust the dial to change the classification.</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
