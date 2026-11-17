// Standalone 5 V classroom prepaid meter and fault test fixture.
#include <Wire.h>
#include <Adafruit_INA219.h>

constexpr byte TOP_UP=2, RESET=3, GREEN=5, RED=6, SWITCH_PIN=9;
constexpr unsigned long PERIOD=100;
constexpr float CREDIT=0.30, DIFFERENCE=10.0, MAX_CREDIT=3.0;
Adafruit_INA219 upstream(0x40), billed(0x41);
bool upstreamReady=false, billedReady=false, alarm=false, enabled=false;
byte strikes=0;
float credit=0.0;
unsigned long lastSample=0,lastReport=0;
bool resetRequested=false;

struct Button {
  byte pin;
  bool raw=HIGH, stable=HIGH;
  unsigned long changed=0;
  Button(byte inputPin):pin(inputPin){}
  void begin(){pinMode(pin,INPUT_PULLUP);}
  bool pressed(unsigned long now){
    bool value=digitalRead(pin);
    if(value!=raw){raw=value;changed=now;}
    if(now-changed<30 || value==stable)return false;
    stable=value;
    return stable==LOW;
  }
};
Button topUp(TOP_UP), reset(RESET);

void setup(){
  pinMode(SWITCH_PIN,OUTPUT); digitalWrite(SWITCH_PIN,LOW);
  pinMode(GREEN,OUTPUT);pinMode(RED,OUTPUT);
  topUp.begin();reset.begin();
  Serial.begin(115200);
  Wire.begin();
  Wire.setWireTimeout(4000,true);
  upstreamReady=upstream.begin();
  billedReady=billed.begin();
  alarm=!upstreamReady||!billedReady;
  digitalWrite(RED,alarm);
  Serial.println(F("Prepaid meter. TOP UP +0.30 mWh. Hold TEST LOAD to inject a mismatch."));
}
void loop(){
  const unsigned long now=millis();
  if(topUp.pressed(now))credit=min(MAX_CREDIT,credit+CREDIT);
  if(reset.pressed(now))resetRequested=true;
  const unsigned long elapsed=now-lastSample;
  if(elapsed<PERIOD)return;
  lastSample=now;

  if(!upstreamReady)upstreamReady=upstream.begin();
  if(!billedReady)billedReady=billed.begin();
  float total=0, measured=0, bus=0;
  bool valid=upstreamReady&&billedReady;
  if(valid){
    total=upstream.getCurrent_mA();
    upstreamReady=upstream.success();
    measured=billed.getCurrent_mA();
    billedReady=billed.success();
    bus=billed.getBusVoltage_V();
    billedReady=billedReady&&billed.success();
    valid=upstreamReady&&billedReady&&isfinite(total)&&isfinite(measured)&&isfinite(bus);
  }
  if(valid&&enabled)credit=max(0.0f,credit-max(0.0f,measured)*max(0.0f,bus)*elapsed/3600000.0f);
  const bool mismatch=valid&&fabs(total-measured)>DIFFERENCE;
  if(mismatch){if(strikes<4)++strikes;}
  else strikes=0;
  if(!valid||strikes>=4)alarm=true;
  if(resetRequested){
    if(valid&&!mismatch){alarm=false;Serial.println(F("Alarm reset"));}
    else Serial.println(F("Reset refused. Clear test load and check both meters."));
    resetRequested=false;
  }
  enabled=valid&&!alarm&&credit>0;
  digitalWrite(SWITCH_PIN,enabled);digitalWrite(GREEN,enabled);digitalWrite(RED,alarm);
  if(now-lastReport>=500){
    lastReport=now;
    if(!valid)Serial.println(F("Meter unavailable. Billed output off."));
    else{
      Serial.print(F("Supply mA: "));Serial.print(total,1);
      Serial.print(F(", billed mA: "));Serial.print(measured,1);
      Serial.print(F(", credit mWh: "));Serial.print(credit,3);
      Serial.println(alarm?F(", ALARM"):enabled?F(", ON"):F(", OFF"));
    }
  }
}
