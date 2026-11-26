export type BellPoint=readonly[number,number,number];
/** Authored passive piezo cutaway in mm, not manufacturer mechanical CAD.
 * A separate acoustic cavity, bonded disc and two real pin holes keep the
 * instructional model faithful to a passive transducer rather than an LED. */
export const schoolBellPiezo={at:[0,0,0] as [number,number,number],radius:10.5,inner:9.4};
export const schoolBellResistor={from:[-20.32,12,3.81] as BellPoint,to:[-7.62,12,3.81] as BellPoint,bands:['#b94343','#b94343','#784d2b','#c4a650']};
export const schoolBellSounderParts=[
 {id:'school-piezo-cradle',label:'Sounder mounting cradle',what:'Raises the sounder and leaves room for the two connections below.',connection:'This support is mechanical. Its centre slot leaves the signal and ground leads accessible.'},
 {id:'school-piezo-case',label:'Hollow acoustic case',what:'Holds the vibrating disc over an air cavity.',connection:'The internal ledge supports the brass rim. Two separate holes carry the signal and ground pins through the floor.'},
 {id:'school-piezo-lid',label:'Lid and sound opening',what:'Lets the sound leave the case through an open port.',connection:'The virtual lid lifts for inspection with USB disconnected. Do not open a physical sealed sounder; this is an educational cutaway.'},
 {id:'school-piezo-brass',label:'Brass diaphragm',what:'A thin metal disc supports the bonded ceramic and bends with it.',connection:'The return pin and its bond join this brass layer to the common Uno ground.'},
 {id:'school-piezo-ceramic',label:'Piezo ceramic and electrode',what:'Changes shape when the alternating voltage changes, bending the bonded disc to produce sound.',connection:'The signal pin reaches the upper electrode. The sketch commands 880 Hz, a silent gap, then 660 Hz; the ceramic does not glow like an LED.'},
 {id:'school-piezo-signal',label:'Signal pin and internal bond',what:'Carries the alternating tone command into the sounder.',connection:'Uno D9 → 220 Ω series resistor → this pin → upper electrode. A passive piezo needs tone(); steady power alone does not play the two notes.'},
 {id:'school-piezo-return',label:'Ground pin and internal bond',what:'Provides the return connection from the brass layer.',connection:'This separate pin joins Uno GND, RTC GND and display GND. It must not be connected to the D9 signal pin.'},
 {id:'school-piezo-resistor',label:'220 Ω series resistor',what:'Limits brief current when the capacitive piezo is charged at each signal edge.',connection:'Fit in series between D9 and the sounder signal pin. Red–red–brown gives 22 × 10 = 220 Ω; gold is ±5%. Either resistor direction works.'},
] as const;
