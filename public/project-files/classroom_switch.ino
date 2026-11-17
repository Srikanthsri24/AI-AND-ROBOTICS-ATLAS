const byte BUTTON = 2, LED = 9;
void setup() {
  pinMode(BUTTON, INPUT_PULLUP);
  pinMode(LED, OUTPUT);
}
void loop() {
  const bool switchClosed = digitalRead(BUTTON) == LOW;
  digitalWrite(LED, switchClosed ? HIGH : LOW);
}
