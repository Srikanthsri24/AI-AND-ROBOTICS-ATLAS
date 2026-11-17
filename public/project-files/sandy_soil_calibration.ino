// Sandy soil calibration · Arduino Uno R3 + SEN0193.
const uint8_t probePin = A0;
const int minimumGap = 12;
int dry = -1;
int wet = -1;
int middle = -1;

int readProbe() {
  unsigned int total = 0;
  for (uint8_t i = 0; i < 16; ++i) {
    total += analogRead(probePin);
  }
  return (total + 8) / 16;
}

void setup() {
  Serial.begin(115200);
  Serial.println(F("Capture dry with d, wetter with w and middle with m. Reset with r."));
}

void loop() {
  const int raw = readProbe();
  while (Serial.available()) {
    switch (Serial.read()) {
      case 'd':
        dry = raw;
        break;
      case 'w':
        wet = raw;
        break;
      case 'm':
        middle = raw;
        break;
      case 'r':
        dry = wet = middle = -1;
        break;
    }
  }

  Serial.print(F("Raw "));
  Serial.print(raw);
  Serial.print(F(" | dry "));
  Serial.print(dry);
  Serial.print(F(" | wetter "));
  Serial.print(wet);
  if (dry < 0 || wet < 0) {
    Serial.println(F(" | capture endpoints"));
  } else if (abs(wet - dry) < minimumGap) {
    Serial.println(F(" | endpoints too close. Check sample preparation and repeat."));
  } else {
    const float scale = 100.0 / (wet - dry);
    Serial.print(F(" | live index "));
    Serial.print((raw - dry) * scale, 1);
    if (middle >= 0) {
      const float middleIndex = (middle - dry) * scale;
      Serial.print(F(" | middle raw "));
      Serial.print(middle);
      Serial.print(F(" | middle index "));
      Serial.print(middleIndex, 1);
      Serial.print(F(" | difference from 50: "));
      Serial.print(middleIndex - 50.0, 1);
    }
    Serial.println();
  }
  delay(400);
}
