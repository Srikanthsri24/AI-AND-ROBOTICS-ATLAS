import {radarAdvance,type RadarClock,type RadarInputs,type RadarSample} from './radar-workshop';
import {radarAssemblyMotion,type RadarBenchMotion} from './radar-assembly';
import {radarPowerSeating} from './radar-power-jumpers';
export type RadarInspection='none'|'usb'|'sonar'|'power'|'contacts';
/** Advance the original explicit-delay sketch to one completed sample, then freeze virtual time. */
export function radarNextSample(clock:RadarClock,inputs:RadarInputs){
 let s=radarAdvance(clock,0,inputs);if(!inputs.usb)return s;const count=s.rows.length;
 for(let n=0;n<12&&s.rows.length===count;n++)s=radarAdvance(s,Math.max(0,s.phaseEndsUs-s.nowUs),inputs);
 if(s.rows.length!==count+1)throw Error('Radar sample did not complete');return s;
}
export function radarSampleAt90(clock:RadarClock,inputs:RadarInputs){let s=clock;for(let n=0;n<50;n++){s=radarNextSample(s,inputs);if(!inputs.usb||s.rows.at(-1)?.angle===90)return s;}throw Error('90 degree sample not reached');}
export function radarLiveMotion(clock:RadarClock,i:RadarInputs,inspection:RadarInspection='none'):RadarBenchMotion{
 const base=radarAssemblyMotion(9),sonar=base.sonar.map((w,n)=>({...w,sonar:n===0&&!i.sonarPower?4:w.sonar})),power=base.power.map((w,n)=>({...w,b:n===4&&!i.servoGround?5:w.b}));
 const contacts=inspection==='contacts';
 return{...base,actual:clock.actual,hornOffset:i.hornOffset,usb:inspection==='none'&&i.usb,servoPower:inspection==='none'&&i.servoPower,usbUno:!i.usb||inspection!=='none'?12:0,usbHost:inspection==='usb'||contacts?12:0,sonar:inspection==='sonar'||contacts?sonar.map(()=>({sonar:4,uno:5})):sonar,power:inspection==='power'||contacts?radarPowerSeating(0):power};
}
export function radarCsv(rows:readonly RadarSample[]){return'angle_deg,range_cm\n'+rows.map(r=>`${r.angle},${r.rangeCm}\n`).join('');}
export function radarPlotPoint(angle:number,cm:number):readonly[number,number]{const a=(angle-90)*Math.PI/180;return[180+cm*Math.sin(a),180-cm*Math.cos(a)];}
export function radarSampleExplanation(sample:RadarSample|undefined){
 if(!sample)return'Run the sketch, or advance to 90° for a slowed single-echo demonstration.';
 const reason=sample.reason==='valid'?`${sample.rangeCm} cm from a ${sample.echoUs} µs echo.`:sample.reason==='sensor-off'?'The sonar supply lead is disconnected.':sample.reason==='timeout'?'The echo arrives after the 10,000 µs timeout.':sample.reason==='out-of-range'?'The geometric return is outside the sketch’s 10–150 cm valid range.':'The finite card face did not intercept this transmitted ray.';
 return`Command ${sample.angle}° · simulated head ${sample.actualHeading.toFixed(1)}°. ${reason}${sample.rangeCm<0?' The sketch prints −1, which is not a zero-centimetre obstacle.':''}`;
}
