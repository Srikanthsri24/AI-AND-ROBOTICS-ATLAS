import {useEffect,useState} from 'react';
import {Canvas} from '@react-three/fiber';
import {ContactShadows,Line,OrbitControls} from '@react-three/drei';
import {WorldLabel} from './LabWorkbench';
import {DrawbridgeDeck,DrawbridgeLanding} from './DrawbridgeParts';
import {SolarMeterSolid as Box} from './SolarMeterParts';

type Point=[number,number,number];
type Crossing='Boat'|'Road vehicle';
const raisedAngle=55;
const labels:{name:string;position:Point;description:string}[]=[
  {name:'Moving bridge deck',position:[.12,1.12,.36],description:'The deck rotates around the hinge. It needs to be fully raised for the canal test and fully lowered for the road test.'},
  {name:'Servo and hinge axis',position:[-.64,.83,.73],description:'The servo horn turns the deck on the same axis as the passive bearing. The opposite bearing supports the deck and keeps it from twisting.'},
  {name:'Landing ledge',position:[.71,.55,.65],description:'The free end rests on the ledge with the road surfaces level. Calibrate the lowered endpoint so the servo does not push into the ledge.'},
  {name:'Boat clearance',position:[.04,.22,-1.11],description:'The raised deck opens a path along the canal. Use the boat to test the space under the free end.'},
  {name:'Uno and separate 5 V supply',position:[-1.48,.34,-.72],description:'D9 carries the servo signal. The external 5 V supply powers the servo and shares its ground with the Uno.'},
];

function PaperBoat(){
  return <group>
    <mesh position={[0,.07,0]} scale={[.145,.075,.28]}>
      <sphereGeometry args={[1,22,12]}/><meshStandardMaterial color="#e3e2ce" roughness={.56}/>
    </mesh>
    <mesh position={[0,.147,-.02]} rotation={[0,Math.PI/4,0]}>
      <coneGeometry args={[.116,.16,4]}/><meshStandardMaterial color="#d0a66b"/>
    </mesh>
    <Box at={[0,.072,.04]} size={[.235,.032,.325]} color="#b96746"/>
  </group>;
}

function PaperVehicle(){
  return <group>
    <Box at={[0,.062,0]} size={[.39,.10,.22]} color="#b85742"/>
    <Box at={[-.04,.139,0]} size={[.20,.085,.18]} color="#d08d65"/>
    <Box at={[.062,.139,0]} size={[.019,.064,.155]} color="#58757f"/>
    {[-.12,.12].flatMap(x=>[-.11,.11].map(z=><mesh key={`${x},${z}`} position={[x,.035,z]} rotation={[Math.PI/2,0,0]}>
      <cylinderGeometry args={[.046,.046,.034,16]}/><meshStandardMaterial color="#303a3e"/>
    </mesh>))}
  </group>;
}

