import {sweepLimits} from './ultrasonic-radar';
export type RadarInputs=Readonly<{usb:boolean;servoPower:boolean;servoGround:boolean;sonarPower:boolean;targetPresent:boolean;targetAngle:number;targetDistanceMm:number;targetYaw:number;hornOffset:number}>;
export const radarDefaults:RadarInputs={usb:false,servoPower:false,servoGround:true,sonarPower:true,targetPresent:true,targetAngle:90,targetDistanceMm:400,targetYaw:0,hornOffset:0};
/** Front mouth plane clears the canonical HC-SR04 rim. Shaft speed is authored animation, not a servo rating. */
export const radarGeometry={faceOffsetMm:13.2,transducerOffsetMm:13,targetHalfWidthMm:60,shaftSpeedDegPerUs:.0008} as const;
export type RadarPoint=readonly[number,number];
export type RadarEcho=Readonly<{echoUs:number;flightUs:number;rangeCm:number;hit:RadarPoint|null;reason:'valid'|'missing'|'timeout'|'out-of-range'|'sensor-off'}>;
export type RadarSample=RadarEcho&Readonly<{id:number;atUs:number;angle:number;actualHeading:number}>;
export type RadarClock=Readonly<{nowUs:number;powered:boolean;command:number;actual:number;direction:5|-5;phase:'off'|'startup'|'settle'|'trigger-low'|'trigger-high'|'echo';phaseEndsUs:number;pending:(RadarEcho&Readonly<{actualHeading:number}>)|null;rows:readonly RadarSample[]}>;
function finite(value:number,min:number,max:number,name:string){if(!Number.isFinite(value)||value<min||value>max)throw Error(name+' outside workshop range');}
export function radarValidate(i:RadarInputs){for(const key of['usb','servoPower','servoGround','sonarPower','targetPresent'] as const)if(typeof i[key]!=='boolean')throw Error('Boolean input required: '+key);finite(i.targetAngle,0,180,'Target angle');finite(i.targetDistanceMm,1,2000,'Target distance');finite(i.targetYaw,-90,90,'Card yaw');finite(i.hornOffset,-20,20,'Horn offset');}
export const radarYaw=(angle:number)=>(angle-90)*Math.PI/180;
export function radarRotate(x:number,z:number,angle:number):RadarPoint{const r=radarYaw(angle);return[x*Math.cos(r)+z*Math.sin(r),-x*Math.sin(r)+z*Math.cos(r)];}
/** Exactly the sketch's unsigned integer distance conversion and 10–150 cm validity rule. */
export function radarReading(echoUs:number){if(!Number.isInteger(echoUs)||echoUs<0||echoUs>10000)throw Error('Echo duration outside pulseIn timeout');const cm=Math.floor((echoUs*343+10000)/20000);return echoUs&&cm>=10&&cm<=sweepLimits.rangeCm?cm:-1;}
/** Finite flat-card / central transmit-ray teaching model, not a material-acoustics solver. Native lengths are mm. */
export function radarEcho(i:RadarInputs,heading:number):RadarEcho{
 radarValidate(i);finite(heading,0,180,'Sensor heading');const absent=(reason:RadarEcho['reason']):RadarEcho=>({echoUs:0,flightUs:0,rangeCm:-1,hit:null,reason});if(!i.usb||!i.sonarPower)return absent('sensor-off');if(!i.targetPresent)return absent('missing');
 const tx=radarRotate(-radarGeometry.transducerOffsetMm,radarGeometry.faceOffsetMm,heading),rx=radarRotate(radarGeometry.transducerOffsetMm,radarGeometry.faceOffsetMm,heading),direction=radarRotate(0,1,heading),centre=radarRotate(0,radarGeometry.faceOffsetMm+i.targetDistanceMm,i.targetAngle),normal=radarRotate(0,1,i.targetAngle+i.targetYaw),tangent:RadarPoint=[normal[1],-normal[0]],denominator=direction[0]*normal[0]+direction[1]*normal[1];if(Math.abs(denominator)<1e-9)return absent('missing');
 const t=((centre[0]-tx[0])*normal[0]+(centre[1]-tx[1])*normal[1])/denominator;if(t<=0)return absent('missing');const hit:RadarPoint=Object.freeze([tx[0]+t*direction[0],tx[1]+t*direction[1]]),across=(hit[0]-centre[0])*tangent[0]+(hit[1]-centre[1])*tangent[1];if(Math.abs(across)>radarGeometry.targetHalfWidthMm)return absent('missing');
 const path=t+Math.hypot(hit[0]-rx[0],hit[1]-rx[1]),flightUs=Math.round(path*1000/343);if(flightUs>10000)return{echoUs:0,flightUs,rangeCm:-1,hit,reason:'timeout'};const rangeCm=radarReading(flightUs);return{echoUs:flightUs,flightUs,rangeCm,hit,reason:rangeCm<0?'out-of-range':'valid'};
}
export function radarInitial():RadarClock{return{nowUs:0,powered:false,command:90,actual:90,direction:5,phase:'off',phaseEndsUs:0,pending:null,rows:Object.freeze([])};}
export function radarNext(angle:number,direction:5|-5){const nextDirection=angle>=sweepLimits.max?-5:angle<=sweepLimits.min?5:direction;return{angle:angle+nextDirection,direction:nextDirection as 5|-5};}
/** Authored clock follows explicit sketch delays; CPU/serial overhead and ultrasonic burst latency are not simulated. */
export function radarAdvance(state:RadarClock,elapsedUs:number,i:RadarInputs):RadarClock{
 radarValidate(i);if(!Number.isSafeInteger(elapsedUs)||elapsedUs<0||!Number.isSafeInteger(state.nowUs+elapsedUs))throw Error('Invalid elapsed microseconds');const end=state.nowUs+elapsedUs;
 if(!i.usb)return{...radarInitial(),nowUs:end,actual:state.actual};
 let s:RadarClock=state.powered?state:{...state,powered:true,command:90,direction:5,phase:'startup',phaseEndsUs:state.nowUs+1500000,pending:null,rows:Object.freeze([])};
 while(s.nowUs<end||s.phaseEndsUs===s.nowUs){const at=Math.min(end,s.phaseEndsUs),dt=at-s.nowUs,difference=s.command-s.actual,drive=i.servoPower&&i.servoGround,actual=drive?s.actual+Math.sign(difference)*Math.min(Math.abs(difference),dt*radarGeometry.shaftSpeedDegPerUs):s.actual;s={...s,nowUs:at,actual};if(s.nowUs!==s.phaseEndsUs)break;
  if(s.phase==='startup')s={...s,command:sweepLimits.min,phase:'settle',phaseEndsUs:s.nowUs+sweepLimits.settleMs*1000};
  else if(s.phase==='settle')s={...s,phase:'trigger-low',phaseEndsUs:s.nowUs+2};
  else if(s.phase==='trigger-low')s={...s,phase:'trigger-high',phaseEndsUs:s.nowUs+10};
  else if(s.phase==='trigger-high'){const pending=Object.freeze({...radarEcho(i,s.actual+i.hornOffset),actualHeading:s.actual+i.hornOffset});s={...s,pending,phase:'echo',phaseEndsUs:s.nowUs+(pending.echoUs||10000)};}
  else if(s.phase==='echo'){const pending=s.pending!,sample:RadarSample=Object.freeze({...pending,id:s.rows.length+1,atUs:s.nowUs,angle:s.command}),next=radarNext(s.command,s.direction);s={...s,command:next.angle,direction:next.direction,rows:Object.freeze([...s.rows,sample]),pending:null,phase:'settle',phaseEndsUs:s.nowUs+sweepLimits.settleMs*1000};}
  else throw Error('Powered radar clock entered an invalid phase');
  if(s.nowUs===end)break;
 }
 return s;
}
export function radarTriggerHigh(s:RadarClock){return s.powered&&s.phase==='trigger-high';}
