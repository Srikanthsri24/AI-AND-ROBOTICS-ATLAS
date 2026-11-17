// Accessible desk switch · Arduino Uno R3.
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

Input paddle(2), mode(3);
bool toggleMode = false;
bool outputOn = false;
bool waitForRelease = true;

void setup() {
  pinMode(paddle.pin, INPUT_PULLUP);
  pinMode(mode.pin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  Serial.begin(115200);
  Serial.println(F("Hold mode."));
}

void loop() {
  const unsigned long now = millis();
  const bool paddleChanged = paddle.update(now);
  const bool modeChanged = mode.update(now);
  const bool wasOn = outputOn;
  if (modeChanged && mode.stable == LOW) {
    toggleMode = !toggleMode;
    outputOn = false;
    waitForRelease = true;
    Serial.println(toggleMode ? F("Toggle mode.") : F("Hold mode."));
  } else if (waitForRelease) {
    if (paddle.raw == HIGH && paddle.stable == HIGH && now - paddle.changedAt >= debounceMs) {
      waitForRelease = false;
    }
  } else if (paddleChanged) {
    if (!toggleMode) outputOn = paddle.stable == LOW;
    else if (paddle.stable == LOW) outputOn = !outputOn;
  }
  digitalWrite(ledPin, outputOn ? HIGH : LOW);
  if (outputOn != wasOn) Serial.println(outputOn ? F("LED on.") : F("LED off."));
}
