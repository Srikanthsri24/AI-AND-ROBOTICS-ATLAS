type Model = [string, string, string, string, number, number, (a:number,b:number,t:number)=>number];
const models: Model[] = [
  ['Panel heartbeat','Timer','LED','logic',5,2,(a,b,t)=>+(t%Math.max(1,a)<b)],
  ['Low-current indicator','Supply voltage','LED current','mA',3,8,(a,b)=>Math.max(0,a-2)*10/Math.max(1,b)],
  ['Fast fault indicator','Fault count','Alarm LED','logic',5,3,(a,b,t)=>+(a>=b&&t%2===0)],
  ['Slow standby beacon','Standby interval','Beacon','logic',8,1,(a,b,t)=>+(t%Math.max(1,a)===0&&b>0)],
  ['Startup check lamp','Test duration','Lamp','logic',4,1,(a,b,t)=>+(t<a&&b>0)],
  ['Current-limit fault','Supply voltage','Excess current','mA',7,4,(a,b)=>Math.max(0,(a-2)*10/Math.max(1,b)-20)],
  ['Low-voltage indicator','Supply voltage','Voltage margin','V',3,2,(a,b)=>a-b],
  ['High-resistance indicator','Supply voltage','Resistor dissipation','mW',5,10,(a,b)=>10*Math.max(0,a-2)**2/Math.max(1,b)],
  ['Inspection timer lamp','Batch size','Completed intervals','cycles',6,3,(a,b,t)=>Math.min(a,Math.floor(t/Math.max(1,b)))],
  ['Service-mode indicator','Pulse count','Burst indicator','logic',3,4,(a,b,t)=>+(t%(a*2+b+1)<a*2&&t%2===0)],
  ['Doorbell input','Button state','Call signal','logic',1,0,(a)=>+(a>0)],
  ['Machine jog request','Jog input','Jog permission','logic',1,1,(a,b)=>+(a>0&&b>0)],
  ['Quiz buzzer button','Contestant A','Winning channel','channel',1,0,(a,b)=>a>0?1:b>0?2:0],
  ['Enclosure tamper switch','Lid contact','Tamper alert','logic',0,1,(a,b)=>+(a===0&&b>0)],
  ['Foot pedal input','Pedal travel','Measurement trigger','logic',4,6,(a,b,t)=>+(a>=b&&t===1)],
  ['Home-position switch','Travel position','Home contact','logic',2,1,(a,b)=>+(a<=b)],
  ['Service override input','Override switch','Effective mode','mode',1,2,(a,b)=>a>0?9:b],
  ['Door-closed confirmation','Left contact','Door confidence','contacts',1,1,(a,b)=>+(a>0)+ +(b>0)],
  ['Operator acknowledgment','Acknowledge key','Pending requests','requests',1,5,(a,b,t)=>Math.max(0,b-(a>0?t:0))],
  ['Stuck-button diagnosis','Held input','Stuck warning','logic',1,4,(a,b,t)=>+(a>0&&t>=b)],
  ['Pedestrian crossing trainer','Crossing duration','Time left','s',8,1,(a,b,t)=>Math.max(0,a-t*b)],
  ['Warehouse aisle signals','Aisle A demand','Granted aisle','aisle',6,3,(a,b)=>a>b?1:b>a?2:0],
  ['Single-lane bridge demo','Clearance duration','Bridge phase','phase',4,3,(a,b,t)=>Math.floor(t/Math.max(1,a+b))%2],
  ['Track crossing model','Train distance','Crossing signal','logic',9,3,(a,b,t)=>+(Math.max(0,a-t)<=b)],
  ['Short-cycle signal tester','Test interval','Lamp under test','channel',2,3,(a,b,t)=>Math.floor(t/Math.max(1,a))%Math.max(1,b)+1],
  ['Long green demonstration','Green duration','Green share','%',8,2,(a,b)=>a/Math.max(1,a+b)*100],
  ['Loading bay indicator','Dock sensor','Stop signal','logic',1,0,(a,b)=>+(a>0||b>0)],
  ['Gate sequence prototype','Opening time','Gate position','%',6,2,(a,b,t)=>100*Math.min(1,(t+b)/Math.max(1,a))],
  ['Balanced phase comparison','Red duration','Timing difference','s',5,5,(a,b)=>Math.abs(a-b)],
  ['Amber timing comparison','Warning duration','Amber lamp','logic',3,4,(a,b,t)=>+(t>=b&&t<b+a)],
  ['Tank-level warning','Liquid level','Headroom','cm',7,9,(a,b)=>b-a],
  ['Light threshold alarm','Light sensor','Brightness alarm','logic',6,4,(a,b)=>+(a>b)],
  ['Equipment temperature warning','Temperature index','Warning severity','level',8,4,(a,b)=>Math.max(0,Math.min(3,a-b))],
  ['Door pressure alert','Pressure input','Force estimate','N',5,4,(a,b)=>a*b],
  ['Battery test threshold','Cell count','Pack voltage','V',3,4,(a,b)=>a*b/10],
  ['Filter restriction warning','Upstream reading','Pressure drop','kPa',8,3,(a,b)=>Math.max(0,a-b)],
  ['Dry soil alert trainer','Soil moisture','Water request','logic',3,5,(a,b)=>+(a<b)],
  ['Knob calibration alarm','Knob reading','Calibration error','counts',7,5,(a,b)=>Math.abs(a-b)*100],
  ['Threshold chatter investigation','Threshold center','Noisy comparator','logic',5,5,(a,b,t)=>+(a+Math.sin(t*2)>=b)],
  ['Quiet startup check','Baseline reading','Startup mute','logic',2,4,(a,b,t)=>+(t>=b&&a>1)],
  ['Parking distance demo','Echo duration','Parking zone','zone',4,5,(a,b)=>a<b?2:a<b+2?1:0],
  ['Tank headspace measurement','Echo duration','Liquid depth','cm',4,8,(a,b)=>Math.max(0,b*20-a*17.15)],
  ['Cold-room range check','Echo duration','Cold-air range','cm',8,0,(a,b)=>a*(331.3+.606*b)/20],
  ['Warm workshop correction','Echo duration','Thermal correction','cm',8,7,(a,b)=>a*.606*b*5/20],
  ['Conveyor package detection','Package range','Packages detected','items',4,5,(a,b,t)=>Math.floor(t/3)*+(a<b)],
  ['Missing echo diagnosis','Echo presence','Timeout count','events',0,3,(a,b,t)=>a===0?Math.floor(t/Math.max(1,b)):0],
  ['Near-target measurement','Echo distance','Blind-zone status','logic',2,3,(a,b)=>+(a<=b)],
  ['Long-path comparison','Echo duration','Round-trip path','m',8,5,(a,b)=>a*(331.3+b*.606)/1000],
  ['Door clearance check','Opening width','Clearance margin','cm',8,6,(a,b)=>(a-b)*10],
  ['Distance calibration exercise','Measured distance','Calibration offset','cm',6,5,(a,b)=>(a-b)*2],
  ['Camera pan bracket','Pan command','Pan angle','°',6,2,(a,b,t)=>t%2?a*18:b*18],
  ['Dial pointer','Gauge value','Pointer angle','°',5,8,(a,b)=>Math.min(180,a/Math.max(1,b)*180)],
  ['Vent flap prototype','Air demand','Flap opening','°',6,5,(a,b)=>Math.min(a*9,b*9)],
  ['Sorting gate','Item classification','Gate angle','°',4,6,(a,b,t)=>(t%3===0?a:b)*12],
  ['Gripper travel limit','Requested angle','Clamped angle','°',8,4,(a,b)=>Math.min(a,b)*18],
  ['Model rudder linkage','Stick position','Rudder angle','°',7,4,(a,b)=>90+(a-5)*b*3],
  ['Sensor scan arc','Sweep span','Scan angle','°',8,2,(a,b,t)=>90+Math.sin(t*.3*b)*a*9],
  ['Mechanical end-stop demo','Travel request','Travel remaining','°',9,10,(a,b)=>Math.max(0,b-a)*18],
  ['Neutral-position calibration','Center adjustment','Trimmed angle','°',6,5,(a,b)=>90+(a-b)*4],
  ['Small-angle positioning','Command counts','Fine position','°',3,2,(a,b)=>a*b*.5],
  ['Freezer logger','Cold temperature','Sensor voltage','V',2,5,(a)=>.5+(a-5)*.1],
  ['Indoor climate monitor','Room temperature','Comfort deviation','°C',7,5,(a,b)=>a-b],
  ['Incubator bench model','Measured temperature','Heat demand','%',4,7,(a,b)=>Math.max(0,Math.min(100,(b-a)*20))],
  ['Heatsink temperature demo','Case temperature','Thermal rise','°C',8,3,(a,b)=>(a-b)*10],
  ['Ice bath calibration','Sensor offset','Calibrated result','°C',4,5,(a,b)=>(a-b)*.2],
  ['ADC resolution comparison','ADC bit count','Quantization size','mV',4,5,(a,b)=>500*Math.max(1,b)/(2**Math.max(1,a)-1)],
  ['Outdoor winter logger','Temperature index','Daily low','°C',2,5,(a,b,t)=>(a-5)*4-Math.min(t,b)],
  ['Hot air duct monitor','Air temperature','Overtemperature','logic',9,8,(a,b,t)=>+(t>=2&&a>=b)],
  ['Sensor range endpoint','Input reading','Clipped output','°C',0,3,(a,b)=>Math.max(-40,a*20-b*20)],
  ['Warm-water test fixture','Starting temperature','Warming curve','°C',4,7,(a,b,t)=>a*10+(b-a)*10*(1-Math.exp(-t/8))],
  ['Greenhouse dashboard','Baseline temperature','Ventilation trend','°C',6,2,(a,b,t)=>a*5+Math.sin(t/3)*b],
  ['Cold-chain dashboard','Cold baseline','Warm excursion','°C',2,4,(a,b,t)=>a+Math.max(0,t-3)*b*.1],
  ['Equipment cabinet monitor','Heat load','Cabinet estimate','°C',7,3,(a,b,t)=>20+a*(1-Math.exp(-t/Math.max(1,b)))],
  ['Server-room telemetry','Rack baseline','Rack peak','°C',5,4,(a,b,t)=>a*5+Math.min(b,t)],
  ['Classroom telemetry stream','Sample rate','Packets received','packets',3,2,(a,b,t)=>Math.floor(t*a/Math.max(1,b))],
  ['Museum display case','Humidity baseline','Humidity drift','%',5,2,(a,b,t)=>Math.min(100,a*10+Math.log1p(t)*b)],
  ['Indoor comfort dashboard','Room temperature','Moving estimate','°C',5,4,(a,b,t)=>a*5+b*Math.sin(t/5)/2],
  ['Warm warehouse monitor','Sensor A','Sensor spread','°C',7,6,(a,b,t)=>Math.abs(a-b)*2+Math.sin(t/2)],
  ['Sensor stream baseline test','Source baseline','Normalized sample','ratio',3,8,(a,b,t)=>(a+Math.sin(t))/Math.max(1,b)],
  ['Boundary alert test','Initial reading','Threshold margin','°C',6,6,(a,b,t)=>a-b+(t%3-1)*.5],
  ['Conveyor drive command','Drive duty','Belt travel index','units',4,9,(a,b,t)=>t*a*b/10],
  ['Ventilation fan command','Drive duty','Airflow index','units',3,8,(a,b)=>b*(a/10)**2],
  ['Pump controller demo','Drive duty','Flow estimate','units',7,4,(a,b)=>Math.max(0,a-b)*.6],
  ['Disabled driver check','Drive duty','Interlocked voltage','V',7,0,(a,b)=>b>0?a*.6:0],
  ['Zero-duty baseline','Drive duty','Idle current estimate','A',0,5,(a,b)=>a/Math.max(1,b)],
  ['Full-duty endpoint','Supply voltage','Unapplied voltage','V',6,10,(a,b)=>a*(1-b/10)],
  ['Low-voltage motor demo','Supply voltage','Available power','W',3,6,(a,b)=>a*a/Math.max(1,b)],
  ['Supply comparison fixture','First supply','Voltage difference','V',6,9,(a,b)=>b-a],
  ['Model elevator motor','Drive setting','Lift margin','units',4,7,(a,b)=>a*2-b],
  ['Sorter feed motor','Drive setting','Items fed','items',8,3,(a,b,t)=>Math.floor(t*a/Math.max(1,b))],
  ['Hallway rover','Forward clearance','Safe travel margin','cm',6,3,(a,b)=>Math.max(0,(a-b)*10)],
  ['Shelf approach','Shelf distance','Remaining distance','cm',7,2,(a,b,t)=>Math.max(b*10,a*10-t*4)],
  ['Sensor dropout','Reading age','Validity','logic',2,4,(a,b,t)=>+(a+t<=b)],
  ['Exact stop boundary','Measured distance','Stop request','logic',3,3,(a,b,t)=>+(t>0&&a<b)],
  ['Loading zone rover','Front clearance','Speed cap','%',7,5,(a,b)=>Math.min(100,Math.max(0,(a-b)*20))],
  ['Close obstruction','Obstacle distance','Braking margin','cm',1,4,(a,b)=>a*10-b*b],
  ['Narrow aisle model','Left clearance','Steering offset','units',3,6,(a,b)=>a-b],
  ['Conservative clearance test','Measured clearance','Clearance ratio','ratio',6,8,(a,b)=>a/Math.max(1,b)],
  ['Uncertain range handoff','Range confidence','Motion authorization','logic',4,7,(a,b)=>+(a>=b)],
  ['Obstacle removed','Removal time','Path available','logic',4,7,(a,b,t)=>+(t>=a&&b>0)],
];
export type BenchPart = { shape: string; label: string };
const hardware = `On ticks|controller:Cycle timer|led:Panel heartbeat
Series resistance (100 Ω)|supply:DC supply|resistor:Current limiter|led:Low-current LED
Fault threshold|switch:Fault counter input|controller:Fault comparator|led:Alarm flasher
Beacon enable|clock:Standby clock|driver:Pulse driver|led:Standby beacon
Lamp enable|switch:Power-on switch|clock:Self-test timer|led:Check lamp
Series resistance (100 Ω)|supply:Adjustable supply|resistor:Series resistor|meter:Excess-current meter
Minimum voltage (V)|supply:Battery emulator|meter:Voltage reference|display:Voltage margin
Series resistance (100 Ω)|supply:Bench supply|resistor:Power resistor|heater:Thermal load|meter:Dissipation readout
Ticks per interval|clock:Inspection timer|controller:Batch counter|display:Completed intervals
Inter-burst delay (ticks)|driver:Service selector|controller:Burst sequencer|led:Service LED
—|switch:Doorbell button|buzzer:Chime
Guard closed|switch:Jog button|switch:Guard contact|driver:Permission relay
Contestant B|switch:Contestant A|switch:Contestant B|display:Winning channel
Armed state|switch:Lid contact|controller:Arm logic|buzzer:Tamper alarm
Trigger travel|knob:Pedal travel sensor|controller:Travel comparator|led:Trigger indicator
Home threshold|target:Moving carriage|switch:Limit switch|led:Home indicator
Normal mode|switch:Override selector|controller:Mode multiplexer|display:Mode display
Right contact|target:Cabinet door|switch:Left latch|switch:Right latch|display:Contact count
Pending requests|switch:Acknowledge key|clock:Request queue|display:Pending requests
Hold limit (ticks)|switch:Held button|clock:Hold timer|buzzer:Stuck warning
Seconds per tick|clock:Crossing timer|display:Countdown|traffic:Pedestrian signal
Aisle B demand|switch:Aisle A request|switch:Aisle B request|traffic:Aisle allocation
Hold duration (ticks)|clock:Clearance timer|controller:Bridge interlock|traffic:Lane signal
Trip distance|target:Approaching train|ultrasonic:Track detector|traffic:Crossing signal
Lamp count|clock:Test interval|driver:Channel selector|traffic:Lamp bank
Other phase duration (s)|clock:Green timer|clock:Other phase timer|display:Green share
Manual stop|switch:Dock sensor|switch:Manual stop|led:Stop lamp
Starting progress (ticks)|clock:Opening timer|driver:Gate drive|gate:Barrier arm
Green duration (s)|traffic:Signal bank|clock:Red phase timer|clock:Green phase timer|display:Timing difference
Warning start (tick)|clock:Warning timer|led:Amber lamp
Maximum level (cm)|tank:Liquid level|controller:Level comparison|display:Headroom
Brightness threshold|light:Light sensor|controller:Comparator|buzzer:Brightness alarm
Warning threshold|temperature:Equipment probe|controller:Severity bands|buzzer:Warning sounder|display:Warning level
Contact area (scaled)|pressure:Door pressure pad|controller:Force estimate|meter:Force readout
Cell voltage (0.1 V)|supply:Cell pack|meter:Pack voltage
Downstream pressure (kPa)|pressure:Upstream port|pressure:Downstream port|display:Differential pressure
Moisture threshold|soil:Soil probe|controller:Moisture comparator|led:Water request
Calibration reference|knob:Adjustment knob|meter:Reference|display:Calibration error
Switching threshold|knob:Noisy input|meter:Analog monitor|controller:Comparator|led:Chatter indicator
Mute duration (ticks)|temperature:Baseline sensor|clock:Startup mute timer|buzzer:Alarm sounder
Near-zone threshold|ultrasonic:Parking sensor|target:Vehicle target|display:Parking zone
Tank height (20 cm)|ultrasonic:Tank transducer|tank:Liquid surface|display:Estimated depth
Air temperature (°C)|ultrasonic:Cold-room transducer|temperature:Air probe|meter:Corrected range
Air temperature (5 °C)|temperature:Workshop air probe|ultrasonic:Echo transducer|display:Range correction
Detection threshold|ultrasonic:Package sensor|conveyor:Package belt|display:Package count
Timeout period (ticks)|ultrasonic:Echo transducer|clock:Echo watchdog|display:Timeout count
Minimum distance|target:Close target|ultrasonic:Range module|led:Blind-zone indicator
Air temperature (°C)|ultrasonic:Path transducer|target:Far reflector|meter:Round-trip path
Required width (10 cm)|target:Door jamb|ultrasonic:Width sensor|display:Clearance margin
Reference distance|target:Calibration plate|meter:Known reference|display:Offset readout
Home angle (18°)|knob:Pan setpoint|servo:Pan servo|camera:Camera bracket
Full-scale value|knob:Gauge input|servo:Pointer actuator|meter:Dial scale
Mechanical limit (9°)|pressure:Air demand input|servo:Flap servo|gate:Vent flap
Alternate class angle (12°)|switch:Classification input|servo:Diverter servo|gate:Sorting gate
Mechanical limit (18°)|knob:Travel request|controller:Software clamp|gripper:Gripper linkage
Linkage gain|knob:Control stick|servo:Rudder actuator|gate:Rudder blade
Sweep frequency (scaled)|clock:Sweep generator|servo:Scan servo|ultrasonic:Scanning sensor
End stop (18°)|knob:Requested travel|servo:Travel actuator|target:End stop
Neutral reference|knob:Trim control|controller:Neutral calculation|servo:Trimmed horn
Degrees per two counts|controller:Command counter|servo:Fine-position horn
—|temperature:Freezer probe|meter:Sensor voltage
Comfort setpoint (°C)|temperature:Room probe|knob:Comfort setpoint|display:Comfort deviation
Target temperature (scaled)|temperature:Chamber probe|controller:Heater control|heater:Heating element
Ambient index|temperature:Case probe|temperature:Ambient probe|heater:Heatsink
Zero reference|tank:Ice bath|temperature:Calibration probe|display:Calibrated result
Reference voltage (0.5 V)|temperature:Analog source|controller:ADC converter|meter:Quantization size
Cooling duration (ticks)|temperature:Outdoor probe|clock:Sampling clock|display:Daily low
High limit|temperature:Duct probe|controller:Limit comparator|led:Overheat warning
Offset index|temperature:Input sensor|meter:Range check|controller:Clamp logic|display:Clipped reading
Final temperature (10 °C)|heater:Immersion heater|tank:Water bath|temperature:Temperature probe|display:Warming curve
Variation amplitude (°C)|temperature:Greenhouse probe|esp32:Telemetry node|radio:Greenhouse link|display:Ventilation trend
Warming rate (0.1 °C/tick)|temperature:Cold-chain probe|radio:Transport link|display:Excursion log
Thermal time constant (ticks)|heater:Equipment heat load|temperature:Cabinet probe|display:Cabinet estimate
Peak rise (°C)|temperature:Rack probe|esp32:Rack telemetry node|display:Peak monitor
Link divisor|clock:Sampling clock|radio:Packet link|display:Packet counter
Humidity drift factor|soil:Humidity probe|radio:Case telemetry|display:Humidity trend
Variation amplitude (scaled)|temperature:Room sensor|knob:Comfort setting|esp32:Comfort monitor|display:Filtered reading
Sensor B|temperature:Warehouse probe A|temperature:Warehouse probe B|display:Sensor spread
Normalization scale|knob:Sample source|controller:Normalization stage|display:Normalized sample
Alert threshold (°C)|temperature:Boundary input|controller:Threshold check|led:Threshold indicator|display:Signed margin
Drive scaling|driver:Conveyor drive|motor:Belt motor|conveyor:Conveyor belt
Fan scale factor|driver:Fan driver|motor:Fan motor|fan:Impeller
Minimum drive|driver:Pump drive|motor:Pump motor|tank:Liquid reservoir
Interlock enable|switch:Enable interlock|driver:Disabled driver|meter:Motor terminal voltage
Load scale|controller:PWM command|motor:DC motor|meter:Idle current
Duty (10% per step)|supply:Motor supply|driver:PWM switch|meter:Unapplied voltage
Equivalent load (Ω)|supply:Low-voltage supply|motor:DC motor|meter:Available power
Second supply (V)|supply:Supply A|supply:Supply B|meter:Voltage difference
Lift load|driver:Lift drive|motor:Winch motor|gate:Lift platform
Feed divisor|driver:Sorter drive|conveyor:Feed belt|display:Items fed
Stop buffer (10 cm)|ultrasonic:Front range module|controller:Buffer logic|rover:Hallway rover
Stand-off (10 cm)|target:Shelf face|ultrasonic:Approach sensor|rover:Approach rover
Maximum age (ticks)|ultrasonic:Range source|clock:Watchdog|led:Validity indicator
Stop threshold|rover:Rover fixture|target:Boundary target|ultrasonic:Range sensor|led:Stop request
Minimum clearance|ultrasonic:Loading-zone sensor|driver:Speed limiter|rover:Loading-zone rover
Speed index|target:Close obstacle|controller:Braking calculation|display:Braking margin
Right clearance|ultrasonic:Left range sensor|ultrasonic:Right range sensor|rover:Steering rover
Required clearance|ultrasonic:Measured clearance|controller:Ratio calculation|meter:Clearance ratio
Minimum confidence|ultrasonic:Range confidence input|controller:Authorization logic|driver:Motion enable
Path enabled|target:Removable obstacle|controller:Path check|rover:Resume command`.split('\n');
const groups = ['blink','button','traffic','buzzer','ultrasonic','servo','temperature','iot','motor','avoidance'];
export const distinctLabs = Object.fromEntries(models.map(([title,input,output,unit,a,b,evaluate], index)=>{
  const [second, ...devices] = hardware[index].split('|');
  const parts: BenchPart[] = devices.map(device => {
    const [shape, label] = device.split(':');
    return {shape,label};
  });
  return [`${groups[Math.floor(index/10)]}-${index%10+1}`, {title,input,output,unit,a,b,evaluate,second,parts}];
}));
