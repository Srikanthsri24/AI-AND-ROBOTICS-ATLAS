import type {Build} from './guided-projects';

export const gameControllerInputTester:Build={
  id:'game-controller-input-tester',
  title:'Game controller input tester',
  outcome:'Build a wired test controller and verify that both stick axes, the stick click, and two action buttons report independently in Serial Monitor.',
  parts:[
    ['Arduino Uno R3','1','Logs both analog axes and three digital inputs.'],
    ['Two-axis joystick breakout','1','Provides two position voltages and a separate push switch.'],
    ['Momentary tactile button','2','Provides independent A and B inputs.'],
    ['Cardboard controller faceplate','1','Holds the stick and buttons without blocking their travel.'],
    ['Breadboard and jumper wires','1 set','Connects signals and distributes ground to all inputs.'],
    ['USB-A to USB-B data cable','1','Powers the tester and carries the serial log.'],
  ],
  assembly:[
    ['Fit the input panel','Mount an assembled joystick breakout and the two labeled switches. Give the stick cap room to tilt in every direction and press down.','The faceplate does not bind the stick, and the three presses feel separate.',[1,2,3]],
    ['Connect both analog axes','Unplug USB. Wire the breakout’s supply and ground to 5 V and GND, its X output to A0, and its Y output to A1. Follow the markings on the assembled breakout.','Moving one axis changes its own raw channel. The signal leads are distinct.',[0,1,4]],
    ['Connect the digital inputs','Connect the stick switch output to D2. Connect A between D3 and GND and B between D4 and GND. The sketch enables pull-ups on all three inputs.','Released switches read high and pressing one pulls only its input low.',[0,1,2,4]],
    ['Capture the neutral point and test','Upload and open Serial Monitor. Let go of the stick and send c to record its center. Move it in four directions, then test stick click, A and B separately and together.','The stick reports a neutral zone at rest, both axes move, and each button returns to released.',[0,1,2,5]],
  ],
  wiring:[
    ['Uno 5 V','Joystick supply','Feeds both position sensors'],
    ['Uno GND','Joystick ground and both button returns','Shared reference'],
    ['Uno A0','Joystick X output','Horizontal position voltage'],
    ['Uno A1','Joystick Y output','Vertical position voltage'],
    ['Uno D2','Joystick select output','Active-low click'],
    ['Uno D3','Button A → GND','Active-low action input'],
    ['Uno D4','Button B → GND','Active-low action input'],
  ],
  test:'With the stick centered, capture neutral. Sweep each axis separately. Hold A and B together and release them one at a time. Press the stick without tilting and check its separate click channel.',
  demo:['Center the stick','Sweep both axes','Press a button','Release it','Check simultaneous inputs'],
};
