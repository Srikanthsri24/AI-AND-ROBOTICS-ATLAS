import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Line, OrbitControls } from '@react-three/drei';
import { padButtons,padPins,type PadKey } from '../data/ble-gamepad';
import { SolarMeterSolid as Box } from './SolarMeterParts';
import { WorldLabel } from './LabWorkbench';

type Point=[number,number,number];
type Cell=[number,number];
type Play={at:Cell;tokens:Cell[];message:string;last:PadKey|null};
const tokens:Cell[]=[[0,2],[2,2],[3,0]];
const walls:Cell[]=[[1,0],[1,1],[3,2]];
const start:Play={at:[0,0],tokens,message:'Try the D-pad to move.',last:null};
const offsets:Record<PadKey,Cell>={Up:[0,-1],Down:[0,1],Left:[-1,0],Right:[1,0],A:[0,0],B:[0,0]};
const equal=(a:Cell,b:Cell)=>a[0]===b[0]&&a[1]===b[1];
function play(state:Play,key:PadKey):Play{
  if(key==='B')return {...start,last:key,message:'Board reset.'};
  if(key==='A'){
    if(!state.tokens.some(p=>equal(p,state.at)))return {...state,last:key,message:'Move onto a token before pressing A.'};
    const remaining=state.tokens.filter(p=>!equal(p,state.at));
    return {...state,tokens:remaining,last:key,message:remaining.length?'Token collected.':'All three tokens collected.'};
  }
  const [dx,dz]=offsets[key];
  const next:Cell=[state.at[0]+dx,state.at[1]+dz];
  if(next.some(n=>n<0||n>3)||walls.some(p=>equal(p,next)))return {...state,last:key,message:'Tile blocked. Try another direction.'};
  return {...state,at:next,last:key,message:state.tokens.some(p=>equal(p,next))?'On a token · Press A to collect.':'Moved one tile.'};
}

const padSpots:Point[]=[[-.66,.22,-.44],[-.66,.22,.35],[-1.06,.22,-.04],[-.26,.22,-.04],[.55,.22,-.20],[.98,.22,.16]];
const pos=([x,z]:Cell):Point=>[.27+x*.53,.07,z*.53-.80];
function Workbench({state,selected,select,send,paired,labels,pressed}:{pressed:PadKey|null;state:Play;selected:PadKey;select:(key:PadKey)=>void;send:(key:PadKey)=>void;paired:boolean;labels:boolean}){
  return <>
    <color attach="background" args={['#26354a']}/>
    <hemisphereLight args={['#e1ecff','#675644',2.45]}/>
    <directionalLight position={[-4,7,5]} intensity={2.36}/>
    <Box at={[0,-.13,0]} size={[6.1,.24,4.23]} color="#586b7b"/>
    <group position={[-1.41,.046,.22]} rotation={[0,-.13,0]} scale={.85}>
      <Box at={[0,.096,0]} size={[2.55,.18,1.43]} color="#313c4a"/>
      <Box at={[0,.188,.01]} size={[2.44,.072,1.32]} color="#a88d6c"/>
      <Box at={[-.65,.231,-.04]} size={[1.14,.032,.37]} color="#383d47"/>
      <Box at={[-.66,.231,-.04]} size={[.37,.032,1.13]} color="#383d47"/>
      {padSpots.map(([x,y,z],i)=>{
        const key=padButtons[i], down=pressed===key;
        return <group key={key} position={[x,y,z]}>
          <group onClick={()=>{select(key);send(key);}}>
            <mesh position={[0,down?.026:.054,0]}><cylinderGeometry args={[.139,.143,.091,28]}/>
              <meshStandardMaterial color={selected===key?'#ddbc74':i===4?'#429f8f':i===5?'#745f9e':'#5d7186'}/></mesh>
          </group>
          {labels&&<WorldLabel position={[0,.15,0]} className="gp-marker-anchor">
            <button type="button" className="gp-marker" aria-label={key} aria-pressed={selected===key}
              onClick={()=>{select(key);send(key);}}>{['↑','↓','←','→','A','B'][i]}</button>
          </WorldLabel>}
        </group>;
      })}
      <Box at={[.11,.21,-.54]} size={[.36,.065,.63]} color="#212d37"/>
      <Box at={[.11,.253,-.52]} size={[.24,.032,.32]} color="#89929e" metal={.50}/>
      <mesh position={[.19,.254,-.77]}><sphereGeometry args={[.028,16,12]}/><meshStandardMaterial color="#81b6c2" emissive="#58afcf" emissiveIntensity={paired?2:0}/></mesh>
      <Line points={[[.11,.23,-.86],[.07,.19,-1.06],[.35,.12,-1.45],[.68,.13,-1.59]]} color="#aeb8be" lineWidth={3.5}/>
    </group>
    <Box at={[1.06,.037,.01]} size={[2.42,.097,2.37]} color="#313d4d"/>
    {Array.from({length:16},(_,i)=>{
      const cell:Cell=[i%4,Math.floor(i/4)], [x,,z]=pos(cell);
      const wall=walls.some(p=>equal(p,cell)), token=state.tokens.some(p=>equal(p,cell)), at=equal(state.at,cell);
      return <group key={i} position={[x,.093,z]}>
        <Box at={[0,0,0]} size={[.493,.049,.493]} color={at?'#8bbdae':wall?'#495266':'#708991'}/>
        {wall&&<Box at={[0,.104,0]} size={[.44,.21,.42]} color="#5b5a65"/>}
        {token&&<mesh position={[0,.10,0]}><cylinderGeometry args={[.09,.09,.113,24]}/><meshStandardMaterial color="#e1b064" metalness={.45}/></mesh>}
      </group>;
    })}
    <group position={pos(state.at)}>
      <Box at={[0,.132,0]} size={[.255,.175,.232]} color="#315571"/>
      <Box at={[0,.249,0]} size={[.186,.093,.179]} color="#dbe1d3" metal={.42}/>
      {[-.053,.053].map(x=><Box key={x} at={[x,.249,.092]} size={[.042,.029,.013]} color="#3b7889"/>)}
    </group>
  </>;
}
const keyMap:Record<string,PadKey>={ArrowUp:'Up',ArrowDown:'Down',ArrowLeft:'Left',ArrowRight:'Right',a:'A',b:'B'};

