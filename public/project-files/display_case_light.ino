constexpr byte ambientPin = A0, lampPin = 9;
constexpr int shadedReference = 180, brightReference = 820;
constexpr int turnOn = 37, turnOff = 47;
bool lit = false;
unsigned long lastReport = 0;
static_assert(brightReference > shadedReference, "Bright reference must be higher.");

void setup() {
  pinMode(lampPin, OUTPUT);
  analogWrite(lampPin, 0);
  Serial.begin(115200);
}

void loop() {
  const int raw = analogRead(ambientPin);
  const int ambient = constrain(map(raw, shadedReference, brightReference, 0, 100), 0, 100);
  if (ambient <= turnOn) lit = true;
  if (ambient >= turnOff) lit = false;
  const int duty = lit ? map(min(ambient, turnOn), 0, turnOn, 220, 80) : 0;
  analogWrite(lampPin, duty);

  const unsigned long now = millis();
  if (now - lastReport >= 250) {
    lastReport = now;
    Serial.print(F("A0="));
    Serial.print(raw);
    Serial.print(F(" | Room="));
    Serial.print(ambient);
    Serial.print(F("% | D9 duty="));
    Serial.println(duty);
  }
  delay(25);
}
