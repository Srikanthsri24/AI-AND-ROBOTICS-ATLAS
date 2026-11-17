// Plant pot depth comparison · Arduino Uno R3 + two SEN0193 probes.
struct Probe {
  uint8_t pin;
  int dry = -1;
  int damp = -1;
  float baseline = 0;
  bool responded = false;
  unsigned long firstResponse = 0;

  explicit Probe(uint8_t analogPin) : pin(analogPin) {}

  bool calibrated() const {
    return dry >= 0 && damp >= 0 && abs(damp - dry) >= 12;
  }

  float index(int raw) const {
    return (raw - dry) * 100.0 / (damp - dry);
  }
};

Probe probes[] = {Probe(A0), Probe(A1)};
const float minimumRise = 8.0;
bool running = false;
unsigned long startedAt = 0;

int readProbe(uint8_t pin) {
  analogRead(pin);
  unsigned int total = 0;
  for (uint8_t i = 0; i < 16; ++i) total += analogRead(pin);
  return (total + 8) / 16;
}

void logReading(const int (&raw)[2], unsigned long elapsed) {
  Serial.print(elapsed);
  for (uint8_t i = 0; i < 2; ++i) {
    Probe& probe = probes[i];
    const float current = probe.index(raw[i]);
    const float rise = current - probe.baseline;
    if (!probe.responded && rise >= minimumRise) {
      probe.responded = true;
      probe.firstResponse = elapsed;
    }
    Serial.print(',');
    Serial.print(current, 1);
    Serial.print(',');
    Serial.print(rise, 1);
    Serial.print(',');
    if (probe.responded) Serial.print(probe.firstResponse);
  }
  Serial.println();
}

void setup() {
  Serial.begin(115200);
  Serial.println(F("d dry, w damp, p preview, b baseline, l log, r clear"));
}

void loop() {
  if (!Serial.available()) return;
  const int command = Serial.read();
  if (command == '\r' || command == '\n') return;
  const int raw[2] = {readProbe(probes[0].pin), readProbe(probes[1].pin)};

  switch (command) {
    case 'd':
    case 'w':
      for (uint8_t i = 0; i < 2; ++i) {
        if (command == 'd') probes[i].dry = raw[i];
        else probes[i].damp = raw[i];
      }
      running = false;
      Serial.println(F("# References saved for upper and lower probes."));
      break;
    case 'p':
      Serial.print(F("# Upper and lower raw: "));
      Serial.print(raw[0]);
      Serial.print(',');
      Serial.println(raw[1]);
      break;
    case 'b':
      if (!probes[0].calibrated() || !probes[1].calibrated()) {
        Serial.println(F("# Capture distinct dry and damp references first."));
        break;
      }
      for (uint8_t i = 0; i < 2; ++i) {
        probes[i].baseline = probes[i].index(raw[i]);
        probes[i].responded = false;
      }
      startedAt = millis();
      running = true;
      Serial.println(F("elapsed_s,upper_index,upper_rise,upper_first_s,lower_index,lower_rise,lower_first_s"));
      logReading(raw, 0);
      break;
    case 'l':
      if (running) logReading(raw, (millis() - startedAt) / 1000UL);
      else Serial.println(F("# Set a baseline with b."));
      break;
    case 'r':
      for (Probe& probe : probes) probe.dry = probe.damp = -1;
      running = false;
      Serial.println(F("# References and trial cleared."));
      break;
  }
}
