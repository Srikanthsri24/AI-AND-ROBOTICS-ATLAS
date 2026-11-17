constexpr byte warmPin=5,coldPin=6,stopPin=2;
constexpr unsigned long duration=2000;
unsigned long began=0;
bool running=false;

void stopPumps() {
  digitalWrite(warmPin,LOW);
  digitalWrite(coldPin,LOW);
  running=false;
}
void setup(){
  pinMode(warmPin,OUTPUT);
  pinMode(coldPin,OUTPUT);
  pinMode(stopPin,INPUT_PULLUP);
  stopPumps();
  Serial.begin(115200);
}
void loop(){
  const bool stopped=digitalRead(stopPin)==LOW;
  if(stopped||(running&&millis()-began>=duration)) stopPumps();
  while(Serial.available()){
    const char command=Serial.read();
    if(command=='S') { stopPumps(); Serial.println(F("Stopped")); }
    if((command=='W'||command=='C')&&!running&&!stopped){
      stopPumps();
      digitalWrite(command=='W'?warmPin:coldPin,HIGH);
      began=millis();
      running=true;
      Serial.println(command=='W'?F("Warm selected"):F("Cold selected"));
    }
  }
}
