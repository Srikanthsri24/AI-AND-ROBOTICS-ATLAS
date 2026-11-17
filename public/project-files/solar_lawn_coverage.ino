constexpr byte PWMA=3,PWMB=5,STBY=12,START=2;
constexpr byte AIN1=4,AIN2=7,BIN1=8,BIN2=11;
constexpr unsigned long STRAIGHT_MS=2400,SHIFT_MS=480,TURN_LEFT_MS=380,TURN_RIGHT_MS=380;
constexpr int LIGHT_START=460,LIGHT_STOP=405; // ADC counts at midpoint; check against your reference.
constexpr byte STRIPS=5;
enum Phase { STRAIGHT, TURN_FIRST, SHIFT, TURN_SECOND, COMPLETE };
Phase phase=STRAIGHT;
byte strip=0;
bool running=false,raw=false,stable=false;
unsigned long elapsed=0,previous=0,changedAt=0;

void idleDrive() {
  digitalWrite(STBY,LOW);
  digitalWrite(LED_BUILTIN,LOW);
}
void motor(byte p1,byte p2,byte pwm,int value) {
  digitalWrite(p1,value>0);
  digitalWrite(p2,value<0);
  analogWrite(pwm,abs(value));
}
void drive(int left,int right) {
  motor(AIN1,AIN2,PWMA,left);
  motor(BIN1,BIN2,PWMB,right);
  digitalWrite(STBY,HIGH);
  digitalWrite(LED_BUILTIN,phase==STRAIGHT);
}
void setup() {
  Serial.begin(115200);
  pinMode(START,INPUT_PULLUP);
  raw=stable=digitalRead(START)==LOW;
  const byte outputs[]={PWMA,PWMB,STBY,AIN1,AIN2,BIN1,BIN2,LED_BUILTIN};
  for(byte pin:outputs) pinMode(pin,OUTPUT);
  idleDrive();
  previous=millis();
  Serial.println(F("Start strip 1 in bright light."));
}
void loop() {
  const unsigned long now=millis(),dt=now-previous;
  previous=now;
  const int level=analogRead(A0);
  if(running) elapsed+=dt;
  if(running&&level<LIGHT_STOP) {
    running=false;
    idleDrive();
    Serial.println(F("Shade pause. Restore light and press Start."));
  }
  const bool pressed=digitalRead(START)==LOW;
  if(pressed!=raw){raw=pressed;changedAt=now;}
  if(raw!=stable&&now-changedAt>=35) {
    stable=raw;
    if(stable) {
      if(running){running=false;idleDrive();Serial.println(F("Paused"));}
      else if(phase!=COMPLETE&&level>=LIGHT_START) {running=true;Serial.println(F("Drive enabled"));}
      else if(phase==COMPLETE) Serial.println(F("Finished. Reposition at start and reset to rerun."));
      else Serial.println(F("More light needed."));
    }
  }
  if(!running)return;
  const bool turnRight=(strip%2)==0;
  const unsigned long turnMs=turnRight?TURN_RIGHT_MS:TURN_LEFT_MS;
  const unsigned long duration=phase==STRAIGHT?STRAIGHT_MS:phase==SHIFT?SHIFT_MS:turnMs;
  if(elapsed>=duration) {
    elapsed=0;
    if(phase==STRAIGHT){
      Serial.print(F("Completed strip "));Serial.println(strip+1);
      phase=strip+1==STRIPS?COMPLETE:TURN_FIRST;
    }else if(phase==TURN_FIRST)phase=SHIFT;
    else if(phase==SHIFT)phase=TURN_SECOND;
    else {++strip;phase=STRAIGHT;}
  }
  if(phase==COMPLETE){running=false;idleDrive();Serial.println(F("Coverage sequence complete."));}
  else if(phase==STRAIGHT||phase==SHIFT)drive(87,87);
  else if(turnRight)drive(94,-94);
  else drive(-94,94);
}
