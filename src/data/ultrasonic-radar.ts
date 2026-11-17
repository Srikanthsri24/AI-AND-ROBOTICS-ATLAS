import type { Build } from './guided-projects';

export const sweepLimits={min:30,max:150,step:5,rangeCm:150,settleMs:90};

export const ultrasonicRadar:Build={
  id:'directory-16',
  title:'DIY Ultrasonic Radar System',
  outcome:'Sweep an ultrasonic sensor across a tabletop arc and plot each echo by angle and distance.',
  parts:[
    ['Arduino Uno R3','1','Positions the servo, times the echo and prints one CSV row per sample.'],
    ['HC-SR04 ultrasonic module','1','Sends an ultrasonic burst and reports the round-trip time through ECHO.'],
    ['Positional micro servo','1','Rotates the sensor and its lightweight mount through the scanning arc.'],
    ['Regulated 5 V servo supply','1','Powers the servo independently of the Uno. Size it for the servo stall current.'],
    ['Breadboard and jumper wires','1 set','Connects the sensor and joins the two supply grounds.'],
  ],
  assembly:[
    ['Make the scanning base','Fasten the servo flat to a stable base so its shaft points up. Set the horn aside. Mark straight ahead as 90° on a paper arc and mark 30° and 150° on its sides.','The base stays still and the full arc is clear of other objects.',[2]],
    ['Mount the sensor','Center the servo at 90° using the sketch before fitting the horn. Secure the HC-SR04 to the horn with a light cardboard bracket so both transducers face straight ahead. Leave a slack loop in the sonar wires.','With power off, check that the wires leave room for the full sweep and the bracket clears the base.',[1,2]],
    ['Wire sensor and servo','Disconnect USB and the servo supply. Connect the four sonar pins and the servo signal using the map. Power the sonar from the Uno and the servo from its independent 5 V supply. Join their grounds.','The sonar VCC and servo power are on separate positive rails. All signal grounds are connected.',[0,1,2,3,4]],
    ['Mark a test target','Place a rigid flat card about 40 cm from the sensor face, perpendicular to the beam. Upload with the servo supply off before running the first sweep.','With the servo centered, confirm the bracket and card face one another before measuring at other angles.',[0,1,2]],
  ],
  wiring:[
    ['Uno 5 V / GND','HC-SR04 VCC / GND','Sensor power'],
    ['Uno D2','HC-SR04 TRIG','Start a sonar burst'],
    ['HC-SR04 ECHO','Uno D3','Measure the pulse width'],
    ['Uno D9','Servo signal wire','Command the scan angle'],
    ['Separate regulated 5 V','Servo power wire','Servo motor supply'],
    ['Servo supply negative and servo ground','Uno GND','Shared reference'],
    ['Computer USB','Uno USB','Sketch upload and CSV output'],
  ],
  test:'Open Serial Monitor at 115200 baud. Place a large flat card facing the sensor at 90° and about 40 cm away. Look for valid readings around 90°. Move the card to another marked angle and confirm the cluster shifts. Remove it and check that no return is reported as -1, not 0 cm.',
  demo:['Target','Absent','Present','No valid return','Echo plotted by angle and distance'],
};

export const ultrasonicRadarProgram={
  filename:'ultrasonic_radar.ino',
  setup:'Set the servo supply switch off before uploading. Open Serial Monitor at 115200 baud. The first line is a CSV header. A reading of -1 means the echo was missing or outside the 10–150 cm test range.',
  source:`#include <Servo.h>
const byte TRIG=2,ECHO=3,SERVO_PIN=9;
const int MIN_ANGLE=${sweepLimits.min},MAX_ANGLE=${sweepLimits.max},STEP=${sweepLimits.step};
Servo scanner;
int angle=MIN_ANGLE,direction=STEP;

void setup() {
  pinMode(TRIG,OUTPUT);
  pinMode(ECHO,INPUT);
  scanner.write(90);
  scanner.attach(SERVO_PIN);
  Serial.begin(115200);
  Serial.println("angle_deg,range_cm");
  delay(1500);
}

void loop() {
  scanner.write(angle);
  delay(${sweepLimits.settleMs});
  digitalWrite(TRIG,LOW); delayMicroseconds(2);
  digitalWrite(TRIG,HIGH); delayMicroseconds(10); digitalWrite(TRIG,LOW);
  const unsigned long echo=pulseIn(ECHO,HIGH,10000);
  const long cm=(echo*343UL+10000UL)/20000UL;
  const bool valid=echo && cm>=10 && cm<=${sweepLimits.rangeCm};
  Serial.print(angle);Serial.print(',');Serial.println(valid?cm:-1);
  if(angle>=MAX_ANGLE)direction=-STEP;
  else if(angle<=MIN_ANGLE)direction=STEP;
  angle+=direction;
}
`,
};
