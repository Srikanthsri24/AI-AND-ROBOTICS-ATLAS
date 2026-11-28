import{pickBalanceSessionInitial,pickBalanceSessionAdvance,pickBalanceEnqueue,type PickBalanceSession}from'./pick-balance-session';
import{raArmDriverInitial,raArmDriverPower,raArmDriverConfigure50,raArmDriverWrite,raArmDriverOutputs,type RaArmDriver}from'./rover-arm-driver';
import{pickRoverMotionInitial,pickRoverMotionAdvance,type PickRoverMotion}from'./pick-rover-motion';
export type PickLead={signal:boolean;power:boolean;ground:boolean};
export type PickRoverWiring={usb:boolean;motorSupply:boolean;servoSupply:boolean;driverVcc:boolean;driverGround:boolean;motorPositive:boolean;motorReturn:boolean;standby:boolean;pwm:readonly[boolean,boolean];direction:readonly[boolean,boolean];motorLeads:readonly[boolean,boolean];pcaVcc:boolean;pcaGround:boolean;sda:boolean;scl:boolean;address40:boolean;outputEnabled:boolean;servoPositive:boolean;servoReturn:boolean;servos:readonly[PickLead,PickLead]};
export function pickRoverWiringInitial():PickRoverWiring{return{usb:false,motorSupply:false,servoSupply:false,driverVcc:false,driverGround:false,motorPositive:false,motorReturn:false,standby:false,pwm:[false,false],direction:[false,false],motorLeads:[false,false],pcaVcc:false,pcaGround:false,sda:false,scl:false,address40:true,outputEnabled:true,servoPositive:false,servoReturn:false,servos:[{signal:false,power:false,ground:false},{signal:false,power:false,ground:false}]};}
/** Explicit two-point unloaded teaching calibration. Real kits require their
 * own measurements; no calibration is silently installed in a fresh rig. */
export type PickServoCalibration={pulseA:number;pulseB:number};
export const pickRoverTeachingCalibration:readonly[PickServoCalibration,PickServoCalibration]=[{pulseA:1439.6,pulseB:1556.72},{pulseA:1449.36,pulseB:1546.96}];
export type PickRoverRig={clockMs:number;remainderMs:number;session:PickBalanceSession;driver:RaArmDriver;consumedWriteId:number;world:PickRoverMotion;calibration:readonly[PickServoCalibration|null,PickServoCalibration|null]};
export function pickRoverRigInitial(calibration:PickRoverRig['calibration']=[null,null]):PickRoverRig{if(calibration.length!==2||calibration.some(c=>c&&(!Number.isFinite(c.pulseA)||!Number.isFinite(c.pulseB)||c.pulseA<=0||c.pulseB<=c.pulseA)))throw new RangeError('Two valid pulse calibrations required');return{clockMs:0,remainderMs:0,session:pickBalanceSessionInitial(),driver:raArmDriverInitial(),consumedWriteId:0,world:pickRoverMotionInitial(),calibration:[calibration[0]?{...calibration[0]}:null,calibration[1]?{...calibration[1]}:null]};}
export function pickRoverRigEnqueue(s:PickRoverRig,text:string):PickRoverRig{return{...s,session:pickBalanceEnqueue(s.session,text)};}
function bus(w:PickRoverWiring){return{unoPowered:w.usb,ground:w.pcaGround,sda:w.sda,scl:w.scl,address40:w.address40};}
export function pickRoverRigOutputs(s:PickRoverRig,w:PickRoverWiring){
 const logic=w.usb&&w.driverVcc&&w.driverGround,motorRail=w.motorSupply&&w.motorPositive&&w.motorReturn,standby=logic&&(w.standby?s.session.standby:true);
 // The physical carrier has a STBY pull-up. Missing PWM/direction connections
 // are marked unavailable, not claimed to be deterministic floating levels.
 const motors=([0,1]as const).map(i=>{const status=!logic?'no-logic':!motorRail?'no-motor-power':!standby?'standby':!w.pwm[i]||!w.direction[i]?'unverified-input':!w.motorLeads[i]?'open-motor-circuit':'ready';return{status,request:status==='ready'?s.session.wheel:0};});
 const power=w.servoSupply&&w.servoPositive&&w.servoReturn,leads=[...w.servos,...Array.from({length:4},()=>({signal:false,power:false,ground:false}))],signals=raArmDriverOutputs(s.driver,{servoSupply:power,outputEnabled:w.outputEnabled,leads}).slice(0,2);
 const servos=signals.map((signal,i)=>{const c=s.calibration[i],pulse=signal.pulseUs,low=i===0?1440:1450,high=i===0?1560:1550,command=pulse!==null&&c?low+(pulse-c.pulseA)/(c.pulseB-c.pulseA)*(high-low):null;return{...signal,command:signal.status==='tracking'&&command!==null&&command>=low-1e-6&&command<=high+1e-6?Math.max(low,Math.min(high,command)):null,calibrationStatus:!c?'uncalibrated':command!==null&&(command<low-1e-6||command>high+1e-6)?'outside-calibration':'calibrated'};});
 return{motors,servos,logic,motorRail,standby,servoRail:power};
}
function tick(s:PickRoverRig,w:PickRoverWiring):PickRoverRig{
 let driver=raArmDriverPower(s.driver,w.usb&&w.pcaVcc&&w.pcaGround);const b=bus(w),starting=s.session.mode==='off',session=pickBalanceSessionAdvance(s.session,{usb:w.usb,balanceSelector:false,deviceAvailable:driver.logicPower&&b.ground&&b.sda&&b.scl&&b.address40,tiltDeg:0,gyroDegPerSec:0},1);
 let consumedWriteId=starting||!w.usb?0:s.consumedWriteId;if(starting&&session.initialized)driver=raArmDriverConfigure50(driver,b);
 for(const write of session.writes.filter(v=>v.id>consumedWriteId)){driver=raArmDriverWrite(driver,b,{id:write.id,atUs:write.atMs*1000,kind:'servo',channel:write.channel,pulseUs:write.pulseUs});consumedWriteId=write.id;}
 const state={...s,session,driver,consumedWriteId},out=pickRoverRigOutputs(state,w),world=pickRoverMotionAdvance(s.world,{wheelPwm:0,leftPwm:out.motors[0].request,rightPwm:out.motors[1].request,motorPower:out.motorRail,logicReference:true,servoPower:out.servoRail,liftPulse:out.servos[0].command,jawPulse:out.servos[1].command},1);
 return{...state,clockMs:s.clockMs+1,world};
}
/** Fixed electrical/physical step. Accepted PWM values persist through I²C
 * loss; failed transactions never replay when a lead is restored. Loss of
 * logic VCC resets the chip. Signal loss uses the declared teaching release
 * rule, not a promise about an actual servo's undocumented failsafe. */
export function pickRoverRigAdvance(s:PickRoverRig,w:PickRoverWiring,ms:number):PickRoverRig{if(!Number.isFinite(ms)||ms<0||!Number.isSafeInteger(Math.floor(s.clockMs+ms))||w.servos.length!==2||w.pwm.length!==2||w.direction.length!==2||w.motorLeads.length!==2)throw new RangeError('Invalid rover rig step');const total=s.remainderMs+ms,whole=Math.floor(total+1e-9),remainderMs=Math.max(0,Math.round((total-whole)*1e9)/1e9);let next=s;for(let n=0;n<whole;n++)next=tick(next,w);return{...next,remainderMs};}
