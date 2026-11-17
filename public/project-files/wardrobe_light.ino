constexpr byte doorPin = 2, lampPin = 8, lightPin = A0;
constexpr int darkAdc = 180, brightAdc = 820;
constexpr unsigned long debounceMs = 35;
static_assert(brightAdc > darkAdc, "Bright calibration must exceed dark calibration.");

bool lastRawOpen, doorOpen, dim = false;
unsigned long changedAt = 0, reportedAt = 0;

void setup() {
  pinMode(doorPin, INPUT_PULLUP);
  pinMode(lampPin, OUTPUT);
  digitalWrite(lampPin, LOW);
  doorOpen = lastRawOpen = digitalRead(doorPin) == HIGH;
  Serial.begin(115200);
}

void loop() {
  const unsigned long now = millis();
  const bool rawOpen = digitalRead(doorPin) == HIGH;
  if (rawOpen != lastRawOpen) {
    lastRawOpen = rawOpen;
    changedAt = now;
  }
  if (now - changedAt >= debounceMs) doorOpen = lastRawOpen;

  const int raw = analogRead(lightPin);
  const int light = constrain(map(raw, darkAdc, brightAdc, 0, 100), 0, 100);
  if (light <= 32) dim = true;
  if (light >= 42) dim = false;

  const bool lit = doorOpen && dim;
  digitalWrite(lampPin, lit ? HIGH : LOW);
  if (now - reportedAt >= 250) {
    reportedAt = now;
    Serial.print(F("A0="));
    Serial.print(raw);
    Serial.print(F(" | Light="));
    Serial.print(light);
    Serial.print(doorOpen ? F("% | Door open") : F("% | Door closed"));
    Serial.println(lit ? F(" | Lamp ON") : F(" | Lamp OFF"));
  }
}
