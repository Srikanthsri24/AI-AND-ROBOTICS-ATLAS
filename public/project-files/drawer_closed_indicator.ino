// Drawer closed indicator · Arduino Uno R3 and roller-lever switch.
constexpr byte closurePin = 2;
constexpr byte ledPin = 8;
constexpr unsigned long debounceMs = 25;

bool raw = HIGH;
bool stable = HIGH;
unsigned long changedAt = 0;

void setup() {
  pinMode(closurePin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  Serial.begin(115200);
  Serial.println(F("Open or ajar | D2 HIGH | LED off"));
}

void loop() {
  const bool sample = digitalRead(closurePin);
  const unsigned long now = millis();
  if (sample != raw) {
    raw = sample;
    changedAt = now;
  }

  if (raw == stable || now - changedAt < debounceMs) return;
  stable = raw;
  digitalWrite(ledPin, stable == LOW ? HIGH : LOW);
  if (stable == LOW) Serial.println(F("Seated | D2 LOW | LED on"));
  else Serial.println(F("Open or ajar | D2 HIGH | LED off"));
}
