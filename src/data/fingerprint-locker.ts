import type { Build } from './guided-projects';

export const fingerprintLocker:Build={
  id:'directory-58',title:'Fingerprint-Based Bank Locker System',
  outcome:'Build a tabletop locker that recognizes an enrolled fingerprint, retracts a servo latch, and waits for the door to close before it relocks.',
  parts:[
    ['Arduino Uno R3','1','Talks to the fingerprint module, reads the door contact and positions the latch servo. Power it over USB.'],
    ['Adafruit 751 optical fingerprint sensor','1','Use the pictured four-wire module or a pin-compatible optical UART module rated for 5 V power and Uno logic. Verify both ratings before wiring. It compares scans to templates stored on the module. The Uno receives a match ID.'],
    ['Positional micro servo','1','A 5 V positional servo turns a short cardboard latch tab. Bring its horn and screw.'],
    ['Magnetic door contact switch','1 pair','Use a pair that closes when the magnet is near. It tells the Uno when the door is against its frame.'],
    ['Regulated 5 V supply and adapter','1 set','Power the servo and sensor from this supply, sized for their combined peak demand. Tie its negative terminal to Uno ground.'],
    ['Cardboard locker and keeper','1','Use a small hinged cardboard box turned on its side. Add a cardboard latch tab and a slot or keeper inside the frame.'],
    ['Breadboard and jumper wires','1 set','Routes logic and ground. Connect servo power through rated screw terminals.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and provides an upload and diagnostic link.'],
  ],
  assembly:[
    ['Make the locker and keeper','Set the cardboard box on its side with the flap hinged along one vertical edge. Reinforce the opposite upright and tape a keeper just behind the free edge of the door.','The door closes flush and you can reach the servo before fitting the tab.',[5]],
    ['Fit the scanner and door contact','Mount the scanner face-up on a small ledge outside the box. Tape the wired contact to the frame and the magnet to the door. Verify continuity only when the door is shut.','The scanner window is accessible and the magnet clears the moving latch.',[1,3,5]],
    ['Connect data, power and ground','Follow the wiring map with both supplies off. Read the model documentation to identify sensor TX and RX. Join the external ground to the Uno ground while keeping their positive supplies separate.','D2 receives sensor TX, D3 sends to sensor RX, and D4 reads the door contact.',[0,1,2,3,4,6,7]],
    ['Fit the tab to the servo horn','Run the sketch with the door closed and the horn uninstalled. The target is 20° at rest and 85° when unlocked. Disconnect power, then position the horn so the tab catches at rest and clears the keeper at the unlocked angle.','The tab is loose enough to cross both positions without hitting the frame or straining the motor.',[0,2,4,5]],
    ['Test access and reclosing','Enroll a consenting participant’s test finger at ID 1. Scan a different finger, then scan ID 1. Open the door during the release window. Close it after a few seconds.','Only ID 1 releases the tab. The latch stays clear while the door is open and returns after closing.',[0,1,2,3]],
  ],
  wiring:[
    ['External regulated 5 V','Sensor power and servo V+','Separate from Uno USB 5 V'],
    ['External negative','Servo GND, sensor GND, Uno GND','Shared signal reference'],
    ['Sensor TX','Uno D2','Serial data from scanner'],
    ['Uno D3','Sensor RX','Serial requests to scanner'],
    ['One door contact lead','Uno D4','Internal pull-up. Closed door reads LOW.'],
    ['Other door contact lead','Uno GND','Contact returns to ground'],
    ['Uno D9','Servo signal','Position command'],
    ['Computer USB','Uno USB-B','Upload and diagnostics'],
  ],
  test:'A recognized ID 1 releases the latch for five seconds. If the door opens within that window, the latch stays retracted until the door closes. An unrecognized scan or a different stored ID leaves it locked. Remove your test template from the module after the session.',
  demo:['Fingerprint match','Locked','Released','Door tab holds the door','Recognized ID retracts the latch'],
};
export const lockerReleaseMs=5000;
