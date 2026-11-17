constexpr byte LEFT=2,RIGHT=3;
constexpr byte OUTPUTS[]={5,6,9};
constexpr byte LEVELS[]={0,85,170,255};
constexpr unsigned long WINDOW=650,CLEAR_TIME=70;
byte level=0,first=0;
bool armed=false,clearing=false;
unsigned long startedAt=0,clearAt=0;
void outputLevel(){
  for(byte pin:OUTPUTS)analogWrite(pin,LEVELS[level]);
  Serial.print(F("Level "));Serial.println(level);
}
void setup(){
  pinMode(LEFT,INPUT_PULLUP);pinMode(RIGHT,INPUT_PULLUP);
  for(byte pin:OUTPUTS)pinMode(pin,OUTPUT);
  Serial.begin(115200);
  outputLevel();
}
void loop(){
  const bool left=digitalRead(LEFT)==LOW,right=digitalRead(RIGHT)==LOW;
  const unsigned long now=millis();
  if(!armed){
    if(left||right)clearing=false;
    else if(!clearing){clearing=true;clearAt=now;}
    else if(now-clearAt>=CLEAR_TIME){armed=true;first=0;clearing=false;}
  }else if(!first){
    if(left&&right){armed=false;Serial.println(F("Both broke together: ignored"));}
    else if(left||right){first=left?1:2;startedAt=now;Serial.println(left?F("Left first"):F("Right first"));}
  }else if(now-startedAt>WINDOW){
    armed=false;
    Serial.println(F("Incomplete swipe: ignored"));
  }else if((first==1&&right)||(first==2&&left)){
    level=constrain(int(level)+(first==1?1:-1),0,3);
    armed=false;
    outputLevel();
  }
  delay(5);
}
