import type { Build } from './guided-projects';

export const trackLimits={center:160,deadband:18,minimumWidth:14,nearWidth:100};
export function trackCommand(x:number,width:number) {
  if(width<trackLimits.minimumWidth)return 'Lost';
  if(width>=trackLimits.nearWidth)return 'Hold';
  if(x<trackLimits.center-trackLimits.deadband)return 'Left';
  if(x>trackLimits.center+trackLimits.deadband)return 'Right';
  return 'Forward';
}
export const piObjectFollower:Build={
 id:'directory-105',title:'Object Tracker & Follower Robot Using Raspberry Pi',
 outcome:'Set up a rover to follow an orange marker using a camera crop, bounding box and width threshold. Compare steering and stop behavior as the marker moves around a controlled model course.',
 parts:[
  ['Raspberry Pi 5','1','Runs OpenCV and sends a drive instruction to the Uno for each usable camera frame.'],
  ['27 W USB-C power supply','1','Powers the Pi on the bench. Keep the model on a stand while the bench cable is attached.'],
  ['USB webcam','1','Frames the orange marker and feeds a 320 × 240 image to OpenCV.'],
  ['Arduino Uno R3','1','Receives drive bytes and stops the H-bridge when messages expire.'],
  ['Adafruit DRV8833 motor breakout','1','Runs two forward-only motor channels from the separate wheel supply.'],
  ['6 V geared DC motors and wheels','2 sets','Drive the left and right wheels. Use TT gears compatible with the 3-cell supply.'],
  ['Switched 3×AA holder and matching lead','1 set','Powers the wheels and provides a local power cutoff.'],
  ['Chassis and caster','1 set','Mounts the wheels and camera. Add a stand for stationary wheel tests.'],
  ['USB-A to USB-B data cable','1','Powers the Uno from the Pi and carries the drive commands.'],
  ['Breadboard and jumper wires','1 set','Connects the signal and ground paths.'],
 ],
 assembly:[
  ['Build and raise the rover','Fit both motors and wheels, and add the caster. Support the chassis so both wheels clear the bench. Place the motor cutoff within reach.','Each wheel spins without catching wires or touching the bench.',[4,5,6,7]],
  ['Aim the webcam','Fix the camera at the front of the chassis and plug it into the Pi. Use a matte orange card as the only orange object in frame.','The full card is visible at the center, left, and right of the frame.',[0,1,2,7]],
  ['Connect the motor driver','Switch off the AA supply and wire PWM, sleep, and shared ground. Connect the motor leads to their respective channels.','The driver sleeps on startup. The motor pack positive goes only to the motor supply input.',[3,4,5,6,9]],
  ['Check the tracking overlay','Run the Pi program with the wheels disabled. Move the card across the picture, toward the camera, and out of view.','A box tracks the orange card. Its center changes with horizontal position and its width grows as the card approaches.',[0,2,3,8]],
  ['Run a wheel-stand trial','Enable motor power only once the rover is raised. Sweep the card left and right. Bring the card close, then hide it and stop the computer program.','The inside wheel slows on turns. Both stop on a near target, a lost target or an expired serial command.',[2,3,4,5,8]],
 ],
 wiring:[
  ['Webcam USB','Pi USB-A','OpenCV camera input.'],
  ['Pi USB-A','Uno USB-B','Drive commands at 115200 baud.'],
  ['Uno D5 and D6','DRV8833 AIN1 and BIN1','Forward PWM, left and right.'],
  ['DRV8833 AIN2 and BIN2','Ground','Forward-only drive.'],
  ['Uno D4','DRV8833 SLP','Enable when a fresh valid drive command is present.'],
  ['Driver AOUT / BOUT pairs','Left / right motor leads','Test direction with wheels raised.'],
  ['Switched 3×AA supply and Uno GND','Driver VM and GND','Independent motor rail with common ground and current limit enabled.'],
 ],
 test:'Use the preview before turning on the wheels. Move an orange card left, center and right, then closer than the width threshold. Hide it. With the model raised, confirm the wheel outputs match each decision. Stop sending commands and confirm both wheels stop within 350 ms.',
 demo:['Colored target','Bounding box','Left or right correction','Distance hold','Stop on lost target'],
};
