constexpr byte sensorPin = A0, indicatorPin = 8;
constexpr int triggerDrop = 180, recoverDrop = 90, minimumBaseline = 260;
constexpr unsigned long sampleMs = 50;
int baseline = 0;
bool shadow = false;
unsigned long events = 0;
unsigned long sampledAt = 0, reportedAt = 0;

void setup() {
  pinMode(indicatorPin, OUTPUT);
  digitalWrite(indicatorPin, LOW);
  Serial.begin(115200);
  baseline = analogRead(sensorPin);
}

void loop() {
  const unsigned long now = millis();
  if (now - sampledAt < sampleMs) return;
  sampledAt = now;
  const int light = analogRead(sensorPin);
  const int drop = baseline - light;

  if (shadow) {
    if (drop <= recoverDrop) shadow = false;
  } else if (baseline >= minimumBaseline && drop >= triggerDrop) {
    shadow = true;
    ++events;
  }
  if (!shadow) baseline += (light - baseline) / 8;
  digitalWrite(indicatorPin, shadow ? HIGH : LOW);

  if (now - reportedAt >= 250) {
    reportedAt = now;
    Serial.print(F("A0="));
    Serial.print(light);
    Serial.print(F(" | baseline="));
    Serial.print(baseline);
    Serial.print(F(" | events="));
    Serial.print(events);
    Serial.println(shadow ? F(" | SHADOW") : F(" | CLEAR"));
  }
}
