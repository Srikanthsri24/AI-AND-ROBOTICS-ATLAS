#include <Servo.h>
#include <SoftwareSerial.h>
#include <math.h>

constexpr byte servoPins[] = {5, 6, 9};
constexpr unsigned long BURST_MS = 4000, PERIOD_MS = 2000;
constexpr int CENTER = 90, AMPLITUDE = 18, MAX_STEP = 2;
// Change a sign to -1 if that servo is mounted as a mirror image.
const int jointSign[] = {1, 1, 1};
Servo joints[3];
SoftwareSerial phone(2, 3); // RX from Bluefruit TXO; D3 stays unwired.
int currentAngle[] = {CENTER, CENTER, CENTER};
char mode = 'S';
unsigned long commandAt = 0, updatedAt = 0;

void setup() {
  Serial.begin(115200);
  phone.begin(9600);
  for (byte i = 0; i < 3; ++i) {
    joints[i].write(CENTER);
    joints[i].attach(servoPins[i]);
  }
  Serial.println(F("Ready. Send W, L, R or S."));
}

void loop() {
  const unsigned long now = millis();
  while (phone.available()) {
    const char command = phone.read();
    if (command=='W' || command=='L' || command=='R' || command=='S') {
      mode = command;
      commandAt = now;
      Serial.print(F("Command ")); Serial.println(command);
    }
  }
  const unsigned long elapsed = now - commandAt;
  if (mode != 'S' && elapsed >= BURST_MS) {
    mode = 'S';
    Serial.println(F("Burst complete. Centering joints."));
  }
  if (now - updatedAt < 20) return;
  updatedAt = now;
  for (byte i = 0; i < 3; ++i) {
    int offset = 0;
    if (mode == 'W') {
      const float phase = 2 * PI * (float(elapsed) / PERIOD_MS - float(i) / 3);
      offset = lroundf(AMPLITUDE * sinf(phase));
    } else if (mode == 'L') offset = AMPLITUDE;
    else if (mode == 'R') offset = -AMPLITUDE;
    const int target = CENTER + jointSign[i] * offset;
    currentAngle[i] += constrain(target - currentAngle[i], -MAX_STEP, MAX_STEP);
    joints[i].write(currentAngle[i]);
  }
}
