// Handheld signal paddle · Arduino Uno R3.
constexpr uint8_t buttonPin = 2;
constexpr uint8_t ledPin = 8;
constexpr unsigned long debounceMs = 25;
constexpr unsigned long flashMs = 240;
constexpr unsigned long cycleMs = flashMs * 2;
constexpr unsigned long burstMs = cycleMs * 3 - flashMs;
bool raw = HIGH;
bool stable = HIGH;
bool active = false;
unsigned long changedAt = 0;
unsigned long burstStarted = 0;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  Serial.begin(115200);
  Serial.println(F("Ready."));
}

void loop() {
  const unsigned long now = millis();
  const bool sample = digitalRead(buttonPin);
  if (sample != raw) {
    raw = sample;
    changedAt = now;
  }
  if (raw != stable && now - changedAt >= debounceMs) {
    stable = raw;
    if (stable == LOW && !active) {
      active = true;
      burstStarted = now;
      Serial.println(F("Burst started."));
    }
  }
  const unsigned long elapsed = now - burstStarted;
  if (active && elapsed >= burstMs) {
    active = false;
    Serial.println(F("Burst finished."));
  }
  digitalWrite(ledPin, active && elapsed % cycleMs < flashMs ? HIGH : LOW);
}
