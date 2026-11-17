import {useEffect,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'TMP36 air sensor',at:[.13,.94,.59],detail:'A0 reads the probe in free air. At 29 °C a nominal TMP36 produces roughly 0.790 V.'},
  {name:'Movable vent',at:[1.15,2.21,-.18],detail:'Open the model vent to let the warmer air cool toward room temperature.'},
  {name:'Reference thermometer',at:[1.53,.96,.70],detail:'Put the independent reference at the same height as the TMP36 and allow both readings to settle.'},
  {name:'Warning flag · D8',at:[-.76,.51,1.03],detail:'The flag lights at 29 °C and clears at 27 °C. Between them it keeps its previous state.'},
];

function Terrarium({temperature,vent,warning,selected,select}:{temperature:number;vent:boolean;warning:boolean;selected:number;select:(i:number)=>void}){
  const column=.10+Math.max(0,temperature-18)*.014;
  return <>
    <color attach="background" args={['#32495b']}/>
    <hemisphereLight args={['#e4f0fe','#867b64',2.05]}/>
    <directionalLight position={[-4,6,4]} intensity={2.15} color="#fff0d6"/>
    <Box at={[0,-.098,0]} size={[4.75,.194,2.96]} color="#5f7480"/>
    <Box at={[.61,.149,-.19]} size={[2.63,.29,1.88]} color="#465851"/>
    <Box at={[.61,.297,-.19]} size={[2.54,.07,1.80]} color="#775d4b"/>
    {[-.65,1.90].flatMap(x=>[-1.061,.70].map(z=><Box key={x+':'+z} at={[x,1.108,z]} size={[.039,1.63,.045]} color="#8da29e" metal={.46}/>))}
    {[-1.04,.686].map(z=><Box key={z} at={[.63,1.92,z]} size={[2.58,.055,.059]} color="#788d87" metal={.55}/>)}
    <mesh position={[.63,1.11,-1.045]}><planeGeometry args={[2.53,1.59]}/><meshStandardMaterial color="#9fc7c8" side={2} transparent opacity={.23} depthWrite={false}/></mesh>
    <mesh position={[1.90,1.11,-.18]} rotation={[0,Math.PI/2,0]}><planeGeometry args={[1.73,1.59]}/><meshStandardMaterial color="#9fc7bf" side={2} transparent opacity={.16} depthWrite={false}/></mesh>
    <mesh position={[.63,1.11,.702]}><planeGeometry args={[2.53,1.59]}/><meshStandardMaterial color="#c0dad9" side={2} transparent opacity={.075} depthWrite={false}/></mesh>
    <group position={[1.24,1.949,-.98]} rotation={[vent?-.77:0,0,0]} onClick={()=>select(1)}>
      <Box at={[0,0,.64]} size={[1.3,.061,1.23]} color={selected===1?'#c29669':'#536f65'} metal={.44}/>
      {Array.from({length:7},(_,i)=><Box key={i} at={[-.45+i*.15,.034,.62]} size={[.049,.007,.97]} color="#a4ac98"/>)}
      <Box at={[.25,.045,1.14]} size={[.25,.071,.10]} color="#b4bcac"/>
    </group>
    <Box at={[-.32,1.945,-.19]} size={[.65,.059,1.71]} color="#7e928c" metal={.4}/>
    {[[.60,-.69],[1.16,-.57],[.8,.23]].map(([x,z],i)=><group key={x} position={[x,.32,z]}>
      <mesh position={[0,.08,0]}><cylinderGeometry args={[.18,.14,.16,24]}/><meshStandardMaterial color="#ad8668"/></mesh>
      <mesh position={[0,.26,0]}><cylinderGeometry args={[.022,.027,.29,12]}/><meshStandardMaterial color="#63865e"/></mesh>
      {[-1,1].map(side=><mesh key={side} position={[side*.105,.346,0]} rotation={[.12,i*.58,side*.33]} scale={[.17,.035,.087]}><sphereGeometry args={[1,18,10]}/><meshStandardMaterial color={i===1?'#73946b':'#83a46d'}/></mesh>)}
    </group>)}
    {[[.24,.26],[1.30,-.36],[.68,.55]].map(([x,z],i)=><mesh key={x} position={[x,.377,z]} scale={[.105+i*.018,.071,.09]}><dodecahedronGeometry args={[1,0]}/><meshStandardMaterial color="#a19c91" roughness={.79}/></mesh>)}
    <group onClick={()=>select(0)}>
      <Box at={[.11,.52,.50]} size={[.092,.39,.092]} color="#486465"/>
      <Box at={[.11,.743,.50]} size={[.161,.10,.103]} color={selected===0?'#ddaa74':'#29353b'}/>
      {[-.053,0,.053].map(x=><Box key={x} at={[.11+x,.657,.548]} size={[.017,.116,.015]} color="#b2babb" metal={.63}/>)}
    </group>
    <group onClick={()=>select(2)}>
      <Box at={[1.52,.68,.55]} size={[.31,.68,.085]} color={selected===2?'#cd9a70':'#d6d9cd'}/>
      <Box at={[1.52,.754,.598]} size={[.17,.40,.034]} color="#afb6a9"/>
      <Box at={[1.52,.58+column/2,.621]} size={[.036,column,.022]} color={warning?'#cc624b':'#728ba8'}/>
      {Array.from({length:5},(_,i)=><Box key={i} at={[1.58,.61+i*.074,.618]} size={[.035,.009,.024]} color="#657174"/>)}
    </group>
    <group onClick={()=>select(3)}>
      <Box at={[-1.32,.117,1.085]} size={[.87,.076,.48]} color={selected===3?'#b68857':'#29738b'}/>
      <Box at={[-1.61,.193,1.143]} size={[.18,.12,.16]} color="#abb9c0" metal={.7}/>
      <Box at={[-1.23,.184,1.083]} size={[.26,.056,.11]} color="#28333d"/>
      {[.913,1.256].map(z=><Box key={z} at={[-1.20,.178,z]} size={[.5,.052,.055]} color="#27343f"/>)}
      <Box at={[-.66,.113,1.065]} size={[.48,.093,.43]} color="#ddd9ce"/>
      <Box at={[-.68,.192,1.01]} size={[.32,.02,.023]} color="#a4b2b5" metal={.64}/>
      <Box at={[-.68,.199,1.01]} size={[.145,.055,.052]} color="#bda17a"/>
      <mesh position={[-.49,.264,1.11]}><sphereGeometry args={[.066,21,14]}/><meshStandardMaterial color={warning?'#ff744d':'#9e4341'} emissive="#ff5b39" emissiveIntensity={warning?2.15:0}/></mesh>
      {warning&&<pointLight position={[-.49,.32,1.13]} color="#ff7550" intensity={1.12} distance={.85}/>}
    </group>
    <Line points={[[.11,.67,.55],[.035,.33,.62],[-.32,.226,.77],[-.49,.196,.91],[-1.08,.195,.923]]} color="#db9f51" lineWidth={3}/>
    <Line points={[[.057,.66,.55],[-.03,.33,.63],[-.35,.23,.72],[-1.33,.19,.91]]} color="#b86551" lineWidth={2}/>
    <Line points={[[.164,.656,.55],[.07,.31,.66],[-.25,.19,.90],[-1.12,.19,1.254]]} color="#35404a" lineWidth={2}/>
    {labels.map(({name,at},i)=><WorldLabel key={name} position={i===1&&vent?[1.17,2.62,-.32]:at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.33} scale={5.1} far={1.4} resolution={128} frames={1}/>
  </>;
}

type Reading={temperature:number;warning:boolean};
function measure(previous:Reading,temperature:number):Reading{
  return {temperature,warning:temperature>=29||(temperature>27&&previous.warning)};
}
export default function TerrariumTemperatureDemo(){
  const [{temperature,warning},setReading]=useState<Reading>({temperature:24,warning:false});
  const [vent,setVent]=useState(false);
  const [trial,setTrial]=useState<'warm'|'cool'|null>(null);
  const [selected,select]=useState(0);
  useEffect(()=>{
    if(trial===null)return;
    if(trial==='warm'?temperature>=32:temperature<=24){setTrial(null);return;}
    const timer=window.setTimeout(()=>{
      const end=trial==='warm'?32:24;
      setReading(previous=>measure(previous,previous.temperature+Math.sign(end-previous.temperature)));
    },310);
    return ()=>window.clearTimeout(timer);
  },[temperature,trial]);
  function start(next:'warm'|'cool'){setVent(next==='cool');setTrial(next);}
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D terrarium temperature flag">
        <Canvas camera={{position:[2.45,3.4,6.55],fov:41}} dpr={[1,1.6]} fallback={<p>Compare the temperature readings below.</p>}>
          <Terrarium {...{temperature,vent,warning,selected,select}}/><OrbitControls target={[0,.92,0]} enablePan={false} minDistance={3.7} maxDistance={10}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Terrarium temperature readings"><div><span>Air temperature</span><strong>{temperature} °C</strong></div><div><span>Nominal TMP36 voltage</span><strong>{(.5+temperature*.01).toFixed(3)} V</strong></div><div><span>Warning flag</span><strong>{warning?'On':'Off'}</strong></div></div>
    </div>
    <div className="gp-guide">
      <h3>Warm the model, then vent it</h3>
      <label className="gp-home-light">Air temperature <output>{temperature} °C</output><input type="range" aria-label="Air temperature" min="18" max="36" value={temperature} onChange={event=>{setTrial(null);setReading(previous=>measure(previous,event.target.valueAsNumber));}}/></label>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>start('warm')}>Warm with lid closed</button>
        <button type="button" onClick={()=>start('cool')}>Open vent and cool</button>
        <button type="button" onClick={()=>{setTrial(null);setVent(false);setReading({temperature:24,warning:false});}}>Reset trial</button>
      </div>
      <p role="status">{warning?'High-temperature flag on.':'High-temperature flag off.'}</p>
      <p>The flag turns on at 29 °C and clears at 27 °C. At 28 °C it holds the previous state. The vent animation illustrates cooling in the model.</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
