// Capillary watering model · Arduino Uno R3 and SEN0193.
const uint8_t probePin = A0;
int dry = -1;
int damp = -1;
char trial = 0;
float baseline = 0;
unsigned long startedAt = 0;

int readProbe() {
  unsigned int sum = 0;
  for (uint8_t i = 0; i < 16; ++i) sum += analogRead(probePin);
  return (sum + 8) / 16;
}

bool calibrated() {
  return dry >= 0 && damp >= 0 && abs(damp - dry) >= 12;
}

float indexFor(int raw) {
  return (raw - dry) * 100.0 / (damp - dry);
}

void printRow(unsigned long elapsed, int raw) {
  const float index = indexFor(raw);
  Serial.print(trial == 'c' ? F("suspended") : F("immersed"));
  Serial.print(',');
  Serial.print(elapsed);
  Serial.print(',');
  Serial.print(raw);
  Serial.print(',');
  Serial.print(index, 1);
  Serial.print(',');
  Serial.println(index - baseline, 1);
}

void setup() {
  Serial.begin(115200);
  Serial.println(F("d dry, w damp, c start suspended, i start immersed, l log, r clear"));
}

void loop() {
  if (!Serial.available()) return;
  const int command = Serial.read();
  if (command == '\r' || command == '\n') return;
  const int raw = readProbe();
  switch (command) {
    case 'd':
    case 'w':
      if (command == 'd') dry = raw;
      else damp = raw;
      trial = 0;
      Serial.print(F("# Reference raw "));
      Serial.println(raw);
      break;
    case 'c':
    case 'i':
      if (!calibrated()) {
        Serial.println(F("# Capture distinct dry and damp references first."));
        break;
      }
      trial = command;
      baseline = indexFor(raw);
      startedAt = millis();
      Serial.println(F("wick,elapsed_s,raw,index,change_from_start"));
      printRow(0, raw);
      break;
    case 'l':
      if (trial) printRow((millis() - startedAt) / 1000UL, raw);
      else Serial.println(F("# Start a trial with c or i."));
      break;
    case 'r':
      trial = 0;
      dry = damp = -1;
      Serial.println(F("# Cleared."));
      break;
  }
}
