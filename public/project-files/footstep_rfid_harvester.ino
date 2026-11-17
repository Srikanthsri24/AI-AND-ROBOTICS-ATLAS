#include <Wire.h>
#include <Adafruit_PN532.h>

constexpr byte LOAD=9, BUTTON=4, RED=6, GREEN=7, VOLTAGE=A0;
constexpr unsigned long ACCESS_MS=8000, LOAD_MS=180;
constexpr float MINIMUM=2.45;
Adafruit_PN532 reader(2,3);
byte enrolledId[10]={}, enrolledLength=0, misses=2;
bool readerReady=false, enroll=false, armed=false, pulsing=false;
bool previousRaw=HIGH, stable=HIGH, denied=false;
unsigned long changedAt=0, armedAt=0, startedAt=0, lastReport=0;

float storageVolts(){
  // Divider is 1:2. Adjust 5.0 using the measured USB-powered 5 V rail.
  return analogRead(VOLTAGE)*(10.0/1023.0);
}
bool pressed(unsigned long now){
  const bool raw=digitalRead(BUTTON);
  if(raw!=previousRaw){previousRaw=raw;changedAt=now;}
  if(raw==stable || now-changedAt<30)return false;
  stable=raw;
  return stable==LOW;
}
void setup(){
  pinMode(LOAD,OUTPUT);digitalWrite(LOAD,LOW);
  pinMode(BUTTON,INPUT_PULLUP);
  pinMode(RED,OUTPUT);pinMode(GREEN,OUTPUT);
  Serial.begin(115200);
  reader.begin();
  readerReady=reader.getFirmwareVersion() && reader.SAMConfig() &&
              reader.setPassiveActivationRetries(1);
  Serial.println(readerReady?F("Reader ready. Send e to enroll tag A."):F("Reader unavailable"));
}
void loop(){
  const unsigned long now=millis();
  const bool request=pressed(now);
  if(pulsing){
    if(now-startedAt<LOAD_MS)return;
    digitalWrite(LOAD,LOW);
    pulsing=false;
    Serial.println(F("Load pulse ended"));
  }
  if(armed && now-armedAt>=ACCESS_MS){armed=false;Serial.println(F("Authorization expired"));}
  if(now-lastReport>=400){
    lastReport=now;
    Serial.print(F("Storage V: "));Serial.println(storageVolts(),3);
  }
  while(Serial.available()){
    if(Serial.read()=='e' && readerReady){enroll=true;armed=false;denied=false;Serial.println(F("Present one tag"));}
  }
  if(request){
    if(!armed)Serial.println(F("No authorization"));
    else if(storageVolts()<MINIMUM)Serial.println(F("Charge below 2.45 V"));
    else{
      armed=false;pulsing=true;startedAt=millis();
      digitalWrite(LOAD,HIGH);
      Serial.println(F("Harvested load enabled"));
    }
  }
  digitalWrite(GREEN,armed);
  digitalWrite(RED,denied);
  if(pulsing || !readerReady)return;
  byte scanned[10]={}, length=0;
  if(!reader.readPassiveTargetID(PN532_MIFARE_ISO14443A,scanned,&length,65)){
    if(misses<2)++misses;
    return;
  }
  const bool fresh=misses>=2;
  misses=0;
  if(!fresh || length==0 || length>sizeof(enrolledId))return;
  if(enroll){
    memcpy(enrolledId,scanned,length);
    enrolledLength=length;enroll=false;
    Serial.println(F("Enrolled. Remove the tag."));
  }else if(enrolledLength==length && memcmp(enrolledId,scanned,length)==0){
    armed=true;armedAt=millis();denied=false;
    Serial.println(F("Authorized for 8 seconds"));
  }else{
    armed=false;denied=true;
    Serial.println(F("Tag denied"));
  }
}
