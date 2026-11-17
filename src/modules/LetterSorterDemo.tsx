import {useEffect,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {LetterCatchBin,LetterFeedRamp,LetterTiltDeck} from './LetterSorterParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Bin='A'|'B';
type Point=[number,number,number];
type Letter={mark:Bin;bin:Bin};
const colors={A:'#55898f',B:'#bb7955'};
const names={A:'Square',B:'Circle'};
const travelMs=1550;
const side=(bin:Bin)=>bin==='A'?-1:1;
const tiltFor=(bin:Bin|null)=>bin ? -side(bin)*Math.PI*40/180 : 0;
const parts:{name:string;at:Point;detail:string}[]=[
  {name:'Feed ramp',at:[-.37,1.36,-.91],detail:'The ramp guides one paper letter onto the middle of the deck. Check the mark before releasing it.'},
  {name:'Tilting deck and servo',at:[.38,.98,.06],detail:'The D9 servo turns the deck. Gravity moves the letter toward the lower edge and into the catch bin.'},
  {name:'Bin A · square',at:[-1.05,.35,.75],detail:'Square-marked letters belong here. Check the bin after each drop to verify the route.'},
  {name:'Bin B · circle',at:[1.05,.35,.75],detail:'Circle-marked letters belong here. A circle in Bin A or a square in Bin B counts as a misroute.'},
  {name:'Destination buttons and Uno',at:[1.43,.44,-.74],detail:'D2 selects Bin A and D3 selects Bin B. If both buttons are pressed together the sketch keeps the last destination. The servo has a separate 5 V supply and shares ground with the Uno.'},
];

function Paper({mark}:{mark:Bin}){
  return <>
    <Box at={[0,0,0]} size={[.33,.025,.245]} color="#f5edda"/>
    <mesh position={[.055,.017,-.016]} rotation={[-Math.PI/2,0,0]}>
      {mark==='A'?<planeGeometry args={[.105,.105]}/>:<circleGeometry args={[.056,26]}/>}
      <meshStandardMaterial color={colors[mark]}/>
    </mesh>
    {[-.054,-.026,.002].map(z=><Box key={z} at={[-.069,.014,z]} size={[.07,.003,.006]} color="#827e71"/>)}
  </>;
}

function flight(t:number,bin:Bin):{at:Point;roll:number;pitch:number}{
  if(t<.41){
    const u=t/.41;
    return {at:[0,1.42-.49*u,-1.30+1.45*u],roll:tiltFor(bin)*u**4,pitch:.27*(1-u)};
  }
  const sign=side(bin);
  if(t<.71){
    const x=.49*((t-.41)/.30)**1.4;
    return {at:[sign*x,.93-x*Math.tan(Math.abs(tiltFor(bin))),.15],roll:tiltFor(bin),pitch:0};
  }
  const u=(t-.71)/.29;
  return {at:[sign*(.49+.55*u),.52-.39*u*u,.15],roll:tiltFor(bin)*(1-u),pitch:.18*Math.sin(Math.PI*u)};
}

function SorterScene({bin,mark,sorted,flightTime,tilt,selected,select}:{bin:Bin|null;mark:Bin;sorted:Letter[];flightTime:number|null;tilt:number;selected:number;select:(part:number)=>void}){
  const paper=flightTime!==null&&bin ? flight(flightTime,bin) : {at:[0,1.42,-1.30] as Point,roll:0,pitch:.27};
  return <>
    <color attach="background" args={['#3d515b']}/>
    <hemisphereLight args={['#f6f3e7','#8b7866',2.15]}/>
    <directionalLight position={[-3,6,4]} color="#fff0d6" intensity={2.4}/>
    <Box at={[0,-.085,0]} size={[4.7,.17,3.55]} color="#899791"/>
    {[-.32,.32].map(x=><Box key={x} at={[x,.58,-.99]} size={[.076,1.16,.15]} color="#ac845f"/>)}
    <group position={[0,1.23,-.92]} onClick={()=>select(0)}><LetterFeedRamp highlighted={selected===0}/></group>
    <group onClick={()=>select(1)}>
      <Box at={[0,.34,.61]} size={[.20,.66,.14]} color="#947356"/>
      <Box at={[0,.84,.61]} size={[.48,.30,.24]} color={selected===1?'#d6a36b':'#345b76'}/>
      <Box at={[0,.89,.469]} size={[.26,.053,.24]} color="#ded8c3"/>
      <group position={[0,.87,.15]}><LetterTiltDeck tilt={tilt} highlighted={selected===1}/></group>
    </group>
    {(['A','B'] as const).map((name,i)=><group key={name} position={[1.04*side(name),0,.15]} onClick={()=>select(i+2)}>
      <LetterCatchBin color={colors[name]} highlighted={selected===i+2}/>
      {sorted.filter(item=>item.bin===name).slice(-6).map((item,index)=><group key={index} position={[(index%2-.5)*.28,.085+index*.017,(Math.floor(index/2)-1)*.20]} rotation={[0,(index%2-.5)*.24,0]}><Paper mark={item.mark}/></group>)}
      <WorldLabel position={[0,.065,.56]} className="gp-marker-anchor"><span className="gp-vane-cardinal">Bin {name}</span></WorldLabel>
    </group>)}
    <group position={paper.at} rotation={[paper.pitch,0,paper.roll]}><Paper mark={mark}/></group>
    <group onClick={()=>select(4)}>
      <Box at={[1.39,.081,-.90]} size={[.83,.085,.48]} color={selected===4?'#80bbb2':'#297b89'}/>
      <Box at={[1.12,.154,-.90]} size={[.17,.10,.13]} color="#c7cbd1" metal={.60}/>
      <Box at={[1.51,.151,-.92]} size={[.24,.06,.09]} color="#263641"/>
      {[-.73,-1.07].map(z=><Box key={z} at={[1.40,.142,z]} size={[.57,.06,.043]} color="#1d2832"/>)}
      <Box at={[1.71,.079,-.19]} size={[.75,.14,.37]} color="#ddd5c7"/>
      {(['A','B'] as const).map((name,i)=><group key={name} position={[1.53+i*.34,.165,-.20]}>
        <Box at={[0,0,0]} size={[.18,.052,.16]} color="#27333a"/>
        <Box at={[0,.036,0]} size={[.115,.051,.105]} color={colors[name]}/>
      </group>)}
      <Box at={[-1.52,.10,-.58]} size={[.62,.17,.36]} color="#303942"/>
    </group>
    <Line points={[[.24,.81,.64],[.48,.51,.58],[.70,.11,.40],[.89,.11,-.57],[1.48,.16,-.74]]} color="#e2ac66" lineWidth={2.5}/>
    <Line points={[[-.24,.80,.59],[-.44,.49,.51],[-.62,.12,.34],[-1.16,.12,-.41],[-1.28,.14,-.53]]} color="#bf594b" lineWidth={2.5}/>
    <Line points={[[-1.30,.13,-.64],[-.86,.10,-.63],[.67,.10,-.56],[1.37,.16,-.74]]} color="#182832" lineWidth={2.5}/>
    <Line points={[[1.37,.16,-.74],[1.32,.16,-.39],[1.52,.17,-.26]]} color="#399583" lineWidth={2.5}/>
    <Line points={[[1.59,.16,-.74],[1.82,.16,-.48],[1.87,.17,-.26]]} color="#4a85ba" lineWidth={2.5}/>
    {parts.map(({at,name},index)=><WorldLabel key={name} position={at} className="gp-marker-anchor">
      <button className="gp-marker" type="button" aria-label={name} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}{selected===index&&<span className="gp-demo-marker-name">{name}</span>}</button>
    </WorldLabel>)}
    <ContactShadows position={[0,.007,0]} opacity={.35} scale={5} far={2.4} resolution={256} frames={1}/>
  </>;
}

