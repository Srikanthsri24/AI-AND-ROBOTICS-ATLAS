import type { Build } from './guided-projects';

export const vendingLanes=[
  {name:'Classic',price:1,color:'#b4474b'},
  {name:'Cherry',price:2,color:'#965684'},
  {name:'Citrus',price:2,color:'#dcaa56'},
  {name:'Zero',price:3,color:'#465c7a'},
] as const;
export const vendTiming={gateMs:650,expireMs:1600,confirmMs:920};
export const vendingMachine:Build={
  id:'directory-81',title:'Four-Slot Coin-Operated Cola Vending Machine',
  outcome:'Build a four-lane tabletop dispenser. Insert a classroom token, select a lane, and watch the controller deduct credit only after a can crosses the exit sensor.',
  parts:[
    ['Arduino Uno R3','1','Tracks credit, stock and two break-beam signals.'],
    ['3 mm IR break-beam pair','2 pairs','One counts tokens and another confirms that a can passed through the shared chute.'],
    ['Positional micro servo','4','One runs the two-stop release on each lane.'],
    ['Momentary tactile start button','4','Selects Classic, Cherry, Citrus or Zero.'],
    ['Plain steel washer','Several','Use uniform washers as classroom tokens. The optical slot counts passages.'],
    ['Cardboard vending cabinet and dummy cans','1 cabinet and 8 cans','Make four sloped channels and a shared exit. Use light clean empty cans or same-size cardboard cylinders.'],
    ['External regulated arm servo supply','1 set','Use a regulated 5 V supply and distribution rated for the four servos.'],
    ['Breadboard and jumper wires','1 set','Connect buttons and receiver signals. Route servo power through rated terminals.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and exposes the credit log in Serial Monitor.'],
  ],
  assembly:[
    ['Build four inclined lanes','Make equal straight channels with dividers and a slope just enough for an empty can to roll. Connect their outlets to one shared tray. Mark the front buttons and initial stock of two cans per lane.','Each lane can feed a can to the same opening without snagging.',[3,5]],
    ['Fit one two-stop release per lane','On a bench, make a servo-driven rocker with a lower stop that holds the front can and an upper stop that holds the next one. At release, the upper stop engages before the lower one clears. Return to rest so only the next can advances. Repeat for four lanes.','Turning the unpowered rocker by hand yields only one can per cycle.',[2,5]],
    ['Place both optical gates','Put the token pair across a narrow guide so the washer presents its solid rim to the beam. Put the product pair across the shared chute. Align and test one pair at a time.','Each sensor produces one interruption per intended passage.',[0,1,4,5,7]],
    ['Wire and center the servos','Wire the two receivers, four switches and four servo signals. Join the external servo ground to Uno ground. With horns detached, upload and verify resting travel before fitting horns with power off.','All four gates hold their lanes closed at startup and each button moves its own gate.',[0,1,2,3,6,7,8]],
    ['Load, vend and test a jam','Put two sample cans per lane. Insert a token and select a one-credit lane. Confirm the chute sensor before counting the sale. Block the chute or retain a can and repeat. Clear the mechanism with power off before resetting and reloading the model.','A confirmed dispense decrements credit and lane stock. A missed passage preserves credit and latches the machine.',[0,1,2,3,4,5]],
  ],
  wiring:[
    ['Uno 5 V / GND','Both IR emitter and receiver power leads','Receiver signals are active low'],
    ['Token / product receiver signals','Uno D2 / D3','Internal pull-ups'],
    ['Uno D4–D7','Classic, Cherry, Citrus, Zero switches → GND','One active-low input per lane'],
    ['Uno D8–D11','Classic through Zero servo signal leads','One servo per lane'],
    ['External regulated 5 V and negative','Servo power distribution','Share negative with Uno ground'],
    ['Computer USB','Uno USB-B','Power, upload and log'],
  ],
  test:'Start with two cans in each lane and no credit. Try selecting an unaffordable lane. Insert tokens and verify one can per confirmed vend. Select an empty lane, then simulate a jam and verify that the balance is retained and new selections are locked.',
  demo:['Credit and chute confirmation','Waiting','Dispensing','The gates stay closed','One can falls and credit is deducted'],
};
