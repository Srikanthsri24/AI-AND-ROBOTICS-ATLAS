import type { Build } from './guided-projects';

export const starterWindow=5000;
export const starterPulse=650;
export const fingerprintStarter:Build={
  id:'directory-94',title:'Fingerprint Vehicle Starter Project',
  outcome:'Build a model vehicle starter on a test stand. Enroll one test fingerprint, then use a separate start button to spin the raised wheel briefly within a five-second authorization window.',
  parts:[
    ['Arduino Mega 2560 Rev3','1','Uses Serial1 for the local fingerprint module and USB serial for commands and diagnostics.'],
    ['Adafruit 751 optical fingerprint sensor','1','Stores the enrolled template on the module and reports whether the scan matches ID 1.'],
    ['Adafruit DRV8833 motor breakout','1','Drives the test motor and stays asleep between start pulses. Use the breakout with its current limit enabled.'],
    ['6 V TT geared DC motors','1','Use the pictured TT motor on the 3-cell test rail. Fit a small wheel with clearance from the stand.'],
    ['Switched 3×AA holder and matching lead','1 set','Separate motor power and a physical cutoff within reach.'],
    ['Momentary tactile start button','1','Starts one pulse on a fresh press. Release the button to stop early.'],
    ['Green and red LEDs with 220 Ω resistors','1 set','Green shows authorization. Red shows a denied scan or unavailable reader.'],
    ['Chassis and caster','1 set','Clamp the model chassis to a stable stand with both sides clear of the rotating wheel. The model stays on the stand.'],
    ['Breadboard and jumper wires','1 set','Route the UART and low-current signals. Keep motor power and loose leads away from the wheel.'],
    ['USB-A to USB-B data cable','1','Powers and programs the controller and carries enrollment prompts.'],
  ],
  assembly:[
    ['Secure the stationary test vehicle','Mount one motor and wheel. Support the chassis above the bench and verify that the wheel clears the stand and cables.','The chassis cannot drive off the stand, and the motor cutoff is accessible.',[3,4,7]],
    ['Connect the fingerprint reader','Mount the reader with the scan window accessible. Connect its TX and RX to the Mega Serial1 pins shown below, and check module power and ground.','The reader responds to the sketch at 57600 baud.',[0,1,8,9]],
    ['Wire the driver and controls','With both supplies off, wire the driver, switch, lamps and AA holder. Keep its current limit enabled. Tie the motor pack negative and Mega ground together.','The motor stays off at boot, and the low-current control wires remain clear of the wheel.',[0,2,3,4,5,6,8]],
    ['Enroll a test fingerprint','Leave the motor pack off. In Serial Monitor at 115200 baud send e. Follow the prompts to scan the same consenting test finger twice, removing it between scans.','Only slot 1 is used for the model. A successful enrollment leaves the starter locked.',[0,1,9]],
    ['Run the authorization trials','Switch on motor power with the wheel raised. Try Start while locked, a different finger, an expired authorization and a matched scan followed by Start. After the trial, send d to delete slot 1.','A match alone never starts the motor. A fresh Start press consumes the authorization, and the motor stops on release or after 650 ms.',[1,2,3,4,5,6]],
  ],
  wiring:[
    ['Mega 5 V / GND','Adafruit 751 VCC / GND','Check the actual cable pinout before connecting.'],
    ['Reader TX / RX','Mega RX1 D19 / TX1 D18','Hardware UART at 57600 baud'],
    ['Mega D4 / D5','DRV8833 SLP / AIN1','Sleep control and forward PWM'],
    ['DRV8833 AIN2','Common ground','Forward-only model starter'],
    ['Driver motor A output','TT motor leads','Keep motor B unused'],
    ['AA positive / negative','Protected Vmotor input / common ground','Separate motor supply with its own switch'],
    ['Mega D2','Start switch → ground','Use the internal pull-up'],
    ['Mega D6 / D7','Each → 220 Ω → green / red LED anode','Cathodes to ground'],
    ['Computer USB','Mega USB-B','Controller power and serial console'],
  ],
  test:'Try the button with the starter locked and after a denied scan. Match slot 1, wait five seconds, then try the button. Scan again, remove the finger and press the button before expiry. Confirm the wheel turns for at most 650 ms and then requires a new scan. Disconnect the reader with power off and verify the test will not arm after restart. Delete the test template afterward.',
  demo:['Fingerprint authorization','Locked','Ready for Start','Authorization consumed','Model starter pulse ends automatically'],
};
