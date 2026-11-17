constexpr byte sensorPin = A0, indicatorPin = 8;
constexpr float referenceVolts = 5.0, correctionC = 0.0;
float peak = 0.0;
bool havePeak = false;
unsigned long startedAt = 0, sampledAt = 0;

void setup() {
  Serial.begin(115200);
  pinMode(indicatorPin, OUTPUT);
  digitalWrite(indicatorPin, LOW);
  startedAt = millis();
  Serial.println(F("elapsed_ms,air_c,peak_c,warm"));
}

void loop() {
  const unsigned long now = millis();
  while (Serial.available()) {
    const char command = Serial.read();
    if (command == 'r' || command == 'R') {
      havePeak = false;
      startedAt = now;
    }
  }
  if (now - sampledAt < 1000) return;
  sampledAt = now;
  unsigned int sum = 0;
  for (byte i = 0; i < 16; ++i) sum += analogRead(sensorPin);
  const float temperature = ((sum / 16.0) * referenceVolts / 1023.0 - 0.5) * 100.0 + correctionC;
  if (!havePeak || temperature > peak) peak = temperature;
  havePeak = true;
  const bool warm = temperature >= 38.0;
  digitalWrite(indicatorPin, warm ? HIGH : LOW);

  Serial.print(now - startedAt);
  Serial.print(',');
  Serial.print(temperature, 2);
  Serial.print(',');
  Serial.print(peak, 2);
  Serial.print(',');
  Serial.println(warm ? 1 : 0);
}
