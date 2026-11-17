import {useEffect,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const pivot:Point=[.84,.68,-.47];
const endpoints=[70,90,110];
const trial=[70,110,70,110,70,110];
const labels:{name:string;at:Point;detail:string}[]=[
  {name:'Arduino Uno',at:[-1.28,.42,.92],detail:'D9 carries the position command on the orange lead. USB powers the Uno.'},
  {name:'Separate 5 V supply',at:[-1.48,.71,-.68],detail:'The red and dark leads feed the servo from the external 5 V supply. The supply negative also connects to Uno GND.'},
  {name:'Servo shaft and horn',at:[.80,1.03,-.56],detail:'The SG92R turns its output shaft and the horn. The center screw holds the horn to the shaft.'},
  {name:'Angle scale and link',at:[1.52,.37,.91],detail:'The pointer sweeps over the fixed scale. Use the physical scale to check the endpoint because a command does not measure actual shaft position.'},
];
function dialPoint(angle:number,radius:number,y:number):Point {
  const theta=(angle-90)*Math.PI/180;
  return [pivot[0]+Math.sin(theta)*radius,y,pivot[2]+Math.cos(theta)*radius];
}
const arc=Array.from({length:33},(_,i)=>dialPoint(50+i*2.5,1.29,.606));
const marks=Array.from({length:17},(_,i)=>50+i*5);
const wires:{color:string;points:Point[]}[]=[
  {color:'#df534b',points:[[-1.27,.28,-.18],[-1.13,.29,-.03],[-.64,.26,-.12],[-.13,.28,-.37],[.55,.35,-.69]]},
  {color:'#252c38',points:[[-1.53,.28,-.18],[-1.38,.31,-.01],[-.96,.27,.05],[-.59,.22,-.02],[.55,.38,-.72]]},
  {color:'#383f46',points:[[-1.38,.26,.66],[-1.28,.32,.28],[-1.21,.32,.07],[-1.53,.28,-.18]]},
  {color:'#e9a047',points:[[-.84,.29,.67],[-.52,.32,.53],[-.19,.31,.18],[.12,.29,-.36],[.56,.40,-.75]]},
];
function Jig({angle,selected,select}:{angle:number;selected:number;select:(i:number)=>void}) {
  const rotation=(angle-90)*Math.PI/180;
  return <>
    <color attach="background" args={['#2b4053']}/>
    <hemisphereLight args={['#e5efff','#836a55',2.1]}/>
    <directionalLight position={[-4,6,4]} intensity={2.25} color="#fff0d9"/>
    <Box at={[0,-.09,0]} size={[4.84,.18,3]} color="#435569"/>
    <Box at={[0,.065,0]} size={[4.56,.13,2.77]} color="#9e8065"/>
    {[-2.1,2.1].flatMap(x=>[-1.2,1.2].map(z=><mesh key={x+':'+z} position={[x,.15,z]}><cylinderGeometry args={[.039,.039,.033,6]}/><meshStandardMaterial color="#bec5ca" metalness={.71}/></mesh>))}
    <group position={[-1.24,.18,.83]} onClick={()=>select(0)}>
      <Box at={[0,0,0]} size={[1.07,.077,.68]} color={selected===0?'#ca9260':'#217b95'}/>
      <Box at={[-.36,.092,.13]} size={[.20,.123,.17]} color="#a9b7c1" metal={.72}/>
      <Box at={[.13,.082,0]} size={[.32,.066,.16]} color="#243038"/>
      {[-.24,.24].map(z=><group key={z}><Box at={[.09,.071,z]} size={[.68,.076,.074]} color="#252e34"/>
        {Array.from({length:9},(_,i)=><Box key={i} at={[-.15+i*.061,.112,z]} size={[.020,.009,.023]} color="#c6ac7c"/>)}</group>)}
      <Line points={[[-.45,.09,.13],[-.61,.08,.13],[-.81,.01,.35],[-1.02,-.03,.38]]} color="#2a3541" lineWidth={4}/>
    </group>
    <group position={[-1.40,.34,-.67]} onClick={()=>select(1)}>
      <Box at={[0,0,0]} size={[.89,.42,.78]} color={selected===1?'#b18555':'#405160'} metal={.35}/>
      <Box at={[0,.02,.403]} size={[.71,.30,.024]} color="#263442"/>
      <Box at={[0,.11,.422]} size={[.30,.093,.025]} color="#293a38"/>
      <Box at={[0,.11,.438]} size={[.19,.020,.005]} color="#8ff297"/>
      {[-.13,.13].map((x,i)=><mesh key={x} position={[x,-.067,.428]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.050,.050,.081,16]}/><meshStandardMaterial color={i?'#b64441':'#373d43'}/></mesh>)}
    </group>
    {[.07,1.68].flatMap(x=>[.22,1.11].map(z=><Box key={x+':'+z} at={[x,.36,z]} size={[.09,.46,.09]} color="#7e8a90" metal={.55}/>))}
    <Box at={[.87,.585,.66]} size={[2.06,.036,1.22]} color={selected===3?'#e8bc82':'#e0dbcd'}/>
    <Line points={arc} color="#3b526a" lineWidth={2}/>
    {marks.map(value=><Line key={value} points={[dialPoint(value,1.29,.608),dialPoint(value,endpoints.includes(value)?1.09:1.22,.608)]} color={endpoints.includes(value)?'#376488':'#687883'} lineWidth={endpoints.includes(value)?2.5:1}/>)}
    {endpoints.map(value=><WorldLabel key={value} position={dialPoint(value,1.50,.621)} className="gp-marker-anchor"><span aria-hidden="true" className="gp-servo-degree">{value}°</span></WorldLabel>)}
    <group onClick={()=>select(2)}>
      <Box at={[.78,.22,-.49]} size={[.89,.16,.56]} color="#626e73" metal={.49}/>
      <Box at={[.81,.43,-.52]} size={[.62,.42,.31]} color={selected===2?'#c0894e':'#32668f'} metal={.3}/>
      <Box at={[.81,.58,-.52]} size={[.68,.097,.33]} color="#4f8db4"/>
      <mesh position={[pivot[0],.644,pivot[2]]}><cylinderGeometry args={[.11,.115,.09,24]}/><meshStandardMaterial color="#e3e2d5"/></mesh>
      {[-.36,.36].map(x=><mesh key={x} position={[.81+x,.312,-.52]}><cylinderGeometry args={[.036,.036,.033,6]}/><meshStandardMaterial color="#c7cdd0" metalness={.71}/></mesh>)}
    </group>
    <group position={pivot} rotation={[0,rotation,0]} onClick={()=>select(3)}>
      <Box at={[0,.023,.19]} size={[.17,.048,.55]} color="#e4e1d6"/>
      <Box at={[0,.058,.71]} size={[.176,.058,1.02]} color={selected===3?'#edae57':'#c28053'}/>
      <Box at={[0,.091,1.18]} size={[.09,.021,.12]} color="#2e5572"/>
      <Box at={[0,-.012,1.22]} size={[.034,.126,.035]} color="#2e5572"/>
      {Array.from({length:4},(_,i)=><mesh key={i} position={[0,.09,.08+i*.10]}><cylinderGeometry args={[.018,.018,.012,10]}/><meshStandardMaterial color={i?'#b2a18c':'#87949a'} metalness={i===0?.7:.2}/></mesh>)}
    </group>
    {wires.map(({color,points},i)=><Line key={i} color={color} points={points} lineWidth={3}/>)}
    {labels.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.008,0]} opacity={.37} scale={5} far={1.3} resolution={128} frames={1}/>
  </>;
}

