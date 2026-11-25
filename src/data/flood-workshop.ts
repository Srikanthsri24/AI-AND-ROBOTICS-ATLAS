/** Deterministic browser counterpart of flood_warning_station.ino.
 * Times are microseconds. The visual water surface is an input, never a fabricated reading.
 */
export type FloodWorkshopInputs={waterMm:number;mountGapMm:number;emptyCalibrationMm:number;echoConnected:boolean;powered:boolean};
export type FloodWorkshopReading={atUs:number;echoUs:number;gapMm:number|null;depthMm:number|null;state:'Normal'|'Watch'|'Warning'|'Sensor unavailable';green:boolean;amber:boolean;red:boolean;toneHz:number;serial:string};
export const floodWorkshopDefaults: FloodWorkshopInputs={waterMm:0,mountGapMm:230,emptyCalibrationMm:230,echoConnected:true,powered:true};
export function floodWorkshopValidate(i:FloodWorkshopInputs){
 if(![i.waterMm,i.mountGapMm,i.emptyCalibrationMm].every(Number.isFinite)||i.waterMm<0||i.waterMm>100||i.mountGapMm<200||i.mountGapMm>300||!Number.isInteger(i.emptyCalibrationMm)||i.emptyCalibrationMm<200||i.emptyCalibrationMm>300)throw Error('Use water 0–100 mm, a dry stand 200–300 mm above the bottom and an integer empty calibration of 200–300 mm.');
}
/** Ideal flat-water acoustic round trip at the sketch’s assumed 343 m/s. */
export function floodWorkshopEcho(i:FloodWorkshopInputs){floodWorkshopValidate(i);return i.echoConnected?Math.round(2*(i.mountGapMm-i.waterMm)*1000/343):0;}
/** Output pins are written after pulseIn returns, not at the start of a frame. */
export function floodWorkshopSample(i:FloodWorkshopInputs,startUs:number):FloodWorkshopReading{
 floodWorkshopValidate(i);if(!Number.isFinite(startUs)||startUs<0)throw Error('Invalid sampling time.');
 const echoUs=i.powered?floodWorkshopEcho(i):0,atUs=startUs+12+(echoUs||6000),gap=Math.floor((echoUs*343+1000)/2000),valid=i.powered&&echoUs!==0&&gap>=95&&gap<=i.emptyCalibrationMm+20,depth=Math.max(0,i.emptyCalibrationMm-gap),warning=valid&&depth>=80,watch=valid&&depth>=50&&!warning,pulse=Math.floor(Math.floor(atUs/1000)/400)%2===0;
 const state=valid?(warning?'Warning':watch?'Watch':'Normal'):'Sensor unavailable';
 return {atUs,echoUs,gapMm:valid?gap:null,depthMm:valid?depth:null,state,green:valid&&!watch&&!warning,amber:i.powered&&(watch||(!valid&&pulse)),red:warning,toneHz:warning&&pulse?1800:0,serial:valid?`gap mm: ${gap}  depth mm: ${depth}  ${warning?'WARNING':watch?'WATCH':'NORMAL'}`:'Sensor unavailable'};
}
export type FloodWorkshopClock={nowUs:number;nextStartUs:number;pending:FloodWorkshopReading|null;reading:FloodWorkshopReading|null;samples:number;running:boolean};
export function floodWorkshopInitial():FloodWorkshopClock{return {nowUs:0,nextStartUs:0,pending:null,reading:null,samples:0,running:false};}
/** Inputs are latched for each measurement. A disconnected echo blocks for 6 ms;
 * each completed iteration then waits 100 ms, exactly as the lesson sketch does.
 */
export function floodWorkshopAdvance(s:FloodWorkshopClock,seconds:number,i:FloodWorkshopInputs):FloodWorkshopClock{
 floodWorkshopValidate(i);if(!Number.isFinite(seconds)||seconds<0||seconds>60)throw Error('Advance by 0–60 seconds.');if(!s.running)return s;
 if(!i.powered)return {...floodWorkshopInitial(),nowUs:s.nowUs,running:true,nextStartUs:s.nowUs};
 const end=s.nowUs+Math.round(seconds*1e6);let next=s.nextStartUs,pending=s.pending,reading=s.reading,samples=s.samples;
 while(true){if(!pending){if(next>end)break;pending=floodWorkshopSample(i,next);}if(pending.atUs>end)break;reading=pending;samples++;next=pending.atUs+100000;pending=null;}
 return {nowUs:end,nextStartUs:next,pending,reading,samples,running:true};
}
export const floodWorkshopStages=[
 {title:'Prepare the basin and neighbourhood',instruction:'Mark 0, 5, 8 and 10 cm from the inside bottom. Keep the model shelter and its high-ground route beside the basin.',check:'The level basin is on a tray and the dry escape route stays visible.'},
 {title:'Secure the downward-facing sensor',instruction:'Fix the HC-SR04 to the dry stand, with its two transducers facing the centre of the basin. Set the front-to-bottom gap to 230 mm.',check:'At 100 mm water depth, 130 mm of clear air remains below the sensor.'},
 {title:'Connect power and the echo pair',instruction:'With USB unplugged, connect VCC to 5 V, GND to ground, TRIG to D2 and ECHO to D3. Read the module’s printed pin order.',check:'All four sensor wires terminate at the labelled pins; nothing crosses the acoustic path.'},
 {title:'Build the three lamp circuits',instruction:'Connect D5, D6 and D7 through separate 220 Ω resistors to the green, amber and red LED anodes. Return each cathode to common ground.',check:'Each LED has its own resistor and the long anode lead faces its resistor.'},
 {title:'Connect the passive piezo',instruction:'Connect D9 through the fourth 220 Ω resistor to the piezo signal terminal. Connect the return terminal to common ground.',check:'The passive piezo is quiet until the sketch generates a warning tone.'},
 {title:'Calibrate the empty basin',instruction:'Connect USB and upload the Arduino C++ sketch. Open Serial Monitor at 9600 baud. Copy the stable empty gap into EMPTY_MM and upload again.',check:'The empty basin reports approximately 0 mm and the green indicator lights.'},
 {title:'Test rising water and recovery',instruction:'Raise the virtual water through 50 and 80 mm, then lower it again. Compare measured depth with the marked basin.',check:'Watch is amber; warning is red with alternating 400 ms tone windows. Recovery follows the same thresholds.'},
 {title:'Check an unavailable sensor',instruction:'Unplug USB before disconnecting ECHO. Reconnect USB to observe the fault. Turn power off again before restoring the wire.',check:'The amber lamp blinks, depth is unavailable and the piezo stays quiet.'},
] as const;
