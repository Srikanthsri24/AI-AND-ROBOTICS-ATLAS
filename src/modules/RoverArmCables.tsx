import{useMemo,useRef,useEffect,type ReactNode}from'react';import{useFrame,type ThreeEvent}from'@react-three/fiber';import{CatmullRomCurve3,Curve,Group,Matrix4,Path,Quaternion,Shape,TubeGeometry,Vector3}from'three';import{raArmJoints}from'../data/rover-arm-mechanics';import{raArmCableRoute,raArmChannelRise,raArmLoomLength,raArmCoilRibbonConstraints,raArmHeaderRibbonConstraints}from'../data/rover-arm-cable-route';
import{RaArmRibbonFrame}from'../data/rover-arm-ribbon';
const rows=[{id:'ground',color:'#604030',startZ:-1,endZ:8.08},{id:'power',color:'#c9483e',startZ:0,endZ:5.54},{id:'signal',color:'#dc9639',startZ:1,endZ:3}]as const;
const socketOptions={depth:11.5,bevelEnabled:false};
function socket(){const s=new Shape();s.moveTo(-1.25,-3.8);s.lineTo(1.25,-3.8);s.lineTo(1.25,3.8);s.lineTo(-1.25,3.8);s.closePath();for(const z of[-2.54,0,2.54]){const p=new Path();p.moveTo(-.75,z-.875);p.lineTo(.75,z-.875);p.lineTo(.75,z+.875);p.lineTo(-.75,z+.875);p.closePath();s.holes.push(p);}return s;}
class LoomWire extends Curve<Vector3>{
 constructor(readonly route:CatmullRomCurve3,readonly ribbon:RaArmRibbonFrame,readonly from:number,readonly to:number,readonly offset:number,readonly start:Vector3,readonly end:Vector3,readonly startDirection:Vector3,readonly endDirection:Vector3,readonly startNormal:Vector3,readonly endNormal:Vector3,readonly startRadius:number){
  super();startDirection.normalize();endDirection.normalize();startNormal.normalize();endNormal.normalize();this.startDelta=start.clone().sub(route.getPointAt(from));this.endDelta=end.clone().sub(route.getPointAt(to));
 }
 readonly startDelta:Vector3;readonly endDelta:Vector3;
 centre(t:number,target=new Vector3()){
  const u=this.from+(this.to-this.from)*t;this.route.getPointAt(u,target);const blendStart=Math.max(0,1-t/.06),blendEnd=Math.max(0,1-(1-t)/.06);if(blendStart)target.addScaledVector(this.startDelta,blendStart*blendStart*(3-2*blendStart));if(blendEnd)target.addScaledVector(this.endDelta,blendEnd*blendEnd*(3-2*blendEnd));
  const length=(this.to-this.from)*raArmLoomLength;
  for(const atStart of[true,false]){const distance=atStart?t:1-t;if(distance>=.06)continue;const u=Math.min(1,Math.max(0,(distance-.025)/.035)),blend=u*u*(3-2*u),line=(atStart?this.start:this.end).clone().addScaledVector(atStart?this.startDirection:this.endDirection,(atStart?t:t-1)*length);target.lerp(line,1-blend);}
  return target;
 }
 sample(t:number,centreTarget:Vector3,normalTarget:Vector3){
  const u=this.from+(this.to-this.from)*t,tangent=this.centre(Math.min(1,t+1e-5)).sub(this.centre(Math.max(0,t-1e-5))).normalize(),routeTangent=this.route.getTangentAt(u),normal=this.ribbon.normal(u,normalTarget,routeTangent).applyQuaternion(new Quaternion().setFromUnitVectors(routeTangent,tangent));
  // Rotate unit ribbon directions; blending complete offset positions can
  // collapse opposing rows through one another beside a connector.
  for(const atStart of[true,false]){const distance=atStart?t:1-t;if(distance>=.06)continue;const q=Math.min(1,Math.max(0,(distance-.025)/.035)),blend=1-q*q*(3-2*q),desired=(atStart?this.startNormal:this.endNormal).clone();desired.addScaledVector(tangent,-desired.dot(tangent)).normalize();normal.applyQuaternion(new Quaternion().slerp(new Quaternion().setFromUnitVectors(normal,desired),blend));}
  const spread=Math.max(0,1-t/.1),finish=Math.max(0,1-(1-t)/.1),serviceRadius=this.offset/2,radius=serviceRadius+(this.startRadius-serviceRadius)*spread*spread*(3-2*spread)+(this.offset-serviceRadius)*finish*finish*(3-2*finish);
  this.centre(t,centreTarget);return radius;
 }
 getPoint(t:number,target=new Vector3()){const normal=new Vector3(),radius=this.sample(t,target,normal);return target.addScaledVector(normal,radius);
 }
}
/** Geometry buffers stay allocated while the route is recomputed for changed
 * joint transforms. This prototype requires all six servos and one board in the
 * same millimetre-scale parent; source frames are read from the actual meshes. */
