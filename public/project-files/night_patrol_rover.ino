// Night patrol classroom rover. Select Arduino Uno in the Arduino IDE.
#include <EEPROM.h>
const byte CALL=2, START=10, LEFT_PWM=5, RIGHT_PWM=6, ENABLE=12;
const byte RED=3, GREEN=A5, PIEZO=A4;
const byte directionPins[]={4,7,8,11};
const byte routePins[]={A0,A1,A2};
const int DARK=320, LIGHT=420;
struct Calibration { uint16_t signature; int white[3]; int black[3]; };
Calibration calibration;
enum Mode { PARKED, PATROL, HELP };
Mode mode=PARKED;
bool dark=false;
unsigned long lastCall=0, lastStart=0, lastRead=0;
bool heldCall=false, heldStart=false, whiteTaken=false;

void stopDrive(){
  digitalWrite(ENABLE,LOW);
  analogWrite(LEFT_PWM,0); analogWrite(RIGHT_PWM,0);
}
bool pressed(byte pin,bool &held,unsigned long &last,unsigned long now){
  bool down=digitalRead(pin)==LOW;
  if(down==held||now-last<35)return false;
  held=down;
  last=now;
  return down;
}
void capture(int *destination){
  for(byte i=0;i<3;i++){
    int sum=0;
    for(byte j=0;j<12;j++)sum+=analogRead(routePins[i]);
    destination[i]=sum/12;
  }
}
void setup(){
  pinMode(CALL,INPUT_PULLUP); pinMode(START,INPUT_PULLUP);
  for(byte pin: directionPins)pinMode(pin,OUTPUT);
  pinMode(LEFT_PWM,OUTPUT); pinMode(RIGHT_PWM,OUTPUT); pinMode(ENABLE,OUTPUT);
  pinMode(RED,OUTPUT); pinMode(GREEN,OUTPUT); pinMode(PIEZO,OUTPUT);
  digitalWrite(4,HIGH); digitalWrite(8,HIGH); stopDrive();
  EEPROM.get(0,calibration);
  Serial.begin(115200);
  Serial.println(F("W: capture white card. B: capture black tape reference."));
}
void loop(){
  const unsigned long now=millis();
  const bool call=pressed(CALL,heldCall,lastCall,now);
  const bool start=pressed(START,heldStart,lastStart,now);
  const int ambient=analogRead(A3);
  dark=ambient<=DARK || (ambient<LIGHT && dark);
  if(call){
    mode=HELP;
    stopDrive();
    Serial.println(F("Local help requested"));
  }else if(start){
    if(mode==HELP || mode==PATROL){
      mode=PARKED;
      stopDrive();
    }else if(dark && calibration.signature==0x584E)mode=PATROL;
  }
  if(Serial.available() && mode==PARKED){
    const char command=Serial.read();
    if(command=='W'){
      capture(calibration.white);
      whiteTaken=true; calibration.signature=0;
      Serial.println(F("White captured"));
    }
    if(command=='B'&&whiteTaken){
      capture(calibration.black);
      bool valid=true;
      for(byte i=0;i<3;i++) if(abs(calibration.black[i]-calibration.white[i])<80)valid=false;
      if(valid){ calibration.signature=0x584E; EEPROM.put(0,calibration); }
      Serial.println(valid?F("Calibration saved"):F("Low contrast: check sensor height and repeat W then B"));
    }
    if(command=='L')Serial.println(ambient);
  }
  const bool alarm=mode==HELP && (now/250)%2==0;
  digitalWrite(RED,alarm);
  static bool sounding=false;
  if(alarm!=sounding){
    sounding=alarm;
    if(sounding)tone(PIEZO,1800); else noTone(PIEZO);
  }
  if(mode==PATROL && !dark){mode=PARKED;stopDrive();}
  if(mode==PATROL && now-lastRead>=25){
    lastRead=now;
    int strength[3];
    for(byte i=0;i<3;i++){
      const int raw=analogRead(routePins[i]);
      strength[i]=constrain(map(raw,calibration.white[i],calibration.black[i],0,100),0,100);
    }
    const int total=strength[0]+strength[1]+strength[2];
    if(max(strength[0],max(strength[1],strength[2]))<22){mode=PARKED;stopDrive();}
    else{
      const int turn=74*(strength[2]-strength[0])/total;
      analogWrite(LEFT_PWM,92+turn);
      analogWrite(RIGHT_PWM,92-turn);
      digitalWrite(ENABLE,HIGH);
    }
  }
  digitalWrite(GREEN,mode==PATROL);
}
