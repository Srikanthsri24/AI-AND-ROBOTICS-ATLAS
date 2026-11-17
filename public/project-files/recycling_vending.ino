#include <Wire.h>
#include <Servo.h>
#include <Adafruit_APDS9960.h>
constexpr byte INTAKE=2;
const byte exits[]={3,4,5};
constexpr byte RETURN=2, LOCKED=0, RELEASED=35;
const byte directions[]={55,90,125};
Adafruit_APDS9960 colorSensor;
Servo gate, diverter;
enum Phase{IDLE,READING,ALIGNING,DROPPING,REARM,FAULT};
Phase phase=IDLE;
unsigned long phaseAt=0,clearAt=0;
bool clearing=false;
byte route=RETURN;
int points=0;

bool blocked(byte pin){return digitalRead(pin)==LOW;}
bool exitClear(){
  for(byte pin:exits)if(blocked(pin))return false;
  return true;
}
void startPhase(Phase next){phase=next;phaseAt=millis();}
void fault(){
  gate.write(LOCKED);
  startPhase(FAULT);
  Serial.println(F("Drop unconfirmed or wrong exit. Power down and inspect."));
}
byte classify(uint16_t r,uint16_t g,uint16_t b,uint16_t c){
  if(c<40||c>63000)return RETURN;
  if(100UL*b>135UL*max(r,g))return 0;
  if(100UL*g>135UL*max(r,b))return 1;
  return RETURN;
}
void setup(){
  Serial.begin(115200);
  pinMode(INTAKE,INPUT_PULLUP);
  for(byte pin:exits)pinMode(pin,INPUT_PULLUP);
  gate.write(LOCKED);gate.attach(9);
  diverter.write(directions[RETURN]);diverter.attach(10);
  Wire.begin();
  Wire.setWireTimeout(4000,true);
  if(!colorSensor.begin()){startPhase(FAULT);Serial.println(F("Color sensor unavailable."));return;}
  colorSensor.enableColor(true);
  startPhase(REARM);
}
void loop(){
  const unsigned long now=millis(),dt=now-phaseAt;
  if(phase==IDLE&&blocked(INTAKE)){
    if(!exitClear()){fault();return;}
    startPhase(READING);
  }else if(phase==READING&&dt>=220){
    uint16_t r=0,g=0,b=0,c=0;
    if(colorSensor.colorDataReady())colorSensor.getColorData(&r,&g,&b,&c);
    Serial.print(r);Serial.print(',');Serial.print(g);Serial.print(',');Serial.print(b);Serial.print(',');Serial.println(c);
    route=classify(r,g,b,c);
    diverter.write(directions[route]);
    startPhase(ALIGNING);
  }else if(phase==ALIGNING&&dt>=450){
    if(!exitClear()){fault();return;}
    gate.write(RELEASED);
    startPhase(DROPPING);
  }else if(phase==DROPPING){
    for(byte i=0;i<3;i++)if(i!=route&&blocked(exits[i])){fault();return;}
    if(blocked(exits[route])){
      gate.write(LOCKED);
      if(route!=RETURN)++points;
      Serial.print(F("Confirmed exit "));Serial.print(route+1);
      Serial.print(F(" | Points "));Serial.println(points);
      clearing=false;
      startPhase(REARM);
    }else if(dt>=1700)fault();
  }else if(phase==REARM){
    if(blocked(INTAKE)||!exitClear())clearing=false;
    else if(!clearing){clearing=true;clearAt=now;}
    else if(now-clearAt>=100){startPhase(IDLE);Serial.println(F("Ready for one sample."));}
  }
}
