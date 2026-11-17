// Soil drying timer study · Arduino Uno R3 + SEN0193 and an LED.
const uint8_t probePin = A0;
const uint8_t ledPin = 8;
const unsigned long intervalMs = 60000UL;
const float dryLimit = 35.0;
const uint8_t requiredReadings = 3;
int dry = -1;
int damp = -1;
bool running = false;
uint8_t streak = 0;
unsigned long startTime = 0;
unsigned long lastSample = 0;

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

void stopTrial() {
  running = false;
  streak = 0;
  digitalWrite(ledPin, LOW);
}

void logSample(unsigned long elapsed, int raw) {
  const float index = indexFor(raw);
  streak = index <= dryLimit ? streak + 1 : 0;
  Serial.print(elapsed / 1000UL);
  Serial.print(',');
  Serial.print(raw);
  Serial.print(',');
  Serial.print(index, 1);
  Serial.print(',');
  Serial.println(streak);
  if (streak == requiredReadings) {
    running = false;
    digitalWrite(ledPin, HIGH);
    Serial.print(F("# Confirmed drying time (s): "));
    Serial.println(elapsed / 1000UL);
  }
}

void setup() {
  pinMode(ledPin, OUTPUT);
  digitalWrite(ledPin, LOW);
  Serial.begin(115200);
  Serial.println(F("d dry, w damp, p preview, b begin, r clear"));
}

void loop() {
  if (Serial.available()) {
    switch (Serial.read()) {
      case 'd':
        dry = readProbe();
        stopTrial();
        Serial.println(F("# Dry reference saved."));
        break;
      case 'w':
        damp = readProbe();
        stopTrial();
        Serial.println(F("# Damp reference saved."));
        break;
      case 'p': {
        const int raw = readProbe();
        Serial.print(F("# Raw "));
        Serial.print(raw);
        if (calibrated()) {
          Serial.print(F(" | Index "));
          Serial.print(indexFor(raw), 1);
        }
        Serial.println();
        break;
      }
      case 'b': {
        const int raw = readProbe();
        if (!calibrated() || indexFor(raw) <= dryLimit) {
          Serial.println(F("# Requires valid references and a starting index above 35."));
          break;
        }
        stopTrial();
        startTime = lastSample = millis();
        running = true;
        Serial.println(F("elapsed_s,raw,index,consecutive_low"));
        logSample(0, raw);
        break;
      }
      case 'r':
        dry = damp = -1;
        stopTrial();
        Serial.println(F("# Cleared."));
        break;
    }
  }

  const unsigned long now = millis();
  if (running && now - lastSample >= intervalMs) {
    lastSample = now;
    logSample(now - startTime, readProbe());
  }
}
