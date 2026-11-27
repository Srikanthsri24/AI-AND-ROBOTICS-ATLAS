/** Authored tabletop apparatus in mm; not a commercial faucet CAD model. */
export type TapPoint=readonly[number,number,number];
export const tapPlumbing={pump:[-205,260,-70] as TapPoint,sonarFace:[45,400,40] as TapPoint,echoTarget:[45,140,40] as TapPoint,spout:[0,400,40] as TapPoint,intake:[-90,30,-50] as TapPoint,tankFloor:18,tankTop:115,tankInnerWidth:244,tankInnerDepth:164,levelCenter:70,wall:3};
export const tapIntakePath:readonly TapPoint[]=[[-222,218,-70],[-222,120,-70],[-90,120,-50],tapPlumbing.intake];
export const tapOutletPath:readonly TapPoint[]=[[-188,218,-70],[-188,192,-70],[-160,192,-70],[-160,420,-70],[0,420,-70],[0,420,40],tapPlumbing.spout];
export const tapSpoutSleeve:readonly TapPoint[]=[[0,360,-70],[0,420,-70],[0,420,40],tapPlumbing.spout];
export const tapReturnPath:readonly TapPoint[]=[[95,135,35],[95,105,35]];
export const tapTankCapacityMl=(tapPlumbing.tankTop-tapPlumbing.tankFloor)*tapPlumbing.tankInnerWidth*tapPlumbing.tankInnerDepth/1000;
export function tapWaterHeight(volumeMl:number){if(!Number.isFinite(volumeMl)||volumeMl<0||volumeMl>tapTankCapacityMl)throw new RangeError('Invalid tap reservoir volume');return tapPlumbing.tankFloor+volumeMl*1000/(tapPlumbing.tankInnerWidth*tapPlumbing.tankInnerDepth);}
export function tapTankWet(volumeMl:number){return tapWaterHeight(volumeMl)>=tapPlumbing.levelCenter;}
export const tapPlumbingParts=[
 ['tap-base','Weighted workbench base','Supports the reservoir and dry frame. Keep this base level so gravity return flows into the tank.'],
 ['tap-frame','Dry equipment frame','Supports the pump and sensors above the water. The rear uprights carry the spout support and the dry electronics shelf.'],
 ['tap-pump-bracket','Pump mounting bracket','Fastens the pump flange to the frame. The motor stays outside the splash area; tubing carries the water.'],
 ['tap-tank','Thin-wall reservoir','Stores the demonstration water. The 3 mm nonmetal wall lets the external capacitive sensor check whether water reaches its height.'],
 ['tap-water','Reservoir water','The pump intake must stay submerged. Refill above the sensor position before testing; the controller stops pumping when the level reads low.'],
 ['tap-basin','Collection basin','Catches water below the spout and drains through the return opening into the reservoir.'],
 ['tap-basin-legs','Basin supports','Raise the basin above the tank so water can return by gravity without an additional pump.'],
 ['tap-return','Gravity return tube','Connects the basin drain to the open tank below. It carries the collected water back to the reservoir.'],
 ['tap-intake','Submerged intake line','Runs from the inlet lead over the reservoir rim to a submerged intake. Keep its opening below the minimum water line.'],
 ['tap-outlet','Pump-to-spout line','Carries water from the pump outlet to the spout. Its continuous silicone bore keeps water separate from the pump motor.'],
 ['tap-spout','Spout support sleeve','Holds the silicone outlet downward over the basin. The inner silicone tube carries the water through this support.'],
 ['tap-spout-clamps','Spout mounting clamps','Fix the vertical sleeve to the dry frame so the stream remains aimed into the basin.'],
 ['tap-echo-target','Clear-space echo target','Provides a flat return 26 cm below the sonar face. It is offset from the stream; a hand above it produces a closer reading.'],
] as const;
