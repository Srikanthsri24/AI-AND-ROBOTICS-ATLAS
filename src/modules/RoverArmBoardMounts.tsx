import{raArmAnchors}from'../data/rover-arm-anchors';
import{memo,useMemo,type ReactNode}from'react';import type{ThreeEvent}from'@react-three/fiber';import{Shape,Path}from'three';import{raArmBoardMounts}from'../data/rover-arm-electronics';
const options={fixture:{depth:6,bevelEnabled:false},post:{depth:2.2,bevelEnabled:false},washer:{depth:.4,bevelEnabled:false},head:{depth:1.4,bevelEnabled:false},nut:{depth:1.6,bevelEnabled:false}};
function hole(s:Shape,x:number,z:number,r:number){const p=new Path();p.absarc(x,-z,r,0,Math.PI*2,true);s.holes.push(p);}
function ring(outer:number,inner:number){const s=new Shape();s.absarc(0,0,outer,0,Math.PI*2,false);hole(s,0,0,inner);return s;}
function shapes(){const fixture=new Shape();fixture.moveTo(-225,-150);fixture.lineTo(85,-150);fixture.lineTo(85,90);fixture.lineTo(-225,90);fixture.closePath();for(const p of raArmBoardMounts)hole(fixture,p.x,p.z,1.2);for(const a of raArmAnchors)hole(fixture,a.x,a.z,2.2);
 const head=ring(2,0);head.holes=[];const socket=new Path();for(let n=0;n<6;n++){const a=-n*Math.PI/3;n?socket.lineTo(.87*Math.cos(a),.87*Math.sin(a)):socket.moveTo(.87,0);}socket.closePath();head.holes.push(socket);
 const nut=new Shape();for(let n=0;n<6;n++){const a=n*Math.PI/3;n?nut.lineTo(2.3*Math.cos(a),2.3*Math.sin(a)):nut.moveTo(2.3,0);}nut.closePath();hole(nut,0,0,1.05);return{fixture,post:ring(2.3,1.1),washer:ring(2.15,1.1),head,nut};}
function RoverArmBoardMounts({selected,choose,boards=['uno','pca']}:{selected:string;choose:(id:string)=>void;boards?:readonly('uno'|'pca')[]}){const s=useMemo(shapes,[]),mat=(id:string,color:string,metalness=0)=>({color:selected===id?'#c4a2ff':color,metalness,roughness:metalness ? .3 : .62});const tag=(id:string,node:ReactNode)=><group name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 const plate=(shape:Shape,id:string,x:number,y:number,z:number,opt:typeof options.post,color:string,metalness=0)=><mesh position={[x,y,z]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shape,opt]}/><meshStandardMaterial {...mat(id,color,metalness)}/></mesh>;
 return <group name="ra-board-mounts">
 {tag('ra-electronics-fixture',plate(s.fixture,'ra-electronics-fixture',0,-6,0,options.fixture,'#c3b89c'))}
 {boards.map(board=>{const posts=`ra-${board}-spacers`,bolts=`ra-${board}-fasteners`;return <group key={board}>{tag(posts,<>{raArmBoardMounts.filter(p=>p.board===board).map((p,i)=><group key={i}>{plate(s.post,posts,p.x,0,p.z,options.post,'#e3decd')}</group>)}</>)}{tag(bolts,<>{raArmBoardMounts.filter(p=>p.board===board).map((p,i)=><group key={i}><mesh position={[p.x,-2.55,p.z]}><cylinderGeometry args={[1,1,13.5,20]}/><meshStandardMaterial {...mat(bolts,'#adb7c1',.8)}/></mesh>{plate(s.washer,bolts,p.x,3.8,p.z,options.washer,'#b8c3cb',.8)}{plate(s.head,bolts,p.x,4.2,p.z,options.head,'#b8c3cb',.8)}{plate(s.nut,bolts,p.x,-7.6,p.z,options.nut,'#9eaab6',.8)}</group>)}</>)}</group>;})}
 </group>;
}
export default memo(RoverArmBoardMounts);
