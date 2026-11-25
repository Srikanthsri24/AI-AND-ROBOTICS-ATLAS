import type {} from '@react-three/fiber';
import {useEffect,useMemo,type ReactNode} from 'react';
import {Text} from '@react-three/drei';
import {CanvasTexture,RepeatWrapping,SRGBColorSpace,Shape,Path} from 'three';
import {emergencyCorridor as d,emergencyLampMounts,emergencySensorStand as stand,type EmergencyPoint as P} from '../data/emergency-corridor';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
export default function EmergencyCorridorParts({selected='',select=()=>{}}:{selected?:string;select?:(id:string)=>void}){
 const paper=useMemo(()=>{const canvas=document.createElement('canvas');canvas.width=canvas.height=128;const context=canvas.getContext('2d');if(!context)return null;const image=context.createImageData(128,128);let seed=7907;for(let i=0;i<image.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const value=225+(seed%31);image.data[i]=image.data[i+1]=image.data[i+2]=value;image.data[i+3]=255;}context.putImageData(image,0,0);const texture=new CanvasTexture(canvas);texture.wrapS=texture.wrapT=RepeatWrapping;texture.repeat.set(8,4);texture.colorSpace=SRGBColorSpace;return texture;},[]);
 useEffect(()=>()=>paper?.dispose(),[paper]);
 const shapes=useMemo(()=>{const rectangle=(w:number,h:number)=>{const s=new Shape();s.moveTo(-w/2,-h/2);s.lineTo(w/2,-h/2);s.lineTo(w/2,h/2);s.lineTo(-w/2,h/2);s.closePath();return s;},bore=(s:Shape,x:number,y:number,r:number)=>{const p=new Path();p.absarc(x,y,r,0,Math.PI*2,true);s.holes.push(p);};
  const carrier=rectangle(18,22);for(const x of[-1.27,1.27])bore(carrier,x,-3,.45);
  const head=rectangle(20,22);for(const x of[-1.27,1.27])bore(head,x,-7,.45);
  const post=new Shape();post.absarc(0,0,stand.postOuter,0,Math.PI*2,false);bore(post,0,0,stand.postInner);
  const exit=new Shape();for(const [i,[x,y]]of[[-75,0],[-30,0],[-30,80],[30,80],[30,0],[75,0],[75,100],[-75,100]].entries()){if(i===0)exit.moveTo(x,y);else exit.lineTo(x,y);}exit.closePath();
  const arrow=new Shape();for(const[i,[x,y]]of[[-9,-3],[3,-3],[3,-7],[12,0],[3,7],[3,3],[-9,3]].entries()){if(i===0)arrow.moveTo(x,y);else arrow.lineTo(x,y);}arrow.closePath();
  return{carrier,head,post,exit,arrow};},[]);
 const color=(id:string,c:string)=>id===selected?'#b48bec':c,owner=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const box=(id:string,p:P,size:P,c:string,kraft=false)=><mesh key={id+p.join(',')} position={p} castShadow receiveShadow><boxGeometry args={size}/><meshStandardMaterial color={color(id,c)} roughness={kraft?.93:.65} map={kraft?paper:null}/></mesh>;
 const profile=(id:string,shape:Shape,p:P,depth:number,c:string,rotation:P=[0,0,0],kraft=true)=><mesh key={id+p.join(',')} position={p} rotation={rotation} castShadow receiveShadow><extrudeGeometry args={[shape,{depth,bevelEnabled:false,curveSegments:48}]}/><meshStandardMaterial color={color(id,c)} roughness={kraft?.93:.65} map={kraft?paper:null}/></mesh>;
 return <group name="emergency-corridor-mm">
 {owner('emergency-bench',box('emergency-bench',[0,-7,0],d.bench,'#424b64'))}
 {owner('emergency-floor',<>{box('emergency-floor',d.floor.at,[460,2.4,150],'#b69d7b',true)}{box('emergency-floor',[20,3.15,-50],[460,.3,150],'#c5a983',true)}{box('emergency-floor',[20,5.85,-50],[460,.3,150],'#cbb18a',true)}</>)}
 {owner('emergency-back-wall',<>{box('emergency-back-wall',d.back.at,[463,100,2.4],'#b69a74',true)}{box('emergency-back-wall',[21.5,56,-125.15],[463,100,.3],'#c5a983',true)}{box('emergency-back-wall',[21.5,56,-127.85],[463,100,.3],'#c5a983',true)}{Array.from({length:93},(_,i)=>box('emergency-back-wall',[-208+i*5,106.05,-126.5],[1.6,.1,2.4],'#8f775b'))}</>)}
 {owner('emergency-exit-wall',profile('emergency-exit-wall',shapes.exit,d.exitAt,3,'#bea37d',[0,Math.PI/2,0]))}
 {owner('emergency-route',<>{[-140,-40,60,160].map(x=>profile('emergency-route',shapes.arrow,[x,6.025,-40],.025,'#516d60',[-Math.PI/2,0,0],false))}</>)}
 {owner('emergency-exit-sign',<>{box('emergency-exit-sign',[253.3,96,-50],[.5,12,52],'#3e6b58')}<Text position={[253.6,96,-50]} rotation={[0,Math.PI/2,0]} font={font} fontSize={6} color="#f5f4e5" raycast={()=>null}>EXIT →</Text></>)}
 {emergencyLampMounts.map(m=>{const id='emergency-'+m.key+'-carrier',height=m.top-6,gusset=new Shape();gusset.moveTo(0,0);gusset.lineTo(0,height-2);gusset.lineTo(-20,height-2);gusset.closePath();return owner(id,<>{box(id,[m.x,6+height/2,-124],[18,height,2],'#b89b75',true)}{profile(id,shapes.carrier,[m.x,m.top-2,-112],2,'#c8ad87',[-Math.PI/2,0,0])}{[-8,6].map(dx=>profile(id,gusset,[m.x+dx,6,-123],2,'#aa8c69',[0,Math.PI/2,0]))}<Text position={[m.x,m.top+.08,-118]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={2.2} color="#57416a" raycast={()=>null}>{m.pin} · {m.key==='beacon'?'RED':'WHITE'}</Text></>);})}
 {owner('emergency-sensor-base',box('emergency-sensor-base',[-245,2,-90],[25,4,25],'#786b5b'))}
 {owner('emergency-sensor-post',profile('emergency-sensor-post',shapes.post,[-245,stand.postBottom,-90],stand.postTop-stand.postBottom,'#b69a74',[-Math.PI/2,0,0]))}
 {owner('emergency-sensor-headplate',<>{profile('emergency-sensor-headplate',shapes.head,[-245,125,-90],3,'#c8ad87',[-Math.PI/2,0,0])}<Text position={[-245,128.1,-95]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={2.4} color="#57416a" raycast={()=>null}>A0 · LIGHT</Text></>)}
 </group>;
}
