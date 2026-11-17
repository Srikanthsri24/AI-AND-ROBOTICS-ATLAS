constexpr byte markerPins[] = {8, 9, 10};
constexpr byte ambientPin = A0;
constexpr int darkReference = 180, brightReference = 820;
constexpr int turnOn = 45, turnOff = 55;
constexpr unsigned long stepDelay = 250;
bool active = false;
unsigned long startedAt = 0, reportedAt = 0;
static_assert(brightReference > darkReference, "Bright reference must be higher.");

void setup() {
  Serial.begin(115200);
  for (byte pin : markerPins) {
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
  }
}

void loop() {
  const unsigned long now = millis();
  const int raw = analogRead(ambientPin);
  const int light = constrain(map(raw, darkReference, brightReference, 0, 100), 0, 100);
  if (!active && light <= turnOn) {
    active = true;
    startedAt = now;
  } else if (active && light >= turnOff) {
    active = false;
  }

  byte lit = 0;
  for (byte step = 0; step < 3; ++step) {
    const bool on = active && now - startedAt >= step * stepDelay;
    digitalWrite(markerPins[step], on ? HIGH : LOW);
    if (on) ++lit;
  }
  if (now - reportedAt >= 250) {
    reportedAt = now;
    Serial.print(F("A0="));
    Serial.print(raw);
    Serial.print(F(" | Light="));
    Serial.print(light);
    Serial.print(F("% | Edges lit="));
    Serial.println(lit);
  }
  delay(20);
}
