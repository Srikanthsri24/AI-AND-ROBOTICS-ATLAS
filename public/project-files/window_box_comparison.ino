// Window box comparison · Arduino Uno R3 + two SEN0193 probes.
const uint8_t windowPin = A0;
const uint8_t shadePin = A1;
int dry[2] = {-1, -1};
int damp[2] = {-1, -1};
float baseline[2];
unsigned long startedAt;
bool logging = false;

int readProbe(uint8_t pin) {
  analogRead(pin);
  unsigned int sum = 0;
  for (uint8_t i = 0; i < 16; ++i) {
    sum += analogRead(pin);
  }
  return (sum + 8) / 16;
}

bool calibrated() {
  return dry[0] >= 0 && dry[1] >= 0 && damp[0] >= 0 && damp[1] >= 0
      && abs(damp[0] - dry[0]) >= 12 && abs(damp[1] - dry[1]) >= 12;
}

float indexFor(uint8_t channel, int raw) {
  return (raw - dry[channel]) * 100.0 / (damp[channel] - dry[channel]);
}

void printRow(const int (&raw)[2], unsigned long elapsedSeconds) {
  Serial.print(elapsedSeconds);
  for (int reading : raw) {
    Serial.print(',');
    Serial.print(reading);
  }
  for (uint8_t channel = 0; channel < 2; ++channel) {
    Serial.print(',');
    Serial.print(indexFor(channel, raw[channel]), 1);
  }
  for (uint8_t channel = 0; channel < 2; ++channel) {
    Serial.print(',');
    Serial.print(baseline[channel] - indexFor(channel, raw[channel]), 1);
  }
  const float windowLoss = baseline[0] - indexFor(0, raw[0]);
  const float shadeLoss = baseline[1] - indexFor(1, raw[1]);
  Serial.print(',');
  Serial.println(windowLoss - shadeLoss, 1);
}

void setup() {
  Serial.begin(115200);
  Serial.println(F("d dry references, w damp references, p preview, b baseline, l log, r reset"));
}

void loop() {
  while (Serial.available()) {
    const int command = Serial.read();
    if (command == '\r' || command == '\n') continue;
    const int raw[2] = {readProbe(windowPin), readProbe(shadePin)};
    switch (command) {
      case 'd':
      case 'w': {
        int* reference = command == 'd' ? dry : damp;
        reference[0] = raw[0];
        reference[1] = raw[1];
        logging = false;
        Serial.print(command == 'd' ? F("# Dry raw: ") : F("# Damp raw: "));
        Serial.print(raw[0]);
        Serial.print(',');
        Serial.println(raw[1]);
        break;
      }
      case 'p':
        Serial.print(F("# Window and shade raw: "));
        Serial.print(raw[0]);
        Serial.print(',');
        Serial.println(raw[1]);
        break;
      case 'b':
        if (!calibrated()) {
          Serial.println(F("# Capture distinct dry and damp references on both channels."));
          break;
        }
        baseline[0] = indexFor(0, raw[0]);
        baseline[1] = indexFor(1, raw[1]);
        startedAt = millis();
        logging = true;
        Serial.println(F("elapsed_s,window_raw,shade_raw,window_index,shade_index,window_loss,shade_loss,window_minus_shade_loss"));
        printRow(raw, 0);
        break;
      case 'l':
        if (logging) {
          printRow(raw, (millis() - startedAt) / 1000UL);
        } else {
          Serial.println(F("# Record a baseline with b first."));
        }
        break;
      case 'r':
        dry[0] = dry[1] = damp[0] = damp[1] = -1;
        logging = false;
        Serial.println(F("# Trial cleared."));
        break;
    }
  }
}
