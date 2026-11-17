// Game controller input tester · Arduino Uno R3.
constexpr int deadZone = 55;
constexpr unsigned long debounceMs = 25;
constexpr unsigned long sampleMs = 100;
const uint8_t buttonPins[] = {2, 3, 4};
bool raw[] = {HIGH, HIGH, HIGH};
bool stable[] = {HIGH, HIGH, HIGH};
unsigned long changedAt[] = {0, 0, 0};
int centerX = 512;
int centerY = 512;
unsigned long lastSample = 0;

int readAxis(uint8_t pin) {
  analogRead(pin);
  unsigned int sum = 0;
  for (uint8_t i = 0; i < 8; ++i) sum += analogRead(pin);
  return (sum + 4) / 8;
}

void setup() {
  for (uint8_t pin : buttonPins) pinMode(pin, INPUT_PULLUP);
  Serial.begin(115200);
  Serial.println(F("# Release the stick and send c to capture center."));
  Serial.println(F("x,y,dx,dy,neutral,stick_click,a,b"));
}

void loop() {
  const unsigned long now = millis();
  bool changed = false;
  for (uint8_t i = 0; i < 3; ++i) {
    const bool sample = digitalRead(buttonPins[i]);
    if (sample != raw[i]) {
      raw[i] = sample;
      changedAt[i] = now;
    }
    if (raw[i] != stable[i] && now - changedAt[i] >= debounceMs) {
      stable[i] = raw[i];
      changed = true;
    }
  }
  bool recenter = false;
  while (Serial.available()) {
    if (Serial.read() == 'c') recenter = true;
  }
  if (!changed && !recenter && now - lastSample < sampleMs) return;
  lastSample = now;
  const int x = readAxis(A0);
  const int y = readAxis(A1);
  if (recenter) {
    centerX = x;
    centerY = y;
    Serial.println(F("# Center captured."));
  }
  const int dx = x - centerX;
  const int dy = y - centerY;
  Serial.print(x); Serial.print(',');
  Serial.print(y); Serial.print(',');
  Serial.print(dx); Serial.print(',');
  Serial.print(dy); Serial.print(',');
  Serial.print(abs(dx) <= deadZone && abs(dy) <= deadZone);
  for (bool level : stable) {
    Serial.print(',');
    Serial.print(level == LOW);
  }
  Serial.println();
}