export default function LetterSorterDemo(){
  const [bin,setBin]=useState<Bin|null>(null);
  const [mark,setMark]=useState<Bin>('A');
  const [sorted,setSorted]=useState<Letter[]>([]);
  const [selected,select]=useState(0);
  const [tilt,setTilt]=useState(0);
  const [flightTime,setFlightTime]=useState<number|null>(null);
  const [status,setStatus]=useState('Choose a destination to tilt the deck.');
  const target=tiltFor(bin);
  const moving=target!==tilt;
  const feeding=flightTime!==null;

  useEffect(()=>{
    if(!moving)return;
    const timer=window.setTimeout(()=>setTilt(tilt+Math.sign(target-tilt)*Math.min(.049,Math.abs(target-tilt))),16);
    return ()=>window.clearTimeout(timer);
  },[tilt,target,moving]);

  useEffect(()=>{
    if(!feeding||!bin)return;
    const start=performance.now();
    let frame:number;
    function advance(now:number){
      const progress=(now-start)/travelMs;
      if(progress<1){
        setFlightTime(progress);
        frame=requestAnimationFrame(advance);
        return;
      }
      if(!bin)return;
      setSorted(previous=>[...previous,{mark,bin}]);
      setStatus(`${names[mark]} arrived in Bin ${bin}. ${mark===bin?'Correct route.':'Misroute.'}`);
      setFlightTime(null);
      select(bin==='A'?2:3);
    }
    frame=requestAnimationFrame(advance);
    return ()=>cancelAnimationFrame(frame);
  },[feeding,bin,mark]);

  function route(to:Bin){
    setBin(to);
    select(1);
    setStatus(`Bin ${to} selected.`);
  }

  function reset(){
    setBin(null);
    setFlightTime(null);
    setTilt(0);
    setMark('A');
    setSorted([]);
    select(0);
    setStatus('Choose a destination to tilt the deck.');
  }

  const message=moving?`${status} Deck moving…`:status;
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D model letter sorter">
        <Canvas camera={{position:[2.65,3.03,5.6],fov:41}} dpr={[1,1.6]} fallback={<p>Use the sorter controls and readouts below.</p>}>
          <SorterScene {...{bin,mark,sorted,flightTime,tilt,selected,select}}/>
          <OrbitControls target={[0,.53,0]} enablePan={false} minDistance={3.3} maxDistance={9}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Letter sorter counts">
        <div><span>Bin A</span><strong>{sorted.filter(item=>item.bin==='A').length}</strong></div>
        <div><span>Bin B</span><strong>{sorted.filter(item=>item.bin==='B').length}</strong></div>
        <div><span>Misroutes</span><strong>{sorted.filter(item=>item.mark!==item.bin).length}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Route one letter at a time</h3>
      <p>Match the square to Bin A and the circle to Bin B. Choose a destination, wait for the deck to stop, then feed the letter.</p>
      <div className="gp-steps" role="group" aria-label="Letter mark">
        {(['A','B'] as const).map(choice=><button className="gp-button gp-secondary" type="button" key={choice} aria-pressed={mark===choice} disabled={feeding} onClick={()=>setMark(choice)}>{names[choice]} letter</button>)}
      </div>
      <div className="gp-steps" role="group" aria-label="Destination buttons">
        {(['A','B'] as const).map(choice=><button className="gp-button gp-secondary" type="button" key={choice} disabled={feeding} aria-pressed={bin===choice} onClick={()=>route(choice)}>Select Bin {choice}</button>)}
        <button type="button" className="gp-button gp-secondary" disabled={feeding} onClick={()=>setStatus(bin?`Both pressed. Holding Bin ${bin}.`:'Both pressed. Deck stays level.')}>Press both</button>
      </div>
      <div className="gp-steps">
        <button className="gp-button" type="button" disabled={!bin||feeding||moving} onClick={()=>{setFlightTime(0);setStatus('Letter sliding into the sorter.');}}>Feed letter</button>
        <button className="gp-button gp-secondary" type="button" onClick={reset}>Reset sorter</button>
      </div>
      <p role="status">{message}</p>
      <ol className="gp-demo-labels">{parts.map(({name},index)=><li key={name}><button type="button" className="gp-part-label" aria-pressed={selected===index} onClick={()=>select(index)}><span>{index+1}</span>{name}</button></li>)}</ol>
      <p>{parts[selected].detail}</p>
    </div>
  </div>;
}
