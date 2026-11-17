// Model doorbell panel · Arduino Uno R3 and passive piezo.
constexpr uint8_t buttonPin = 2;
constexpr uint8_t lightPin = 8;
constexpr uint8_t soundPin = 9;
constexpr unsigned long debounceMs = 25;
constexpr unsigned long highMs = 180;
constexpr unsigned long gapMs = 90;
constexpr unsigned long lowMs = 300;

enum Chime { Idle, HighNote, Gap, LowNote };
Chime state = Idle;
unsigned long phaseStarted = 0;
unsigned long changedAt = 0;
bool raw = HIGH;
bool stable = HIGH;

bool pressEdge(unsigned long now) {
  const bool sample = digitalRead(buttonPin);
  if (sample != raw) {
    raw = sample;
    changedAt = now;
  }
  if (raw == stable || now - changedAt < debounceMs) return false;
  stable = raw;
  return stable == LOW;
}

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(lightPin, OUTPUT);
  pinMode(soundPin, OUTPUT);
  digitalWrite(lightPin, LOW);
  Serial.begin(115200);
  Serial.println(F("Doorbell ready."));
}

void loop() {
  const unsigned long now = millis();
  const bool pressed = pressEdge(now);
  const unsigned long elapsed = now - phaseStarted;

  switch (state) {
    case Idle:
      if (pressed) {
        digitalWrite(lightPin, HIGH);
        tone(soundPin, 880, highMs);
        phaseStarted = now;
        state = HighNote;
        Serial.println(F("880 Hz"));
      }
      break;
    case HighNote:
      if (elapsed >= highMs) {
        noTone(soundPin);
        phaseStarted = now;
        state = Gap;
      }
      break;
    case Gap:
      if (elapsed >= gapMs) {
        tone(soundPin, 660, lowMs);
        phaseStarted = now;
        state = LowNote;
        Serial.println(F("660 Hz"));
      }
      break;
    case LowNote:
      if (elapsed >= lowMs) {
        noTone(soundPin);
        digitalWrite(lightPin, LOW);
        state = Idle;
        Serial.println(F("Doorbell ready."));
      }
      break;
  }
}
