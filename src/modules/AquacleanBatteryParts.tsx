import{memo,useMemo,type ReactNode}from'react';
import{Text}from'@react-three/drei';
import{CatmullRomCurve3,Vector3}from'three';
import{aquaBatteryAt as at,aquaCells as cells,aquaSeriesLinks as links}from'../data/aquaclean-battery';
const font=new URL('./fonts/NotoSans-Regular.ttf',document.baseURI).href;
type P=[number,number,number];
function AquacleanBatteryParts({selected,select,motorPower=false}:{selected:string;select:(id:string)=>void;motorPower?:boolean}){
 const springs=useMemo(()=>cells.map(c=>new CatmullRomCurve3(Array.from({length:121},(_,i)=>{const t=i/120,a=t*Math.PI*8;return new Vector3(c.x+2.5*Math.cos(a),10+2.5*Math.sin(a),Math.sign(c.negativeZ)*(25.3+2.7*t));}))),[]),red=useMemo(()=>new CatmullRomCurve3([[-21.75,10,-26.4],[-21.75,23,-26.4],[-35,23,-32],[-36,23,38],[-2.54,12,45],[-2.54,3.3,45]].map(p=>new Vector3(...p)),false,'centripetal'),[]),black=useMemo(()=>new CatmullRomCurve3([[24.25,10,-28],[34,23,-32],[36,23,38],[12,13,46],[12,5.3,46]].map(p=>new Vector3(...p)),false,'centripetal'),[]);
 const c=(id:string,color:string)=>selected===id?'#b78be8':color,tag=(id:string,node:ReactNode)=><group key={id} userData={{partId:id}} onClick={e=>{e.stopPropagation();select(id);}}>{node}</group>;
 const box=(p:P,size:P,color:string,metal=0)=><mesh position={p} castShadow><boxGeometry args={size}/><meshStandardMaterial color={color} metalness={metal} roughness={metal?.3:.6}/></mesh>,cyl=(p:P,r:number,l:number,color:string)=><mesh position={p} rotation={[Math.PI/2,0,0]} castShadow><cylinderGeometry args={[r,r,l,32]}/><meshStandardMaterial color={color} metalness={.55} roughness={.35}/></mesh>;
 return <group position={[...at]}>
 {tag('aqua-aa-holder',<>{box([0,1,0],[64,2,62],c('aqua-aa-holder','#303c49'))}{[-1,1].map(s=><group key={s}>{box([s*31,10,0],[2,16,62],c('aqua-aa-holder','#303c49'))}{box([0,10,s*30],[60,16,2],c('aqua-aa-holder','#303c49'))}</group>)}{[-14.5,0,14.5].map(x=><group key={x}>{box([x,3,0],[.8,2,52],c('aqua-aa-holder','#465361'))}</group>)}{box([0,1.5,37],[22,3,14],c('aqua-aa-holder','#303c49'))}{box([12,2.5,46],[7,5,7],c('aqua-aa-holder','#303c49'))}</>)}
 {cells.map((cell,i)=>tag(cell.id,<>{cyl([cell.x,10,0],7.1,50,c(cell.id,i%2?'#b99953':'#566c80'))}{cyl([cell.x,10,Math.sign(cell.positiveZ)*25.6],2.6,1.2,c(cell.id,'#bec5c4'))}{cyl([cell.x,10,Math.sign(cell.negativeZ)*25.1],6.5,.4,c(cell.id,'#b3bdbd'))}<Text position={[cell.x,17.2,0]} rotation={[-Math.PI/2,0,Math.PI/2]} font={font} fontSize={1.7} color="#edf1ea">AA · 1.5 V</Text><Text position={[cell.x,17.1,Math.sign(cell.positiveZ)*19]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={2} color="#edf1ea">+</Text><Text position={[cell.x,17.1,Math.sign(cell.negativeZ)*19]} rotation={[-Math.PI/2,0,0]} font={font} fontSize={2} color="#edf1ea">−</Text></>))}
 {cells.map((cell,i)=>tag(`aqua-aa-positive-${i+1}`,<>{box([cell.x,10,cell.positiveZ],[9,7,.4],c(`aqua-aa-positive-${i+1}`,'#b6bda7'),.8)}{box([cell.x,10,Math.sign(cell.positiveZ)*27.2],[3,1,1.6],c(`aqua-aa-positive-${i+1}`,'#b6bda7'),.8)}</>))}
 {cells.map((cell,i)=>tag(`aqua-aa-negative-${i+1}`,<mesh><tubeGeometry args={[springs[i],120,.35,8,false]}/><meshStandardMaterial color={c(`aqua-aa-negative-${i+1}`,'#aeb9b5')} metalness={.8} roughness={.3}/></mesh>))}
 {links.map(l=>tag(l.id,box([l.x,10,l.z],[19.5,1,.5],c(l.id,'#b3baa7'),.8)))}
 {tag('aqua-aa-switch-case',<>{box([0,5,38],[12,4,6],c('aqua-aa-switch-case','#88969c'),.6)}{box([0,7.1,38],[8,.3,2.5],c('aqua-aa-switch-case','#283441'))}</>)}
 {tag('aqua-aa-switch-slider',box([motorPower?-2:2,8,38],[3,2,2.3],c('aqua-aa-switch-slider','#4a425d')))}
 {[-2.54,0,2.54].map((x,i)=>{const id=['aqua-aa-switch-input','aqua-aa-switch-output','aqua-aa-switch-unused'][i];return tag(id,<>{box([x,3,42.8],[.8,.6,6.4],c(id,'#b7af8b'),.7)}{box([x,3.8,40],[.8,2,.6],c(id,'#b7af8b'),.7)}</>);})}
 {tag('aqua-aa-return-tab',box([12,5,46],[4,.6,4],c('aqua-aa-return-tab','#b7af8b'),.7))}
 {tag('aqua-aa-positive-lead',<mesh><tubeGeometry args={[red,100,.7,10,false]}/><meshStandardMaterial color={c('aqua-aa-positive-lead','#b95162')} roughness={.6}/></mesh>)}
 {tag('aqua-aa-return-lead',<mesh><tubeGeometry args={[black,100,.7,10,false]}/><meshStandardMaterial color={c('aqua-aa-return-lead','#354559')} roughness={.6}/></mesh>)}
 </group>;
}
export default memo(AquacleanBatteryParts);
