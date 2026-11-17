// Optical receiver for the narrow tabletop water-channel experiment.
constexpr byte BEAM=2, GOOD_LED=5, BAD_LED=6;
constexpr byte PING=0x35, READY=0xB2;
bool wasLit=false, collecting=false;
byte bitCount=0;
uint16_t frame=0;
unsigned long roseAt=0, lastFall=0, displayUntil=0;

void finishFrame(bool valid) {
  collecting=false;
  digitalWrite(GOOD_LED,valid);
  digitalWrite(BAD_LED,!valid);
  displayUntil=millis()+1600;
  if (!valid) Serial.println(F("FRAME REJECTED"));
  else Serial.println((frame>>8)==PING?F("PING"):F("READY"));
}

void fallingEdge(unsigned long now) {
  const unsigned long width=now-roseAt;
  if (width>=95 && width<=145) {
    frame=0;
    bitCount=0;
    collecting=true;
    lastFall=now;
    return;
  }
  if (!collecting) return;
  if (width>=13 && width<=27) frame<<=1;
  else if (width>=39 && width<=57) frame=(frame<<1)|1;
  else {
    finishFrame(false);
    return;
  }
  lastFall=now;
  if (++bitCount==16) {
    const byte value=frame>>8, inverse=frame&0xFF;
    finishFrame(byte(value^inverse)==0xFF && (value==PING || value==READY));
  }
}
void setup() {
  pinMode(BEAM,INPUT_PULLUP);
  pinMode(LED_BUILTIN,OUTPUT);
  pinMode(GOOD_LED,OUTPUT);
  pinMode(BAD_LED,OUTPUT);
  Serial.begin(115200);
  Serial.println(F("Receiver ready. D13 follows the optical input."));
}
void loop() {
  const unsigned long now=millis();
  const bool lit=digitalRead(BEAM)==HIGH;
  digitalWrite(LED_BUILTIN,lit);
  if (lit!=wasLit) {
    wasLit=lit;
    if (lit) roseAt=now;
    else fallingEdge(now);
  }
  if (collecting && now-lastFall>95) finishFrame(false);
  if (displayUntil && int32_t(now-displayUntil)>=0) {
    digitalWrite(GOOD_LED,LOW);
    digitalWrite(BAD_LED,LOW);
    displayUntil=0;
  }
}
