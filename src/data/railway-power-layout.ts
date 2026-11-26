import uno from './uno-r3-board-layout.json';
export const railwayUnoAt=[195,9,120] as const;
export const railwaySupplyAt=[-160,0,120] as const;
export const railwaySupplyPorts=[{id:'railway-supply-positive',name:'SERVO +5 V',x:-20,color:'#bd5267',node:'servo-5v'},{id:'railway-supply-negative',name:'MOTOR −',x:0,color:'#344356',node:'common-ground'},{id:'railway-supply-reference',name:'LOGIC REF',x:20,color:'#687992',node:'common-ground'}] as const;
export function railwaySupplySocket(n:number){const p=railwaySupplyPorts[n];if(!p)throw Error('Unknown supply socket');return[railwaySupplyAt[0]+p.x,13,railwaySupplyAt[2]+29] as const;}
export function railwayUnoSocket(name:string){const h=uno.headers.find(h=>h.name===name);if(!h)throw Error('Unknown railway Uno contact '+name);return[railwayUnoAt[0]+h.x-34.29,railwayUnoAt[1]+9.3,railwayUnoAt[2]+26.67-h.y] as const;}
export function railwayUnoMounts(){return uno.holes.map(h=>[railwayUnoAt[0]+Number(h.x)-34.29,railwayUnoAt[1]-.8,railwayUnoAt[2]+26.67-Number(h.y)] as const);}
export const railwayUnoParts=[
 ['railway-uno-pcb','Arduino Uno R3','Runs the original one-way crossing sketch.','D2 reads approach A, D3 reads exit B, D6 drives the warning LED and D9 commands the servo.'],
 ['railway-uno-mcu','ATmega328P controller','Remembers clear, occupied and leaving phases between beam detections.','After A clears, it holds the warning until B has blocked and both beams clear.'],
 ['railway-uno-headers','Uno female header sockets','Receive individually labelled male jumper pins.','The beam pairs use Uno 5 V and GND. Servo motor positive comes from its separate source.'],
 ['railway-uno-usb','Uno USB-B receptacle','Provides logic power, upload and serial communication.','Keep the separate servo output off during upload. The sketch reports at 115200 baud.'],
 ['railway-uno-bridge','USB serial interface','Connects the computer link to the controller’s serial port.','Serial Monitor prints A/B states and the commanded gate state every 200 ms.'],
 ['railway-uno-power','Uno power-conditioning components','Support the logic and sensor supply. The barrel socket is unused.','Do not connect the separate servo positive rail to the Uno 5 V contact.'],
 ['railway-uno-reset','Uno reset button','Restarts the original setup sequence.','Start with the train before A and both beams clear. The sketch assumes this starting position.'],
 ['railway-uno-tracks','Uno copper tracks','Connect the actual headers and components on the board.','Follow the named sockets when wiring rather than guessing from a generic board shape.'],
 ['railway-uno-programming','ICSP programming headers','Provide low-level programming access.','They remain unused in this USB-upload build.'],
 ['railway-uno-leds','Uno status indicators','The ON lamp follows the simulated Uno logic power.','The separate red breadboard LED is the D6 crossing warning; these board indicators are not the gate warning.'],
 ['railway-uno-supports','Insulating board supports','Raise the PCB solder side clear of the base.','Four bored posts align with the board’s actual mounting holes.'],
 ['railway-uno-bolts','Uno mounting fasteners','Hold the board on its insulating supports.','The shafts pass through aligned PCB and support bores.'],
].map(([id,name,what,connection])=>({id,name,what,connection}));
export const railwaySupplyParts=[
 {id:'railway-supply-case',name:'Independent regulated servo source',what:'A separate enclosed 5 V source supplies servo current.',connection:'The Uno and beam sensors keep their own USB-powered logic rail. This reference model is an enclosed DC source; no mains wiring is exposed.'},
 {id:'railway-supply-feet',name:'Source insulating feet',what:'Support the enclosure above the model base.',connection:'They keep its lower panel above the tabletop and clear of cable paths.'},
 {id:'railway-supply-display',name:'Servo-source voltage display',what:'Shows OFF or the authored regulated 5.00 V output setting.',connection:'Its state follows the separate servo-output switch, independently of USB logic power.'},
 {id:'railway-supply-switch',name:'Servo-source output switch',what:'Enables the independent 5 V output.',connection:'Switch it off before fitting the horn or changing servo power connections.'},
 ...railwaySupplyPorts.map(p=>({id:p.id,name:p.name+' socket',what:p.node==='servo-5v'?'Supplies the servo red lead through its mating jumper.':'A negative-source connection on the common ground node.',connection:p.id==='railway-supply-reference'?'Its internal bus joins MOTOR −. A separate reference jumper goes to Uno GND, keeping servo return current out of the logic breadboard.':p.node==='servo-5v'?'This socket must remain separate from Uno 5 V.':'The servo brown lead returns motor current here.'})),
];
