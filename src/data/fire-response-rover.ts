import { bluetoothCar } from './bluetooth-car';
import type { Build } from './guided-projects';

export const fireResponseRover: Build = {
  id:'directory-3',
  title:'Arduino-Based Autonomous Fire-Fighting Robot',
  outcome:'Build a classroom response rover that finds a battery-powered flashlight beacon, approaches slowly, then stops and lights a red alert.',
  parts:[
    bluetoothCar.parts[0],
    ['Pair of CdS photoresistors','2','The left and right sensors let the Uno compare light levels and steer toward the brighter side.'],
    ['10 kΩ divider resistors','2','One resistor per sensor converts changing resistance into a voltage the Uno can read.'],
    ...bluetoothCar.parts.slice(2),
    ['Red LED and 220 Ω resistor','1 each','The LED turns on when the rover reaches the calibrated stopping zone. The resistor limits current.'],
  ],
  assembly:[
    ['Build the rolling chassis','Install the left and right geared motors, wheels and rear caster. Mark the front edge and label the motors A (left) and B (right).','Check that the wheels turn freely and the chassis sits level.',[4,5]],
    ['Make two matched light sensors','Mount two forward-facing photocells at the front corners. Use short opaque paper sleeves to shield side light and angle them slightly outwards. Build the two voltage dividers on the breadboard.','With motor power off and the sketch loaded, shine a flashlight at each photocell separately. Confirm its own reading rises in Serial Monitor.',[1,2,0,7]],
    ['Wire the drivetrain and alert','With both supplies disconnected, connect the motor driver, 220 Ω LED resistor and LED using the connection table. Put the longer LED leg toward the resistor and the flat side of the LED toward GND.','Check that VM and 5 V are separate, grounds are shared, and both motors fit the driver’s stall-current rating.',[3,4,6,9]],
    ['Mount and secure the electronics','Fasten the Uno, breadboard, driver, AA holder and USB power bank. Use insulated mounts and keep wire loops away from the wheels.','The electronics clear the chassis and the AA switch remains easy to reach.',[0,3,6,7,8]],
  ],
  wiring:[
    ['Uno 5 V','Each photocell outer leg and driver VCC','Sensor and logic power'],
    ['Left photocell inner leg and first 10 kΩ resistor','A0','Left sensor voltage'],
    ['Right photocell inner leg and second 10 kΩ resistor','A1','Right sensor voltage'],
    ['Other end of each 10 kΩ resistor','GND','Divider return'],
    ['D5 / D6','PWMA / PWMB','Left / right motor speed'],
    ['D4 / D7 and D8 / D11','AIN1 / AIN2 and BIN1 / BIN2','Motor direction'],
    ['D12','STBY','Motor driver enable'],
    ['A outputs / B outputs','Left / right motor leads','Motor power'],
    ['Switched AA positive','VM / Vmotor','Separate motor supply'],
    ['AA negative, driver GND','Uno GND','Shared ground'],
    ['D10','220 Ω resistor → LED anode','Arrival alert'],
    ['LED cathode','GND','Alert return'],
    ['Computer USB or 5 V USB bank','Uno USB port','Logic supply'],
  ],
  test:'With the AA pack off, use Serial Monitor at 9600 baud to record both sensors under room light, at the start position, and at the desired stopping distance. Set the sketch thresholds between those readings. Raise the wheels and check darkness, left, right and centered light before trying a clear floor course. At arrival or after the eight-second movement limit, the rover stays parked until reset.',
  demo:['Beacon','Off','On','Rover waits','The rover follows the beacon and stops with its alert on'],
};

export const beaconThresholds = {detect:480,arrival:820,balance:45,limitMs:8000};

export const fireResponseProgram = {
  filename:'beacon_response_rover.ino',
  setup:'Use a battery flashlight as the target on a clear course. Keep the motor supply off for the first USB calibration. Set DETECT above both room-light readings and below the stronger sensor’s start reading. Set ARRIVAL below both readings at the marked stopping point and above DETECT. Re-upload, raise the wheels, then enable the motor supply. Reset the Uno between trials.',
  source:`const byte PWM_A = 5, PWM_B = 6, ENABLE = 12, ALERT = 10;
const byte A1_PIN = 4, A2_PIN = 7, B1_PIN = 8, B2_PIN = 11;
const int DETECT = ${beaconThresholds.detect}, ARRIVAL = ${beaconThresholds.arrival}, BALANCE = ${beaconThresholds.balance};
const unsigned long LIMIT_MS = ${beaconThresholds.limitMs};
bool started = false, parked = false;
unsigned long firstMotion = 0, lastPrint = 0;

void drive(byte left, byte right) {
  analogWrite(PWM_A, left);
  analogWrite(PWM_B, right);
  digitalWrite(ENABLE, left || right ? HIGH : LOW);
}

void setup() {
  const byte outputs[] = {PWM_A,PWM_B,ENABLE,ALERT,A1_PIN,A2_PIN,B1_PIN,B2_PIN};
  for (byte pin : outputs) pinMode(pin, OUTPUT);
  digitalWrite(A1_PIN, HIGH);
  digitalWrite(B1_PIN, HIGH);
  drive(0, 0);
  Serial.begin(9600);
}

void loop() {
  const int left = analogRead(A0), right = analogRead(A1);
  const unsigned long now = millis();
  if (now - lastPrint >= 250) {
    Serial.print("A0 left: "); Serial.print(left);
    Serial.print("  A1 right: "); Serial.println(right);
    lastPrint = now;
  }
  if (parked) return;
  if (started && now - firstMotion >= LIMIT_MS) {
    drive(0, 0);
    parked = true;
    return;
  }
  if (left >= ARRIVAL && right >= ARRIVAL) {
    drive(0, 0);
    digitalWrite(ALERT, HIGH);
    parked = true;
    return;
  }
  if (max(left,right) < DETECT) {
    drive(0, 0);
    return;
  }
  if (!started) {
    firstMotion = now;
    started = true;
  }
  if (left - right > BALANCE) drive(0, 115);
  else if (right - left > BALANCE) drive(115, 0);
  else drive(105, 105);
  delay(35);
}
`,
};
