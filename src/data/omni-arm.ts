import type { Build } from './guided-projects';

export const omniActions=[
  {key:'F',label:'Forward',ms:700,drive:[1,0,0]},
  {key:'B',label:'Reverse',ms:700,drive:[-1,0,0]},
  {key:'L',label:'Slide left',ms:700,drive:[0,-1,0]},
  {key:'R',label:'Slide right',ms:700,drive:[0,1,0]},
  {key:'Q',label:'Turn left',ms:550,drive:[0,0,-1]},
  {key:'E',label:'Turn right',ms:550,drive:[0,0,1]},
  {key:'P',label:'Lower to pickup',ms:800},
  {key:'C',label:'Close gripper',ms:550},
  {key:'U',label:'Lift block',ms:750},
  {key:'T',label:'Swing to drop',ms:800},
  {key:'D',label:'Lower to drop',ms:750},
  {key:'O',label:'Open gripper',ms:550},
  {key:'H',label:'Stow arm',ms:800},
] as const;
export type OmniAction=typeof omniActions[number];
export type OmniKey=OmniAction['key'];
export const omniExample='RFPCUTDOH';
export const omniLimit=12;
export const omniWheels=(forward:number,side:number,turn:number)=>[
  forward+side+turn,forward-side-turn,forward-side+turn,forward+side-turn,
];
export function parseOmni(program:string){
  const keys=program.toUpperCase().replace(/\s/g,'');
  if(!keys.length||keys.length>omniLimit)return null;
  const actions=[...keys].map(key=>omniActions.find(action=>action.key===key));
  return actions.every((action):action is OmniAction=>!!action)?actions:null;
}
export const omniArm:Build={
  id:'directory-90',
  title:'Programmable Omni Direction Robotic Arm Vehicle',
  outcome:'Build a four-wheel Mecanum vehicle with a six-servo arm. Program a short sequence that aligns the platform sideways, parks it and transfers a foam block between two marked docks.',
  parts:[
    ['Arduino Mega 2560 Rev3','1','Runs the serial command queue and addresses both I²C drivers.'],
    ['Adafruit Motor Shield V2','1','Drives four independently controlled wheel motors on M1–M4. Default I²C address 0x60.'],
    ['Left and right 48 mm Mecanum wheels','2 of each','Angled rollers enable lateral motion. Mount left and right wheels in opposing diagonal pairs.'],
    ['6 V TT geared DC motors','4','Fit four motors with matching shaft geometry and stall current within the shield rating.'],
    ['Four-motor chassis plate and mounts','1 set','Use a rigid plate with a centered mount for the arm, secure motor brackets and room for packs near the floor.'],
    ['Six-channel metal robot arm kit','1','Choose the PWM-servo version. The six channels are base, shoulder, elbow, wrist pitch, wrist roll and gripper.'],
    ['PCA9685 PWM servo driver','1','Outputs six simultaneous servo signals at I²C address 0x40.'],
    ['Regulated 4.5 V motor supply','1','Use a switched, current-limited bench output set to 4.5 V. Select four compatible motors within the 1.2 A per-channel rating at this voltage.'],
    ['External regulated arm servo supply','1 set','Use a switched, rated servo supply matched to the kit voltage and peak current. Use suitably rated wiring and mount it low and secure.'],
    ['Breadboard and jumper wires','1 set','Routes I²C signals and common ground. Use rated terminal wiring for motors, batteries and servos.'],
    ['USB-A to USB-B data cable','1','Uploads the sketch and sends a short movement program from Serial Monitor.'],
    ['Cardboard station markers and foam block','1 set','Marks the driveway, pickup pad and drop pad. Use a lightweight block that fits the gripper.'],
  ],
  assembly:[
    ['Build and label the Mecanum chassis','Mount four motors square to the chassis. From above, arrange the directions of the top rollers like an X. Label front-left, front-right, rear-left and rear-right.','All four wheels touch a level surface and opposite diagonal wheels match.',[2,3,4]],
    ['Wire the wheel shield and verify polarity','Fit the shield with both supplies switched off. Remove the shield power jumper. Wire all four motor outputs and connect the regulated 4.5 V supply only at the shield’s motor terminals.','On a stand send 1–4 separately and verify that each wheel turns in the forward direction. Correct polarity with power off.',[0,1,3,7,10]],
    ['Mount and wire the arm','Fit the arm centrally with the gripper empty. Wire the PCA9685 logic bus and six labeled servo leads. Route the separate servo supply through rated wiring and join its negative to logic ground.','The unloaded arm moves freely through a small range and the raised arm leaves the wheels and wiring clear.',[0,4,5,6,8,9]],
    ['Calibrate the arm on a stand','Start with horns unloaded and run H. Disconnect power before fitting horns near neutral. Use the individual arm tokens to tune the pulse tables, then move only a foam block. Keep motor power off for this check.','Pickup, lift, swing and drop poses clear the chassis. The closed jaw grips gently and the arm can return to stow.',[5,6,8,10,11]],
    ['Program a dock-to-dock transfer','Mark the stops where R and F land on your floor. Tune the motion timing before mounting the two pads within reach. Test the whole program with an empty arm, then use the foam block.','The vehicle slides right without turning, goes forward, parks and transfers the block before stowing.',[0,1,2,5,10,11]],
  ],
  wiring:[
    ['Mega shield headers','Motor Shield V2 at 0x60','Remove the motor power jumper. Use Mega R3 SDA/SCL headers.'],
    ['Shield M1 / M2 / M3 / M4','Front-left / front-right / rear-left / rear-right motors','Confirm polarity for each labeled wheel.'],
    ['Regulated 4.5 V positive and negative','Motor Shield power input terminals','Wheel rail only. Observe polarity.'],
    ['Mega 5 V and GND','PCA9685 logic VCC and GND','Logic only. Do not feed the servos from this pin.'],
    ['Mega SDA/D20 and SCL/D21','PCA9685 SDA and SCL at 0x40','Both shields share the I²C bus.'],
    ['PCA9685 channels 0–5','Base, shoulder, elbow, wrist pitch, wrist roll, gripper','Check each servo plug orientation.'],
    ['Dedicated regulated servo supply','Arm V+ and arm return via rated terminals','Share negative with Mega GND. Keep the three positive supply rails separate.'],
    ['Computer USB','Mega USB-B','Upload and issue test/program commands at 115200 baud.'],
  ],
  test:'Check wheel polarity on a stand with 1–4. Verify R translates to the right without turning. Test each arm pose with motor power off, then arrange both stations after a dry run. Send RFPCUTDOH and confirm the foam block reaches the drop pad. Send ! during a drive step to stop the wheels and clear the remaining queue.',
  demo:['Programmed chassis and arm','Parked','Program running','Drive interlock','Block released into the drop dock'],
};
