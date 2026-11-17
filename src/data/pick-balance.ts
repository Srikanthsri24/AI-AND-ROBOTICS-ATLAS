import type { Build } from './guided-projects';
export const balanceLimit=24;
export const pickStages=['Ready','Gripping','Lifting','Transporting','Lowering','Released'] as const;
export const pickBalance:Build={
 id:'directory-36',title:'Pick-and-place rover & Self-balancing robot',
 outcome:'Build two small robots around one Uno sketch. Move a foam block with a gripper rover, then use an IMU to test how a two-wheel balancing robot corrects a lean.',
 parts:[
 ['Arduino Uno R3','1','Runs either the timed transfer or the feedback loop.'],
 ['TB6612FNG breakout','1','Applies signed motor commands to both wheels.'],
 ['6 V geared DC motors and wheels','2','Move the gripper rover and drive the balancing chassis beneath its center of mass.'],
 ['Chassis and caster','1 set','Use the caster on the rover. Mount the balancing frame on the aligned drive wheels without a load-bearing caster.'],
 ['Six-channel metal robot arm kit','1','Use a compact lift linkage and the gripper with two of the kit servos.'],
 ['PCA9685 PWM servo driver','1','Drives the lift and jaw servos in rover mode.'],
 ['Adafruit MPU-6050 IMU','1','Measures acceleration and angular velocity for the balance loop.'],
 ['Switched 4×AA holder','1','Feeds the motor driver. Keep its switch accessible.'],
 ['External regulated arm servo supply','1','Matches the two rover servos. Feed the PWM board V+ separately from Uno 5 V.'],
 ['Breadboard and jumper wires','1 set','Joins signal wiring and grounds. Use a USB data cable to upload the sketch.'],
 ['5 V USB power bank','1','Powers the Uno when running untethered.'],
 ],
 assembly:[
 ['Build a low pick-and-place rover','Mount the two drive wheels, caster and short lift assembly. Keep the foam block and linkage light. Secure the servo supply low on the chassis. Set a pickup position and a nearby release mark on a level course.','The empty chassis sits level and the gripper opens, closes and clears the table.',[2,3,4,8]],
 ['Connect the rover controls','With power off, leave A2 open. Wire the PCA9685 and motor driver. Put the lift on channel 0 and jaws on 1. Check the neutral, open and closed pulse values with horns disconnected. Refit each horn so it clears its stops before running a loaded trial.','With wheels lifted, p closes, lifts, drives briefly, lowers and opens. Correct the direction and shorten travel on the stand as needed.',[0,1,4,5,7,9,10]],
 ['Rebuild as a balancing platform','Power off and remove the rover linkage. Mount the battery and frame symmetrically over one wheel axle, with the center of mass above it. Mount the IMU flat with X forward, Y along the axle and Z up. Connect A2 to GND and use the MPU-6050 in place of the servo driver. Start on a stand with wheels free.','With motor power off, leaning the body forward produces positive pitch in Serial Monitor.',[0,1,2,6,7,9]],
 ['Verify feedback and the cutoff','Hold the body upright and steady and send b. Tilt slightly on the stand. Both wheels should drive toward the lean. Correct the motor polarity with power off, then tune gains in small increments on a supported rig. Check the cutoff before trying a clear floor test with a spotter.','Excessive tilt stops the motors. Re-arm only when the body is upright. Physical gains depend on motor response and mass distribution.',[0,1,2,6]],
 ],
 wiring:[
 ['A2','Open for rover, GND for balance at startup','Mode select'],
 ['Uno D5 / D6','TB6612 PWMA / PWMB','Wheel PWM'],
 ['Uno D4, D7 / D8, D12','TB6612 AIN1, AIN2 / BIN1, BIN2','Motor direction'],
 ['Uno D2','TB6612 STBY','Enable'],
 ['Uno 5 V and GND','TB6612 VCC and GND','Motor driver logic'],
 ['AA pack + and negative','TB6612 VM and common GND','Motor power'],
 ['TB6612 A01/A02, B01/B02','Left and right motor pairs','Motor outputs'],
 ['Uno A4, A5, 5 V and GND','SDA, SCL, VCC/VIN, GND of PCA9685 or MPU-6050','I²C and logic'],
 ['PCA9685 channels 0 and 1','Lift and jaw servo signal, V+ and GND','Rover only'],
 ['Servo supply positive and negative','PCA9685 V+ and common GND','Rover servo power'],
 ],
 test:'At 115200 baud, test p with the rover wheels raised and an empty gripper before moving foam. Send x to stop wheel motion or interrupt either routine. In balance mode confirm tilt polarity with motor power off, arm with b near upright, and check the wheels move under the lean. Tilting past 24° must disarm. Free-standing balance depends on hardware tuning.',
 demo:['Test mode','Open loop','Balance feedback','Timed transfer','Corrects a small lean'],
};
export const pickBalanceProgram={
 filename:'pickup_and_balance.ino',
 setup:'Install Adafruit PWM Servo Driver Library and Adafruit MPU6050 with dependencies. Upload with motor and servo power switched off. Select the mode before reboot. Use 115200 baud Serial Monitor. Start on a stand and keep the motor switch within reach.',
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
