import {memo,useMemo,type ReactNode} from 'react';
import type {ThreeEvent} from '@react-three/fiber';
import {Shape,Path} from 'three';
import{raGripPinion,raGripTooth,raGripToothX,raGripRackZ}from'../data/rover-arm-gripper';
import Servo from './RoverArmServoParts';
import {raServoMounts} from '../data/rover-arm-servo';
import {raArmDimensions as D,raArmNeutral} from '../data/rover-arm-mechanics';

type Props={selected:string;choose:(id:string)=>void;angles?:readonly number[]};
const plateOptions={depth:2.4,bevelEnabled:false},baseOptions={depth:D.baseThickness,bevelEnabled:false},rackOptions={depth:5,bevelEnabled:false};
function bore(s:Shape,x:number,y:number,r:number){const p=new Path();p.absarc(x,y,r,0,Math.PI*2,true);s.holes.push(p);}
function rect(w:number,h:number,x=0,y=0){const s=new Shape();s.moveTo(x-w/2,y-h/2);s.lineTo(x+w/2,y-h/2);s.lineTo(x+w/2,y+h/2);s.lineTo(x-w/2,y+h/2);s.closePath();return s;}
function parts(){const cradle=rect(62,31,10.5),aperture=new Path();aperture.moveTo(-10.1,-10.1);aperture.lineTo(31.1,-10.1);aperture.lineTo(31.1,10.1);aperture.lineTo(-10.1,10.1);aperture.closePath();cradle.holes.push(aperture);for(const[x,,z]of raServoMounts)bore(cradle,x,-z,1.35);const base=new Shape();base.absarc(0,0,D.baseRadius,0,Math.PI*2,false);for(const x of[-42,42])for(const z of[-32,32])bore(base,x,z,3.3);const link=(length:number)=>{const s=new Shape();s.moveTo(-12.5,-12.5);s.lineTo(12.5,-12.5);s.lineTo(12.5,length);s.lineTo(11.8,length);s.absarc(0,length,11.8,0,Math.PI,true);s.lineTo(-12.5,length);s.closePath();bore(s,0,0,2.3);for(const y of[-7.2,7.2])bore(s,0,y,1.6);for(const x of[-7.2,7.2])bore(s,x,0,1.6);for(let y=24;y<length-14;y+=20)bore(s,0,y,5);return s;};const pinion=raGripPinion();const palm=rect(74,42);bore(palm,0,0,5.8);return{cradle,base,palm,upper:link(D.upperLink),fore:link(D.forearm),wrist:link(D.wrist),pinion,leftTooth:raGripTooth(-1),rightTooth:raGripTooth(1)};}

/** Detailed authored mechanical hierarchy. Angles are calibrated mechanical pose,
 * never a claim that a particular microsecond pulse produces this position. */
