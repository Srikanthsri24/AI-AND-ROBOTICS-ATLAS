constexpr byte wallPin = A0, flagPin = 8;
constexpr float referenceVolts = 5.0;
constexpr float settledOffsetC = 0.0;
bool flag = false;
unsigned long sampledAt = 0;

void setup() {
  Serial.begin(115200);
  pinMode(flagPin, OUTPUT);
  digitalWrite(flagPin, LOW);
}

void loop() {
  const unsigned long now = millis();
  if (now - sampledAt < 250) return;
  sampledAt = now;

  unsigned int sum = 0;
  for (byte i = 0; i < 16; ++i) sum += analogRead(wallPin);
  const float voltage = (sum / 16.0) * referenceVolts / 1023.0;
  const float wall = (voltage - 0.5) * 100.0 + settledOffsetC;
  if (wall >= 28.0) flag = true;
  if (wall <= 26.0) flag = false;
  digitalWrite(flagPin, flag ? HIGH : LOW);

  Serial.print(F("Wall C="));
  Serial.print(wall, 2);
  Serial.println(flag ? F(" | Flag ON") : F(" | Flag OFF"));
}
