import { industrialShieldContact } from './industrial-controller';
import { industrialControlHole,industrialStopTerminal } from './industrial-controls';
import { industrialPotTerminal,type IndustrialPoint } from './industrial-panel';
export type IndustrialWireEnd={kind:'male'|'pot'|'spade';at:IndustrialPoint;out:IndustrialPoint;name:string;pin?:string;board?:{column:number;bank:-1|1;row:number}};
export type IndustrialWire={id:string;name:string;why:string;color:string;a:IndustrialWireEnd;b:IndustrialWireEnd};
const shield=(pin:string):IndustrialWireEnd=>({kind:'male',at:industrialShieldContact(pin),out:[0,1,0],name:'Shield '+pin,pin});
const board=(column:number,bank:-1|1,row:number):IndustrialWireEnd=>({kind:'male',at:industrialControlHole(column,bank,row),out:[0,1,0],name:`Board column ${column+1}, ${bank<0?'negative':'positive'} bank, row ${row+1}`,board:{column,bank,row}});
const pot=(key:'temperature'|'vibration',terminal:'ground'|'wiper'|'supply'):IndustrialWireEnd=>({kind:'pot',at:industrialPotTerminal(key,terminal),out:[0,0,1],name:`${key} ${terminal}`});
const stop=(terminal:'com'|'nc'):IndustrialWireEnd=>({kind:'spade',at:industrialStopTerminal(terminal),out:[0,-1,0],name:'Stop '+terminal.toUpperCase()});
export const industrialWireIds=['logic','ground','temperature-low','temperature-high','temperature-wiper','vibration-low','vibration-high','vibration-wiper','stop-com','stop-nc','button-signal','button-return','run-signal','trip-signal','run-return','trip-return','ground-bridge'].map(n=>'industrial-wire-'+n);
export function industrialWires(stopConnected=true):IndustrialWire[]{
 const make=(n:number,name:string,color:string,a:IndustrialWireEnd,b:IndustrialWireEnd,why:string):IndustrialWire=>({id:industrialWireIds[n],name,color,a,b,why});
 const wires=[
 make(0,'5 V panel feed','#cd526e',shield('5V'),board(0,1,0),'Supplies the two test potentiometers through their isolated common high-reference tie group.'),
 make(1,'Common ground feed','#475168',shield('GND-P1'),board(2,1,0),'Establishes the reference used by both analogue inputs, the stop loop, button and indicator returns.'),
 make(2,'Temperature ground lead','#59627a',pot('temperature','ground'),board(2,1,1),'Connects the low end of the temperature track to common ground; this is not the analogue wiper.'),
 make(3,'Temperature 5 V lead','#d67481',pot('temperature','supply'),board(0,1,1),'Connects the high end of the temperature track to the shared 5 V reference.'),
 make(4,'A0 temperature wiper','#dfaa53',shield('A0'),pot('temperature','wiper'),'Carries the independently selected temperature voltage to A0. The sketch rounds its ADC count to a synthetic index.'),
 make(5,'Vibration ground lead','#63718a',pot('vibration','ground'),board(2,1,2),'Connects the second track low end to the same ground reference without joining the two wipers.'),
 make(6,'Vibration 5 V lead','#cd829c',pot('vibration','supply'),board(0,1,2),'Connects the second track high end to 5 V. Its shaft still controls only its own centre terminal.'),
 make(7,'A1 vibration wiper','#63b9ce',shield('A1'),pot('vibration','wiper'),'Carries the vibration test voltage to A1, separately from the A0 temperature lead.'),
 make(8,'Stop COM ground lead','#6c7790',stop('com'),board(2,1,3),'Returns the switch common blade to ground. With NC closed, the separate D2 lead reads LOW.'),
 make(9,'D2 NC stop-loop lead','#dc865d',shield('D2'),stop('nc'),'A pressed switch or disconnected NC connector opens the loop and lets INPUT_PULLUP read HIGH. NO stays unused.'),
 make(10,'D3 button signal','#9a7cc4',shield('D3'),board(7,-1,0),'Shares the negative-bank column-8 tactile contact group. A qualified press joins it to the other contact side.'),
 make(11,'Button ground jumper','#7b8398',board(7,1,4),board(4,1,3),'Returns the positive-bank button contact group to the extended common-ground tie.'),
 make(12,'D5 RUN indicator feed','#6aaa8f',shield('D5'),board(0,-1,1),'Feeds only the green circuit input column, then its own 220 Ω resistor and anode.'),
 make(13,'D6 TRIP indicator feed','#c96c89',shield('D6'),board(11,-1,1),'Feeds only the red circuit input column. It remains active while the local trip latch is set.'),
 make(14,'Green cathode return','#688a81',board(5,-1,1),board(4,1,1),'Returns the green cathode column to common ground without bypassing its series resistor.'),
 make(15,'Red cathode return','#927c96',board(16,-1,1),board(4,1,2),'Returns the red cathode column to the extended ground group, independently of the anode.'),
 make(16,'Ground extension bridge','#63708b',board(2,1,4),board(4,1,0),'Joins the two otherwise isolated positive-bank ground columns so there are enough separate insertion holes.'),
 ];
 if(!stopConnected)wires[9]={...wires[9],b:{...wires[9].b,at:wires[9].b.at.map((v,k)=>v+6*wires[9].b.out[k]) as IndustrialPoint}};
 return wires;
}
export function industrialWireExit(end:IndustrialWireEnd):IndustrialPoint{const length=end.kind==='male'?6:5;return end.at.map((v,k)=>v+length*end.out[k]) as IndustrialPoint;}
const away=(end:IndustrialWireEnd):IndustrialPoint=>industrialWireExit(end).map((v,k)=>v+(end.kind==='spade'?4:8)*end.out[k]) as IndustrialPoint;
/** Routes keep knob sockets under the plate, long feeds above the controller and local board jumps above the LEDs. */
export function industrialWirePoints(w:IndustrialWire):IndustrialPoint[]{const index=industrialWireIds.indexOf(w.id);if(index<0)throw Error('Unknown industrial wire');const a=industrialWireExit(w.a),b=industrialWireExit(w.b),aa=away(w.a),bb=away(w.b);let via:IndustrialPoint[];
 if(w.a.board&&w.b.board){const height=index===16?27:31+(index-11)*2;via=index===16?[[aa[0],height,aa[2]],[(aa[0]+bb[0])/2,height+2,(aa[2]+bb[2])/2],[bb[0],height,bb[2]]]:[[aa[0],height,aa[2]],[(aa[0]+bb[0])/2,height+2,(aa[2]+bb[2])/2],[bb[0]+8,height,bb[2]],[bb[0]+8,24,bb[2]]];}
 else if(w.a.kind==='pot'){via=[[a[0],24,-8],[a[0],24,12],[b[0]-15,32+index*2,b[2]-18]];}
 else if(w.b.kind==='pot'){via=[[-95,30+index*1.5,-20],[-50,26+index*.5,50+index],[b[0],20,12],[b[0],20,-8]];}
 else if(w.a.kind==='spade'){via=[[32,8,w.a.at[2]+15],[b[0]-15,26,b[2]+15]];}
 else if(w.b.kind==='spade'){via=[[-95,52+index*2.5,5],[-60,40,40],[40,40,45],[40,15,w.b.at[2]+18],[32,8,w.b.at[2]+10]];}
 else via=[[-95,52+index*2.5,5],[-50,42+index*1.2,30+index*1.8],[b[0]-12,index<2?54+index*2:38+index*1.8,b[2]-15]];
 return[a,aa,...via,bb,b];
}
export const industrialWireParts=industrialWires().map(w=>[w.id,w.name,'This insulated conductor and its two separate connectors form one individually traceable physical connection.',`${w.a.name} → ${w.b.name}. ${w.why}`]);
/** Seat one jumper at a time, first contact then second; distances are native millimetres. */
export function industrialWireSeating(index:number,progress:number){
 if(!Number.isInteger(index)||index<0||index>=industrialWireIds.length||!Number.isFinite(progress)||progress<0||progress>7)throw Error('Invalid industrial jumper insertion');
 const t=(progress-(3+index/17))*17,smooth=(n:number)=>{const f=Math.max(0,Math.min(1,n));return f*f*(3-2*f);};
 return{visible:t>=0,a:5*(1-smooth(t*2)),b:5*(1-smooth((t-.5)*2))};
}
export function industrialSeatedWire(w:IndustrialWire,index:number,progress:number):IndustrialWire{
 if(w.id!==industrialWireIds[index])throw Error('Industrial jumper order does not match its contact schedule');
 const s=industrialWireSeating(index,progress),shift=(end:IndustrialWireEnd,d:number):IndustrialWireEnd=>({...end,at:end.at.map((v,k)=>v+end.out[k]*d) as IndustrialPoint});
 return{...w,a:shift(w.a,s.a),b:shift(w.b,s.b)};
}
