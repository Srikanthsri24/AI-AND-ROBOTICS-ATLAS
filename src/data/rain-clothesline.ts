import type { Build } from './guided-projects';

export const dryDelayMs = 4000;
export const rainServoAngles = {covered:35,outside:130};

export const rainClothesline:Build={
  id:'directory-22',
  title:'Rain Detector and Automatic Clothes Protection System',
  outcome:'Build a lightweight model clothesline that slides under a roof when its sensor gets wet and returns after four continuous seconds of dry readings.',
  parts:[
    ['Arduino Uno R3','1','Reads the rain sensor at D2 and commands the servo at D9.'],
    ['Grove Water Sensor and breakout cable','1 each','A water drop bridges the exposed traces and pulls the signal LOW. Use a Grove-to-male jumper cable.'],
    ['Positional micro servo','1','Turns a horn connected to the clothesline carriage by a short wire pushrod.'],
    ['Regulated 5 V servo supply','1','Powers the servo separately. Use a suitable low-voltage terminal adapter where needed and size the supply for stall current.'],
    ['Breadboard and jumper wires','1 set','Joins the grounds and sensor signals. Use a USB data cable to program and power the Uno.'],
  ],
  assembly:[
    ['Make a canopy and slide','Use a rigid card base, two parallel smooth strips and a light card carriage. Stretch a short thread between two uprights on the carriage and clip on paper clothes. Add a canopy over the covered end. Keep the tray and sensor beside the track so water does not run onto the electronics.','The empty carriage slides freely a few centimetres, and the canopy covers the whole paper load at the sheltered end.',[1,2]],
    ['Fit the servo linkage','Mount the servo next to the rails with the shaft upright. With the pushrod disconnected, use the sketch to check the 35° and 130° servo positions. Fit the horn and join it to the carriage with a short stiff wire bent at both ends. Adjust the angles in the sketch so the slider stops before either rail end.','The horn and pushrod move freely through the full stroke without stalling or passing through a straight-line lock position.',[0,2,3]],
    ['Wire the sensor and servo','Disconnect both power sources. Put the Grove sensor face up on the shallow tray, with its plug and the Uno off the wet area. Connect its signal to D2, and connect the servo to D9 and its independent 5 V supply. Join both grounds.','The sensor traces face up, power rails are separate, and all signal grounds are shared.',[0,1,2,3,4]],
    ['Test rain and recovery','Start with the sensor dry and wait four seconds for the clothesline to extend. With a dropper, put one drop of tap water across adjacent traces. Blot dry with a paper towel. Add a second drop within four seconds, then blot again and wait.','A wet reading retracts the line. A short dry gap keeps it sheltered, and four continuous seconds dry extend it.',[0,1,2]],
  ],
  wiring:[
    ['Uno 5 V','Grove red wire (VCC)','Sensor power'],
    ['Uno GND','Grove black wire (GND)','Sensor ground'],
    ['Grove yellow wire (SIG)','Uno D2','LOW when wet, HIGH when dry'],
    ['Grove white wire','Leave disconnected','Unused connector pin'],
    ['Uno D9','Servo signal lead','Carriage position command'],
    ['Separate regulated 5 V and negative','Servo power and ground','Servo motor supply'],
    ['Servo supply negative','Uno GND','Shared signal reference'],
  ],
  test:'Open Serial Monitor at 115200 baud and verify DRY with a clean, dry board. A drop of tap water bridging adjacent traces should print WET and retract the carriage. During a dry gap shorter than four seconds the servo stays covered. Wetting the sensor again resets the wait. After the final drop is blotted, the carriage should extend after four continuous dry seconds.',
  demo:['Sensor','Dry','Wet','Extends after the dry wait','Retracts under cover'],
};

export const rainClotheslineProgram={
  filename:'rain_clothesline.ino',
  setup:'Install Arduino Servo. Upload with the 5 V servo supply off and observe both angles with the pushrod disconnected before connecting it. Open Serial Monitor at 115200 baud.',
  source:`#include <Servo.h>
const byte WATER = 2, SERVO_PIN = 9;
const int COVERED = ${rainServoAngles.covered}, OUTSIDE = ${rainServoAngles.outside};
const unsigned long DRY_MS = ${dryDelayMs};
Servo lineServo;
unsigned long lastWet = 0, lastReport = 0;
bool covered = true;

void setup() {
  pinMode(WATER, INPUT);
  lineServo.write(COVERED);
  lineServo.attach(SERVO_PIN);
  Serial.begin(115200);
  lastWet = millis();
}

void loop() {
  const unsigned long now = millis();
  const bool wet = digitalRead(WATER) == LOW;
  if (wet) lastWet = now;
  const bool shelter = wet || now - lastWet < DRY_MS;
  if (shelter != covered) {
    covered = shelter;
    lineServo.write(covered ? COVERED : OUTSIDE);
  }
  if (now - lastReport >= 250) {
    lastReport = now;
    Serial.print(wet ? "WET" : "DRY");
    Serial.println(covered ? " | Sheltered" : " | Extended");
  }
}
`,
};
