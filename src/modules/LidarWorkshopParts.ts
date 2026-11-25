import {lidarAirframeParts} from './LidarAirframe';
import {lidarDeckParts} from './LidarDecks';
import {lidarBatteryParts} from './LidarBattery';
import {lidarRadioParts} from './LidarRadio';
import {lidarBenchParts} from './LidarBench';
import {lidarPropellerParts} from './LidarPropellers';
export const lidarWorkshopParts=[...lidarAirframeParts.map(([id,name,why])=>({id,name,why,stage:0})),...lidarDeckParts.map(([id,name,why])=>({id,name,why,stage:id.startsWith('flow-')?1:3})),...lidarBatteryParts.map(([id,name,why])=>({id,name,why,stage:id.includes('medium')?4:id.includes('board')?0:2})),...lidarRadioParts.map(([id,name,why])=>({id,name,why,stage:6})),...lidarBenchParts.map(([id,name,why])=>({id,name,why,stage:id==='bench-supports'?0:7})),...lidarPropellerParts.map(([id,name,why])=>({id,name,why,stage:8}))];
export function lidarPartConnection(id:string){
 if(id.includes('medium')||id.includes('header'))return 'Both 2 mm rows align through the three boards. The left row carries VCC, SDA, SCL and GND; the right includes SPI, identification and supply signals. Use the matched stock pin strips, never loose Arduino jumper wiring.';
 if(id.startsWith('cf-battery'))return 'Cell → keyed two-contact connector → factory P5 pigtail → flight-board power circuitry. The red positive lead and black ground lead remain separate. Computer USB powers Crazyradio independently.';
 if(id.includes('motor-leads'))return 'Each factory arm plug has two insulated leads to the matching brushed motor terminals. No additional motor driver board is fitted in this kit.';
 if(id.startsWith('cf-motor')||id.startsWith('cf-propeller'))return 'Factory motor power comes from the flight board. The matching propeller hub grips the motor shaft. Bench logging leaves the propellers removed and motors stopped.';
 if(id.startsWith('multi-'))return 'The Multi-ranger connects through the upper expansion rows. Firmware reads its I²C sensors, then sends range.front through the onboard radio to Crazyradio and the host logger.';
 if(id.startsWith('flow-'))return 'The lower deck shares the expansion power and identification contacts. Its PMW3901 uses SPI; its downward range sensor uses I²C. It assists flight firmware, while this logger reads the separate front channel.';
 if(id.startsWith('radio-')||id.startsWith('host-'))return 'Drone radio ⇢ 2.4 GHz wireless link ⇢ Crazyradio 2.0 ⇢ USB-A ⇢ cflib ⇢ Python logger. No cable joins the drone to this dongle.';
 if(id.startsWith('bench-'))return 'The card is measured from the front optical face. Neither the card, ruler nor supports has an electrical connection. The dotted ray is an explanatory overlay; the real infrared light is invisible.';
 return 'This factory-fitted part belongs to the Crazyflie flight board. Onboard traces connect its sensors, processors, power circuitry and motor outputs; the two added decks use the expansion rows.';
}
