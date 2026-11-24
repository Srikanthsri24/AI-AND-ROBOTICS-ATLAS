import { fanInterlockProgram } from './fan-interlock';
import { gpsAlertProgram } from './gps-alert';
import { exhibitionLockProgram } from './exhibition-lock';
import { classroomAirProgram } from './classroom-air';
import { smartGreenhouseProgram } from './smart-greenhouse';
import { pickBalanceProgram } from './pick-balance';
import { roverArmProgram } from './rover-arm';
import { automaticTapProgram } from './automatic-tap';
import { soapDispenserProgram } from './soap-dispenser';
import { trafficParkingProgram } from './traffic-parking';
import { schoolBellProgram } from './school-bell';
import { rfidDoorProgram } from './rfid-door';
import { rainClotheslineProgram } from './rain-clothesline';
import { mq2MonitorProgram } from './mq2-monitor';
import { electromagnetCraneProgram } from './electromagnet-crane';
import { electronicPianoProgram } from './electronic-piano';
import { streetLightProgram } from './street-light';
import { railwayGateProgram } from './railway-gate';
import { ultrasonicRadarProgram } from './ultrasonic-radar';
import { cubeSatProgram } from './weather-cubesat';
import { emergencyProgram } from './emergency-lighting';
import { industrialProgram } from './industrial-monitor';
import { mineProgram } from './mine-safety';
import { smartBinProgram } from './smart-waste-bin';
import { aquacleanProgram } from './aquaclean';
import { floodGateProgram } from './flood-gate';
import { floodWarningProgram } from './flood-warning';
import { rocketLabProgram } from './water-rocket';
import { lidarBenchProgram } from './lidar-micro-drone';
import { solarSweeperProgram } from './solar-sweeper';
import { fireResponseProgram } from './fire-response-rover';
import { esp32CarProgram } from './esp32-car';
import { bluetoothCarCommands, bluetoothCarPulseMs } from './bluetooth-car';

type Program = { filename: string; setup: string; source: string };
const arduino = (id: string, setup: string, source: string): Program =>
  ({filename: id + '.ino', setup, source});
