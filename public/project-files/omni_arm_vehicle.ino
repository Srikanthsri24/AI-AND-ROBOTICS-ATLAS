#include <Wire.h>
#include <Adafruit_MotorShield.h>
#include <Adafruit_PWMServoDriver.h>
#include <string.h>

Adafruit_MotorShield wheelShield(0x60);
Adafruit_PWMServoDriver servos(0x40);
Adafruit_DCMotor *wheel[4];
constexpr byte CHANNELS=6, MAX_STEPS=12;
constexpr int SPEED=95;
constexpr int NEUTRAL[CHANNELS]={1500,1500,1500,1500,1500,1500};
// Fit horns at neutral. Reverse individual channels here if a linkage is mirrored.
constexpr int SIGN[CHANNELS]={1,1,1,1,1,1};
int current[CHANNELS]={}, startPose[CHANNELS]={}, target[CHANNELS]={};
char input[MAX_STEPS+1]={}, queue[MAX_STEPS+1]={};
byte length=0, indexOfStep=0;
char active=0;
unsigned long started=0, lastServo=0, duration=0;
bool overflow=false, stowed=true, ready=false;

void drive(int f,int s,int turn){
  const int mix[]={f+s+turn,f-s-turn,f-s+turn,f+s-turn};
  for(byte i=0;i<4;i++){
    wheel[i]->setSpeed(min(255,abs(mix[i])*SPEED));
    wheel[i]->run(mix[i]>0?FORWARD:mix[i]<0?BACKWARD:RELEASE);
  }
}
void writePose(){
  for(byte i=0;i<CHANNELS;i++)
    servos.writeMicroseconds(i,constrain(NEUTRAL[i]+SIGN[i]*current[i],1150,1850));
}
bool isDrive(char step){
  return step && strchr("FBLRQE1234",step);
}
bool isArm(char step){
  return step && strchr("PCUTDOH",step);
}
void stopProgram(){
  if(ready)drive(0,0,0);
  if(isArm(active))stowed=false;
  active=0;queue[0]=0;indexOfStep=0;
}
bool beginStep(char step){
  if(isDrive(step)){
    if(!stowed){Serial.println(F("Stow arm with H before driving."));return false;}
    duration=700;
    switch(step){
      case 'F':drive(1,0,0);break;
      case 'B':drive(-1,0,0);break;
      case 'L':drive(0,-1,0);break;
      case 'R':drive(0,1,0);break;
      case 'Q':duration=550;drive(0,0,-1);break;
      case 'E':duration=550;drive(0,0,1);break;
      default:
        duration=350;
        drive(0,0,0);
        wheel[step-'1']->setSpeed(SPEED);
        wheel[step-'1']->run(FORWARD);
    }
  }else if(isArm(step)){
    drive(0,0,0);
    stowed=false;
    duration=800;
    memcpy(startPose,current,sizeof(current));
    memcpy(target,current,sizeof(current));
    switch(step){
      case 'P': target[0]=-260; target[1]=180; target[2]=220; target[3]=135; target[5]=0; break;
      case 'C': duration=550; target[5]=180; break;
      case 'U': duration=750; target[1]=-130; target[2]=115; target[3]=55; break;
      case 'T': target[0]=260; break;
      case 'D': duration=750; target[1]=180; target[2]=220; target[3]=135; break;
      case 'O': duration=550; target[5]=0; break;
      case 'H': memset(target,0,sizeof(target)); break;
    }
  }else return false;
  active=step;
  started=millis();
  lastServo=started;
  Serial.print(F("Step "));Serial.println(active);
  return true;
}
void submit(){
  if(overflow||!length){if(overflow)Serial.println(F("Invalid program or more than 12 steps."));return;}
  if(!ready||active||queue[0]){Serial.println(F("Busy or driver unavailable."));return;}
  input[length]=0;
  memcpy(queue,input,length+1);
  indexOfStep=0;
}
void setup(){
  Serial.begin(115200);
  Wire.begin();Wire.setWireTimeout(5000,true);
  const bool wheelsReady=wheelShield.begin();
  const bool armReady=servos.begin();
  for(byte i=0;i<4;i++)wheel[i]=wheelShield.getMotor(i+1);
  if(wheelsReady)drive(0,0,0);
  ready=wheelsReady&&armReady;
  if(ready){servos.setPWMFreq(50);writePose();}
  Serial.println(ready?F("Idle. Try 1-4, then RFPCUTDOH. ! stops.") : F("Driver unavailable."));
}
void loop(){
  while(Serial.available()){
    const char c=Serial.read();
    if(c=='!'){
      stopProgram();length=0;overflow=false;Serial.println(F("Stopped"));
      while(Serial.available())Serial.read();
      return;
    }
    if(c=='\n'){submit();length=0;overflow=false;}
    else if(c!='\r'&&c!=' '&&c!='\t'){
      const char key=(c>='a'&&c<='z')?c-'a'+'A':c;
      if(length==MAX_STEPS||(!isDrive(key)&&!isArm(key)))overflow=true;
      else input[length++]=key;
    }
  }
  if(!ready)return;
  if(!active&&queue[0]){
    const char next=queue[indexOfStep++];
    if(!next||!beginStep(next))stopProgram();
  }
  if(!active)return;
  const unsigned long now=millis();
  const unsigned long elapsed=min(duration,now-started);
  if(isArm(active)&&(now-lastServo>=20||elapsed==duration)){
    lastServo=now;
    for(byte i=0;i<CHANNELS;i++)current[i]=startPose[i]+long(target[i]-startPose[i])*long(elapsed)/long(duration);
    writePose();
  }
  if(elapsed==duration){
    if(isDrive(active))drive(0,0,0);
    if(active=='H')stowed=true;
    active=0;
  }
}
