import uno from './uno-r3-board-layout.json';
import {trafficParkingCircuitLayout as layout} from './traffic-parking-circuit-layout';
import {trafficParkingSignalParts} from './traffic-parking-signals';
import {trafficParkingBarrierParts} from './traffic-parking-barrier';
import {trafficParkingCircuitParts} from './traffic-parking-circuit-layout';
import {trafficParkingSupplyParts} from './traffic-parking-supply';
import {trafficParkingServoLeadParts} from './traffic-parking-servo-lead';
export const trafficParkingBays=[{id:'tp-bay-1',number:1,x:70,z:-95},{id:'tp-bay-2',number:2,x:70,z:-65},{id:'tp-bay-3',number:3,x:70,z:-35}] as const;
export const trafficParkingUnoSupports=uno.holes.map(p=>({x:layout.uno[0]+ +p.x-34.29,z:layout.uno[2]+26.67- +p.y,height:layout.uno[1]-.8}));
const part=(id:string,label:string,what:string,connection:string)=>({id,label,what,connection});
export const trafficParkingBenchParts=[
 part('tp-work-mat','Insulated work mat','Separates the tabletop junction, parking model and electronics into clear working areas.','The mat provides no electrical connection. Every return still needs a real wire to the common ground bus.'),
 part('tp-junction-card','Two-street model junction','The Main and Cross approaches have separate stop lines and signals.','D2–D4 control Main; D5–D7 control Cross. The sketch inserts an all-red interval between green directions.'),
 part('tp-parking-card','Parking entrance and separate exit','The entrance passes under the barrier; the separate exit lane stays outside its sweep.','Entry and Exit are operator requests, not automatic vehicle sensing. Move one model car per accepted request.'),
 ...trafficParkingBays.map(b=>part(b.id,'Parking bay '+b.number,'A marked physical bay for one model car.','The sketch counts operator reservations, not this bay’s visible contents. Confirm Exit only after a car leaves through the separate route.')),
 part('tp-uno-supports','Uno · four insulating supports','Carry the board at its actual mounting-hole positions above the mat.','The hollow supports receive the insulating fasteners. Their shoulders touch the underside of the PCB without providing a ground path.'),
 part('tp-uno-fasteners','Uno · insulating retaining screws','Secure the PCB through its four mounting holes.','Fit after placing the Uno on its supports. Keep the socket rows and USB-B opening accessible.'),
 part('tp-servo-stand','Barrier · tabletop stand','Two uprights support the lower edges of the servo bracket above a wide foot.','The bracket and casing stay fixed while the striped arm rotates. The insulating stand carries no power or signal.'),
 part('tp-board-bases','Breadboards · insulating bases','Give both mini breadboards a level bearing surface.','The base is mechanical; only the breadboards’ separate metal five-contact strips conduct current.'),
];
export const trafficParkingUnoParts=[
 part('tp-uno-pcb','Uno R3 circuit board','Holds the controller, USB interface and signal sockets.','USB powers the logic. Seven digital outputs drive individual LED resistor branches; A0/A1 read the buttons and D9 commands the separately powered servo.'),
 part('tp-uno-mcu','ATmega328P controller','Runs the six-phase junction timetable and independent parking-request state machine.','Keeps traffic timing active while the barrier is open. Capacity is three accepted reservations; pressing a button is not vehicle detection.'),
 part('tp-uno-headers','Uno · power and signal sockets','Receive the labelled male jumper pins at the board’s actual header positions.','Use D2–D7, D10, D9, A0, A1 and GND. Leave Uno 5 V separate from the servo supply positive.'),
 part('tp-uno-usb','Uno · USB-B socket','Provides logic power and the programming/serial connection.','Upload traffic_parking.ino and use 115200 baud. The static browser workshop demonstrates the sketch without uploading to physical hardware.'),
 part('tp-uno-bridge','Uno · USB serial interface','Connects USB data to the main controller’s serial port.','Reports Spaces left and Entry denied. This interface does not measure the cars or the servo’s mechanical position.'),
 part('tp-uno-power','Uno · power circuitry','Conditions board power for the controller and logic.','Use USB for this guided build. Keep the barrel input unused and do not feed the motor from Uno 5 V.'),
 part('tp-uno-reset','Uno · reset button','Restarts setup and clears the temporary parking counter.','Reset starts with zero reservations and the Main-green/Cross-red phase. Remove or recount physical model cars so they agree with a fresh counter.'),
 part('tp-uno-tracks','Uno · copper routes','Carry signals and supplies between the controller and sockets.','Routing follows the original Uno board layout. Connect students’ jumpers to sockets rather than exposed tracks.'),
 part('tp-uno-programming','Uno · ICSP headers','Provide dedicated programming contacts for the two AVR chips.','Leave them unconnected in this project. The normal Arduino USB upload path is used.'),
 part('tp-uno-leds','Uno · status LEDs','Indicate board power and serial activity.','The ON indicator follows Uno USB logic power. It does not prove that the independent servo supply is enabled.'),
];
export const trafficParkingHardwareParts=[...trafficParkingSignalParts,...trafficParkingBarrierParts,...trafficParkingCircuitParts,...trafficParkingSupplyParts,...trafficParkingServoLeadParts,...trafficParkingBenchParts,...trafficParkingUnoParts];