const position = (id: string, low: number, high: number) => arduino(id,
  'Upload with the linkage unloaded and the servo supply switched off. Open Serial Monitor at 9600 baud. Start with command 0 and verify clearance before using 1.',
  `#include <Servo.h>
Servo joint;
void setup() {
  Serial.begin(9600);
  joint.attach(9);
  joint.write(${low});
}
void loop() {
  if (!Serial.available()) return;
  char command = Serial.read();
  if (command == '0') joint.write(${low});
  if (command == '1') joint.write(${high});
}`);
export const projectPrograms: Record<string, Program> = {
  'directory-2': esp32CarProgram,
  'directory-3': fireResponseProgram,
  'directory-4': solarSweeperProgram,
  'directory-5': lidarBenchProgram,
  'directory-7': rocketLabProgram,
  'directory-8': floodWarningProgram,
  'directory-9': floodGateProgram,
  'directory-10': aquacleanProgram,
  'directory-11': smartBinProgram,
  'directory-12': mineProgram,
  'directory-13': industrialProgram,
  'directory-14': emergencyProgram,
  'directory-15': cubeSatProgram,
  'directory-41': fanInterlockProgram,
  'directory-40': gpsAlertProgram,
  'directory-39': exhibitionLockProgram,
  'directory-38': classroomAirProgram,
  'directory-37': smartGreenhouseProgram,
  'directory-36': pickBalanceProgram,
  'directory-35': roverArmProgram,
  'directory-27': automaticTapProgram,
  'directory-26': soapDispenserProgram,
  'directory-25': trafficParkingProgram,
  'directory-24': schoolBellProgram,
  'directory-23': rfidDoorProgram,
  'directory-22': rainClotheslineProgram,
  'directory-21': mq2MonitorProgram,
  'directory-20': electromagnetCraneProgram,
  'directory-19': electronicPianoProgram,
  'directory-18': streetLightProgram,
  'directory-17': railwayGateProgram,
  'directory-16': ultrasonicRadarProgram,
  'directory-1': arduino('bluetooth_rc_car',
    'Keep the wheels off the floor. With the Bluefruit in UART/Data mode, open Bluefruit LE Connect on your phone, connect to the module, and open UART. Switch on the AA pack. Send a single uppercase F, B, L, R or S in the UART text field.',`#include <SoftwareSerial.h>

const byte PWM_A = 5, PWM_B = 6;
const byte A1_PIN = 4, A2_PIN = 7;
const byte B1_PIN = 8, B2_PIN = 11;
const byte STANDBY = 12;
const byte SPEED = 110;
const unsigned long PULSE_MS = ${bluetoothCarPulseMs};
SoftwareSerial radio(2, 3); // D2 receives Bluefruit TXO. Leave D3 unwired.
unsigned long lastDrive = 0;
bool moving = false;

void setWheel(byte pwm, byte in1, byte in2, int direction) {
  digitalWrite(in1, direction > 0);
  digitalWrite(in2, direction < 0);
  analogWrite(pwm, direction == 0 ? 0 : SPEED);
}

void drive(int left, int right) {
  digitalWrite(STANDBY, LOW);
  setWheel(PWM_A, A1_PIN, A2_PIN, left);
  setWheel(PWM_B, B1_PIN, B2_PIN, right);
  moving = left != 0 || right != 0;
  digitalWrite(STANDBY, moving ? HIGH : LOW);
  lastDrive = millis();
}

void setup() {
  digitalWrite(STANDBY, LOW);
  pinMode(STANDBY, OUTPUT);
  const byte pins[] = {PWM_A, PWM_B, A1_PIN, A2_PIN, B1_PIN, B2_PIN};
  for (byte pin : pins) pinMode(pin, OUTPUT);
  drive(0, 0);
  radio.begin(9600);
}

void loop() {
  if (radio.available()) {
    switch (radio.read()) {
${bluetoothCarCommands.map(({key,left,right})=>`      case '${key}': drive(${left}, ${right}); break;`).join('\n')}
      case '\\r': case '\\n': break;
      default: drive(0, 0); break;
    }
  }
  if (moving && millis() - lastDrive >= PULSE_MS) drive(0, 0);
}`),
  'rover-project': arduino('rover','Upload with the motor supply switched off. Set the chassis on a stand before enabling the motor supply.',`void drive(bool enabled) {
  digitalWrite(12, LOW);
  analogWrite(5, enabled ? 95 : 0);
  analogWrite(6, enabled ? 95 : 0);
  if (enabled) digitalWrite(12, HIGH);
}
void setup() {
  const int outputs[] = {2, 4, 5, 6, 7, 8, 11, 12};
  for (int pin : outputs) pinMode(pin, OUTPUT);
  pinMode(3, INPUT);
  digitalWrite(4, HIGH);
  digitalWrite(8, HIGH);
  drive(false);
}
void loop() {
  digitalWrite(2, LOW);
  delayMicroseconds(2);
  digitalWrite(2, HIGH);
  delayMicroseconds(10);
  digitalWrite(2, LOW);
  unsigned long echoUs = pulseIn(3, HIGH, 24000);
  float cm = echoUs * 0.01715;
  drive(echoUs > 0 && cm >= 20.0);
  delay(60);
}`),
  'hand-project': position('robotic-hand',80,105),
  'desktop-arm': position('desktop-arm',70,110),
  'soil-observer': arduino('soil-detector','Open Serial Monitor at 9600 baud and record the stable dry and damp readings printed by the sketch. Replace the two example values and upload again.',`const int dry = 720;  // Replace with your dry reference
const int damp = 380; // Replace with your damp reference
void setup() {
  pinMode(8, OUTPUT);
  Serial.begin(9600);
}
void loop() {
  long sum = 0;
  for (int i = 0; i < 8; ++i) sum += analogRead(A0);
  int raw = sum / 8;
  Serial.println(raw);
  int midpoint = (dry + damp) / 2;
  bool needsWater = dry > damp ? raw > midpoint : raw < midpoint;
  digitalWrite(8, dry != damp && needsWater);
  delay(400);
}`),
  'home-project': arduino('climate-monitor','Upload and open Serial Monitor at 9600 baud. Compare the displayed temperature with a thermometer.',`void setup() {
  pinMode(8, OUTPUT);
  Serial.begin(9600);
}
void loop() {
  float volts = analogRead(A0) * (5.0 / 1023.0);
  float temperatureC = (volts - 0.5) * 100.0;
  Serial.println(temperatureC);
  digitalWrite(8, temperatureC > 28.0);
  delay(300);
}`),
  'ambient-light': arduino('night-light','Open Serial Monitor at 9600 baud and use bright and dark readings to choose the lower and upper thresholds.',`bool lampOn = false;
void setup() {
  pinMode(8, OUTPUT);
  Serial.begin(9600);
}
void loop() {
  int light = analogRead(A0);
  Serial.println(light);
  if (light < 300) lampOn = true;
  if (light > 450) lampOn = false;
  digitalWrite(8, lampOn);
  delay(50);
}`),
  'traffic-sequencer': arduino('traffic-signal','Upload the sketch and compare the lamp order with the labels on the breadboard.',`const int lamps[] = {8, 10, 9}; // Red, green, amber
const int duration[] = {3000, 3000, 1000};
void setup() {
  for (int pin : lamps) pinMode(pin, OUTPUT);
}
void loop() {
  for (int phase = 0; phase < 3; ++phase) {
    digitalWrite(lamps[phase], HIGH);
    delay(duration[phase]);
    digitalWrite(lamps[phase], LOW);
  }
}`),
  'button-indicator': arduino('button-panel','Upload and verify the LED stays off before pressing the button.',`void setup() {
  pinMode(2, INPUT_PULLUP);
  pinMode(8, OUTPUT);
}
void loop() {
  digitalWrite(8, digitalRead(2) == LOW);
}`),
  'vision-counter': {filename:'camera-counter.py',setup:'Install OpenCV for Python. Set the camera index and point the camera at the matte counting card. Press Q to exit.',source:`import cv2

camera = cv2.VideoCapture(0)
try:
    while True:
        ok, frame = camera.read()
        if not ok:
            raise RuntimeError("Could not read a frame")
        height, width = frame.shape[:2]
        region = frame[height//4:3*height//4, width//4:3*width//4]
        gray = cv2.cvtColor(region, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY)
        _, _, stats, _ = cv2.connectedComponentsWithStats(mask)
        count = sum(int(row[cv2.CC_STAT_AREA]) >= 80 for row in stats[1:])
        cv2.putText(region, str(count), (10, 30),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 200, 255), 2)
        cv2.imshow("Counting region", region)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
finally:
    camera.release()
    cv2.destroyAllWindows()`},
};

