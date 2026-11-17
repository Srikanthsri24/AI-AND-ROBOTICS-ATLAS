import type { Build } from './guided-projects';

export const lawnColumns=6;
export const lawnRows=5;
export const lawnCells=Array.from({length:lawnRows*lawnColumns},(_,index)=>{
  const row=Math.floor(index/lawnColumns),step=index%lawnColumns;
  return {row,column:row%2?lawnColumns-1-step:step};
});
export const solarLawn:Build={
  id:'directory-74',title:'Smart Solar Lawn Coverage Workbench',
  outcome:'Plan overlapping passes with a solar-aware tabletop rover. Watch the virtual lawn change as each strip is covered, then pause for shade and resume from the same strip.',
  parts:[
    ['Arduino Uno R3','1','Runs the timed pass sequence and tracks the last unfinished movement.'],
    ['Regulated 5 V USB solar panel','1','Provides a voltage reading for the light gate. Keep this supply separate from the drive motors.'],
    ['USB Micro-B breakout','1','Breaks out the solar panel USB power and ground. Bring a matching cable.'],
    ['10 kΩ divider resistors','2','Divide panel USB voltage by two for A0.'],
    ['TB6612FNG breakout','1','Drives the left and right wheel motors in both directions.'],
    ['6 V geared DC motors and wheels','2','Pick two matching motors sized for the driver.'],
    ['Chassis and caster','1 set','Carries the controller and panel. Use a light non-cutting marker or the built-in coverage indicator.'],
    ['Switched 4×AA holder','1','Supplies wheel drive through the driver motor supply input.'],
    ['Momentary tactile start button','1','Starts the sequence, pauses it manually and resumes when solar voltage is available.'],
    ['Breadboard and jumper wires','1 set','Routes the divider, button and driver logic. Keep motor leads clear of wheels.'],
    ['5 V USB power bank','1','Powers the Uno during untethered tabletop trials.'],
    ['220 Ω axial resistors','1','A ¼ W resistor loads the solar output by about 23 mA at 5 V, making the voltage threshold more responsive to shade.'],
  ],
  assembly:[
    ['Set up the rover and tray','Mount both motors symmetrically, secure the caster and fit the controller. Tape five parallel strips on a level bounded tabletop. Give both ends room for two turns and a lane shift.','Wheels spin freely and the lane spacing is visible.',[0,4,5,6]],
    ['Mount and sense the panel','Place the panel evenly over the chassis. Use the USB breakout and 10 kΩ divider to sense regulated USB voltage. Fit the 220 Ω test load directly across solar VBUS and ground. Measure the midpoint before connecting it to A0.','With a nominal 5 V at the breakout, the midpoint reads about 2.5 V.',[0,1,2,3,6,11]],
    ['Connect drive and logic','With all sources disconnected, wire the driver and button. Keep the solar USB positive, Uno 5 V and AA positive separate. Join their grounds.','The wheels are the only powered mechanical outputs.',[0,4,5,7,8,9,10]],
    ['Calibrate the floor sequence','Raise the wheels first and verify forward polarity. On the test surface, tune STRAIGHT_MS to the strip length, SHIFT_MS to one strip spacing, and separate TURN_LEFT_MS and TURN_RIGHT_MS for quarter turns.','The rover can traverse the first two strips and align with adjacent tape marks.',[0,4,5,6,7,8]],
    ['Test the pause and coverage','Run the first strip under bright light. Cover the panel while moving. Restore light and press Start to resume; check the route from where it stopped. Use the serial log and onboard LED to identify active strips.','Only straight passes light the coverage LED. Shade disables drive and the sequence resumes the unfinished segment.',[0,1,4,6,8]],
  ],
  wiring:[
    ['Solar USB VBUS','10 kΩ → A0 → 10 kΩ → GND','Half-voltage sense only'],
    ['Solar USB VBUS','220 Ω → GND','Fixed test load across the solar output'],
    ['Uno 5 V / GND','TB6612 logic VCC / GND','Share ground with both other supplies'],
    ['AA pack positive / negative','TB6612 VM / common ground','Independent wheel power'],
    ['Uno D3 / D5','Driver PWMA / PWMB','Left and right speed'],
    ['Uno D4 / D7 and D8 / D11','Driver AIN1 / AIN2 and BIN1 / BIN2','Wheel direction'],
    ['Uno D12','Driver STBY','Disable drive in paused or stopped state'],
    ['Driver A / B outputs','Left / right motor leads','Verify direction on a stand'],
    ['Uno D2','Start switch → GND','Internal pull-up'],
    ['USB power bank','Uno USB','Controller power'],
  ],
  test:'Observe five alternating straight passes. The onboard LED turns off during shifts and turns. Cover the panel during a pass, verify standby, restore the light and press Start to finish that pass. Compare the taped route and log to spot any missed strip.',
  demo:['Alternating lawn passes','Paused','Covering a strip','Stops and keeps its place','Visited cells change color'],
};
