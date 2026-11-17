import { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { ContactShadows, Line, OrbitControls, RoundedBox } from '@react-three/drei';
import { MathUtils, type Group } from 'three';
import { stations } from '../data/classroom-stations';
import { Sonar } from './DetectionBenchDemo';
import { WorldLabel } from './LabWorkbench';
import '../styles/classroom-stations.css';

type Point=[number,number,number];
type Rover={col:number;row:number;direction:number};
const directions=['east','south','west','north'];
const arrows=['→','↓','←','↑'];
const offsets=[[1,0],[0,1],[-1,0],[0,-1]];
const origin={row:0,col:0,direction:0};
const blocked=(row:number,col:number)=>row===0&&col===1;
const goal=(row:number,col:number)=>row===2&&col===3;
const fieldX=3.05,fieldZ=.12;
const roverAt=(row:number,col:number):Point=>[fieldX+.48*(col-1.5),.18,fieldZ+.48*(row-1)];

function Block({at,size,color,metal=0}:{at:Point;size:Point;color:string;metal?:number}) {
  return <RoundedBox position={at} args={size} radius={Math.min(...size)*.16} smoothness={2} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={metal?.31:.63} metalness={metal}/>
  </RoundedBox>;
}

export function Uno({at, highlighted = false}:{at:Point;highlighted?:boolean}) {
  return <group position={at}>
    <Block at={[0,.06,0]} size={[.88,.09,.61]} color={highlighted?'#3c96b5':'#1b6a8b'}/>
    <Block at={[-.36,.15,-.15]} size={[.26,.17,.21]} color="#bdc7c9" metal={.62}/>
    <Block at={[-.31,.138,.18]} size={[.17,.14,.17]} color="#24282c"/>
    <Block at={[.19,.124,.07]} size={[.29,.072,.14]} color="#303235"/>
    {[-.244,.25].map(z=><group key={z} position={[.11,.132,z]}>
      <Block at={[0,0,0]} size={[.59,.067,.08]} color="#252e36"/>
      {Array.from({length:8},(_,i)=><Block key={i} at={[-.256+.069*i,.036,0]} size={[.023,.015,.032]} color="#b6a175" metal={.36}/>)}
    </group>)}
  </group>;
}

function Bench({station,closed,distance,rover,select,labels}:{
  station:number; closed:boolean;distance:number;rover:Rover;select:(i:number)=>void;labels:boolean;
}) {
  const vehicle=useRef<Group>(null);
  const pulse=useRef<Group>(null);
  useFrame(({clock},delta)=>{
    if(vehicle.current){
      const [x,y,z]=roverAt(rover.row,rover.col);
      vehicle.current.position.set(MathUtils.damp(vehicle.current.position.x,x,10,delta),y,MathUtils.damp(vehicle.current.position.z,z,10,delta));
      const target=-rover.direction*Math.PI/2;
      const shift=Math.atan2(Math.sin(target-vehicle.current.rotation.y),Math.cos(target-vehicle.current.rotation.y));
      vehicle.current.rotation.y+=shift*(1-Math.exp(-10*delta));
    }
    if(pulse.current){
      const fraction=(clock.elapsedTime%1.6)/1.6;
      pulse.current.position.z=-.50+(.48+(distance-25)*.021)*(1-Math.abs(2*fraction-1));
    }
  });
  const markers: Point[]=[[-3.1,.68,-.6],[.32,.9,-.7],[3.62,.85,-.48]];
  return <>
    <color attach="background" args={['#293849']}/>
    <ambientLight intensity={.67}/>
    <directionalLight intensity={2.55} position={[-5,8,6]} color="#ffecd5"/>
    <directionalLight intensity={1.28} position={[6,4,-6]} color="#c1e0fd"/>
    <Block at={[0,-.15,0]} size={[12,.29,7]} color="#475862"/>
    {[-3.04,.02,3.06].map((x,i)=><Block key={x} at={[x,.047,.14]} size={[2.75,.09,3.16]}
      color={station===i?['#628383','#62778b','#746a83'][i]:['#435f65','#465e70','#55546a'][i]}/>)}
    <Uno at={[-3.77,.12,-.63]}/>
    <Uno at={[-.75,.12,-.64]}/>
    <group position={[-2.73,.145,.20]}>
      <Block at={[0,0,0]} size={[1.24,.1,.83]} color="#d9d8cc"/>
      {Array.from({length:14},(_,i)=>[-.30,-.19,-.08,.08,.19,.30].map(z=><mesh key={i+':'+z} position={[-.54+i*.083,.054,z]}>
        <boxGeometry args={[.025,.007,.025]}/><meshStandardMaterial color="#82908c"/>
      </mesh>))}
      <Block at={[-.28,.08,.03]} size={[.23,.09,.22]} color="#374047"/>
      <mesh position={[-.28,closed?.135:.17,.03]}><cylinderGeometry args={[.074,.074,.077,18]}/><meshStandardMaterial color={closed?'#b4965d':'#676c61'}/></mesh>
      <mesh position={[.30,.16,-.19]}><cylinderGeometry args={[.055,.063,.19,20]}/><meshStandardMaterial color={closed?'#ff6043':'#863a43'} emissive="#ff3722" emissiveIntensity={closed?3.3:0}/></mesh>
      <mesh position={[.30,.254,-.19]}><sphereGeometry args={[.055,20,12]}/><meshStandardMaterial color={closed?'#fa7750':'#984550'} emissive="#ff4229" emissiveIntensity={closed?3.2:0}/></mesh>
      <mesh position={[.31,.075,-.36]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[.034,.034,.176,16]}/><meshStandardMaterial color="#c8a276"/></mesh>
      {['#ad553b','#ad553b','#473a2f','#987d45'].map((color,i)=><mesh key={i} position={[.253+i*.033,.075,-.36]} rotation={[0,0,Math.PI/2]}>
        <cylinderGeometry args={[.037,.037,.012,16]}/><meshStandardMaterial color={color}/>
      </mesh>)}
      <Line points={[[.408,.074,-.36],[.432,.069,-.27],[.33,.070,-.20],[.33,.151,-.19]]} color="#9ea7a8" lineWidth={1.25}/>
      <Line points={[[.27,.149,-.19],[.27,.086,-.19],[.25,.06,.04],[.22,.06,.36]]} color="#303744" lineWidth={1.42}/>
      <Line points={[[-.26,.066,.11],[-.26,.069,.35],[.22,.067,.36]]} color="#354047" lineWidth={1.52}/>
    </group>
    {['#f6c66f','#649fb2','#26323d'].map((color,i)=><Line key={color} points={[[-3.57+i*.08,.27,-.41],[-3.29+i*.057,.46,-.34],[-3.02+i*.10,.35,-.20],[-2.98+i*.12,.23,-.13]]}
      color={color} lineWidth={1.85}/>)}
    <group position={[.38,.118,-.64]}><Sonar highlighted={station===1}/></group>
    {['#b76655','#171f2c','#75baca','#e9bc68'].map((color,i)=><Line key={color}
      points={[[-.53+i*.072,.26,-.42],[-.24+i*.07,.30,-.37],[.19+i*.11,.24,-.60]]} color={color} lineWidth={1.55}/>)}
    {Array.from({length:6},(_,i)=><Block key={i} at={[.39,.101,-.19+i*.26]} size={[.95,.008,.020]} color="#b1c3ce"/>)}
    <group position={[.38,.11,(distance-25)*.021+.035]}>
      <Block at={[0,.22,0]} size={[.85,.45,.053]} color="#e4d4b5"/>
      <Block at={[0,.04,.02]} size={[.63,.075,.21]} color="#626766"/>
    </group>
    {station===1&&<group ref={pulse} position={[.38,.39,-.50]}><Line points={[[-.30,0,0],[-.15,.035,.06],[0,.057,.075],[.15,.035,.06],[.30,0,0]]} color="#94ddf5" lineWidth={1.8}/></group>}
    {Array.from({length:12},(_,i)=>{
      const row=Math.floor(i/4),col=i%4,[x,,z]=roverAt(row,col);
      return <group key={i} position={[x,.103,z]}>
        <Block at={[0,0,0]} size={[.44,.012,.44]} color={goal(row,col)?'#84b89c':'#8b85a0'}/>
        {blocked(row,col)&&<Block at={[0,.13,0]} size={[.31,.24,.31]} color="#b77960"/>}
        {goal(row,col)&&<mesh position={[0,.04,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.13,.15,24]}/><meshBasicMaterial color="#e1ffe0" side={2}/></mesh>}
      </group>;
    })}
    <group ref={vehicle} position={roverAt(rover.row,rover.col)}>
      <Block at={[0,.07,0]} size={[.31,.11,.26]} color="#d9aa59"/>
      <Block at={[.061,.13,0]} size={[.13,.055,.17]} color="#254c66"/>
      {[-.15,.15].map(z=><mesh key={z} position={[-.035,.014,z]} rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[.091,.091,.06,22]}/><meshStandardMaterial color="#282d34" roughness={.75}/>
      </mesh>)}
    </group>
    <ContactShadows position={[0,.003,0]} scale={11} opacity={.48} blur={2.6}/>
    {labels&&markers.map((point,i)=><group key={i}>
      <Line points={[[[-3.05,.02,3.06][i],.25,.10],point]} lineWidth={1.3} color={station===i?'#ffe29d':'#c1d2da'}/>
      <WorldLabel position={point} className="gp-marker-anchor"><button type="button" aria-label={stations[i].name} aria-pressed={station===i}
        className="gp-marker" onClick={()=>select(i)}>{i+1}</button></WorldLabel>
    </group>)}
  </>;
}

