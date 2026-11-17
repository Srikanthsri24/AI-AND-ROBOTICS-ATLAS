constexpr byte lightPin = A0;
constexpr byte lampPin = 8;
constexpr int darkAdc = 180;     // Replace with your shaded reference.
constexpr int brightAdc = 820;   // Replace with your bright reference.
constexpr int turnOn = 40;
constexpr int turnOff = 55;
constexpr unsigned long holdMs = 1000;
static_assert(brightAdc > darkAdc, "The bright reading must exceed the dark reading.");

bool lit = false;
bool qualifying = false;
unsigned long since = 0;
unsigned long reported = 0;

void setup() {
  Serial.begin(115200);
  pinMode(lampPin, OUTPUT);
  digitalWrite(lampPin, LOW);
}

void loop() {
  const unsigned long now = millis();
  const int raw = analogRead(lightPin);
  const int percent = constrain(map(raw, darkAdc, brightAdc, 0, 100), 0, 100);
  const bool wantsChange = lit ? percent >= turnOff : percent <= turnOn;
  if (!wantsChange) {
    qualifying = false;
  } else if (!qualifying) {
    qualifying = true;
    since = now;
  } else if (now - since >= holdMs) {
    lit = !lit;
    qualifying = false;
    digitalWrite(lampPin, lit);
  }
  if (now - reported >= 250) {
    reported = now;
    Serial.print(F("A0="));
    Serial.print(raw);
    Serial.print(F(" | Light="));
    Serial.print(percent);
    Serial.print(F("% | Lamp "));
    Serial.println(lit ? F("ON") : F("OFF"));
  }
  delay(20);
}
