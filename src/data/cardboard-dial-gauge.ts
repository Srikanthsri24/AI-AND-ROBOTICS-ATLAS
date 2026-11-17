import type {Build} from './guided-projects';

export const cardboardDialGauge:Build={
  id:'cardboard-dial-gauge',
  title:'Cardboard dial gauge',
  outcome:'Turn a knob to move a servo-driven pointer across a cardboard scale. Calibrate 0%, 50% and 100% against the Arduino’s analog reading, then check readings between the marks.',
  parts:[
    ['Arduino Uno R3','1','Reads the knob voltage on A0 and commands the pointer on D9.'],
    ['10 kΩ linear potentiometer','1','Acts as a voltage divider. The middle terminal supplies an adjustable voltage to A0.'],
    ['Positional micro servo','1','Moves the pointer to the angle calculated from the analog input.'],
    ['Regulated 5 V servo supply','1','Powers the servo independently of the Uno USB supply.'],
    ['Card dial face and pointer','1 set','Makes an upright scale and lightweight moving pointer. Use a ruler, protractor and tape to mark and assemble it.'],
    ['Breadboard and jumper wires','1 set','Distributes 5 V for the knob and provides a shared ground.'],
    ['USB-A to USB-B data cable','1','Uploads the sketch and connects the Serial Monitor.'],
  ],
  assembly:[
    ['Lay out three calibration marks','Cut a card panel and mark a point for the shaft. Using a protractor, draw a centerline at the top, then lines 60° to either side. Mark the left, center and right lines 0%, 50% and 100%. Make a light pointer that stops short of the outer rim.','The pointer covers a clear 120° arc.',[4]],
    ['Mount the knob and servo','Mount the servo behind the panel with only the shaft and horn on the front. Mount the potentiometer below the scale or secure it on the bench. Leave the pointer detached for the first upload.','The moving pointer has clearance in front of the panel.',[1,2,4]],
    ['Wire the voltage divider and servo','Disconnect power. Wire the outer potentiometer terminals to Uno GND and Uno 5 V, with the wiper on A0. Connect servo signal to D9. Use the external 5 V supply for servo positive and connect its return to both the servo and Uno grounds.','A shared ground is present and the two positive supplies are separate.',[0,1,2,3,5]],
    ['Align the pointer and record endpoints','Upload the sketch and watch A0 in Serial Monitor. Note the readings at both knob stops and enter them in the sketch. Turn to 50%, disconnect power, and attach the pointer facing up. If the pointer sweeps in the wrong direction, set reversePointer in the sketch.','The three known inputs line up with the three printed marks without reaching a mechanical stop.',[0,1,2,4,6]],
  ],
  wiring:[
    ['Uno 5 V and GND','Potentiometer outer terminals','Reference voltage across the track'],
    ['Uno A0','Potentiometer middle terminal','Knob voltage for the ADC'],
    ['Uno D9','Servo signal','Position command'],
    ['External regulated 5 V','Servo positive','Dedicated servo supply'],
    ['Uno GND','Servo ground and supply return','Shared reference'],
  ],
  test:'After endpoint calibration, approach 25%, 50% and 75% from both sides. Use the serial percentage as the reference and check the face reading within five percentage points. Record any repeatable offset or difference between approaches.',
  demo:['Inspect the shaft','Set a known input','Observe the pointer','Compare the serial reading','Check repeatability'],
};
