/** Authored classroom scanner dimensions in millimetres; not manufacturer CAD. */
export const radarScanner = {
  base: {width:80,depth:60,bottom:2,top:6},
  servo: {left:-6.1,right:16.9,bottom:8,top:32,halfDepth:6.1,earBottom:27,earTop:29},
  mountAxes:[-10.1,20.9],
  shaft:{radius:2.4,bore:.7,bottom:32.5,top:40},
  horn:{bottom:38,top:40,bore:2.5,fasteners:[-10,10]},
  bracket:{bottom:40,top:42,halfWidth:23,halfDepth:9,hubBore:3.6,strapBack:-3.6,strapFront:-1.6,strapBottom:42,strapTop:78},
  sonar:{centreY:68,holes:[[-20,-7.5],[20,-7.5],[-20,7.5],[20,7.5]]},
} as const;
export const radarScannerParts = [
 ['radar-base','Weighted scanning base','Keeps the shaft vertical while the head turns through 30–150°. The printed arc shows the commanded bearing, not a measured compass heading.','Four feet lift the base; two bored posts align with the servo mounting ears.'],
 ['radar-feet','Non-slip feet','Support the base above the table and leave clearance for the underside fasteners.','The four pads carry the base; the servo does not rest on the table.'],
 ['radar-posts','Drilled mounting posts','Support the servo ears above the base. Each post has a real through-bore.','The lower bolts secure each post to the base; separate upper screws retain the servo.'],
 ['radar-post-bolts','Base-to-post fasteners','Pass through the base and into the support posts without blocking the top mounting screws.','Their heads remain above the bench because the feet lift the base.'],
 ['radar-servo-case','Positional servo housing','Contains the motor, reduction gears and position controller. The housing stays still while its shaft turns.','A separate regulated 5 V supply powers the servo; D9 provides its position request and all signal grounds join.'],
 ['radar-servo-bolts','Servo ear fasteners','Hold the drilled mounting ears against the tops of the posts.','Tighten these before centring the bare output shaft. They must not clamp the rotating horn.'],
 ['radar-shaft','Servo output shaft','Rotates towards the requested angle when both servo power and common ground are present.','Centre the bare shaft at 90° first. Switch off power before fitting the horn. The shaft motion here is an authored animation, not a servo speed specification.'],
 ['radar-horn','Removable servo horn','Transfers rotation from the output shaft to the lightweight sensor bracket.','Its central socket surrounds the shaft; two small fasteners connect the horn arms to the bracket. A fitting offset changes the sensor bearing.'],
 ['radar-hub-screw','Horn retaining screw','Retains the horn on the output shaft after it has been centred and fitted.','The screw passes through the small hub-cap opening. Remove it before withdrawing the horn.'],
 ['radar-bracket','Open-backed lightweight bracket','Two side straps support the sensor while leaving its rear electronics unobstructed.','The floor bolts to the horn. Four bores align with the actual HC-SR04 mounting holes; the lower header stays clear of the floor.'],
 ['radar-bracket-bolts','Horn-to-bracket screws and nuts','Secure the bracket floor to the two horn arms.','The two screws pass through aligned bores; the nuts seat beneath the horn, clear of the fixed servo cover.'],
 ['radar-sonar-bolts','Sensor mounting screws and nuts','Retain the HC-SR04 at its four mounting holes.','Each screw passes through the PCB and a side strap; the rear nuts remain clear of the centre controller chip.'],
 ['radar-sonar-pcb','HC-SR04 scanning module','Carries the two ultrasonic cans and the timing electronics on the rotating head.','Uno 5 V powers VCC, Uno GND provides the reference, D2 drives TRIG and D3 reads ECHO.'],
 ['radar-sonar-transmitter','Ultrasonic transmitter · T','Sends sound towards the target after the sketch produces a 10 µs trigger pulse.','The transmitted ray follows the actual head bearing. A finite flat card must intersect that ray to produce the workshop’s simplified echo.'],
 ['radar-sonar-receiver','Ultrasonic receiver · R','Receives the reflected sound from the target.','ECHO reports a round-trip time. The sketch converts it to centimetres and prints −1 for missing or out-of-range returns.'],
 ['radar-sonar-controller','Sonar timing electronics','Creates the burst and measures its return; this is distinct from the Uno controlling the sweep.','The open bracket back leaves room for these real rear component surfaces.'],
 ['radar-sonar-vcc','Sonar VCC contact','Supplies the sensor from the Uno 5 V rail.','Keep this positive rail separate from the independent servo supply positive.'],
 ['radar-sonar-trigger','Sonar TRIG contact · D2','Receives LOW for 2 µs, HIGH for 10 µs, then LOW to initiate each reading.','Connect to Uno D2. The sketch waits 90 ms after commanding a position before triggering.'],
 ['radar-sonar-echo','Sonar ECHO contact · D3','Returns the timed pulse used by pulseIn with a 10,000 µs timeout.','Connect to Uno D3. Valid readings must lie between 10 and 150 cm.'],
 ['radar-sonar-ground','Sonar GND contact','Provides the sensor’s electrical reference.','Connect to Uno GND, which also joins the servo supply negative; joining grounds does not join the positive rails.'],
] as const;

export function radarHeadPoint(point:readonly[number,number,number],heading:number):[number,number,number]{
 const angle=(heading-90)*Math.PI/180,c=Math.cos(angle),s=Math.sin(angle);
 return[point[0]*c+point[2]*s,point[1],-point[0]*s+point[2]*c];
}
export function radarSonarContact(x:number,heading:number):[number,number,number]{return radarHeadPoint([x,radarScanner.sonar.centreY-16,0],heading);}
