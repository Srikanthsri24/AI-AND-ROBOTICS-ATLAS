import type { Build } from './guided-projects';

export const gestureLimits = { deadband: 15, separation: 4, maximum: 55 };
export type Gesture = 'Stop'|'Forward'|'Reverse'|'Turn left'|'Turn right';

export function interpretGesture(pitch:number, roll:number, enable:boolean, calibrated:boolean, sensor:boolean):Gesture {
  const {deadband,separation,maximum}=gestureLimits;
  const dominant=Math.max(Math.abs(pitch),Math.abs(roll));
  if(!enable||!calibrated||!sensor||dominant<deadband||dominant>maximum||Math.abs(Math.abs(pitch)-Math.abs(roll))<separation) return 'Stop';
  if(Math.abs(pitch)>Math.abs(roll))return pitch>0?'Forward':'Reverse';
  return roll>0?'Turn right':'Turn left';
}

export const gestureRover:Build={
  id:'directory-53',
  title:'Gesture-Controlled Robot Using Arduino',
  outcome:'Build a tethered tilt controller for a two-wheel rover. Calibrate at level, then translate four wrist gestures into movement while holding the enable switch.',
  parts:[
    ['Arduino Uno R3','1','Reads the tilt sensor and switch, then drives the motor controller. Use a USB data cable to program the Uno.'],
    ['Adafruit MPU-6050 IMU','1','Measures acceleration on a hand-held pad. Use the breakout’s labeled axes when marking the pad.'],
    ['Momentary tactile button','1','Hold this button to enable drive. Releasing it stops both wheels.'],
    ['TB6612FNG breakout','1','Provides bidirectional motor control with separate logic and motor power.'],
    ['6 V geared DC motors and wheels','2','Power left and right wheels independently. Use motors whose stall current fits the driver.'],
    ['Chassis and caster','1 set','Secures the motors, driver, Uno and batteries. Use a small nonconductive block as a wheel stand.'],
    ['Switched 4×AA holder','1','Powers the motors through the driver’s VM pin. Leave the switch accessible.'],
    ['Breadboard and jumper wires','1 set','Route the IMU and button on a short flexible tether. Secure it clear of both wheels.'],
    ['5 V USB power bank','1','Powers the Uno for short floor trials after the raised-wheel checks.'],
  ],
  assembly:[
    ['Assemble the two-wheel frame','Fix the motors and caster to the chassis. Fasten the electronics on insulated mounts and keep the battery switch accessible. Label the front and the two motor leads.','The wheels turn freely and the chassis does not rock on the stand.',[3,4,5,6]],
    ['Make the tilt pad','Fix the IMU flat on a stiff card with the breakout’s X and Y axes visible. Mount the enable button where a thumb can hold it. Route a short I²C and switch tether to the Uno. Add strain relief at both ends and keep the cable away from the wheels.','The pad rests level during calibration and its wires do not pull on the breakout.',[0,1,2,7]],
    ['Wire driver and power','Disconnect USB and remove the AAs while wiring. Follow the table for both channels. Tie the driver and battery grounds to Uno ground. Connect the AA positive only to VM.','Uno logic power and motor supply are on separate positive rails. Both share ground.',[0,3,4,6,7]],
    ['Calibrate on the stand','With motor power off, place the pad flat, release Enable, and reset the Uno. Open Serial Monitor and wait for READY. Compare the signed pitch and roll values while making slow gestures. Mark the physical directions that produce positive and negative values.','At rest the log reads STOP. Pitch picks forward or reverse and roll picks left or right.',[0,1,2]],
    ['Observe the wheels before driving','Keep the wheels raised and switch on motor power. Hold Enable and test one axis at a time. If a straight command turns a wheel backward, switch both supplies off and swap that motor’s lead pair. Check the stop behavior before a short, clear test with the USB power bank.','Neutral, release, excessive and ambiguous tilt all stop both wheels.',[0,2,3,4,8]],
  ],
  wiring:[
    ['Uno 5 V / GND','MPU6050 VIN / GND and driver VCC / GND','Logic and common ground'],
    ['Uno A4 / A5','MPU6050 SDA / SCL','Short I²C tether'],
    ['Uno D2','Enable switch → ground','Active-low hold-to-run input'],
    ['Uno D5 / D6','Driver PWMA / PWMB','Left / right PWM'],
    ['Uno D4 / D7','Driver AIN1 / AIN2','Left direction'],
    ['Uno D8 / D11','Driver BIN1 / BIN2','Right direction'],
    ['Uno D12','Driver STBY','Low disables the two motor outputs'],
    ['Driver A and B outputs','Left and right motor pairs','Wheel drive'],
    ['AA pack positive / negative','Driver VM / shared ground','Separate motor power'],
  ],
  test:'After level calibration, hold Enable and tilt one axis about 25°. Wheels should drive forward, reverse or pivot according to the sign. Near level the wheels stop. Release Enable during a command and confirm both wheels stop. A large diagonal tilt should read STOP. After a sensor read failure, restore the connection with power off, level the pad and reset before driving again.',
  demo:['Pad gesture','Neutral','Positive pitch','Wheels stopped','Both wheels drive forward'],
};
