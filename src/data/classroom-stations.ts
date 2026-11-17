import type { Build } from './guided-projects';

export const stations = [
  {name:'Switch and LED', minutes:12, task:'Close and open the switch. Observe both LED states.', evidence:'Explain how closing the switch completes the input circuit and changes the output.'},
  {name:'Ultrasonic measurement', minutes:12, task:'Place the target at two distances and compare readings.', evidence:'Record both distance readings and explain why the farther target takes longer to return an echo.'},
  {name:'Rover route', minutes:12, task:'Steer the rover one command at a time around the obstacle to the signal marker.', evidence:'Write down the command sequence and explain where the rover changed direction.'},
] as const;

export const classroomLab: Build = {
  id:'directory-50',
  title:'NEP 2020 Aligned STEM & Robotics Laboratory Setups',
  outcome:'Set up a classroom rotation through a switch circuit, an ultrasonic sensor trial and a rover route. Use the same observations in a hands-on or paper activity.',
  parts:[
    ['Arduino Uno R3','2','One controller per electronic station. Bring two USB data cables and computers with Arduino IDE.'],
    ['Breadboard and jumper wires','2 sets','Wire the switch and LED on one bench and the range sensor at the other.'],
    ['Momentary tactile button','1','Lets students compare input states on the circuit bench.'],
    ['Red LED and 220 Ω resistor','1 each','Shows the digital output. The resistor limits the LED current.'],
    ['HC-SR04 ultrasonic module','1','Measures the time for a sound pulse to travel to a flat card and back.'],
    ['Chassis and caster','1','Use the assembled chassis as an unpowered route marker. Leave the battery disconnected and move it by hand.'],
  ],
  assembly:[
    ['Arrange the rotation','Set out three numbered tables. At each station assign a builder, an observer and a recorder. Allow 12 minutes each, plus two minutes to rotate. Provide a flat card and centimeter ruler at the sensor bench and graph paper at the route table.','Each group can make a prediction and record observable evidence at every table.',[0,1,5]],
    ['Build the switch circuit','Disconnect USB. Place the tactile button across the breadboard gap. Wire D2 to one switched side and ground to the other. Connect D9 through 220 Ω to the LED anode and connect the cathode to ground.','The switch can pull D2 to ground. The LED has a resistor in series and the cathode goes to ground.',[0,1,2,3]],
    ['Align the range trial','Use the second Uno and breadboard. Connect 5 V, GND, D5 and D6 using the map. Face the two transducers toward a wide flat card and mark 25 and 60 cm from the sensor face.','The card can stand perpendicular to the beam at both marks.',[0,1,4]],
    ['Lay out the rover route','Assemble the passive chassis and draw a 4-column by 3-row grid with cells wide enough for it. Start at row 1, column 1, facing east. Put a block at row 1, column 2 and the goal at row 3, column 4. Issue one command at a time and move the chassis by hand.','The operator can reach the goal while leaving the obstacle square untouched. A paper arrow token can replace the chassis.',[5]],
  ],
  wiring:[
    ['Circuit Uno D2','Switch → GND','Active-low input with internal pull-up'],
    ['Circuit Uno D9','220 Ω → LED anode; cathode → GND','Feedback for the switch state'],
    ['Range Uno 5 V / GND','HC-SR04 VCC / GND','Sensor supply'],
    ['Range Uno D5','TRIG','Start ultrasonic burst'],
    ['Range Uno D6','ECHO','Measure the pulse width'],
    ['Rover command cards','One turn or one grid square by hand','Carry out and check the route sequence'],
  ],
  test:'Verify both LED states, compare the two distances at 25 and 60 cm, then reach the rover goal without entering the blocked cell. Have each group explain one unexpected result and how they checked it.',
  demo:['Station readiness','Parts unavailable','Parts ready','Paper trial','Hands-on trial'],
};

export const stationCards = stations.map((station,index)=>
  `STATION ${index+1} · ${station.name.toUpperCase()} · ${station.minutes} minutes\nTry: ${station.task}\nEvidence: ${station.evidence}\nPrediction: ______________________\nObservation: _____________________\nExplanation: _____________________`
).join('\n\n');
export const inventorySheet='station,resource,quantity,ready\nSwitch and LED,Uno and USB cable,1,\nSwitch and LED,Breadboard and jumper set,1,\nSwitch and LED,Tactile button,1,\nSwitch and LED,LED and 220 ohm resistor,1 set,\nUltrasonic measurement,Uno and USB cable,1,\nUltrasonic measurement,HC-SR04 with leads,1,\nUltrasonic measurement,Breadboard and jumper set,1,\nUltrasonic measurement,Flat card and metric ruler,1 set,\nRover route,Unpowered chassis or paper token,1,\nRover route,Grid and command cards,1 set,\n';
