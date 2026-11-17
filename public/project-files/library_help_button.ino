// Library help button · Arduino Uno R3, two switches, and two LEDs.
constexpr unsigned long debounceMs = 25;
constexpr uint8_t visitorLed = 8;
constexpr uint8_t staffLed = 9;

struct Button {
  const uint8_t pin;
  bool raw = HIGH;
  bool stable = HIGH;
  unsigned long changedAt = 0;

  explicit Button(uint8_t inputPin) : pin(inputPin) {}

  bool pressed(unsigned long now) {
    const bool sample = digitalRead(pin);
    if (sample != raw) {
      raw = sample;
      changedAt = now;
    }
    if (raw == stable || now - changedAt < debounceMs) return false;
    stable = raw;
    return stable == LOW;
  }
};

Button help(2);
Button acknowledge(3);
bool pending = false;

void setup() {
  pinMode(help.pin, INPUT_PULLUP);
  pinMode(acknowledge.pin, INPUT_PULLUP);
  pinMode(visitorLed, OUTPUT);
  pinMode(staffLed, OUTPUT);
  digitalWrite(visitorLed, LOW);
  digitalWrite(staffLed, LOW);
  Serial.begin(115200);
  Serial.println(F("Ready."));
}

void loop() {
  const unsigned long now = millis();
  const bool requested = help.pressed(now);
  const bool cleared = acknowledge.pressed(now);

  if (requested) {
    if (!pending) Serial.println(F("Help requested."));
    pending = true;
  } else if (cleared && pending) {
    pending = false;
    Serial.println(F("Staff acknowledged."));
  }
  digitalWrite(visitorLed, help.stable == LOW ? HIGH : LOW);
  digitalWrite(staffLed, pending ? HIGH : LOW);
}
