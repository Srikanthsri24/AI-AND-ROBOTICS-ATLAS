#include <Servo.h>

constexpr byte START = 2, PAN = 9;
constexpr int FIRST = -60, LAST = 60, INCREMENT = 10, DARK = 180;
constexpr unsigned long SETTLE_MS = 300, RESCAN_MS = 25000;
Servo panel;
enum State { IDLE, SCAN, RETURN };
State state = IDLE;
int heading = 0, retained = 0, bestHeading = 0, bestValue = 0;
unsigned long phaseAt = 0, lastScanAt = 0, changedAt = 0;
bool raw = false, stable = false;

void point(int target) {
  heading = target;
  panel.write(90 + heading);
}
void setup() {
  pinMode(START, INPUT_PULLUP);
  raw = stable = digitalRead(START) == LOW;
  Serial.begin(115200);
  panel.attach(PAN);
  point(0);
  Serial.println(F("Heading 0. Press Scan or wait for automatic sweep."));
}
void loop() {
  const unsigned long now = millis();
  const bool pressed = digitalRead(START) == LOW;
  if (pressed != raw) { raw = pressed; changedAt = now; }
  bool scanPressed = false;
  if (raw != stable && now - changedAt >= 35) {
    stable = raw;
    scanPressed = stable;
  }
  if (state == IDLE && (scanPressed || now - lastScanAt >= RESCAN_MS)) {
    bestValue = -1;
    point(FIRST);
    phaseAt = now;
    state = SCAN;
    return;
  }
  if (state == SCAN && now - phaseAt >= SETTLE_MS) {
    int sum = 0;
    for (byte i = 0; i < 8; ++i) sum += analogRead(A0);
    const int level = sum / 8;
    Serial.print(heading); Serial.print(','); Serial.println(level);
    if (level > bestValue || (level == bestValue && abs(heading-retained) < abs(bestHeading-retained))) {
      bestHeading = heading;
      bestValue = level;
    }
    if (heading < LAST) point(heading+INCREMENT);
    else {
      if (bestValue >= DARK) retained = bestHeading;
      else Serial.println(F("Dim sweep: preserving last retained heading."));
      point(retained);
      state = RETURN;
    }
    phaseAt = now;
  } else if (state == RETURN && now - phaseAt >= SETTLE_MS) {
    Serial.print(F("Retained heading: ")); Serial.println(retained);
    lastScanAt = now;
    state = IDLE;
  }
}
