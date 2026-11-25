/** Millimetre coordinates. HC-SR04 front is +Z; rotate +π/2 about X to look down.
 * 45 × 20 mm envelope and electrical labels: ELECFREAKS HC-SR04 datasheet.
 * Small details and hole offsets are authored from the local component photograph,
 * not a manufacturing / drilling drawing. Never use this mesh as a fabrication jig.
 */
export type FloodPoint=[number,number,number];
export const floodSonar={width:45,height:20,thickness:1.6,canRadius:8,canFront:14,centres:[-13,13],holes:[[-20,-7.5],[20,-7.5],[-20,7.5],[20,7.5]]} as const;
export const floodSonarPins=[{id:'sonar-vcc',name:'VCC',x:-3.81,pin:'5 V',color:'#df5268'},{id:'sonar-trigger',name:'TRIG',x:-1.27,pin:'D2',color:'#d5a741'},{id:'sonar-echo',name:'ECHO',x:1.27,pin:'D3',color:'#65a8d9'},{id:'sonar-ground',name:'GND',x:3.81,pin:'GND',color:'#344253'}] as const;
export function floodSonarContact(id:string):FloodPoint{const pin=floodSonarPins.find(p=>p.id===id);if(!pin)throw Error('Unknown HC-SR04 contact');return [pin.x,-16,0];}
export const floodSonarParts=[
 ['sonar-pcb','HC-SR04 circuit board','Holds the pulse timing and receiver electronics. Its blue board remains on the dry stand above the basin.','VCC and ground supply the board; D2 triggers it and D3 receives the echo pulse.'],
 ['sonar-transmitter','Ultrasonic transmitter','Emits a short ultrasonic burst after the 10 µs trigger. Its open grille faces straight down at the water.','The board drives this can; sound crosses the air gap to the water surface.'],
 ['sonar-receiver','Ultrasonic receiver','Detects the reflected sound. The model uses the sketch’s fixed sound-speed assumption, so its readings are ideal rather than measured hardware accuracy.','The receiver circuit produces the ECHO duration read by Uno D3.'],
 ['sonar-controller','Pulse timing electronics','The small packages and crystal illustrate the module’s local timing and signal conditioning. Component markings vary by module revision.','Links the TRIG input, transducers and ECHO output on the same board.'],
 ...floodSonarPins.map(p=>[p.id,`${p.name} pin → Uno ${p.pin}`,p.name==='ECHO'?'The high pulse duration encodes the acoustic round trip. Disconnecting this wire produces an unavailable reading, not a safe water level.':p.name==='TRIG'?'A 10 µs high pulse requests the next acoustic measurement.':p.name==='VCC'?'Provides the module’s 5 V supply.':'Provides the shared zero-volt reference.',`The labelled jumper connects this actual header pin to Uno ${p.pin}. Rewire only with USB unplugged.`])
] as const;
