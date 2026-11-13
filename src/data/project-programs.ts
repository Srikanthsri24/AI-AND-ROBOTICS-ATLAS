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
