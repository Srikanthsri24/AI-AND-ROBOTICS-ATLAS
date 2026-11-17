// Model elevator call light · Arduino Uno R3 and hand-operated lift.
constexpr unsigned long debounceMs = 25;
constexpr uint8_t callLed = 8;

struct Switch {
  const uint8_t pin;
  bool raw = HIGH;
  bool stable = HIGH;
  unsigned long changedAt = 0;

  explicit Switch(uint8_t inputPin) : pin(inputPin) {}

  bool update(unsigned long now) {
    const bool sample = digitalRead(pin);
    if (sample != raw) {
      raw = sample;
      changedAt = now;
    }
    if (raw == stable || now - changedAt < debounceMs) return false;
    stable = raw;
    return true;
  }
};

Switch callButton(2), landing(3);
bool pending = false;

void setup() {
  pinMode(callButton.pin, INPUT_PULLUP);
  pinMode(landing.pin, INPUT_PULLUP);
  pinMode(callLed, OUTPUT);
  digitalWrite(callLed, LOW);
  Serial.begin(115200);
  Serial.println(F("Call panel ready."));
}

void loop() {
  const unsigned long now = millis();
  const bool callChanged = callButton.update(now);
  const bool landingChanged = landing.update(now);

  if (landing.stable == LOW) {
    pending = false;
    if (landingChanged) Serial.println(F("Car at landing. Call cleared."));
  } else {
    if (landingChanged) Serial.println(F("Car away from landing."));
    if (callChanged && callButton.stable == LOW && !pending) {
      pending = true;
      Serial.println(F("Call waiting."));
    }
  }

  digitalWrite(callLed, pending ? HIGH : LOW);
}
