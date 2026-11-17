import type { Build } from './guided-projects';

export const padButtons=['Up','Down','Left','Right','A','B'] as const;
export type PadKey=typeof padButtons[number];
export const padPins=[25,26,27,32,33,14] as const;
export const bleGamepad:Build={
  id:'directory-78',title:'Bluetooth Gamepad for Android Gaming',
  outcome:'Build and pair a six-button Bluetooth LE gamepad. Verify directional and action inputs, then play a small collection game in the browser.',
  parts:[
    ['ESP32-DevKitC V4 (ESP32-WROOM-32E)','1','Scans six buttons and sends HID reports. Use the original ESP32 with Bluetooth LE.'],
    ['Momentary tactile start button','6','Four direction switches and two action switches. Label each before wiring.'],
    ['Breadboard and jumper wires','1 set','Connects the six inputs and common ground. Leave access to USB and the ESP32 reset button.'],
    ['USB Micro-B data cable','1','Powers and programs the DevKitC.'],
    ['Cardboard controller faceplate','1','Optional stiff card face with a cross for directions and two openings for the action buttons. Keep the plate clear of the antenna end.'],
  ],
  assembly:[
    ['Lay out the controls','Place four switches in a cross and the two action switches on the right. Label each pad before adding wires.','All six switches can be reached and return freely.',[1,2,4]],
    ['Wire inputs to ground','Unplug USB. Connect one side of each switch to the listed GPIO, and the other to common ground. Use contacts on opposite sides of each switch.','Each GPIO connects to ground only while its own switch is pressed.',[0,1,2]],
    ['Upload and pair','Use a data-capable USB cable, upload the sketch, then pair Atlas Gamepad in Android Bluetooth settings.','Android lists the gamepad as paired and the sketch reports a connection.',[0,3]],
    ['Verify press and release','In an Android controller tester or compatible game, press and release each direction and action. Try Up and Right together, then an opposite pair.','Adjacent directions produce a diagonal. Opposite directions on one axis cancel.',[0,1,2]],
    ['Fit the faceplate','After checking every input, use the labeled card face to hold the button positions. Keep the ESP32 antenna beyond the faceplate edge and recheck pairing from normal use distance.','The controller can be held without snagging a wire.',[0,1,2,4]],
  ],
  wiring:[
    ['ESP32 GPIO25 / GPIO26','Up / Down switch → GND','Internal pull-ups'],
    ['ESP32 GPIO27 / GPIO32','Left / Right switch → GND','Internal pull-ups'],
    ['ESP32 GPIO33 / GPIO14','A / B switch → GND','Internal pull-ups'],
    ['Computer USB','ESP32 Micro-B','Power and upload'],
  ],
  test:'Pair the board and test both action buttons and all directions, including neutral on release. Turn Bluetooth off and back on, then reconnect and check that no stale button remains pressed. A compatible game or input tester should show the D-pad as a hat and the action controls as two buttons.',
  demo:['HID input','Neutral','Direction or action','Controller sends no active direction','Cursor moves or collects a token'],
};
