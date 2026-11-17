import type {Build} from './guided-projects';

export const desktopCameraPanModel:Build={
  id:'desktop-camera-pan-model',
  title:'Desktop camera pan model',
  outcome:'Pan a lightweight camera mock-up between three marked targets and check whether repeated commands return to the same framing.',
  parts:[
    ['Arduino Uno R3','1','Accepts serial commands and steps the servo toward the requested angle.'],
    ['Positional micro servo','1','Rotates the camera mock-up around its vertical axis.'],
    ['Regulated 5 V servo supply','1','Powers the servo separately from the Uno USB supply.'],
    ['Card camera shell and pan targets','1 set','Provides a lightweight camera shape, sight line and three stationary targets.'],
    ['Breadboard and jumper wires','1 set','Connects the servo signal and common ground.'],
    ['USB-A to USB-B data cable','1','Connects the Uno to Arduino IDE and Serial Monitor.'],
  ],
  assembly:[
    ['Build the pan platform','Cut a lightweight card camera body. Draw a centerline from the top of the body forward. Mark left, center and right targets along a semicircle centered on the servo shaft.','The body is balanced over the pivot and all three targets stay fixed.',[1,3]],
    ['Wire the servo controller','Unplug USB and turn off the external supply. Connect servo signal to D9, power to external regulated 5 V, and ground to the supply return and Uno ground. Keep the positive supplies separate.','The servo and Uno share a reference while the separate supply carries the servo load.',[0,1,2,4]],
    ['Center the horn and check travel','Upload with the horn removed. Send c in Serial Monitor. With power disconnected, fit the horn so the mock-up points at the center target. Then reconnect and check clearance before testing both limits.','The mock-up can pan without snagging the leads or hitting a stop.',[0,1,2,3,5]],
    ['Aim, repeat and compare','Send l, c and r in sequence. Check the final command after each move in the log. Return to each target several times and compare the physical sight line.','The model approaches each target smoothly. Compare any alignment error after returns from both sides.',[0,1,3,5]],
  ],
  wiring:[
    ['Uno D9','Servo signal lead','Timed angle command'],
    ['External regulated 5 V','Servo positive lead','Dedicated servo power'],
    ['Uno GND','Servo ground and external supply return','Shared signal reference'],
  ],
  test:'Test left, center and right, then return to center from both sides. Adjust the sketch’s left and right command limits to keep safe clearance and compare the actual sight line.',
  demo:['Mount the mock-up','Select a target','Watch the pan','Compare framing','Return to center'],
};
