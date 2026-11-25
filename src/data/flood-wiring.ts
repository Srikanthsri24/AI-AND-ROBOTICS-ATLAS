import uno from './uno-r3-board-layout.json';
import {floodPanelHole,floodPanelNets,floodPiezo} from './flood-panel-layout';
import {floodSensorWorld,floodSonarContact,floodSonarPins,type FloodPoint} from './flood-workshop-layout';
export const floodPlacement={uno:[-310,9,-50] as FloodPoint,panel:[-310,0,35] as FloodPoint};
export function floodAdd(a:FloodPoint,b:FloodPoint):FloodPoint{return a.map((v,k)=>v+b[k]) as FloodPoint;}
export function floodUnoContact(name:string):FloodPoint{const p=uno.headers.find(p=>p.name===name);if(!p)throw Error('Unknown Uno contact '+name);return floodAdd(floodPlacement.uno,[(p.x-34.29),9.3,26.67-p.y]);}
export function floodBoardContact(column:number,bank:-1|1,row:number){return floodAdd(floodPlacement.panel,floodPanelHole(column,bank,row));}
export type FloodWire={id:string;title:string;purpose:string;connection:string;color:string;points:FloodPoint[];sensor?:boolean};
/** All repeated ground connections fan out through two real, linked five-hole strips.
 * No stacked jumper plugs or fictitious edge power rails are used.
 */
export function floodWires(mountGapMm=230):FloodWire[]{
 const wires:FloodWire[]=[],short=(id:string,title:string,a:FloodPoint,b:FloodPoint,color:string,connection:string,lift=24)=>wires.push({id,title,purpose:'This insulated jumper joins the two labelled physical terminals. Its copper core completes this branch of the lesson circuit.',connection,color,points:[a,[a[0],lift,a[2]],[a[0],lift+3,(a[2]+b[2])/2],[b[0],lift,b[2]],b]});
 for(const[n,i]of floodPanelNets.map((n,i)=>[n,i] as const)){
  short(`wire-${n.pin}`,`${n.pin} → 220 Ω input`,floodUnoContact(n.pin),floodAdd(floodPlacement.panel,n.input),['#55a886','#d9ac48','#dd6573','#9c7ac8'][i],`${n.pin} enters column ${i===3?16:[1,6,11][i]}, negative bank. The resistor crosses the centre trench.`,25+i*3);
  const bus=i<3?floodBoardContact(3,1,i):floodBoardContact(3,-1,0);
  short(`wire-return-${i}`,`${i===3?'Piezo':['Green LED','Amber LED','Red LED'][i]} return → ground bus`,floodAdd(floodPlacement.panel,n.ground),bus,'#3f495c','The cathode / return strip joins the linked common-ground strips in column 4.',20+i*2);
 }
 short('wire-ground-bridge','Link both ground banks',floodBoardContact(3,-1,4),floodBoardContact(3,1,4),'#3f495c','Links the two five-hole groups in column 4; neither group is an edge rail.',15);
 short('wire-uno-ground','Uno ground → common return',floodUnoContact('GND-D'),floodBoardContact(3,-1,2),'#3f495c','Connects Uno GND-D to negative-bank column 4, row 3.',22);
 const out=floodPanelNets[3];
 short('wire-piezo-signal','220 Ω output → piezo +',floodAdd(floodPlacement.panel,out.output),floodAdd(floodPlacement.panel,[floodPiezo.at[0]-3.25,1,0]),'#9c7ac8','Positive-bank column 16 feeds the actual piezo signal lead.',18);
 short('wire-piezo-return','Piezo − → return strip',floodAdd(floodPlacement.panel,[floodPiezo.at[0]+3.25,1,0]),floodBoardContact(16,1,1),'#3f495c','The other piezo lead joins positive-bank column 17, then the ground bus.',16);
 for(const[p,i]of floodSonarPins.map((p,i)=>[p,i] as const)){
  const a=floodSensorWorld(floodSonarContact(p.id),mountGapMm),b=p.name==='GND'?floodBoardContact(3,-1,1):floodUnoContact(p.name==='VCC'?'5V':p.pin),top=a[1]+26;
  wires.push({id:`wire-${p.id}`,title:`${p.name} → ${p.pin}`,purpose:p.name==='ECHO'?'Carries the echo pulse duration back to D3. Removing it produces the timed unavailable state.':p.name==='TRIG'?'Carries the sketch’s 10 µs trigger pulse from D2.':'Supplies the dry sensor and its common reference.',connection:p.name==='GND'?'Sensor GND → linked ground bus → Uno GND-D.':`Sensor ${p.name} → Uno ${p.pin}.`,color:p.color,sensor:true,points:[a,[a[0],a[1],-28-i*2],[a[0],top,-32-i*2],[-200-i*3,top,-32-i*2],[-220-i*3,top-15,-32-i*2],[-230-i*3,30,-32-i*2],[b[0],24,b[2]-8],b]});
 }
 return wires;
}
export const floodUnoParts=[
 ['uno-pcb','Arduino Uno R3 board','Supports the controller and the actual labelled sockets. Insulating feet keep its solder joints off the dry work surface.','USB supplies this station; its barrel jack is unused.'],
 ['uno-mcu','ATmega328P controller','Runs the published Arduino C++ sketch: times the echo, subtracts the calibrated gap and sets the warning outputs.','D2 trigger, D3 echo, D5–D7 lamps and D9 piezo.'],
 ['uno-headers','Uno female header contacts','The wires enter individual physical sockets matching the board CAD coordinates.','5 V and GND supply the sensor. Six digital pins carry trigger, echo and four outputs.'],
 ['uno-usb','USB-B upload and power socket','Connects the computer for 5 V power, uploading and the 9600-baud Serial Monitor.','Unplug before changing any sensor, lamp or sounder wire.'],
 ['uno-bridge','USB serial interface','The ATmega16U2 handles USB communication separately from the main controller.','Transfers the sketch upload and serial readings through the USB connector.'],
 ['uno-power','Power conditioning','The regulator and capacitors support the board supply. The barrel input is unused here.','The USB source powers the Uno and dry sensor.'],
 ['uno-reset','Reset button','Restarts the uploaded sketch. It does not change the compiled EMPTY_MM constant.','To change the empty calibration, edit the constant and upload again.'],
 ['uno-tracks','Board copper tracks','The board routing connects its sockets, processors and supporting components.','External jumpers continue these paths to the sensor and breadboard.'],
 ['uno-programming','ICSP headers','Alternative programming contacts for the two AVR chips.','Leave both unconnected for this USB-uploaded lesson.'],
 ['uno-leds','Board status indicators','ON indicates power; RX / TX are upload and serial activity indicators.','The three external lamps show flood state. The built-in D13 lamp is not used.'],
] as const;
