constexpr byte tempPin = A0, dialPin = A1;
constexpr byte indicatorPins[] = {8, 9, 10};
constexpr float referenceVolts = 5.0;
constexpr float temperatureCorrectionC = 0.0;
unsigned long sampledAt = 0;

float averagedAdc(byte pin) {
  analogRead(pin);
  unsigned int total = 0;
  for (byte i = 0; i < 16; ++i) total += analogRead(pin);
  return total / 16.0;
}

void setup() {
  Serial.begin(115200);
  for (byte pin : indicatorPins) {
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
  }
}

void loop() {
  const unsigned long now = millis();
  if (now - sampledAt < 250) return;
  sampledAt = now;
  const float voltage = averagedAdc(tempPin) * referenceVolts / 1023.0;
  const int temperature = round((voltage - 0.5) * 100.0 + temperatureCorrectionC);
  const int high = round(24.0 + 8.0 * averagedAdc(dialPin) / 1023.0);
  const int low = high - 4;
  const byte zone = temperature < low ? 0 : temperature >= high ? 2 : 1;

  for (byte pin : indicatorPins) digitalWrite(pin, LOW);
  digitalWrite(indicatorPins[zone], HIGH);

  Serial.print(F("Desk C="));
  Serial.print(temperature);
  Serial.print(F(" | Band="));
  Serial.print(low);
  Serial.print(F(".."));
  Serial.print(high - 1);
  Serial.println(zone == 0 ? F(" | BELOW") : zone == 1 ? F(" | IN BAND") : F(" | WARM"));
}
