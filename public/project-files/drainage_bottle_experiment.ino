// Drainage bottle experiment · Arduino Uno R3 + SEN0193.
const uint8_t sensorPin = A0;
const float dryThreshold = 35.0;
int dry = -1;
int damp = -1;
bool running = false;
bool crossed = false;
unsigned long startedAt = 0;
unsigned long previousAbove = 0;

int readProbe() {
  unsigned int sum = 0;
  for (uint8_t i = 0; i < 16; ++i) {
    sum += analogRead(sensorPin);
  }
  return (sum + 8) / 16;
}

bool calibrated() {
  return dry >= 0 && damp >= 0 && abs(damp - dry) >= 12;
}

float relativeIndex(int raw) {
  return (raw - dry) * 100.0 / (damp - dry);
}

void printRow(unsigned long elapsed, int raw, float index) {
  Serial.print(elapsed);
  Serial.print(',');
  Serial.print(raw);
  Serial.print(',');
  Serial.println(index, 1);
}

void setup() {
  Serial.begin(115200);
  Serial.println(F("d dry, w damp, p preview, b begin after pour, l log, r reset"));
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
      running = false;
      Serial.print(F("# Reference saved: "));
      Serial.println(raw);
      break;
    case 'p':
      Serial.print(F("# Raw "));
      Serial.print(raw);
      if (calibrated()) {
        Serial.print(F(" | Index "));
        Serial.print(relativeIndex(raw), 1);
      }
      Serial.println();
      break;
    case 'b': {
      if (!calibrated()) {
        Serial.println(F("# Capture valid dry and damp references first."));
        break;
      }
      const float index = relativeIndex(raw);
      if (index <= dryThreshold) {
        Serial.println(F("# Start after the pour has raised the index above 35."));
        break;
      }
      startedAt = millis();
      previousAbove = 0;
      running = true;
      crossed = false;
      Serial.println(F("elapsed_s,raw,index"));
      printRow(0, raw, index);
      break;
    }
    case 'l': {
      if (!running) {
        Serial.println(F("# Begin the trial with b."));
        break;
      }
      const unsigned long elapsed = (millis() - startedAt) / 1000UL;
      const float index = relativeIndex(raw);
      printRow(elapsed, raw, index);
      if (!crossed && index <= dryThreshold) {
        crossed = true;
        Serial.print(F("# First dry observation at "));
        Serial.print(elapsed);
        Serial.print(F(" s. Previous above threshold at "));
        Serial.print(previousAbove);
        Serial.println(F(" s."));
      } else if (!crossed) {
        previousAbove = elapsed;
      }
      break;
    }
    case 'r':
      dry = damp = -1;
      running = false;
      crossed = false;
      Serial.println(F("# Trial and references cleared."));
      break;
  }
}
