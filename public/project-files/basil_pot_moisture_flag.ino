// Basil pot moisture flag · Arduino Uno R3 + SEN0193.
const uint8_t soilPin = A0;
const uint8_t flagPin = 8;
const int minimumReferenceGap = 12;
int dryReference = -1;
int dampReference = -1;
bool flagOn = false;

int readSoil() {
  unsigned int sum = 0;
  for (uint8_t sample = 0; sample < 16; ++sample) {
    sum += analogRead(soilPin);
  }
  return (sum + 8) / 16;
}

void setup() {
  pinMode(flagPin, OUTPUT);
  digitalWrite(flagPin, LOW);
  Serial.begin(115200);
  Serial.println(F("Send d in dry mix, then w in damp mix. Send r to reset."));
}

void loop() {
  const int raw = readSoil();
  while (Serial.available()) {
    const int command = Serial.read();
    switch (command) {
      case 'd':
        dryReference = raw;
        Serial.print(F("Dry reference = "));
        Serial.println(raw);
        break;
      case 'w':
        dampReference = raw;
        Serial.print(F("Damp reference = "));
        Serial.println(raw);
        break;
      case 'r':
        dryReference = dampReference = -1;
        flagOn = false;
        Serial.println(F("References cleared."));
        break;
    }
  }

  Serial.print(F("Raw ADC = "));
  Serial.print(raw);
  if (dryReference < 0 || dampReference < 0) {
    flagOn = false;
    Serial.println(F(" | Capture both references"));
  } else if (abs(dampReference - dryReference) < minimumReferenceGap) {
    flagOn = false;
    Serial.println(F(" | References too close. Recheck samples and recapture."));
  } else {
    const long relative = constrain(100L * (raw - dryReference) / (dampReference - dryReference), 0L, 100L);
    if (relative <= 30) {
      flagOn = true;
    } else if (relative >= 40) {
      flagOn = false;
    }
    Serial.print(F(" | Relative index = "));
    Serial.print(relative);
    Serial.println(flagOn ? F(" | Check soil") : F(" | Flag off"));
  }
  digitalWrite(flagPin, flagOn ? HIGH : LOW);
  delay(400);
}
