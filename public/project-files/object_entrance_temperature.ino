#include <Wire.h>
#include <Servo.h>
#include <Adafruit_MLX90614.h>
constexpr byte BEAM=2,GREEN=5,RED=6,GATE=9;
constexpr byte CLOSED=90,OPEN=40;
constexpr float LIMIT_C=30.0;
Adafruit_MLX90614 sensor;
Servo barrier;
enum State { READY, SETTLE, SAMPLE, RESULT };
State state=READY;
unsigned long phaseAt=0,sampledAt=0;
bool present=false, raw=false, sensorReady=false;
unsigned long changedAt=0;
float measurements[3];
byte count=0;

void closeGate(){
  barrier.write(CLOSED);
  digitalWrite(GREEN,LOW);digitalWrite(RED,LOW);
}
void result(bool pass,const __FlashStringHelper* message){
  barrier.write(pass?OPEN:CLOSED);
  digitalWrite(GREEN,pass);digitalWrite(RED,!pass);
  Serial.println(message);
  state=RESULT;
}
void setup(){
  Serial.begin(115200);
  pinMode(BEAM,INPUT_PULLUP);pinMode(GREEN,OUTPUT);pinMode(RED,OUTPUT);
  barrier.write(CLOSED);barrier.attach(GATE);closeGate();
  Wire.begin();
  Wire.setWireTimeout(4000,true);
  sensorReady=sensor.begin();
  Serial.println(F("Ready for a classroom test object."));
}
void loop(){
  const unsigned long now=millis();
  const bool blocked=digitalRead(BEAM)==LOW;
  if(blocked!=raw){raw=blocked;changedAt=now;}
  if(now-changedAt>=50)present=raw;
  if(!present){
    if(state!=READY){closeGate();state=READY;}
    return;
  }
  if(state==READY){phaseAt=now;state=SETTLE;return;}
  if(state==SETTLE&&now-phaseAt>=250){
    if(!sensorReady)sensorReady=sensor.begin();
    if(!sensorReady){result(false,F("No reading: sensor unavailable."));return;}
    count=0;sampledAt=now;state=SAMPLE;
    return;
  }
  if(state==SAMPLE&&now-sampledAt>=160){
    sampledAt=now;
    Wire.beginTransmission(0x5A);
    if(Wire.endTransmission()!=0){sensorReady=false;result(false,F("No reading: sensor unavailable."));return;}
    const float value=sensor.readObjectTempC();
    if(!isfinite(value)||value<0||value>60){
      result(false,F("No reading in classroom range."));return;
    }
    measurements[count++]=value;
    if(count==3){
      const float reading=measurements[0]+measurements[1]+measurements[2]
        -min(measurements[0],min(measurements[1],measurements[2]))
        -max(measurements[0],max(measurements[1],measurements[2]));
      Serial.print(F("Object C: "));Serial.println(reading,2);
      if(reading<LIMIT_C)result(true,F("Below classroom threshold."));
      else result(false,F("Warm test object."));
    }
  }
}
