constexpr byte sensor=A0, indicator=8;
constexpr float referenceVolts=5.0;
int setpoint=28;
bool alert=false;
unsigned long lastRead=0;

void setup(){
  pinMode(indicator,OUTPUT);
  Serial.begin(115200);
  Serial.println(F("+ increases setpoint, - decreases setpoint."));
}
void loop(){
  while(Serial.available()){
    const char command=Serial.read();
    if(command=='+') setpoint=min(setpoint+1,35);
    if(command=='-') setpoint=max(setpoint-1,18);
  }
  if(millis()-lastRead<250) return;
  lastRead=millis();
  unsigned int sum=0;
  for(byte count=0;count<16;count++) sum+=analogRead(sensor);
  const float voltage=(sum/16.0)*referenceVolts/1023.0;
  const float temperature=(voltage-.5)*100;
  if(temperature>=setpoint) alert=true;
  if(temperature<=setpoint-1) alert=false;
  digitalWrite(indicator,alert);
  Serial.print(F("Temperature C: ")); Serial.print(temperature,1);
  Serial.print(F(" | Setpoint: ")); Serial.print(setpoint);
  Serial.println(alert?F(" | Warning ON"):F(" | Warning OFF"));
}