export const programWalkthroughs: Record<string, string[]> = {
  'directory-41': [
    'The pressure pad and 10 kΩ resistor set the analog input voltage.',
    'The fan runs after reset. A sustained high reading latches the stop.',
    'Removing pressure leaves the stop latched until the operator presses Reset.',
  ],
  'directory-40': [
    'The GPS library decodes one RMC sentence at a time. The sketch remembers when the last valid fix arrived.',
    'The test button needs a continuous 650 ms hold, even if the GPS has no current fix.',
    'Acknowledgment turns off the LED and stops location sharing with the USB test receiver.',
  ],
  'directory-39': [
    'The keypad scanner drives one row at a time and checks which column is held low.',
    'The public exhibit code retracts the bolt. Open contacts keep it retracted.',
    'A stable closed contact starts a three-second delay. Reopening cancels that delay.',
  ],
  'directory-38': [
    'Read the environmental PM2.5 field from each checked sensor frame.',
    'Update the four-sample average and use it to drive a classroom indicator.',
    'When a read fails, clear the average and switch both status lights off.',
  ],
  'directory-37': [
    'Two measured soil reference points convert the probe voltage into a relative index.',
    'The fan uses separate thresholds. Watering uses a short pulse and a soak delay to limit each application.',
    'A private Ethernet connection reports current readings while control continues on the Uno.',
  ],
  'directory-36': [
    'The open-loop transfer applies five timed commands to the lift, gripper and wheel driver.',
    'The balance loop combines the accelerometer angle and gyroscope rate, then commands motor effort from both estimates.',
    'A large tilt or delayed control loop disarms the motor output. The balancing gains must be tuned on the actual chassis.',
  ],
  'directory-35': [
    'The A2 jumper selects rover mode at startup. Without it, the Uno sends commands to the stationary servo driver.',
    'With an obstacle at 25 cm or closer the rover turns, then measures the new heading. A missing echo stops the drive.',
    'The arm sketch centers on h and jogs one channel at a time. The gripper is the sixth servo channel.',
  ],
  'directory-27': [
    'Three valid clear echoes arm the tap. Three close echoes start the pump when the tank sensor reports water.',
    'Water low, a missing echo, withdrawal or four seconds of flow switches the pump off.',
    'After any stop, the tap waits for a new clear reading sequence before it can start again.',
  ],
  'directory-26': [
    'The controller waits for three valid clear readings, then looks for three consecutive readings in the 4–12 cm band.',
    'The servo presses once and returns while the pump refills. A hand left in place cannot start another cycle.',
    'Moving the hand away exposes the tray target and rearms the controller. A missing echo does not count as clear.',
  ],
  'directory-25': [
    'The six traffic phases include amber and an all-red clearance before either street gets a green.',
    'One accepted entry reserves a bay and opens the barrier for 2.5 seconds. A confirmed exit releases one occupied bay.',
    'The phase and barrier use separate millis() timers. A full parking lot never interrupts the traffic sequence.',
  ],
  'directory-24': [
    'Both I²C devices share SDA and SCL. Their different addresses let the Uno read the RTC and write the display separately.',
    'Only a change to a scheduled weekday minute starts the chime, so the same minute does not trigger repeatedly.',
    'The loop times each note and the gap with millis(), so it can still read the clock while the piezo is active.',
  ],
  'directory-23': [
    'The PN532 reader sends the tag identifier to the Uno. Sending e tells the sketch to remember the next fresh classroom tag.',
    'For later scans, the sketch checks the length and every byte of the tag identifier before releasing the model latch.',
    'After three seconds, the latch relocks. A tag held in range does not count as a new presentation.',
  ],
  'directory-22': [
    'A wet sensor pulls D2 LOW and renews the last-wet timestamp.',
    'The servo commands the sheltered position at startup or whenever the sensor is wet.',
    'The dry timer must reach four seconds without another wet reading before D9 commands the outside position.',
  ],
  'directory-21': [
    'The sketch updates a rolling average of the last eight A0 samples.',
    'Sending b saves the current average as the clean-air reference. Each new average is compared with that saved value.',
    'At 90 counts above baseline the LED turns on. It turns off at 65 counts above baseline or lower.',
  ],
  'directory-20': [
    'A held button pulls D2 LOW. The first stable release arms the controller, and the next press starts its timer.',
    'D9 drives the MOSFET board signal. Coil current comes from the separate 5 V supply.',
    'Releasing the button or reaching eight seconds turns the magnet off. The driver’s diode gives the collapsing coil current a path.',
  ],
  'directory-19': [
    'INPUT_PULLUP holds the idle pin HIGH. Pressing its key connects the pin to ground and makes it LOW.',
    'Each contact has to stay steady for 15 ms. This prevents the brief bouncing of a mechanical switch from interrupting a note.',
    'The loop checks the lowest key first. It sends one frequency to D10 with tone() and stops the signal with noTone() when every key is released.',
  ],
  'directory-18': [
    'The photoresistor and 10 kΩ resistor form a voltage divider. A0 reads their junction, with larger readings in brighter light.',
    'At 330 or below the sketch turns all three lamps on. At 470 or above it turns them off.',
    'Between those readings the sketch keeps the previous state. This gap is called hysteresis and helps stop flickering at twilight.',
  ],
  'directory-17': [
    'The pull-up reads HIGH when a train blocks the beam. The receiver pulls the pin LOW when it sees infrared light.',
    'Beam A closes the crossing and the program remembers the train even after A clears.',
    'Beam B confirms that the train reached the exit. The arm rises only when both beams are clear again.',
  ],
  'directory-16': [
    'The servo moves by 5° at a time and settles before the sensor sends a pulse.',
    'Sound travels from the sensor to the target and back. Divide round-trip travel by two to estimate the range.',
    'The CSV pairs each angle with one range. A missing or out-of-range echo is printed as -1 and should be skipped when plotting.',
  ],
  'directory-15': [
    'Capture copies the current longitude and cloud setting into an immutable frame.',
    'The buffer holds one frame. The contact window opens at 35° E and closes after 85° E.',
    'Successful downlink moves the stored frame to the archive while preserving its original metadata.',
  ],
  'directory-14': [
    'The light sensor uses separate dark-on and bright-off thresholds to avoid switching repeatedly near the boundary.',
    'Alarm latches immediately. Reset clears it only after the alarm input is released.',
    'The sketch keeps all path lights on during the alarm and pulses the beacon and piezo every half second without blocking the light readings.',
  ],
  'directory-13': [
    'A0 and A1 read independent test knobs. A temperature index of 75, a vibration index of 65, or an open stop loop latches the alarm.',
    'Releasing the stop input or lowering the signal clears the cause. Acknowledging the trip clears the red light while leaving the run indicator off.',
    'The Ethernet shield publishes read-only telemetry independently of the local buttons and indicators.',
  ],
  'directory-12': [
    'A known alarm takes priority over an incomplete sample. Otherwise a missing channel reports Sensor fault.',
    'The remote dashboard checks how long ago the last packet arrived, independently of the local alarm.',
    'The replay checks the five scenarios, both threshold boundaries and the exact point where the remote reading becomes stale.',
  ],
  'directory-11': [
    'The closed lid keeps the sonar pointed down. The sketch pauses ranging with the lid open and waits 500 ms after closure before reading again.',
    'The sketch scales the measured gap between the empty and full reference positions. The red indicator turns on at 80% and clears at 70%.',
    'The Ethernet shield broadcasts the reading and state. A network outage makes the monitor stale while the station keeps sensing locally.',
  ],
  'directory-10': [
    'The sonar reports the gap to the basket target. At 11.5 cm or closer, or when the echo is invalid, the Uno removes the motor enable signal.',
    'Pressing the local button starts or stops the paddle. Clearing the basket allows a new start. It does not restart the paddle by itself.',
    'The Ethernet shield broadcasts uptime, gap and state as one UDP packet every half second. The Python listener displays those packets and reports stale data after two seconds.',
  ],
  'directory-9': [
    'The sketch triggers one sensor, waits 60 ms, and triggers the other. Each depth is calculated using its own empty-basin calibration.',
    'Upstream must reach 8 cm to open the gate. After opening, it can drop to 5 cm before the upstream limit closes it.',
    'A downstream reading of 6 cm or a missing sensor echo commands the gate closed even when upstream is high.',
  ],
  'directory-8': [
    'Pulse width gives the distance to the surface. The sketch subtracts that air gap from the empty-basin measurement to find water depth.',
    'At 5 cm the amber lamp turns on. At 8 cm the red lamp and pulsing piezo take over.',
    'If the sensor returns no usable echo, the station blinks amber and reports that depth is unavailable. It does not indicate normal conditions.',
  ],
  'directory-7': [
    'Sine gives the upward share of the initial speed. Cosine gives the forward share.',
    'Gravity slows the upward motion, reverses it at the peak, then brings the rocket back to ground level.',
    'In this model, 30° and 60° have equal ranges. At 60° the rocket stays up longer but travels forward more slowly.',
  ],
  'directory-5': [
    'The Multi-ranger reports a front distance in millimeters. The logger rejects a missing, stale, zero or out-of-range sample.',
    'The decision changes to Hold at 40 cm or closer. It returns to Advance at 50 cm or farther. The 10 cm difference prevents rapid switching around one cutoff.',
    'The downloaded Python program prints decisions from real telemetry. The browser demo uses the same thresholds to animate the flight response.',
  ],
  'directory-4': [
    'The divider halves USB voltage at A0. The sketch averages eight ADC samples and doubles the calculated voltage to estimate the solar rail.',
    'Start spins up the brush with the wheels disabled. After 700 ms the Uno checks solar voltage under load before permitting the sweep.',
    'The wheel and brush drivers stop after three seconds, below 4.4 V, or on another press of Start. Sunlight returning cannot restart a pass by itself.',
  ],
  'directory-3': [
    'A0 and A1 read the two voltage dividers. Serial Monitor shows raw readings so you can tune DETECT and ARRIVAL on your own course.',
    'When one sensor reads brighter by more than BALANCE, the opposite wheel advances to steer toward it.',
    'When both readings reach ARRIVAL, the driver disables and D10 switches on the alert. A separate eight-second limit parks the rover if it never reaches the target.',
  ],
  'directory-2': [
    'GPIO27 is read once at boot. With the jumper open, the ESP32 hosts a local Wi-Fi page. With the jumper fitted, it starts a Bluetooth Classic serial connection.',
    'Both links submit a single-letter command to the same motor task. The task changes the two wheel directions through the TB6612.',
    'If no command arrives for 850 ms, the motor task puts the driver in standby even if the network handler is busy.',
  ],
  'directory-1': [
    'SoftwareSerial reads one byte at a time from Bluefruit TXO. It uses the built-in Arduino AVR library.',
    'The command selects a direction for each wheel. PWM sets motor speed and STBY disables both channels on Stop.',
    'Each valid drive byte enables the outputs for up to 850 ms. Without another command, including after link loss, the timeout drives STBY LOW. The outputs switch off and the wheels coast; this is not an instantaneous mechanical brake.',
  ],
  'rover-project': ['pulseIn measures the echo in microseconds. Multiply by 0.01715 to estimate one-way distance in centimetres.', 'drive controls both PWM outputs and the driver enable pin. A missing echo or a distance below 20 cm disables the motors.'],
  'hand-project': ['Servo.attach assigns the signal to D9. Servo.write requests a position in degrees.', 'Serial.read accepts 0 or 1 for the open and curl positions. Adjust the two angles in small increments to match your linkage.'],
  'desktop-arm': ['Servo.attach assigns the signal to D9. Servo.write requests a position in degrees.', 'Serial.read accepts 0 or 1 to choose the 70° or 110° waypoint. Compare both positions against your physical marks.'],
  'soil-observer': ['The sketch averages eight A0 samples to reduce jitter. The serial output shows the raw average.', 'The midpoint of your measured dry and damp values sets the LED threshold. The comparison works in either calibration direction.'],
  'home-project': ['analogRead returns an ADC count. The sketch converts it to volts using a nominal 5 V reference.', 'Subtracting 0.5 V and scaling by 100 gives the estimated temperature. D8 turns on above 28 °C.'],
  'ambient-light': ['A0 reads the voltage divider. Record bright and dark readings before adjusting the example thresholds.', 'lampOn stores the last output state. Between the two thresholds, the LED retains that state.'],
  'traffic-sequencer': ['The lamps array maps red, green and amber to D8, D10 and D9. The duration array gives each phase length in milliseconds.', 'Each loop turns one lamp on, waits for its duration, then turns it off before advancing.'],
  'button-indicator': ['INPUT_PULLUP holds D2 high when the switch is open. Pressing the switch connects D2 to ground.', 'The loop tests for LOW and sends that result to the LED on D8.'],
  'vision-counter': ['OpenCV captures a frame and crops it to the central counting region.', 'Thresholding separates bright pixels from the background. Connected-component analysis counts regions above the minimum area, so touching objects can merge into one.'],
};
