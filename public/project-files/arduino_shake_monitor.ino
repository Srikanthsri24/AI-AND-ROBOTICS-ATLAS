#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>

constexpr byte RESET_PIN=2,GREEN=5,RED=6,PIEZO=9, ADDRESS=0x68;
constexpr byte WINDOW=10, HOLD=30, QUIET=50, BASE_SAMPLES=50;
constexpr float HIGH_G=.16, QUIET_G=.06, GRAVITY=9.80665;
Adafruit_MPU6050 sensor;
float baseline[3]={}, energy[WINDOW]={}, sum=0, magnitude=0;
byte position=0, highCount=0, quietCount=0, baseCount=0;
bool sensorReady=false, alarm=false, sounding=false;
bool resetRaw=HIGH,resetStable=HIGH;
unsigned long lastSample=0,lastRetry=0,changedAt=0,lastPlot=0;

void outputs(bool ready,bool fault,unsigned long now){
  const bool pulse=ready&&alarm&&(now/250)%2==0;
  digitalWrite(GREEN,ready&&!alarm);
  digitalWrite(RED,fault||pulse);
  if(pulse!=sounding){
    sounding=pulse;
    if(pulse)tone(PIEZO,1850);else noTone(PIEZO);
  }
}
bool resetPressed(unsigned long now){
  const bool raw=digitalRead(RESET_PIN);
  if(raw!=resetRaw){resetRaw=raw;changedAt=now;}
  if(raw==resetStable||now-changedAt<30)return false;
  resetStable=raw;
  return raw==LOW;
}
void clearSamples(){
  baseCount=0;position=0;highCount=0;quietCount=0;
  sum=0;magnitude=0;
  memset(baseline,0,sizeof(baseline));
  memset(energy,0,sizeof(energy));
}
bool startSensor(){
  if(!sensor.begin(ADDRESS,&Wire,0))return false;
  sensor.setAccelerometerRange(MPU6050_RANGE_4_G);
  sensor.setFilterBandwidth(MPU6050_BAND_21_HZ);
  clearSamples();
  return true;
}
bool readAxes(float values[3]){
  Wire.beginTransmission(ADDRESS);
  if(Wire.endTransmission()!=0)return false;
  Wire.clearWireTimeoutFlag();
  sensors_event_t a,g,temp;
  if(!sensor.getEvent(&a,&g,&temp)||Wire.getWireTimeoutFlag())return false;
  values[0]=a.acceleration.x/GRAVITY;
  values[1]=a.acceleration.y/GRAVITY;
  values[2]=a.acceleration.z/GRAVITY;
  return isfinite(values[0])&&isfinite(values[1])&&isfinite(values[2]);
}
void acceptSample(const float values[3]){
  if(baseCount<BASE_SAMPLES){
    ++baseCount;
    for(byte i=0;i<3;i++)baseline[i]+=(values[i]-baseline[i])/baseCount;
    return;
  }
  float squared=0;
  for(byte i=0;i<3;i++){
    baseline[i]+=.035*(values[i]-baseline[i]);
    const float motion=values[i]-baseline[i];
    squared+=motion*motion;
  }
  sum+=squared-energy[position];energy[position]=squared;
  position=(position+1)%WINDOW;
  magnitude=sqrt(max(0.0f,sum/WINDOW));
  highCount=magnitude>=HIGH_G?min(HOLD,byte(highCount+1)):0;
  quietCount=magnitude<QUIET_G?min(QUIET,byte(quietCount+1)):0;
  if(highCount>=HOLD)alarm=true;
}
void setup(){
  pinMode(RESET_PIN,INPUT_PULLUP);
  pinMode(GREEN,OUTPUT);pinMode(RED,OUTPUT);pinMode(PIEZO,OUTPUT);
  Serial.begin(115200);
  Wire.begin();
  Wire.setWireTimeout(4000,true);
  sensorReady=startSensor();
}
void loop(){
  const unsigned long now=millis();
  const bool acknowledge=resetPressed(now);
  if(!sensorReady&&now-lastRetry>=750){
    lastRetry=now;
    sensorReady=startSensor();
  }
  if(sensorReady&&now-lastSample>=20){
    lastSample=now;
    float values[3];
    if(readAxes(values))acceptSample(values);
    else{sensorReady=false;lastRetry=now;clearSamples();}
  }
  if(acknowledge&&sensorReady&&quietCount>=QUIET)alarm=false;
  outputs(sensorReady&&baseCount>=BASE_SAMPLES,!sensorReady,now);
  if(now-lastPlot>=100){
    lastPlot=now;
    Serial.print(F("motion_g:"));Serial.print(magnitude,3);
    Serial.print(F(",threshold_g:"));Serial.print(HIGH_G,2);
    Serial.print(F(",alert:"));Serial.print(alarm?.30:0,2);
    Serial.print(F(",fault:"));Serial.println(sensorReady?0:.25,2);
  }
}
