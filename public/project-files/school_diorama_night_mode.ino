constexpr byte lightPin = A0, pathPin = 8, classroomPin = 9;
constexpr int darkReference = 180, brightReference = 820;
static_assert(brightReference > darkReference, "Bright reference must be higher.");
bool pathLit = false, classroomLit = false;
unsigned long reportedAt = 0;

void setup() {
  Serial.begin(115200);
  pinMode(pathPin, OUTPUT);
  pinMode(classroomPin, OUTPUT);
  digitalWrite(pathPin, LOW);
  digitalWrite(classroomPin, LOW);
}

void loop() {
  const int raw = analogRead(lightPin);
  const int light = constrain(map(raw, darkReference, brightReference, 0, 100), 0, 100);
  if (light <= 45) pathLit = true;
  if (light >= 55) pathLit = false;
  if (light <= 28) classroomLit = true;
  if (light >= 38) classroomLit = false;

  digitalWrite(pathPin, pathLit ? HIGH : LOW);
  digitalWrite(classroomPin, classroomLit ? HIGH : LOW);
  const unsigned long now = millis();
  if (now - reportedAt >= 250) {
    reportedAt = now;
    Serial.print(F("A0="));
    Serial.print(raw);
    Serial.print(F(" | Light="));
    Serial.print(light);
    Serial.print(pathLit ? F("% | Path ON") : F("% | Path OFF"));
    Serial.println(classroomLit ? F(" | Classroom ON") : F(" | Classroom OFF"));
  }
  delay(25);
}