function RoverArmMechanics({selected,choose,angles=raArmNeutral}:Props){
 const s=useMemo(parts,[]),a=(i:number)=>angles[i]??raArmNeutral[i];
 const mat=(id:string,color='#333942',metal=.75)=>({color:selected===id?'#c4a2ff':color,metalness:metal,roughness:.34});
 const tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 const box=(id:string,p:[number,number,number],size:[number,number,number],color?:string,metal?:number)=><mesh position={p}><boxGeometry args={size}/><meshStandardMaterial {...mat(id,color,metal)}/></mesh>;
 const cradle=(joint:string)=>{const id=`ra-arm-${joint}-cradle`,bolts=`ra-arm-${joint}-bolts`;return <>
 {tag(id,<mesh position={[0,-19,0]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[s.cradle,plateOptions]}/><meshStandardMaterial {...mat(id)}/></mesh>)}
 {tag(bolts,<>{raServoMounts.map(([x,,z],i)=><group key={i} position={[x,-16,z]}><mesh><cylinderGeometry args={[1.15,1.15,9,16]}/><meshStandardMaterial {...mat(bolts,'#aab4bd')}/></mesh><mesh position={[0,3,0]}><cylinderGeometry args={[2.4,2.4,.7,24]}/><meshStandardMaterial {...mat(bolts,'#b3bdc6')}/></mesh><mesh position={[0,4,0]}><cylinderGeometry args={[2,2,1.4,6]}/><meshStandardMaterial {...mat(bolts,'#97a5b1')}/></mesh><mesh position={[0,-4,0]}><cylinderGeometry args={[2.3,2.3,2,6]}/><meshStandardMaterial {...mat(bolts,'#b3bdc6')}/></mesh></group>)}</>)}
 </>;};
 const servo=(joint:string,angle:number)=><><Servo prefix={`ra-arm-${joint}-servo`} selected={selected} choose={choose} angle={angle} leadVisible={false}/>{cradle(joint)}</>;
 const flatLink=(joint:string,shape:Shape,length:number)=>{const id=`ra-arm-${joint}-link`;return tag(id,<><mesh position={[0,0,3.6]}><extrudeGeometry args={[shape,plateOptions]}/><meshStandardMaterial {...mat(id)}/></mesh>{box(id,[0,length-14.3,-6],[25,2.4,26])}{[[7.2,0],[-7.2,0],[0,7.2],[0,-7.2]].map(([x,y],i)=><group key={i} position={[x,y,3.6]} rotation={[Math.PI/2,0,0]}><mesh><cylinderGeometry args={[1.3,1.3,8,16]}/><meshStandardMaterial {...mat(id,'#aab4bd')}/></mesh><mesh position={[0,3.8,0]}><cylinderGeometry args={[2.3,2.3,1.5,6]}/><meshStandardMaterial {...mat(id,'#b3bdc6')}/></mesh></group>)}</>);};
 const finger=(side:-1|1)=>{const id=`ra-arm-${side<0?'left':'right'}-finger`,gap=24-7.6*a(5),z=-side*raGripRackZ;return <group position={[side*gap,0,z]} name={id+'-slide'}>{tag(id,<>
 {box(id,[side*-13,0,0],[34,5,4])}{raGripToothX(side).map((x,n)=><mesh key={n} position={[x,-2.5,-z]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[side<0?s.leftTooth:s.rightTooth,rackOptions]}/><meshStandardMaterial {...mat(id)}/></mesh>)}
 {box(id,[0,10,0],[5,20,4])}{box(id,[0,19,-z/2],[5,5,Math.abs(z)+5])}{box(id,[0,41,-z],[5,44,10])}{box(id,[-side*3.2,55,-z],[1.4,13,10],'#625580',.03)}
 </>)}</group>;};
 return <group name="ra-arm-mechanics" userData={{units:'mm',authoredTeachingGeometry:true}}>
 {tag('ra-arm-baseplate',<><mesh rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[s.base,baseOptions]}/><meshStandardMaterial {...mat('ra-arm-baseplate','#373c47')}/></mesh>{[-18,39].flatMap(x=>[-13,13].map(z=><group key={x+':'+z}>{box('ra-arm-baseplate',[x,17,z],[3,24,3])}</group>))}</>)}
 <group position={[0,48,0]}>{servo('base',a(0))}<group name="ra-arm-base-output" rotation={[0,a(0),0]}>
 {tag('ra-arm-base-link',<>{box('ra-arm-base-link',[0,5,0],[29,2.4,28])}{box('ra-arm-base-link',[0,15,-17],[29,22,2.4])}{box('ra-arm-base-link',[10.5,D.shoulderHeight-48-18,-28],[62,2.4,30])}</>)}
 <group position={[0,D.shoulderHeight-48,0]}>
 <group rotation={[Math.PI/2,0,0]}>{servo('shoulder',a(1))}</group>
 <group name="ra-arm-shoulder-output" rotation={[0,0,a(1)]}>
 {flatLink('shoulder',s.upper,D.upperLink)}
 <group position={[0,D.upperLink,0]}><group rotation={[Math.PI/2,0,0]}>{servo('elbow',a(2))}</group>
 <group name="ra-arm-elbow-output" rotation={[0,0,a(2)]}>
 {flatLink('elbow',s.fore,D.forearm)}
 <group position={[0,D.forearm,0]}><group rotation={[Math.PI/2,0,0]}>{servo('pitch',a(3))}</group>
 <group name="ra-arm-pitch-output" rotation={[0,0,a(3)]}>
 {flatLink('pitch',s.wrist,D.wrist)}{tag('ra-arm-pitch-adapter',<>{[-19,40].map(x=>box('ra-arm-pitch-adapter',[x,D.wrist-19,-7],[2.4,2.4,39]))}{box('ra-arm-pitch-adapter',[10.5,D.wrist-19,11.3],[62,2.4,2.4])}{box('ra-arm-pitch-adapter',[0,D.wrist-19,8],[25,2.4,6])}</>)}
 <group position={[0,D.wrist,-25]}>{servo('roll',a(4))}<group name="ra-arm-roll-output" rotation={[0,a(4),0]}>
 {tag('ra-arm-roll-link',<>{box('ra-arm-roll-link',[0,5,0],[25,2.4,25])}{box('ra-arm-roll-link',[0,25,-15],[25,40,2.4])}</>)}
 <group position={[0,D.palm,0]}>{servo('grip',a(5))}
 {tag('ra-arm-palm',<><mesh position={[0,4.8,0]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[s.palm,plateOptions]}/><meshStandardMaterial {...mat('ra-arm-palm')}/></mesh>{[-1,1].map(side=>box('ra-arm-palm',[side*32,-6,0],[2.4,24,28]))}{[-1,1].map(side=><group key={side}>{box('ra-arm-palm',[0,11,side*15],[70,8,2.4])}{box('ra-arm-palm',[0,11,side*5],[70,8,2.4])}</group>)}</>)}
 <group rotation={[0,a(5),0]}>{tag('ra-arm-pinion',<><mesh position={[0,8,0]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[s.pinion,plateOptions]}/><meshStandardMaterial {...mat('ra-arm-pinion','#9cabb9')}/></mesh><mesh position={[0,5.8,0]}><cylinderGeometry args={[3.8,3.8,4.4,32]}/><meshStandardMaterial {...mat('ra-arm-pinion','#9cabb9')}/></mesh></>)}</group>
 <group position={[0,10.5,0]}>{finger(-1)}{finger(1)}</group>
 </group></group></group></group></group></group></group></group></group></group></group>
 </group>;
}
export default memo(RoverArmMechanics);
