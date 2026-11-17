import type { Build } from './guided-projects';

export const tankLimits={low:30,high:75,reserve:15,runLimit:45,fillPerSecond:3};
export const tankRefill:Build={
 id:'directory-54',
 title:'Smart Water Level Monitoring and Automatic Pump Control',
 outcome:'Transfer water between two small containers. Start below the low mark, stop at the upper mark, and cut pump power when the supply tank runs low.',
 parts:[
  ['Arduino Uno R3','1','Reads three level switches and sends an on/off command to the pump driver. Use a USB data cable.'],
  ['SEN0485 capacitive level sensor','3','Two sensors detect low and high marks on the receiving tank. The third checks the supply tank above its intake.'],
  ['5 V peristaltic pump with tubing','1','Moves water from the supply tank to the receiving tank through silicone tubing.'],
  ['STEMMA MOSFET driver and lead','1 set','Switches current from the independent 5 V supply.'],
  ['Regulated 5 V pump supply and adapter','1 each','Powers the pump through the driver. The Uno has its own USB power.'],
  ['Clear refill tanks and spill tray','2 tanks and 1 tray','Use small flat-sided nonmetal containers with sensing walls under 3 mm thick. Keep the receiving tank’s upper mark well below its rim.'],
  ['Breadboard and jumper wires','1 set','Routes the three sensor signals and joins both grounds. Keep the breadboard above and outside the spill tray.'],
 ],
 assembly:[
  ['Mark both containers','Place both containers in a spill tray. On the receiving tank mark a lower start level and an upper stop level with free space above it. Place the supply sensor above the intake. Test that each sensor changes state through the wall before fixing it in place.','The sensors make flat contact. The supply sensor goes dry before the intake is exposed.',[1,5]],
  ['Mount the pump and route tubing','Mount the pump on a dry stand above the tray, away from splashes. Secure the inlet below the supply sensor. Fix the outlet above the receiving tank’s waterline. Keep the tubing runs short and avoid pinching them.','The inlet and outlet cannot move when the pump starts. The outlet sits above the waterline with an air gap.',[2,5]],
  ['Wire the sensors and driver','Disconnect USB and the pump supply. Connect the three green OUT wires to D2, D3 and D4. Connect the driver input to D9. Feed driver V+ from the separate supply and tie its ground to Uno ground.','Each sensor reads LOW at its wet mark. The pump draws current from the driver supply.',[0,1,3,4,6]],
  ['Check before pumping water','With the pump supply off, open Serial Monitor and record how every sensor changes as you pour water in and out by hand. Then turn on pump power and verify that the upper sensor stops a fill.','Filling starts below the low mark, continues through the gap, and stops at the upper mark.',[0,1,2,3,5]],
  ['Verify the stop cases','With the pump supply off, let the supply sensor go dry and check the requested pump state. Use the Finished demo to rehearse a conflicting reading and the run limit. Keep the low-voltage supply switch accessible during the wet test.','A dry source blocks pumping. A confirmed conflict or run timeout remains locked until reset.',[0,1,3,4,5]],
 ],
 wiring:[
  ['Uno 5 V / GND','All three SEN0485 VCC / GND leads','Sensor power and common reference'],
  ['Receiving tank lower OUT','Uno D2','Requests refill when dry'],
  ['Receiving tank upper OUT','Uno D3','Stops filling when wet'],
  ['Supply tank sensor OUT','Uno D4','Disables fill when supply is low'],
  ['Uno D9','Driver IN','Pump control'],
  ['External regulated 5 V and negative','Driver V+ / GND; tie GND to Uno GND','Motor power and shared reference'],
  ['Driver OUT+ and OUT−','Pump positive and negative','Switched motor current'],
 ],
 test:'Watch the three input bits and pump state at 115200 baud. Drain the receiving tank below the low sensor, confirm the request, then verify that the request stays active until the upper sensor gets wet. With pump power off, let the source sensor go dry and confirm the pump command drops. Restore safe sensor readings before sending R to clear a latched fault.',
 demo:['Receiving tank','Below the lower sensor','At the upper sensor','Pump runs','Pump stops'],
};
