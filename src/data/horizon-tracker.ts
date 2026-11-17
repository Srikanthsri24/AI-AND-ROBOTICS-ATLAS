import type { Build } from './guided-projects';

export const headings=Array.from({length:13},(_,i)=>-60+i*10);
export const sweepThreshold=180;
export function horizonReading(heading:number,lamp:number,brightness:number){
  const alignment=Math.max(0,Math.cos((lamp-heading)*Math.PI/180));
  return Math.round(32+brightness*9.35*alignment**8);
}

export const horizonTracker:Build={
  id:'directory-66',title:'Automatic Solar Tracker Using Sensors',
  outcome:'Build a single-axis tracker that sweeps a directional light sensor across 13 headings, remembers the brightest one and rotates its panel to face it.',
  parts:[
    ['Arduino Uno R3','1','Reads the sensor, logs each heading and remembers the strongest reading.'],
    ['Photoresistor','1','Sits in a short opaque hood so it responds more strongly when pointed at the lamp.'],
    ['10 kΩ divider resistor','1','Completes the light sensor divider and makes the A0 reading increase as the sensor brightens.'],
    ['Positional micro servo','1','Turns the panel and sensor together around a vertical axis.'],
    ['Voltaic P123 mini solar panel','1','Use a lightweight panel with its output connector insulated. It rides on the carrier while the Uno and servo use separate supplies.'],
    ['Cardboard turntable carrier and light hood','1 set','Use stiff lightweight card, an opaque tube, tape and a flat base. Center the panel over the servo horn.'],
    ['Regulated 5 V supply and adapter','1 set','Powers the servo. Use a regulated supply rated for that servo’s stall current.'],
    ['Momentary tactile start button','1','Triggers a fresh scan between automatic sweeps.'],
    ['Breadboard and jumper wires','1 set','Carries logic wiring. Use flexible leads with slack around the rotating carrier.'],
    ['USB-A to USB-B data cable','1','Powers the Uno and carries samples to Serial Monitor.'],
  ],
  assembly:[
    ['Center the unloaded servo','Connect the servo separately and keep its horn detached. Upload the sketch, then power the servo. Switch off both supplies before fitting the horn. Mark the center heading on the base.','Center is mechanical 90°, shown as 0° in the log.',[0,3,6,9]],
    ['Fit the fixed-angle carrier','Secure the servo upright to a flat base. Put the panel on a lightweight tilted support so it rotates horizontally around the horn. Keep the center of mass close to the shaft and check cable slack.','The carrier clears the bench and the wires have enough slack throughout travel.',[3,4,5]],
    ['Aim the light sensor','Tape the photoresistor in a short matte opaque tube beside the panel. Aim it in the same horizontal direction as the panel face. Keep its two leads apart and strain-relieved.','The raw light count drops when the hood points away from the lamp.',[1,2,5,8]],
    ['Wire the input and button','Put the photoresistor between Uno 5 V and A0. Put 10 kΩ from A0 to ground. Connect the scan button between D2 and ground and the servo signal to D9. Keep positive rails separate and join their negatives.','The sensor divider, switch and servo share ground.',[0,1,2,3,6,7,8]],
    ['Run, record and move the lamp','Put a desk lamp inside the sweep arc. Press Scan and watch the log. Move the lamp and check the next scan. Cover the sensor and verify that the servo returns to the last retained heading.','A bright sweep retains the strongest heading. A dim sweep leaves the retained heading unchanged.',[0,1,3,4,7]],
  ],
  wiring:[
    ['Uno 5 V','Photoresistor first lead','Divider source'],
    ['Photoresistor second lead','Uno A0 and one 10 kΩ resistor lead','Sample junction'],
    ['Other 10 kΩ resistor lead','Uno GND','Divider return'],
    ['Uno D2','Scan switch → GND','Internal pull-up'],
    ['Uno D9','Servo signal','Single-axis heading control'],
    ['External 5 V / GND','Servo V+ / GND','Independent servo power'],
    ['External negative','Uno GND','Shared reference'],
    ['Computer USB','Uno USB-B','Power, upload and logging'],
  ],
  test:'Scan a lamp on the left and then the right. The winning heading should change sides. With a stationary lamp, repeat the sweep and compare the peaks. Cover the sensor so all readings are below 180. The panel should return to the previously retained heading after scanning.',
  demo:['Directional light reading','Searching','Facing brightest heading','All 13 positions are sampled','The panel returns to the recorded heading'],
};