export default function RoverArmCables({selected,choose,seating}:{selected:string;choose:(id:string)=>void;seating?:readonly(number|null)[]}){const root=useRef<Group>(null),signature=useRef(''),routeKeys=useRef<string[]>([]),shape=useMemo(socket,[]),segments=240,sides=8;
 const initial=useMemo(()=>new CatmullRomCurve3([new Vector3(),new Vector3(1,0,0)]),[]);
 const spanCentres=useMemo(()=>Array.from({length:241},()=>new Vector3()),[]),spanNormals=useMemo(()=>Array.from({length:241},()=>new Vector3()),[]),spanRadii=useMemo(()=>new Float64Array(241),[]);
 const centres=useMemo(()=>Array.from({length:241},()=>new Vector3()),[]),tangentBuffer=useMemo(()=>new Vector3(),[]),normalBuffer=useMemo(()=>new Vector3(),[]),binormalBuffer=useMemo(()=>new Vector3(),[]),previousTangent=useMemo(()=>new Vector3(),[]),transport=useMemo(()=>new Quaternion(),[]);
 const geometries=useMemo(()=>Array.from({length:36},()=>new TubeGeometry(initial,segments,.45,sides,false)),[initial]);useEffect(()=>()=>geometries.forEach(g=>g.dispose()),[geometries]);
 useFrame(()=>{const parent=root.current?.parent;if(!parent||!root.current)return;parent.updateWorldMatrix(true,true);const servos=raArmJoints.map(j=>parent.getObjectByName('ra-arm-'+j.id+'-servo')),board=parent.getObjectByName('ra-pca-model');if(servos.some(s=>!s)||!board)return;
 const key=JSON.stringify(seating??[])+'|'+[...servos,board].map(o=>o!.matrixWorld.elements.join(',')).join('|');if(key===signature.current)return;signature.current=key;const updateStart=performance.now();
 const local=(o:Group|typeof board,p:Vector3)=>root.current!.worldToLocal(o.localToWorld(p));
 for(let ch=0;ch<6;ch++){
  if(seating?.[ch]===null){routeKeys.current[ch]='';delete root.current.userData['route'+ch];continue;}const withdrawal=seating?.[ch]??0;
  const routeKey=String(withdrawal)+'|'+[...servos.slice(0,ch+1),board].map(o=>o!.matrixWorld.elements.join(',')).join('|');if(routeKeys.current[ch]===routeKey)continue;routeKeys.current[ch]=routeKey;
  // Authored front/rear lanes keep the loose leads separate. The gripper
  // returns around the front/left; the pitch and roll leads use rear lanes.
  // Fixed base-frame guides align each input with its storage layer.
  const source=servos[ch]!,start=local(source,new Vector3(32.8,-35.4,0)),exit=local(source,new Vector3(45,-35.4,0)),guides=[];for(let j=ch;j>=0;j--){if(j!==ch&&j!==0)continue;guides.push(local(servos[j]!,new Vector3(ch===5&&j===0?-80:46+ch*10-(ch===4&&j===4?40:0),j===0?(ch>0?raArmChannelRise(ch)-41:-25):j>=1&&j<=3?(ch===3?-100:ch===2?-80:-55):ch===4?10:-25,(j>=1&&j<=3?18+ch*8:ch===5?40:ch===4?(j===0?-145:-140):ch===3&&j===0?-120:ch===2&&j===0?-110:-18-ch*8))));}
  const end=local(board,new Vector3(-23+ch*2.54,14.9+withdrawal,5.54)),curve=raArmCableRoute(start,exit,guides,end,ch),arcLengths=curve.getLengths(4096),ribbon=new RaArmRibbonFrame(curve,local(source,new Vector3(32.8,-35.4,1)).sub(start),local(board,new Vector3(-23+ch*2.54,14.9+withdrawal,4.54)).sub(end),[...raArmCoilRibbonConstraints(curve,arcLengths),...raArmHeaderRibbonConstraints(curve,local(board,new Vector3(-23+ch*2.54,14.9+withdrawal,4.54)).sub(end),arcLengths)]),joint=curve.getPointAt(320/raArmLoomLength),tangent=curve.getTangentAt(320/raArmLoomLength),normal=ribbon.normal(320/raArmLoomLength);root.current.userData['route'+ch]={length:curve.getLength(),start:start.toArray(),end:end.toArray()};
  const sourceNormal=local(source,new Vector3(32.8,-35.4,1)).sub(start).normalize(),boardNormal=local(board,new Vector3(-23+ch*2.54,14.9+withdrawal,4.54)).sub(end).normalize();
  // Position and ribbon orientation are shared by the three conductors.
  // Only their signed distance from the centreline differs.
  for(let half=0;half<2;half++){
   const coupled=joint.clone().addScaledVector(tangent,half?12:-12),path=new LoomWire(curve,ribbon,half?(320+12)/raArmLoomLength:0,half?1:(320-12)/raArmLoomLength,2.54,half?coupled:start,half?end:coupled,half?tangent:exit.clone().sub(start),half?local(board,new Vector3(-23+ch*2.54,13.9+withdrawal,5.54)).sub(end):tangent,half?normal:sourceNormal,half?boardNormal:normal,half?2.54:1);
   for(let i=0;i<=segments;i++)spanRadii[i]=path.sample(i/segments,spanCentres[i],spanNormals[i]);
   for(let r=0;r<3;r++){
    const g=geometries[ch*6+r*2+half],pos=g.attributes.position,norm=g.attributes.normal;
    for(let i=0;i<=segments;i++)centres[i].copy(spanCentres[i]).addScaledVector(spanNormals[i],spanRadii[i]*rows[r].startZ);
    for(let i=0;i<=segments;i++){const p=centres[i],t=tangentBuffer.copy(centres[Math.min(segments,i+1)]).sub(centres[Math.max(0,i-1)]).normalize(),n=normalBuffer;if(i===0){n.set(-t.z,0,t.x);if(n.lengthSq()<1e-8)n.set(1,0,0);n.normalize();}else n.applyQuaternion(transport.setFromUnitVectors(previousTangent,t)).addScaledVector(t,-n.dot(t)).normalize();previousTangent.copy(t);const b=binormalBuffer.crossVectors(t,n).normalize();for(let k=0;k<=sides;k++){const angle=k/sides*Math.PI*2,c=-Math.cos(angle),s=Math.sin(angle),nx=n.x*c+b.x*s,ny=n.y*c+b.y*s,nz=n.z*c+b.z*s,at=i*(sides+1)+k;pos.setXYZ(at,p.x+nx*.45,p.y+ny*.45,p.z+nz*.45);norm.setXYZ(at,nx,ny,nz);}}pos.needsUpdate=norm.needsUpdate=true;g.computeBoundingBox();g.computeBoundingSphere();
   }
  }
  const coupling=root.current.getObjectByName('ra-arm-cable-'+ch+'-extension')!;coupling.position.copy(joint);coupling.quaternion.setFromRotationMatrix(new Matrix4().makeBasis(new Vector3().crossVectors(tangent,normal).normalize(),tangent,normal));
  const plug=root.current.getObjectByName('ra-arm-cable-'+ch+'-plug')!;plug.position.copy(local(board,new Vector3(-23+ch*2.54,3.4+withdrawal,5.54)));const q=board.getWorldQuaternion(new Quaternion()),own=root.current.getWorldQuaternion(new Quaternion()).invert();plug.quaternion.copy(own.multiply(q));
 }
 root.current.userData.updateMs=performance.now()-updateStart;
 });
 const mat=(id:string,color:string,metalness=0)=>({color:selected===id?'#c4a2ff':color,metalness,roughness:.45}),tag=(id:string,node:ReactNode)=><group key={id} name={id} userData={{partId:id}} onClick={(e:ThreeEvent<MouseEvent>)=>{e.stopPropagation();choose(id);}}>{node}</group>;
 return <group ref={root} name="ra-arm-cables">{Array.from({length:6},(_,ch)=>seating?.[ch]===null?null:<group key={ch}>{rows.map((row,r)=>{const id=`ra-arm-cable-${ch}-${row.id}`;return tag(id,<>{[0,1].map(half=><mesh key={half} geometry={geometries[ch*6+r*2+half]}><meshStandardMaterial {...mat(id,row.color)}/></mesh>)}</>);})}{tag(`ra-arm-cable-${ch}-extension`,<>{[-1,1].map(side=><mesh key={side} position={[0,side<0?-12:.5,0]} rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shape,socketOptions]}/><meshStandardMaterial {...mat(`ra-arm-cable-${ch}-extension`,'#282d35')}/></mesh>)}{[-2.54,0,2.54].map(z=><mesh key={z} position={[0,0,z]}><boxGeometry args={[.64,3,.64]}/><meshStandardMaterial {...mat(`ra-arm-cable-${ch}-extension`,'#bba66c',.8)}/></mesh>)}</>)}{tag(`ra-arm-cable-${ch}-plug`,<><mesh rotation={[-Math.PI/2,0,0]}><extrudeGeometry args={[shape,socketOptions]}/><meshStandardMaterial {...mat(`ra-arm-cable-${ch}-plug`,'#252a31')}/></mesh>{[-2.54,0,2.54].map(z=><group key={z}>{[-1,1].map(side=><mesh key={side} position={[side*.4,5,z]}><boxGeometry args={[.16,9,1.35]}/><meshStandardMaterial {...mat(`ra-arm-cable-${ch}-plug`,'#c1ad78',.8)}/></mesh>)}</group>)}</>)}</group>)}</group>;
}
