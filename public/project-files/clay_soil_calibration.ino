// Clay soil calibration · Arduino Uno R3 + SEN0193.
const uint8_t sensorPin = A0;
const uint8_t repeatCount = 3;

struct SampleSet {
  uint8_t count = 0;
  int low = 1023;
  int high = 0;
};

int dry = -1;
int damp = -1;
SampleSet snug;
SampleSet gap;
SampleSet* active = &snug;

int readProbe() {
  unsigned int sum = 0;
  for (uint8_t i = 0; i < 16; ++i) {
    sum += analogRead(sensorPin);
  }
  return (sum + 8) / 16;
}

bool calibrated() {
  return dry >= 0 && damp >= 0 && abs(dry - damp) >= 12;
}

void printSet(const __FlashStringHelper* label, const SampleSet& set) {
  Serial.print(label);
  Serial.print(set.count);
  Serial.print(F("/3"));
  if (set.count) {
    Serial.print(F(" min="));
    Serial.print(set.low);
    Serial.print(F(" max="));
    Serial.print(set.high);
    Serial.print(F(" spread="));
    Serial.print(set.high - set.low);
  }
}

void setup() {
  Serial.begin(115200);
  Serial.println(F("d dry, w damp, s clear/select snug, g clear/select gap, n capture, r reset"));
}

void loop() {
  const int raw = readProbe();
  while (Serial.available()) {
    switch (Serial.read()) {
      case 'd':
        dry = raw;
        snug = SampleSet();
        gap = SampleSet();
        break;
      case 'w':
        damp = raw;
        snug = SampleSet();
        gap = SampleSet();
        break;
      case 's':
        snug = SampleSet();
        active = &snug;
        break;
      case 'g':
        gap = SampleSet();
        active = &gap;
        break;
      case 'n':
        if (!calibrated()) {
          Serial.println(F("Set valid endpoints before capturing a repeat."));
        } else if (active->count == repeatCount) {
          Serial.println(F("Set full. Select s or g to start a fresh set."));
        } else {
          active->low = min(active->low, raw);
          active->high = max(active->high, raw);
          ++active->count;
        }
        break;
      case 'r':
        dry = damp = -1;
        snug = SampleSet();
        gap = SampleSet();
        active = &snug;
        break;
    }
  }

  Serial.print(F("Raw "));
  Serial.print(raw);
  Serial.print(F(" | dry="));
  Serial.print(dry);
  Serial.print(F(" damp="));
  Serial.print(damp);
  if (calibrated()) {
    Serial.print(F(" | relative index="));
    Serial.print((raw - dry) * 100.0 / (damp - dry), 1);
  } else {
    Serial.print(F(" | capture distinct endpoints"));
  }
  printSet(F(" | snug "), snug);
  printSet(F(" | gap "), gap);
  Serial.println();
  delay(400);
}
