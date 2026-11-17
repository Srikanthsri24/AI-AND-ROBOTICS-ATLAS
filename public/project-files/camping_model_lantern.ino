constexpr byte ambientPin = A0, buttonPin = 2, lampPin = 8;
constexpr int shadedReference = 180, brightReference = 820;
static_assert(brightReference > shadedReference, "Bright reference must be higher.");

enum Mode : byte { AUTO, ON, OFF };
Mode mode = AUTO;
bool automaticLamp = false, rawPressed = false, stablePressed = false;
unsigned long changedAt = 0, reportedAt = 0;

void setup() {
  Serial.begin(115200);
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(lampPin, OUTPUT);
  digitalWrite(lampPin, LOW);
}

void loop() {
  const unsigned long now = millis();
  const bool pressed = digitalRead(buttonPin) == LOW;
  if (pressed != rawPressed) {
    rawPressed = pressed;
    changedAt = now;
  }
  if (rawPressed != stablePressed && now - changedAt >= 30) {
    stablePressed = rawPressed;
    if (stablePressed) mode = mode == AUTO ? ON : mode == ON ? OFF : AUTO;
  }

  const int raw = analogRead(ambientPin);
  const int light = constrain(map(raw, shadedReference, brightReference, 0, 100), 0, 100);
  if (light <= 35) automaticLamp = true;
  if (light >= 45) automaticLamp = false;
  const bool lit = mode == ON || (mode == AUTO && automaticLamp);
  digitalWrite(lampPin, lit ? HIGH : LOW);

  if (now - reportedAt >= 250) {
    reportedAt = now;
    Serial.print(F("A0="));
    Serial.print(raw);
    Serial.print(F(" | Light="));
    Serial.print(light);
    Serial.print(mode == AUTO ? F("% | Auto") : mode == ON ? F("% | On override") : F("% | Off override"));
    Serial.println(lit ? F(" | Lamp ON") : F(" | Lamp OFF"));
  }
  delay(10);
}
