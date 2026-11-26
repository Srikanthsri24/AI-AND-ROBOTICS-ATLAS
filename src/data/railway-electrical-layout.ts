import {carMiniHole} from './bluetooth-mini-breadboard';
export type RailwayPoint=readonly[number,number,number];
export const railwayWarningBoardAt=[95,0,120] as const;
export function railwayWarningHole(column:number,row:number):RailwayPoint{const p=carMiniHole(column,-1,row);return[p[0]*50+95,p[1]*50,p[2]*50+120];}
export const railwayWarningPins={resistorInput:railwayWarningHole(5,0),resistorOutput:railwayWarningHole(9,0),anode:railwayWarningHole(9,2),cathode:railwayWarningHole(10,2),d6:railwayWarningHole(5,4),ground:railwayWarningHole(10,4)};
export const railwayServoLeads=[{pin:'signal',color:'#d39146',node:'uno-d9'},{pin:'positive',color:'#c84556',node:'servo-5v'},{pin:'ground',color:'#745340',node:'common-ground'}] as const;
export function railwayServoContact(n:number):RailwayPoint{if(!Number.isInteger(n)||n<0||n>2)throw Error('Unknown servo contact');return[-100+(n-1)*2.54,8,95.5];}
export function railwayServoTail(n:number):readonly RailwayPoint[]{const end=railwayServoContact(n),lane=n-1;return[[-73,10+lane*.9,45],[-77,10+lane*.9,45],[-88,8+lane,67],[-95,8+lane*1.1,75],[end[0],8+lane*1.1,79],[end[0],8,83],[end[0],8,88.5]];}
export const railwayElectricalParts=[
 {id:'railway-servo-grommet',name:'Servo cable-entry grommet',what:'Protects the fixed three-wire cable where it enters the case.',connection:'The side panel has an actual entry bore. Pull on the plug housing, not these fixed leads.'},
 {id:'railway-servo-plug',name:'Three-socket servo plug',what:'Three open mating bores expose recessed metal crimp contacts inside the insulated housing.',connection:'The Uno supplies the D9 signal. A separate regulated 5 V source supplies servo power; grounds must be joined.'},
 ...railwayServoLeads.flatMap(w=>[
  {id:`railway-servo-${w.pin}-tail`,name:`Fixed servo ${w.pin} lead`,what:'Runs continuously from the case grommet to its supported connector.',connection:w.pin==='signal'?'Orange carries the D9 angle command.':w.pin==='positive'?'Red carries separate regulated +5 V; do not join this positive rail to Uno 5 V.':'Brown returns servo current to the separate source; a separate reference link joins Uno GND.'},
  {id:`railway-servo-${w.pin}-contact`,name:`Servo ${w.pin} contact`,what:'A supported metal mating contact at the end of the fixed lead.',connection:w.pin==='signal'?'Mate with the D9 jumper.':w.pin==='positive'?'Mate with the independent servo +5 V jumper.':'Mate with the independent servo ground jumper.'},
 ]),
 {id:'railway-warning-board',name:'Sensor and warning mini breadboard',what:'Each column has two separate banks of five connected holes. The centre gap separates the banks.',connection:'The rear bank holds the warning circuit in columns 6, 10 and 11. In the front bank, column 1 supplies the four sensor housings and column 2 returns their ground. Each strip has exactly five holes.'},
 {id:'railway-warning-resistor',name:'220 Ω current-limiting resistor',what:'Red, red, brown and gold bands identify 220 Ω with 5% tolerance.',connection:'It lies in series from column 6 to column 10. It is not a wire directly across the LED.'},
 {id:'railway-warning-resistor-input',name:'Resistor input lead',what:'Inserts into column 6 of the warning board.',connection:'Another hole in this same five-contact strip accepts the Uno D6 jumper.'},
 {id:'railway-warning-resistor-output',name:'Resistor output lead',what:'Inserts into column 10 of the warning board.',connection:'The same five-contact strip also holds the LED anode, completing the series connection.'},
 {id:'railway-warning-lens',name:'Red warning LED',what:'A domed red 5 mm LED warns while the controller is occupied or leaving.',connection:'D6 stays HIGH throughout these phases. The original sketch lights it steadily; it does not blink.'},
 {id:'railway-warning-anode',name:'LED anode lead',what:'The positive LED terminal connects to the resistor output strip.',connection:'It occupies the middle hole of column 10 in the numbered bank. Current reaches it through the 220 Ω resistor.'},
 {id:'railway-warning-cathode',name:'LED cathode lead',what:'The return terminal is on the flat-flange side of the LED.',connection:'It occupies the middle hole of column 11 in the numbered bank, and returns to Uno GND through the same strip.'},
];
