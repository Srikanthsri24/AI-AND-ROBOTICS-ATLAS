import{aquaShieldContact as shield}from'./aquaclean-electronics';
import{aquaDriverContact as driver}from'./aquaclean-driver';
import{aquaPanelHole as hole}from'./aquaclean-panel';
import{aquaBatteryContact as battery}from'./aquaclean-battery';
import{aquaSensorLayout as sensor}from'./aquaclean-layout';
export type AquaPoint=[number,number,number];
export type AquaWireEnd={at:AquaPoint;out:AquaPoint;kind:'male'|'female'|'solder'};
export type AquaWire={id:string;name:string;description:string;connection:string;color:string;a:AquaWireEnd;b:AquaWireEnd;via:AquaPoint[];echo?:boolean;motor?:boolean};
const up:AquaPoint=[0,1,0],end=(at:AquaPoint,kind:AquaWireEnd['kind']='male',out:AquaPoint=up):AquaWireEnd=>({at,kind,out});
export function aquaSensorContact(name:'VCC'|'TRIG'|'ECHO'|'GND'):AquaPoint{const x={VCC:-3.81,TRIG:-1.27,ECHO:1.27,GND:3.81}[name];return[sensor.x+x,sensor.boardY,-16];}
export function aquaMotorContact(lead:0|1):AquaPoint{return[-104,lead===0?149:141,145];}
export function aquaWireExit(e:AquaWireEnd):AquaPoint{const d=e.kind==='male'?6:e.kind==='female'?1.5:2;return e.at.map((v,k)=>v+e.out[k]*d) as AquaPoint;}
export function aquaWires(echoConnected=true):AquaWire[]{
 const wires:AquaWire[]=[],add=(id:string,name:string,a:AquaWireEnd,b:AquaWireEnd,color:string,connection:string,via?:AquaPoint[],flags:Partial<Pick<AquaWire,'echo'|'motor'>>={})=>{const n=wires.length,h=Math.max(a.at[1],b.at[1])+18+(n%4)*2.5;wires.push({id:'aqua-wire-'+id,name,description:flags.motor?'This conductor belongs to the separate motor-current circuit.':'This insulated conductor joins the two named physical contacts.',connection,color,a,b,via:via??[[a.at[0]-7,h,a.at[2]],[-350-n*1.8,h+3,(a.at[2]+b.at[2])/2],[b.at[0]-7,h,b.at[2]]],...flags});},S=(name:string)=>end(shield(name)),D=(name:string)=>end(driver(name),'female'),H=(col:number,bank:-1|1,row:number)=>end(hole(col,bank,row));
 add('logic','Uno 5 V → logic distribution',S('5V'),H(1,-1,0),'#c95f70','Column 2 negative bank, row 1. Supplies sensor and driver VCC only.');
 add('ground','Uno GND → shared reference',S('GND-P1'),H(1,1,0),'#3b4b60','Column 2 positive bank, row 1. The motor supply positive is not connected here.');
 const sonar=(pin:'VCC'|'TRIG'|'ECHO'|'GND',other:AquaWireEnd,lane:number,color:string)=>{const physical=end(aquaSensorContact(pin),'female',[0,0,-1]),rear=-130-lane*1.4,left=-365-lane*4,via:AquaPoint[]=[[physical.at[0],physical.at[1],-28],[physical.at[0],physical.at[1]-3,-100],[210,physical.at[1]-3,rear-4],[230+lane*1.6,physical.at[1]-3,rear],[230+lane*1.6,220,rear],[230+lane*1.6,120,rear],[230+lane*1.6,40,rear],[230+lane*1.6,20+lane*1.6,rear],[230+lane*1.6,15+lane*1.3,-148-lane*2],[180,5+lane*1.3,-148-lane*2],[left,5+lane*1.3,-148-lane*2],[left,48+lane*3,-110],[other.at[0],48+lane*3,other.at[2]]];add('sonar-'+pin.toLowerCase(),`Sensor ${pin} → ${pin==='VCC'?'5 V tie':pin==='GND'?'ground tie':pin==='TRIG'?'D2':'D3'}`,physical,other,color,pin==='ECHO'?'ECHO pulse width returns to Uno D3. Disconnect this end only with both supplies off.':pin==='TRIG'?'Uno D2 sends the sketch trigger pulse.':pin==='VCC'?'Sensor VCC uses Uno 5 V through column 2 negative-bank row 2.':'Sensor ground returns through column 2 positive-bank row 2.',via,{echo:pin==='ECHO'});};
 sonar('VCC',H(1,-1,1),0,'#c95f70');sonar('TRIG',S('D2'),1,'#d0a34e');sonar('ECHO',S('D3'),2,'#659dc5');sonar('GND',H(1,1,1),3,'#45536a');
 add('driver-vcc','Logic distribution → driver VCC',H(1,-1,2),D('VCC'),'#c95f70','Uno logic power, not motor VM.');
 add('driver-ground','Common reference → driver GND',H(1,1,3),D('GND'),'#465469','Signal ground joins the driver logic and motor reference.');
 add('pwm','Uno D5 → driver PWMA',S('D5'),D('PWMA'),'#8f79b5','PWM is 105 while the sketch enables the collection paddle.');
 add('direction','Uno D6 → driver AIN1',S('D6'),D('AIN1'),'#c59754','D6 holds the chosen collection direction; AIN2 stays grounded.');
 add('enable','Uno D8 → driver STBY',S('D8'),D('STBY'),'#75a68b','D8 disables drive when the sketch stops or detects full / unavailable sensing.');
 add('button','Uno D7 → Start/Stop input',S('D7'),H(7,-1,0),'#a17fb5','Column 8 negative-bank row 1 shares the switch signal leg. D7 uses INPUT_PULLUP.');
 add('button-return','Switch return → common reference',H(7,1,4),H(1,1,2),'#44536b','Positive-bank column 8 row 5 returns to ground column 2 row 3.');
 add('ground-bridge','Link the two ground groups',H(1,1,4),H(3,1,0),'#526078','Column 2 row 5 → column 4 row 1, both positive bank. These are isolated five-hole ties before this jumper is fitted.');
 for(const[pin,row]of[['PWMB',1],['BIN1',2],['BIN2',3],['AIN2',4]] as const)add('fixed-'+pin.toLowerCase(),`Ground extension → driver ${pin}`,H(3,1,row),D(pin),'#596376',pin==='AIN2'?'Grounded AIN2 fixes the second channel A direction input.':'This unused channel B input is held low.');
 add('motor-vm','Switched AA positive → driver VM',end(battery('positive'),'solder'),D('VM'),'#bd596a','Separate nominal 6 V motor source. Bypasses Uno 5 V and breadboard ties.',undefined,{motor:true});
 add('motor-return','AA negative → driver power GND',end(battery('negative'),'solder'),D('GND1'),'#4c5363','Motor return directly joins a driver power-ground terminal; the board joins it to the common reference.',undefined,{motor:true});
 for(const lead of[0,1] as const){const a=D(lead===0?'A01':'A02'),b=end(aquaMotorContact(lead),'solder',[-1,0,0]);add('motor-'+lead,`Driver ${lead===0?'A01':'A02'} → paddle motor lead ${lead+1}`,a,b,lead===0?'#c3775c':'#7c677c','Channel A supplies the motor through these two leads. Reversing the pair reverses the collection direction.',[[a.at[0],34+lead*4,a.at[2]],[-265,45+lead*4,180+lead*4],[-125,90+lead*4,180+lead*4],[-120,b.at[1],145]],{motor:true});}
 if(!echoConnected){const w=wires.find(w=>w.echo)!;w.b={...w.b,at:[w.b.at[0]+8,w.b.at[1]+9,w.b.at[2]-8]};w.via[w.via.length-1]=[w.b.at[0],w.b.at[1]+23,w.b.at[2]];}
 return wires;
}