export default function DesktopServoDemo() {
  const [selected,select]=useState(2);
  const [angle,setAngle]=useState(90);
  const [target,setTarget]=useState(90);
  const [step,setStep]=useState(-1);
  const [landings,setLandings]=useState<number[]>([]);
  const running=step>=0;
  const settled=angle===target;
  useEffect(()=>{
    if(settled)return;
    const timer=window.setInterval(()=>setAngle(current=>current===target?current:current+Math.sign(target-current)),18);
    return ()=>window.clearInterval(timer);
  },[settled,target]);
  useEffect(()=>{
    if(!running||!settled)return;
    const timer=window.setTimeout(()=>{
      setLandings(previous=>[...previous,target]);
      if(step===trial.length-1)setStep(-1);
      else {setStep(step+1);setTarget(trial[step+1]);}
    },360);
    return ()=>window.clearTimeout(timer);
  },[running,settled,step,target]);
  function command(value:number){setStep(-1);setTarget(value);setLandings([]);}
  function reset(){setStep(-1);setTarget(90);setLandings([]);}
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D desktop servo arm">
        <Canvas camera={{position:[2.38,3.4,5.37],fov:40}} dpr={[1,1.6]} fallback={<p>Use the target controls and angle readings below.</p>}>
          <Jig {...{angle,selected,select}}/>
          <OrbitControls target={[0,.31,0]} enablePan={false} minDistance={3} maxDistance={9}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Servo arm readings">
        <div><span>Command</span><strong>{target}°</strong></div>
        <div><span>Model pointer</span><strong>{angle}°</strong></div>
        <div><span>Trial moves settled</span><strong>{landings.length} of 6</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Move the arm between its marks</h3>
      <div className="gp-steps">{endpoints.map(value=><button key={value} type="button" aria-pressed={target===value&&!running} onClick={()=>command(value)}>Move to {value}°</button>)}</div>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={running} onClick={()=>{setLandings([]);setStep(0);setTarget(trial[0]);}}>Run three cycles</button>
        <button type="button" onClick={reset}>Reset to center</button>
      </div>
      <p role="status">{settled?landings.length===6&&!running?'Trial complete · Six endpoint arrivals.':`At ${angle}°.`:`Moving to ${target}°.`}</p>
      <p><strong>Recorded endpoints</strong> {landings.length?landings.map(value=>`${value}°`).join(' → '):'Run the trial to record the arrivals.'}</p>
      <ol className="gp-demo-labels">{labels.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{labels[selected].detail}</p>
    </div>
  </div>;
}
