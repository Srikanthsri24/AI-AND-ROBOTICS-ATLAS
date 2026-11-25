import {carMiniHole} from './bluetooth-mini-breadboard';
import type {FloodPoint} from './flood-workshop-layout';
/** Reuse the actual 170-contact mini-board at 50× its original scene scale.
 * A column joins five holes in one bank; there are NO continuous power rails.
 */
export function floodPanelHole(column:number,bank:-1|1,row:number):FloodPoint{return carMiniHole(column,bank,row).map(n=>n*50) as FloodPoint;}
export const floodLamps=[{id:'flood-green',name:'Green normal indicator',column:0,pin:'D5',color:'#30b77e'},{id:'flood-amber',name:'Amber watch / fault indicator',column:5,pin:'D6',color:'#e9af38'},{id:'flood-red',name:'Red warning indicator',column:10,pin:'D7',color:'#ed4c62'}] as const;
export const floodResistors=[...floodLamps.map(l=>({id:`${l.id}-resistor`,column:l.column,pin:l.pin,name:`${l.name.split(' ')[0]} LED resistor`})),{id:'flood-piezo-resistor',column:15,pin:'D9',name:'Piezo series resistor'}];
export const floodPiezo={at:[36,7,0] as FloodPoint,radius:6,leadSpacing:6.5};
export const floodPanelParts=[
 ['flood-breadboard','170-contact dry breadboard','Each column has two separate groups of five connected contacts. The centre trench separates the banks; the edge colours are not power rails.','The four resistors bridge the trench. Each LED cathode returns to the Uno ground through its own jumper.'],
 ...floodLamps.map(l=>[l.id,l.name,l.id==='flood-green'?'Lights only for a valid depth below 50 mm.':l.id==='flood-amber'?'Stays on for 50–79 mm; blinks when the sensor is unavailable.':'Stays on at 80 mm or more while the piezo pulses.',`Uno ${l.pin} → independent 220 Ω resistor → anode. The neighbouring cathode column returns to ground.`]),
 ...floodResistors.map(r=>[r.id,r.name,'A red-red-brown-gold axial resistor represents 220 Ω ±5%. Its real metal leads bridge two isolated breadboard banks.',`Uno ${r.pin} enters the negative-side bank of column ${r.column+1}; the resistor feeds the positive-side bank. It is not shared by other outputs.`]),
 ['flood-piezo','Passive piezo sounder','Produces the warning tone only when the sketch drives its 1800 Hz signal. A sensor fault keeps it silent.','D9 → fourth 220 Ω resistor → signal terminal. The second terminal returns to Uno ground.'],
] as const;
export const floodPanelNets=floodResistors.map(r=>({id:r.id,pin:r.pin,input:floodPanelHole(r.column,-1,0),resistorIn:floodPanelHole(r.column,-1,4),resistorOut:floodPanelHole(r.column,1,0),output:floodPanelHole(r.column,1,4),ground:floodPanelHole(r.column+1,1,0)}));
