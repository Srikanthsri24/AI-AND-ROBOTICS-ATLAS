import {emergencyUnoContact} from './emergency-controller';
import {emergencyBoardHole,emergencyRailHole,type EmergencyRail} from './emergency-board';
import {emergencyLampTerminal,emergencyLightTerminal} from './emergency-signals';
import {emergencyPiezoTerminal} from './emergency-piezo';
import type {EmergencyPoint} from './emergency-corridor';
export type EmergencyWireEnd={kind:'male'|'female';at:EmergencyPoint;out:EmergencyPoint;name:string;node:string};
export type EmergencyWire={id:string;name:string;color:string;why:string;a:EmergencyWireEnd;b:EmergencyWireEnd};
const uno=(pin:string):EmergencyWireEnd=>({kind:'male',at:emergencyUnoContact(pin),out:[0,1,0],name:'Uno '+pin,node:'uno:'+pin});
const board=(column:number,bank:-1|1,row:number):EmergencyWireEnd=>({kind:'male',at:emergencyBoardHole(column,bank,row),out:[0,1,0],name:`${'ABCDEFGHIJ'[bank<0?row:row+5]}${column+1}`,node:`tie:${bank}:${column}`});
const rail=(key:EmergencyRail,slot:number):EmergencyWireEnd=>({kind:'male',at:emergencyRailHole(key,slot),out:[0,1,0],name:`${key} bus, socket ${slot+1}`,node:'rail:'+key});
const ldr=(kind:'supply'|'signal'):EmergencyWireEnd=>({kind:'female',at:emergencyLightTerminal(kind),out:[0,-1,0],name:'LDR '+kind,node:'ldr:'+kind});
const lamp=(key:'path-1'|'path-2'|'path-3'|'beacon',kind:'anode'|'cathode'):EmergencyWireEnd=>({kind:'female',at:emergencyLampTerminal(key,kind),out:[0,-1,0],name:key+' '+kind,node:key+':'+kind});
const piezo=(kind:'signal'|'return'):EmergencyWireEnd=>({kind:'female',at:emergencyPiezoTerminal(kind),out:[0,-1,0],name:'Passive piezo '+kind,node:'piezo:'+kind});
const make=(key:string,name:string,color:string,a:EmergencyWireEnd,b:EmergencyWireEnd,why:string):EmergencyWire=>({id:'emergency-wire-'+key,name,color,a,b,why});
export const emergencyWires:EmergencyWire[]=[
 make('supply','Uno 5 V reference','#cc637d',uno('5V'),rail('front-positive',0),'Feeds the photoresistor only; the red rear rail is unused.'),
 make('ground','Uno common ground','#58637e',uno('GND-P1'),rail('front-ground',0),'The nine distinct front bus insertions share this one electrical reference.'),
 make('ldr-supply','Photoresistor 5 V','#ce8291',rail('front-positive',1),ldr('supply'),'Connects one photoresistor end to the known reference, not to a digital output.'),
 make('ldr-junction','Photoresistor divider junction','#d7ad67',ldr('signal'),board(26,-1,4),'Meets the 10 kΩ resistor and the separate A0 lead on the same five-contact tie.'),
 make('a0','A0 brightness input','#b191c9',uno('A0'),board(26,-1,1),'Samples the divider without bypassing either resistive element.'),
 make('divider-return','10 kΩ ground return','#7c869b',board(29,-1,4),rail('front-ground',3),'Grounds the opposite end of the divider resistor on its own column.'),
 make('alarm-input','D2 ALARM input','#ce8b66',uno('D2'),board(1,-1,2),'INPUT_PULLUP holds HIGH until the pressed switch joins this pair to ground.'),
 make('alarm-return','ALARM ground return','#78849b',board(1,1,4),rail('front-ground',1),'Grounds the opposite tactile pair across the centre trench.'),
 make('reset-input','D3 RESET input','#aa89c6',uno('D3'),board(11,-1,2),'The sketch qualifies this active-low press for 30 ms; Alarm must be released to clear.'),
 make('reset-return','RESET ground return','#8a829d',board(11,1,4),rail('front-ground',2),'Provides a separate physical return without permanently shorting D3 to ground.'),
 ...(['path-1','path-2','path-3','beacon','piezo'] as const).map((key,i)=>make(key+'-command',`D${5+i} · ${key} resistor input`,['#a99a70','#83a68d','#77a0b0','#ca7284','#a28dc2'][i],uno('D'+(5+i)),board(i*5,-1,1),'This branch enters its own 220 Ω resistor. No output pin is joined to another output.')),
 ...(['path-1','path-2','path-3','beacon','piezo'] as const).map((key,i)=>make(key+'-outgoing',key+' · series-limited signal',['#c7b27c','#9cba9d','#91b4c1','#da8b9b','#bca5d4'][i],board(i*5+4,-1,4),key==='piezo'?piezo('signal'):lamp(key,'anode'),key==='piezo'?'Carries the source 1250 Hz tone command, rather than an active-buzzer DC supply.':'Enters the left anode lead after that LED’s own limiter.')),
 ...(['path-1','path-2','path-3','beacon','piezo'] as const).map((key,i)=>make(key+'-return',key+' · common-ground return','#68768e',key==='piezo'?piezo('return'):lamp(key,'cathode'),rail('front-ground',4+i),'Returns this load independently to the shared ground bus; paper supports do not conduct.')),
];
export const emergencyWireParts=emergencyWires.map(w=>[w.id,w.name,'One continuous insulated conductor has two individually seated contacts.',`${w.a.name} → ${w.b.name}. ${w.why}`]);
export function emergencyWireExit(end:EmergencyWireEnd):EmergencyPoint{return end.at.map((v,i)=>v+(end.kind==='male'?6:5)*end.out[i]) as EmergencyPoint;}
/** Chapter 5 seats the 25 leads one at a time, first contact then second. */
export function emergencyWireSeating(index:number,progress:number){if(!Number.isInteger(index)||index<0||index>=emergencyWires.length||!Number.isFinite(progress)||progress<0||progress>6)throw Error('Unknown emergency insertion position');const t=(progress-(4+index/25))*25,smooth=(v:number)=>{const x=Math.max(0,Math.min(1,v));return x*x*(3-2*x);};return{visible:t>=0,a:5*(1-smooth(t*2)),b:5*(1-smooth((t-.5)*2))};}
