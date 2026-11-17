import type { Build } from './guided-projects';

export const tapLimits={startMin:4,startMax:13,holdMax:17,clearMin:20,maxMs:4000,sampleMs:70,confirm:3};
export const automaticTap:Build={
  id:'directory-27',
  title:'Arduino Automatic Tap System',
  outcome:'Build a tabletop recirculating tap that runs while a hand is in range, stops when the reservoir is low, and limits each run to four seconds.',
  parts:[
    ['Arduino Uno R3','1','Checks the hand distance, reservoir input and maximum run timer.'],
    ['HC-SR04 ultrasonic module','1','Measures the distance to a hand or a return target under the spout. Keep its face above splashes.'],
    ['SEN0485 capacitive level sensor','1','Mounts outside a thin non-metal tank wall. It pulls its signal LOW when water reaches the sensor.'],
    ['5 V peristaltic pump with tubing','1','Moves water inside its silicone tube from the reservoir to the spout. The motor mounts in the dry area.'],
    ['STEMMA MOSFET driver and lead','1 each','Switches the pump current and handles the motor’s switch-off transient with its onboard diode.'],
    ['Regulated 5 V pump supply and adapter','1 each','Powers the pump independently. Use a regulated 5 V supply and a matching low-voltage terminal adapter.'],
    ['Breadboard and jumper wires','1 set','Joins the control wiring and shared ground. A USB data cable powers and programs the Uno.'],
  ],
  assembly:[
    ['Build the recirculating basin','Set a shallow basin above a transparent, thin-walled plastic reservoir and provide a gravity return through a drain or funnel. Secure the inlet tube below the minimum water line and direct the outlet tube down into the basin. Mount the pump and electronics outside the splash area.','Pour a little water into the basin with the electronics unpowered. It returns to the reservoir without leaking onto the work surface.',[2,3]],
    ['Fit the two sensors','Mount the HC-SR04 facing down beside the spout, high enough to stay dry. Add a flat echo target about 26 cm below it, offset from the stream. Fix the level sensor flat against the reservoir wall above the inlet so it signals low water before the intake is exposed. The wall should be at most 3 mm thick.','An empty basin gives a clear echo. The reservoir sensor changes from HIGH to LOW as water rises past it.',[0,1,2]],
    ['Wire pump power and control','Disconnect both supplies. Connect the pump to the driver output terminals and the independent 5 V supply to driver V+ and GND. Join driver GND to the Uno. Connect D9 to SIG and wire both sensors. Keep cables and connectors above the water path.','The pump’s positive lead goes to OUT+. No motor current runs through the Uno output.',[0,1,2,3,4,5,6]],
    ['Test flow and cutoff','Fill the reservoir above the level sensor and start with the tray target visible. Move a hand or dry test card 8 cm below the sonar. Withdraw it to stop the pump. Hold the target in range for a second trial and wait for the four-second cutoff. Test low water while watching the input in Serial Monitor.','Flow stops when the hand leaves, the echo fails, the tank reads low, or four seconds expire. A valid clear reading is required before another run.',[0,1,2,3,4]],
  ],
  wiring:[
    ['Uno 5 V and GND','HC-SR04 and SEN0485 power','Sensor power'],
    ['Uno D2','HC-SR04 TRIG','Send a pulse'],
    ['HC-SR04 ECHO','Uno D3','Read pulse duration'],
    ['SEN0485 green OUT','Uno D4','LOW when water is present at the sensor'],
    ['Uno D9','MOSFET driver SIG','Pump enable'],
    ['Independent 5 V and negative','Driver V+ and GND; join GND to Uno GND','Motor supply and shared reference'],
    ['Driver OUT+ and switched OUT−','Pump positive and negative','Motor output'],
  ],
  test:'At 115200 baud, confirm WATER OK and a valid clear reading above 20 cm. Put a card or hand 8 cm from the sensor until the pump starts. Verify automatic stop at four seconds, then remove it before trying again. Block the echo during flow and verify shutoff. Lower and refill the reservoir to check the water interlock. Use the recirculating setup for classroom demonstration water.',
  demo:['Hand at spout','Clear','In range','Pump off','Water flows within the limit'],
};

export const automaticTapProgram={
  filename:'automatic_tap.ino',
  setup:'Upload with the pump supply off. Fill the tank above the level sensor, then restore pump power with the spout area clear. Use Serial Monitor at 115200 baud.',
  source:`const byte TRIG=2, ECHO=3, LEVEL=4, DRIVER=9;
const int NEAR_MIN=${tapLimits.startMin}, NEAR_MAX=${tapLimits.startMax}, HOLD_MAX=${tapLimits.holdMax}, CLEAR_MIN=${tapLimits.clearMin};
const byte CONFIRM=${tapLimits.confirm};
const unsigned long MAX_MS=${tapLimits.maxMs}, SAMPLE_MS=${tapLimits.sampleMs};
enum Mode { WAIT_CLEAR, READY, RUNNING };
Mode mode=WAIT_CLEAR;
byte count=0;
unsigned long started=0, lastRead=0, lastReport=0;

int distanceCm(){
  digitalWrite(TRIG, LOW); delayMicroseconds(2);
  digitalWrite(TRIG, HIGH); delayMicroseconds(10); digitalWrite(TRIG, LOW);
  unsigned long echo=pulseIn(ECHO, HIGH, 7000);
  return echo ? (echo*343UL+10000UL)/20000UL : -1;
}
void stopPump(){
  digitalWrite(DRIVER, LOW);
  mode=WAIT_CLEAR;
  count=0;
}
void setup(){
  digitalWrite(DRIVER, LOW); pinMode(DRIVER, OUTPUT);
  pinMode(TRIG, OUTPUT); pinMode(ECHO, INPUT);
  pinMode(LEVEL, INPUT_PULLUP);
  Serial.begin(115200);
}
void loop(){
  const unsigned long now=millis();
  const bool water=digitalRead(LEVEL)==LOW;
  if(!water || (mode==RUNNING && now-started>=MAX_MS)) stopPump();
  if(now-lastRead<SAMPLE_MS) return;
  lastRead=now;
  const int cm=distanceCm();
  if(water){
    if(mode==RUNNING){
      if(cm<NEAR_MIN || cm>HOLD_MAX) stopPump();
    }else{
      const bool qualify=mode==WAIT_CLEAR ? cm>=CLEAR_MIN : cm>=NEAR_MIN && cm<=NEAR_MAX;
      count=qualify ? count+1 : 0;
      if(count>=CONFIRM){
        count=0;
        if(mode==WAIT_CLEAR) mode=READY;
        else { mode=RUNNING; started=millis(); digitalWrite(DRIVER, HIGH); }
      }
    }
  }
  if(now-lastReport>=250){
    lastReport=now;
    Serial.print(water?"WATER OK | ":"WATER LOW | ");
    Serial.print(cm); Serial.print(" cm | ");
    Serial.println(mode==RUNNING?"FILLING":mode==READY?"READY":"WAIT CLEAR");
  }
}
`,
};
