import{roverArmSessionInitial,roverArmSessionAdvance,type RoverArmSession}from'./rover-arm-session';
export type RaRoverDigitalPin='D2'|'D4'|'D7'|'D8'|'D11'|'D12'|null;
export type RaRoverPwmPin='D5'|'D6'|null;
export type RaRoverControls={stby:RaRoverDigitalPin;ain1:RaRoverDigitalPin;ain2:RaRoverDigitalPin;bin1:RaRoverDigitalPin;bin2:RaRoverDigitalPin;pwma:RaRoverPwmPin;pwmb:RaRoverPwmPin};
/** The authored breakout follows the Adafruit PCB: R1 is 10 kΩ from STBY to
 * VCC, overcoming the IC's weak internal pull-down when this wire is open. */
export const raRoverStandbyPullup=true;
export const raRoverRequiredControls:RaRoverControls={stby:'D2',ain1:'D4',ain2:'D7',bin1:'D8',bin2:'D12',pwma:'D5',pwmb:'D6'};
export type RaRoverWiring={usb:boolean;motorSwitch:boolean;selectorGrounded:boolean;logicVcc:boolean;commonGround:boolean;sonarVcc:boolean;sonarGround:boolean;trig:boolean;echo:boolean;vmPositive:boolean;vmReturn:boolean;motorPairs:readonly[readonly[boolean,boolean],readonly[boolean,boolean]];reversed:readonly[boolean,boolean];controls:RaRoverControls};
export const raRoverWiringInitial=():RaRoverWiring=>({usb:false,motorSwitch:false,selectorGrounded:false,logicVcc:false,commonGround:false,sonarVcc:false,sonarGround:false,trig:false,echo:false,vmPositive:false,vmReturn:false,motorPairs:[[false,false],[false,false]],reversed:[false,false],controls:{stby:null,ain1:null,ain2:null,bin1:null,bin2:null,pwma:null,pwmb:null}});
export type RaRoverEnvironment={distanceCm:number;echoPresent:boolean;onStand:boolean};
export type RaRoverOutput={mode:'drive'|'short-brake'|'zero-command'|'stop'|'standby'|'motor-unpowered'|'logic-unpowered'|'no-reference'|'open-motor';direction:-1|0|1|null;duty:number;in1:boolean;in2:boolean;standby:boolean};
/** TB6612 input pull-downs and operating modes follow Toshiba's control table:
 * https://toshiba-semicon-storage.com/info/TB6612FNG_datasheet_en_20141001.pdf?did=10660&prodName=TB6612FNG
 * The breakout STBY pull-up is applied before interpreting the chip table. Missing VCC/reference is not a valid drive prediction. PWM is represented as
 * duty, not individual switching edges. No current, thermal or backfeed model. */
export function raRoverOutputs(s:RoverArmSession,w:RaRoverWiring):readonly[RaRoverOutput,RaRoverOutput]{
 const configured=w.usb&&s.mode==='rover',level=(pin:RaRoverDigitalPin):boolean|null=>!configured||pin===null||pin==='D11'?null:pin==='D2'?s.standby:pin==='D4'?s.wheels[0]>0:pin==='D7'?s.wheels[0]<0:pin==='D8'?s.wheels[1]>0:s.wheels[1]<0,pwm=(pin:RaRoverPwmPin)=>configured&&pin?Math.abs(s.wheels[pin==='D5'?0:1]):0;
 return([0,1]as const).map(ch=>{const in1=level(ch?w.controls.bin1:w.controls.ain1)??false,in2=level(ch?w.controls.bin2:w.controls.ain2)??false,standby=level(w.controls.stby)??raRoverStandbyPullup,duty=pwm(ch?w.controls.pwmb:w.controls.pwma),base={in1,in2,standby,duty},out=(mode:RaRoverOutput['mode'],direction:RaRoverOutput['direction']=0):RaRoverOutput=>({...base,mode,direction});
  if(!w.usb||!w.logicVcc)return out('logic-unpowered',null);if(!w.commonGround)return out('no-reference',null);if(!standby)return out('standby');if(!w.motorSwitch||!w.vmPositive||!w.vmReturn)return out('motor-unpowered');if(!w.motorPairs[ch].every(Boolean))return out('open-motor');if(in1&&in2)return out('short-brake');if(!in1&&!in2)return out(duty?'stop':'zero-command');if(!duty)return out('short-brake');return out('drive',(in1?1:-1)*(w.reversed[ch]?-1:1)as -1|1);
 })as[RaRoverOutput,RaRoverOutput];
}
/** Authored unloaded wheel response, scene units (50 mm/unit). Not measured
 * RPM, braking torque, tyre slip, gravity or stopping-distance certification. */
export type RaRoverPose={x:number;z:number;yaw:number;leftAngle:number;rightAngle:number;leftVelocity:number;rightVelocity:number;casterAngle:number;casterRoll:number};
/** Chassis-local positions match the selected two-wheel teaching chassis.
 * Pose x/z describes its origin; differential drive is integrated at the axle. */
