import{pickGuideName as kit}from'./pick-rover-guide-kits';
import type { Build } from './guided-projects';
export const balanceLimit=24;
export const pickStages=['Ready','Gripping','Lifting','Transporting','Lowering','Released'] as const;
export const pickBalance:Build={
 id:'directory-36',title:'Pick-and-place rover & Self-balancing robot',
 outcome:'Build two small robots around one Uno sketch. Move a foam block with a gripper rover, then use an IMU to test how a two-wheel balancing robot corrects a lean.',
 parts:[
 ['Arduino Uno R3','1','Runs one selected robot mode. USB supplies its logic; it never supplies wheel or servo motor current.'],
 ['TB6612FNG breakout','1','Uses separate logic VCC and wheel VM rails. Its two H-bridges command the left and right motor pairs.'],
 ['6 V geared DC motors and wheels','2','Use matched keyed shafts, wheel hubs and retaining hardware. The rover workshop shows two independent motor channels.'],
 [kit('chassis'),'1 set','Rover only: the 168 mm wide notched deck, four cable bores and retained caster match the 3D workshop. The balancing build needs a separate upright frame and no load-bearing caster.'],
 [kit('frame'),'1 set','Rover only: authored four-bar links, fixed towers, keyed axle with retaining rings, level palm, rack-and-pinion jaws and servo support frames. This is not a purchased six-axis arm kit.'],
 ['PCA9685 PWM servo driver','1','Rover only: channel 0 commands lift and channel 1 commands jaws. Logic VCC and actuator V+ use separate power paths.'],
 ['Adafruit MPU-6050 IMU','1','Balance only: supplies tilt and pitch-rate measurements. It is not installed on the pick rover. Use the matched Uno-compatible breakout.'],
 ['Switched 4×AA holder','1','Nominal 6 V wheel source. Its positive goes to driver VM and its return goes directly to driver GND1, not through the small logic tie.'],
 [kit('servo-supply'),'1','Rover only: separate regulated actuator source set to the matched servo voltage. The virtual enclosure represents 6 V; actual peak-current capability must suit both servos.'],
 [kit('mini'),'1 set','Use the two specified isolated five-contact groups for 5 V logic and ground reference, plus separate signal jumpers. There is no continuous power rail on this 170-point board.'],
 [kit('usb-bank'),'1 set','A matched 5 V USB logic source and USB-A-to-B cable power the Uno untethered. This source cannot upload a sketch and does not feed either actuator rail.'],
 [kit('servo'),'2','Rover only: one lift servo and one jaw servo. The model uses bare splined outputs and three-wire leads; actual pulse limits and lead reach must be checked on the real kit.'],
 [kit('mounting'),'1 matched pack','Includes ten M4 clamp stacks for four lift-base, two side-foot and four motor-support bores, plus the matched board spacers, servo-ear, carrier and caster fasteners. Fit the lengths shown in each step.'],
 [kit('couplers'),'1 pair of adapters','Rover only: the two-piece lift adapter closes around the spline and D axle, retained by two cross-bolts/nuts. The compact jaw hub has a spline socket, internal shoulder and separate axial screw.'],
 [kit('foam'),'1 light block + marks','Use a light foam payload, a marked pickup position and a nearby delivery footprint. The timed routine does not detect the block or navigate to the target.'],
 [kit('protectors'),'4','Rover only: two split rubber halves per motor-cable bore protect insulation from acrylic edges. They are edge protectors, not cable clamps or certified pull restraints.'],
 [kit('pads'),'6 source strips + logic-board pad','Bond the wheel holder and servo source above the deck and the USB source underneath, clear of the caster and PCB nuts. Clean/dry the surfaces and check adhesion.'],
 ['Computer with USB and Arduino IDE','1','Upload and inspect serial commands through a computer. Disconnect the USB-A end from the portable source before connecting it to the computer.'],
 [kit('power-lead'),'8 prepared leads','Four solder-ended motor leads, two wheel-supply leads and two servo-supply leads have separate routes and matched terminations. These carry actuator current; do not replace them with the logic tie path.'],
 ],
 assembly:[
 ['Build the rolling rover base','Use the matching notched deck, motor cradles and bored caster hardware. Align each wheel’s D bore with its gearbox shaft and retain it with its washer and screw. Support the chassis with the wheels clear before making powered checks.','Both wheels turn freely, the caster axle is retained and the motor cases clear the deck pockets.',[2,3,12]],
 ['Install the unloaded lift and jaws','Clamp the supplied four-bar module to the central bores and fit the level palm and rack gripper. Mount the two servo bodies in their separate support frames. Leave both output adapters and the jaw axial screw removed until unloaded calibration.','The fixed frames are retained, the linkage and racks stay still, and both servo splines remain mechanically unloaded.',[4,11,12,13]],
 ['Mount boards and the three sources','Fit the actual insulated Uno, motor-driver and PWM-board supports. Mount the logic tie board and the three switched-off sources, including the USB bank underneath. Keep connector grips, output switches, caster travel and board nuts accessible.','No board underside contacts the deck; the sources cannot slide and all outputs remain OFF.',[0,1,5,7,8,9,10,12,16]],
 ['Connect the wheel-current paths','Feed each prepared motor lead through its own deck bore and seat it on A01/A02 or B01/B02. Connect the AA holder positive to VM and its separate return directly to GND1. Do not send motor current through the breadboard tie.','Each motor has its own paired outputs, both source leads reach their intended contacts and wheel power remains OFF.',[1,2,7,18]],
 ['Wire logic, I²C and both servos','Use the connection map below for all seven motor-control signals and the two logic reference ties. Connect A4/SDA and A5/SCL to the PWM board. Its separate V+ terminal receives the servo source; brown/red/orange servo leads seat on channel 0 for lift and channel 1 for jaws.','No positive supply rails are joined together; 5 V logic, wheel VM and servo V+ remain distinct, with the specified common references.',[0,1,5,8,9,11,18]],
 ['Check the two bare outputs','Keep the wheel source OFF and both adapters removed. Use the unloaded workshop lesson to inspect, command and record both references for each channel. Return both to A, wait for settling, then switch servo power and USB logic OFF. A real kit needs its own unloaded endpoint checks before using the example sketch constants.','Four virtual pulse references are recorded, both bare outputs are at A and all source outputs are OFF. Being at A alone is not a completed calibration.',[0,5,8,10,11,13,17]],
 ['Fit the two compact adapters','Support and temporarily raise the gripper servo frame after releasing its clamps. Seat the shoulder-bored hub on the pinion, lower the spline into it, restore the clamps and fit the axial screw. Close the split lift-adapter halves radially around the aligned shafts, then fit both cross-bolts and nuts. Do not withdraw the keyed axle or force either shaft to turn.','The two output stacks are retained, the axle rings stay in their grooves and power remains OFF throughout fitting.',[4,11,12,13]],
 ['Protect the cable bores and inspect slack','Close each split rubber protector above its connected motor lead. Compress the lower lip while seating through the bore, then release it beneath the plate. Check left and right motor routing and the moving jaw-servo service bow. Keep that bow free rather than tying it to a fixed bundle.','All four protectors are seated without pinching insulation; the verified routes are preserved and all three routing inspections are complete.',[3,9,11,15,18]],
 ['Run a short foam transfer','Remove the assembly supports and place the rover on a clear level course with a light foam block at the pickup mark. Retain the checked pulse profile. Start with every source OFF, deliberately enable the required rails and run one transfer. Check wheel direction with the wheels raised before a physical floor test.','The jaws contact the foam, the level lift raises it, both wheels transport it and the released footprint lands inside the target. A physical timed path must be adjusted for its real speed and load.',[2,7,8,10,14]],
 ['Build the separate balancing platform','Power off and set aside the rover mechanism and caster. Use an upright balancing frame with the mass above its single drive axle. Mount the IMU X-forward, Y-along-axle and Z-up. Ground A2 before reboot and use the IMU in place of the rover PWM board. Begin with the body supported and the wheels free.','With wheel power OFF, a forward lean produces positive pitch. The balance build does not use a load-bearing caster.',[0,1,2,6,7,9,10,17]],
 ['Verify feedback before free-standing trials','Hold the balance body upright and steady before sending b. Check both wheels move toward a small lean on the supported rig. Correct wiring with power OFF, then tune gains in small increments and verify the tilt cutoff.','A lean past the cutoff disarms the motors. Re-arm only when upright; physical balancing depends on frame geometry, motor response and tuning.',[0,1,2,6,7,17]],
 ],
 wiring:[
 ['A2','Open for rover; GND for balance before reboot','Startup mode selection; choose the correct physical build'],
 ['Uno D5 / D6','TB6612 PWMA / PWMB','Separate left/right PWM requests'],
 ['Uno D4, D7 / D8, D12','TB6612 AIN1, AIN2 / BIN1, BIN2','Paired direction signals'],
 ['Uno D2','TB6612 STBY','Bridge enable; the carrier also has a pull-up'],
 ['Uno 5 V','Logic board column 1 · bank A · contact 1','5 V reference tie only'],
 ['Column 1 · bank A · contacts 2 and 3','TB6612 VCC and PCA9685 VCC','Logic supply; never wheel VM or servo V+'],
 ['Uno GND-P1','Logic board column 17 · bank B · contact 1','Common signal reference'],
 ['Column 17 · bank B · contacts 2 and 3','TB6612 logic GND and PCA9685 GND','Board logic references; not the high-current return paths'],
 ['AA holder positive / negative','TB6612 VM / driver GND1','Direct wheel power and return'],
 ['TB6612 A01/A02 / B01/B02','Left motor pair / right motor pair','Prepared motor-output leads through four separate deck bores'],
 ['Uno A4 / A5','PCA9685 SDA / SCL in rover mode','I²C data and clock'],
 ['PCA9685 channel 0 / channel 1','Lift servo / jaw servo','Orange signal, red V+ and brown GND in the actual connector order'],
 ['Separate servo source positive / return','PCA9685 V+ / terminal GND','Actuator power through the dedicated terminal; separate from logic VCC'],
 ['Switched-off 5 V USB source, USB-A → USB-B','Uno USB receptacle','Portable logic power only; substitute a computer for sketch upload'],
 ['Uno A4, A5, 5 V and GND in balance mode','MPU-6050 SDA, SCL, VIN and GND','Use the matched Uno-compatible IMU breakout on the separate balancing build'],
 ],
 test:'At 115200 baud, test p with the rover wheels raised and an empty gripper before moving foam. Send x to stop wheel motion or interrupt either routine. In balance mode confirm tilt polarity with motor power off, arm with b near upright, and check the wheels move under the lean. Tilting past 24° must disarm. Free-standing balance depends on hardware tuning.',
 demo:['Test mode','Open loop','Balance feedback','Timed transfer','Corrects a small lean'],
};
export const pickBalanceProgram={
 filename:'pickup_and_balance.ino',
 setup:'Install Adafruit PWM Servo Driver Library and Adafruit MPU6050 with dependencies in Arduino IDE. Switch motor and servo outputs OFF, disconnect USB-A from the portable source and connect it to the computer for upload. Select the mode before reboot and use 115200 baud Serial Monitor. Check real servo pulse limits with both adapters removed before fitting; the supplied constants describe the virtual teaching example. Return the USB-A plug to the switched-off portable source for untethered trials. Start wheel-direction checks on supports and keep the source switches accessible.',
 source:`#include <Wire.h>
#include <Adafruit_MPU6050.h>
#include <Adafruit_PWMServoDriver.h>
Adafruit_MPU6050 imu;
Adafruit_PWMServoDriver servo;
const byte PWM[]={5,6}, FIRST[]={4,8}, SECOND[]={7,12}, ENABLE=2;
const int LIFT_LOW=1440,LIFT_UP=1560,JAW_OPEN=1450,JAW_CLOSED=1550;
const float KP=8.0, KD=0.9, LIMIT=${balanceLimit};
const unsigned int waitMs[]={350,450,850,450,300};
bool balance, armed=false, initialized=false, armRequested=false;
int pick=-1;
float pitch=0, gyroBias=0, level=0;
unsigned long stepAt=0,lastSample=0,reportAt=0;

void motor(byte i,int speed){
  digitalWrite(FIRST[i],speed>0); digitalWrite(SECOND[i],speed<0);
  analogWrite(PWM[i],abs(speed));
}
void drive(int speed){ motor(0,speed); motor(1,speed); }
void motion(){
  if(pick==0){ servo.writeMicroseconds(0,LIFT_LOW); servo.writeMicroseconds(1,JAW_CLOSED); }
  if(pick==1) servo.writeMicroseconds(0,LIFT_UP);
  if(pick==2) drive(100);
  if(pick==3){ drive(0); servo.writeMicroseconds(0,LIFT_LOW); }
  if(pick==4) servo.writeMicroseconds(1,JAW_OPEN);
}
void setup(){
  Serial.begin(115200); pinMode(A2,INPUT_PULLUP);
  balance=digitalRead(A2)==LOW;
  pinMode(ENABLE,OUTPUT);
  for(byte i=0;i<2;++i){ pinMode(PWM[i],OUTPUT); pinMode(FIRST[i],OUTPUT); pinMode(SECOND[i],OUTPUT); }
  drive(0);
  if(balance) initialized=imu.begin();
  else {
    initialized=servo.begin();
    if(initialized){ servo.setPWMFreq(50); servo.writeMicroseconds(0,LIFT_LOW); servo.writeMicroseconds(1,JAW_OPEN); }
  }
  if(!initialized){ Serial.println("I2C device unavailable"); return; }
  digitalWrite(ENABLE,HIGH);
  Serial.println(balance?"b = arm upright, x = stop":"p = transfer, x = stop");
}
void loop(){
  if(!initialized) return;
  const unsigned long now=millis();
  const char key=Serial.available()?Serial.read():0;
  if(key=='x'){ armed=false; armRequested=false; pick=-1; drive(0); }
  if(key=='b'&&balance&&!armed) armRequested=true;
  if(!balance){
    if(key=='p'&&pick<0){ pick=0; stepAt=now; motion(); }
    if(pick>=0&&now-stepAt>=waitMs[pick]){
      if(++pick>=5){ pick=-1; drive(0); }
      else { stepAt=now; motion(); }
    }
    return;
  }
  unsigned long stamp=micros();
  unsigned long elapsed=stamp-lastSample;
  if(elapsed<10000) return;
  lastSample=stamp;
  sensors_event_t a,g,t; imu.getEvent(&a,&g,&t);
  const float tilt=atan2(-a.acceleration.x,a.acceleration.z)*RAD_TO_DEG;
  const float gyro=g.gyro.y*RAD_TO_DEG;
  if(armRequested){
    armRequested=false;
    if(abs(tilt)>=6) return;
    float total=0;
    for(byte i=0;i<30;++i){ imu.getEvent(&a,&g,&t); total+=g.gyro.y*RAD_TO_DEG; delay(10); }
    level=atan2(-a.acceleration.x,a.acceleration.z)*RAD_TO_DEG;
    gyroBias=total/30;
    pitch=0; lastSample=micros(); armed=abs(level)<6; return;
  }
  const float rate=gyro-gyroBias;
  if(elapsed>40000){ armed=false; pitch=tilt-level; }
  else pitch=.98f*(pitch+rate*elapsed*.000001f)+.02f*(tilt-level);
  if(abs(pitch)>LIMIT||abs(tilt-level)>LIMIT) armed=false;
  drive(armed?constrain(int(KP*pitch+KD*rate),-155,155):0);
  if(now-reportAt>=100){ reportAt=now; Serial.print(pitch,1); Serial.println(armed?" active":" stopped"); }
}
`,
};
