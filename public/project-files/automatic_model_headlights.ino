constexpr byte LOW_LEFT=5,LOW_RIGHT=6,HIGH_LEFT=9,HIGH_RIGHT=10,OVERRIDE=2;
constexpr int NIGHT=320,DAY=420,GLARE=650,CLEAR=530;
constexpr unsigned long RECOVER_MS=900;
bool dark=false,glare=false,waiting=false;
unsigned long clearAt=0,reportedAt=0;

int sample(byte pin){
  analogRead(pin);
  int total=0;
  for(byte i=0;i<4;i++)total+=analogRead(pin);
  return total/4;
}
void setup(){
  Serial.begin(115200);
  pinMode(OVERRIDE,INPUT_PULLUP);
  const byte pins[]={LOW_LEFT,LOW_RIGHT,HIGH_LEFT,HIGH_RIGHT};
  for(byte pin:pins){pinMode(pin,OUTPUT);digitalWrite(pin,LOW);}
}
void loop(){
  const unsigned long now=millis();
  const int ambient=sample(A0),front=sample(A1);
  if(ambient<=NIGHT)dark=true;
  else if(ambient>=DAY)dark=false;
  if(front>=GLARE)glare=true;
  else if(front<=CLEAR)glare=false;
  const bool manual=digitalRead(OVERRIDE)==LOW;
  if(!dark||glare||manual)waiting=false;
  else if(!waiting){waiting=true;clearAt=now;}
  const bool hi=waiting&&now-clearAt>=RECOVER_MS;
  const bool lo=manual||(dark&&!hi);
  digitalWrite(LOW_LEFT,lo);digitalWrite(LOW_RIGHT,lo);
  digitalWrite(HIGH_LEFT,hi);digitalWrite(HIGH_RIGHT,hi);
  if(now-reportedAt>=220){
    reportedAt=now;
    Serial.print(ambient);Serial.print(',');
    Serial.print(front);Serial.print(',');
    Serial.println(hi?F("HIGH"):lo?F("LOW"):F("OFF"));
  }
  delay(12);
}
