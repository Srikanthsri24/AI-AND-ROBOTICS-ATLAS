import {raArmNeutral} from './rover-arm-mechanics';
import {raArmWiringInitial,raArmWorldOutputs,type RaArmWiring} from './rover-arm-world';
import {raArmRigInitial,raArmRigAdvance,raArmRigEnqueue,type RaArmRig} from './rover-arm-rig';
import {raArmAssemblyRecordCalibration,type RaArmAssembly} from './rover-arm-assembly';
import type {RaArmCalibration} from './rover-arm-motion';
/** Explicit authored unloaded response for this virtual bench. These values
 * are not measurements of a student's MG996R or a vendor pulse/angle promise. */
export const raArmVirtualCalibration:readonly RaArmCalibration[]=raArmNeutral.map(angle=>({pulseA:1498.16,angleA:angle,pulseB:1556.72,angleB:angle+.12,minAngle:angle-.15,maxAngle:angle+.2,responseMs:80}));
export type RaArmCalibrationCheck='neutral'|'jog'|'return';
export type RaArmCalibrationBench={channel:number;controllerOn:boolean;actuatorsOn:boolean;rig:RaArmRig;observed:readonly RaArmCalibrationCheck[]};
export const raArmCalibrationBenchInitial=():RaArmCalibrationBench=>({channel:0,controllerOn:false,actuatorsOn:false,rig:raArmRigInitial(raArmNeutral.map(a=>a+.06)),observed:[]});
/** Prechecked service-jig topology, separate from final arm assembly wiring.
 * Only the selected unloaded servo is connected; changing it requires both
 * sources off. A2 is open, address links are 0x40 and all logic links are seated. */
export function raArmCalibrationWiring(s:RaArmCalibrationBench):RaArmWiring{return{...raArmWiringInitial(),usb:s.controllerOn,logicGround:true,logicVcc:true,sda:true,scl:true,servoSupply:s.actuatorsOn,leads:Array.from({length:6},(_,i)=>({signal:i===s.channel,power:i===s.channel,ground:i===s.channel}))};}
export function raArmCalibrationAdvance(s:RaArmCalibrationBench,ms:number):RaArmCalibrationBench{return{...s,rig:raArmRigAdvance(s.rig,raArmCalibrationWiring(s),raArmVirtualCalibration,ms)};}
export function raArmCalibrationSelect(s:RaArmCalibrationBench,channel:number):RaArmCalibrationBench{
 if(!Number.isInteger(channel)||channel<0||channel>5)throw RangeError('Invalid unloaded servo channel');
 if(s.controllerOn||s.actuatorsOn)throw Error('Disconnect both sources before changing the unloaded servo');
 return{...s,channel,observed:[]};
}
export function raArmCalibrationPower(s:RaArmCalibrationBench,source:'controller'|'actuators',on:boolean):RaArmCalibrationBench{
 if(source==='actuators'&&on&&!s.controllerOn)throw Error('Start controller logic before actuator output');
 if(source==='controller'&&!on&&s.actuatorsOn)throw Error('Switch actuator output off before disconnecting controller logic');
 return raArmCalibrationAdvance({...s,[source==='controller'?'controllerOn':'actuatorsOn']:on},0);
}
export function raArmCalibrationCommand(s:RaArmCalibrationBench,command:'home'|'jog'):RaArmCalibrationBench{
 if(!s.controllerOn||!s.actuatorsOn)throw Error('Start both service-jig sources before checking the unloaded servo');
 if(command==='jog'&&!s.observed.includes('neutral'))throw Error('Observe settled neutral before the small jog');
 if(command==='jog'&&s.rig.world.session.active!==-1)throw Error('Wait for the timed jog to finish');
 return raArmCalibrationAdvance({...s,rig:raArmRigEnqueue(s.rig,command==='home'?'h':String(s.channel+1))},1);
}
function requireSettled(s:RaArmCalibrationBench,jog:boolean){
 const output=raArmWorldOutputs(s.rig.world,raArmCalibrationWiring(s))[s.channel],value=raArmVirtualCalibration[s.channel],pulse=jog?value.pulseB:value.pulseA,angle=jog?value.angleB:value.angleA;
 if(!s.controllerOn||!s.actuatorsOn||s.rig.world.session.mode!=='arm'||s.rig.world.session.halted||!s.rig.world.session.homed||output.status!=='tracking'||output.pulseUs===null||Math.abs(output.pulseUs-pulse)>.1||s.rig.pose.status[s.channel]!=='settled'||Math.abs(s.rig.pose.angles[s.channel]-angle)>.001)throw Error('Wait for the requested delivered pulse and unloaded servo to settle');
}
export function raArmCalibrationObserve(s:RaArmCalibrationBench,check:RaArmCalibrationCheck):RaArmCalibrationBench{
 const order:readonly RaArmCalibrationCheck[]=['neutral','jog','return'],index=order.indexOf(check);
 if(index<0||order.slice(0,index).some(c=>!s.observed.includes(c)))throw Error('Check neutral, small jog, then timed return in order');
 requireSettled(s,check==='jog');
 if(check==='return'&&s.rig.world.session.active!==-1)throw Error('Wait for the automatic neutral return');
 return s.observed.includes(check)?s:{...s,observed:[...s.observed,check]};
}
export function raArmCalibrationRecord(s:RaArmCalibrationBench,assembly:RaArmAssembly):RaArmAssembly{
 if(!(['neutral','jog','return']as const).every(c=>s.observed.includes(c)))throw Error('Observe all three unloaded checks before recording');
 requireSettled(s,false);
 return raArmAssemblyRecordCalibration(assembly,s.channel,s.rig,raArmCalibrationWiring(s),raArmVirtualCalibration[s.channel]);
}
export const raArmCalibrationInstructions=[
 {id:'neutral',title:'Find the unloaded neutral',instruction:'Keep the horn and arm link off this servo. On the checked service jig, start controller logic, then actuator output. Send h and watch the output spline settle.',why:'The guide starts with all channels FULL OFF. The home command explicitly requests 1500 µs; this nominal driver delivers 1498.16 µs.',check:'The spline has stopped at the authored virtual neutral. Record this observation before jogging.'},
 {id:'jog',title:'Observe one small movement',instruction:'Send the selected channel number. Watch its unloaded spline rotate a small amount. The virtual timeline pauses at a settled jog checkpoint before the 650 ms return; inspect it, then continue playback.',why:'The 1560 µs request becomes 1556.72 µs on this nominal driver. The displayed angular response belongs to the authored teaching model.',check:'The selected servo settles at the jog position. Other disconnected servos do not move.'},
 {id:'return',title:'Check the automatic return',instruction:'Resume the paused virtual timeline and wait for the program to send neutral automatically and for the unloaded spline to settle again. Then record the three checks.',why:'The horn must be indexed at the checked neutral orientation. Disconnect both sources before changing servos or fitting any horn.',check:'The selected channel has returned to its neutral pulse and settled angle. This records a virtual check, not a physical kit measurement.'},
]as const;
