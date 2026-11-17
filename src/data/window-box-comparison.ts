import type {Build} from './guided-projects';

export const windowBoxComparison:Build={
  id:'window-box-comparison',
  title:'Window box comparison',
  outcome:'Compare how quickly two matched soil samples dry near a sunny window and in a shaded part of the same room.',
  parts:[
    ['Arduino Uno R3','1','Reads both channels and logs paired changes from baseline.'],
    ['SEN0193 capacitive soil probe','2','Measure the window and shade samples at the same depth.'],
    ['Matched window boxes and drip trays','2 sets','Hold equal amounts of the same soil and keep runoff separate.'],
    ['Dry and damp soil samples','2 references','Set each probe’s endpoints in the same mix used in the boxes.'],
    ['Graduated cylinder','1','Measures identical initial doses.'],
    ['Breadboard and jumper wires','1 set','Connects the probes to A0 and A1 with shared power and ground.'],
    ['USB-A to USB-B data cable','1','Powers the board and carries the log.'],
  ],
  assembly:[
    ['Set up the two positions','Set one box near a sunny window and one farther into the same room out of direct sun. Put both on stable indoor surfaces. Use identical boxes with equal soil mass, fill depth, and drainage. Keep them away from heaters and drafts.','Both positions are named and the only planned change is the placement.',[2,4]],
    ['Wire the probes','Unplug USB. Wire both VCC leads to 5 V and both grounds to GND. Connect the window signal to A0 and the shade signal to A1. Label the leads, and route them clear of walkways and drip trays.','The probe connectors and board are dry, and the channels match the labels.',[0,1,5]],
    ['Calibrate and start from similar moisture','Capture both probes in the dry reference with d, then in the damp reference with w. Mix equal water doses into both boxes. Insert the blades at matching depths away from the walls. When the readings settle, send b.','The sketch captures both baselines. If they differ widely, check the soil mixture and placement before starting.',[0,1,2,3,4,6]],
    ['Compare the traces','Send l at matched times and note sun or cloud cover and any changes in room conditions. Compare each loss from baseline and the difference between losses. Repeat with freshly prepared soil and switch which probe goes in each position.','Both logs capture the same intervals. Record a repeated difference or report that the positions gave similar results.',[0,1,2,6]],
  ],
  wiring:[
    ['Uno 5 V','Both probe VCC pins','Sensor supply'],
    ['Uno GND','Both probe GND pins','Shared reference'],
    ['Uno A0','Window box probe analog output','Window position'],
    ['Uno A1','Shade box probe analog output','Shaded position'],
  ],
  test:'Check that both calibrated channels start at zero loss. Keep the sampling times matched. A positive window-minus-shade loss means the window box lost more relative-index points.',
  demo:['Two placements','Paired baseline','Track daylight','Compare losses','Repeat'],
};
