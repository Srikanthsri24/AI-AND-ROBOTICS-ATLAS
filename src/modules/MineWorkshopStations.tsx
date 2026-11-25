import type {} from '@react-three/fiber';
import { useMemo, type ReactNode } from 'react';
import { Text } from '@react-three/drei';
import { CatmullRomCurve3, Shape, Path, Vector3 } from 'three';
import { mineRouteFraction } from '../data/mine-workshop-assembly';
import { mineStations, type MinePoint as P } from '../data/mine-workshop-layout';
import { mineBeaconState, type MineSession, type MineInputs } from '../data/mine-workshop';
import { mineStationDisplay, mineConsoleLines, mineRuleAt, mineConsoleAt, mineBeaconAt, mineLogicalRoutes } from '../data/mine-workshop-stations';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
export default function MineWorkshopStations({selected='',select=()=>{},session,input,powered=false,assembly=7}:{selected?:string;select?:(id:string)=>void;session:MineSession;input:MineInputs;powered?:boolean;assembly?:number}){
 const c=(id:string,color:string)=>id===selected?'#b48bec':color;
 const owner=(id:string,children:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{children}</group>;
 const box=(id:string,at:P,size:P,color:string,metal=0)=><mesh key={id+at.join(',')} position={at} castShadow receiveShadow={!/-(gas|vent|screen|display|source-name)$/.test(id)}><boxGeometry args={size}/><meshStandardMaterial color={c(id,color)} roughness={metal?.36:.6} metalness={metal}/></mesh>;
 const cyl=(id:string,at:P,r:number,h:number,color:string)=><mesh key={id+at.join(',')} position={at} castShadow><cylinderGeometry args={[r,r,h,32]}/><meshStandardMaterial color={c(id,color)} metalness={.65} roughness={.35}/></mesh>;
 const text=(at:P,value:string,size=.035,color='#e6e6f6')=><Text position={at} font={font} fontSize={size} color={color} textAlign="center" raycast={()=>null}>{value}</Text>;
 const portShape=useMemo(()=>{const s=new Shape();s.moveTo(-.045,-.025);s.lineTo(.045,-.025);s.lineTo(.045,.025);s.lineTo(-.045,.025);s.closePath();const h=new Path();h.moveTo(-.032,-.014);h.lineTo(-.032,.014);h.lineTo(.032,.014);h.lineTo(.032,-.014);h.closePath();s.holes.push(h);return s;},[]);
 const port=(id:string,at:P)=><group key={at.join(',')} position={at}><mesh><extrudeGeometry args={[portShape,{depth:.014,bevelEnabled:false}]}/><meshStandardMaterial color={c(id,'#a2afbd')} metalness={.6} roughness={.35}/></mesh>{box(id,[0,0,-.017],[.072,.035,.012],'#172b40')}</group>;
 const beacon=mineBeaconState(session),pulse=beacon.pulseHz===0?1:.25+.75*(.5+.5*Math.sin(session.nowMs/1000*Math.PI*2*beacon.pulseHz));
 const remote=mineConsoleLines(session);
 return <group name="mine-station-system">
 {owner('mine-equipment-shelf',box('mine-equipment-shelf',[0,-.015,1.4],[6.7,.07,.65],'#636c7c'))}
 {mineStations.map(({key,name,at})=>{const id=(part:string)=>`mine-${key}-${part}`,v=mineStationDisplay(input,key);return <group key={key} position={at}>
  {owner(id('pedestal'),<>{box(id('pedestal'),[0,.035,0],[.42,.07,.38],'#66788c',.5)}{box(id('pedestal'),[0,.32,0],[.075,.52,.08],'#8493a3',.6)}{box(id('pedestal'),[0,.56,0],[.37,.035,.19],'#728294',.6)}</>)}
  {owner(id('housing'),<>{box(id('housing'),[0,.8,0],[.48,.45,.24],'#bd9158',.2)}{box(id('housing'),[0,.8,.126],[.45,.42,.012],'#d2a96c',.2)}{box(id('housing'),[0,.8,.134],[.405,.36,.004],'#293748')}</>)}
  {owner(id('fasteners'),<>{[-.211,.211].flatMap(x=>[.615,.985].map(y=><group key={x+'/'+y} position={[x,y,.138]} rotation={[Math.PI/2,0,0]}>{cyl(id('fasteners'),[0,0,0],.013,.008,'#a7b2be')}{box(id('fasteners'),[0,.0044,0],[.016,.001,.002],'#344153')}</group>))}</>)}
  {owner(id('source-name'),<>{[-.18,.18].map(x=>box(id('source-name'),[x,1.033,.02],[.02,.02,.016],'#61728b'))}{box(id('source-name'),[0,1.065,.02],[.48,.052,.012],'#353e54')}{text([0,1.067,.027],name.toUpperCase(),.033)}{text([0,1.12,.02],'SYNTHETIC STATION',.024,'#493e6d')}</>)}
  {(['gas','vent'] as const).map((kind,i)=>{const y=.878-i*.16,val=kind==='gas'?v.reading.gas:v.reading.ventilation,label=kind==='gas'?'GAS INDEX':'VENT INDEX',color=val===null?'#f3bc62':(kind==='gas'?val>=70:val<=30)?'#fb7d8f':'#69d9b1',bar=Math.max(.002,(val??0)/100*.315);return owner(id(kind),<>{box(id(kind),[0,y,.141],[.365,.135,.01],'#152b3f')}{text([-.075,y+.038,.148],label,.024,'#b6c8e2')}{text([.09,y+.031,.148],powered?(kind==='gas'?v.gas:v.vent):'OFF',.027,powered?color:'#8b9aaf')}{box(id(kind),[-.1575+bar/2,y-.025,.149],[bar,.019,.003],powered?color:'#344455')}{text([0,y-.052,.15],kind==='gas'?'ALARM ≥ 70':'ALARM ≤ 30',.018,'#bac8dd')}</>);})}
  {owner(id('source-port'),<>{port(id('source-port'),[0,.61,.143])}{text([0,.577,.16],'SOURCE → LOCAL',.024,'#5a4a7e')}</>)}
 </group>;})}
 <group position={mineRuleAt}>
 {owner('mine-rule-body',<>{box('mine-rule-body',[0,.25,0],[.88,.5,.3],'#596b83',.4)}{box('mine-rule-body',[0,.25,.154],[.83,.45,.012],'#c1cad4',.5)}{box('mine-rule-body',[0,.25,.163],[.77,.39,.006],'#27364f')}</>)}
 {owner('mine-rule-display',<>{box('mine-rule-display',[0,.32,.17],[.69,.24,.008],'#17273b')}{text([0,.4,.177],'LOCAL RULE · BOTH SOURCES',.029)}{text([0,.32,.177],powered?session.local.toUpperCase():'POWER OFF',.043,powered?beacon.color:'#a8b5cc')}{text([0,.25,.177],'GAS ≥ 70  OR  VENT ≤ 30',.027)}</>)}
 {owner('mine-rule-keys',<>{[-.22,0,.22].map((x,i)=><group key={i}>{box('mine-rule-keys',[x,.105,.18],[.15,.045,.022],['#74559e','#5e7892','#5e7892'][i])}{text([x,.105,.193],['TRAIN','LOCAL','COPY'][i],.021)}</group>)}</>)}
 {owner('mine-rule-ports',<>{[-.22,.22].map((x,i)=><group key={i} position={[x,.21,-.155]} rotation={[0,Math.PI,0]}>{port('mine-rule-ports',[0,0,0])}{text([0,.055,.016],i===0?'ENTRY':'FACE',.022)}</group>)}<group position={[-.44,.21,0]} rotation={[0,-Math.PI/2,0]}>{port('mine-rule-ports',[0,0,0])}{text([0,.055,.016],'COPY',.022)}</group></>)}
 </group>
 <group position={mineBeaconAt}>
 {owner('mine-beacon-base',<>{cyl('mine-beacon-base',[0,.035,0],.18,.07,'#4a5d74')}{cyl('mine-beacon-base',[0,.086,0],.145,.034,'#8e9cad')}{cyl('mine-beacon-base',[0,.108,0],.13,.01,'#8e9cad')}{text([0,.025,.184],'LOCAL BEACON',.026,'#e6e6f6')}</>)}
 {owner('mine-beacon-cage',<>{[-1,1].flatMap(x=>[-1,1].map(z=>cyl('mine-beacon-cage',[x*.112,.285,z*.112],.009,.38,'#a7b4c3')))}</>)}
 {owner('mine-beacon-lens',<mesh name="mine-live-beacon-lens" position={[0,.285,0]}><cylinderGeometry args={[.125,.125,.35,48]}/><meshPhysicalMaterial color={c('mine-beacon-lens',powered?beacon.color:'#7c8794')} emissive={powered?beacon.color:'#000000'} emissiveIntensity={powered?pulse*1.35:0} roughness={.22} clearcoat={.8}/></mesh>)}
 {owner('mine-beacon-cap',<>{cyl('mine-beacon-cap',[0,.46,0],.14,.012,'#4a5d74')}{cyl('mine-beacon-cap',[0,.48,0],.17,.036,'#4a5d74')}{cyl('mine-beacon-cap',[0,.505,0],.145,.014,'#8193aa')}</>)}
 </group>
 <group position={mineConsoleAt}>
 {owner('mine-console-stand',<>{box('mine-console-stand',[0,.025,0],[.94,.05,.49],'#70829b',.5)}{box('mine-console-stand',[0,.23,-.18],[.085,.4,.07],'#8798ad',.6)}<mesh position={[0,.43,-.17]} rotation={[0,0,Math.PI/2]} castShadow><cylinderGeometry args={[.045,.045,.2,32]}/><meshStandardMaterial color={c('mine-console-stand','#8193aa')} metalness={.65} roughness={.35}/></mesh></>)}
 {owner('mine-console-body',<>{box('mine-console-body',[0,.66,-.11],[1.03,.64,.075],'#52657e',.4)}{box('mine-console-body',[0,.66,-.069],[.97,.58,.008],'#253850')}{box('mine-console-body',[.47,.1,-.05],[.07,.14,.09],'#52657e',.4)}<group position={[.505,.1,-.05]} rotation={[0,Math.PI/2,0]}>{port('mine-console-body',[0,0,0])}</group>{text([0,1.02,-.08],'REMOTE OBSERVER',.037,'#493e6d')}</>)}
 {owner('mine-console-keys',<>{Array.from({length:4},(_,row)=>Array.from({length:13},(_,col)=>box('mine-console-keys',[(col-6)*.058,.057,-.135+row*.055],[.047,.014,.04],'#30445e')))}{box('mine-console-keys',[0,.053,.15],[.24,.006,.09],'#9aabc0')}</>)}
 {owner('mine-console-screen',<>{box('mine-console-screen',[0,.66,-.063],[.91,.52,.004],'#11243b')}{text([0,.86,-.059],powered?remote.status.toUpperCase():'OBSERVER WAITING',.043,remote.status==='Fresh'?'#75dcbb':'#f5bd75')}{(powered?remote.lines:['NO COPIED RECORD','SYNTHETIC TRAINING DATA','','']).map((line,i)=><group key={i}>{text([0,.76-i*.083,-.059],line,.032,i===2?'#e5d5fa':'#c3d0e5')}</group>)}{text([0,.43,-.059],'GAS / VENT · 0–100 INDICES',.023,'#9fb3d1')}</>)}
 </group>
 {mineLogicalRoutes.map(route=><MineLogicalPath key={route.id} route={route} selected={selected===route.id} active={powered&&(route.id!=='mine-path-remote'||input.link)} timeMs={session.nowMs} fraction={mineRouteFraction(assembly)} select={()=>select(route.id)}/>)}
 </group>;
}
function MineLogicalPath({route,selected,active,timeMs,fraction,select}:{route:typeof mineLogicalRoutes[number];selected:boolean;active:boolean;timeMs:number;fraction:number;select:()=>void}){
 const full=useMemo(()=>new CatmullRomCurve3(route.points.map(p=>new Vector3(...p)),false,'centripetal'),[route]);
 const curve=useMemo(()=>new CatmullRomCurve3(Array.from({length:41},(_,i)=>full.getPoint(i/40*Math.max(.00001,fraction))),false,'centripetal'),[full,fraction]);
 const dash=useMemo(()=>Array.from({length:30},(_,i)=>[curve.getPoint(i/30),curve.getPoint((i+.55)/30)]).flat().flatMap(p=>p.toArray()),[curve]);
 const color=selected?'#b48bec':active?'#4e9cba':'#9c8ba9';
 return <group userData={{partId:route.id}} onClick={e=>{e.stopPropagation();select();}}>
 <mesh><tubeGeometry args={[curve,80,.017,8,false]}/><meshStandardMaterial color={color} transparent opacity={.18} depthWrite={false}/></mesh>
 <lineSegments raycast={()=>null}><bufferGeometry><bufferAttribute attach="attributes-position" args={[new Float32Array(dash),3]}/></bufferGeometry><lineBasicMaterial color={color}/></lineSegments>
 {active&&[0,.33,.66].map((offset,i)=><mesh name={route.id+'-packet-'+i} key={i} position={curve.getPoint((timeMs/1600+offset)%1)} raycast={()=>null}><sphereGeometry args={[.024,12,8]}/><meshStandardMaterial color={selected?'#b48bec':'#7dc6df'} emissive="#4e91b1" emissiveIntensity={.5}/></mesh>)}
 </group>;
}
