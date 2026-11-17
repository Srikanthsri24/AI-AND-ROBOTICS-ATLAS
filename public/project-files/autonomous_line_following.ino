#include <EEPROM.h>

constexpr byte START=2,PWMA=3,PWMB=5,STBY=12;
constexpr byte A1_PIN=4,A2_PIN=7,B1_PIN=8,B2_PIN=11;
constexpr byte CHANNELS=3;
constexpr int BASE=92, STEER=74, MIN_STRENGTH=220;
constexpr unsigned int MAGIC=0x514C;
struct Calibration {unsigned int signature;int white[CHANNELS],black[CHANNELS];};
Calibration saved, candidate;
bool hasWhite=false, calibrated=false, running=false, raw=false, stable=false;
unsigned long changedAt=0,sampledAt=0,reportedAt=0;

void stop() {
  digitalWrite(STBY,LOW);
  running=false;
}
bool verify(const Calibration& values) {
  if(values.signature!=MAGIC)return false;
  for(byte i=0;i<CHANNELS;i++)
    if(values.white[i]<0||values.white[i]>1023||values.black[i]<0||values.black[i]>1023||
       abs(values.black[i]-values.white[i])<120)return false;
  return true;
}
void capture(int* values) {
  for(byte i=0;i<CHANNELS;i++){
    int total=0;
    analogRead(A0+i);
    for(byte j=0;j<12;j++)total+=analogRead(A0+i);
    values[i]=total/12;
  }
}
void command(char key) {
  if(key=='W'){
    stop();
    capture(candidate.white);hasWhite=true;
    Serial.println(F("Light reference stored. Put all sensors over dark and send B."));
  }else if(key=='B'){
    stop();
    if(!hasWhite){Serial.println(F("Send W over the light swatch first."));return;}
    capture(candidate.black);candidate.signature=MAGIC;
    if(!verify(candidate)){Serial.println(F("Contrast too low. Check height and recapture swatches."));return;}
    saved=candidate;EEPROM.put(0,saved);calibrated=true;
    Serial.println(F("Calibration saved. Place rover on line and press Start."));
  }
}
void setup(){
  Serial.begin(115200);pinMode(START,INPUT_PULLUP);
  raw=stable=digitalRead(START)==LOW;
  const byte pins[]={PWMA,PWMB,STBY,A1_PIN,A2_PIN,B1_PIN,B2_PIN};
  for(byte pin:pins)pinMode(pin,OUTPUT);
  stop();
  digitalWrite(A1_PIN,HIGH);digitalWrite(B1_PIN,HIGH);
  EEPROM.get(0,saved);calibrated=verify(saved);
  Serial.println(calibrated?F("Calibration loaded."):F("Capture W then B with wheels disabled."));
}
void loop(){
  if(Serial.available())command(Serial.read());
  const unsigned long now=millis();
  const bool pressed=digitalRead(START)==LOW;
  if(pressed!=raw){raw=pressed;changedAt=now;}
  if(raw!=stable&&now-changedAt>=35){
    stable=raw;
    if(stable){
      if(running)stop();
      else if(calibrated)running=true;
      else Serial.println(F("Calibrate before starting."));
    }
  }
  if(!running||now-sampledAt<12)return;
  sampledAt=now;
  int rawSample[CHANNELS],v[CHANNELS];
  capture(rawSample);
  for(byte i=0;i<CHANNELS;i++){
    long ratio=1000L*(rawSample[i]-saved.white[i])/(saved.black[i]-saved.white[i]);
    v[i]=constrain(ratio,0,1000);
  }
  if(max(v[0],max(v[1],v[2]))<MIN_STRENGTH){
    stop();Serial.println(F("LINE LOST. Reposition and press Start."));return;
  }
  int correction=STEER*(long)(v[2]-v[0])/(v[0]+v[1]+v[2]);
  analogWrite(PWMA,BASE+correction);
  analogWrite(PWMB,BASE-correction);
  digitalWrite(STBY,HIGH);
  if(now-reportedAt>=200){
    reportedAt=now;
    Serial.print(v[0]);Serial.print(',');Serial.print(v[1]);Serial.print(',');Serial.print(v[2]);Serial.print(F(" | correction "));Serial.println(correction);
  }
}
