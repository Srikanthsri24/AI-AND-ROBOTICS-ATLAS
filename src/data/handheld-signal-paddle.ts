import type {Build} from './guided-projects';

export const handheldSignalPaddle:Build={
  id:'handheld-signal-paddle',
  title:'Handheld signal paddle',
  outcome:'Build a handheld classroom signal with a thumb button that starts one three-flash sequence.',
  parts:[
    ['Arduino Uno R3','1','Filters contact bounce and times the three flashes.'],
    ['Momentary tactile button','1','Starts the sequence from the handle.'],
    ['Diffused white LED and 220 Ω resistor','1 pair','Produces the visible signal on the paddle face.'],
    ['Card signal paddle, handle and diffuser','1 set','Supports the lamp and switch and softens the light through a tracing-paper window.'],
    ['Breadboard and jumper wires','1 set','Connects the paddle to the Uno on the tabletop.'],
    ['USB-A to USB-B data cable','1','Powers the circuit and connects the serial log.'],
  ],
  assembly:[
    ['Build the paddle and handle','Cut a rounded card face and laminate another strip for the handle. Mount the LED behind a tracing-paper window and the switch where your thumb can reach it.','The handle is stiff, the LED faces outward, and the switch clicks without flexing the card.',[1,2,3]],
    ['Connect the thumb switch','Unplug USB. Connect the two normally open switch terminals between D2 and GND. Tape the cable to the base of the handle for strain relief.','D2 reads high when released and low when pressed. The thumb switch stays in place when the cable moves.',[0,1,3,4]],
    ['Wire the signal lamp','Connect D8 through 220 Ω to the LED anode, then connect the cathode to GND. Keep the Arduino and breadboard on the tabletop.','One series resistor limits current and the paddle stays light enough to hold.',[0,2,3,4]],
    ['Check press, hold and repeat','Upload the sketch. Tap once and count three flashes. Hold the button through the sequence. Release, then press once more after the sequence ends.','A stable press triggers one burst. A hold or extra tap during that burst cannot restart it.',[0,1,2,3,5]],
  ],
  wiring:[
    ['Uno D2','Thumb switch → GND','Active-low trigger'],
    ['Uno D8','220 Ω → LED anode','Three-flash output'],
    ['Uno GND','Switch return and LED cathode','Shared return'],
  ],
  test:'Count three flashes per stable press. Try a long hold and a second tap during a burst. Wait until the burst finishes, release, then request a fresh burst.',
  demo:['Thumb press','Send three flashes','Ignore repeated input','Release','Send again'],
};
