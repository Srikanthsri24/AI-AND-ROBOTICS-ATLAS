constexpr byte START = 2, FILL_LED = 5, ALARM_LED = 6;
constexpr unsigned long FILL_MS = 1200, CYCLE_MS = 3000;
bool running = false, alarm = false, rawPressed = false, stablePressed = false;
unsigned long startedAt = 0, buttonChangedAt = 0, lastReport = 0;
int alarmCode = 0;

void setup() {
  pinMode(START, INPUT_PULLUP);
  pinMode(FILL_LED, OUTPUT);
  pinMode(ALARM_LED, OUTPUT);
  rawPressed = stablePressed = digitalRead(START) == LOW;
  Serial.begin(115200);
}
void loop() {
  const unsigned long now = millis();
  const bool pressed = digitalRead(START) == LOW;
  if (pressed != rawPressed) { rawPressed = pressed; buttonChangedAt = now; }
  if (rawPressed != stablePressed && now - buttonChangedAt >= 35) {
    stablePressed = rawPressed;
    if (stablePressed) {
      if (alarm) { alarm = false; alarmCode = 0; }
      else {
        running = !running;
        if (running) startedAt = now;
      }
    }
  }
  int level = 0;
  bool filling = false;
  if (running) {
    const unsigned long phase = (now - startedAt) % CYCLE_MS;
    const int restriction = (100L * analogRead(A0) + 511) / 1023;
    const int leak = (100L * analogRead(A1) + 511) / 1023;
    const int peak = 25 + (60L * restriction + 50) / 100 - (35L * leak + 50) / 100;
    filling = phase < FILL_MS;
    const long scale = filling ? FILL_MS : CYCLE_MS - FILL_MS;
    const long value = filling ? phase : CYCLE_MS - phase;
    level = max(0L, ((long)peak * value + scale / 2) / scale);
    if (level > 74 || (!filling && peak < 33)) {
      alarmCode = level > 74 ? 80 : 40;
      alarm = true;
      running = false;
      filling = false;
    }
  }
  digitalWrite(FILL_LED, running && filling);
  digitalWrite(ALARM_LED, alarm);
  if (now - lastReport >= 80) {
    lastReport = now;
    Serial.print(F("index:")); Serial.print(level);
    Serial.print(F("\tfill:")); Serial.print(filling ? 25 : 0);
    Serial.print(F("\talarm:")); Serial.println(alarmCode);
  }
}