function BridgeScene({angle,vehicleX,boatZ,selected,select}:{angle:number;vehicleX:number;boatZ:number;selected:number;select:(index:number)=>void}){
  return <>
    <color attach="background" args={['#3c5260']}/>
    <hemisphereLight args={['#f8f4e8','#82776d',2.1]}/>
    <directionalLight position={[-3,6,4]} intensity={2.3} color="#fff2dd"/>
    <Box at={[0,-.12,0]} size={[4.6,.23,3.65]} color="#78948b"/>
    <group onClick={()=>select(3)}>
      <Box at={[.02,.008,0]} size={[1.48,.026,3.52]} color={selected===3?'#438f9c':'#38818b'} metal={.18}/>
      {[-1.46,-1.14,-.78,-.40,.41,.77,1.14,1.54].map((z,index)=><Line key={z} points={[[.48-(index%3)*.47,.025,z],[.67-(index%3)*.47,.025,z+.019]]} color="#77b2b2" lineWidth={1.5}/>)}
      <group position={[0,.035,boatZ]}><PaperBoat/></group>
    </group>
    <group position={[-.66,0,0]} rotation={[0,Math.PI,0]}><DrawbridgeLanding/></group>
    <group position={[.68,0,0]} onClick={()=>select(2)}><DrawbridgeLanding highlighted={selected===2}/></group>
    <group position={[-.66,.424,0]} onClick={()=>select(0)}><DrawbridgeDeck angle={angle*Math.PI/180} highlighted={selected===0}/></group>
    <group onClick={()=>select(1)}>
      <Box at={[-.66,.22,.49]} size={[.24,.44,.116]} color="#a6835e"/>
      <Box at={[-.66,.38,.57]} size={[.31,.19,.18]} color={selected===1?'#d1a065':'#285272'}/>
      <Box at={[-.66,.255,-.48]} size={[.25,.34,.12]} color="#ac8a62"/>
      <Box at={[-.66,.405,-.48]} size={[.13,.086,.15]} color="#746c5e"/>
    </group>
    <group position={[vehicleX,.495,0]}><PaperVehicle/></group>
    <group onClick={()=>select(4)}>
      <Box at={[-1.47,.086,-.81]} size={[.82,.085,.49]} color={selected===4?'#70af9d':'#227b89'}/>
      <Box at={[-1.74,.15,-.79]} size={[.18,.104,.155]} color="#c6cacf" metal={.64}/>
      <Box at={[-1.41,.155,-.84]} size={[.21,.059,.10]} color="#25323b"/>
      {[-.61,-1.01].map(z=><Box key={z} at={[-1.44,.151,z]} size={[.61,.055,.046]} color="#25313c"/>)}
      <Box at={[-1.48,.101,1.02]} size={[.59,.187,.43]} color="#343f45"/>
    </group>
    <Line points={[[-.76,.34,.64],[-.88,.09,.67],[-1.01,.11,-.41],[-1.22,.16,-.62]]} color="#e4b06c" lineWidth={2.3}/>
    <Line points={[[-.81,.35,.65],[-.99,.12,.74],[-1.24,.13,.86]]} color="#bf584b" lineWidth={2.3}/>
    <Line points={[[-.84,.34,.68],[-1.06,.095,.76],[-1.28,.11,.94]]} color="#25333d" lineWidth={2.3}/>
    <Line points={[[-1.67,.11,.85],[-1.95,.082,.61],[-1.99,.082,-.83],[-1.68,.16,-1.02]]} color="#25333d" lineWidth={2.3}/>
    {labels.map(({name,position},index)=><WorldLabel key={name} position={position} className="gp-marker-anchor">
      <button type="button" className="gp-marker" aria-label={name} aria-pressed={selected===index} onClick={()=>select(index)}>{index+1}{selected===index&&<span className="gp-demo-marker-name">{name}</span>}</button>
    </WorldLabel>)}
    <ContactShadows position={[0,.028,0]} opacity={.33} scale={5} far={2.4} resolution={256} frames={1}/>
  </>;
}

