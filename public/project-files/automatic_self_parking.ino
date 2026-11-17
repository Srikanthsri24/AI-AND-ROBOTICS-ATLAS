constexpr byte START = 2, PWMA = 3, PWMB = 5, STBY = 12;
constexpr byte A1_PIN = 4, A2_PIN = 7, B1_PIN = 8, B2_PIN = 11;
const byte triggerPins[] = {A0, A2, A4};
const byte echoPins[] = {A1, A3, A5};
constexpr byte SIDE = 0, FRONT = 1, REAR = 2;
constexpr int CURB_CM = 18, CLEAR_CM = 16;
constexpr unsigned long MIN_GAP_MS = 2100, SEARCH_LIMIT_MS = 9000;
constexpr unsigned long FIRST_ARC_MS = 1150, SECOND_ARC_MS = 1150, CENTER_MS = 600;
constexpr unsigned long GAP_CONFIRM_MS = 220;
enum Phase { IDLE, SCAN, ARC_IN, ARC_OUT, CENTER };
Phase phase = IDLE;
int range[3] = {-1,-1,-1};
bool sawCurb = false, gapOpen = false, waitingAtEdge = false, rawPressed = false, stablePressed = false;
unsigned long scanAt, gapAt, candidateAt, phaseAt, lastPing, buttonChangedAt;
byte nextSensor = 0;

void wheel(byte pin1, byte pin2, byte pwm, int speed) {
  digitalWrite(pin1, speed > 0);
  digitalWrite(pin2, speed < 0);
  analogWrite(pwm, abs(speed));
}
void drive(int left, int right) {
  wheel(A1_PIN, A2_PIN, PWMA, left);
  wheel(B1_PIN, B2_PIN, PWMB, right);
  digitalWrite(STBY, HIGH);
}
void stop(const __FlashStringHelper* message) {
  digitalWrite(STBY, LOW);
  phase = IDLE;
  Serial.println(message);
}
int measure(byte sensor) {
  digitalWrite(triggerPins[sensor], HIGH);
  delayMicroseconds(10);
  digitalWrite(triggerPins[sensor], LOW);
  const unsigned long duration = pulseIn(echoPins[sensor], HIGH, 13000);
  return duration ? duration / 58 : -1;
}
void enter(Phase next, unsigned long now, const __FlashStringHelper* message) {
  phase = next;
  phaseAt = now;
  Serial.println(message);
}
void setup() {
  Serial.begin(115200);
  pinMode(START, INPUT_PULLUP);
  const byte outputs[] = {PWMA,PWMB,STBY,A1_PIN,A2_PIN,B1_PIN,B2_PIN};
  for (byte pin : outputs) pinMode(pin, OUTPUT);
  for (byte i = 0; i < 3; i++) {
    pinMode(triggerPins[i], OUTPUT);
    pinMode(echoPins[i], INPUT);
  }
  rawPressed = stablePressed = digitalRead(START) == LOW;
  stop(F("Place at the start beside the first block."));
}
void loop() {
  const bool pressed = digitalRead(START) == LOW;
  unsigned long now = millis();
  if (pressed != rawPressed) {
    rawPressed = pressed;
    buttonChangedAt = now;
  }
  bool freshPress = false;
  if (rawPressed != stablePressed && now - buttonChangedAt >= 35) {
    stablePressed = rawPressed;
    freshPress = stablePressed;
  }
  if (freshPress && phase != IDLE) { stop(F("Stopped by button")); return; }
  bool newSide = false;
  if (now - lastPing >= 60) {
    lastPing = now;
    range[nextSensor] = measure(nextSensor);
    newSide = nextSensor == SIDE;
    nextSensor = (nextSensor + 1) % 3;
    now = millis();
  }
  if (phase == IDLE) {
    if (!freshPress) return;
    sawCurb = gapOpen = waitingAtEdge = false;
    scanAt = now;
    enter(SCAN, now, F("Scanning curb"));
  }
  if (phase == SCAN) {
    if (range[FRONT] < CLEAR_CM) { stop(F("Stopped: front too close or echo missing")); return; }
    if (now - scanAt >= SEARCH_LIMIT_MS) { stop(F("No usable gap")); return; }
    if (newSide) {
      const bool curb = range[SIDE] >= 0 && range[SIDE] <= CURB_CM;
      if (curb && gapOpen) {
        const unsigned long widthMs = now - gapAt;
        gapOpen = waitingAtEdge = false;
        if (widthMs >= MIN_GAP_MS) enter(ARC_IN, now, F("Gap accepted: reverse first arc"));
        else { stop(F("Gap rejected: too short")); return; }
      } else if (curb) {
        sawCurb = true;
        waitingAtEdge = false;
      } else if (sawCurb && !gapOpen) {
        if (!waitingAtEdge) { waitingAtEdge = true; candidateAt = now; }
        if (now - candidateAt >= GAP_CONFIRM_MS) { gapOpen = true; gapAt = candidateAt; }
      }
    }
    if (phase == SCAN) { drive(90,90); return; }
  }
  if (range[REAR] < CLEAR_CM) { stop(F("Stopped: rear too close or echo missing")); return; }
  if (phase == ARC_IN && now - phaseAt >= FIRST_ARC_MS) enter(ARC_OUT, now, F("Countersteer"));
  if (phase == ARC_OUT && now - phaseAt >= SECOND_ARC_MS) enter(CENTER, now, F("Center in bay"));
  if (phase == CENTER && now - phaseAt >= CENTER_MS) { stop(F("Parked")); return; }
  if (phase == ARC_IN) drive(-112,-78);
  else if (phase == ARC_OUT) drive(-78,-112);
  else drive(-84,-84);
}
