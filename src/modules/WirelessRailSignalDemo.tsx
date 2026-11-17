import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { type Group, type Mesh } from 'three';
import { linkTimeout, replyInterval, type CabAspect, type RailAspect } from '../data/wireless-rail-signal';
import { Esp32Board } from './ProjectDemo';
import { WorldLabel } from './LabWorkbench';

type Point = [number,number,number];
const START = -3.04, STOP = .05, FINISH = 3.35;
const parts = [
  ['Trackside switch','Press the switch to pull GPIO 25 low. The trackside ESP32 toggles the mast and includes the new aspect in its next reply.'],
  ['Signal mast','GPIO 26 and 27 drive the red and green lamps through separate resistors. Red is the startup aspect.'],
  ['Trackside ESP32','The board runs its own Wi-Fi access point. It echoes the cab’s request ID with the current signal aspect.'],
  ['Cab radio','The cab asks for a fresh report every 250 ms. It checks the source, request ID and aspect before accepting a reply.'],
  ['Cab indicator lamps','Red means Stop, green means Clear, and amber means No update. After one second without a valid reply, amber replaces the previous aspect.'],
] as const;
const aspectNames: Record<CabAspect,string> = {red:'Stop',green:'Clear',offline:'No update'};
const colors: Record<CabAspect,string> = {red:'#e51e12',green:'#1ac766',offline:'#f4a318'};

function Panel({at,size,color,metal=0}: {at:Point;size:Point;color:string;metal?:number}){
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.22} smoothness={2}>
    <meshStandardMaterial color={color} roughness={.58} metalness={metal}/>
  </RoundedBox>;
}
function Lamp({at,aspect,on}: {at:Point;aspect:CabAspect;on:boolean}){
  return <mesh position={at}><sphereGeometry args={[.069,20,16]}/>
    <meshStandardMaterial color={on?colors[aspect]:'#383e43'} emissive={colors[aspect]} emissiveIntensity={on?.96:0} roughness={.31}/>
  </mesh>;
}
function Marker({part,at,selected,select}: {part:number;at:Point;selected:number;select:(i:number)=>void}){
  return <WorldLabel position={at} className="gp-marker-anchor">
    <button type="button" className="gp-marker" aria-label={parts[part][0]} aria-pressed={part===selected} onClick={()=>select(part)}>
      {part+1}{part===selected&&<span className="gp-demo-marker-name">{parts[part][0]}</span>}
    </button>
  </WorldLabel>;
}
function Locomotive({nose, moving, cab, selected, select}: {
  nose:number;moving:boolean;cab:CabAspect;selected:number;select:(i:number)=>void;
}){
  const wheels = useRef<Group>(null);
  useFrame(()=>wheels.current?.children.forEach(wheel=>{wheel.rotation.z=-(nose-START)/.136;}));
  return <group position={[nose-.69,.17,0]}>
    <Panel at={[0,.16,0]} size={[1.42,.16,.53]} color="#272d34" metal={.52}/>
    <Panel at={[.26,.35,0]} size={[.75,.29,.46]} color="#8b5635" metal={.34}/>
    <Panel at={[.26,.431,0]} size={[.69,.071,.462]} color="#c3894a" metal={.41}/>
    <Panel at={[-.43,.42,0]} size={[.55,.43,.53]} color="#254a59" metal={.4}/>
    <Panel at={[-.45,.67,0]} size={[.60,.095,.62]} color="#303d46" metal={.46}/>
    <Panel at={[-.44,.51,.268]} size={[.34,.139,.018]} color="#a1c0c7" metal={.35}/>
    <Panel at={[-.146,.51,0]} size={[.014,.142,.33]} color="#7399a4" metal={.45}/>
    <Panel at={[.70,.16,0]} size={[.08,.121,.61]} color="#bd9b56" metal={.53}/>
    <mesh position={[.55,.39,0]}><sphereGeometry args={[.053,18,14]}/><meshStandardMaterial color="#fff0bb" emissive="#ffc66c" emissiveIntensity={moving?2.1:.35}/></mesh>
    <group ref={wheels}>
      {[-.49,.014,.49].flatMap(x=>[-.273,.273].map(z=><group key={x+':'+z} position={[x,.100,z]}>
        <mesh rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.127,.127,.052,25]}/><meshStandardMaterial color="#33383d" metalness={.67}/></mesh>
        <Panel at={[.055,.011,Math.sign(z)*.033]} size={[.075,.038,.02]} color="#939ca0" metal={.68}/>
      </group>))}
    </group>
    <group position={[-.43,.735,-.07]} onClick={()=>select(3)}>
      <Panel at={[0,-.028,0]} size={[.53,.047,.46]} color={selected===3?'#e4b973':'#536875'} metal={.5}/>
      <group scale={.44} rotation={[0,Math.PI/2,0]}><Esp32Board receiving={cab!=='offline'}/></group>
    </group>
    <group position={[-.43,.745,.30]} onClick={()=>select(4)}>
      <Panel at={[0,0,0]} size={[.52,.109,.17]} color={selected===4?'#c39052':'#292e37'}/>
      {(['red','green','offline'] as const).map((value,i)=><group key={value} position={[.157*(i-1),.073,.014]} scale={.64}><Lamp at={[0,0,0]} aspect={value} on={value===cab}/></group>)}
    </group>
    <Marker part={3} at={[-.58,1.09,-.22]} {...{selected,select}}/>
    <Marker part={4} at={[-.34,.94,.46]} {...{selected,select}}/>
  </group>;
}

