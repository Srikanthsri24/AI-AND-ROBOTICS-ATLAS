import{aquaControllerPlacement,aquaShieldContact,aquaStackContacts,aquaStackHoles,aquaSpiContacts}from'./aquaclean-electronics';
export const binControllerAt=aquaControllerPlacement;
export const binShieldContact=aquaShieldContact;
export const binStackContacts=aquaStackContacts,binStackHoles=aquaStackHoles,binSpiContacts=aquaSpiContacts;
export const binIndicatorAt=[-310,0,72] as const;
export function binPanelHole(column:number,bank:-1|1,row:number):[number,number,number]{if(!Number.isInteger(column)||column<0||column>16||!Number.isInteger(row)||row<0||row>4||![1,-1].includes(bank))throw Error('Unknown indicator-board contact');return[binIndicatorAt[0]+(column-8)*2.54,10,binIndicatorAt[2]+(bank<0?-3.81-(4-row)*2.54:3.81+row*2.54)];}
export const binIndicator={ohms:220,ledDrop:2,anode:binPanelHole(12,-1,4),cathode:binPanelHole(13,-1,4),resistorA:binPanelHole(8,-1,0),resistorB:binPanelHole(12,-1,0)};
export const binElectronicsParts=[
 ['uno-pcb','Uno R3 controller board','Supports the ATmega controller, USB logic power and Ethernet shield stack.','Insulating feet keep its solder joints clear of the dry bench.'],
 ['uno-mcu','ATmega328P bin controller','Runs the bin sketch: lid settling, ultrasonic fill conversion and 80% / 70% collection hysteresis.','D2 / D3 sonar, D6 collection LED, D7 lid switch, ICSP SPI and D10 Ethernet.'],
 ['uno-headers','Uno lower stacking sockets','Receive the aligned shield pins. Student jumpers use the exposed shield sockets above.','Uno 5 V and ground supply the sensor and low-current indicator circuit.'],
 ['uno-usb','Uno USB-B programming port','Carries USB power, Arduino sketch upload and serial communication.','Disconnect USB before changing the wiring. The barrel power connector is unused.'],
 ['uno-bridge','USB serial interface','Connects the Arduino IDE and Serial Monitor to the main controller.','The sketch prints uptime, gap, fill percent and state every 500 ms at 9600 baud.'],
 ['uno-power','Uno power conditioning','Conditions the USB logic supply for the Uno and shield.','No separate motor supply is used by this monitoring project.'],
 ['uno-reset','Uno reset button','Restarts the sketch with its stored collection latch cleared.','A closed lid must settle for 500 ms before a new reading is accepted.'],
 ['uno-tracks','Uno board copper','Connects the actual AVR, sockets and support components.','These are existing board routes, rather than student jumper wires.'],
 ['uno-programming','Uno main and USB ICSP headers','The main AVR header mates with the Ethernet shield underside socket.','SPI serves Ethernet; D10 selects the W5500. The separate USB AVR header is unused.'],
 ['uno-leds','Uno logic indicators','ON illustrates USB logic power. Serial/SPI activity is not individually animated.','These board lamps do not show the collection-needed state; use the separate red LED.'],
 ['flood-controller-feet','Insulating Uno mounting feet','Four bored spacers support the board at its actual mounting-hole positions.','The shafts pass through the existing holes and keep the board off the bench.'],
 ['flood-usb-cable','USB power and upload cable','Seats in the actual Uno USB-B port and illustrated host.','The browser illustrates the cable; it does not connect to or program a physical board.'],
 ['flood-usb-host','Illustrated USB host','Represents the computer supplying USB power and running the Arduino IDE.','Use Serial Monitor at 9600 baud on the real project.'],
 ['bin-shield-pcb','Ethernet Shield 2 board','Carries the Ethernet hardware on a stack matched to the actual Uno contact layout. Small package positions are authored teaching geometry.','The stack passes power and the required signals between the boards.'],
 ['bin-shield-stack','Shield top signal sockets','Expose the Uno pins for the external student wiring.','D2 / D3 sonar, D6 indicator, D7 lid contact, 5 V and common ground.'],
 ['bin-shield-spi','Shield underside ICSP socket','The six open entries seat over the Uno main ICSP header.','SPI carries Ethernet traffic; D10 selects the W5500 and D4 deselects the unused SD interface.'],
 ['bin-shield-w5500','W5500 Ethernet controller','Handles one-way local status reporting.','The sketch broadcasts to UDP 4212; a lost link does not stop local measurement or indicator updates.'],
 ['bin-shield-rj45','Shield Ethernet jack','Receives the local-network cable in its actual open jack.','Connect the real project to the same trusted local subnet as the Python receiver.'],
 ['bin-shield-sd','Unused microSD socket','Identifies the shield’s second SPI device.','D4 is held HIGH to deselect it. No SD card is required.'],
 ['bin-shield-reset','Shield reset button','Restarts the stacked controller.','The sketch starts again and waits for the closed-lid settling interval.'],
 ['bin-shield-clock','Shield clock and support packages','Illustrates the network clock and surrounding support electronics.','These factory-fitted packages remain on the board; students do not wire them individually.'],
 ['bin-shield-leds','Shield power and link indicators','Show logic power and the illustrated network link separately.','A remote stale reading must not be mistaken for a new local measurement.'],
 ['bin-indicator-board','170-contact indicator breadboard','Each column has separate five-hole banks on either side of its trench; there are no continuous power rails.','One bank distributes sensor 5 V, another common ground. The resistor and LED use their own isolated signal columns.'],
 ['bin-resistor-body','220 Ω current-limiting resistor','Red–red–brown bands encode 220 Ω; gold illustrates ±5% tolerance.','Sits in series between Uno D6 and the LED anode. A nominal 2 V LED drop gives about 13.6 mA at 5 V; actual hardware varies.'],
 ['bin-resistor-leads','Resistor connection leads','Two metal leads seat in separate board columns.','Column 9 negative bank receives D6; column 13 negative bank feeds the LED anode.'],
 ['bin-led-lens','Red collection-indicator lens','The actual 3D lens lights when a valid reading and the stored collection latch enable D6.','At 80% the latch sets; at 70% it clears. Opening the lid or losing the sensor blanks the lamp without erasing that latch.'],
 ['bin-led-anode','LED anode lead','The positive LED connection uses the series-resistor output column.','Column 13 negative bank shares its five-hole contact with the resistor output.'],
 ['bin-led-cathode','LED cathode and reflector','The return lead and broader internal reflector identify the LED’s negative side.','Column 14 negative bank returns to common ground through its own jumper.'],
] as const;