function PaperTrial({station,closed,distance,rover}:{station:number;closed:boolean;distance:number;rover:Rover}) {
  if(station===2)return <div className="cls-paper-grid" aria-label="Paper rover route">
    {Array.from({length:12},(_,i)=>{
      const row=Math.floor(i/4),col=i%4;
      return <span key={i} aria-label={`Row ${row+1}, column ${col+1}${rover.row===row&&rover.col===col?', rover':''}`}>
        {rover.row===row&&rover.col===col?arrows[rover.direction]:blocked(row,col)?'Block':goal(row,col)?'Goal':'·'}
      </span>;
    })}
  </div>;
  return <div className="cls-paper-flow">
    {station===0?<><span>Switch {closed?'closed':'open'}</span><span>→</span><span>LED {closed?'on':'off'}</span></>:
      <><span>Sensor</span><span>⇄ {distance} cm</span><span>Flat card</span></>}
  </div>;
}

export default function ClassroomStationsDemo() {
  const [station,setStation]=useState(0);
  const [available,setAvailable]=useState([true,true,true]);
  const [closed,setClosed]=useState(false);
  const [distance,setDistance]=useState(25);
  const [rover,setRover]=useState(origin);
  const [seenSwitch,setSeenSwitch]=useState<boolean[]>([]);
  const [seenDistances,setSeenDistances]=useState<number[]>([]);
  const [doneRoute,setDoneRoute]=useState(false);
  const [commands,setCommands]=useState<string[]>([]);
  const [notice,setNotice]=useState('');
  const [labels,setLabels]=useState(true);
  const paper=!available[station];
  const complete=[seenSwitch.includes(false)&&seenSwitch.includes(true),seenDistances.includes(25)&&seenDistances.includes(60),doneRoute];

  function select(index:number) {
    setStation(index);
    setNotice('');
  }

  function move(command:'Forward'|'Turn left'|'Turn right') {
    if(command!=='Forward'){
      setRover(current=>({...current,direction:(current.direction+(command==='Turn left'?3:1))%4}));
      setCommands(current=>[...current,command]);
      setNotice(command==='Turn left'?'Turned left.':'Turned right.');
      return;
    }
    const [dx,dz]=offsets[rover.direction];
    const row=rover.row+dz,col=rover.col+dx;
    if(row<0||row>2||col<0||col>3||blocked(row,col)){
      setNotice('Forward is blocked. Turn toward an open square.');
      return;
    }
    setRover({...rover,row,col});
    setCommands(current=>[...current,command]);
    if(goal(row,col))setDoneRoute(true);
    setNotice(goal(row,col)?'Goal reached. Record the command sequence.':'Moved one square forward.');
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      {paper?<section className="cls-paper" aria-label="Paper station activity">
        <h3>Paper activity</h3><PaperTrial station={station} closed={closed} distance={distance} rover={rover}/>
      </section>:<div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D classroom station layout">
        <Canvas camera={{position:[.2,6.7,8.1],fov:41}} dpr={[1,1.6]} fallback={<PaperTrial station={station} closed={closed} distance={distance} rover={rover}/>}>
          <Bench station={station} closed={closed} distance={distance} rover={rover} select={select} labels={labels}/>
          <OrbitControls target={[0,.20,.17]} minDistance={5.5} maxDistance={16} enablePan={false}/>
        </Canvas>
      </div>}
      <div className="gp-demo-result" aria-label="Station evidence">
        <div><span>LED</span><strong>{closed?'On':'Off'}</strong></div>
        <div><span>Range</span><strong>{distance} cm</strong></div>
        <div><span>Rover</span><strong>R{rover.row+1} C{rover.col+1} · {directions[rover.direction]}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Rotate through the lab</h3>
      <div className="gp-steps">{stations.map(({name},i)=><button key={name} type="button" aria-pressed={station===i}
        onClick={()=>select(i)}>{i+1}. {name}</button>)}</div>
      <p>{stations[station].task}</p>
      <div className="gp-steps">
        <button type="button" aria-pressed={!paper} onClick={()=>setAvailable(current=>current.map((value,i)=>i===station?!value:value))}>
          {paper?'Use hands-on preview':'Parts missing · use paper activity'}
        </button>
        {!paper&&<button type="button" aria-pressed={labels} onClick={()=>setLabels(value=>!value)}>Scene labels</button>}
      </div>
      {station===0&&<div className="gp-steps">{[true,false].map(value=><button key={String(value)} type="button" onClick={()=>{
        setClosed(value);setSeenSwitch(current=>current.includes(value)?current:[...current,value]);
        setNotice(value?'Switch closed. D2 reads low and the LED turns on.':'Switch open. D2 reads high and the LED turns off.');
      }}>{value?'Close switch':'Open switch'}</button>)}</div>}
      {station===1&&<div className="gp-steps">{[25,60].map(value=><button key={value} type="button" onClick={()=>{
        setDistance(value);setSeenDistances(current=>current.includes(value)?current:[...current,value]);
        setNotice(`Echo measured at ${value} cm.`);
      }}>Measure at {value} cm</button>)}</div>}
      {station===2&&<>
        <div className="gp-steps">{(['Turn left','Forward','Turn right'] as const).map(command=><button type="button" key={command} onClick={()=>move(command)}>{command}</button>)}
          <button type="button" onClick={()=>{setRover(origin);setCommands([]);setNotice('Rover returned to the starting square.');}}>Reset route</button>
        </div>
        {commands.length>0&&<p><strong>Commands executed</strong> {commands.join(' → ')}</p>}
      </>}
      <p className="gp-demo-description" role="status">{notice||'Choose a station control to record an observation.'}</p>
      <h4>Evidence collected</h4>
      <ul className="cls-evidence">{stations.map(({name},i)=><li key={name}>{name}<strong>{complete[i]?'Complete':'Pending'}</strong></li>)}</ul>
      <p>{stations[station].evidence}</p>
    </div>
  </div>;
}
