constexpr byte interiorPin = A0, lampPin = 8;
constexpr int darkReference = 180, brightReference = 820;
constexpr int darkThreshold = 42, brightThreshold = 52;
constexpr unsigned long delayMs = 700;
static_assert(brightReference > darkReference, "Bright reference must be higher.");

bool timingDark = false, lit = false;
unsigned long darkSince = 0, reportedAt = 0;

void setup() {
  Serial.begin(115200);
  pinMode(lampPin, OUTPUT);
  digitalWrite(lampPin, LOW);
}

void loop() {
  const int raw = analogRead(interiorPin);
  const int light = constrain(map(raw, darkReference, brightReference, 0, 100), 0, 100);
  const unsigned long now = millis();

  if (light >= brightThreshold) lit = false;
  if (lit || light > darkThreshold) {
    timingDark = false;
  } else if (!timingDark) {
    timingDark = true;
    darkSince = now;
  } else if (now - darkSince >= delayMs) {
    lit = true;
    timingDark = false;
  }
  digitalWrite(lampPin, lit ? HIGH : LOW);

  if (now - reportedAt >= 200) {
    reportedAt = now;
    Serial.print(F("A0="));
    Serial.print(raw);
    Serial.print(F(" | Interior="));
    Serial.print(light);
    Serial.println(lit ? F("% | Lamp ON") : timingDark ? F("% | Timing darkness") : F("% | Lamp OFF"));
  }
  delay(15);
}
