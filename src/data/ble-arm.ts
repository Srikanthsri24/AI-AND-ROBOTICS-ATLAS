import type { Build } from './guided-projects';

export const armNames=['Base yaw','Shoulder','Elbow','Wrist pitch','Wrist roll','Gripper'] as const;
export const armKeys=['a','b','c','d','e','f'] as const;
export const armLimits=[[-42,42],[-25,25],[-25,25],[-30,30],[-30,30],[0,24]] as const;
export const armHome=[0,0,0,0,0,0];
export const armPickup=[-27,16,21,17,0,0];
export const armPlace=[27,16,21,17,0,0];
export const armLift=[0,-10,10,15,0,24];

export const bleArm:Build={
  id:'directory-64',title:'Bluetooth-Controlled Robotic Arm',
  outcome:'Build a stationary six-servo arm and use a phone to jog individual joints. After checking each channel, transfer a lightweight foam block between two stations.',
  parts:[
    ['Arduino Uno R3','1','Receives Bluetooth UART commands and sends targets to the servo driver over I²C.'],
    ['Bluefruit LE UART Friend','1','Bridges a phone UART terminal to the Uno. Use the board’s UART/Data mode.'],
    ['Six-channel metal robot arm kit','1','Choose the PWM-servo variant with base, shoulder, elbow, two wrist axes and a gripper. Use the kit’s horns and fasteners.'],
    ['PCA9685 PWM servo driver','1','Outputs one independent servo signal per channel. The first six channels follow base-to-gripper order.'],
    ['External regulated arm servo supply','1 set','Match the kit servo voltage and combined peak current. The 5 V supply photo is an example for a kit whose servos are rated for it. Use rated wiring and distribution for your kit.'],
    ['Breadboard and jumper wires','1 set','Carries UART and I²C logic. Keep servo power off the breadboard. Bring two marked stations and a small foam block for trials.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and connects it to the Arduino IDE.'],
  ],
  assembly:[
    ['Secure the base and identify the joints','Fasten the base to a firm bench board. Lay the arms, horns and gripper out in the kit’s order. Mark channels 0 to 5 from base to gripper before installing any powered horn.','The base does not tip, and each servo lead has a label.',[2]],
    ['Wire Bluetooth and I²C','Unplug USB and leave the external supply off. Connect Bluefruit and PCA9685 logic to the Uno. Join the external supply negative to their ground while keeping the Uno 5 V rail separate from servo positive power.','The Bluefruit receives UART commands and the driver shares the Uno logic reference.',[0,1,3,4,5,6]],
    ['Center unloaded servos','Upload the sketch before fitting the horns. Connect the phone from Bluefruit LE Connect in UART mode. Send H to center the channels. Cut both supplies before installing any horn. Mount at a comfortable mid-travel position with the jaws open.','Each linkage can move safely a few degrees to either side of its chosen rest.',[0,1,2,3,4]],
    ['Test each jog command','With the gripper empty, send lowercase a–f to add one step and uppercase A–F to subtract one. Check the physical direction and travel before widening either limit. Send S to discard pending movement and hold the current commands.','Only the selected joint moves relative to its parent link. Travel stops at its configured limits.',[0,1,2,3]],
    ['Transfer a foam block','Put a small foam block inside the tested reach. Jog base, shoulder and elbow until the open gripper is aligned. Close gently, raise the block, turn toward the second mark, lower it and open the gripper.','The foam remains in the jaws during the transfer and sits on the second mark after release.',[0,1,2,3,4,5]],
  ],
  wiring:[
    ['Uno 5 V / GND','Bluefruit VIN / GND and PCA9685 VCC / GND','Logic supply'],
    ['Bluefruit TXO','Uno D2','Serial input at 9600 baud'],
    ['Bluefruit CTS','Uno GND','Enables breakout TX'],
    ['Uno A4 / A5','PCA9685 SDA / SCL','Default I²C address 0x40'],
    ['PCA9685 channels 0–5, signal row','Base, shoulder, elbow, wrist pitch, wrist roll, gripper','Verify signal pin orientation'],
    ['Matched external servo supply','Servo V+ / GND via rated distribution','Use the driver terminal only if the board and wiring can carry the load'],
    ['External negative','Uno GND and driver ground','Common return'],
    ['Computer USB','Uno USB-B','Upload and diagnostics'],
  ],
  test:'Connect the phone in UART mode. Send H and verify the unloaded neutral positions. Send a/A through f/F in pairs to jog and return each joint. Push one joint toward its limit with repeated taps, then send S during a move and confirm the target stops advancing. Fit the links and transfer a foam block after tuning travel.',
  demo:['Bluetooth jog command','Holding','Jogging','The current joint positions stay fixed','A selected joint moves by one small step'],
};
