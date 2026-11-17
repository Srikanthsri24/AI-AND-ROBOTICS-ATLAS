import type { Build } from './guided-projects';

export const waterPulseMs=2000;
export const waterCommands = [
  {phrase:'water warm',byte:'W',mode:'warm'},
  {phrase:'water cold',byte:'C',mode:'cold'},
  {phrase:'water stop',byte:'S',mode:'stop'},
] as const;
export const waterSamples=[...waterCommands.map(command=>command.phrase),'hello there'];

export const voiceWater:Build={
 id:'directory-106',title:'Voice Based Hot Cold-Water Dispenser System (Ras Pi)',
 outcome:'Build a two-channel classroom dispenser. The Pi maps a spoken selection to an Arduino pump command. Use separate red and blue room-temperature test reservoirs to model hot and cold choices.',
 parts:[
  ['Raspberry Pi 5','1','Runs the local speech console. Use a Pi with its normal boot storage, cooling and USB-C supply.'],
  ['Computer with microphone','1','Use a USB headset microphone on the Pi for one push-to-talk phrase.'],
  ['Arduino Uno R3','1','Decodes USB serial commands, enables one pump and enforces a two-second timeout.'],
  ['5 V peristaltic pump with tubing','2 sets','One pump per channel. Keep the pump motors and electronics outside the splash tray.'],
  ['STEMMA MOSFET driver and lead','2 sets','One switched output per pump. Each board has a diode for its motor load.'],
  ['Regulated 5 V pump supply and adapter','1 set','Powers only the low-voltage pump rail. Use a supply and terminal adapter rated for the pump current.'],
  ['Momentary tactile stop button','1','Provides a local active-low stop input independent of speech or USB.'],
  ['Breadboard and jumper wires','1 set','Connects logic wiring and grounds. Use firm terminals on the motor power path.'],
  ['USB-A to USB-B data cable','1','Carries decisions from the Pi and powers the Uno.'],
 ],
 assembly:[
  ['Arrange the two water paths','Place two small room-temperature test reservoirs and a catch cup in a spill tray. Route one tube from each reservoir through its pump to its own outlet above the cup. Mount the low-voltage boards and connectors above and outside the tray.','Each channel has its own inlet and outlet. The cup can hold several trial pulses without overflowing.',[3,4,5]],
  ['Connect the pumps and stop switch','With both supplies off, wire each driver and its pump, plus the shared control ground. Fit the stop button within easy reach. Leave the pump supply off until programming is done.','Each pump has its own driver and neither draws current through a controller output.',[2,3,4,5,6,7]],
  ['Link the Pi and initialize the controls','Upload the sketch, then connect the Pi to the Uno and plug in the microphone. Open the console with the local voice model.','Both channels are off on boot. The Pi prints the command letter for each accepted phrase.',[0,1,2,8]],
  ['Test one timed pulse','Place the empty catch cup under both outlets. Enable pump power. Press Enter before saying “water warm,” then wait for the pump to stop. Repeat with “water cold.”','Only the selected pump runs. Each run lasts at most two seconds.',[0,1,2,3,4]],
  ['Check the two stop paths','Start a channel and press the local button during flow. Repeat using the console’s immediate stop key. Then say an unrelated phrase.','Stop cuts the active output, and an unrelated phrase starts neither pump.',[0,2,3,6]],
 ],
 wiring:[
  ['Pi USB-A','Uno USB-B','One command byte at 115200 baud.'],
  ['USB microphone','Pi USB-A','Local input for the speech console.'],
  ['Uno D5 / D6','Warm driver SIG / cold driver SIG','Independent enable signals.'],
  ['Uno D2','Stop switch to GND','Use the internal pull-up. Low stops both pumps.'],
  ['Independent 5 V supply','Both driver V+ / GND terminals','Share supply negative with Uno GND.'],
  ['Each driver OUT+ / OUT−','Matching pump positive / negative','Keep the two pump outputs separate.'],
 ],
 test:'With the catch cup in place, run the warm and cold selections separately. Verify both channels never run together, each run stops within two seconds, and the local Stop button stops immediately. An unrelated phrase does not start a pump. Use room-temperature test water throughout.',
 demo:['Voice phrase','Selected channel','Timed water flow','Manual stop','Automatic cutoff'],
};
