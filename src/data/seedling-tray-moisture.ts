import type {Build} from './guided-projects';

export const seedlingTrayMoisture:Build={
  id:'seedling-tray-moisture-check',
  title:'Seedling tray moisture check',
  outcome:'Compare two neighboring cells in a seedling tray and identify which cell needs checking before watering the whole tray.',
  parts:[
    ['Arduino Uno R3','1','Reads two analog channels and lights the flag for each cell independently.'],
    ['SEN0193 capacitive soil probe','2','One probe measures the outer cell and one measures its inner neighbor.'],
    ['Seed tray and divided test base','1 set','Use two neighboring cells deep enough for the blades, plus a drip tray below.'],
    ['Dry and damp soil samples','2 cups','Give both probes dry and damp references from the same mix as the tray.'],
    ['LED and 330 Ω resistor','2 pairs','Use one LED per cell and mark each with its matching cell name.'],
    ['Breadboard and jumper wires','1 set','Carry power and signals with the breadboard away from runoff.'],
    ['USB-A to USB-B data cable','1','Powers the controller and connects it to Arduino Serial Monitor.'],
  ],
  assembly:[
    ['Choose two cells to compare','Label one outer cell EDGE and its neighboring cell INNER. Fill both with the same potting mix. Use large cells or a divided planter insert so each sensing blade can sit at the same depth with its connector above the mix.','The two cells have similar fill heights, separate drainage and fixed probe positions.',[1,2]],
    ['Connect and label the channels','Unplug USB. Use the probe connector markings to identify power, ground and signal. Connect both supplies to 5 V and both grounds to GND. Wire EDGE signal to A0 and INNER signal to A1. Connect D8 and D9 through separate 330 Ω resistors to the corresponding LED anodes, with both cathodes grounded.','The signal and LED labels match for each cell, and all electronics share ground.',[0,1,4,5]],
    ['Calibrate both probes in the same mix','Upload the sketch. Put both blades into the dry reference, spaced apart at the marked depth, and send d in Serial Monitor once the readings settle. Wipe the blades, repeat in the damp reference and send w. Use cups wide enough to keep the probes separated.','Each probe gets its own pair of endpoints. The log flags any channel whose endpoints are too close.',[0,1,3,6]],
    ['Test a local moisture difference','Put the probes in the labeled cells. Compare both readings. Add a small amount of water to the flagged cell only and give it time to spread. Keep the nearest cell unchanged for comparison.','Only the watered cell rises appreciably. Its LED clears at 45 or above. Its neighbor keeps its own state.',[1,2,4]],
  ],
  wiring:[
    ['Uno 5 V','Probe VCC on both channels','Shared 5 V supply'],
    ['Uno GND','Both probe grounds and LED cathodes','Shared return'],
    ['Uno A0','EDGE probe analog output','Outer tray cell reading'],
    ['Uno A1','INNER probe analog output','Neighboring cell reading'],
    ['Uno D8','330 Ω → EDGE LED anode','Outer cell dry flag'],
    ['Uno D9','330 Ω → INNER LED anode','Inner cell dry flag'],
  ],
  test:'Compare the dry and damp cups, then water a single tray cell. Each LED turns on at 35 or below and clears at 45 or above for its own channel.',
  demo:['Neighboring cells','Check two readings','Water one cell','Local flag clears','Neighbor keeps its state'],
};
