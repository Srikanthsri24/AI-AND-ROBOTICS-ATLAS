constexpr byte channels[] = {A0, A1};
constexpr byte flagPin = 8;
constexpr float referenceVolts = 5.0;
constexpr float correctionC[] = {0.0, 0.0};
bool flagged = false;
unsigned long sampledAt = 0;

float airTemperature(byte index) {
  analogRead(channels[index]);
  unsigned int sum = 0;
  for (byte sample = 0; sample < 16; ++sample) sum += analogRead(channels[index]);
  return ((sum / 16.0) * referenceVolts / 1023.0 - 0.5) * 100.0 + correctionC[index];
}

void setup() {
  Serial.begin(115200);
  pinMode(flagPin, OUTPUT);
  digitalWrite(flagPin, LOW);
}

void loop() {
  const unsigned long now = millis();
  if (now - sampledAt < 250) return;
  sampledAt = now;

  const float sill = airTemperature(0);
  const float shade = airTemperature(1);
  const float difference = sill - shade;
  if (sill >= 31.0 && difference >= 4.0) flagged = true;
  if (sill <= 29.0 || difference <= 2.0) flagged = false;
  digitalWrite(flagPin, flagged ? HIGH : LOW);

  Serial.print(F("Sill C="));
  Serial.print(sill, 2);
  Serial.print(F(" | Shade C="));
  Serial.print(shade, 2);
  Serial.print(F(" | Difference C="));
  Serial.print(difference, 2);
  Serial.println(flagged ? F(" | Flag ON") : F(" | Flag OFF"));
}
