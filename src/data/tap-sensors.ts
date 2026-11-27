import {soapSonar,soapSonarPins} from './soap-dispenser-sonar';
import {tapPlumbing} from './tap-plumbing';
/** SEN0485 external envelope from DFRobot dimension V1.0. Housing detail is authored. */
export const tapLevelDimensions={width:10.6,height:16.9,depth:4,cableLength:515} as const;
export const tapLevelPlacement=[65,tapPlumbing.levelCenter,87] as const;
export const tapSonarPlacement=[tapPlumbing.sonarFace[0],tapPlumbing.sonarFace[1]+soapSonar.canFront,tapPlumbing.sonarFace[2]] as const;
export const tapSensorPlate={bottom:tapSonarPlacement[1]+1.6+6,thickness:3,width:55,depth:28};
export function tapSonarWorld(p:readonly[number,number,number]):[number,number,number]{return [tapSonarPlacement[0]+p[0],tapSonarPlacement[1]-p[2],tapSonarPlacement[2]+p[1]];}
export function tapSonarContact(id:string){const pin=soapSonarPins.find(p=>'tap-'+p.id===id);if(!pin)throw new Error('Unknown tap sonar contact');return tapSonarWorld([pin.x,-16,0]);}
export const tapSensorParts=[
 ['tap-level-case','Level sensor · SEN0485 housing','A sealed purple rectangular housing sits flat against the nonmetal reservoir. Its 10.6 × 16.9 × 4 mm external envelope follows the manufacturer drawing. The water stays inside the tank.'],
 ['tap-level-face','Level sensor · sensing face','The flat face senses water through the 3 mm wall without entering the tank. Mount it at the minimum level, above the intake; this is a point-level check, not a continuous depth measurement.'],
 ['tap-level-potting','Level sensor · sealed cable entry','Encapsulation closes the back of the sensor around its three leads. The internal capacitance electronics are not exposed; the teaching model does not invent a visible circuit behind the seal.'],
 ['tap-level-out','Level sensor · green OUT → Uno D4','The green lead carries the active-low level signal. With valid sensor power and ground, LOW means water reaches the sensing position; HIGH requests a pump stop.'],
 ['tap-level-vcc','Level sensor · red VCC → Uno 5 V','The red lead powers the sensor from the Uno 5 V rail. It is separate from the independent supply used by the pump motor.'],
 ['tap-level-gnd','Level sensor · black GND → Uno GND','The black lead provides the signal reference shared with the Uno. Connect all sensor wiring while power is disconnected.'],
 ['tap-sonar-support','Hand detector · dry overhead support','Connects the central frame post to the sensor mounting plate above the basin. It holds the detector beside the spout, offset from the water stream.'],
 ['tap-sonar-plate','Hand detector · drilled mounting plate','Four open bores line up with the real HC-SR04 board holes. The plate is above the board and leaves the transducer faces and four header pins clear.'],
 ['tap-sonar-spacers','Hand detector · insulating spacers','Four hollow 6 mm sleeves separate the board back from the mounting plate. Their ends meet the board and plate; these are mechanical supports, not signal paths.'],
 ...soapSonar.holes.map((_,i)=>['tap-sonar-screw-'+i,'Hand detector · corner fastener '+(i+1),'A screw passes through the plate, spacer and PCB bore. Washers and a nut retain this corner without touching either ultrasonic can.'] as const),
 ['tap-soap-sonar-pcb','Hand detector · HC-SR04 board','Supports the two ultrasonic transducers and timing electronics. Its lowest front rims sit 26 cm above the flat target with the face pointing down.'],
 ['tap-soap-sonar-transmitter','Hand detector · ultrasonic transmitter','Sends a burst after the 10 µs trigger from Uno D2. Sound travels down to a hand or the clear-space target, then reflects toward the receiver.'],
 ['tap-soap-sonar-receiver','Hand detector · ultrasonic receiver','Receives the reflection. The ECHO pulse sent to Uno D3 encodes the round trip; a missing echo stops the tap rather than representing a nearby hand.'],
 ['tap-soap-sonar-controller','Hand detector · timing electronics','Links power, trigger, echo and the transducers. The visible packages are teaching detail; they are not a reconstruction of the manufacturer circuit.'],
 ...soapSonarPins.map(p=>['tap-'+p.id,'Hand detector · '+p.name+' → Uno '+p.pin,p.name==='TRIG'?'Uno D2 sends a 10 µs pulse to this actual square contact to start one ultrasonic acquisition.':p.name==='ECHO'?'This contact sends the timed ECHO pulse to Uno D3. The tap sketch waits at most 7 ms before treating an unavailable echo as a stop condition.':p.name==='VCC'?'This actual square contact takes 5 V from the Uno sensor rail; it does not power the pump motor.':'This actual square contact joins the shared Uno ground reference so trigger and echo have a valid zero-volt level.'] as const),
] as const;
