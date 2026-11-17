import type { Build } from './guided-projects';

export const greenhouse={dry:34,fanOn:29,fanOff:26,pulseMs:1400,soakMs:12000};
export const smartGreenhouse:Build={
 id:'directory-37',title:'Smart greenhouse system (IoT Smart Greenhouse Kit)',
 outcome:'Build a model greenhouse that ventilates when warm, waters in measured pulses when dry, and reports its readings on a local Ethernet dashboard.',
 parts:[
 ['Arduino Uno R3','1','Samples the two analog sensors and runs the control loops.'],
 ['Arduino Ethernet Shield 2','1','Serves the greenhouse readings on a private bench connection. Use an Ethernet cable and a computer with an Ethernet port or adapter.'],
 ['SEN0193 capacitive soil probe','1','Measures relative moisture near the roots. Calibrate against two soil samples.'],
 ['TMP36 analog temperature sensor','1','Measures air temperature in the shade inside the greenhouse.'],
 ['5 V peristaltic pump with tubing','1','Delivers short pulses of water from a small reservoir.'],
 ['5 V two-wire cooling fan','1','Exhausts warm air through a guarded vent.'],
 ['STEMMA MOSFET driver and lead','2 each','One switches the pump, the other switches the fan. Use the driver’s protected outputs.'],
 ['Regulated 5 V pump supply and adapter','1 each','Supplies both loads. Verify its current rating against the combined demand.'],
 ['Breadboard and jumper wires','1 set','Provides dry-area signal connections and common ground. Use USB for the Uno.'],
 ],
 assembly:[
 ['Build the enclosure','Make a small ventilated box with a clear side panel, a removable plant pot and a drip tray. Cut a guarded vent high on one side, and leave an intake opening low on the opposite side. Mount the fan to exhaust air. Set the Uno and drivers outside the tray.','Air has a path across the enclosure. The pump outlet drips into the pot without reaching the electrical area.',[4,5]],
 ['Place and calibrate the sensors','Insert the sensing area of the SEN0193 into soil up to the probe’s insertion mark. Keep the connector dry. Mount the TMP36 in shaded air away from the fan motor. With its flat face toward you and pins down, use the left pin for 5 V, center for A1, and right for GND. Measure the same potting mix at a dry reference and after watering and draining. Set DRY_ADC and WET_ADC to those readings.','The dry ADC reading is higher than the wet reading. The dashboard shows a relative index for this soil and probe.',[0,2,3]],
 ['Wire the fan, pump and shield','Disconnect USB and the independent 5 V supply. Stack Ethernet Shield 2, connect both sensors and share the Uno ground with both driver boards. Give each load its own driver. Position the tube inlet in a small water container, and the outlet over the pot. Use a limited cup for the first watering trials.','The Uno supplies logic power only. Both loads get 5 V from the separate motor supply.',[0,1,4,5,6,7,8]],
 ['Run control and telemetry trials','Upload the sketch with the load supply off. Connect the shield directly to a bench computer and set the computer’s Ethernet IPv4 address to 192.168.4.10 with subnet mask 255.255.255.0 and no gateway on that interface. Open http://192.168.4.20. Restore load power only after checking the readings.','Dry soil starts a short pulse, then a soak pause. Temperature has different fan-on and fan-off points. Disconnecting Ethernet stops updates at the computer while local control continues.',[0,1,2,3,4,5]],
 ],
 wiring:[
 ['Uno 5 V and GND','SEN0193 VCC/GND and TMP36 supply/ground','Sensor power'],
 ['SEN0193 signal','Uno A0','Analog moisture reading'],
 ['TMP36 center pin on the TO-92 package','Uno A1','Analog temperature'],
 ['Uno D5 and D6','Pump driver SIG and fan driver SIG respectively','Actuator commands'],
 ['External 5 V and negative','Both drivers V+ and GND; tie negative to Uno GND','Load power and common reference'],
 ['Pump and fan leads','Respective driver OUT+ and OUT−','Switched outputs'],
 ['Ethernet Shield 2 RJ45','Bench computer Ethernet','Private dashboard connection'],
 ['Shield D4 and D10–D13','Reserved for SD select and Ethernet SPI','Use other pins for control'],
 ],
 test:'At 115200 baud record dry and wet soil ADC counts first. Verify the fan starts at 29 °C and stays on until 26 °C or less. With a supervised dry-soil trial, observe a 1.4-second pump pulse followed by a 12-second soak pause. Refresh the local page and compare it with Serial Monitor. Unplug Ethernet and confirm the controls keep running on the Uno.',
 demo:['Greenhouse conditions','Mostly wet and cool','Dry or hot','Load off','Pump pulse or fan on'],
};

