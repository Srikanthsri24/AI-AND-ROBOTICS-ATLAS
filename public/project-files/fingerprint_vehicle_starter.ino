#include <Adafruit_Fingerprint.h>

constexpr byte START=2, SLEEP=4, PWM=5, GREEN=6, RED=7;
constexpr unsigned long WINDOW=5000, PULSE=650;
Adafruit_Fingerprint reader(&Serial1);
enum Capture { MATCH, FIRST, LIFT, SECOND };
Capture capture=MATCH;
bool ready=false, armed=false, running=false, denied=false, needsLift=false;
bool raw=HIGH,stable=HIGH;
unsigned long sensedAt=0,armedAt=0,started=0,changedAt=0,enrollAt=0;

void motorOff(){digitalWrite(SLEEP,LOW);analogWrite(PWM,0);running=false;}
bool startPressed(unsigned long now){
  bool value=digitalRead(START);
  if(value!=raw){raw=value;changedAt=now;}
  if(value==stable||now-changedAt<25)return false;
  stable=value;
  return stable==LOW;
}
bool sensorFault(byte result){
  if(result!=FINGERPRINT_PACKETRECIEVEERR)return false;
  ready=false;armed=false;denied=true;capture=MATCH;
  Serial.println(F("Reader unavailable"));
  return true;
}
void scan(){
  byte result=reader.getImage();
  if(sensorFault(result))return;
  if(capture==LIFT){
    if(result==FINGERPRINT_NOFINGER){capture=SECOND;needsLift=false;Serial.println(F("Scan the same finger again"));}
    return;
  }
  if(result==FINGERPRINT_NOFINGER){needsLift=false;return;}
  if(result!=FINGERPRINT_OK||needsLift)return;
  needsLift=true;
  if(capture==FIRST||capture==SECOND){
    const bool first=capture==FIRST;
    result=reader.image2Tz(first?1:2);
    if(sensorFault(result))return;
    if(result!=FINGERPRINT_OK){capture=MATCH;denied=true;Serial.println(F("Enrollment failed"));return;}
    if(first){capture=LIFT;Serial.println(F("Lift your finger"));return;}
    result=reader.createModel();
    if(sensorFault(result))return;
    if(result==FINGERPRINT_OK)result=reader.storeModel(1);
    if(sensorFault(result))return;
    denied=result!=FINGERPRINT_OK;capture=MATCH;
    Serial.println(denied?F("Enrollment failed"):F("Enrolled slot 1"));
    return;
  }
  armed=false;
  result=reader.image2Tz();
  if(sensorFault(result))return;
  if(result==FINGERPRINT_OK)result=reader.fingerFastSearch();
  if(sensorFault(result))return;
  if(result==FINGERPRINT_OK&&reader.fingerID==1){
    armed=true;armedAt=millis();denied=false;
    Serial.println(F("Authorized for five seconds"));
  }else{denied=true;Serial.println(F("Scan denied"));}
}
void setup(){
  pinMode(SLEEP,OUTPUT);pinMode(PWM,OUTPUT);motorOff();
  pinMode(START,INPUT_PULLUP);pinMode(GREEN,OUTPUT);pinMode(RED,OUTPUT);
  Serial.begin(115200);
  reader.begin(57600);
  ready=reader.verifyPassword();
  Serial.println(F("e: enroll slot 1; d: delete slot 1"));
}
void loop(){
  const unsigned long now=millis();
  if(running){
    if(digitalRead(START)==HIGH||now-started>=PULSE){motorOff();Serial.println(F("Starter off"));}
    return;
  }
  const bool request=startPressed(now);
  if(armed&&now-armedAt>=WINDOW)armed=false;
  if(capture!=MATCH&&now-enrollAt>=25000){capture=MATCH;denied=true;Serial.println(F("Enrollment timed out"));}
  if(Serial.available()){
    char key=Serial.read();
    if(ready&&(key=='e'||key=='d')){
      armed=false;denied=false;needsLift=true;
      if(key=='e'){capture=FIRST;enrollAt=now;Serial.println(F("Lift any finger, then scan the test finger"));}
      else{
        capture=MATCH;
        const byte result=reader.deleteModel(1);
        if(!sensorFault(result))Serial.println(result==FINGERPRINT_OK?F("Deleted slot 1"):F("Delete failed"));
      }
    }
  }
  if(request&&armed&&capture==MATCH){
    armed=false;
    ready=reader.verifyPassword();
    if(ready&&millis()-armedAt<WINDOW&&digitalRead(START)==LOW){
      digitalWrite(SLEEP,HIGH);delayMicroseconds(1500);analogWrite(PWM,125);
      started=millis();running=true;
      digitalWrite(GREEN,LOW);
      Serial.println(F("Starter pulse"));
      return;
    }
  }
  if(now-sensedAt>=160){
    sensedAt=now;
    if(!ready)ready=reader.verifyPassword();
    else scan();
  }
  digitalWrite(GREEN,armed);digitalWrite(RED,denied||!ready);
}
