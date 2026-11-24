/** Illustrative source / geared-motor response, not a measured LinkSolar or TT motor model.
 * 50 mm per scene unit. The face is based on the guide's 280 × 205 mm panel.
 * Partial shade is approximated by lit face area; actual series-cell regulation can differ.
 */
export const solarSweeperPowerModel={panelLength:5.6,panelWidth:4.1,coverLength:5.9,coverWidth:4.5,currentAtFullSun:1.5,resistance:5/.9,backEmf:.23,torquePerAmp:.15,inertia:.002};
export function solarSweepExposure(coverOffset:number){const half=solarSweeperPowerModel.panelLength/2,cover=solarSweeperPowerModel.coverLength/2,overlap=Math.max(0,Math.min(half,coverOffset+cover)-Math.max(-half,coverOffset-cover));return Math.max(0,Math.min(1,1-overlap/(half*2)));}
export type SolarBrush={angle:number;omega:number};
export type SolarSource={light:number;connected:boolean;pwm:number;enabled:boolean;raised:boolean};
export function solarSweepPower(brush:SolarBrush,e:SolarSource){const m=solarSweeperPowerModel,light=Math.max(0,Math.min(1,Number.isFinite(e.light)?e.light:0)),available=e.connected?m.currentAtFullSun*light:0,openVoltage=e.connected?5*Math.min(1,light/.06):0,duty=e.enabled?Math.max(0,Math.min(255,e.pwm))/255:0;
 const voltage=duty>0?Math.min(openVoltage,(available*m.resistance/Math.max(.0001,duty)+m.backEmf*Math.max(0,brush.omega))/duty):openVoltage,motorCurrent=duty>0?Math.max(0,(duty*voltage-m.backEmf*Math.max(0,brush.omega))/m.resistance):0;
 return {voltage,current:motorCurrent*duty,motorCurrent,available,duty,adc:Math.max(0,Math.min(1023,Math.round(voltage/10*1023)))};
}
export function solarSweepBrushStep(brush:SolarBrush,seconds:number,e:SolarSource):SolarBrush{if(!Number.isFinite(seconds)||seconds<=0)return {...brush};const count=Math.ceil(Math.min(1,seconds)/.001),dt=Math.min(1,seconds)/count,m=solarSweeperPowerModel;let omega=brush.omega,angle=brush.angle;for(let i=0;i<count;i++){const power=solarSweepPower({omega,angle},e),torque=power.motorCurrent*m.torquePerAmp,drag=(e.raised?.003:.020)+(e.raised?.0003:.002)*omega,old=omega;omega=Math.max(0,omega+(torque-drag)*dt/m.inertia);angle+=(old+omega)*.5*dt;}return {omega,angle};}