export default function BleGamepadDemo(){
  const [paired,pair]=useState(false);
  const [state,setState]=useState<Play>(start);
  const [selected,select]=useState<PadKey>('Up');
  const [labels,setLabels]=useState(true);
  const [pressed,setPressed]=useState<PadKey|null>(null);
  useEffect(()=>{
    if(!paired||!state.last){setPressed(null);return;}
    setPressed(state.last);
    const timer=window.setTimeout(()=>setPressed(null),140);
    return ()=>window.clearTimeout(timer);
  },[paired,state]);
  function send(key:PadKey){if(paired)setState(old=>play(old,key));}
  useEffect(()=>{
    if(!paired)return;
    const handle=(event:KeyboardEvent)=>{
      if(event.target instanceof HTMLElement&&['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName))return;
      const command=keyMap[event.key]??keyMap[event.key.toLowerCase()];
      if(!command||event.altKey||event.ctrlKey||event.metaKey)return;
      event.preventDefault();
      select(command);setState(old=>play(old,command));
    };
    window.addEventListener('keydown',handle);
    return ()=>window.removeEventListener('keydown',handle);
  },[paired]);
  const directions:Record<PadKey,string>={Up:'0',Right:'2',Down:'4',Left:'6',A:'8',B:'8'};
  const bits=state.last==='A'?1:state.last==='B'?2:0;
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D Bluetooth gamepad and practice board">
        <Canvas camera={{position:[3.1,5.9,6.8],fov:42}} dpr={[1,1.6]} fallback={<p>Use the onscreen pad to play the practice game.</p>}>
          <Workbench {...{state,selected,select,send,paired,labels,pressed}}/>
          <OrbitControls target={[0,.18,.05]} minDistance={4.6} maxDistance={14} enablePan={false}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Gamepad readouts">
        <div><span>Player tile</span><strong>{state.at[0]+1}, {state.at[1]+1}</strong></div>
        <div><span>Collected</span><strong>{3-state.tokens.length} / 3</strong></div>
        <div><span>Last input report</span><strong>{state.last?`Hat ${directions[state.last]} · Buttons ${bits}`:'Hat 8 · Buttons 0'}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Collect all three tokens</h3>
      <p>Pair the simulated pad, then use the onscreen controls or your arrow keys. Stand on a token and press A. Press B to reset the board.</p>
      <div className="gp-steps">
        <button type="button" className="gp-button" onClick={()=>{pair(!paired);if(paired)setState(old=>({...old,last:null}));}}>{paired?'Disconnect pad':'Pair demo pad'}</button>
        <button type="button" aria-pressed={labels} onClick={()=>setLabels(value=>!value)}>Scene labels</button>
      </div>
      <div className="gp-steps" role="group" aria-label="Gamepad controls">
        {padButtons.map(key=><button type="button" disabled={!paired} key={key} aria-pressed={selected===key} onClick={()=>{select(key);send(key);}}>{key}</button>)}
      </div>
      <p role="status" className="gp-demo-description">{paired?state.message:'Demo pad disconnected.'}</p>
      <p className="gp-demo-description">The {selected} switch connects GPIO {padPins[padButtons.indexOf(selected)]} to ground when pressed. The physical firmware debounces it before updating the report.</p>
    </div>
  </div>;
}
