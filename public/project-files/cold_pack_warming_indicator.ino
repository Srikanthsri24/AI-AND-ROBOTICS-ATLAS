constexpr byte sensorPin = A0, indicatorPin = 8;
constexpr float referenceVolts = 5.0, correctionC = 0.0;
bool warning = false, timingWarm = false;
unsigned long startedAt = 0, sampledAt = 0;

void setup() {
  pinMode(indicatorPin, OUTPUT);
  digitalWrite(indicatorPin, LOW);
  Serial.begin(115200);
}

void loop() {
  const unsigned long now = millis();
  if (now - sampledAt < 250) return;
  sampledAt = now;
  unsigned int sum = 0;
  for (byte index = 0; index < 16; ++index) sum += analogRead(sensorPin);
  const float temp = ((sum / 16.0) * referenceVolts / 1023.0 - 0.5) * 100.0 + correctionC;

  if (temp <= 18.0) warning = false;
  if (temp < 20.0 || warning) {
    timingWarm = false;
  } else if (!timingWarm) {
    timingWarm = true;
    startedAt = now;
  } else if (now - startedAt >= 3000) {
    warning = true;
    timingWarm = false;
  }
  digitalWrite(indicatorPin, warning ? HIGH : LOW);
  Serial.print(F("Air C=")); Serial.print(temp, 2);
  Serial.println(warning ? F(" | WARM") : timingWarm ? F(" | TIMING") : F(" | CLEAR"));
}
