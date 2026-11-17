#include <Servo.h>

Servo joint;
constexpr byte signalPin = 9;
constexpr int endpoints[] = {70, 110, 70, 110, 70, 110};
constexpr unsigned long stepMs = 18;
constexpr unsigned long settleMs = 360;
int angle = 90;
int target = 90;
int trialStep = -1;
unsigned long lastStep = 0;
unsigned long settledAt = 0;

void command(int next, unsigned long now) {
  target = next;
  settledAt = now;
  Serial.print(F("Command "));
  Serial.println(target);
}

void setup() {
  Serial.begin(115200);
  joint.write(90);
  joint.attach(signalPin);
  Serial.println(F("Center command 90. Use L, C, R or T."));
}

void loop() {
  const unsigned long now = millis();
  while (Serial.available()) {
    const char key = Serial.read();
    if (key == 'T' || key == 't') {
      trialStep = 0;
      command(endpoints[0], now);
    } else if (key == 'L' || key == 'l' || key == 'C' || key == 'c' || key == 'R' || key == 'r') {
      trialStep = -1;
      command(key == 'L' || key == 'l' ? 70 : key == 'R' || key == 'r' ? 110 : 90, now);
    }
  }

  if (angle != target && now - lastStep >= stepMs) {
    lastStep = now;
    angle += angle < target ? 1 : -1;
    joint.write(angle);
    if (angle == target) settledAt = now;
  }
  if (trialStep >= 0 && angle == target && now - settledAt >= settleMs) {
    Serial.print(F("Endpoint command settled "));
    Serial.println(angle);
    ++trialStep;
    if (trialStep == 6) {
      trialStep = -1;
      Serial.println(F("Trial complete. Compare against the physical scale."));
    } else {
      command(endpoints[trialStep], now);
    }
  }
}
