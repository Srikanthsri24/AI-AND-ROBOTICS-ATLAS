import type {Build} from './guided-projects';

export const modelParkingBarrier:Build={
  id:'model-parking-barrier',
  title:'Model parking barrier',
  outcome:'Raise a lightweight arm for a toy car. Keep it open while either beam is blocked and lower it only after both beams have been clear for 1.5 seconds.',
  parts:[
    ['Arduino Uno R3','1','Reads both receivers and commands the servo.'],
    ['3 mm IR break-beam pair','2 pairs','Detects a car at the approach and under the arm.'],
    ['Positional micro servo','1','Rotates the lightweight barrier arm.'],
    ['Regulated 5 V servo supply','1','Powers the servo separately from the Uno USB supply.'],
    ['Card parking lane, striped arm and toy car','1 set','Provides the model lane, a lightweight arm and an opaque test vehicle.'],
    ['Breadboard and jumper wires','1 set','Distributes sensor power and links the grounds.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and connects Serial Monitor.'],
  ],
  assembly:[
    ['Lay out the tabletop lane','Mark an approach line and the point under the arm. Install a transmitter and receiver facing across the lane at each point. Keep both beam lines closer together than the opaque length of the toy car, with enough space for the car to stop before entering the arm path.','The car blocks at least one beam while moving between lines. With the lane empty both beams read clear.',[1,4]],
    ['Wire and align the beams','Unplug USB. Connect the red and black leads of each transmitter and receiver to Uno 5 V and GND. Connect the approach receiver signal to D2 and the under-arm receiver to D3.','The internal pull-ups hold both inputs high when clear. Moving an opaque card through either beam pulls its own input low.',[0,1,5]],
    ['Power and fit the servo','Connect servo signal to D9. Connect its power leads to a separate regulated 5 V supply rated for the servo. Join its ground to Uno GND and keep the positive supplies separate. Test the travel with the horn removed before attaching a light card arm.','The arm is horizontal at the closed angle and clears the toy car at the open angle without binding.',[0,2,3,4,5]],
    ['Test the approach, stop and exit','Upload the sketch and open Serial Monitor. Move the car to the approach line and wait for the arm to rise. Pause under the arm to test the second beam, then leave. Try blocking either beam during the closing delay.','Either beam opens or holds the arm. The timer restarts after a new blockage. The arm lowers only after 1.5 seconds of continuous clear readings.',[0,1,2,4,6]],
  ],
  wiring:[
    ['Uno 5 V','Both emitters and both receivers, red leads','Sensor power'],
    ['Uno D2','Approach receiver signal','Low when beam is broken'],
    ['Uno D3','Under-arm receiver signal','Low when beam is broken'],
    ['Uno D9','Servo signal','Arm position command'],
    ['External regulated 5 V','Servo positive lead','Dedicated servo power'],
    ['Uno GND','Sensor returns, servo ground and external supply ground','Shared reference'],
  ],
  test:'Block each beam individually and verify that the arm opens. Keep either beam blocked for longer than the hold time. Clear both, then interrupt the closing delay and verify it restarts.',
  demo:['Approach the lane','Raise the arm','Pause under the arm','Clear both beams','Lower after the hold time'],
};
