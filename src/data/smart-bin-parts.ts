import{binLoomParts}from'./smart-bin-loom';
import{binMechanicalParts}from'./smart-bin-layout';import{binSensorParts}from'./smart-bin-sensor';
/** Project-specific explanations: the shared HC-SR04 mesh is mounted on this lid. */
export const binSonarParts=[
 ['bin-sonar-pcb','Lid-mounted HC-SR04 board','The blue module rotates with the actual bin lid. Its nominal acoustic datum is 500 mm above the empty floor when closed.','VCC / GND supply 5 V logic; Uno D2 triggers the module and D3 reads its echo pulse.'],
 ['bin-sonar-transmitter','Load-facing ultrasonic transmitter','Emits the acoustic burst towards the clean load target when the closed lid has settled.','The board requests a burst after the 10 µs trigger. Measurements are suspended while the lid is open.'],
 ['bin-sonar-receiver','Reflected-pulse receiver','Detects sound reflected from the broad load target. An irregular surface may behave differently from this ideal target.','The module returns the round-trip time as the ECHO pulse. Missing echoes blank the reading and indicator.'],
 ['bin-sonar-controller','Sensor timing electronics','Local packages illustrate pulse timing and receiver signal conditioning; markings vary by module revision.','Joins the transducers and four header contacts. Insulating spacers keep the rear packages clear of the lid plate.'],
 ['bin-sonar-vcc','Sensor VCC contact','Provides the ultrasonic module power.','Connect to Uno 5 V; do not connect to an unrelated motor supply.'],
 ['bin-sonar-trigger','Sensor TRIG contact','Receives the sketch’s short trigger request.','Connect to Uno D2. The source waits 200 ms between eligible samples after lid settling.'],
 ['bin-sonar-echo','Sensor ECHO contact','Pulse width represents the nominal sound round trip.','Connect to Uno D3. Disconnecting it produces SENSOR_FAULT, rather than a zero-fill reading.'],
 ['bin-sonar-ground','Sensor GND contact','Provides the shared zero-volt signal reference.','Connect to Uno ground. Keep the flexible cable away from the hinge pinch point.'],
] as const;
export const binFoundationParts=[...binMechanicalParts,...binSensorParts,...binSonarParts,...binLoomParts].map(([id,name,description,connection])=>({id,name,description,connection}));
