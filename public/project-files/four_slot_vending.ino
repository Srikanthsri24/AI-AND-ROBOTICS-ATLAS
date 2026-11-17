#include <Servo.h>

constexpr byte TOKEN=2,CHUTE=3,COUNT=4;
const byte buttonPins[]={4,5,6,7}, servoPins[]={8,9,10,11};
const byte prices[]={1,2,2,3};
const byte REST[]={90,90,90,90}, OPEN[]={120,120,120,120};
byte stock[]={2,2,2,2}, credit=0;
constexpr unsigned long GATE_MS=650,TIMEOUT_MS=1600;
Servo gate[COUNT];
struct Input {
  bool raw=false, stable=false;
  unsigned long at=0;
  bool update(byte pin,unsigned long now) {
    const bool value=digitalRead(pin)==LOW;
    if(value!=raw){raw=value;at=now;}
    if(raw==stable||now-at<18)return false;
    stable=raw;
    return stable;
  }
  void init(byte pin){pinMode(pin,INPUT_PULLUP);raw=stable=digitalRead(pin)==LOW;}
};
Input token, chute, buttons[COUNT];
int lane=-1;
bool jam=false,latched=false,confirmed=false;
unsigned long started=0;
void setup(){
  Serial.begin(115200);
  token.init(TOKEN);chute.init(CHUTE);
  for(byte i=0;i<COUNT;i++){buttons[i].init(buttonPins[i]);gate[i].write(REST[i]);gate[i].attach(servoPins[i]);}
  Serial.println(F("Ready: load two cans per lane."));
}
void loop(){
  const unsigned long now=millis();
  if(token.update(TOKEN,now)){credit=min(12,int(credit)+1);Serial.print(F("Credit "));Serial.println(credit);}
  const bool passed=chute.update(CHUTE,now);
  if(lane>=0){
    if(passed)confirmed=true;
    if(!latched&&now-started>=GATE_MS){gate[lane].write(REST[lane]);latched=true;}
    if(confirmed&&latched){
      credit-=prices[lane];stock[lane]--;
      Serial.print(F("Dispensed lane "));Serial.println(lane+1);
      Serial.print(F("Credit "));Serial.println(credit);
      lane=-1;
    }else if(now-started>=TIMEOUT_MS){
      jam=true;lane=-1;
      Serial.println(F("No chute confirmation. Credit unchanged. Power down and inspect."));
    }
  }
  for(byte i=0;i<COUNT;i++){
    if(!buttons[i].update(buttonPins[i],now)||lane>=0)continue;
    if(jam)Serial.println(F("Dispense locked."));
    else if(chute.stable||chute.raw){jam=true;Serial.println(F("Chute blocked. Credit unchanged."));}
    else if(!stock[i])Serial.println(F("Lane empty."));
    else if(credit<prices[i])Serial.println(F("More credit needed."));
    else{
      lane=i;started=now;latched=confirmed=false;
      gate[i].write(OPEN[i]);
      Serial.print(F("Opening lane "));Serial.println(i+1);
    }
  }
}