export const smartGreenhouseProgram={
 filename:'smart_greenhouse.ino',
 setup:'Install the Arduino Ethernet library. Keep the pump and fan supply off during upload and soil calibration. Use the direct private Ethernet connection described in Assembly. The Uno page refreshes every two seconds and provides readings only.',
 source:String.raw`#include <SPI.h>
#include <Ethernet.h>
const byte PUMP=5, FAN=6, SOIL=A0, TEMP=A1;
const int DRY_ADC=570, WET_ADC=300;
const int DRY_INDEX=${greenhouse.dry}, FAN_ON=${greenhouse.fanOn}, FAN_OFF=${greenhouse.fanOff};
const unsigned long PULSE_MS=${greenhouse.pulseMs}, SOAK_MS=${greenhouse.soakMs};
byte mac[]={0x02,0x41,0x54,0x4C,0x41,0x37};
EthernetServer dashboard(80);
EthernetClient client;
unsigned long sampled=0, wateringAt=0, soakAt=0, connectedAt=0;
int raw=0, moisture=0, lineBytes=0, requestBytes=0;
float celsius=0;
bool pump=false, fan=false, soak=false, valid=false;

void control(unsigned long now){
  if(pump && now-wateringAt>=PULSE_MS){ pump=false; soak=true; soakAt=now; }
  if(soak && now-soakAt>=SOAK_MS) soak=false;
  if(now-sampled>=250){
    sampled=now;
    raw=analogRead(SOIL);
    const int t=analogRead(TEMP);
    celsius=(t*5.0f/1023.0f-.5f)*100.0f;
    valid=raw>30 && raw<920 && celsius>-5 && celsius<60;
    moisture=constrain(map(raw,DRY_ADC,WET_ADC,0,100),0,100);
    if(!valid){
      if(pump){ soak=true; soakAt=now; }
      pump=false; fan=false;
    }else{
      if(celsius>=FAN_ON) fan=true;
      if(celsius<=FAN_OFF) fan=false;
      if(!pump && !soak && moisture<=DRY_INDEX){ pump=true; wateringAt=now; }
    }
    Serial.print(F("Soil ADC ")); Serial.print(raw);
    Serial.print(F(" | Index ")); Serial.print(moisture);
    Serial.print(F(" | C ")); Serial.println(celsius,1);
  }
  digitalWrite(PUMP,pump); digitalWrite(FAN,fan);
}

void reply(){
  client.println(F("HTTP/1.1 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nConnection: close\r\nCache-Control: no-store\r\n"));
  client.print(F("<!doctype html><meta charset=utf-8><meta name=viewport content='width=device-width'><meta http-equiv=refresh content=2><title>Greenhouse readings</title><style>body{background:#eef5ef;color:#183729;font:18px system-ui;margin:3rem auto;padding:0 1rem;max-width:36rem}dt{font-weight:bold}dd{margin:0 0 1em}</style><h1>Greenhouse readings</h1><dl>"));
  if(valid){
    client.print(F("<dt>Relative soil index</dt><dd>")); client.print(moisture);
    client.print(F(" / 100</dd><dt>Air temperature</dt><dd>")); client.print(celsius,1); client.print(F(" C</dd>"));
  }else client.print(F("<dt>Sensor readings</dt><dd>Outside the expected bench range</dd>"));
  client.print(F("<dt>Pump</dt><dd>")); client.print(pump?F("Watering"):soak?F("Soaking"):F("Off"));
  client.print(F("</dd><dt>Fan</dt><dd>")); client.print(fan?F("On"):F("Off"));
  client.println(F("</dd></dl>"));
}
void network(unsigned long now){
  if(!client){
    client=dashboard.accept();
    if(!client) return;
    client.setConnectionTimeout(60);
    connectedAt=now; lineBytes=0; requestBytes=0;
  }
  if(!client.connected() || now-connectedAt>350 || requestBytes>700){ client.stop(); return; }
  for(byte i=0;i<48 && client.available();++i){
    const int ch=client.read(); ++requestBytes;
    if(ch=='\n'){
      if(lineBytes==0){ reply(); client.stop(); return; }
      lineBytes=0;
    }else if(ch!='\r') ++lineBytes;
  }
}
void setup(){
  pinMode(PUMP,OUTPUT); pinMode(FAN,OUTPUT);
  pinMode(4,OUTPUT); digitalWrite(4,HIGH);
  Serial.begin(115200);
  Ethernet.init(10);
  Ethernet.begin(mac,IPAddress(192,168,4,20),IPAddress(0,0,0,0),IPAddress(0,0,0,0),IPAddress(255,255,255,0));
  dashboard.begin();
}
void loop(){
  const unsigned long now=millis();
  control(now); network(now);
}
`,
};
