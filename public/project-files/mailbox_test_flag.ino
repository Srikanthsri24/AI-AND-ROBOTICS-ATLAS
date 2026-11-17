// Mailbox test flag · Arduino Uno R3, roller switch and reset button.
constexpr unsigned long debounceMs = 25;
constexpr uint8_t ledPin = 8;

struct Input {
  const uint8_t pin;
  bool raw = HIGH;
  bool stable = HIGH;
  unsigned long changedAt = 0;

  explicit Input(uint8_t number) : pin(number) {}

  bool update(unsigned long now) {
    const bool sample = digitalRead(pin);
    if (sample != raw) {
      raw = sample;
      changedAt = now;
    }
    if (stable == raw || now - changedAt < debounceMs) return false;
    stable = raw;
    return true;
  }
};

Input flap(2), resetButton(3);
bool flagged = false;

void setup() {
  pinMode(flap.pin, INPUT_PULLUP);
  pinMode(resetButton.pin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  Serial.begin(115200);
  Serial.println(F("Close the flap to arm the opening detector."));
}

void loop() {
  const unsigned long now = millis();
  const bool flapChanged = flap.update(now);
  const bool resetChanged = resetButton.update(now);

  if (flapChanged) {
    if (flap.stable == HIGH) {
      flagged = true;
      Serial.println(F("Flap opened. Reminder on."));
    } else {
      Serial.println(F("Flap shut."));
    }
  }
  if (resetChanged && resetButton.stable == LOW) {
    if (flap.raw == LOW && flap.stable == LOW) {
      flagged = false;
      Serial.println(F("Reminder cleared."));
    } else {
      Serial.println(F("Shut the flap before resetting."));
    }
  }
  digitalWrite(ledPin, flagged ? HIGH : LOW);
}
