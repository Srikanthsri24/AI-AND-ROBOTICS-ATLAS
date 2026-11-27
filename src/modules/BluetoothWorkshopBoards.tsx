import {useMemo,useRef,type ReactNode} from 'react';
import {Text} from '@react-three/drei';
import {useFrame} from '@react-three/fiber';
import {bluefruitModeIndicator} from '../data/bluetooth-radio-indicators';
import {DoubleSide,LineCurve3,MeshStandardMaterial,Path,Shape,Vector3} from 'three';
import {SolarMeterSolid as Box} from './SolarMeterParts';
import FlatCopperTracks from './FlatCopperTracks';
import {bluetoothBoardLayouts,bluetoothBoardDimensions,bluetoothBoardScale as scale,bluetoothBoardThickness as thickness,bluetoothBoardTop as top,bluetoothBoardPoint,bluetoothPadPosition,bluetoothHeaderPoints,type BluetoothBoardKind,type BoardPoint} from '../data/bluetooth-board-geometry';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href,violet='#b78be8';
function disableGpuSdf(t:{gpuAccelerateSDF:boolean}|null){if(t)t.gpuAccelerateSDF=false;}
function Print({at,text,size=.025,cpu=false}:{at:BoardPoint;text:string;size?:number;cpu?:boolean}){return <Text ref={cpu?disableGpuSdf:undefined} position={at} rotation={[-Math.PI/2,0,0]} font={font} fontSize={size} color='#ece9da'>{text}</Text>;}
function Track({from,to,r,color}:{from:BoardPoint;to:BoardPoint;r:number;color:string}){const key=from.join(',')+'|'+to.join(','),curve=useMemo(()=>new LineCurve3(new Vector3(...from),new Vector3(...to)),[key]);return <mesh><tubeGeometry args={[curve,1,r,6,false]}/><meshStandardMaterial color={color} roughness={.65}/></mesh>;}
export const bluetoothBoardParts=[
 ['radio-pcb','Bluefruit circuit board','Insulating PCB supports the radio, regulator, switch and UART header.'],
 ['radio-module','MDBT40 Bluetooth radio','The shielded radio receives the phone’s BLE UART text. Its TX output feeds the breakout TXO contact.'],
 ['radio-antenna','Ceramic radio antenna','Keep the antenna end clear of batteries and metal so the phone can communicate with the receiver.'],
 ['radio-mode','UART / CMD slide switch','UART/Data passes received text to TXO. CMD mode interprets local commands instead.'],
 ['radio-regulator','3.3 V regulator','VIN feeds the regulator. The radio runs from its regulated 3.3 V rail.'],
 ['radio-components','Radio support components','Capacitors, level-shift diodes and resistors condition the supply and UART inputs.'],
 ['radio-tracks','Radio PCB tracks','Copper connections join the actual component and header pads.'],
 ['radio-headers','Radio UART header','VIN → Uno 5 V; GND and CTS → common ground; TXO → Uno D2. Leave DFU, RXI, RTS and MOD unwired.'],
 ['radio-leds','Radio status LEDs','MODE and CONN indicators belong to the radio firmware. They are separate from a motor-running indicator.'],
 ['driver-pcb','TB6612 driver board','The board keeps logic VCC and the motor VM supply separate while sharing GND.'],
 ['driver-chip','Dual H-bridge IC','Two independently controlled bridges switch the left and right motor outputs. STBY LOW disables both.'],
 ['driver-components','Driver supply components','Decoupling capacitors, reverse-polarity circuitry and the STBY pull-up support the driver. This Adafruit board pulls STBY up, not down.'],
 ['driver-tracks','Driver PCB tracks','Actual copper routes connect the chip to its two rows of header contacts.'],
 ['driver-inputs','Driver logic and power header','PWMA / PWMB set PWM; AIN / BIN set direction. D12 drives STBY. VM receives switched AA power; VCC receives Uno 5 V.'],
 ['driver-outputs','Motor output header','A01 / A02 connect the left motor. B01 / B02 connect the right motor. Ground pads share the circuit reference.'],
] as const;
/** Distinct geometry adapted from the two Adafruit Eagle layouts. Attribution is retained in each source JSON. */
export default function BluetoothWorkshopBoard({kind,selected,select,uart=true,powered=false,connected=false,idPrefix,individualHeaders=false,individualComponents=false,cpuGlyphs=false}:{kind:BluetoothBoardKind;selected:string;select:(id:string)=>void;uart?:boolean;powered?:boolean;connected?:boolean;idPrefix?:string;individualHeaders?:boolean;individualComponents?:boolean;cpuGlyphs?:boolean}){
 const layout=bluetoothBoardLayouts[kind],radio=kind==='bluefruit',prefix=idPrefix??(radio?'radio':'driver');
 const modeLED=useRef<MeshStandardMaterial>(null),modeTime=useRef(0);useFrame((_,dt)=>{if(!radio)return;modeTime.current=powered?modeTime.current+dt*1000:0;if(modeLED.current)modeLED.current.emissiveIntensity=bluefruitModeIndicator(powered,uart,modeTime.current)?1.1:0;});
 const shape=useMemo(()=>{
  const [w,h]=bluetoothBoardDimensions[kind],s=new Shape(),r=2.54;
  // Bluefruit has only its antenna-end corners rounded; TB6612 has four rounded corners.
  if(radio){s.moveTo(0,0);s.lineTo(w,0);s.lineTo(w,h-r);s.absarc(w-r,h-r,r,0,Math.PI/2,false);s.lineTo(r,h);s.absarc(r,h-r,r,Math.PI/2,Math.PI,false);s.lineTo(0,0);}else {s.moveTo(r,0);s.lineTo(w-r,0);s.absarc(w-r,r,r,-Math.PI/2,0,false);s.lineTo(w,h-r);s.absarc(w-r,h-r,r,0,Math.PI/2,false);s.lineTo(r,h);s.absarc(r,h-r,r,Math.PI/2,Math.PI,false);s.lineTo(0,r);s.absarc(r,r,r,Math.PI,Math.PI*1.5,false);}
  for(const e of layout.elements)for(const pad of e.pads.filter(p=>p.kind==='pad')){const [x,y]=bluetoothPadPosition(e,pad),hole=new Path();hole.absarc(x,y,Number('drill' in pad?pad.drill:1)/2,0,Math.PI*2,true);s.holes.push(hole);}
  return s;
 },[kind]);
 const scope=(id:string)=>idPrefix?id.replace(/^(radio|driver)(?=-)/,idPrefix):id,c=(id:string,color:string)=>selected===scope(id)?violet:color,tag=(id:string,node:ReactNode)=><group key={scope(id)} userData={{partId:scope(id)}} onClick={e=>{e.stopPropagation();select(scope(id));}}>{node}</group>,at=(x:number,y:number,h=top)=>bluetoothBoardPoint(kind,x,y,h),element=(name:string)=>layout.elements.find(e=>e.name===name)!,point=(name:string,h=top)=>{const e=element(name);return at(+e.x,+e.y,h);};
 const headers=bluetoothHeaderPoints(kind),mountingId=individualComponents?prefix+'-mounting-pads':prefix+'-pcb';
 const passive=(name:string,id:string)=>{const e=element(name);if(!e)return null;const big=e.package.includes('0805'),size:BoardPoint=big?[.06,.025,.038]:[.055,.027,.034];return <group key={name} position={point(name,top+size[1]/2)} rotation={[0,-Number((e.rot??'R0').replace(/[^\d.-]/g,''))*Math.PI/180,0]}><Box at={[0,0,0]} size={size} color={c(id,name.startsWith('C')?'#baa37d':'#292b33')}/>{[-1,1].map(side=><Box key={side} at={[side*(size[0]/2-.005),0,0]} size={[.01,size[1]+.002,size[2]+.002]} color={c(id,'#b8bcc3')} metal={.65}/>)}</group>;};
 return <>
 {tag(prefix+'-pcb',<><mesh position={[-bluetoothBoardDimensions[kind][0]*scale/2,-top,bluetoothBoardDimensions[kind][1]*scale/2]} rotation={[-Math.PI/2,0,0]} scale={[scale,scale,1]}><extrudeGeometry args={[shape,{depth:thickness,bevelEnabled:false,curveSegments:24}]}/><meshStandardMaterial color={c(prefix+'-pcb','#215680')} roughness={.65} side={DoubleSide}/></mesh><Print cpu={cpuGlyphs} at={radio?at(10.5,11.8,top+.002):at(9.5,5,top+.002)} text={radio?'Bluefruit LE':'TB6612'} size={radio?.035:.04}/></>)}
 {tag(prefix+'-tracks',<FlatCopperTracks tracks={layout.tracks} scale={scale} centreX={bluetoothBoardDimensions[kind][0]/2} centreY={bluetoothBoardDimensions[kind][1]/2} height={top+.001} color={c(prefix+'-tracks','#2e638a')}/>)}
 {tag(prefix+'-mounting-pads',<group userData={{partId:mountingId}} onClick={e=>{e.stopPropagation();select(mountingId);}}>{layout.elements.filter(e=>e.package.startsWith('MOUNTING')).map(e=><mesh key={e.name} position={point(e.name,top+.001)} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[1.25*scale,1.75*scale,32]}/><meshStandardMaterial color={c(mountingId,'#c5ac73')} roughness={.38} metalness={.65} side={DoubleSide}/></mesh>)}</group>)}
 {headers.map(p=>{const bank=radio?prefix+'-headers':p.element==='JP1'?prefix+'-inputs':prefix+'-outputs',id=individualHeaders?bank+'-pin-'+p.name:bank;return tag(bank+'-pin-'+p.name,<group position={[p.at[0],0,p.at[2]]} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}><mesh position={[0,top+.001,0]} rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.015,.029,24]}/><meshStandardMaterial color={c(id,'#c7ae70')} metalness={.65} side={DoubleSide}/></mesh><Box at={[0,top+.036,0]} size={[.065,.072,.065]} color={c(id,'#252936')}/><Box at={[0,.09,0]} size={[.014,.18,.014]} color={c(id,'#c5ab71')} metal={.7}/><Print cpu={cpuGlyphs} at={[radio?0:p.element==='JP1'?.07:-.08,top+.003,radio?(Number(p.pad)%2===0?.08:-.065):0]} text={p.name} size={.019}/></group>);})}
 {radio?<>
 {tag('radio-module',<group position={point('U1')}><Box at={[0,.014,0]} size={[10.2*scale,.028,18.2*scale]} color={c('radio-module','#a33d3c')}/><Box at={[0,.067,2*scale]} size={[9.6*scale,.078,12.3*scale]} color={c('radio-module','#b1b9c0')} metal={.85}/><Print cpu={cpuGlyphs} at={[0,.108,2*scale]} text='MDBT40' size={.032}/>{element('U1').pads.map(p=><Box key={p.name} at={[+p.x*scale,.027,-+p.y*scale]} size={[.016,.015,.025]} color={c('radio-module','#bea768')} metal={.65}/>)}</group>)}
 {tag('radio-antenna',<group position={point('U1')}><Box at={[0,.059,-7.1*scale]} size={[7.9*scale,.063,2.8*scale]} color={c('radio-antenna','#d8cdb6')}/>{[-1,1].map(side=><Box key={side} at={[side*3.6*scale,.059,-7.1*scale]} size={[.018,.066,.087]} color={c('radio-antenna','#a8a18c')} metal={.6}/>)}</group>)}
 {tag('radio-mode',<group position={point('SW1')}><Box at={[0,.035,0]} size={[7.2*scale,.07,3.5*scale]} color={c('radio-mode','#b8bdc4')} metal={.8}/><Box at={[0,.073,0]} size={[.17,.009,.057]} color='#252934'/><Box at={[(uart?-1:1)*.043,.09,0]} size={[.055,.038,.05]} color={c('radio-mode','#212630')}/><Print cpu={cpuGlyphs} at={[-.145,.002,0]} text='UART' size={.021}/><Print cpu={cpuGlyphs} at={[.145,.002,0]} text='CMD' size={.021}/></group>)}
 {tag('radio-regulator',<group position={point('U2',top+.023)}><Box at={[0,0,0]} size={[.06,.04,.085]} color={c('radio-regulator','#292c34')}/>{element('U2').pads.map(p=><Box key={p.name} at={[+p.x*scale,-.015,-+p.y*scale]} size={[.025,.01,.014]} color={c('radio-regulator','#b5bac1')} metal={.7}/>)}</group>)}
 {tag('radio-components',<>{['R1','R2','R3','R4','R7','C1','C2','C3','C4','D3','D4','D5','D6','D7','D8'].map(name=>passive(name,'radio-components'))}</>)}
 {tag('radio-leds',<>{['D1','D2'].map((name,i)=><group key={name} position={point(name,top+.014)}><Box at={[0,0,0]} size={[.04,.026,.06]} color={c('radio-leds','#cbc1a4')}/><mesh position={[0,.014,0]}><boxGeometry args={[.028,.006,.036]}/><meshStandardMaterial ref={i?undefined:modeLED} color={i?'#5cba78':'#b34e49'} emissive={i?'#46ae6a':'#b33e31'} emissiveIntensity={powered&&i&&connected?1.1:0}/></mesh><Print cpu={cpuGlyphs} at={[i?-.015:.015,.003,-.08]} text={i?'CONN':'MODE'} size={.021}/></group>)}</>)}
 </>:<>
 {tag('driver-chip',<group position={point('U1',top)} rotation={[0,-Math.PI/2,0]}><Box at={[0,.048,0]} size={[8.2*scale,.075,5.3*scale]} color={c('driver-chip','#262a31')}/><Print cpu={cpuGlyphs} at={[0,.087,0]} text='TB6612FNG' size={.024}/>{element('U1').pads.map(p=><group key={p.name}><Box at={[+p.x*scale,.004,-+p.y*scale]} size={[Number('dx' in p?p.dx:1)*scale,.008,Number('dy' in p?p.dy:.4)*scale]} color={c('driver-chip','#b7bcc3')} metal={.7}/><Track from={[+p.x*scale,.036,-Math.sign(+p.y)*2.5*scale]} to={[+p.x*scale,.009,-+p.y*scale]} r={.005} color={c('driver-chip','#b7bcc3')}/></group>)}</group>)}
 {tag('driver-components',<>{['R1','C2','C3'].map(name=>{const id=individualComponents?'driver-'+name:'driver-components';return individualComponents?tag(id,passive(name,id)):passive(name,id);})}{(()=>{const id=individualComponents?'driver-Q1':'driver-components',node=<group position={point('Q1',top+.025)}><Box at={[0,0,0]} size={[.09,.042,.055]} color={c(id,'#292c34')}/>{element('Q1').pads.map(p=><Box key={p.name} at={[-+p.x*scale,-.017,+p.y*scale]} size={[.025,.014,.017]} color={c(id,'#b7bcc1')} metal={.7}/>)}</group>;return individualComponents?tag(id,node):node;})()}</>)}
 </>}
 </>;
}
