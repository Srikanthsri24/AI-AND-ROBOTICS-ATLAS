constexpr byte buttonPin = 2;
constexpr byte ledPin = 8;
constexpr unsigned long debounceMs = 25;

bool raw = HIGH;
bool stable = HIGH;
unsigned long changedAt = 0;

void setup() {
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  Serial.begin(115200);
  Serial.println(F("Released | D2 HIGH | LED off"));
}

void loop() {
  const bool sample = digitalRead(buttonPin);
  const unsigned long now = millis();
  if (sample != raw) {
    raw = sample;
    changedAt = now;
  }

  if (raw == stable || now - changedAt < debounceMs) return;
  stable = raw;
  digitalWrite(ledPin, stable == LOW ? HIGH : LOW);
  if (stable == LOW) Serial.println(F("Pressed | D2 LOW | LED on"));
  else Serial.println(F("Released | D2 HIGH | LED off"));
}