function RadioPulse({nose, delivered}: {nose:number;delivered:boolean}){
  const carrier = useRef<Mesh>(null);
  useFrame(({clock})=>{
    const progress=(clock.elapsedTime%1.1)/1.1;
    carrier.current?.position.set(2.18+(nose-3.30)*progress,.34+Math.sin(progress*Math.PI)*.96+.58*progress,1.47-1.47*progress);
  });
  return delivered?<mesh ref={carrier}><sphereGeometry args={[.056,16,12]}/><meshBasicMaterial color="#73eafa"/></mesh>:null;
}

function Diorama({nose,moving,power,mast,cab,delivered,selected,select}: {
  nose:number;moving:boolean;power:boolean;mast:RailAspect;cab:CabAspect;delivered:boolean;selected:number;select:(i:number)=>void;
}){
  return <>
    <color attach="background" args={['#253947']}/>
    <hemisphereLight args={['#e5f2ff','#5d524a',2.18]}/>
    <directionalLight position={[-3,6,4]} intensity={2.65}/>
    <Panel at={[0,-.17,.10]} size={[9.1,.31,4.7]} color="#7f6253"/>
    <Panel at={[0,.006,.1]} size={[9.02,.05,4.60]} color="#738373"/>
    <Panel at={[0,.051,0]} size={[8.84,.075,1.17]} color="#77736d"/>
    {Array.from({length:30},(_,i)=><Panel key={i} at={[-4.26+i*.292,.095,0]} size={[.139,.064,.88]} color={i%2?'#574c44':'#655746'}/>)}
    {[-.237,.237].map(z=><Panel key={z} at={[0,.134,z]} size={[8.86,.049,.035]} color="#acb2b3" metal={.71}/>)}
    <Panel at={[STOP,.113,0]} size={[.065,.02,1.11]} color="#e6cc8a"/>
    <Panel at={[STOP-.27,.117,.66]} size={[.48,.031,.26]} color="#644630"/>
    <WorldLabel position={[STOP-.27,.192,.69]} className="gp-rail-stop-anchor"><span className="gp-rail-stop">STOP LINE</span></WorldLabel>
    <Panel at={[-1.70,.068,-1.53]} size={[2.6,.054,.78]} color="#546667"/>
    {[-2.5,-.7].map(x=><Panel key={x} at={[x,.109,-1.61]} size={[.35,.072,.49]} color="#596349"/>)}
    <group position={[.85,0,-1.65]}>
      <Panel at={[0,.25,0]} size={[1.0,.47,.63]} color="#a59b83"/>
      <Panel at={[0,.52,0]} size={[1.13,.112,.74]} color="#4c5b60" metal={.36}/>
      <Panel at={[-.22,.197,.32]} size={[.28,.34,.026]} color="#44545a"/>
      <Panel at={[.23,.32,.323]} size={[.31,.16,.023]} color="#6f99a4" metal={.39}/>
    </group>
    <group position={[.48,.05,.78]} onClick={()=>select(1)}>
      <Panel at={[0,.045,0]} size={[.32,.10,.36]} color="#878a83"/>
      <Panel at={[0,.49,0]} size={[.068,.89,.071]} color="#adb5b5" metal={.64}/>
      <Panel at={[0,.98,0]} size={[.255,.37,.151]} color={selected===1?'#a27c4d':'#2c373d'}/>
      <Lamp at={[0,1.07,.087]} aspect="red" on={power&&mast==='red'}/>
      <Lamp at={[0,.90,.087]} aspect="green" on={power&&mast==='green'}/>
    </group>
    <Marker part={1} at={[.48,1.40,.80]} {...{selected,select}}/>
    <group position={[2.24,.087,1.46]}>
      <Panel at={[0,.07,0]} size={[1.57,.17,.86]} color="#2e4956" metal={.36}/>
      <group position={[-.46,.16,.07]} onClick={()=>select(0)}>
        <Panel at={[0,0,0]} size={[.28,.055,.28]} color="#49555d"/>
        <mesh position={[0,.053,0]}><cylinderGeometry args={[.09,.09,.08,24]}/><meshStandardMaterial color={selected===0?'#f6bd6d':'#a94c35'}/></mesh>
      </group>
      <group position={[.22,.19,-.05]} onClick={()=>select(2)}>
        <Panel at={[0,-.028,0]} size={[.70,.040,.50]} color={selected===2?'#edc16f':'#c5c5b5'}/>
        <group scale={.55} rotation={[0,Math.PI/2,0]}><Esp32Board receiving={power}/></group>
      </group>
      <Marker part={0} at={[-.53,.49,.25]} {...{selected,select}}/>
      <Marker part={2} at={[.37,.52,-.09]} {...{selected,select}}/>
    </group>
    <Line points={[[.47,.091,.81],[.65,.104,1.14],[1.26,.095,1.47],[1.94,.20,1.44]]} color="#b96d50" lineWidth={2.6}/>
    <Locomotive {...{nose,moving,cab,selected,select}}/>
    <RadioPulse nose={nose} delivered={delivered}/>
    <ContactShadows position={[0,.164,0]} opacity={.36} scale={9} blur={2.3} far={1.7} resolution={128}/>
  </>;
}

