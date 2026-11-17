import type {Build} from './guided-projects';

export const sunlitWindow:Build={
  id:'sunlit-window-monitor',title:'Sunlit window monitor',
  outcome:'Compare a warm windowsill with a shaded reference and flag a local warm spot when both temperature and temperature difference pass their limits.',
  parts:[
    ['Arduino Uno R3','1','Compares the two temperature channels and drives the flag.'],
    ['Pair of TMP36 air sensors','2','One reads beside the sill and one reads shaded air at the same height.'],
    ['LED and 330 Ω resistor','1 pair','Shows a pronounced warm spot near the sill.'],
    ['Model sill and shade hood','1 set','Keeps the reference probe shaded while air can reach both probes.'],
    ['Digital reference thermometer','1','Checks the two channels against the same reading.'],
    ['Breadboard and jumper wires','1 set','Holds the connections and shared ground.'],
    ['USB-A to USB-B data cable','1','Powers and programs the Uno.'],
  ],
  assembly:[
    ['Build the sill and mount two probes','Set up a card window with a warm test area and a shaded reference. Put the two TMP36 packages at equal heights. Shade the reference with a card hood that is open at the sides.','Neither probe touches the surface. Air reaches both and direct light cannot strike the reference sensor.',[1,3]],
    ['Wire and label both analog inputs','Disconnect USB. Identify the pinout, put both supplies on 5 V and both grounds on GND. Put the sill output on A0 and the shaded reference on A1.','The two sensor outputs are separate and match the position labels.',[0,1,5]],
    ['Connect the warning and compare sensor offsets','Wire D8 through 330 Ω to the LED anode and ground the cathode. Put both sensors by the same reference thermometer in shade first. Record any steady offsets.','The two channels agree at baseline after calibration.',[0,1,2,4,6]],
    ['Test local and uniform warming','Expose the sill area while leaving the reference shaded. Use a sealed bottle of warm water near the sill as a repeatable alternative. Then compare both probes in the same warm air.','A local warm difference triggers the flag. Warming both equally leaves it clear.',[1,2,3,4]],
  ],
  wiring:[
    ['Uno 5 V','Both TMP36 supply pins','Shared sensor supply'],
    ['Uno A0','Sill TMP36 output','Local air reading'],
    ['Uno A1','Shaded TMP36 output','Comparison reading'],
    ['Uno GND','Both sensor grounds and LED cathode','Shared return'],
    ['Uno D8','330 Ω resistor → LED anode','Local warm-spot flag'],
  ],
  test:'Compare 31 °C at the sill and 27 °C in shade. The flag turns on. At 31 °C and 29 °C it clears. At 32 °C on both probes it stays off.',
  demo:['Sill temperature difference','Equal air readings','Warmer sill','Flag off','Local warm-spot flag on'],
};
