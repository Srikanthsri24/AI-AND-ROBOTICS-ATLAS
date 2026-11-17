// Classroom tabletop barrier · Arduino Uno R3 + two Adafruit IR beam pairs.
#include <Servo.h>

constexpr uint8_t approachPin = 2;
constexpr uint8_t underArmPin = 3;
constexpr uint8_t servoPin = 9;
constexpr int closedAngle = 15;
constexpr int openAngle = 95;
constexpr unsigned long clearDelayMs = 1500;

Servo arm;
bool raised = false;
bool timingClear = false;
unsigned long clearSince = 0;

bool laneOccupied() {
  return digitalRead(approachPin) == LOW || digitalRead(underArmPin) == LOW;
}

void moveArm(bool open) {
  raised = open;
  arm.write(open ? openAngle : closedAngle);
  Serial.println(open ? F("Arm raised.") : F("Arm lowered."));
}

void setup() {
  pinMode(approachPin, INPUT_PULLUP);
  pinMode(underArmPin, INPUT_PULLUP);
  Serial.begin(115200);
  delay(60);  // Let the beam receivers settle before commanding the arm.
  arm.attach(servoPin);
  moveArm(laneOccupied());
}

void loop() {
  const unsigned long now = millis();
  if (laneOccupied()) {
    timingClear = false;
    if (!raised) moveArm(true);
  } else if (raised && !timingClear) {
    timingClear = true;
    clearSince = now;
    Serial.println(F("Both beams clear. Timing."));
  } else if (raised && now - clearSince >= clearDelayMs) {
    timingClear = false;
    moveArm(false);
  }
}
