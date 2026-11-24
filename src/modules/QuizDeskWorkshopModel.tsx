import {useEffect,useRef} from 'react';
import {useFrame,useThree} from '@react-three/fiber';
import {OrbitControls,Text} from '@react-three/drei';
import {Mesh,MeshStandardMaterial} from 'three';
import {Uno,Wire,Mount} from './RoverWorkshopModel';
import {Breadboard} from './RoomClimateWorkshop';
import {SolarMeterSolid as Box} from './SolarMeterParts';
import {WorldLabel} from './LabWorkbench';
import type {QuizDeskState} from '../data/quiz-desk-workshop';
export type QuizPoint=[number,number,number];
export const quizStations:QuizPoint[]=[[-.65,0,1.25],[1.45,0,1.25],[.35,0,-.9]];
const names=['TEAM A','TEAM B','HOST RESET'];
export const quizDeskParts:[string,string,QuizPoint,string,number][]=[
 ['desk','Quiz desk work surface',[-.5,.15,0],'Three separate stations make the host reset distinct from the two team responses. All electronics use USB power.',0],
 ['card','Quiz instruction card',[2.3,1.65,-1.9725],'Printed card: one question, one locked result. The two actual LEDs show the result; this card is not an electronic display.',0],
 ['uno','Arduino Uno R3',[-2.6,.31,.73],'D2 = A, D3 = B, D4 = RESET. All are active-low INPUT_PULLUP inputs. D8 and D9 independently drive the two LED branches.',1],
 ['board','Breadboard common ground rail',[-2.7,.31,-.72],'All five returns share the same uninterrupted ground rail. One separate jumper joins that rail to Uno GND; input signals remain separate.',1],
 ...quizStations.flatMap((p,i):[string,string,QuizPoint,string,number][]=>[
 ['panel'+i,names[i]+' station',[p[0]+(i<2?.6:.4),.45,p[2]+.35],'The named base keeps this switch physically separate. The host reset is behind the team stations.',0],
 ['body'+i,names[i]+' tactile switch body',[p[0],.67,p[2]],'Each side has two internally common legs. Pressing bridges opposite sides. Signal and GND must use opposite sides.',2],
 ['cap'+i,names[i]+' moving cap',[p[0],.77,p[2]],i===2?'A new debounced RESET press clears the result. The next round waits until every switch has been released for 25 ms.':'A new qualified edge can win only while the round is armed. Holding this button through reset cannot win the next round.',2],
 ['signal'+i,`D${i+2} · ${names[i]} signal`,[p[0]-.4,1.1,p[2]-.4],'Released reads HIGH through the internal pull-up. Pressing connects this input to common ground. Qualification requires a continuous 25 ms state.',4],
 ['return'+i,names[i]+' switch return',[p[0]+.3,1,p[2]+.2],'This lead joins the opposite switched terminal to its own socket on the common ground rail.',5],
 ]),
 ...[0,1].flatMap((i):[string,string,QuizPoint,string,number][]=>{const p=quizStations[i];return [
 ['led'+i,names[i]+` result LED · D${i+8}`,[p[0]+.5,.8,.85],'Lights for the winning team. Both LEDs light only for a same-update tie. Later presses cannot change a locked result.',3],
 ['resistor'+i,`D${i+8} · separate 330 Ω limiter`,[p[0]+.3,.55,.52],'Orange, orange, brown, gold: 330 Ω with a gold tolerance band. Each LED needs its own series current limiter.',3],
 ['drive'+i,`D${i+8} → resistor → ${names[i]} LED`,[p[0]+.5,1.2,.1],'This output goes through the resistor to the LED anode. It does not connect to either switch input.',6],
 ['cathode'+i,names[i]+' LED cathode return',[p[0]+.7,.9,1.05],'Returns LED current to the shared ground rail at a separate socket.',6],
 ];}),
 ['ground','Uno GND → common rail',[-1.9,.85,-.4],'This jumper provides the reference for all three switch inputs and both LED cathodes.',5],
 ['usb','USB power and serial cable',[-2.79,.32,.055],'Connect after assembly. Serial Monitor is 115200 baud. Power loss clears a result; release all buttons before the new round arms.',7],
];
export default function QuizDeskWorkshopModel({step,selected,select,state,held,press,powered,focus,overview,assembling,onAssemblyState}:{step:number;selected:string;select:(id:string)=>void;state:QuizDeskState;held:[boolean,boolean,boolean];press:(i:number)=>void;powered:boolean;focus:number;overview:number;assembling:boolean;onAssemblyState:(busy:boolean)=>void}){
 const assemblyState=useRef<boolean|null>(null);const controls=useRef<any>(null),{camera,scene,size}=useThree(),part=quizDeskParts.find(p=>p[0]===selected)!;
 const home=()=>{camera.position.set(...(size.width<500?[7.5,9.5,15]:[4.5,5.8,8.5]) as QuizPoint);controls.current?.target.set(0,.65,0);controls.current?.update();};
 useEffect(home,[size.width]);useEffect(()=>{if(overview)home();},[overview]);useEffect(()=>{if(focus){camera.position.set(part[2][0]+1.4,part[2][1]+1.7,part[2][2]+2.8);controls.current?.target.set(...part[2]);controls.current?.update();}},[focus]);
 useEffect(()=>{assemblyState.current=null;},[step]);
 useFrame(()=>{const busy=scene.getObjectsByProperty('name','workshop-mount').some(o=>o.position.length()>1e-6);if(assemblyState.current!==busy){assemblyState.current=busy;onAssemblyState(busy);}scene.getObjectByName('quiz-uno')?.traverse(o=>{if(o instanceof Mesh)for(const m of Array.isArray(o.material)?o.material:[o.material])if(m instanceof MeshStandardMaterial&&m.color.getHexString()==='6bea80')m.emissiveIntensity=powered?1.4:0;});});
 const c=(id:string,color:string)=>selected===id?'#b68bd8':color,wrap=(id:string)=>({userData:{partId:id},onClick:(e:{stopPropagation:()=>void})=>{e.stopPropagation();select(id);}});
 const anchor:QuizPoint=selected.startsWith('cap')?[part[2][0],.7675-(held[Number(selected.slice(-1))]?.025:0),part[2][2]]:selected==='usb'?[-2.79,.32,powered?.055:-.245]:part[2];
 return <><color attach='background' args={['#eeedf7']}/><ambientLight intensity={.9}/><directionalLight position={[-4,8,5]} intensity={1.8} castShadow shadow-mapSize={[2048,2048]} shadow-camera-left={-7} shadow-camera-right={7} shadow-camera-top={7} shadow-camera-bottom={-7}/><OrbitControls ref={controls} target={[0,.65,0]} minDistance={2} maxDistance={25} maxPolarAngle={Math.PI*.48}/>
 <group {...wrap('desk')}><mesh receiveShadow position={[0,.02,0]}><boxGeometry args={[7.6,.24,5.2]}/><meshStandardMaterial color={c('desk','#bdab95')} roughness={.7}/></mesh><Box at={[-2.6,.15,-.3]} size={[2.8,.02,3.7]} color='#29334c'/></group>
 <group {...wrap('card')}><Box at={[2.5,.88,-2]} size={[.07,1.48,.07]} color='#7f8494' metal={.6}/><Box at={[2.5,.18,-2]} size={[.6,.07,.45]} color='#4d4661'/><Box at={[2,1.65,-2]} size={[2.25,.8,.055]} color={c('card','#38314f')}/><Text position={[2,1.82,-1.963]} fontSize={.18} color='#fff'>QUIZ DESK</Text><Text position={[2,1.57,-1.963]} fontSize={.083} color='#e7def6'>ONE QUESTION · ONE LOCKED RESULT</Text><Text position={[2,1.39,-1.963]} fontSize={.07} color='#bce5df'>A FIRST · B FIRST · SAME-UPDATE TIE</Text></group>
 {quizStations.map((p,i)=><group key={i} {...wrap('panel'+i)}><Box at={[p[0]+(i<2?.2:0),.37,p[2]]} size={[i<2?1.65:1.2,.15,i<2?1.35:.9]} color={c('panel'+i,i===2?'#51406e':i?'#d5d9e8':'#d2e1de')}/><Text position={[p[0]+(i<2?.2:0),.37,p[2]+(i<2?.682:.462)]} fontSize={.09} color={i===2?'#fff':'#33405a'}>{names[i]}</Text></group>)}
 {step>=1&&<Mount><group name='quiz-uno' position={[-2.6,.23,.65]} {...wrap('uno')}><Uno active={selected==='uno'}/></group><group position={[-2.6,.23,-1.25]} {...wrap('board')}><Breadboard active={selected==='board'}/>{Array.from({length:20},(_,n)=><Box key={n} at={[-.95+n*.1,.073,.53]} size={[.033,.008,.033]} color='#697279'/>)}</group></Mount>}
 {step>=2&&quizStations.map((p,i)=><Mount key={i}><group {...wrap('body'+i)}><Box at={[p[0],.525,p[2]]} size={[.2,.16,.2]} color='#555368'/><Box at={[p[0],.625,p[2]]} size={[.3,.04,.3]} color='#303641'/><Box at={[p[0],.67,p[2]]} size={[.26,.07,.26]} color={c('body'+i,'#b3b7bd')} metal={.65}/>{[-1,1].flatMap(x=>[-1,1].map(z=><Box key={x+':'+z} at={[p[0]+x*.19,.645,p[2]+z*.08]} size={[.13,.025,.04]} color={c('body'+i,'#aab4ba')} metal={.8}/>))}</group><group {...wrap('cap'+i)}><mesh name={'quiz-cap-'+i} position={[p[0],.735-(held[i]?.025:0),p[2]]} onClick={e=>{e.stopPropagation();select('cap'+i);press(i);}} castShadow><cylinderGeometry args={[.09,.09,.065,32]}/><meshStandardMaterial color={c('cap'+i,['#359885','#5874b0','#7950b6'][i])}/></mesh></group></Mount>)}
 {step>=3&&[0,1].map(i=>{const x=quizStations[i][0],on=powered&&(i?state.ledB:state.ledA);return <Mount key={i}><group {...wrap('led'+i)}><Box at={[x+.5,.54,.85]} size={[.17,.2,.17]} color='#4b4c60'/>{[.81,.89].map((z,j)=><Box key={z} at={[x+.5+j*.04,.66,z]} size={[.02,.10,.02]} color='#bbb6a6' metal={.7}/>)}<Box at={[x+.5,.66,.85]} size={[.22,.04,.22]} color='#3d4055'/><mesh name={'quiz-led-'+i} position={[x+.5,.74,.85]}><capsuleGeometry args={[.075,.06,6,20]}/><meshPhysicalMaterial color={c('led'+i,i?'#457fce':'#299b6a')} roughness={.22} clearcoat={1} emissive={i?'#2d8aff':'#1bc36d'} emissiveIntensity={on?2:0}/></mesh>{on&&<pointLight position={[x+.5,.87,.85]} intensity={.25} color={i?'#52abff':'#48ed9a'}/>}</group><group {...wrap('resistor'+i)}><Wire points={[[x+.12,.55,.52],[x+.5,.55,.52],[x+.5,.66,.81]]} color='#b1b4ac' width={1.6} connectors={false}/><Box at={[x+.3,.55,.52]} size={[.22,.075,.075]} color={c('resistor'+i,'#cbb48b')}/>{['#d47b2a','#d47b2a','#725231','#bca357'].map((v,n)=><Box key={n} at={[x+.23+n*.045,.55,.52]} size={[.016,.079,.079]} color={v}/>)}</group></Mount>;})}
 {step>=4&&quizStations.map((p,i)=><group key={i} {...wrap('signal'+i)}><Wire points={[[p[0]-.22,.69,p[2]-.08],[p[0]-.4,1.1,p[2]-.4],[-2.91,.3725,.488+i*.059]]} color={c('signal'+i,['#408e82','#4d70b0','#8b59ba'][i])}/></group>)}
 {step>=5&&<><group {...wrap('ground')}><Wire points={[[-2.29,.3725,.665],[-1.9,.85,-.4],[-3.55,.3465,-.72]]} color={c('ground','#2c3340')}/></group>{quizStations.map((p,i)=><group key={i} {...wrap('return'+i)}><Wire points={[[p[0]+.22,.69,p[2]+.08],[p[0]+.3,1,p[2]+.2],[-3.35+i*.2,.3465,-.72]]} color={c('return'+i,'#2c3340')}/></group>)}</>}
 {step>=6&&[0,1].map(i=>{const x=quizStations[i][0];return <group key={i}><group {...wrap('drive'+i)}><Wire points={[[-2.91,.3725,.842+i*.059],[x+.5,1.2,.1],[x+.12,.55,.52]]} color={c('drive'+i,i?'#5178b0':'#3f9374')}/></group><group {...wrap('cathode'+i)}><Wire points={[[x+.54,.66,.89],[x+.7,.9,1.05],[-2.75+i*.2,.3465,-.72]]} color={c('cathode'+i,'#303846')}/></group></group>;})}
 {step>=7&&<group {...wrap('usb')}><Wire points={[[-2.79,.32,powered?.055:-.245],[-3.3,.28,-.2],[-4.1,.17,.65]]} color={c('usb','#4b6b9e')} width={7}/><Box at={[-2.79,.32,powered?.055:-.245]} size={[.15,.1,.1]} color='#4d6fa0'/></group>}
 {!assembling&&step>=2&&quizStations.map((p,i)=>selected!=='cap'+i&&<WorldLabel key={i} position={[p[0],.79,p[2]]} className='rw-label-anchor qd-label-anchor' keepInView avoidOverlap calloutGap={65}><span className='rw-world-label qd-tag'><button onClick={()=>{select('cap'+i);press(i);}}>{names[i]} · PRESS</button></span></WorldLabel>)}
 {!assembling&&<WorldLabel position={anchor} className='rw-label-anchor qd-label-anchor' keepInView avoidOverlap calloutGap={100}><span className='rw-world-label qd-tag'>{part[1]}</span></WorldLabel>}
 </>;
}
