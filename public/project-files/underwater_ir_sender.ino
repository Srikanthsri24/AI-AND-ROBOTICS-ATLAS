// Optical sender for the narrow tabletop water-channel experiment.
constexpr byte EMITTER=9, PING_BUTTON=2, READY_BUTTON=3;
constexpr byte PING=0x35, READY=0xB2;
bool previousPing=HIGH, previousReady=HIGH;

void pulse(unsigned int length) {
  digitalWrite(EMITTER,HIGH);
  delay(length);
  digitalWrite(EMITTER,LOW);
  delay(28);
}
void sendByte(byte value) {
  for (int bit=7;bit>=0;--bit) pulse(bitRead(value,bit)?48:20);
}
void sendMessage(byte value) {
  pulse(120);
  sendByte(value);
  sendByte(~value);
}
void setup() {
  pinMode(EMITTER,OUTPUT);
  pinMode(PING_BUTTON,INPUT_PULLUP);
  pinMode(READY_BUTTON,INPUT_PULLUP);
  Serial.begin(115200);
  Serial.println(F("P = PING, R = READY, T = 1 second alignment light"));
}
void loop() {
  bool ping=digitalRead(PING_BUTTON), ready=digitalRead(READY_BUTTON);
  bool pressPing=previousPing&&!ping, pressReady=previousReady&&!ready;
  previousPing=ping;
  previousReady=ready;
  const char key=Serial.available()?Serial.read():0;
  if (key=='T') {
    pulse(1000);
  } else if (pressPing||key=='P') {
    sendMessage(PING);
  } else if (pressReady||key=='R') {
    sendMessage(READY);
  }
}