export default function WirelessRailSignalDemo(){
  const [power,setPower]=useState(true);
  const [obstructed,setObstructed]=useState(false);
  const [mast,setMast]=useState<RailAspect>('red');
  const [cab,setCab]=useState<CabAspect>('offline');
  const [nose,setNose]=useState(START);
  const [driving,setDriving]=useState(false);
  const [selected,select]=useState(1);
  const delivered=power&&!obstructed;
  const lastGood=useRef<number|null>(null);
  useEffect(()=>{
    if(delivered){
      const timer=window.setInterval(()=>{
        lastGood.current=performance.now();
        setCab(mast);
      },replyInterval);
      return ()=>window.clearInterval(timer);
    }
    const remaining=lastGood.current===null?0:linkTimeout-(performance.now()-lastGood.current);
    const timer=window.setTimeout(()=>setCab('offline'),Math.max(0,remaining));
    return ()=>window.clearTimeout(timer);
  },[delivered,mast]);
  const waiting=driving&&nose===STOP&&cab!=='green';
  const moving=driving&&!waiting&&nose<FINISH;
  useEffect(()=>{
    if(!moving)return;
    const timer=window.setInterval(()=>setNose(x=>{
      if(x<=STOP&&cab!=='green')return Math.min(STOP,x+.065);
      return Math.min(FINISH,x+.065);
    }),45);
    return ()=>window.clearInterval(timer);
  },[moving,cab]);
  const message=nose===FINISH?'Train passed the model signal':waiting?'Train waiting at the stop marker':driving?'Train approaching the signal':'Train parked at the start';
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D wireless model railway">
        <Canvas camera={{position:[2.4,5.6,7.8],fov:47}} dpr={[1,1.6]} fallback={<p>Use the controls and readings to test the link.</p>}>
          <Diorama {...{nose,moving,power,mast,cab,delivered,selected,select}}/>
          <OrbitControls target={[0,.22,.08]} minDistance={4.7} maxDistance={17} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Railway signal readings">
        <div><span>Trackside mast</span><strong>{power?aspectNames[mast]:'Power off'}</strong></div>
        <div><span>Wireless path</span><strong>{delivered?'Available':'Interrupted'}</strong></div>
        <div><span>Cab indicator</span><strong>{aspectNames[cab]}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Drive the model approach</h3>
      <p>Run the train toward red, then switch to green. Interrupt the radio and watch amber replace the previous cab light. In the physical build, move the train by hand.</p>
      <div className="gp-steps" role="group" aria-label="Signal station controls">
        <button type="button" disabled={!power} onClick={()=>setMast(value=>value==='red'?'green':'red')}>{mast==='red'?'Set mast green':'Set mast red'}</button>
        <button type="button" aria-pressed={obstructed} onClick={()=>setObstructed(value=>!value)}>{obstructed?'Restore radio':'Interrupt radio'}</button>
        <button type="button" aria-pressed={!power} onClick={()=>{if(!power)setMast('red');setPower(!power);}}>{power?'Switch off trackside':'Restore trackside power'}</button>
      </div>
      <div className="gp-steps">
        <button type="button" className="gp-button" disabled={driving} onClick={()=>setDriving(true)}>Run approach</button>
        <button type="button" disabled={!driving} onClick={()=>{setDriving(false);setNose(START);}}>Reset train</button>
      </div>
      <p role="status" className="gp-demo-description">{message}</p>
      <ol className="gp-demo-labels">{parts.map(([name],i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol>
      <p className="gp-demo-description">{parts[selected][1]}</p>
    </div>
  </div>;
}
