import{memo,useLayoutEffect,useMemo,useRef,type ReactNode}from'react';
import type{ThreeEvent}from'@react-three/fiber';
import{Group,Mesh,Path,Shape,Vector2,type TubeGeometry}from'three';
import{pickUsbBank as B,pickUsbBankFace,pickUsbPose}from'../data/pick-rover-usb';
import{rewriteCubeSatTube}from'./cubesat-tube-motion';
type P=[number,number,number];
function rect(w:number,h:number){const s=new Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();return s;}
function hole(s:Shape,w:number,h:number,x=0,y=0){const p=new Path();p.moveTo(x-w/2,y-h/2);p.lineTo(x-w/2,y+h/2);p.lineTo(x+w/2,y+h/2);p.lineTo(x+w/2,y-h/2);p.closePath();s.holes.push(p);return s;}
function ring(w:number,h:number,t:number){return hole(rect(w,h),w-2*t,h-2*t);}
const extrusion={depth:10,bevelEnabled:false},wallExtrusion={depth:1,bevelEnabled:false};
/** Native millimetres. Independent insulated inserts, real contact faces and hollow boots. */
function PickRoverUsb({selected,choose,on=false,onToggle,unoWithdrawal=0,bankWithdrawal=0,bankShift=0}:{selected:string;choose:(id:string)=>void;on?:boolean;onToggle?:()=>void;unoWithdrawal?:number;bankWithdrawal?:number;bankShift?:number}){
 const root=useRef<Group>(null),pose=pickUsbPose(unoWithdrawal,bankWithdrawal);
 const geo=useMemo(()=>{const b=new Shape();for(const [i,p]of [[-4.9,-4.4],[4.9,-4.4],[4.9,3],[3.5,4.4],[-3.5,4.4],[-4.9,3]].entries())i?b.lineTo(p[0],p[1]):b.moveTo(p[0],p[1]);b.closePath();const inner=new Path();for(const[i,p]of[[-4.55,-4.05],[-4.55,2.86],[-3.36,4.05],[3.36,4.05],[4.55,2.86],[4.55,-4.05]].entries())i?inner.lineTo(p[0],p[1]):inner.moveTo(p[0],p[1]);inner.closePath();b.holes.push(inner);return{b,a:ring(11.8,4.4,.35),socket:ring(12.8,5.4,.35),wall:hole(rect(30,12),13,5.6),boot:[[1.6,-3],[4,-3],[1.8,3],[1.6,3],[1.6,-3]].map(([x,y])=>new Vector2(x,y)),curve:pickUsbPose().curve};},[]);
 useLayoutEffect(()=>{const mesh=root.current?.getObjectByName('pick-usb-cable-tube')as Mesh<TubeGeometry>|undefined;if(mesh)rewriteCubeSatTube(mesh.geometry,pickUsbPose(unoWithdrawal,bankWithdrawal).curve);},[unoWithdrawal,bankWithdrawal]);
 const material=(id:string,c:string,metalness=0)=><meshStandardMaterial color={selected===id?'#c4a2ff':c} metalness={metalness} roughness={metalness?.32:.58}/>;
 const tag=(id:string,node:ReactNode,toggle=false)=><group key={id} name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);if(toggle)onToggle?.();}}>{node}</group>;
 const box=(id:string,p:P,s:P,c:string,m=0)=><mesh position={p} castShadow receiveShadow><boxGeometry args={s}/>{material(id,c,m)}</mesh>;
 const extrude=(id:string,s:Shape,x:number,c:string)=><mesh position={[x,0,0]} rotation={[0,Math.PI/2,0]} castShadow><extrudeGeometry args={[s,extrusion]}/>{material(id,c,.85)}</mesh>;
 const boot=(id:string)=><mesh position={[-21,0,0]} rotation={[0,0,Math.PI/2]} castShadow><latheGeometry args={[geo.boot,32]}/>{material(id,'#384965')}</mesh>;
 const caseId='pick-usb-bank-case';
 return <group ref={root} name="pick-usb-hardware" userData={{units:'mm'}}>
 {[-18,18].map((x,i)=>tag('pick-usb-bank-mount-'+i,<group position={[...B.at]}>{box('pick-usb-bank-mount-'+i,[x,12.4,0],[8,.8,24],'#555660')}</group>))}
 <group name="pick-usb-source-assembly"><group position={[...B.at]}>
 <group name="pick-usb-bank-body" position={[bankShift,0,0]}>
 {tag(caseId,<>{[.5,11.5].map(y=><group key={y}>{box(caseId,[0,y,0],[58,1,30],'#29334c')}</group>)}{box(caseId,[28.5,6,0],[1,10,30],'#29334c')}{[-14.5,14.5].map(z=><group key={z}>{box(caseId,[0,6,z],[57,10,1],'#29334c')}</group>)}<mesh position={[-29,6,0]} rotation={[0,Math.PI/2,0]}><extrudeGeometry args={[geo.wall,wallExtrusion]}/>{material(caseId,'#394262')}</mesh></>)}
 {tag('pick-usb-bank-switch',box('pick-usb-bank-switch',[0,6,-15.6],[10,4,1.2],on?'#9562d4':'#69748a'),true)}
 {tag('pick-usb-bank-led',<mesh position={[10,6,-15.2]}><boxGeometry args={[2,1,.4]}/><meshStandardMaterial color={selected==='pick-usb-bank-led'?'#c4a2ff':on?'#71d6b0':'#344a48'} emissive={on?'#42b58b':'#000000'} emissiveIntensity={on?.7:0}/></mesh>)}
 </group></group>
 {tag('pick-usb-bank-port',<group position={[pickUsbBankFace[0]+bankShift,pickUsbBankFace[1],pickUsbBankFace[2]]}>{extrude('pick-usb-bank-port',geo.socket,0,'#b8c2cd')}{box('pick-usb-bank-port',[4.5,-1.2,0],[9,1.2,10],'#d6cdb7')}{[-3.75,-1.25,1.25,3.75].map(z=><group key={z}>{box('pick-usb-bank-port',[3.25,-.55,z],[4.5,.1,.8],'#c6b27a',.8)}</group>)}</group>)}
 </group><group name="pick-usb-loom">
 {tag('pick-usb-cable',<mesh name="pick-usb-cable-tube" castShadow><tubeGeometry args={[geo.curve,240,1.5,12,false]}/>{material('pick-usb-cable','#384965')}</mesh>)}
 <group name="pick-usb-b-body" position={pose.uno}>
 {tag('pick-usb-b-shield',extrude('pick-usb-b-shield',geo.b,-6,'#b8c2cd'))}
 {tag('pick-usb-b-grip',<>{box('pick-usb-b-grip',[-12,0,0],[12,11,13],'#384965')}{boot('pick-usb-b-grip')}</>)}
 {tag('pick-usb-b-contacts',<>{box('pick-usb-b-contacts',[-3.5,-.5,0],[5,5.9,7.5],'#d6cdb7')}{[-3.2,2.2].map(y=><group key={y}>{box('pick-usb-b-contacts',[1.4,y,0],[4.8,.5,7.5],'#d6cdb7')}</group>)}{[-2,2].flatMap(z=>[-2.85,1.85].map(y=><group key={z+'/'+y}>{box('pick-usb-b-contacts',[1.5,y,z],[4.6,.2,.9],'#c6b27a',.8)}</group>))}</>)}
 </group>
 <group name="pick-usb-a-body" position={pose.bank}>
 {tag('pick-usb-a-shield',<group scale={[-1,1,1]}>{extrude('pick-usb-a-shield',geo.a,-4,'#b8c2cd')}</group>)}
 {tag('pick-usb-a-grip',<>{box('pick-usb-a-grip',[-12,0,0],[12,8,14],'#384965')}{boot('pick-usb-a-grip')}</>)}
 {tag('pick-usb-a-contacts',<>{box('pick-usb-a-contacts',[-1.1,.5,0],[9.8,1.7,10],'#d6cdb7')}{[-3.75,-1.25,1.25,3.75].map(z=><group key={z}>{box('pick-usb-a-contacts',[-.6,-.425,z],[8.8,.15,.8],'#c6b27a',.8)}</group>)}</>)}
 </group></group></group>;
}
export default memo(PickRoverUsb);
