import type { Build } from './guided-projects';

export const airWindow=4;
export const airExerciseThreshold=35;

export const classroomAir:Build={
 id:'directory-38',title:'Air quality monitor & RoboGenius 20-in-1 Master Kit',
 outcome:'Build a USB-powered particle monitor. Compare real PM2.5 samples with a scripted practice trace and see how a moving average responds.',
 parts:[
 ['Arduino Uno R3','1','Reads the optical sensor over I²C and computes a four-sample average.'],
 ['Adafruit PMSA003I I²C breakout','1','Draws air past a laser and reports environmental PM2.5 concentration. Use the Adafruit breakout with level shifting.'],
 ['Green and red LEDs with 220 Ω resistors','1 of each LED and 2 resistors','Green marks a fresh average below the classroom threshold. Red marks a fresh average at or above it.'],
 ['Breadboard and jumper wires','1 set','Join the I²C and indicator wiring. Use a USB data cable to program and power the Uno.'],
 ],
 assembly:[
 ['Select the classroom parts','Match the Uno, breakout, LEDs and resistors against the photographed list. Use the documented Uno wiring for this reference build. Retain the printed inventory for any separately supplied classroom kit.','Both boards and the two LED circuits are present. The particulate module is the PMSA003I breakout.',[0,1,2,3]],
 ['Mount the optical sensor','Set the breakout upright or flat on a low stand, giving both the inlet and exhaust open space. Keep the USB and I²C wires away from the vents.','Air can enter and leave the module. The board is reachable without touching either opening.',[1,3]],
 ['Wire I²C and status lights','Disconnect USB. Connect 5 V, ground, A4 and A5 to the breakout. Wire D6 and D7 through separate 220 Ω resistors to the red and green LEDs, and join both cathodes to ground.','The breakout shares ground with the Uno. Each indicator has its own resistor.',[0,1,2,3]],
 ['Compare fresh and missing samples','Upload the sketch and log ambient room readings. Then send l or h for the practice traces. Send f for a missing frame and observe both indicators turn off. Return to the live sensor with r. Use the practice trace for large changes in particle readings.','The average rises gradually, and both LEDs turn off while no valid frame is available.',[0,1,2]],
 ],
 wiring:[
 ['Uno 5 V and GND','PMSA003I breakout VIN and GND','Sensor power'],
 ['Uno A4 / SDA','PMSA003I SDA','I²C data'],
 ['Uno A5 / SCL','PMSA003I SCL','I²C clock'],
 ['Uno D6 through 220 Ω','Red LED anode','At or above the classroom threshold'],
 ['Uno D7 through 220 Ω','Green LED anode','Below the classroom threshold'],
 ['Both LED cathodes','Uno GND','Indicator return'],
 ],
 test:'Open Serial Monitor at 115200 baud. Give the sensor time to settle, then collect room-air readings. Send l and allow the 8 µg/m³ practice trace to fill the window. Send h and watch the average rise toward 54 µg/m³. Send f to clear the window and switch both LEDs off. Send r for live sampling again. The threshold is an exercise value.',
 demo:['Frame','Fresh','Missing','Status indicates average','Status lights go off'],
};

export const classroomAirProgram={
 filename:'classroom_pm_monitor.ino',
 setup:'Install Adafruit PM25 AQI Sensor in Arduino Library Manager with Adafruit BusIO. Connect the PMSA003I breakout over I²C, upload for Arduino Uno, and use 115200 baud. The l, h and f commands select practice inputs, and r returns to live sampling.',
 source:`#include <Wire.h>
#include <Adafruit_PM25AQI.h>
Adafruit_PM25AQI sensor;
const byte RED=6, GREEN=7, WINDOW=${airWindow};
const uint16_t LIMIT=${airExerciseThreshold};
uint16_t readings[WINDOW]={};
uint32_t sum=0;
byte count=0, indexAt=0;
char mode='r';
bool available=false, simulated=false;
unsigned long sampled=0;
void setup(){
  pinMode(RED,OUTPUT); pinMode(GREEN,OUTPUT);
  Serial.begin(115200);
  available=sensor.begin_I2C();
  Serial.println(F("r=room air, l=low practice, h=high practice, f=missing frame"));
}
void clearWindow(){
  for(byte i=0;i<WINDOW;++i) readings[i]=0;
  indexAt=0; count=0; sum=0;
  digitalWrite(RED,LOW); digitalWrite(GREEN,LOW);
}
void loop(){
  if(Serial.available()){
    const char key=Serial.read();
    if(key=='r'||key=='l'||key=='h'||key=='f'){
      const bool practice=key!='r';
      if(practice!=simulated) clearWindow();
      if(key=='r' && !available) available=sensor.begin_I2C();
      simulated=practice; mode=key;
    }
  }
  if(millis()-sampled<1000) return;
  sampled=millis();
  PM25_AQI_Data frame;
  uint16_t pm=0;
  if(mode=='l') pm=8;
  else if(mode=='h') pm=54;
  else if(mode=='f'||!available||!sensor.read(&frame)){
    clearWindow(); Serial.println(F("No fresh frame")); return;
  }else pm=frame.pm25_env;
  sum-=readings[indexAt]; readings[indexAt]=pm; sum+=pm;
  indexAt=(indexAt+1)%WINDOW;
  if(count<WINDOW) ++count;
  const uint16_t mean=sum/count;
  digitalWrite(RED,mean>=LIMIT); digitalWrite(GREEN,mean<LIMIT);
  Serial.print(simulated?F("Practice "):F("Room air "));
  Serial.print(pm); Serial.print(F(" ug/m3 | average ")); Serial.println(mean);
}
`,
};
