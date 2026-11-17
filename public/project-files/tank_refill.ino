constexpr byte LOW_MARK = 2, HIGH_MARK = 3, SUPPLY = 4, PUMP = 9;
constexpr byte LOW_BIT = 1, HIGH_BIT = 2, SUPPLY_BIT = 4;
constexpr unsigned long STABLE_MS = 200, MAX_RUN_MS = 45000;
enum Fault : byte { CLEAR, LEVEL_CONFLICT, TIMEOUT };
Fault fault = CLEAR;
bool demand = false, pumping = false, stable = false;
byte candidate = 255;
unsigned long changedAt = 0, started = 0, lastPrint = 0;

byte readSensors() {
  return (digitalRead(LOW_MARK) == LOW ? LOW_BIT : 0)
      | (digitalRead(HIGH_MARK) == LOW ? HIGH_BIT : 0)
      | (digitalRead(SUPPLY) == LOW ? SUPPLY_BIT : 0);
}

void setup() {
  pinMode(PUMP, OUTPUT);
  digitalWrite(PUMP, LOW);
  pinMode(LOW_MARK, INPUT_PULLUP);
  pinMode(HIGH_MARK, INPUT_PULLUP);
  pinMode(SUPPLY, INPUT_PULLUP);
  Serial.begin(115200);
}

void loop() {
  const unsigned long now = millis();
  const byte bits = readSensors();
  const bool lowWet = bits & LOW_BIT;
  const bool highWet = bits & HIGH_BIT;
  const bool supplyWet = bits & SUPPLY_BIT;
  const bool conflict = highWet && !lowWet;
  if (bits != candidate) {
    candidate = bits;
    changedAt = now;
    stable = false;
  } else if (now - changedAt >= STABLE_MS) stable = true;

  if (stable) {
    if (conflict) fault = LEVEL_CONFLICT;
    else if (highWet) demand = false;
    else if (!lowWet) demand = true;
  }
  while (Serial.available()) {
    const int input = Serial.read();
    if ((input == 'R' || input == 'r') && stable && !conflict && supplyWet && !pumping) fault = CLEAR;
  }

  // Stop immediately on a raw upper or dry-source signal.
  bool shouldPump = demand && !highWet && supplyWet && !conflict && fault == CLEAR
                    && (pumping || stable);
  if (shouldPump && !pumping) started = now;
  if (shouldPump && now - started >= MAX_RUN_MS) {
    fault = TIMEOUT;
    shouldPump = false;
  }
  pumping = shouldPump;
  digitalWrite(PUMP, pumping ? HIGH : LOW);
  if (now - lastPrint >= 350) {
    lastPrint = now;
    Serial.print(F("LOW WET=")); Serial.print(lowWet);
    Serial.print(F(" HIGH WET=")); Serial.print(highWet);
    Serial.print(F(" SUPPLY WET=")); Serial.print(supplyWet);
    Serial.print(F(" PUMP=")); Serial.print(pumping);
    if (fault == LEVEL_CONFLICT) Serial.println(F(" | SENSOR CONFLICT"));
    else if (fault == TIMEOUT) Serial.println(F(" | TIMEOUT"));
    else if (!supplyWet) Serial.println(F(" | SUPPLY LOW"));
    else Serial.println();
  }
}
