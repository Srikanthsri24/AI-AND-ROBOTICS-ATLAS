#include <Wire.h>
#include <HUSKYLENS.h>

constexpr byte BUTTON=2, SLEEP=4, LEFT=5, RIGHT=6, FAULT=7, TRIG=9, ECHO=10;
constexpr int NEAR_CM=18, RESUME_WIDTH=54, HOLD_WIDTH=66, MIN_WIDTH=12;
HUSKYLENS camera;
bool cameraReady=false, enabled=false, following=false, faultLatched=false;
bool buttonRaw=HIGH, buttonStable=HIGH;
byte goodFrames=0;
unsigned long buttonAt=0,lastCycle=0,lastLog=0;

void disableDrive(){
  digitalWrite(SLEEP,LOW);
  analogWrite(LEFT,0);
  analogWrite(RIGHT,0);
  following=false;
}
bool togglePressed(unsigned long now){
  bool raw=digitalRead(BUTTON);
  if(raw!=buttonRaw){buttonRaw=raw;buttonAt=now;}
  if(raw==buttonStable||now-buttonAt<30)return false;
  buttonStable=raw;
  return raw==LOW;
}
int getEcho(){
  digitalWrite(TRIG,LOW);delayMicroseconds(3);
  digitalWrite(TRIG,HIGH);delayMicroseconds(10);digitalWrite(TRIG,LOW);
  const unsigned long duration=pulseIn(ECHO,HIGH,8000);
  return duration?int(duration/58):-1;
}
void setup(){
  pinMode(SLEEP,OUTPUT);pinMode(LEFT,OUTPUT);pinMode(RIGHT,OUTPUT);
  disableDrive();
  pinMode(BUTTON,INPUT_PULLUP);pinMode(FAULT,INPUT_PULLUP);
  pinMode(TRIG,OUTPUT);pinMode(ECHO,INPUT);
  Serial.begin(115200);
  Wire.begin();Wire.setWireTimeout(3500,true);
  camera.setTimeOutDuration(28);
  cameraReady=camera.begin(Wire);
  Serial.println(F("Learn one patch as ID1 in Color Recognition. Press FOLLOW to enable."));
}
void loop(){
  const unsigned long now=millis();
  if(digitalRead(FAULT)==LOW){faultLatched=true;enabled=false;goodFrames=0;disableDrive();}
  if(togglePressed(now)){
    if(faultLatched){if(digitalRead(FAULT)==HIGH)faultLatched=false;}
    else enabled=!enabled;
    goodFrames=0;
    disableDrive();
  }
  if(now-lastCycle<70)return;
  lastCycle=now;
  const int echo=getEcho();
  int x=-1,width=0;
  if(!cameraReady)cameraReady=camera.begin(Wire);
  if(cameraReady&&camera.requestBlocks(1)&&camera.available()){
    const HUSKYLENSResult block=camera.read();
    // Require exactly one detected block with the trained ID.
    if(!camera.available()&&block.ID==1 && block.xCenter>=0&&block.xCenter<320){
      x=block.xCenter;width=block.width;
    }
  }
  const bool clear=echo>=NEAR_CM;
  const bool detected=x>=0&&width>=MIN_WIDTH;
  if(!enabled||!clear||!detected)goodFrames=0;
  else if(goodFrames<2)++goodFrames;
  if(!enabled||!clear||!detected||goodFrames<2||width>=(following?HOLD_WIDTH:RESUME_WIDTH)){
    disableDrive();
  }else{
    const int error=x-160;
    const int steer=abs(error)<12?0:constrain(error*3/4,-65,65);
    if(!following){digitalWrite(SLEEP,HIGH);delayMicroseconds(1500);}
    analogWrite(LEFT,115+steer);
    analogWrite(RIGHT,115-steer);
    following=true;
  }
  if(now-lastLog>=350){
    lastLog=now;
    Serial.print(F("X "));Serial.print(x);
    Serial.print(F(", width "));Serial.print(width);
    Serial.print(F(", echo cm "));Serial.print(echo);
    Serial.println(faultLatched?F(", motor fault"):following?F(", following"):F(", stopped"));
  }
}
