import {memo,useMemo} from 'react';
import {Path,Shape,Vector2} from 'three';
/** Local +Y points away from the sensor. The pin enters the open lower face. */
function RailwayFemaleSocketGeometry({highlighted=false}:{highlighted?:boolean}){
 const shapes=useMemo(()=>{const shell=new Shape();shell.moveTo(-1.15,-1.15);shell.lineTo(1.15,-1.15);shell.lineTo(1.15,1.15);shell.lineTo(-1.15,1.15);shell.closePath();const front=shell.clone(),back=shell.clone(),square=new Path();square.moveTo(-.45,-.45);square.lineTo(-.45,.45);square.lineTo(.45,.45);square.lineTo(.45,-.45);square.closePath();front.holes.push(square);const circle=new Path();circle.absarc(0,0,.5,0,Math.PI*2,true);back.holes.push(circle);return{front,back,boot:[[1.15,6.2],[.65,8.2],[.45,8.2],[.5,6.2],[1.15,6.2]].map(([r,y])=>new Vector2(r,y))};},[]);
 const mat=(c:string,metal=0)=><meshStandardMaterial color={highlighted?'#b78be8':c} metalness={metal} roughness={metal?.3:.55}/>;
 const box=(p:[number,number,number],s:[number,number,number],metal=false)=><mesh position={p} castShadow><boxGeometry args={s}/>{mat(metal?'#bda96f':'#263141',metal?.75:0)}</mesh>;
 return <group>
 {[.2,5.2].map((y,n)=><mesh key={y} position={[0,y,0]} rotation={[-Math.PI/2,0,0]} castShadow><extrudeGeometry args={[n?shapes.back:shapes.front,{depth:1,curveSegments:32,bevelEnabled:false}]}/>{mat('#263141')}</mesh>)}
 {[-1,1].map(side=><group key={side}>{box([side*.9,3.2,0],[.5,4,2.3])}{box([0,3.2,side*.9],[1.3,4,.5])}</group>)}
 {box([0,5.7,0],[.65,1,.65],true)}
 {[-1,1].map(side=><group key={side}>{box([side*.35,3.2,0],[.1,4,.8],true)}</group>)}
 {box([0,3.2,-.35],[.8,4,.1],true)}
 <mesh castShadow><latheGeometry args={[shapes.boot,48]}/>{mat('#263141')}</mesh>
 </group>;
}
export default memo(RailwayFemaleSocketGeometry);
