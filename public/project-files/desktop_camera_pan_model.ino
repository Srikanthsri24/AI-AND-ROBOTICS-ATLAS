// Desktop camera pan model · Arduino Uno R3 and positional servo.
#include <Servo.h>

constexpr uint8_t servoPin = 9;
constexpr int leftLimit = 35;
constexpr int centerAngle = 90;
constexpr int rightLimit = 145;
constexpr int stepDegrees = 2;
constexpr unsigned long stepMs = 20;

Servo pan;
int commanded = centerAngle;
int target = centerAngle;
unsigned long lastStep = 0;

void setup() {
  Serial.begin(115200);
  pan.attach(servoPin);
  pan.write(commanded);
  Serial.println(F("l left, c center, r right"));
}

void loop() {
  while (Serial.available()) {
    switch (Serial.read()) {
      case 'l': target = leftLimit; break;
      case 'c': target = centerAngle; break;
      case 'r': target = rightLimit; break;
    }
  }

  const unsigned long now = millis();
  if (commanded == target || now - lastStep < stepMs) return;
  lastStep = now;
  const int delta = target - commanded;
  commanded += constrain(delta, -stepDegrees, stepDegrees);
  pan.write(commanded);
  if (commanded == target) {
    Serial.print(F("Final servo command: "));
    Serial.println(commanded);
  }
}
