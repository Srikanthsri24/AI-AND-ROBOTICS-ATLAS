constexpr byte sensorPin = A0, ledPin = 8, piezoPin = 9, buttonPin = 2;
constexpr float referenceVolts = 5.0, correctionC = 0.0;
bool latched = false, muted = false, rawPressed = false, pressed = false;
bool sounding = false;
float temperature = 0.0;
unsigned long changedAt = 0, sampledAt = 0, reportedAt = 0, alarmAt = 0;

void setup() {
  Serial.begin(115200);
  pinMode(buttonPin, INPUT_PULLUP);
  pinMode(ledPin, OUTPUT);
  pinMode(piezoPin, OUTPUT);
  digitalWrite(ledPin, LOW);
}

void loop() {
  const unsigned long now = millis();
  if (now - sampledAt >= 100) {
    sampledAt = now;
    unsigned int sum = 0;
    for (byte i = 0; i < 16; ++i) sum += analogRead(sensorPin);
    const float volts = (sum / 16.0) * referenceVolts / 1023.0;
    temperature = (volts - 0.5) * 100.0 + correctionC;
    if (temperature >= 37.0 && !latched) {
      latched = true;
      muted = false;
      alarmAt = now;
    }
  }

  const bool input = digitalRead(buttonPin) == LOW;
  if (input != rawPressed) {
    rawPressed = input;
    changedAt = now;
  }
  if (rawPressed != pressed && now - changedAt >= 30) {
    pressed = rawPressed;
    if (pressed && latched) {
      if (temperature <= 35.0) {
        latched = false;
        muted = false;
      } else {
        muted = true;
      }
    }
  }

  digitalWrite(ledPin, latched ? HIGH : LOW);
  const bool beep = latched && !muted && (now - alarmAt) % 800 < 180;
  if (beep != sounding) {
    sounding = beep;
    if (sounding) tone(piezoPin, 1800);
    else noTone(piezoPin);
  }
  if (now - reportedAt >= 250) {
    reportedAt = now;
    Serial.print(F("Chamber C="));
    Serial.print(temperature, 2);
    Serial.println(!latched ? F(" | READY") : temperature <= 35.0 ? F(" | PRESS TO RESET") : muted ? F(" | ACKNOWLEDGED") : F(" | HIGH ALERT"));
  }
}
