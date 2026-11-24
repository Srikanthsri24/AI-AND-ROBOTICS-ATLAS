import {carMiniBreadboard,carMiniHole} from './bluetooth-mini-breadboard';
import {bluetoothCarUnoPoint,bluetoothCarBreakoutPoint,type CarPoint} from './bluetooth-car-layout';
export type CarTerminal={at:CarPoint;type:'male-jumper'|'female-jumper'|'solder';axis:CarPoint;insertion?:number};
export type CarWire={id:string;name:string;from:string;to:string;color:string;step:number;why:string;ends:[CarTerminal,CarTerminal];points:CarPoint[];motor?:boolean};
export const carTiePoint=(column:0|16,row:number):CarPoint=>carMiniHole(column,column===0?-1:1,row).map((v,i)=>v+carMiniBreadboard.at[i]) as CarPoint;
export const carMotorTerminals={leftPlus:[-1.37,.72,.4975],leftMinus:[-1.23,.72,.4975],rightPlus:[1.23,.72,.4975],rightMinus:[1.37,.72,.4975]} satisfies Record<string,CarPoint>;
export const carPowerTerminals={positive:[-1.20,1.13,1.835],negative:[-.40,1.13,1.835],switchIn:[-.88,1.12,1.975],switchOut:[-.72,1.12,1.975]} satisfies Record<string,CarPoint>;
const up:CarPoint=[0,1,0],rear:CarPoint=[0,0,1],u=(name:string):CarTerminal=>({at:bluetoothCarUnoPoint(name),type:'male-jumper',axis:up,insertion:.11}),b=(kind:'bluefruit'|'tb6612',name:string):CarTerminal=>({at:bluetoothCarBreakoutPoint(kind,name),type:'female-jumper',axis:up}),tie=(column:0|16,row:number):CarTerminal=>({at:carTiePoint(column,row),type:'male-jumper',axis:up,insertion:.11}),lug=(at:CarPoint):CarTerminal=>({at,type:'solder',axis:rear});
/** Each cable emerges beyond its connector housing; contact coordinates remain separate for inspection. */
export function carCableExit(t:CarTerminal):CarPoint{const n=t.type==='male-jumper'?.19+.12-(t.insertion??.11):t.type==='female-jumper'?.12:.04;return t.at.map((v,i)=>v+t.axis[i]*n) as CarPoint;}
function cable(id:string,name:string,from:string,to:string,color:string,step:number,why:string,ends:[CarTerminal,CarTerminal],via:CarPoint[],motor=false):CarWire{return {id,name,from,to,color,step,why,ends,points:[carCableExit(ends[0]),...via,carCableExit(ends[1])],motor};}
export function bluetoothCarWires(leftReversed=false,rightReversed=false,ctsLift=0):CarWire[]{
 const cts=tie(16,2);cts.at=[cts.at[0],cts.at[1]+ctsLift*.38,cts.at[2]];
 const wires:CarWire[]=[
  cable('wire-5v','Uno 5 V → supply tie','Uno 5 V','Left tie column · socket 1','#b84f4c',7,'Feeds only the radio and driver logic. The motor battery is a separate circuit.',[u('5V'),tie(0,0)],[[-1.35,1.62,-.50],[-1.10,1.50,-.16],[-.90,1.40,-.07]]),
  cable('wire-ground','Uno GND → common tie','Uno GND-P1','Right tie column · socket 1','#303b45',7,'Gives the UART and motor-control signals the same voltage reference.',[u('GND-P1'),tie(16,0)],[[-1.42,1.54,-.42],[-1.10,1.43,.02],[-.15,1.42,-.07]]),
  cable('wire-radio-vin','Supply tie → Bluefruit VIN','Left tie column · socket 2','Bluefruit VIN','#c35c54',7,'Powers the radio through its onboard regulator.',[tie(0,1),b('bluefruit','VIN')],[[-.82,1.58,-.15],[.30,1.65,-1.12],[.94,1.48,-1.34]]),
  cable('wire-radio-gnd','Common tie → Bluefruit GND','Right tie column · socket 2','Bluefruit GND','#35414b',7,'Completes the radio supply return and UART reference.',[tie(16,1),b('bluefruit','GND')],[[-.12,1.57,-.18],[.40,1.58,-1.12],[1.12,1.47,-1.34]]),
  cable('wire-cts','Grounded CTS · enable TXO','Bluefruit CTS','Right tie column · socket 3','#7e84ab',8,'CTS is normally HIGH. Ground it to let the radio transmit received bytes on TXO.',[b('bluefruit','CTS'),cts],[[.80,1.52,-1.35],[.26,1.60,-.96],[-.08,1.48,.13]]),
  cable('wire-uart','TXO → Uno D2 · received bytes','Bluefruit TXO','Uno D2','#d5a948',8,'The Uno receives uppercase F / B / L / R / S through SoftwareSerial. D3 and Bluefruit RXI remain unwired.',[b('bluefruit','TXO'),u('D2')],[[.83,1.61,-1.28],[.28,1.62,-1.22],[-.12,1.61,-.67]]),
  cable('wire-driver-vcc','Supply tie → driver VCC','Left tie column · socket 3','TB6612 VCC','#c46559',9,'VCC powers the H-bridge logic. It must not be confused with the AA-powered VM input.',[tie(0,2),b('tb6612','VCC')],[[-.75,1.58,.16],[.10,1.60,-.13],[.48,1.48,-.60]]),
  cable('wire-driver-gnd','Common tie → driver GND','Right tie column · socket 4','TB6612 input GND','#303d48',9,'Links the driver logic reference to the Uno. Motor-battery negative connects directly to the driver return.',[tie(16,3),b('tb6612','GND')],[[-.12,1.45,.26],[.22,1.50,.02],[.45,1.44,-.54]]),
 ];
 const controls=[['D5','PWMA','Left PWM · D5 → PWMA','#5096aa'],['D6','PWMB','Right PWM · D6 → PWMB','#547fa9'],['D4','AIN1','Left direction 1 · D4 → AIN1','#659365'],['D7','AIN2','Left direction 2 · D7 → AIN2','#839e50'],['D8','BIN1','Right direction 1 · D8 → BIN1','#719a87'],['D11','BIN2','Right direction 2 · D11 → BIN2','#589783'],['D12','STBY','Enable · D12 → STBY','#9c73c3']] as const;
 controls.forEach(([pin,dest,name,color],i)=>wires.push(cable('wire-'+dest.toLowerCase(),name,'Uno '+pin,'TB6612 '+dest,color,9,dest==='STBY'?'HIGH enables the bridges. LOW disables the outputs; the wheels can coast.':'The sketch sets this control contact independently for the two motor channels.',[u(pin),b('tb6612',dest)],[[.05,1.53+i*.014,-1.18+i*.095],[.31,1.62+i*.014,-.90+i*.08]])));
 const motorRoutes=[['a01','Left motor A01','A01',leftReversed?carMotorTerminals.leftMinus:carMotorTerminals.leftPlus,-1,'#ce8b4e'],['a02','Left motor A02','A02',leftReversed?carMotorTerminals.leftPlus:carMotorTerminals.leftMinus,-1,'#6b8eae'],['b01','Right motor B01','B01',rightReversed?carMotorTerminals.rightMinus:carMotorTerminals.rightPlus,1,'#cc8f50'],['b02','Right motor B02','B02',rightReversed?carMotorTerminals.rightPlus:carMotorTerminals.rightMinus,1,'#648ba8']] as const;
 motorRoutes.forEach(([id,name,pin,at,side,color],i)=>wires.push(cable('wire-'+id,name,'TB6612 '+pin,(side<0?'Left':'Right')+' motor terminal',color,10,'The two output leads reverse the motor voltage. Power off USB and AA before swapping a mismatched pair.',[b('tb6612',pin),lug([...at])],[[1.13,1.65+(i%2)*.055,-.27],[side*1.72,1.64+(i%2)*.055,.73],[side*1.74,.88,.74],[at[0],.74,.65]],true)));
 wires.push(
  cable('wire-aa-switch','AA positive → motor switch','AA holder +','Switch input','#b9574d',12,'The switch is in series with the motor battery positive lead.',[lug(carPowerTerminals.positive),lug(carPowerTerminals.switchIn)],[[-1.16,1.34,2.12],[-.92,1.31,2.16]],true),
  cable('wire-vm','Switched AA → driver VM','Switch output','TB6612 VM','#c05b4d',12,'Nominal 6 V from the four-AA pack feeds the motor bridge. It is separate from the 5 V logic rail.',[lug(carPowerTerminals.switchOut),b('tb6612','VM')],[[-.68,1.45,2.16],[.18,1.68,2.05],[.18,1.74,-.05],[.44,1.47,-.69]],true),
  cable('wire-aa-return','AA negative → driver return','AA holder −','TB6612 output GND2','#34414a',12,'Motor current returns directly to the pack through the driver, rather than through the small distribution board.',[lug(carPowerTerminals.negative),b('tb6612','GND2')],[[-.32,1.43,2.10],[1.45,1.65,1.97],[1.44,1.60,-.13]],true),
 );
 return wires;
}

/** Connector-aligned stubs are shared by rendering and physical route inspection. */
export function carCableControlPoints(w:CarWire):CarPoint[]{const start=w.points[0],end=w.points[w.points.length-1],lead=(p:CarPoint,axis:CarPoint)=>p.map((n,i)=>n+axis[i]*.065) as CarPoint;return [start,lead(start,w.ends[0].axis),...w.points.slice(1,-1),lead(end,w.ends[1].axis),end];}
