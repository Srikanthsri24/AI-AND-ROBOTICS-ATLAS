import{raRoverAdvance,raRoverWorldInitial,raRoverStandLift,type RaRoverPose,type RaRoverWiring,type RaRoverWorld}from'./rover-arm-rover';
/** Authored mount coordinates in 50 mm scene units, shared with the detailed
 * physical sensor model. The transmitting face is forward of the PCB. */
export const raRoverSonarMount={pcb:[0,1.80,-2.42]as const,transmitX:.26,receiveX:-.26,faceOffset:.2636,canRadius:.16};
export type RaRoverPoint=[number,number,number];
export type RaRoverCard={id:string;x:number;z:number;yaw:number;width:number;bottom:number;top:number;enabled:boolean};
export type RaRoverRange={origin:RaRoverPoint;direction:RaRoverPoint;hit:null|{id:string;point:RaRoverPoint;distanceCm:number}};
/** Ideal centreline intersection with finite, double-sided vertical cards. No
 * acoustic cone, surface reflectivity, multipath or collision physics implied. */
export function raRoverRange(p:RaRoverPose,cards:readonly RaRoverCard[],bodyLift=0):RaRoverRange{
 if(bodyLift<0||[p.x,p.z,p.yaw,bodyLift].some(v=>!Number.isFinite(v)))throw RangeError('Invalid rover range pose');
 const c=Math.cos(p.yaw),s=Math.sin(p.yaw),localZ=raRoverSonarMount.pcb[2]-raRoverSonarMount.faceOffset,origin:RaRoverPoint=[p.x+c*raRoverSonarMount.transmitX+s*localZ,raRoverSonarMount.pcb[1]+bodyLift,p.z-s*raRoverSonarMount.transmitX+c*localZ],direction:RaRoverPoint=[-s,0,-c];let hit:RaRoverRange['hit']=null;
 for(const card of cards){if([card.x,card.z,card.yaw,card.width,card.bottom,card.top].some(v=>!Number.isFinite(v))||card.width<=0||card.top<=card.bottom)throw RangeError('Invalid obstacle card');if(!card.enabled||origin[1]<card.bottom||origin[1]>card.top)continue;const nx=Math.sin(card.yaw),nz=Math.cos(card.yaw),den=direction[0]*nx+direction[2]*nz;if(Math.abs(den)<1e-10)continue;const t=((card.x-origin[0])*nx+(card.z-origin[2])*nz)/den;if(t<0||t>100)continue;const point:RaRoverPoint=[origin[0]+direction[0]*t,origin[1],origin[2]+direction[2]*t],u=(point[0]-card.x)*Math.cos(card.yaw)-(point[2]-card.z)*Math.sin(card.yaw);if(Math.abs(u)>card.width/2+1e-10)continue;const distanceCm=t*5;if(!hit||distanceCm<hit.distanceCm)hit={id:card.id,point,distanceCm};}
 return{origin,direction,hit};
}
export const raRoverTrainingCards:readonly RaRoverCard[]=[
 {id:'obstacle-card',x:0,z:-6,yaw:0,width:4,bottom:0,top:5,enabled:true},
 {id:'course-front',x:0,z:-22,yaw:0,width:44,bottom:0,top:8,enabled:true},
 {id:'course-back',x:0,z:22,yaw:0,width:44,bottom:0,top:8,enabled:true},
 {id:'course-left',x:-22,z:0,yaw:Math.PI/2,width:44,bottom:0,top:8,enabled:true},
 {id:'course-right',x:22,z:0,yaw:Math.PI/2,width:44,bottom:0,top:8,enabled:true},
];
export type RaRoverSample={atUs:number;range:RaRoverRange;echoConnected:boolean};
export type RaRoverCourse={world:RaRoverWorld;samples:readonly RaRoverSample[]};
export const raRoverCourseInitial=():RaRoverCourse=>({world:raRoverWorldInitial(),samples:[]});
/** Geometry is evaluated at the Uno trigger request timestamp; the echo and software
 * row appear later. Samples do not update during the 320 ms blind turn. */
export function raRoverCourseAdvance(previous:RaRoverCourse,w:RaRoverWiring,cards:readonly RaRoverCard[],onStand:boolean,ms:number):RaRoverCourse{
 const samples=[...previous.samples],world=raRoverAdvance(previous.world,w,{distanceCm:0,echoPresent:false,onStand},ms,(pose,atUs)=>{const range=raRoverRange(pose,cards,onStand?raRoverStandLift:0),echoConnected=w.sonarVcc&&w.sonarGround&&w.trig&&w.echo;samples.push({atUs,range,echoConnected});return{distanceCm:range.hit?.distanceCm??0,echoPresent:range.hit!==null};});
 return{world,samples:w.usb?samples.slice(-80):[]};
}
