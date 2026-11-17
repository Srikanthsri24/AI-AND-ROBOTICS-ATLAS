import type { Build } from './guided-projects';

export const parkingPhases=[
  {name:'Scan the curb',ms:4700,x:2.37,z:-.51,heading:0},
  {name:'Reverse toward the bay',ms:1150,x:1.36,z:-.19,heading:38},
  {name:'Countersteer',ms:1150,x:.36,z:.63,heading:0},
  {name:'Center in the bay',ms:600,x:-.08,z:.64,heading:0},
] as const;
export const parkingOrigin={x:-3.05,z:-.51,heading:0};

export const selfParking:Build={
  id:'directory-61',title:'Advanced Automatic Self-Car Parking',
  outcome:'Build a two-wheel tabletop rover that follows a row of parked blocks, measures a curb gap, and reverses into it in stages. Test when it rejects the gap or aborts a maneuver.',
  parts:[
    ['Arduino Uno R3','1','Runs the gap scan and parking sequence. Connect via USB for setup and serial diagnostics.'],
    ['HC-SR04 ultrasonic module','3','Face one toward the curb on the right, one forward and one backward. The end sensors stop travel when clearance is too small.'],
    ['TB6612FNG breakout','1','Sets left and right wheel direction and speed so the rover can turn while reversing.'],
    ['6 V geared DC motors and wheels','2','Choose a matched motor pair with stall current within the driver rating.'],
    ['Chassis and caster','1 set','Holds the board, driver and battery pack. Position the sensor faces outside the wheel envelope.'],
    ['Switched 4×AA holder','1','Supplies motor power independently of the USB-powered Uno. Use 4 alkaline cells with 6 V motors.'],
    ['Momentary tactile start button','1','Starts a run from the marked line. Press again during motion to stop. The motor pack switch provides a separate cutoff.'],
    ['Breadboard and jumper wires','1 set','Connects signal and logic power. Fix loose loops clear of the tires.'],
    ['5 V USB power bank','1','Powers the Uno for short trials without a computer tether.'],
    ['Corrugated curb and parking blocks','1 set','Build two tall cardboard blocks and an exit end target. Use broad faces for the ultrasonic sensors, and tape the layout to the floor.'],
  ],
  assembly:[
    ['Build and mark the rover','Assemble the chassis, caster and two wheels. Write FRONT on the frame and label the driver outputs left and right. Fasten the batteries with the cutoff switch exposed.','Both wheels turn freely and the frame sits level.',[2,3,4,5]],
    ['Mount three sonars','Put a forward sensor on the nose, another facing backward at the rear, and one facing the curb on the right. Keep all three level with the faces of the cardboard targets and unobstructed.','Each sensor faces only its intended direction and has a clear return path.',[1,4,9]],
    ['Wire signals and separate supplies','With both power sources disconnected, follow the map. Tie the motor battery negative, driver ground and Uno ground together. Put the AA positive on VM only.','The Uno and sensors get USB-derived 5 V and the driver motor rail gets AA power.',[0,1,2,3,5,6,7,8]],
    ['Lay out the parking lane','Use two blocks beside a straight taped lane, with an initial gap wider than twice the rover length. Mark the center of the rover at the start beside the first block. Place broad targets ahead and behind within 180 cm so the end sensors can read a valid distance.','The right sensor sees the first block, then the gap, then the second block. There is room to run parallel before backing.',[1,4,9]],
    ['Tune on the floor at low speed','Check motor direction on a stand. Then move to the marked lane and record the time to travel 30 cm. Set MIN_GAP_MS using measured scan speed and the minimum usable length, then tune the reverse timings in small increments with the motor switch in reach.','The rover rejects a short gap, finishes inside a wide one and stops when a cardboard target is placed in the backing path.',[0,1,2,3,4,5,6,8,9]],
  ],
  wiring:[
    ['Uno 5 V / GND','Driver VCC / GND and all HC-SR04 VCC / GND','Logic supply and common ground'],
    ['Uno A0 / A1','Right sonar TRIG / ECHO','Measures the curb gap'],
    ['Uno A2 / A3','Front sonar TRIG / ECHO','Checks clearance when driving forward'],
    ['Uno A4 / A5','Rear sonar TRIG / ECHO','Checks clearance when reversing'],
    ['Uno D2','Start switch → GND','Active low'],
    ['Uno D3 / D5','Driver PWMA / PWMB','Left and right motor speed'],
    ['Uno D4 / D7','Driver AIN1 / AIN2','Left motor direction'],
    ['Uno D8 / D11','Driver BIN1 / BIN2','Right motor direction'],
    ['Uno D12','Driver STBY','Disables motion at idle and after a stop'],
    ['Driver outputs A / B','Left / right motor leads','Reverse a lead pair if forward runs that wheel backward'],
    ['AA pack + / −','Driver VM / common ground','Independent switched motor supply'],
    ['USB power bank','Uno USB','Controller and sensor power for free driving'],
  ],
  test:'Check motor polarity with both wheels raised. In a clear lane, confirm that a narrow bay is rejected and a wide bay triggers two reverse arcs. With a second operator and the motor cutoff within reach, add a cardboard target behind the rover and verify it stops before contact. A missing echo on the sonar in the direction of travel also stops the run.',
  demo:['Curb gap and rear clearance','Stopped','Backing into the bay','Driver standby disables both channels','The rover reverses in two arcs'],
};
