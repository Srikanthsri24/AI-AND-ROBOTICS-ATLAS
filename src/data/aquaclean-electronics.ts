/** Authored shield packaging; Uno stacking contacts derive from the existing R3 layout. Native mm. */
export const aquaControllerPlacement=[-310,9,-50] as const;
export const aquaShieldBottom=22,aquaShieldTop=23.6,aquaShieldContactY=32.1;
export const aquaStackContacts=[{"name":"D0","x":29.21,"z":-24.13},{"name":"D1","x":26.67,"z":-24.13},{"name":"D2","x":24.13,"z":-24.13},{"name":"D3","x":21.59,"z":-24.13},{"name":"D4","x":19.05,"z":-24.13},{"name":"D5","x":16.51,"z":-24.13},{"name":"D6","x":13.97,"z":-24.13},{"name":"D7","x":11.43,"z":-24.13},{"name":"D8","x":7.366,"z":-24.13},{"name":"D9","x":4.826,"z":-24.13},{"name":"D10","x":2.286,"z":-24.13},{"name":"D11","x":-0.254,"z":-24.13},{"name":"D12","x":-2.794,"z":-24.13},{"name":"D13","x":-5.334,"z":-24.13},{"name":"GND-D","x":-7.874,"z":-24.13},{"name":"AREF","x":-10.414,"z":-24.13},{"name":"SDA","x":-12.954,"z":-24.13},{"name":"SCL","x":-15.494,"z":-24.13},{"name":"A0","x":16.51,"z":24.13},{"name":"A1","x":19.05,"z":24.13},{"name":"A2","x":21.59,"z":24.13},{"name":"A3","x":24.13,"z":24.13},{"name":"A4","x":26.67,"z":24.13},{"name":"A5","x":29.21,"z":24.13},{"name":"NC","x":-6.35,"z":24.13},{"name":"IOREF","x":-3.81,"z":24.13},{"name":"RESET","x":-1.27,"z":24.13},{"name":"3V3","x":1.27,"z":24.13},{"name":"5V","x":3.81,"z":24.13},{"name":"GND-P1","x":6.35,"z":24.13},{"name":"GND-P2","x":8.89,"z":24.13},{"name":"VIN","x":11.43,"z":24.13}] as const;
export const aquaStackHoles=[{"x":31.75,"z":-8.89},{"x":31.75,"z":19.05},{"x":-19.05,"z":-24.13},{"x":-20.32,"z":24.13}] as const;
export const aquaSpiContacts=[-2.54,0,2.54].flatMap(dx=>[-1.27,1.27].map(dz=>({x:30.607+dx,z:-1.27+dz})));
export function aquaShieldContact(name:string):[number,number,number]{const p=aquaStackContacts.find(p=>p.name===name);if(!p)throw Error("Unknown shield socket "+name);return[aquaControllerPlacement[0]+p.x,aquaShieldContactY,aquaControllerPlacement[2]+p.z];}
export const aquaShieldParts=[
 ['aqua-shield-pcb','Ethernet Shield 2 board','Carries an authored teaching arrangement of the Ethernet shield hardware. Small component positions are illustrative, not manufacturer CAD.','Stacks on the Uno with aligned power and digital sockets.'],
 ['aqua-shield-stack','Stack-through signal sockets','Expose the Uno signals on top of the shield while the lower pins seat in the Uno sockets.','D2/D3 measure the basket, D5/D6/D8 drive the motor controller and D7 reads Start/Stop.'],
 ['aqua-shield-spi','Shield underside ICSP socket','The six-contact underside socket receives the Uno main ICSP signals.','SPI carries Ethernet data; D10 selects the W5500. The separate USB AVR ICSP header remains unused.'],
 ['aqua-shield-w5500','W5500 Ethernet controller','Handles the wired network interface used for the one-way local status packets.','The sketch sends UDP telemetry; network loss does not replace the local basket stop.'],
 ['aqua-shield-rj45','RJ45 network jack','The open jack shows its contact region and cable latch space.','An Ethernet cable will join the shield to the local network. This frontend does not send actual network packets.'],
 ['aqua-shield-sd','Unused microSD socket','The shield includes a separate card interface, unused in this project.','The sketch holds D4 high to deselect it while Ethernet uses SPI.'],
 ['aqua-shield-reset','Shield reset button','Restarts the stacked controller; the sketch starts with the motor disabled.','Reset is shared through the stack connector.'],
 ['aqua-shield-clock','Ethernet clock and support components','Illustrative oscillator, regulator and passive parts support the network chip.','These components are not user wiring terminals.'],
 ['aqua-shield-leds','Shield power and link indicators','Power and link are displayed separately in the browser model.','Link can be lost while USB logic remains on and the local basket controller continues.'],
] as const;
export const aquaUnoParts=[
 ['uno-pcb','Uno R3 controller board','Supports the ATmega controller, logic power and shield stack.','Insulating feet separate it from the dry bench.'],
 ['uno-mcu','ATmega328P basket controller','Runs the published skimmer sketch, debounces Start/Stop and stops at full or unavailable basket readings.','D2/D3 sonar; D5 PWM, D6 direction and D8 enable; D7 button; SPI and D10 Ethernet.'],
 ['uno-headers','Uno lower stacking sockets','Receive the shield stacking pins. External jumpers use the shield top sockets.','Both sensor and driver logic use Uno 5 V; the motor VM supply remains separate.'],
 ['uno-usb','Uno USB-B programming port','Supplies USB logic power and carries the Arduino sketch upload.','Motor power comes from the switched AA pack, not this port.'],
 ['uno-bridge','USB serial interface','Connects the Arduino IDE and Serial Monitor to the controller.','The sketch prints a basket/status record every 500 ms at 9600 baud.'],
 ['uno-power','Uno power conditioning','Conditions the logic supply. The barrel input is unused.','The Ethernet shield and sensor share the logic power path.'],
 ['uno-reset','Uno reset button','Restarts the sketch with motor drive disabled.','A new valid basket sample and accepted Start press are required.'],
 ['uno-tracks','Uno board copper','Connects the actual AVR, sockets and support components.','These are existing board routes, not student jumper wires.'],
 ['uno-programming','Uno main and USB ICSP headers','The main AVR header mates with the shield underside SPI socket. The USB AVR header is unused.','SPI serves Ethernet through the main header; D10 selects the W5500 and D4 deselects the unused SD interface.'],
 ['uno-leds','Uno logic indicators','The ON lamp represents USB logic power in this lesson. Serial/SPI activity is not individually simulated.','These indicators do not report basket fullness or motor power.'],
] as const;
