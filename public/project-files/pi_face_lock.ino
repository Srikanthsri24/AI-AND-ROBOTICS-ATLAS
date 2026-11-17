#include <Servo.h>
Servo latch;
constexpr byte contactPin=4, servoPin=9;
constexpr byte lockedAngle=25, releasedAngle=70;
constexpr unsigned long debounce=45, relockDelay=3000;
bool rawClosed=false, closed=false, released=true;
unsigned long changedAt=0, closedAt=0;

void setReleased(bool state) {
  released=state;
  latch.write(state?releasedAngle:lockedAngle);
}

void setup() {
  Serial.begin(115200);
  pinMode(contactPin,INPUT_PULLUP);
  rawClosed=digitalRead(contactPin)==LOW;
  changedAt=millis();
  latch.write(releasedAngle);
  latch.attach(servoPin);
}

void loop() {
  const auto now=millis();
  const bool reading=digitalRead(contactPin)==LOW;
  if(reading!=rawClosed) { rawClosed=reading; changedAt=now; }
  if(!rawClosed && closed) closed=false;
  if(rawClosed && !closed && now-changedAt>=debounce) {
    closed=true;
    closedAt=now;
  }
  if(released&&closed&&now-closedAt>=relockDelay) setReleased(false);
  while(Serial.available()) {
    const char value=Serial.read();
    if(value=='G') { setReleased(true); closedAt=now; Serial.println(F("Granted")); }
    if(value=='?') Serial.println(released?F("Retracted"):F("Extended"));
  }
}
