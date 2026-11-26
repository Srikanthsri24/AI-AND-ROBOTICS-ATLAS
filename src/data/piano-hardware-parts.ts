import {pianoKeyboardParts,type PianoHardwarePart} from './piano-layout';
import {pianoUsbParts} from './piano-usb';
import {pianoWireParts} from './piano-wires';
import {pianoPiezoParts} from './piano-sounder';
const part=(id:string,name:string,what:string,connection:string):PianoHardwarePart=>({id,name,what,connection});
export const pianoHardwareParts:readonly PianoHardwarePart[]=[
 part('piano-base','Timber piano workbench','Supports the controller, keyboard and sounder without joining their electrical contacts.','Keep the lead jackets above the timber; the wood is not a ground connection.'),
 part('piano-uno-pcb','Arduino Uno R3 PCB','Carries the eight key input sockets and the tone output circuit.','D2–D9 read active-low switches; D10 supplies the passive piezo through 220 Ω.'),
 part('piano-uno-mcu','ATmega328P controller','Runs the published 15 ms debounce and selects the first held key in scale order.','Uses INPUT_PULLUP for all eight keys. Two held keys produce one note, with the lower note taking priority.'),
 part('piano-uno-headers','Uno female headers','Real separate sockets receive the key inputs, tone lead and shared ground.','Use D2 through D9, D10 and power-header GND. This build does not connect the 5 V rail to the key switches.'),
 part('piano-uno-usb','Uno USB-B receptacle','Provides upload, logic power and serial data.','Upload electronic_piano.ino and use 115200 baud. Keep USB disconnected while changing the circuit.'),
 part('piano-uno-bridge','USB serial interface','Links computer upload and serial observations to the main controller.','The original sketch prints Hz only when the selected note changes, and Released when it becomes silent.'),
 part('piano-uno-power','Uno power-conditioning components','Support the logic supply. The barrel jack is unused here.','USB powers the Uno. The passive piezo uses a resistor-limited D10 square wave.'),
 part('piano-uno-reset','Reset pushbutton','Restarts the sketch and clears its debounced key memory.','A key held through reset qualifies again after 15 ms. Released inputs are held HIGH internally.'),
 part('piano-uno-tracks','Uno copper traces','Connect the processor, socket contacts and board support circuitry.','External jumpers must still reach the named D2–D10 and GND sockets.'),
 part('piano-uno-programming','Unused ICSP headers','Provide low-level programming access to the AVR devices.','Leave these headers unconnected; this build uploads through USB.'),
 part('piano-uno-leds','Uno status indicators','ON shows logic power; RX/TX relate to USB communication.','These are separate from the piano sound output. The D13 indicator does not represent a piano key.'),
 part('piano-uno-supports','Uno insulating supports','Hold the board clear of the base at the actual PCB mounting holes.','Keep underside solder joints above the timber. The supports are mechanical, not a circuit return.'),
 ...[0,1].map(i=>part('piano-board-'+i,i===0?'C4–F4 keyboard breadboard':'G4–C5 keyboard breadboard','Each has seventeen columns of two separate five-hole strips, with an isolated centre gap.','There are no long ground rails. Four switches straddle the gap; individual jumpers join the return strips.')),
 part('piano-series-resistor','220 Ω piezo series resistor','Red / red / brown / gold bands identify 220 Ω with 5% tolerance. It limits brief charging current at square-wave edges.','Its legs span separate rear-bank columns 1 and 5 on the first board. D10 reaches one strip; the piezo signal lead reaches the other.'),
 ...pianoUsbParts.map(([id,name,what,connection])=>part(id,name,what,connection)),
 ...pianoKeyboardParts,
 ...pianoWireParts,
 ...pianoPiezoParts.map(([id,name,what,connection])=>part(id,name,what,connection)),
];
