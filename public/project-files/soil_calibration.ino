constexpr byte probe=A0,dryLed=8;
int dry=-1,damp=-1;
unsigned long lastRead=0;
int sample() {
  int sum=0;
  for(byte i=0;i<8;i++) sum+=analogRead(probe);
  return sum/8;
}
void setup(){
  pinMode(dryLed,OUTPUT);
  digitalWrite(dryLed,LOW);
  Serial.begin(115200);
}
void loop(){
  if(millis()-lastRead<200)return;
  lastRead=millis();
  const int raw=sample();
  while(Serial.available()){
    const char command=Serial.read();
    if(command=='D') dry=raw;
    if(command=='W') damp=raw;
    if(command=='R') dry=damp=-1;
  }
  Serial.print(F("A0=")); Serial.print(raw);
  if(dry<0||damp<0||abs(dry-damp)<20){
    digitalWrite(dryLed,LOW);
    Serial.println(F(" | Need distinct dry and damp references"));
    return;
  }
  const long relative=constrain((long)(raw-dry)*100/(damp-dry),0L,100L);
  digitalWrite(dryLed,relative<50);
  Serial.print(F(" | Relative moisture="));Serial.print(relative);Serial.println(F("%"));
}
