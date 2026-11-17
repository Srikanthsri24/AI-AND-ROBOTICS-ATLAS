constexpr byte input=A0,lamp=8;
constexpr int darkOn=360,brightOff=460;
static_assert(darkOn<brightOff,"The dark-on threshold must be below bright-off.");
bool lit=false;
unsigned long sampled=0;
void setup(){
  pinMode(lamp,OUTPUT);
  digitalWrite(lamp,LOW);
  Serial.begin(115200);
}
void loop(){
  if(millis()-sampled<100)return;
  sampled=millis();
  unsigned int total=0;
  for(byte i=0;i<8;i++) total+=analogRead(input);
  const int raw=total/8;
  if(raw<=darkOn) lit=true;
  if(raw>=brightOff) lit=false;
  digitalWrite(lamp,lit);
  Serial.print(F("A0="));Serial.print(raw);
  Serial.println(lit?F(" | Lamp ON"):F(" | Lamp OFF"));
}