export const raRoverWheelRadius=.65,raRoverTrack=3.8,raRoverAxleZ=-.50,raRoverCasterZ=1.60,raRoverCasterPivotZ=1.52,raRoverCasterTrail=.08,raRoverStandLift=.15;
export const raRoverPoseInitial=():RaRoverPose=>({x:0,z:0,yaw:0,leftAngle:0,rightAngle:0,leftVelocity:0,rightVelocity:0,casterAngle:0,casterRoll:0});
export function raRoverMotion(p:RaRoverPose,outputs:readonly[RaRoverOutput,RaRoverOutput],ms:number,onStand:boolean):RaRoverPose{
 if(!Number.isFinite(ms)||ms<0)throw RangeError('Invalid rover motion interval');if(!ms||outputs.some(o=>o.direction===null))return p;
 const dt=ms/1000,integrals:number[]=[],velocities=outputs.map((o,i)=>{const old=i?p.rightVelocity:p.leftVelocity,target=o.mode==='drive'?o.direction!*4*o.duty/110:0,rate=o.mode==='drive'?12:o.mode==='short-brake'?16:o.mode==='zero-command'?8:4,e=Math.exp(-rate*dt);integrals.push(target*dt+(old-target)*(1-e)/rate);return target+(old-target)*e;});
 const next={...p,leftAngle:p.leftAngle-integrals[0],rightAngle:p.rightAngle-integrals[1],leftVelocity:velocities[0],rightVelocity:velocities[1]};if(onStand)return next;
 const left=integrals[0]*raRoverWheelRadius,right=integrals[1]*raRoverWheelRadius,distance=(left+right)/2,turn=(right-left)/raRoverTrack;
 if(Math.abs(turn)<1e-10){next.x-=distance*Math.sin(p.yaw);next.z-=distance*Math.cos(p.yaw);}else{next.x+=distance/turn*(Math.cos(p.yaw+turn)-Math.cos(p.yaw));next.z-=distance/turn*(Math.sin(p.yaw+turn)-Math.sin(p.yaw));}next.yaw+=turn;next.x+=raRoverAxleZ*(Math.sin(p.yaw)-Math.sin(next.yaw));next.z+=raRoverAxleZ*(Math.cos(p.yaw)-Math.cos(next.yaw));
 const forward=distance/dt,lateral=turn/dt*(raRoverCasterPivotZ-raRoverAxleZ);if(Math.hypot(forward,lateral)>.005){const target=Math.atan2(-lateral,forward),difference=Math.atan2(Math.sin(target-p.casterAngle),Math.cos(target-p.casterAngle));next.casterAngle+=difference*(1-Math.exp(-8*dt));}next.casterRoll-=(forward*Math.cos(next.casterAngle)-lateral*Math.sin(next.casterAngle))/.20*dt;return next;
}
export type RaRoverWorld={session:RoverArmSession;pose:RaRoverPose};
export const raRoverWorldInitial=():RaRoverWorld=>({session:roverArmSessionInitial(),pose:raRoverPoseInitial()});
/** Integrate at each published wheel-write timestamp, including the zero-drive
 * acquisition interval at the end of a blind turn. Wiring/environment are held
 * constant during this call. Range geometry is a separate workbench layer. */
export type RaRoverRangeProbe=(pose:RaRoverPose,pulseStartUs:number)=>{distanceCm:number;echoPresent:boolean};
function integrateWrites(pose:RaRoverPose,old:RoverArmSession,next:RoverArmSession,dt:number,w:RaRoverWiring,onStand:boolean){let at=0,request={...old,mode:next.mode,standby:next.standby};for(const write of next.writes)if(write.id>=old.nextWriteId&&write.kind==='wheels'){const when=Math.max(at,Math.min(dt,(write.atUs-old.clockUs-old.remainderUs)/1000));pose=raRoverMotion(pose,raRoverOutputs(request,w),when-at,onStand);at=when;request={...request,wheels:[write.left,write.right]};}return raRoverMotion(pose,raRoverOutputs(request,w),dt-at,onStand);}
export function raRoverAdvance(previous:RaRoverWorld,w:RaRoverWiring,environment:RaRoverEnvironment,ms:number,probe?:RaRoverRangeProbe):RaRoverWorld{
 if(!Number.isFinite(ms)||ms<0)throw RangeError('Invalid rover interval');
 const sonar=w.sonarVcc&&w.sonarGround&&w.trig&&w.echo,input={usb:w.usb,selectorGrounded:w.selectorGrounded,servoDriverAvailable:false,distanceCm:environment.distanceCm,echoPresent:environment.echoPresent&&sonar};let session=previous.session,pose=previous.pose,remaining=ms;
 do{const dt=Math.min(1,remaining),old=session,startPose=pose;session=roverArmSessionAdvance(old,input,dt,probe?(atUs,request)=>{const preview=integrateWrites(startPose,old,request,Math.max(0,(atUs-old.clockUs-old.remainderUs)/1000),w,environment.onStand),reading=probe(preview,atUs);return{...reading,echoPresent:reading.echoPresent&&sonar};}:undefined);pose=integrateWrites(pose,old,session,dt,w,environment.onStand);remaining=Math.max(0,remaining-dt);}while(remaining>0);
 return{session,pose};
}
export const raRoverControlLabels=[
 {contact:'STBY',pin:'D2',why:'D2 controls standby in rover mode, rather than the Bluetooth car’s D12. The breakout pulls an open STBY HIGH; removing this wire is not a reliable stop.'},
 {contact:'PWMA / PWMB',pin:'D5 / D6',why:'Separate PWM inputs set the two wheel duties. The clear-path request is 116/255 on each channel.'},
 {contact:'AIN1 / AIN2',pin:'D4 / D7',why:'Set left-wheel polarity. The two motor leads complete channel A.'},
 {contact:'BIN1 / BIN2',pin:'D8 / D12',why:'Set right-wheel polarity. D11 is unused by this sketch.'},
 {contact:'TRIG / ECHO',pin:'A0 / A1',why:'The ultrasonic reading changes the program’s requested drive. It does not directly supply either motor.'},
 {contact:'Mode jumper',pin:'A2 → GND',why:'The program samples this only at startup. Changing it while powered does not change the active mode.'},
]as const;
