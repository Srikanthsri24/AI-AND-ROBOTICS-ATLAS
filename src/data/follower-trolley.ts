import type { Build } from './guided-projects';

export const trolleyLimits={near:18,resumeWidth:54,holdWidth:66,minimumWidth:12,targetFrames:2,pwm:115} as const;
export type TrolleyReading={x:number;width:number;echo:number|null;visible:boolean};
export type TrolleyDecision='parked'|'echo missing'|'too close'|'target lost'|'acquiring'|'holding gap'|'following';
export function trolleyControl(input:TrolleyReading,enabled:boolean,seen:number,following:boolean){
  const decision=(reason:TrolleyDecision)=>({reason,left:0,right:0});
  if(!enabled)return decision('parked');
  if(input.echo===null)return decision('echo missing');
  if(input.echo<trolleyLimits.near)return decision('too close');
  if(!input.visible||input.width<trolleyLimits.minimumWidth)return decision('target lost');
  if(seen<trolleyLimits.targetFrames)return decision('acquiring');
  if(input.width>=(following?trolleyLimits.holdWidth:trolleyLimits.resumeWidth))return decision('holding gap');
  const steer=Math.abs(input.x-160)<12?0:Math.max(-65,Math.min(65,Math.trunc((input.x-160)*.75)));
  return {reason:'following' as const,left:trolleyLimits.pwm+steer,right:trolleyLimits.pwm-steer};
}

export const followerTrolley:Build={
  id:'directory-91',
  title:'Smart Follower Shopping Trolley',
  outcome:'Build a small shopping trolley that follows a learned color panel carried by a model shopper. Compare camera steering, distance keeping and the independent front sonar stop.',
  parts:[
    ['Arduino Uno R3','1','Reads the trained color block and sonar, then commands the two drive wheels.'],
    ['DFRobot HuskyLens SEN0305 vision sensor','1','Learns a single high-contrast color patch as ID1. Use I²C and Color Recognition mode.'],
    ['HC-SR04 ultrasonic module','1','Checks forward clearance. It stops the model on an echo under 18 cm or a missing echo.'],
    ['Adafruit DRV8833 motor breakout','1','Two current-limited drive channels. This model only drives forward and uses SLP to disable drive.'],
    ['6 V geared DC motors and wheels','2','Matching TT-type gear motors rated to run from 3–4.5 V with their paired wheels.'],
    ['Chassis and caster','1 set','Mounts the basket and keeps the camera and sonar aligned.'],
    ['Switched 3×AA holder and matching lead','1 set','Use three alkaline AAs. Put the exposed motor cutoff within reach.'],
    ['5 V USB power bank','1','Powers the controller and sensors for an untethered trial. Use a USB data cable for uploading.'],
    ['Momentary tactile start button','1','Toggles follow mode. Power-on state is parked.'],
    ['Breadboard and jumper wires','1 set','Connects logic signals. Use firm terminal connections for motor power.'],
    ['Mesh basket, color target and obstacles','1 set','Use a light mesh basket and a rigid matte board with one colored patch. Use a separate plain cardboard box for obstacle tests.'],
  ],
  assembly:[
    ['Build the model trolley','Fit the wheels and caster. Fix the basket low and keep it lightly loaded. Mount the AA holder with its switch within reach.','The trolley rolls freely and the basket and batteries stay secure when it turns.',[4,5,6,10]],
    ['Aim both front sensors','Mount the HuskyLens and HC-SR04 facing straight ahead. Put the color patch at camera height and extend the target board down to sonar height.','The camera sees the whole patch while the sonar has a broad, flat surface to read.',[1,2,5,10]],
    ['Wire motor control and logic','Turn off the AA supply and unplug USB. Connect both motor channels and SLP, PWM and FLT. Use a shared ground and keep the AA positive off the Uno 5 V rail.','The wheel driver sleeps at startup. On a stand, both wheels roll forward when their channel is enabled.',[0,3,4,6,7,8,9]],
    ['Learn one target and check the readings','Set the original HuskyLens to I²C in General Settings. Select Color Recognition and learn the patch as ID1. Place the target in a controlled aisle with a flat end panel within sonar range.','Move the patch left and right. The logged X center changes. Measure the width near the desired gap and tune the two width thresholds if needed.',[0,1,2,8,10]],
    ['Run the aisle trials','With the motor cutoff accessible, enable follow and move the target slowly. Test a sideways offset, hide the target, then put the plain box in front. Repeat with an empty echo path.','The model slows the inside wheel to steer, holds its gap and stops when the target is lost or the sonar path is unsafe.',[0,1,2,3,8,10]],
  ],
  wiring:[
    ['Uno 5 V / GND','HuskyLens VCC / GND and HC-SR04 VCC / GND','Use regulated logic power. Keep the camera fill light off for the trial.'],
    ['Uno A4 / A5','HuskyLens SDA / SCL','I²C on the original SEN0305 camera'],
    ['Uno D9 / D10','HC-SR04 TRIG / ECHO','Forward range safety check'],
    ['Uno D5 / D6','DRV8833 AIN1 / BIN1','Left / right forward PWM'],
    ['DRV8833 AIN2 / BIN2','Common ground','Forward-only drive'],
    ['Uno D4 / D7','DRV8833 SLP / FLT','SLP high enables. FLT is active-low with the Uno pull-up.'],
    ['Motor out A / B','Left / right motor lead pair','Swap one lead pair if the corresponding wheel runs backward.'],
    ['Switched AA positive / negative','DRV8833 protected Vmotor terminal / common GND','Independent wheel supply'],
    ['Uno D2','Toggle switch → GND','Momentary, active low'],
    ['USB power bank','Uno USB-B','Use computer USB for calibration and serial diagnostics.'],
  ],
  test:'With the wheels raised, select follow mode and sweep ID1 across the image. The wheel on the inside of the turn slows. Verify a wide/near target makes the model hold. Hide the patch or put a box within 18 cm of the front sonar and check that both wheels stop. Point the sonar down an empty lane to test the timeout. Clear the lane and verify the trolley needs two good frames before following again.',
  demo:['Camera target and sonar','Parked','Following learned patch','Drive disabled when unsafe','The trolley steers toward the model shopper'],
};
