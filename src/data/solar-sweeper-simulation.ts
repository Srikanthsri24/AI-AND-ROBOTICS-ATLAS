import {solarSweepInitial,solarSweepLoop} from './solar-sweeper-controller';
import {solarSweepExposure,solarSweepPower,solarSweepBrushStep} from './solar-sweeper-power';
import {solarSweepPaperInitial,solarSweepPaperStep} from './solar-sweeper-paper';
import {bluetoothCarPose,bluetoothCarMotion} from './bluetooth-car-motion';
export const solarSweeperInitial=()=>({core:solarSweepInitial(),pose:bluetoothCarPose(),brush:{angle:0,omega:0},paper:solarSweepPaperInitial(),clock:0,power:solarSweepPower({omega:0,angle:0},{light:0,connected:true,pwm:0,enabled:false,raised:false})});
export type SolarSweeperRuntime=ReturnType<typeof solarSweeperInitial>;
export type SolarSweeperEnvironment={logic:boolean;aa:boolean;panelConnected:boolean;sun:number;coverZ:number;onStand:boolean;brushRaised:boolean;buttonHigh:boolean};
export function solarSweeperAdvance(previous:SolarSweeperRuntime,seconds:number,e:SolarSweeperEnvironment):SolarSweeperRuntime{
 if(!Number.isFinite(seconds)||seconds<=0)return previous;const end=previous.clock+Math.min(seconds,1)*1000;let {core,pose,brush,paper,power}=previous;
 for(let t=Math.floor(previous.clock)+1;t<=Math.floor(end);t++){const light=Math.max(0,Math.min(1,e.sun))*solarSweepExposure(e.coverZ-pose.z),source={light,connected:e.panelConnected,pwm:core.brushPwm,enabled:e.logic&&core.brushPwm>0,raised:e.brushRaised||e.onStand};power=solarSweepPower(brush,source);
 if(e.logic)core=solarSweepLoop(core,Array(8).fill(power.adc),e.buttonHigh,t);
 brush=solarSweepBrushStep(brush,.001,{...source,pwm:core.brushPwm,enabled:e.logic&&core.brushPwm>0});const before=pose;pose=bluetoothCarMotion(pose,.001,{left:1,right:1,enabled:e.logic&&core.wheelPwm>0,motorPower:e.aa,onStand:e.onStand,pwmLeft:core.wheelPwm,pwmRight:core.wheelPwm,speedScale:.55});paper=solarSweepPaperStep(paper,.001,before,pose,{...brush,contact:!e.onStand&&!e.brushRaised});}
 return {core,pose,brush,paper,power,clock:end};
}
