import uno from './uno-r3-board-layout.json';
import { aquaStackContacts,aquaStackHoles,aquaSpiContacts } from './aquaclean-electronics';
import type { IndustrialPoint } from './industrial-panel';
export const industrialUnoAt:IndustrialPoint=[-150,9,-75];
export const industrialShieldBottom=22,industrialShieldTop=23.6,industrialShieldContactY=32.1;
export const industrialStackContacts=aquaStackContacts,industrialStackHoles=aquaStackHoles,industrialSpiContacts=aquaSpiContacts;
export function industrialShieldContact(name:string):IndustrialPoint{const p=industrialStackContacts.find(p=>p.name===name);if(!p)throw Error('Unknown industrial shield socket '+name);return[industrialUnoAt[0]+p.x,industrialShieldContactY,industrialUnoAt[2]+p.z];}
export const industrialUnoFeet=uno.holes.map(h=>[industrialUnoAt[0]+Number(h.x)-34.29,0,industrialUnoAt[2]+26.67-Number(h.y)] as IndustrialPoint);
const usb=uno.elements.find(e=>e.name==='X2')!;
export const industrialUsbCentre:IndustrialPoint=[industrialUnoAt[0]+Number(usb.x)-34.29,industrialUnoAt[1]+6.3,industrialUnoAt[2]+26.67-Number(usb.y)];
export const industrialUsbHost={at:[-245,10,-115] as IndustrialPoint};
export const industrialControllerParts=[
 ['industrial-uno-pcb','Uno R3 controller board','The actual R3 board outline, holes, copper and component layout support the industrial bench sketch.','Insulating feet keep solder joints above the bench; fit board screws before stacking the shield.'],
 ['industrial-uno-mcu','ATmega328P industrial controller','Maps A0/A1 to synthetic indices, reads the NC stop loop, qualifies D3 edges and retains the trip latch.','A0 temperature, A1 vibration, D2 stop, D3 acknowledge/start, D5 green RUN and D6 red TRIP.'],
 ['industrial-uno-headers','Uno lower stacking sockets','The original R3 contact positions receive the shield pins and pass each signal through the stack.','Student jumpers use the exposed top sockets of the shield. Keep D4 and D10 reserved for the network board.'],
 ['industrial-uno-usb','Uno USB-B power / upload port','The open metal socket receives the matching hollow USB plug around its internal contact tongue.','USB powers the classroom panel and uploads the guide sketch. The barrel power jack remains unused.'],
 ['industrial-uno-bridge','Uno USB serial interface','The USB-interface controller links the computer to Arduino upload and Serial Monitor.','Read the five-field status reports at 9600 baud. The browser does not upload firmware or connect to USB.'],
 ['industrial-uno-power','Uno logic power conditioning','Regulators and capacitors support the shared low-voltage logic supply.','This panel drives two small indicator LEDs; it does not drive a real conveyor motor.'],
 ['industrial-uno-reset','Uno reset switch','Restarts the sketch with running and tripped cleared and new network setup attempted.','Reset returns to READY only if inputs are clear. An unsafe current input immediately latches TRIPPED again.'],
 ['industrial-uno-tracks','Uno board copper routes','The board copper joins its original MCU, headers and support components.','These traces are part of the controller board, separate from the external student jumper wires.'],
 ['industrial-uno-programming','Uno main and USB ICSP headers','The main six-pin AVR header mates with the shield underside socket; the USB AVR header is separate.','SPI serves the Ethernet interface through the main header. The USB AVR ICSP header remains unused.'],
 ['industrial-uno-leds','Uno board logic indicators','ON illustrates the controller logic supply; these lamps are separate from the RUN / TRIP outputs.','Judge the local machine representation using the dedicated green D5 and red D6 LEDs, not these board lamps.'],
 ['industrial-uno-feet','Bored insulating Uno feet','Four drilled spacers meet the actual R3 mounting-hole axes and keep the PCB off the bench.','The board seats on the spacers before the separate retaining screw heads are installed.'],
 ['industrial-uno-screws','Uno mounting screws','Separate metal shafts and heads retain the board after it is lowered onto its feet.','They pass through the original board holes. The shield is stacked only after the board is secured.'],
 ['industrial-usb-cable','USB power / programming cable','A hollow USB-B metal sleeve fits around the real port tongue; its cable joins the illustrated host.','Disconnect the Uno end before rewiring. The model moves only that end and its cable path when power is removed.'],
 ['industrial-usb-host','Illustrated USB host','Represents the computer supplying USB logic power and running the Arduino IDE and Serial Monitor.','It is a teaching model on the bench; this static frontend never accesses a real USB device.'],
 ['industrial-shield-pcb','Ethernet Shield 2 board','The shield uses the R3 mounting and stacking layout with authored small component packaging.','It sits above the Uno with lower signal pins and the underside ICSP socket aligned to their actual contacts.'],
 ['industrial-shield-stack','Shield top signal sockets','The open stack-through sockets expose the original power, digital and analogue signals.','A0/A1 test knobs, D2 NC stop, D3 start, D5/D6 indicators, 5 V and common ground form the external circuit.'],
 ['industrial-shield-spi','Shield underside ICSP socket','Six separate open entries receive the main Uno SPI header.','SPI carries Ethernet data; D10 selects W5500. Keep the separate USB AVR header unused.'],
 ['industrial-shield-w5500','W5500 network controller','Supports the sketch’s read-only local telemetry without controlling the local trip latch.','Network setup is boot-latched. Link loss suppresses remote packets while the stop and indicators continue locally.'],
 ['industrial-shield-rj45','Open Ethernet jack','The hollow jack has an open contact region and latch space for the network plug.','The eventual cable connects the panel to the illustrated local network; no real browser packets are sent.'],
 ['industrial-shield-sd','Unused microSD interface','The shield includes a separate card interface that this project does not use.','The sketch holds D4 HIGH to deselect this interface while the W5500 uses SPI and D10.'],
 ['industrial-shield-reset','Shield reset button','This top reset control restarts the controller through the stack.','Like the Uno reset, it clears old runtime state; current unsafe inputs can immediately trip the restarted sketch.'],
 ['industrial-shield-clock','Ethernet timing / support components','The clock package and support components belong to the authored shield assembly.','They support the network interface and are not extra student jumper connection points.'],
 ['industrial-shield-leds','Shield power / link indicators','These small lamps illustrate logic power and the connected network link separately.','Loss of the link lamp must not turn off or acknowledge the separate local red TRIP LED.'],
] as const;
