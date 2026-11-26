import layout from './ht16k33-sevenseg-layout.json';
import {schoolBellSegments,schoolBellDisplayPins} from './school-bell-display';
export type SchoolBellDisplayPart={id:string;label:string;what:string;connection:string};
const part=(id:string,label:string,what:string,connection:string):SchoolBellDisplayPart=>({id,label,what,connection});
/** Electrical connections below are traced from the original Eagle contactrefs.
 * Anonymous net names are retained rather than guessing segment-to-pin wiring. */
function contacts(element:string,pad:string){const entry=Object.entries(layout.nets).find(([,refs])=>refs.some(r=>r.element===element&&r.pad===pad));return entry?entry[1].filter(r=>r.element!==element||r.pad!==pad).map(r=>`${r.element} ${r.pad}`).join(', '):'No board net assigned';}
const segmentNames={a:'top',b:'upper-right',c:'lower-right',d:'bottom',e:'lower-left',f:'upper-left',g:'middle'};
const fixed=[
 part('school-display-board','Display circuit board','Supports the display, its driver and the four-wire connection.','Copper tracks join the display pins to the HT16K33. Four mounting holes hold the board without carrying a signal.'),
 part('school-display-plating','Solder pads','Metal rings provide solderable connections around drilled holes.','Each ring belongs to its own electrical net. The rings are not all connected together.'),
 part('school-display-copper','Printed copper tracks','Carry power and signals between components.','The model follows the original board routing. Nearby crossing tracks on opposite faces are separated by the board.'),
 part('school-display-housing','Four-digit LED display','Holds four seven-segment digits and a centre colon.','Fourteen metal leads join this display package to the driver board. Do not connect its segment leads directly to 5 V.'),
 part('school-display-driver','HT16K33 display driver','Stores the digit pattern and refreshes the LEDs repeatedly.','The Uno sends time over A4/SDA and A5/SCL to address 0x70. The driver refreshes the display while the Uno checks the bell schedule.'),
 part('school-display-colon','Hours / minutes separator','The two illuminated dots separate hours from minutes.','The sketch sets drawColon(true). A steady colon does not mean the bell is sounding.'),
 part('school-display-pin-vdd','5 V supply','Powers the display backpack.','Connect to Uno 5 V, shared with RTC VIN. This is a power connection, not the data wire.'),
 part('school-display-pin-gnd','GND return','Provides the common voltage reference.','Connect to Uno GND and RTC GND. All the I²C devices need this shared return.'),
 part('school-display-pin-sda','SDA · data','Carries the time pattern from the Uno to the driver.','Connect to Uno A4/SDA and RTC SDA. Addresses 0x70 and 0x68 distinguish display and clock on this shared wire.'),
 part('school-display-pin-scl','SCL · clock','Times each transfer on the I²C bus.','Connect to Uno A5/SCL and RTC SCL. SCL is separate from SDA and from the clock module’s optional square-wave output.'),
 ...['R1','R2'].map((e,n)=>part('school-display-'+e.toLowerCase(),e+' · 10 kΩ pull-up','Pulls the '+(n?'SDA':'SCL')+' line toward its idle high level.','The board connects this resistor between VDD and '+(n?'SDA':'SCL')+'. It is not an LED series resistor.')),
 part('school-display-c1','C1 · supply capacitor','Smooths short changes in the local supply.','The board connects this 10 µF capacitor between VDD and GND, near the driver.'),
 ...['A0','A1','A2'].map(e=>part('school-display-'+e.toLowerCase(),e+' · address jumper','Changes one address-select bit when the pads are solder-bridged.','Leave this jumper open for the school-bell sketch’s default address 0x70. It is not a socket for an Uno jumper wire.')),
 ...['R3','R4','R5'].map((e,n)=>part('school-display-'+e.toLowerCase(),e+' · 47 kΩ address resistor','Forms part of the address-selection circuit.','Works with '+['A1','A0','A2'][n]+' and the diode network. Leave the fitted resistor in place; no additional student wiring is required.')),
 part('school-display-d1','D1 · 1N4148 diode','Provides a one-way current path in the board’s address circuit.','Its anode joins driver pin P$2 and display lead P$14; its cathode joins R3, R4 and R5. It is not a sounder or power LED.'),
];
export const schoolBellDisplayParts:SchoolBellDisplayPart[]=[...fixed,
 ...schoolBellSegments.map(s=>part(s.id,`Digit ${s.digit+1} · ${segmentNames[s.segment]} segment`,s.digit<2?'One of seven light bars forming the hour.':'One of seven light bars forming the minute.','The HT16K33 refreshes this segment as part of a multiplexed pattern. Lighting combinations form numerals 0–9; the sketch writes digit positions 0, 1, 3 and 4.')),
 ...schoolBellDisplayPins.map(p=>part('school-display-lead-'+p.name,'Display lead '+p.name,'A soldered electrical connection between the LED package and its backpack.',`Board net ${p.net}: joins ${contacts('LED2',p.name)}. These are internal display connections, not the four external I²C wires.`)),
];
export function schoolBellDisplayPart(id:string){return schoolBellDisplayParts.find(p=>p.id===id);}
