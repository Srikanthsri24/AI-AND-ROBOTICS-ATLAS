constexpr byte sensors[] = {A0, A1};
constexpr byte flags[] = {8, 9};
constexpr float referenceVolts = 5.0;
constexpr float correctionC[] = {0.0, 0.0};
bool on[] = {false, false};
unsigned long sampledAt = 0;

float readTemperature(byte channel) {
  analogRead(sensors[channel]);
  unsigned int sum = 0;
  for (byte sample = 0; sample < 16; ++sample) sum += analogRead(sensors[channel]);
  const float voltage = sum * referenceVolts / (16.0 * 1023.0);
  return (voltage - 0.5) * 100.0 + correctionC[channel];
}

void setup() {
  Serial.begin(115200);
  for (byte pin : flags) {
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
  }
}

void loop() {
  const unsigned long now = millis();
  if (now - sampledAt < 250) return;
  sampledAt = now;

  float temperature[2];
  for (byte side = 0; side < 2; ++side) {
    temperature[side] = readTemperature(side);
    if (temperature[side] >= 26.0) on[side] = true;
    if (temperature[side] <= 25.0) on[side] = false;
    digitalWrite(flags[side], on[side] ? HIGH : LOW);
  }

  Serial.print(F("Left C="));
  Serial.print(temperature[0], 2);
  Serial.print(on[0] ? F(" | D8 ON") : F(" | D8 OFF"));
  Serial.print(F(" || Right C="));
  Serial.print(temperature[1], 2);
  Serial.println(on[1] ? F(" | D9 ON") : F(" | D9 OFF"));
}
