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
    ['STEMMA MOSFET driver and lead','1 each','Switches pump current through its MOSFET and flyback diode. Include the instructor-prepared GND-only reference header: leave VIN, SIG and OUT breakout pads unbridged. The intact 200 mm keyed lead retains its factory male-pin ends.'],
    ['Regulated 5 V pump supply and adapter','1 each','Powers the pump independently. Use a regulated 5 V supply and a matching low-voltage terminal adapter.'],
    ['Breadboard and jumper wires','1 set','Use a mini breadboard for sensor power distribution, separate signal jumpers, three socket extensions for the intact SEN0485 lead, and protected motor leads with matching insulated terminals. Keep pump current out of breadboard rails.'],
    ['Recirculating basin and dry mounting kit','1 set','Thin-wall transparent reservoir, raised collection basin with open gravity drain, rigid base, dry frame and electronics shelf, pump bracket, spout sleeve/clamps, 26 cm echo target, insulated board/sensor mounts, fasteners and protected cable supports.'],
    ['USB-A to USB-B data cable','1','Powers and programs the Uno independently of the pump supply.'],
    ['Dry calibration card and ruler','1 set','A flat card at 8 cm below the detector primes the tubing without entering the water stream.'],
  ],
  assembly:[
    ['Build the recirculating basin','Set a shallow basin above a transparent, thin-walled plastic reservoir and provide a gravity return through a drain or funnel. Secure the inlet tube below the minimum water line and direct the outlet tube down into the basin. Mount the pump and electronics outside the splash area.','Pour a little water into the basin with the electronics unpowered. It returns without leaking onto the work surface. Empty and dry the apparatus again before fitting electronics so the first powered test starts with an empty reservoir.',[3,7]],
    ['Fit the two sensors','Mount the HC-SR04 facing down beside the spout, high enough to stay dry. Add a flat echo target about 26 cm below it, offset from the stream. Fix the level sensor flat against the reservoir wall above the inlet so it signals low water before the intake is exposed. The wall should be at most 3 mm thick.','An empty basin gives a clear echo. The reservoir sensor changes from HIGH to LOW as water rises past it.',[0,1,2,7,9]],
    ['Wire pump power and control','Disconnect both supplies. Connect the pump to the driver output terminals and the independent 5 V supply to driver V+ and GND. Join the Uno reference jumper to the prepared GND-only driver header. The keyed lead connects its black pin to source negative, red pin to source positive and white SIG pin to D9. Connect the pump only to OUT+ and OUT−, and wire both sensors. Keep cables and connectors above the water path.','The pump’s positive lead goes to OUT+. No motor current runs through the Uno output.',[0,1,2,3,4,5,6,8]],
    ['Check dry, fill and prime','Load the sketch over USB with the separate motor source off. First test WATER LOW with the tank empty and source on: the rollers must remain stopped. Switch the source off, fill to 2,600 mL and restore motor power with the echo target clear. Use the dry card at 8 cm for three four-second runs, withdrawing fully between them. The approximately 9.8 mL tubing fills before water exits; the example flow is 1 mL/s, not a pump rating.','Flow stops when the hand leaves, the echo fails, the tank reads low, or four seconds expire. A valid clear reading is required before another run.',[0,1,2,3,4,5,8,9]],
    ['Use the tap and verify rearming','Present an open hand under the spout. Water should land on the palm and return via the basin. Hold the hand in place until the four-second stop; it must not restart while held. Withdraw completely for three clear readings, then repeat. Removing motor power stops further pumping while water already in flight returns by gravity.','Click the actual skin, water, sensor, driver and tubing to explain the complete sensing, power and return paths.',[0,1,2,3,4,5,7,9]],
  ],
  wiring:[
    ['Uno 5 V and GND','HC-SR04 and SEN0485 power','Sensor power'],
    ['Uno D2','HC-SR04 TRIG','Send a pulse'],
    ['HC-SR04 ECHO','Uno D3','Read pulse duration'],
    ['SEN0485 green OUT','Uno D4','LOW when water is present at the sensor'],
    ['Uno D9','MOSFET driver SIG','Pump enable'],
    ['Independent 5 V + / negative','Keyed lead red VIN / black GND pins in adapter clamps','Motor supply; never bridge its positive to Uno 5 V'],
    ['Prepared driver GND-only header','Uno GND','Signal reference jumper; leave the other breakout pads open'],
    ['Driver OUT+ and switched OUT−','Pump positive and negative','Motor output'],
  ],
  test:'Begin with the empty-water check, then fill with motor power off and prime the tubing across safety-limited card cycles. At 115200 baud, confirm WATER OK and a valid clear reading above 20 cm. Put a card or hand 8 cm from the sensor until the pump starts. Verify automatic stop at four seconds, then remove it before trying again. Block the echo during flow and verify shutoff. Lower and refill the reservoir to check the water interlock. Use the recirculating setup for classroom demonstration water.',
  demo:['Hand at spout','Clear','In range','Pump off','Water flows within the limit'],
};

export const automaticTapProgram={
  filename:'automatic_tap.ino',
  setup:'Upload over USB with the pump source off. Observe WATER LOW with an empty tank and source on. Switch the source off to fill 2,600 mL, then restore it and prime the tubing with safety-limited card cycles and full withdrawal between them. Use Serial Monitor at 115200 baud.',
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
