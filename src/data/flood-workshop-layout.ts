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

/** Authored teaching basin, not the stock photograph's manufacturer dimensions.
 * The inside bottom is the depth datum. Electronics remain outside the drip tray.
 */
export const floodBench={floorY:8,basinHeight:110,basinLower:[260,180],basinUpper:[300,220],wall:2,standX:-200,standBase:[60,8,80],tray:[324,3,244]} as const;
export function floodWaterY(depthMm:number){if(!Number.isFinite(depthMm)||depthMm<0||depthMm>100)throw Error('Stop filling at 100 mm.');return floodBench.floorY+depthMm;}
export function floodSensorPose(mountGapMm=230):FloodPoint{if(!Number.isFinite(mountGapMm)||mountGapMm<200||mountGapMm>300)throw Error('Unsupported dry stand height');return [0,floodBench.floorY+mountGapMm+floodSonar.canFront,0];}
export function floodSensorWorld(local:FloodPoint,mountGapMm=230):FloodPoint{const p=floodSensorPose(mountGapMm);return [p[0]+local[0],p[1]-local[2],p[2]+local[1]];}
export function floodWaterExtent(depthMm:number):[number,number]{floodWaterY(depthMm);const t=depthMm/floodBench.basinHeight;return [floodBench.basinLower[0]+(floodBench.basinUpper[0]-floodBench.basinLower[0])*t-2*floodBench.wall,floodBench.basinLower[1]+(floodBench.basinUpper[1]-floodBench.basinLower[1])*t-2*floodBench.wall];}
export const floodBasinParts=[
 ['flood-tray','Drip tray','Catches small tabletop splashes and separates the wet basin from the dry electronics.','The basin sits inside it; the controller and breadboard sit outside it.'],
 ['flood-basin','Clear marked basin','The open basin holds the changing water level. Marks are measured from the inside bottom, not from the bench.','A clear path above the centre lets the sensor receive the water-surface echo.'],
 ['flood-water','Water surface','The physical water level is the simulation input. The sensor reading is calculated separately after its acoustic round trip.','The reflected pulse returns to the receiver; water must not touch the sensor or its wiring.'],
 ['flood-stand','Dry sensor stand','A weighted foot and adjustable upright keep the sensor facing straight down. The model stand dimensions are authored teaching geometry.','The overhead arm supports four insulating standoffs at the sensor mounting holes.'],
 ['flood-mount-screws','Sensor mounting screws','Four shafts descend through the support plate and board holes after the sensor is seated.','The drilled spacers keep the board clear of the plate; the washers seat on its upper face.'],
 ['flood-mounts','Sensor mounting spacers','Four insulating sleeves hold the board clear of its metal support, with visible screw heads and washers.','They align with the actual board holes. They are mechanical supports, not electrical ground connections.'],
] as const;
