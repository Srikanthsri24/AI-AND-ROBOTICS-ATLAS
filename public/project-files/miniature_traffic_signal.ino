// Connect D8 to red, D10 to green and D9 to amber through individual 330 ohm resistors.
constexpr byte lamps[] = {8, 10, 9};
constexpr unsigned long durationMs[] = {3000, 3000, 1000};
constexpr const char *names[] = {"RED", "GREEN", "AMBER"};
byte phase = 0;
unsigned long startedAt = 0;

void setup() {
  Serial.begin(115200);
  for (byte pin : lamps) {
    pinMode(pin, OUTPUT);
    digitalWrite(pin, LOW);
  }
  digitalWrite(lamps[phase], HIGH);
  startedAt = millis();
  Serial.println(names[phase]);
}

void loop() {
  const unsigned long now = millis();
  if (now - startedAt < durationMs[phase]) return;
  digitalWrite(lamps[phase], LOW);
  phase = (phase + 1) % 3;
  digitalWrite(lamps[phase], HIGH);
  startedAt = now;
  Serial.println(names[phase]);
}
