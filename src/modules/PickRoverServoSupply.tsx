import{memo,useMemo,type ReactNode}from'react';
import type{ThreeEvent}from'@react-three/fiber';
import{Text}from'@react-three/drei';
import{Shape,Path}from'three';
import{pickServoSupply as S}from'../data/pick-rover-servo-supply';
const rearOptions={depth:1,bevelEnabled:false},topOptions={depth:1,bevelEnabled:false},collarOptions={depth:1.5,bevelEnabled:false},socketOptions={depth:4,bevelEnabled:false};
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
function cpu(t:{gpuAccelerateSDF:boolean}|null){if(t)t.gpuAccelerateSDF=false;}
function rect(w:number,h:number,x=0,y=0){const s=new Shape();s.moveTo(x-w/2,y-h/2);s.lineTo(x+w/2,y-h/2);s.lineTo(x+w/2,y+h/2);s.lineTo(x-w/2,y+h/2);s.closePath();return s;}
function ring(outer:number,inner:number){const s=new Shape();s.absarc(0,0,outer,0,Math.PI*2,false);const h=new Path();h.absarc(0,0,inner,0,Math.PI*2,true);s.holes.push(h);return s;}
function PickRoverServoSupply({selected,choose,on=false,onToggle,assemblyLift=0}:{selected:string;choose:(id:string)=>void;on?:boolean;onToggle?:()=>void;assemblyLift?:number}){
 const shapes=useMemo(()=>{const rear=rect(58,18,0,10),top=rect(60,38);for(const x of[-7,7]){const h=new Path();h.absarc(x,10,2.3,0,Math.PI*2,true);rear.holes.push(h);}for(const x of[-18,-14,-10,-6,6,10,14,18]){const h=new Path();h.moveTo(x-.55,7);h.lineTo(x+.55,7);h.lineTo(x+.55,14);h.lineTo(x-.55,14);h.closePath();top.holes.push(h);}return{rear,top,collar:ring(3,2.25),socket:ring(2.2,1.6)};},[]);
 const mat=(id:string,color:string,metalness=0)=>({color:selected===id?'#c4a2ff':color,metalness,roughness:.48}),tag=(id:string,node:ReactNode,toggle=false)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);if(toggle)onToggle?.();}}>{node}</group>,box=(id:string,p:[number,number,number],size:[number,number,number],color:string)=><mesh position={p}><boxGeometry args={size}/><meshStandardMaterial {...mat(id,color)}/></mesh>,id='pick-servo-supply-case';
 return <group name="pick-servo-supply" position={[...S.at]} userData={{units:'mm',authoredTeachingGeometry:true}}>
 {[-18,18].map((x,i)=>tag('pick-servo-supply-mount-'+i,box('pick-servo-supply-mount-'+i,[x,-.4,0],[8,.8,32],'#555660')))}
 <group name="pick-servo-supply-body" position={[0,assemblyLift,0]}>
 {tag(id,<>{box(id,[0,.5,0],[60,1,38],'#26314b')}{[-1,1].map(side=><group key={side}>{box(id,[side*29.5,10,0],[1,18,38],'#26314b')}{side<0&&box(id,[0,10,-18.5],[58,18,1],'#26314b')}</group>)}<mesh position={[0,0,18]}><extrudeGeometry args={[shapes.rear,rearOptions]}/><meshStandardMaterial {...mat(id,'#26314b')}/></mesh><mesh position={[0,19,0]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shapes.top,topOptions]}/><meshStandardMaterial {...mat(id,'#394262')}/></mesh><Text ref={cpu} raycast={()=>null} font={font} position={[0,20.04,3]} rotation={[-Math.PI/2,0,0]} fontSize={3} color="#e9e2f7">SERVO · 6 V</Text><Text ref={cpu} raycast={()=>null} font={font} position={[0,20.04,8]} rotation={[-Math.PI/2,0,0]} fontSize={1.6} color="#b8c3dd">REGULATED DC SOURCE</Text></>)}
 {tag('pick-servo-supply-switch',<>{box('pick-servo-supply-switch',[-22,20.5,-1],[10,1,6],'#151e30')}{box('pick-servo-supply-switch',[-22+(on?2:-2),21.7,-1],[4,1.4,4],on?'#9562d4':'#69748a')}</>,true)}
 {tag('pick-servo-supply-led',<mesh position={[22,20.15,-1]}><cylinderGeometry args={[1,1,.3,24]}/><meshStandardMaterial {...mat('pick-servo-supply-led',on?'#71d6b0':'#344a48')} emissive={on?'#42b58b':'#000000'} emissiveIntensity={on?.7:0}/></mesh>)}
 {(['positive','negative']as const).map((p,i)=>{const key='pick-servo-supply-'+p;return tag(key,<group position={[-7+i*14,10,0]}><mesh position={[0,0,19]}><extrudeGeometry args={[shapes.collar,collarOptions]}/><meshStandardMaterial {...mat(key,i?'#252d3b':'#bf555a')}/></mesh><mesh position={[0,0,15.5]}><extrudeGeometry args={[shapes.socket,socketOptions]}/><meshStandardMaterial {...mat(key,'#b8a775',.8)}/></mesh>{[0,1,2].map(n=><group key={n} rotation={[0,0,n*Math.PI*2/3]}><mesh position={[1.58,0,17.5]}><boxGeometry args={[.12,.8,3]}/><meshStandardMaterial {...mat(key,'#b8a775',.8)}/></mesh></group>)}<Text ref={cpu} raycast={()=>null} font={font} position={[0,-5,19.1]} fontSize={3} color={i?'#e0e7f2':'#efb9c7'}>{i?'−':'+'}</Text></group>);})}
 </group></group>;
}
export default memo(PickRoverServoSupply);
