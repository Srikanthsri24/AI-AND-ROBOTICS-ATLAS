// Cardboard dial gauge · Arduino Uno R3 and positional servo.
#include <Servo.h>

constexpr uint8_t servoPin = 9;
constexpr int adcAtZero = 0;
constexpr int adcAtFull = 1023;
constexpr bool reversePointer = false;
constexpr unsigned long sampleMs = 35;
constexpr unsigned long logMs = 250;
static_assert(adcAtZero != adcAtFull, "Calibration endpoints must differ.");

Servo pointer;
unsigned long lastSample = 0;
unsigned long lastLog = 0;

void setup() {
  Serial.begin(115200);
  pointer.attach(servoPin);
}

void loop() {
  const unsigned long now = millis();
  if (now - lastSample < sampleMs) return;
  lastSample = now;

  int sum = 0;
  for (int i = 0; i < 8; ++i) sum += analogRead(A0);
  const int raw = (sum + 4) / 8;
  const float fraction = constrain(float(raw - adcAtZero) / (adcAtFull - adcAtZero), 0.0f, 1.0f);
  const int command = 30 + int(120 * fraction + 0.5f);
  pointer.write(reversePointer ? 180 - command : command);

  if (now - lastLog >= logMs) {
    lastLog = now;
    Serial.print(F("A0="));
    Serial.print(raw);
    Serial.print(F("  level="));
    Serial.print(100 * fraction, 1);
    Serial.println('%');
  }
}
