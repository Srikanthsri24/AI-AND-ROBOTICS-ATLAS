// Model crossing request · Arduino Uno R3 classroom display.
constexpr uint8_t requestPin = 2;
constexpr uint8_t vehicleGreen = 5;
constexpr uint8_t vehicleAmber = 6;
constexpr uint8_t vehicleRed = 7;
constexpr uint8_t waitLamp = 8;
constexpr uint8_t walkLamp = 9;
constexpr unsigned long debounceMs = 25;

enum Phase { Green, Amber, AllStop, Walk, Clearance };
Phase phase = Green;
unsigned long phaseStarted = 0;
unsigned long changedAt = 0;
bool raw = HIGH;
bool stable = HIGH;
bool queued = false;

void updateLamps() {
  digitalWrite(vehicleGreen, LOW);
  digitalWrite(walkLamp, LOW);
  digitalWrite(vehicleAmber, phase == Amber);
  digitalWrite(vehicleRed, phase == AllStop || phase == Walk || phase == Clearance);
  digitalWrite(waitLamp, phase != Walk);
  digitalWrite(vehicleGreen, phase == Green);
  digitalWrite(walkLamp, phase == Walk);
}

void enter(Phase next, unsigned long now) {
  phase = next;
  phaseStarted = now;
  updateLamps();
  const __FlashStringHelper* names[] = {F("Vehicle green"), F("Vehicle amber"), F("All stop"), F("Walk"), F("Clearance")};
  Serial.println(names[phase]);
}

bool pressEdge(unsigned long now) {
  const bool sample = digitalRead(requestPin);
  if (sample != raw) {
    raw = sample;
    changedAt = now;
  }
  if (raw == stable || now - changedAt < debounceMs) return false;
  stable = raw;
  return stable == LOW;
}

void setup() {
  pinMode(requestPin, INPUT_PULLUP);
  for (uint8_t pin = vehicleGreen; pin <= walkLamp; ++pin) pinMode(pin, OUTPUT);
  Serial.begin(115200);
  enter(Green, millis());
}

void loop() {
  const unsigned long now = millis();
  const unsigned long elapsed = now - phaseStarted;
  if (pressEdge(now) && phase == Green && !queued) {
    queued = true;
    Serial.println(F("Crossing queued"));
  }

  switch (phase) {
    case Green:
      if (queued && elapsed >= 3000) {
        queued = false;
        enter(Amber, now);
      }
      break;
    case Amber:
      if (elapsed >= 1200) enter(AllStop, now);
      break;
    case AllStop:
      if (elapsed >= 800) enter(Walk, now);
      break;
    case Walk:
      if (elapsed >= 4000) enter(Clearance, now);
      break;
    case Clearance:
      if (elapsed >= 1500) enter(Green, now);
      break;
  }
}
