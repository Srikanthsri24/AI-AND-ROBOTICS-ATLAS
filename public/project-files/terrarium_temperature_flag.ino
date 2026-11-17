constexpr byte sensorPin = A0, flagPin = 8;
constexpr float referenceVolts = 5.0;
constexpr float temperatureCorrectionC = 0.0;
constexpr float flagAt = 29.0, clearAt = 27.0;
bool flag = false;
unsigned long sampledAt = 0;

void setup() {
  pinMode(flagPin, OUTPUT);
  digitalWrite(flagPin, LOW);
  Serial.begin(115200);
}

void loop() {
  const unsigned long now = millis();
  if (now - sampledAt < 250) return;
  sampledAt = now;
  unsigned int sum = 0;
  for (byte sample = 0; sample < 16; ++sample) sum += analogRead(sensorPin);
  const float voltage = (sum / 16.0) * referenceVolts / 1023.0;
  const float temperature = (voltage - 0.5) * 100.0 + temperatureCorrectionC;
  if (temperature >= flagAt) flag = true;
  if (temperature <= clearAt) flag = false;
  digitalWrite(flagPin, flag ? HIGH : LOW);

  Serial.print(F("TMP36 V="));
  Serial.print(voltage, 3);
  Serial.print(F(" | Air C="));
  Serial.print(temperature, 1);
  Serial.println(flag ? F(" | Flag ON") : F(" | Flag OFF"));
}
