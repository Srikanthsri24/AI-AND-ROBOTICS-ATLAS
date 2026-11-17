const byte LID_PIN = 2;
const byte START_PIN = 3;
const byte LED_PIN = 9;
const unsigned long CYCLE_MS = 8000;
const unsigned long DEBOUNCE_MS = 35;

bool running = false;
bool previousLidClosed = false;
bool rawPressed = false;
bool stablePressed = false;
bool eligiblePress = false;
unsigned long buttonChangedAt = 0;
unsigned long cycleStartedAt = 0;

void setup() {
  pinMode(LID_PIN, INPUT_PULLUP);
  pinMode(START_PIN, INPUT_PULLUP);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  Serial.begin(115200);
  previousLidClosed = digitalRead(LID_PIN) == LOW;
  Serial.println(previousLidClosed ? F("Lid CLOSED") : F("Lid OPEN"));
  rawPressed = stablePressed = digitalRead(START_PIN) == LOW;
}

void loop() {
  const unsigned long now = millis();
  const bool lidClosed = digitalRead(LID_PIN) == LOW;
  const bool pressed = digitalRead(START_PIN) == LOW;

  if (!lidClosed) {
    digitalWrite(LED_PIN, LOW);
    eligiblePress = false;
  }
  if (running && (!lidClosed || now - cycleStartedAt >= CYCLE_MS)) {
    digitalWrite(LED_PIN, LOW);
    running = false;
    Serial.println(lidClosed ? F("Cycle complete") : F("Cycle interrupted"));
  }
  if (lidClosed != previousLidClosed) {
    previousLidClosed = lidClosed;
    Serial.println(lidClosed ? F("Lid CLOSED") : F("Lid OPEN"));
  }
  if (pressed != rawPressed) {
    rawPressed = pressed;
    buttonChangedAt = now;
    eligiblePress = pressed && lidClosed && !running && !stablePressed;
  }
  if (rawPressed != stablePressed && now - buttonChangedAt >= DEBOUNCE_MS) {
    stablePressed = rawPressed;
    if (stablePressed) {
      if (eligiblePress && lidClosed && !running) {
        cycleStartedAt = now;
        running = true;
        digitalWrite(LED_PIN, HIGH);
        Serial.println(F("Cycle started"));
      } else if (!running) {
        Serial.println(F("Start blocked. Close lid and press again."));
      }
    }
  }
}
