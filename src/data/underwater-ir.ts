import type { Build } from './guided-projects';

export const opticalMessages={ping:0x35,ready:0xB2} as const;
export type OpticalMessage=keyof typeof opticalMessages;
export const opticalBits=(message:OpticalMessage)=>{
  const byte=opticalMessages[message];
  const word=(byte<<8)|(byte^0xFF);
  return Array.from({length:16},(_,i)=>(word>>(15-i))&1);
};

export const underwaterIr: Build={
  id:'directory-87',
  title:'IR Wireless Underwater Communication System',
  outcome:'Send two short messages as infrared pulses through a narrow clear-water channel. Compare the pulses sent and received, then see how a blocked or misaligned path prevents a valid message.',
  parts:[
    ['Arduino Uno R3','2','One sends timed optical pulses and the other checks pulse widths and validates the received bytes.'],
    ['3 mm IR break-beam pair','1 pair','The emitter sends infrared light. The receiver output reads HIGH with a clear powered beam when pulled up. Confirm the transition before sending data.'],
    ['STEMMA MOSFET driver and lead','1 set','Switches the emitter’s ground lead in time with the transmitter output.'],
    ['Momentary tactile start button','2','Choose one button per message, PING or READY.'],
    ['Green and red LEDs with 220 Ω resistors','1 set','The green LED shows a valid message. Red indicates that an acquired frame was incomplete or failed the check.'],
    ['Breadboard and jumper wires','2 sets','Build two separate dry stations. Keep wires and boards away from the tank rim.'],
    ['USB-A to USB-B data cable','2','Program each Uno independently. Open the receiver’s Serial Monitor to see the decoded text.'],
    ['Clear flat-sided channel and spill tray','1 set','Use a narrow channel with a water path as short as about 2 cm to start. Hold the optical heads against opposite dry walls.'],
  ],
  assembly:[
    ['Set up a narrow optical channel','Place the empty clear channel in a spill tray. Use flat parallel walls at the beam height, and mount the emitter and receiver facing one another on the dry exterior. Shade the receiver with an opaque sleeve.','The two heads face directly across the channel and each board sits outside the spill tray.',[1,7]],
    ['Wire the transmitter and two buttons','With power off, wire the MOSFET module and transmitter. Check the emitter positive lead goes to OUT+ and its negative goes to the switched output. Connect the two buttons from D2 and D3 to ground.','The transmitter stays off at idle. The two buttons select different patterns.',[0,1,2,3,5]],
    ['Wire the receiver and indicators','Power the receiver from its own Uno. Connect the signal lead to D2 with input pull-up, the status lamps to D5 and D6, and their cathodes to receiver ground.','With the emitter off, receiver D2 should be LOW. Temporarily turn the beam on with T and check that D13 on the receiver turns on.',[0,1,4,5,6]],
    ['Align in air and add clear water','Run T in air first. Disconnect both USB cables before filling. Fill just above beam height, wipe the outside dry, then reconnect. Align the optical heads until D13 follows the test pulse through water.','The receiver sees both off and on through the water before you try a message.',[0,1,6,7]],
    ['Send a message, then interrupt the beam','Open the receiver monitor at 115200 baud. Send PING and READY. Move a dry opaque card between one optical head and the outer tank wall, then remove it and resend.','Both messages decode with a clear path. The interruption prevents a valid reply from appearing in the receive log.',[0,1,3,4,7]],
  ],
  wiring:[
    ['TX Uno 5 V / GND / D9','MOSFET V+ / GND / SIG','5 V emitter power and pulse control'],
    ['MOSFET OUT+ and switched OUT−','Emitter red and black leads','Switch the emitter return'],
    ['TX Uno D2 and D3','PING / READY buttons → TX GND','Momentary, active low'],
    ['RX Uno 5 V / GND','Receiver red and black leads','Keep RX power independent of TX'],
    ['Receiver signal lead','RX Uno D2','Input pull-up. HIGH with beam received.'],
    ['RX Uno D5 / D6','Each → 220 Ω → green / red LED anode','Cathodes to RX GND'],
    ['Computer USB ports','Each Uno USB-B','Each board uses its own USB lead. The only message path is light.'],
  ],
  test:'Use T on the sender to verify the receiver’s D13 follows the beam. Compare empty and filled channel results. Send both messages through clear water and verify the printed name. Block the beam before a frame and look for no new message. Interrupt it during a frame and check that any acquired but incomplete frame is rejected. Remove the card and send again.',
  demo:['Transmitted optical pulses','No data','Valid complement','Frame rejected','Decoded PING or READY'],
};