export default function DrawbridgeDemo(){
  const [raised,setRaised]=useState(false);
  const [angle,setAngle]=useState(0);
  const [selected,select]=useState(0);
  const [crossing,setCrossing]=useState<Crossing|null>(null);
  const [progress,setProgress]=useState(0);
  const [boatTrips,setBoatTrips]=useState(0);
  const [roadTrips,setRoadTrips]=useState(0);
  const [message,setMessage]=useState('Try the road crossing with the deck level.');
  const target=raised?raisedAngle:0;
  const moving=angle!==target;
  useEffect(()=>{
    if(!moving)return;
    const timer=window.setTimeout(()=>setAngle(angle+Math.sign(target-angle)),24);
    return ()=>window.clearTimeout(timer);
  },[angle,target,moving]);

  useEffect(()=>{
    if(!crossing)return;
    const started=performance.now();
    let frame:number;
    function advance(now:number){
      const fraction=(now-started)/1650;
      if(fraction<1){
        setProgress(fraction);
        frame=requestAnimationFrame(advance);
      }else{
        if(crossing==='Boat')setBoatTrips(previous=>previous+1);
        else setRoadTrips(previous=>previous+1);
        setMessage(crossing==='Boat'?'Boat cleared the raised deck.':'Road vehicle reached the opposite bank.');
        setCrossing(null);
      }
    }
    frame=requestAnimationFrame(advance);
    return ()=>cancelAnimationFrame(frame);
  },[crossing]);

  function move(up:boolean){
    setRaised(up);
    select(up?1:2);
    setMessage(up?'Raised position selected. Try the boat once the deck stops.':'Lowered position selected. Try the road vehicle once the deck is level.');
  }

  function send(kind:Crossing){
    if(moving){
      setMessage('Wait for the deck to stop before starting a crossing.');
      return;
    }
    if((kind==='Boat')!==raised){
      setMessage(kind==='Boat'?'Raise the deck to clear the canal.':'Lower the deck to reconnect the road.');
      return;
    }
    setProgress(0);
    setCrossing(kind);
    select(kind==='Boat'?3:0);
    setMessage(kind==='Boat'?'Boat is moving through the canal.':'Road vehicle is crossing the deck.');
  }

  function reset(){
    setCrossing(null);
    setRaised(false);
    setAngle(0);
    setProgress(0);
    setBoatTrips(0);
    setRoadTrips(0);
    select(0);
    setMessage('Try the road crossing with the deck level.');
  }

  const boatZ=crossing==='Boat' ? 1.48-2.96*(boatTrips%2?1-progress:progress) : boatTrips%2?-1.48:1.48;
  const vehicleX=crossing==='Road vehicle' ? -1.28+2.56*(roadTrips%2?1-progress:progress) : roadTrips%2?1.28:-1.28;
  return <div className="gp-split gp-demo">
    <div className="gp-story-stage">
      <div className="gp-canvas gp-rc-canvas" role="region" aria-label="3D mini drawbridge">
        <Canvas camera={{position:[3.4,3.08,5.3],fov:41}} dpr={[1,1.6]} fallback={<p>Use the crossing controls and readouts below.</p>}>
          <BridgeScene {...{angle,vehicleX,boatZ,selected,select}}/>
          <OrbitControls target={[0,.42,0]} enablePan={false} minDistance={3.3} maxDistance={9}/>
        </Canvas>
      </div>
      <div className="gp-demo-result" aria-label="Drawbridge readouts">
        <div><span>Deck angle</span><strong>{angle}°</strong></div>
        <div><span>Boat crossings</span><strong>{boatTrips}</strong></div>
        <div><span>Road crossings</span><strong>{roadTrips}</strong></div>
      </div>
    </div>
    <div className="gp-guide">
      <h3>Alternate between road and canal traffic</h3>
      <p>Try both crossings and compare the clearance. The demo controls hold the deck in position while a crossing is in progress.</p>
      <div className="gp-steps" role="group" aria-label="Deck controls">
        <button type="button" className="gp-button gp-secondary" disabled={!!crossing} aria-pressed={raised} onClick={()=>move(true)}>Raise deck</button>
        <button type="button" className="gp-button gp-secondary" disabled={!!crossing} aria-pressed={!raised} onClick={()=>move(false)}>Lower deck</button>
      </div>
      <div className="gp-steps" role="group" aria-label="Crossing controls">
        <button type="button" className="gp-button" disabled={!!crossing} onClick={()=>send('Boat')}>Send boat</button>
        <button type="button" className="gp-button" disabled={!!crossing} onClick={()=>send('Road vehicle')}>Send road vehicle</button>
        <button type="button" className="gp-button gp-secondary" onClick={reset}>Reset bridge</button>
      </div>
      <p role="status">{message}</p>
      <ol className="gp-demo-labels">{labels.map(({name},index)=><li key={name}><button className="gp-part-label" type="button" aria-pressed={selected===index} onClick={()=>select(index)}><span>{index+1}</span>{name}</button></li>)}</ol>
      <p>{labels[selected].description}</p>
    </div>
  </div>;
}
