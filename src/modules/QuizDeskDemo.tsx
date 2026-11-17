import {useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {QuizDesk} from './QuizDeskPart';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
const parts:{name:string;at:Point;detail:string}[]=[
  {name:'Team A button · D2',at:[-1.08,.97,.39],detail:'The blue button pulls D2 low. If the round is armed, its stable press can win.'},
  {name:'Team B button · D3',at:[.60,.97,.39],detail:'The orange button pulls D3 low. After a result is locked, later presses cannot change it.'},
  {name:'Host reset · D4',at:[0,.66,-.52],detail:'Reset clears both LEDs. The desk waits for released team buttons before arming.'},
  {name:'Team A indicator · D8',at:[-.52,1.02,-.21],detail:'This LED lights for Team A or a same-update tie.'},
  {name:'Team B indicator · D9',at:[1.18,1.02,-.21],detail:'This LED lights for Team B or a same-update tie.'},
];
type Result='armed'|'waiting'|'A'|'B'|'tie';
type Desk={a:boolean;b:boolean;result:Result};
const initial:Desk={a:false,b:false,result:'armed'};
const descriptions:Record<Result,string>={
  armed:'Round armed. Press a team button.',
  waiting:'Both team buttons must be released to arm.',
  A:'Team A first. Result locked.',
  B:'Team B first. Result locked.',
  tie:'Both presses landed in the same update. Tie locked.',
};

function Bench({desk,selected,select,flip,reset}:{desk:Desk;selected:number;select:(i:number)=>void;flip:(team:'a'|'b')=>void;reset:()=>void}){
  return <>
    <color attach="background" args={['#42505d']}/>
    <hemisphereLight args={['#eaf3ff','#937863',2.08]}/><directionalLight position={[-3,6,4]} color="#fff1db" intensity={2.1}/>
    <Box at={[0,-.09,0]} size={[4.67,.18,3.04]} color="#818d87"/>
    <QuizDesk/>
    {(['a','b'] as const).map((team,i)=>{
      const x=i===0?-.84:.84;
      const color=i===0?'#6dc4ed':'#ffad65';
      const lit=desk.result==='tie'||desk.result===team.toUpperCase();
      return <group key={team} position={[x,0,0]}>
        <group onClick={()=>flip(team)}>
          <Box at={[-.22,.69,.17]} size={[.24,.09,.24]} color={selected===i?'#e3b888':'#2b3b44'}/>
          <mesh position={[-.22,desk[team]?.73:.79,.17]}><cylinderGeometry args={[.095,.10,.086,26]}/><meshPhysicalMaterial color={color} roughness={.35} clearcoat={.4}/></mesh>
        </group>
        <group onClick={()=>select(i+3)}>
          <Box at={[.33,.679,-.12]} size={[.17,.057,.16]} color={selected===i+3?'#e3bf94':'#34414b'}/>
          <mesh position={[.33,.735,-.12]}><sphereGeometry args={[.062,22,16]}/><meshStandardMaterial color={lit?color:i===0?'#386a85':'#985c3d'} emissive={color} emissiveIntensity={lit?2.75:0}/></mesh>
          {lit&&<pointLight position={[.33,.80,-.12]} color={color} intensity={1.3} distance={.85}/>}
        </group>
      </group>;
    })}
    <group onClick={reset}>
      <Box at={[0,.355,-.40]} size={[.24,.065,.21]} color={selected===2?'#cda989':'#35444d'}/>
      <mesh position={[0,.401,-.40]}><cylinderGeometry args={[.073,.078,.063,24]}/><meshPhysicalMaterial color="#bb6c65" roughness={.42}/></mesh>
    </group>
    <Box at={[0,.143,.94]} size={[.88,.086,.47]} color="#267e89"/>
    <Box at={[-.32,.213,1.01]} size={[.18,.108,.14]} color="#bfcad0" metal={.64}/>
    <Box at={[.09,.212,.94]} size={[.24,.056,.112]} color="#25343d"/>
    {[.77,1.13].map(z=><Box key={z} at={[.02,.206,z]} size={[.60,.061,.049]} color="#25343b"/>)}
    {[-1.06,-.51,.62,1.17].map((x,i)=><Line key={x} points={[[x,.67,.24],[x,.57,.43],[x*.65,.24,.55],[-.28+i*.17,.21,.79]]} color={['#89b9d2','#5195ac','#dc9a63','#e6b66f'][i]} lineWidth={2.55}/>)}
    <Line points={[[0,.36,-.34],[0,.25,-.11],[.12,.21,.49],[.36,.20,.81]]} color="#c67870" lineWidth={2.55}/>
    {parts.map(({name,at},i)=><WorldLabel key={name} position={at} className="gp-marker-anchor"><button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===i} onClick={()=>select(i)}>{i+1}{selected===i&&<span className="gp-demo-marker-name">{name}</span>}</button></WorldLabel>)}
    <ContactShadows position={[0,.005,0]} opacity={.34} scale={5.2} far={1.8} resolution={128} frames={1}/>
  </>;
}

export default function QuizDeskDemo(){
  const [desk,setDesk]=useState(initial);
  const [selected,select]=useState(0);
  function flip(team:'a'|'b'){
    select(team==='a'?0:1);
    setDesk(previous=>{
      const next={...previous,[team]:!previous[team]};
      if(previous.result==='armed'&&next[team])next.result=team==='a'?'A':'B';
      if(previous.result==='waiting'&&!next.a&&!next.b)next.result='armed';
      return next;
    });
  }
  function reset(){
    select(2);
    setDesk(previous=>({...previous,result:previous.a||previous.b?'waiting':'armed'}));
  }
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D quiz response desk">
        <Canvas camera={{position:[2.05,3.13,6.35],fov:41}} dpr={[1,1.6]} fallback={<p>Use the team controls and LED readouts below.</p>}><Bench {...{desk,selected,select,flip,reset}}/><OrbitControls target={[0,.53,0]} enablePan={false} minDistance={3.5} maxDistance={10}/></Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Quiz desk indicators">
        <div><span>Team A LED</span><strong>{desk.result==='A'||desk.result==='tie'?'On':'Off'}</strong></div><div><span>Team B LED</span><strong>{desk.result==='B'||desk.result==='tie'?'On':'Off'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Test who answered first</h3>
      <p>Press and release each team button. Try a later press after a result, then reset while one button is held.</p>
      <div className="gp-steps">
        <button className="gp-button" type="button" onClick={()=>flip('a')}>{desk.a?'Release Team A':'Press Team A'}</button>
        <button className="gp-button gp-secondary" type="button" onClick={()=>flip('b')}>{desk.b?'Release Team B':'Press Team B'}</button>
      </div>
      <div className="gp-steps">
        <button type="button" disabled={desk.result!=='armed'} onClick={()=>{select(3);setDesk(previous=>previous.result==='armed'?{a:true,b:true,result:'tie'}:previous);}}>Press both together</button>
        <button type="button" onClick={reset}>Host reset</button>
      </div>
      <p role="status">{descriptions[desk.result]}</p>
      <ol className="gp-demo-labels">{parts.map(({name},i)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===i} onClick={()=>select(i)}><span>{i+1}</span>{name}</button></li>)}</ol><p>{parts[selected].detail}</p>
    </div>
  </div>;
}
