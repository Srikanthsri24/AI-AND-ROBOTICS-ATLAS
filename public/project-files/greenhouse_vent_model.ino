// Greenhouse vent model · Arduino Uno R3, TMP36 and positional servo.
#include <Servo.h>

constexpr uint8_t servoPin = 9;
constexpr float adcReference = 5.0f;
constexpr float calibrationOffsetC = 0.0f;
constexpr float openAtC = 28.0f;
constexpr float closeAtC = 25.0f;
constexpr int closedAngle = 55;
constexpr int openAngle = 100;
constexpr unsigned long sampleInterval = 500;
static_assert(closeAtC < openAtC, "Leave a hold band between the thresholds.");

Servo vent;
bool opened = false;
unsigned long lastSample = 0;

void setup() {
  Serial.begin(115200);
  vent.attach(servoPin);
  vent.write(closedAngle);
}

void loop() {
  const unsigned long now = millis();
  if (now - lastSample < sampleInterval) return;
  lastSample = now;

  int total = 0;
  for (int i = 0; i < 8; ++i) total += analogRead(A0);
  const float volts = (total / 8.0f) * adcReference / 1023.0f;
  const float celsius = (volts - 0.5f) * 100 + calibrationOffsetC;

  const bool next = opened ? celsius > closeAtC : celsius >= openAtC;
  if (next != opened) {
    opened = next;
    vent.write(opened ? openAngle : closedAngle);
  }

  Serial.print(celsius, 1);
  Serial.print(F(" C | vent command: "));
  Serial.println(opened ? F("open") : F("closed"));
}
