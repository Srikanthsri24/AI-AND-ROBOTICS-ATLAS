import {pianoLayout,pianoPiezoTerminals,type PianoPoint} from './piano-layout';
const [x,,z]=pianoLayout.piezo;
export const pianoPiezoLead=(positive:boolean):readonly PianoPoint[]=>{const side=positive?-1:1,p=pianoPiezoTerminals[positive?'signal':'ground'];return [[x+(positive?-3.8:8),positive?24:23.4,z],[x+side*10,positive?24.1:23.6,z],[x+side*10.2,22,z],[x+side*10.2,17,z],[x+side*10.2,15,z],[x+side*9.5,10,z+10],[p[0],8.7,p[2]]];};
export const pianoPiezoParts=[
 ['piano-piezo-supports','Sounder insulating feet','Hold the sounder bottom above the timber, leaving room for its two separate wires.','These are mechanical supports. They do not replace the piezo return lead.'],
 ['piano-piezo-shell','Passive piezo housing','Protects the thin bending disc. Two actual bottom holes let the insulated leads pass out.','This sounder has no fixed-frequency oscillator. D10 supplies the selected square-wave frequency through the 220 Ω resistor.'],
 ['piano-piezo-brass','Brass diaphragm','Its outer rim rests on an annular housing ledge while its centre bends with the bonded ceramic layer to move air.','The separate return lead is soldered to the exposed brass edge, outside the ceramic electrode.'],
 ['piano-piezo-ceramic','Piezoelectric ceramic electrode','Changes its shape as the applied voltage changes. Its bending drives the brass diaphragm.','The resistor output reaches this electrode through the signal lead. It is electrically separate from the brass return.'],
 ['piano-piezo-grille','Open sounder grille','The central opening and six smaller holes allow air movement and a view of the diaphragm.','Keep the openings clear. The grille is a mechanical cover, not a terminal.'],
 ['piano-piezo-signal-lead','Piezo signal lead','Joins the ceramic electrode to the signal socket, routing around the brass edge.','Its insulated section passes through its own floor hole and terminates in the signal socket crimp.'],
 ['piano-piezo-return-lead','Piezo return lead','Connects the exposed brass rim to the return socket.','Its separate floor opening prevents a contact with the signal conductor. The external return reaches Uno GND through the key ground chain.'],
 ['piano-piezo-signal-socket','Sounder signal socket','An open insulating female housing supports recessed spring contacts.','Receives the jumper from the 220 Ω resistor output. Its bottom crimp joins the fixed ceramic lead.'],
 ['piano-piezo-return-socket','Sounder return socket','A separate recessed contact receives the ground jumper.','Connect this return to common ground. Touching only the outside plastic housing does not complete the circuit.'],
] as const;
