constexpr byte pagePin = A0;
constexpr byte dialPin = A1;
constexpr byte statusPin = 8;
constexpr int shadedReference = 180;
constexpr int brightReference = 820;
constexpr int clearingGap = 5;
static_assert(brightReference > shadedReference, "Bright reference must be higher.");

bool needsLight = false;
unsigned long lastReport = 0;

void setup() {
  pinMode(statusPin, OUTPUT);
  digitalWrite(statusPin, LOW);
  Serial.begin(115200);
}

void loop() {
  const int sensor = analogRead(pagePin);
  const int page = constrain(map(sensor, shadedReference, brightReference, 0, 100), 0, 100);
  const int cutoff = map(analogRead(dialPin), 0, 1023, 25, 85);
  if (page < cutoff) needsLight = true;
  if (page >= cutoff + clearingGap) needsLight = false;
  digitalWrite(statusPin, needsLight ? HIGH : LOW);

  const unsigned long now = millis();
  if (now - lastReport >= 250) {
    lastReport = now;
    Serial.print(F("A0="));
    Serial.print(sensor);
    Serial.print(F(" | page="));
    Serial.print(page);
    Serial.print(F("% | cutoff="));
    Serial.print(cutoff);
    Serial.println(needsLight ? F("% | Add light") : F("% | Status off"));
  }
  delay(25);
}
