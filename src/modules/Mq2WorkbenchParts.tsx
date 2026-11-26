import {memo,useMemo,type ReactNode} from 'react';
import {CatmullRomCurve3,Vector3} from 'three';
import type {ThreeEvent} from '@react-three/fiber';
import Uno from './BluetoothCarUno';
import Breadboard from './BluetoothMiniBreadboard';
import Module from './Mq2ModuleParts';
import {mq2WorkbenchLayout as layout,mq2Resistors,mq2LedPins,mq2DialPins,type Mq2Point as P} from '../data/mq2-workbench-layout';
function Lead({points,color}:{points:readonly P[];color:string}){
 const path=useMemo(()=>new CatmullRomCurve3(points.map(p=>new Vector3(...p))),[points]);
 return <mesh castShadow><tubeGeometry args={[path,20,.28,8,false]}/><meshStandardMaterial color={color} metalness={.8} roughness={.35}/></mesh>;
}
function Mq2WorkbenchParts({selected,choose,usb=false,modulePower=false,led=false,dial=.2}:{selected:string;choose:(id:string)=>void;usb?:boolean;modulePower?:boolean;led?:boolean|null;dial?:number}){
 const c=(id:string,color:string)=>selected===id?'#b78be8':color;
 const tag=(id:string,children:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{children}</group>;
 const board=layout.breadboard;
 return <group name="mq2-workbench-parts">
 <group name="mq2-controller-assembly" position={[...layout.uno]} scale={50}><Uno selected={selected} select={choose} powered={usb} partPrefix="mq2-"/></group>
 {tag('mq2-breadboard',<group position={[...board]} scale={50}><Breadboard selected={selected==='mq2-breadboard'} supplyLabel="" returnLabel=""/></group>)}
 <group position={[...layout.module]}><Module selected={selected} choose={choose} powered={modulePower}/></group>
 {mq2Resistors.map(r=>{const a=r.from,b=r.to,x=(a[0]+b[0])/2,y=a[1]+4,z=a[2];return <group key={r.id}>{tag(r.id,<><mesh position={[x,y,z]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[1.1,1.1,5.8,24]}/><meshStandardMaterial color={c(r.id,'#c9b28c')} roughness={.6}/></mesh>{r.bands.map((band,n)=><mesh key={n} position={[x-2+n*1.15,y,z]} rotation={[0,0,Math.PI/2]}><cylinderGeometry args={[1.115,1.115,.38,24]}/><meshStandardMaterial color={c(r.id,band)} roughness={.6}/></mesh>)}<Lead points={[[a[0],a[1]-3,a[2]],[a[0],y-1,a[2]],[a[0]+1,y,a[2]],[x-2.9,y,z]]} color={c(r.id,'#bdc3c5')}/><Lead points={[[b[0],b[1]-3,b[2]],[b[0],y-1,b[2]],[b[0]-1,y,b[2]],[x+2.9,y,z]]} color={c(r.id,'#bdc3c5')}/></>)}</group>;})}
 {tag('mq2-warning-led',<group position={[(mq2LedPins.anode[0]+mq2LedPins.cathode[0])/2,board[1]+15,mq2LedPins.anode[2]]}><mesh position={[0,2,0]} castShadow><cylinderGeometry args={[2.5,2.5,4,32]}/><meshStandardMaterial color={c('mq2-warning-led','#c93645')} emissive="#ff2635" emissiveIntensity={led===true?1.8:0} transparent opacity={.88} roughness={.25}/></mesh><mesh position={[0,4,0]}><sphereGeometry args={[2.5,32,16,0,Math.PI*2,0,Math.PI/2]}/><meshStandardMaterial color={c('mq2-warning-led','#c93645')} emissive="#ff2635" emissiveIntensity={led===true?1.8:0} transparent opacity={.88} roughness={.25}/></mesh><mesh position={[0,.1,0]}><cylinderGeometry args={[2.8,2.8,.5,32]}/><meshStandardMaterial color={c('mq2-warning-led','#a83642')} roughness={.3}/></mesh></group>)}
 {(['anode','cathode'] as const).map(pin=>{const p=mq2LedPins[pin],id='mq2-led-'+pin;return <group key={pin}>{tag(id,<Lead points={[[p[0],p[1]-3,p[2]],[p[0],board[1]+16,p[2]]]} color={c(id,'#c0c5c6')}/>)}</group>;})}
 {tag('mq2-test-dial',<group position={[mq2DialPins[1][0],board[1]+14,mq2DialPins[1][2]]}><mesh position={[0,2,0]}><boxGeometry args={[7.5,4,4]}/><meshStandardMaterial color={c('mq2-test-dial','#316a9b')} roughness={.65}/></mesh><mesh position={[0,5,0]} rotation={[0,(dial-.5)*Math.PI*1.5,0]}><cylinderGeometry args={[2.8,2.8,2,32]}/><meshStandardMaterial color={c('mq2-test-dial','#d9d7cc')} roughness={.5}/></mesh><group rotation={[0,(dial-.5)*Math.PI*1.5,0]}><mesh position={[0,6.05,0]}><boxGeometry args={[.45,.1,4]}/><meshStandardMaterial color={c('mq2-test-dial','#42414c')}/></mesh></group></group>)}
 {mq2DialPins.map((p,n)=>{const id=['mq2-dial-5v','mq2-dial-wiper','mq2-dial-ground'][n];return <group key={id}>{tag(id,<Lead points={[[p[0],p[1]-3,p[2]],[p[0],board[1]+15,p[2]]]} color={c(id,'#bfc6c8')}/>)}</group>;})}
 </group>;
}
export default memo(Mq2WorkbenchParts);
