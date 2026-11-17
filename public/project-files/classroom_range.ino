const byte TRIG = 5, ECHO = 6;
void setup() {
  Serial.begin(115200);
  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  digitalWrite(TRIG, LOW);
}
void loop() {
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  const unsigned long pulse = pulseIn(ECHO, HIGH, 12000);
  if (!pulse) Serial.println("No echo");
  else {
    Serial.print(pulse * 0.01715f, 1);
    Serial.println(" cm");
  }
  delay(250);
}
