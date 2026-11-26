import {rainGeometricBridge,type RainWaterDrop} from './rain-water-sensor';
import {rainUsbParts} from './rain-usb';
import {rainConnections} from './rain-wires';
export type RainHardwarePart={id:string;name:string;what:string;connection:string};
const p=(id:string,name:string,what:string,connection:string):RainHardwarePart=>({id,name,what,connection});
export const rainHardwareParts:readonly RainHardwarePart[]=[
 ...rainUsbParts.map(row=>p(row[0],row[1],row[2],row[3])),
 p('rain-work-mat','Insulating work mat','Organises the dry controller area and the separate wet tray.','The mat makes no electrical connection; only the return jumpers join grounds.'),
 p('rain-uno-supports','Uno standoffs','Raise the controller so underside solder joints clear the mat.','Support the board at its mounting holes.'),
 p('rain-breadboard-support','Breadboard riser','Supports the mini breadboard above the work surface.','This is a mechanical support, not an electrical conductor.'),
 p('rain-breadboard','170-point mini breadboard','Each five-hole strip joins its own five contacts; the centre gap separates the two banks.','One strip shares all grounds. A different isolated strip carries the separate servo positive supply.'),
 p('rain-uno-pcb','Uno R3 board','Carries the microcontroller, USB bridge and sockets.','D2 reads the water sensor; D9 commands the positional servo.'),
 p('rain-uno-mcu','ATmega328P controller','Reads the active-LOW water input and remembers the most recent wet sample.','A wet sample requests 35°. Four continuously dry seconds request 130°.'),
 p('rain-uno-headers','Uno pin sockets','Expose the controller signals and regulated supply connections.','Use D2, D9, 5 V and GND. Never join the separate servo positive supply to Uno 5 V.'),
 p('rain-uno-usb','USB-B receptacle','Receives computer power and programming data.','USB powers the Uno; the servo uses its own regulated supply.'),
 p('rain-uno-bridge','USB serial bridge','Connects the computer serial port to the main controller.','The sketch reports WET or DRY and its requested shelter state at 115200 baud.'),
 p('rain-uno-power','Uno power circuit','Conditions the controller supply.','This project uses USB; the barrel socket is unused.'),
 p('rain-uno-reset','RESET button','Restarts the sketch and its four-second dry waiting period.','The sketch initially requests the covered position before attaching the servo.'),
 p('rain-uno-tracks','Uno copper tracks','Join the board-mounted chips and sockets.','External jumpers connect these sockets to the sensor and servo.'),
 p('rain-uno-programming','ICSP programming headers','Provide direct AVR programming connections.','Leave them unused; upload this project through USB.'),
 p('rain-uno-leds','Uno indicators','Show controller power and board activity.','The ON LED is not the water reading. Inspect D2 and the carriage to understand this project.'),
 p('rain-card-base','Mechanism base','Holds the stationary servo, rail supports and canopy.','The carriage slides above the base; it does not rotate with the servo.'),
 ...[0,1].map(n=>p('rain-rail-'+n,`Guide rail ${n+1}`,'Keeps the carriage moving along one straight axis.','Its open guide sleeve must slide freely; the two rails remain parallel.')),
 p('rain-rail-supports','Rail supports','Hold both rails at the same working height.','Their feet rest on the base; their tops support the rails.'),
 p('rain-carriage','Sliding carriage and guide sleeves','Carries the paper load along the rails.','The pushrod drives its pivot while both hollow sleeves constrain sideways movement.'),
 p('rain-servo-case','Positional micro-servo','Contains the motor, reduction gears and internal position controller.','Separate 5 V and GND power it. D9 supplies position pulses, not motor power.'),
 p('rain-servo-shaft','Servo output shaft','Transfers controlled rotation to the horn.','The horn mounts on this shaft; the servo case stays fixed.'),
 p('rain-servo-horn','20 mm crank horn','Turns the shaft rotation into the first end of the linkage motion.','Its outer pin connects to the fixed-length pushrod.'),
 p('rain-pushrod','65 mm pushrod','Pushes or pulls the carriage as the horn rotates.','Both pin joints pivot; the rod remains the same length throughout the stroke.'),
 p('rain-joints','Linkage pivot pins','Let the horn and carriage turn relative to the pushrod.','One pin joins the horn tip; the other joins the carriage.'),
 p('rain-clothesline','Moving line and uprights','Supports the lightweight paper clothes above the carriage.','The uprights move with the carriage; the canopy stays stationary.'),
 p('rain-clothes-pegs','Miniature clothes pegs','Hold the paper shirts on the line.','They travel with the line and do not touch the stationary canopy.'),
 ...[0,1].map(n=>p('rain-paper-shirt-'+n,`Paper shirt ${n+1}`,'Makes the protected load easy to see.','At 35° it sits under the canopy; at 130° it clears the roof edge.')),
 p('rain-canopy','Shelter canopy','Represents the dry shelter above the retracted clothes.','Its roof and posts stay fixed while the carriage moves underneath.'),
 p('rain-water-tray','Wet-area tray','Separates the water experiment from the dry controller area.','The sensor sits on supports inside it. Keep the Uno and power hardware dry.'),
 p('rain-water-stands','Sensor supports','Raise the sensor board inside the tray.','They align with the sensor mounting holes; the sensing face remains exposed.'),
 p('rain-water-pcb','Grove water sensor PCB','Carries the alternating electrode networks, pull-up and connector.','Red VCC goes to Uno 5 V, black to common ground, yellow SIG to D2; white NC stays unused.'),
 p('rain-electrode-signal','Signal electrode strips','Form the sensing side of the water bridge.','A conductive bridge to a ground strip pulls SIG LOW. A drop on plain PCB alone does not.'),
 p('rain-electrode-ground','Ground electrode strips','Provide the return side of the water bridge.','Water must connect this network to a signal strip for a wet reading.'),
 p('rain-water-vias','Sensor vias and mounting rings','Represent plated board connections and mounting-hole rings.','They are not extra sensing controls; the exposed alternating strips form the demonstration input.'),
 p('rain-water-pullup','1 MΩ pull-up resistor','Holds the signal HIGH while the sensing networks are unbridged.','A conductive path to ground lowers SIG. The model demonstrates geometric bridging, not calibrated water conductivity.'),
 p('rain-water-socket','Keyed four-pin Grove socket','Aligns the four cable contacts with the sensor pins.','Seat its matching plug as one unit; do not force or reverse it.'),
 ...(['GND','VCC','NC','SIG'] as const).map(pin=>p('rain-water-pin-'+pin.toLowerCase(),`Grove ${pin} contact`,pin==='NC'?'Unused contact in this project.':pin==='SIG'?'Carries the active-LOW sensor reading.':pin==='VCC'?'Receives the sensor supply.':'Provides the sensor return reference.',pin==='NC'?'The white lead is capped and disconnected.':pin==='SIG'?'Yellow lead to Uno D2.':pin==='VCC'?'Red lead to Uno 5 V.':'Black lead to the common return strip.')),
 p('rain-grove-plug','Four-channel Grove plug','Holds each female contact in a separate keyed chamber.','All four contacts seat together. Only VCC, GND and SIG are connected onward.'),
 p('rain-grove-unused-white','Unused white lead','Represents the unused NC conductor in the four-wire harness.','Its free end is capped and must not join power, ground or D2.'),
 p('rain-servo-plug','Servo three-channel female plug','Keeps signal, positive supply and ground in separate sockets.','Match orange signal, red 5 V and brown ground before inserting the male jumpers.'),
 p('rain-servo-signal-lead','Servo orange signal lead','Carries position pulses into the servo controller.','Its socket receives the D9 jumper. It does not supply the motor current.'),
 p('rain-servo-positive-lead','Servo red positive lead','Supplies the servo motor and internal controller.','Connect to the separate regulated 5 V strip, not Uno 5 V.'),
 p('rain-servo-ground-lead','Servo brown ground lead','Returns servo current and establishes the pulse reference.','Connect to the return strip shared with Uno GND and supply negative.'),
 p('rain-supply','Separate regulated 5 V supply','Supplies servo current independently of the Uno.','Positive feeds the isolated servo supply strip; negative joins common ground.'),
 p('rain-supply-cord','Low-voltage supply cord','Carries the regulated output to the barrel adapter.','This workshop models the low-voltage side only.'),
 p('rain-dc-plug','DC barrel plug','Transfers the separate regulated output into the adapter.','Seat it in the matching barrel receptacle.'),
 p('rain-dc-adapter','Barrel-to-terminal adapter','Provides separate screw-clamp outputs.','Positive and negative leave through their own circuit wires.'),
 p('rain-adapter-centre-contact','Adapter centre contact','Mates with the barrel plug centre conductor.','It connects to the labelled positive output.'),
 p('rain-adapter-positive','Positive screw terminal','Clamps the separate servo supply positive conductor.','Its wire goes to the isolated servo positive strip.'),
 p('rain-adapter-negative','Negative screw terminal','Clamps the separate supply return conductor.','Its wire joins the common ground strip.'),
 ...rainConnections.map(w=>p(w.id,w.name,'This insulated conductor carries one specific connection.',`${w.fromPort} → ${w.toPort}. ${w.net==='ground'?'This joins the shared reference.':w.net==='servo-5V'?'This belongs to the independent servo positive network.':w.net==='sensor-5V'?'This powers only the water sensor from Uno 5 V.':'This carries a controller signal, not servo power.'}`)),
];

/** Drops are selectable only while they actually exist on the sensor. */
export function rainWorkshopParts(drops:readonly RainWaterDrop[]):readonly RainHardwarePart[]{
 return [...rainHardwareParts,...drops.map((drop,n)=>p('rain-water-drop-'+n,`Water drop ${n+1}`,rainGeometricBridge([drop])?'This conductive drop touches both a signal strip and a ground strip.':rainGeometricBridge(drops)?'This drop belongs to an arrangement that bridges the electrode networks; touching drops can form one conductive path.':'This drop does not create a complete conductive bridge between both electrode networks.',rainGeometricBridge(drops)?'The complete water arrangement pulls SIG LOW, so D2 requests the covered position. The actual servo still needs its independent supply and time to move.':'SIG stays HIGH while the networks are unbridged. Water on plain board is not enough to trigger sheltering.'))];
}
