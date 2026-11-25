import uno from './uno-r3-board-layout.json';
import {radarHeadPoint,radarSonarContact} from './radar-scanner-layout';
export type RadarHarnessPoint=[number,number,number];
export const radarUnoAt=[-115,9,-80] as const;
export const radarSonarLeads=[
 {id:'radar-lead-vcc',name:'Sonar power · Uno 5 V → VCC',socket:'5V',x:-3.81,color:'#c95767'},
 {id:'radar-lead-trigger',name:'Trigger · Uno D2 → TRIG',socket:'D2',x:-1.27,color:'#c6a34f'},
 {id:'radar-lead-echo',name:'Echo · HC-SR04 ECHO → Uno D3',socket:'D3',x:1.27,color:'#6198c2'},
 {id:'radar-lead-ground',name:'Sensor ground · Uno GND → GND',socket:'GND-P1',x:3.81,color:'#364454'},
] as const;
export const radarUnoParts=[
 ['radar-uno-pcb','Arduino Uno R3','Runs the original sweep sketch and prints angle_deg,range_cm at 115200 baud.','The sonar is powered from this board’s 5 V rail. Servo motor power comes from its separate regulated supply.'],
 ['radar-uno-mcu','ATmega328P controller','Commands D9, waits 90 ms, triggers D2 and measures D3 with a 10,000 µs timeout.','The actual servo bearing can differ from the requested angle if servo power or common ground is missing.'],
 ['radar-uno-headers','Uno female sockets','Accept the individually labelled sensor and servo-signal jumpers.','D2 → TRIG, D3 ← ECHO, D9 → servo signal. Sonar VCC → 5 V; both supplies share GND.'],
 ['radar-uno-usb','Uno USB-B socket','Provides sketch upload, serial output and Uno logic power.','Switch the independent servo supply off during upload; USB power does not substitute for servo motor power.'],
 ['radar-uno-bridge','USB serial interface','Connects the computer’s USB link to the Uno’s serial port.','Open the serial monitor at 115200 baud to read the CSV header and sweep samples.'],
 ['radar-uno-power','Uno power conditioning','Supports the Uno and sonar logic supply. The barrel socket is unused.','Do not connect the independent servo supply positive to the Uno 5 V pin in this build.'],
 ['radar-uno-reset','Reset button','Restarts setup and its 1.5-second startup delay.','The source first commands 90°, then begins scanning from 30°.'],
 ['radar-uno-tracks','Uno copper tracks','Route the board signals between controller, power circuitry and sockets.','The four sensor jumpers terminate at actual named header contacts.'],
 ['radar-uno-programming','ICSP headers','Provide low-level programming access to the controller and USB interface.','Leave them unused; this guide uploads through USB.'],
 ['radar-uno-leds','Uno status indicators','The ON indicator follows the Uno logic supply.','These indicators are not sonar targets or distance measurements. Read range from the CSV output and plot.'],
 ['radar-uno-supports','Insulating Uno supports','Keep the underside solder joints above the work surface.','Four bored posts align with the actual Uno mounting holes.'],
 ['radar-uno-bolts','Uno mounting fasteners','Pass through the mounting holes into the support posts.','They hold the board steady while plugs are seated.'],
] as const;
export const radarHarnessParts=radarSonarLeads.flatMap(lead=>[
 [lead.id,lead.name,'A flexible jumper retains a slack loop as the sensor head rotates.','The cable physically joins its two labelled plugs; follow the wire to identify its endpoints.'],
 [lead.id+'-sonar',lead.name.split(' · ')[0]+' · sensor plug','An open female socket slides over the actual HC-SR04 metal pin.','Seat with power off. The short withdrawal travel clears the pin while keeping the housing above the bracket floor.'],
 [lead.id+'-uno',lead.name.split(' · ')[0]+' · Uno plug','A male jumper pin seats inside the actual '+lead.socket+' female socket.','The signal map follows the original Arduino sketch. Seat this plug with power off.'],
] as const);
export function radarUnoSocket(name:string):RadarHarnessPoint{
 const h=uno.headers.find(h=>h.name===name);if(!h)throw Error('Unknown radar Uno contact '+name);
 return[radarUnoAt[0]+h.x-34.29,radarUnoAt[1]+9.3,radarUnoAt[2]+26.67-h.y];
}
export function radarUnoMounts():RadarHarnessPoint[]{return uno.holes.map(h=>[radarUnoAt[0]+Number(h.x)-34.29,radarUnoAt[1]-.8,radarUnoAt[2]+26.67-Number(h.y)]);}
export function radarLeadPose(index:number,heading:number,sonarWithdraw=0,unoWithdraw=0){
 const lead=radarSonarLeads[index];if(!lead)throw Error('Unknown sonar lead');
 if(!Number.isFinite(heading)||heading<10||heading>170)throw Error('Head outside scanner fitting range');
 if(!Number.isFinite(sonarWithdraw)||sonarWithdraw<0||sonarWithdraw>4||!Number.isFinite(unoWithdraw)||unoWithdraw<0||unoWithdraw>5)throw Error('Connector outside seating travel');
 const sonar=radarSonarContact(lead.x,heading),socket=radarUnoSocket(lead.socket),head=(p:RadarHarnessPoint)=>radarHeadPoint(p,heading);
 const points:RadarHarnessPoint[]=[
  head([lead.x,49-sonarWithdraw,0]),head([lead.x,48-sonarWithdraw,-2]),head([lead.x,46+index,-18]),head([lead.x,48+index*3,-40]),
  [-48-index*3,48+index*3,-72-index*3],[-70-index*4,48+index*3,-80-index*2],
  [socket[0],42+index*3,socket[2]],[socket[0],35+unoWithdraw,socket[2]],[socket[0],26.3+unoWithdraw,socket[2]],
 ];
 return{sonar,socket,sonarPlug:head([lead.x,-sonarWithdraw,0]),unoPlug:[socket[0],socket[1]+unoWithdraw,socket[2]] as RadarHarnessPoint,points};
}
