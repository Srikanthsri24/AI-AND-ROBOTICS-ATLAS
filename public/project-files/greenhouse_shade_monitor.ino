constexpr byte referencePin = A0, trayPin = A1, warningPin = 8;
constexpr int refDark = 170, refBright = 830;
constexpr int trayDark = 180, trayBright = 820;
constexpr int minReference = 20, warnBelow = 48, clearAt = 55;
bool warning = false;
unsigned long lastReport = 0;
static_assert(refBright > refDark && trayBright > trayDark, "Bright reference must be higher.");

int relativeReading(int raw, int dark, int bright) {
  return constrain(map(raw, dark, bright, 0, 100), 0, 100);
}

void setup() {
  Serial.begin(115200);
  pinMode(warningPin, OUTPUT);
  digitalWrite(warningPin, LOW);
}

void loop() {
  const int refRaw = analogRead(referencePin);
  const int trayRaw = analogRead(trayPin);
  const int reference = relativeReading(refRaw, refDark, refBright);
  const int tray = relativeReading(trayRaw, trayDark, trayBright);
  const bool valid = reference >= minReference;
  const int ratio = valid ? tray * 100 / reference : 0;
  if (!valid || ratio >= clearAt) warning = false;
  else if (ratio < warnBelow) warning = true;
  digitalWrite(warningPin, warning);

  const unsigned long now = millis();
  if (now - lastReport >= 250) {
    lastReport = now;
    Serial.print(F("raw A0="));
    Serial.print(refRaw);
    Serial.print(F(" | raw A1="));
    Serial.print(trayRaw);
    Serial.print(F(" | ref="));
    Serial.print(reference);
    Serial.print(F("% | tray="));
    Serial.print(tray);
    Serial.print(F("% | ratio="));
    if (valid) {
      Serial.print(ratio);
      Serial.println(warning ? F("% | SHADE") : F("% | CLEAR"));
    } else {
      Serial.println(F("unavailable | Reference too dim"));
    }
  }
  delay(25);
}
