// Quiz desk response button · Arduino Uno R3.
constexpr unsigned long debounceMs = 25;
constexpr uint8_t indicatorA = 8;
constexpr uint8_t indicatorB = 9;

struct Button {
  const uint8_t pin;
  bool raw = HIGH;
  bool stable = HIGH;
  unsigned long changedAt = 0;

  explicit Button(uint8_t inputPin) : pin(inputPin) {}

  bool pressEdge(unsigned long now) {
    const bool sample = digitalRead(pin);
    if (raw != sample) {
      raw = sample;
      changedAt = now;
    }
    if (raw == stable || now - changedAt < debounceMs) return false;
    stable = raw;
    return stable == LOW;
  }
};

Button teamA(2), teamB(3), resetButton(4);
enum Round { WaitingForRelease, Armed, WonA, WonB, Tie };
Round roundState = WaitingForRelease;

void setup() {
  pinMode(teamA.pin, INPUT_PULLUP);
  pinMode(teamB.pin, INPUT_PULLUP);
  pinMode(resetButton.pin, INPUT_PULLUP);
  pinMode(indicatorA, OUTPUT);
  pinMode(indicatorB, OUTPUT);
  digitalWrite(indicatorA, LOW);
  digitalWrite(indicatorB, LOW);
  Serial.begin(115200);
}

void loop() {
  const unsigned long now = millis();
  const bool pressedA = teamA.pressEdge(now);
  const bool pressedB = teamB.pressEdge(now);
  const bool reset = resetButton.pressEdge(now);

  if (reset) {
    roundState = WaitingForRelease;
    Serial.println(F("Round cleared."));
  } else if (roundState == WaitingForRelease &&
             teamA.raw == HIGH && teamA.stable == HIGH &&
             teamB.raw == HIGH && teamB.stable == HIGH &&
             resetButton.raw == HIGH && resetButton.stable == HIGH &&
             now - teamA.changedAt >= debounceMs && now - teamB.changedAt >= debounceMs &&
             now - resetButton.changedAt >= debounceMs) {
    roundState = Armed;
    Serial.println(F("Round armed."));
  } else if (roundState == Armed && (pressedA || pressedB)) {
    if (pressedA && pressedB) {
      roundState = Tie;
      Serial.println(F("Tie in this update."));
    } else if (pressedA) {
      roundState = WonA;
      Serial.println(F("Team A first."));
    } else {
      roundState = WonB;
      Serial.println(F("Team B first."));
    }
  }
  digitalWrite(indicatorA, roundState == WonA || roundState == Tie ? HIGH : LOW);
  digitalWrite(indicatorB, roundState == WonB || roundState == Tie ? HIGH : LOW);
}
