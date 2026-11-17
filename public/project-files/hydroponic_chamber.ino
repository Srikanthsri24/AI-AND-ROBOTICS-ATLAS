#include <Wire.h>
#include <RTClib.h>
#include <Adafruit_SHT31.h>
#include <Adafruit_NeoPixel.h>
#include <stdio.h>

constexpr byte LEVEL=2, MAINTENANCE=3, PUMP=5, FAN=6, LAMP=9, PIXELS=8;
constexpr unsigned long WET_DELAY=1500;
RTC_DS3231 rtc;
Adafruit_SHT31 air;
Adafruit_NeoPixel pixels(PIXELS,LAMP,NEO_GRBW+NEO_KHZ800);
bool clockFound=false,airFound=false,paused=false,wetTracking=false,pumpOn=false,fanOn=false,lampOn=false;
bool rawButton=HIGH,stableButton=HIGH;
unsigned long buttonAt=0,wetSince=0,lastClimate=0,lastReport=0;
float celsius=NAN,humidity=NAN;
int minute=-1;
char line[40]={};
byte used=0;
bool tooLong=false;

bool present(byte address){
  Wire.beginTransmission(address);
  return Wire.endTransmission()==0;
}
void setLamp(bool on){
  lampOn=on;
  pixels.fill(on?pixels.Color(0,0,0,140):0);
  pixels.show();
}
void setClock(){
  int year,month,day,hour,mins;
  char extra;
  if(sscanf(line,"T %d-%d-%d %d:%d %c",&year,&month,&day,&hour,&mins,&extra)!=5||
     year<2000||year>2099||month<1||month>12||day<1||day>31||
     hour<0||hour>23||mins<0||mins>59){
    Serial.println(F("Use T YYYY-MM-DD HH:MM"));return;
  }
  if(!clockFound||!present(0x68)){Serial.println(F("Clock unavailable"));return;}
  const DateTime moment(year,month,day,hour,mins,0);
  if(!moment.isValid()){Serial.println(F("Invalid calendar date"));return;}
  rtc.adjust(moment);Serial.println(F("Clock set"));
}
void readCommands(){
  for(byte budget=24;budget&&Serial.available();--budget){
    const char next=Serial.read();
    if(next=='\n'){
      line[used]=0;
      if(used&&!tooLong)setClock();
      used=0;tooLong=false;
    }else if(next!='\r'){
      if(used<sizeof(line)-1)line[used++]=next;
      else tooLong=true;
    }
  }
}
void setup(){
  pinMode(LEVEL,INPUT_PULLUP);pinMode(MAINTENANCE,INPUT_PULLUP);
  pinMode(PUMP,OUTPUT);pinMode(FAN,OUTPUT);
  digitalWrite(PUMP,LOW);digitalWrite(FAN,LOW);
  Serial.begin(115200);
  Wire.begin();Wire.setWireTimeout(4500,true);
  pixels.begin();pixels.clear();pixels.show();
  clockFound=rtc.begin();
  airFound=air.begin(0x44);
  Serial.println(F("Hydroponic chamber. Set clock with T YYYY-MM-DD HH:MM if needed."));
}
void loop(){
  const unsigned long now=millis();
  const bool raw=digitalRead(MAINTENANCE);
  if(raw!=rawButton){rawButton=raw;buttonAt=now;}
  if(raw!=stableButton&&now-buttonAt>=30){
    stableButton=raw;
    if(stableButton==LOW)paused=!paused;
  }
  const bool wet=digitalRead(LEVEL)==LOW;
  if(!wet||paused)wetTracking=false;
  else if(!wetTracking){wetTracking=true;wetSince=now;}
  pumpOn=wet&&!paused&&wetTracking&&now-wetSince>=WET_DELAY;
  digitalWrite(PUMP,pumpOn);
  readCommands();
  if(now-lastClimate>=500){
    lastClimate=now;
    if(!clockFound)clockFound=rtc.begin();
    minute=-1;
    if(clockFound&&present(0x68)&&!rtc.lostPower()){
      const DateTime value=rtc.now();
      if(value.isValid())minute=value.hour()*60+value.minute();
    }
    setLamp(minute>=360&&minute<1320);
    if(!airFound)airFound=air.begin(0x44);
    celsius=airFound&&present(0x44)?air.readTemperature():NAN;
    humidity=isfinite(celsius)?air.readHumidity():NAN;
    if(!isfinite(celsius)||celsius>=28)fanOn=true;
    else if(celsius<=25)fanOn=false;
    digitalWrite(FAN,fanOn);
  }
  if(now-lastReport>=1000){
    lastReport=now;
    Serial.print(F("Minute: "));Serial.print(minute);
    Serial.print(F(", temperature C: "));Serial.print(celsius,1);
    Serial.print(F(", humidity %: "));Serial.print(humidity,1);
    Serial.print(F(", level: "));Serial.print(wet?F("OK"):F("LOW"));
    Serial.print(F(", pump: "));Serial.print(pumpOn?F("ON"):F("OFF"));
    Serial.print(F(", fan: "));Serial.print(fanOn?F("ON"):F("OFF"));
    Serial.print(F(", light: "));Serial.println(lampOn?F("ON"):F("OFF"));
  }
}
