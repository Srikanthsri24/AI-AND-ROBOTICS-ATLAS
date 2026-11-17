// Mini drawbridge model · Arduino Uno R3 and positional servo.
#include <Servo.h>

constexpr uint8_t servoPin = 9;
constexpr int lowered = 35;
constexpr int raised = 90;
// For the opposite mounting orientation, mirror both endpoints about 90°.
constexpr bool reverseTravel = false;
constexpr unsigned long stepInterval = 24;

Servo bridge;
int position = lowered;
int target = lowered;
unsigned long lastStep = 0;

void writeDeck(int angle) {
  bridge.write(reverseTravel ? 180 - angle : angle);
}

void setup() {
  Serial.begin(115200);
  bridge.attach(servoPin);
  writeDeck(position);
  Serial.println(F("Lowered command. Send r to raise or l to lower."));
}

void loop() {
  while (Serial.available()) {
    switch (Serial.read()) {
      case 'r': target = raised; break;
      case 'l': target = lowered; break;
    }
  }
  const unsigned long now = millis();
  if (position == target || now - lastStep < stepInterval) return;
  lastStep = now;
  position += position < target ? 1 : -1;
  writeDeck(position);
  if (position == target) {
    Serial.println(position == raised ? F("Raised command reached") : F("Lowered command reached"));
  }
}
