constexpr byte sensors[] = {A0, A1};
constexpr byte indicator = 8;
constexpr float referenceVolts = 5.0;
constexpr float correctionC[] = {0.0, 0.0};
bool warm = false;
unsigned long lastSample = 0;

float readTemperature(byte channel) {
  analogRead(sensors[channel]);
  unsigned int sum = 0;
  for (byte i = 0; i < 16; ++i) sum += analogRead(sensors[channel]);
  return ((sum / 16.0) * referenceVolts / 1023.0 - 0.5) * 100.0 + correctionC[channel];
}

void setup() {
  pinMode(indicator, OUTPUT);
  digitalWrite(indicator, LOW);
  Serial.begin(115200);
}

void loop() {
  const unsigned long now = millis();
  if (now - lastSample < 250) return;
  lastSample = now;
  const float outlet = readTemperature(0);
  const float room = readTemperature(1);
  const float difference = outlet - room;
  if (outlet >= 30.0 && difference >= 4.0) warm = true;
  if (outlet <= 28.0 || difference <= 2.0) warm = false;
  digitalWrite(indicator, warm ? HIGH : LOW);
  Serial.print(F("Outlet C=")); Serial.print(outlet, 2);
  Serial.print(F(" | Room C=")); Serial.print(room, 2);
  Serial.print(F(" | Difference C=")); Serial.print(difference, 2);
  Serial.println(warm ? F(" | FLAG ON") : F(" | FLAG OFF"));
}
