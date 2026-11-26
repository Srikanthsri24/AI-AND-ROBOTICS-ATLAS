import {schoolBellUnoContact as uno,schoolBellRtcContact as rtc,schoolBellDisplayContact as display,schoolBellBusHole as bus,schoolBellBreadboardHole as hole,schoolBellPiezoContact as piezo,type BellPoint} from './school-bell-workbench-layout';
export type BellWireEnd='male-up'|'female-down'|'female-back';
export type SchoolBellWire={id:string;label:string;from:BellPoint;to:BellPoint;fromPort:string;toPort:string;fromKind:BellWireEnd;toKind:BellWireEnd;net:string;color:string;what:string;connection:string};
const colors={'5V':'#c25567',GND:'#485364',SDA:'#4fa181',SCL:'#6c73bd'} as const;
export const schoolBellWires:SchoolBellWire[]=(['5V','GND','SDA','SCL'] as const).flatMap(net=>{const unoName=net==='SDA'?'A4':net==='SCL'?'A5':net==='GND'?'GND-P1':'5V',rtcName=net==='5V'?'VIN':net,displayName=net==='5V'?'VDD':net;return [
 {id:'school-wire-uno-'+net.toLowerCase(),label:'Uno '+net+' to shared strip',from:uno(unoName),to:bus(net,0),fromPort:'uno.'+unoName,toPort:'bus.'+net+'.0',fromKind:'male-up' as const,toKind:'male-up' as const},
 {id:'school-wire-rtc-'+net.toLowerCase(),label:net+' strip to RTC '+rtcName,from:bus(net,1),to:rtc(rtcName),fromPort:'bus.'+net+'.1',toPort:'rtc.'+rtcName,fromKind:'male-up' as const,toKind:'female-down' as const},
 {id:'school-wire-display-'+net.toLowerCase(),label:net+' strip to display '+displayName,from:bus(net,2),to:display(displayName),fromPort:'bus.'+net+'.2',toPort:'display.'+displayName,fromKind:'male-up' as const,toKind:'female-back' as const},
 ].map(w=>({...w,net,color:colors[net],what:net==='5V'?'Carries the Uno’s regulated logic supply.':net==='GND'?'Joins the common electrical return.':net==='SDA'?'Carries addressed I²C data between the Uno and both modules.':'Carries the shared I²C transfer clock.',connection:`${w.fromPort} → ${w.toPort}. Each breadboard column connects its five contacts; neighbouring columns and the opposite bank stay separate.`}));});
schoolBellWires.push(
 {id:'school-wire-d9',label:'D9 to resistor input',from:uno('D9'),to:hole(0,1,1),fromPort:'uno.D9',toPort:'resistor.input.1',fromKind:'male-up',toKind:'male-up',net:'D9',color:'#ba9250',what:'Carries the sketch’s square-wave tone command.',connection:'D9 joins the input resistor strip. The resistor’s first metal lead occupies another contact in this same column.'},
 {id:'school-wire-piezo-signal',label:'Resistor output to sounder',from:hole(5,1,1),to:piezo(true),fromPort:'resistor.output.1',toPort:'piezo.signal',fromKind:'male-up',toKind:'female-down',net:'piezo-signal',color:'#ba9250',what:'Carries the tone after its 220 Ω series resistor.',connection:'The output strip joins the sounder signal pin. Do not bypass the resistor with a direct D9-to-sounder wire.'},
 {id:'school-wire-piezo-return',label:'Sounder common return',from:bus('GND',3),to:piezo(false),fromPort:'bus.GND.3',toPort:'piezo.return',fromKind:'male-up',toKind:'female-down',net:'GND',color:'#485364',what:'Completes the piezo drive path back to ground.',connection:'The second sounder pin joins the ground strip shared by Uno, RTC and display.'},
);
/** Connector exits follow their physical mating axes. Routes are authored
 * workbench paths; clearance against rendered hardware is checked separately. */
export function schoolBellWireExit(point:BellPoint,kind:BellWireEnd):BellPoint{return kind==='male-up'?[point[0],point[1]+7.5,point[2]]:kind==='female-down'?[point[0],point[1]-4.5,point[2]]:[point[0],point[1],point[2]-4.5];}
export function schoolBellWireRoute(index:number):readonly BellPoint[]{const w=schoolBellWires[index];if(!w)throw Error('Unknown school-bell wire');const a=schoolBellWireExit(w.from,w.fromKind),b=schoolBellWireExit(w.to,w.toKind),netIndex=Math.floor(index/3),height=62+netIndex*5+(w.toKind==='female-back'?4:0);
 if(w.toKind==='female-back')return [a,[a[0],a[1]+5,a[2]],[a[0],height,a[2]],[a[0]+7,height,-90-netIndex*3],[b[0],height,-90-netIndex*3],[b[0],b[1],-84],[b[0],b[1],b[2]-3],b];
 if(w.toPort.startsWith('rtc.'))return [a,[a[0],a[1]+5,a[2]],[a[0],height,a[2]],[b[0],height,-23],[b[0],25,-24],[b[0],6.46,-27],[b[0],6.46,b[2]],[b[0],b[1]-1,b[2]],b];
 if(w.toKind==='female-down')return [a,[a[0],a[1]+5,a[2]],[a[0],28+(index-13)*6,95],[b[0],28+(index-13)*6,95],[b[0],5.5,b[2]+8],[b[0],5.5,b[2]],[b[0],b[1]-1,b[2]],b];
 return [a,[a[0],a[1]+5,a[2]],[a[0],44+netIndex*5,65+netIndex*4],[b[0]-7,44+netIndex*5,65+netIndex*4],[b[0]-7,44+netIndex*5,8],[b[0],30,8],[b[0],b[1]+5,b[2]-3],b];
}
