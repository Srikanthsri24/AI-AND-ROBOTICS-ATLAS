import type { Build } from './guided-projects';

const sets = [
  ['Light sensing','ambient-light','Light level (%)','Lamp','low',[
    'Model streetlight|Illuminate a model pavement at dusk|40',
    'Wardrobe light|Light the inside when the room around the cabinet gets dark|32',
    'Reading corner indicator|Show when a reading surface needs more light|55',
    'Greenhouse shade monitor|Flag when a shaded tray gets too little light|48',
    'Display case light|Switch on a display light as the surroundings dim|37',
    'Stair model marker|Light the edges of a miniature staircase in the dark|45',
    'Window shadow detector|Detect a shadow crossing a window sensor|50',
    'School diorama night mode|Switch a classroom diorama to night lighting|28',
    'Camping model lantern|Switch a low-voltage model lantern on at dusk|35',
    'Tunnel model light|Light the entrance when the inside of a model tunnel darkens|42',
  ]],
  ['Climate','home-project','Temperature (°C)','Warning LED','high',[
    'Terrarium temperature flag|Show when a model terrarium gets warmer than its target|29',
    'Desk comfort monitor|Flag a warm study spot|27',
    'Seed tray temperature flag|Compare temperatures beside a model seed tray|26',
    'Sunlit window monitor|Detect warming by a sunny window|31',
    'Model incubator temperature alert|Show how an incubator prototype would flag high readings|37',
    'Aquarium model temperature alert|Test a temperature limit with a dry sensor beside a model tank|28',
    'Solar oven model monitor|Track heating in a model solar collector|38',
    'Vent outlet temperature indicator|Compare air near a model vent to room temperature|30',
    'Cold pack warming indicator|Show when the air near a cold pack warms|20',
    'Equipment enclosure monitor|Compare temperatures inside and outside a model enclosure|34',
  ]],
  ['Soil & environment','soil-observer','Calibrated moisture index','Dry-soil LED','low',[
    'Basil pot moisture flag|Compare a basil pot to its own dry and damp references|43',
    'Seedling tray moisture check|Flag a drying tray before comparing neighboring cells|52',
    'Sandy soil calibration|Measure how a sandy sample changes after watering|34',
    'Clay soil calibration|Compare repeated readings in a clay-rich sample|57',
    'Mulch moisture experiment|Compare covered and uncovered samples at equal depth|44',
    'Drainage bottle experiment|Record how quickly a drained sample returns to the dry range|39',
    'Plant pot depth comparison|Compare readings at two repeatable insertion depths|46',
    'Capillary watering model|Track moisture as water rises through a wick into a sample|53',
    'Soil drying timer study|Record how long a damp sample takes to cross the dry threshold|41',
    'Window box comparison|Compare a sunny sample and a shaded sample from the same soil|49',
  ]],
  ['Switches & controls','button-indicator','Button state','Indicator LED','switch',[
    'Library help button|Send a visible help request while a button is held|1',
    'Quiz desk response button|Light a team’s response indicator|1',
    'Model doorbell panel|Show when a visitor presses a doorbell|1',
    'Model elevator call light|Show a call request on a cardboard lift panel|1',
    'Accessible desk switch|Use a large cardboard lever to press a small switch|1',
    'Model crossing request|Show when a pedestrian requests a crossing|1',
    'Mailbox test flag|Detect a model flap pressing a switch|1',
    'Drawer closed indicator|Show when a model drawer closes against a switch|1',
    'Handheld signal paddle|Send a visible signal from a hand-held button|1',
    'Game controller input tester|Verify that a button registers a press and release|1',
  ]],
  ['Robot motion','desktop-arm','Requested position (°)','Servo angle','angle',[
    'Model parking barrier|Raise a lightweight barrier to admit a toy car|80',
    'Model wind vane pointer|Point a cardboard vane at two compass marks|105',
    'Desktop camera pan model|Turn a paper camera between two viewing directions|110',
    'Model letter sorter flap|Direct paper tokens toward two bins|115',
    'Mini drawbridge model|Lift an unloaded bridge deck between marked positions|95',
    'Cardboard dial gauge|Point to two marked values on a dial|100',
    'Greenhouse vent model|Open and close a light model vent flap|120',
    'Puppet head turn|Turn a paper puppet head between two marks|85',
    'Model train signal arm|Show two signal positions with a moving arm|90',
    'Classroom quiz pointer|Point at two answer zones on a board|125',
  ]],
  ['Distance sensing','rover-project','Obstacle distance (cm)','Drive','distance',[
    'Parking bay stop test|Stop a rover at a marked parking boundary|15',
    'Tabletop delivery dock|Stop the rover before a model loading wall|18',
    'Corridor clearance test|Compare response to a close and far flat obstacle|24',
    'Museum exhibit boundary model|Keep a rover outside a marked display area|30',
    'Model warehouse aisle stop|Stop before a model storage crate|22',
    'Reflective surface comparison|Compare readings from flat card and a tilted target|25',
    'Rover slow approach study|Measure how far a rover rolls before stopping|20',
    'Model garage approach|Stop before a model garage door|16',
    'Sensor mounting height trial|Compare obstacle detection at two mounting heights|28',
    'Missing echo rover test|Check that the drive stops when the sensor returns no reading|26',
  ]],
  ['Mechanisms','mechanism-study','Crank speed (RPM)','Output gear (RPM)','ratio',[
    'Gear reduction demonstration|Use 12 and 36 teeth to reduce output speed|3',
    'Model winch gearbox|Compare shaft turns before attaching any load|4',
    'Rotating display gearbox|Turn a model display more slowly than its input|5',
    'Model clock train|Compare two marked gears over repeated turns|6',
    'Hand-cranked fan transmission|Compare input and output speed in a guarded model|2',
    'Gear direction demonstrator|Use arrows to record how meshing gears reverse direction|3',
    'Model conveyor gearing|Choose a ratio for a slow unloaded belt mock-up|4',
    'Gear backlash investigation|Measure the small dead zone when the crank reverses|2',
    'Model turntable speed reducer|Compare hand crank speed with platform speed|5',
    'Gear ratio comparison bench|Change the driven gear and compare measured output turns|6',
  ]],
  ['Computer vision','vision-counter','Brightness cutoff','Bright regions','vision',[
    'Bottle cap counter|Count light bottle caps on a dark mat|165',
    'Domino counter|Count separated dominoes from an overhead view|175',
    'Paper disk counter|Compare a hand count with a camera count of paper disks|180',
    'Model tray inspection|Count occupied positions using bright tokens on a matte tray|170',
    'Shape separation test|See when touching shapes merge into one region|185',
    'Lighting variation test|Find a threshold that still counts under weaker light|145',
    'Bright background false alarm|Test how a reflection can look like an extra object|190',
    'Pencil eraser counter|Count light erasers arranged with equal spacing|160',
    'Size filter investigation|Compare a small speck to the intended targets|195',
    'Camera crop counter|Use a crop to count only targets inside a marked area|200',
  ]],
  ['Timers & signals','traffic-sequencer','Time (seconds)','Signal phase','timer',[
    'Model road junction|Sequence a tabletop traffic light|3',
    'Classroom activity timer|Show ready, work, and finish phases with colored LEDs|6',
    'Model railway crossing signal|Sequence warning colors on a miniature crossing|4',
    'Assembly line station signal|Indicate stop, work, and prepare at a model station|5',
    'Model car wash signal|Show a toy driver when to stop and proceed|3',
    'Model delivery bay indicator|Show stop, load, and clear phases|7',
    'Practice reaction timer|Use an LED phase change as a visual cue|4',
    'Model airport boarding signal|Indicate wait, board, and finish stages|8',
    'Museum exhibit turn timer|Use lights to show when an exhibit session ends|6',
    'Traffic phase tuning study|Compare how long each signal color stays lit|5',
  ]],
  ['Robotic hand','hand-project','Requested position (°)','Finger angle','angle',[
    'Paper finger hinge|Make one cardboard joint curl with a cord|100',
    'Two-joint tendon finger|Route a cord through two joints to compare their motion|106',
    'Elastic return experiment|Compare how a loose and tight return band reopen a finger|108',
    'Finger travel limit study|Find an angle that curls without pulling against the stop|102',
    'Paper token gripper|Test whether a soft fingertip can hold a light paper token|112',
    'Servo horn leverage study|Compare fingertip travel using two cord attachment points|114',
    'Tendon guide friction study|Compare a straight cord route with a bent route|104',
    'Open-hand position marker|Add an alignment mark and check repeatable opening|98',
    'Finger repeatability test|Measure repeated curl positions using a paper angle scale|116',
    'Tendon slack test|Adjust slack and observe how much servo movement comes before a curl|110',
  ]],
] as const;

export function expandProjects(base: Build[]) {
  return sets.flatMap(([category,template,input,output,kind,rows])=>{
    const source=base.find(project=>project.id===template)!;
    return rows.map(row=>{
      const [title,goal,value]=row.split('|');
      const limit=Number(value);
      const id=title.toLowerCase().replace(/[^a-z0-9]+/g,'-');
      const project: Build = {
        ...source,id,title,outcome:goal+'.',
        assembly: source.assembly.map(([name,instruction,check,parts],i)=>[
          name,instruction, i===source.assembly.length-1 ? check+' Apply the project test below before recording a result.' : check,parts,
        ]),
        test: kind==='ratio' ? `Use a matched gear pair with a ${limit}:1 tooth ratio. Turn the crank ${limit} times and count one output turn in the opposite direction.`
          : kind==='angle' ? `Mark 75° and ${limit}°. Move between those positions unloaded and check that the link clears its stops.`
          : kind==='timer' ? `Time the red and green phases. Each should last ${limit} seconds, followed by one second of amber.`
          : kind==='vision' ? `Set the pixel cutoff to ${limit}. Compare the count with a hand count, then change lighting or move two targets together and record the difference.`
          : kind==='switch' ? source.test
          : `Set the decision threshold to ${limit} ${kind==='distance'?'cm':kind==='high'?'°C':'on the input scale'}. Try a value below and above it and record where the output changes.`,
      };
      if(kind==='angle') project.assembly[0]=['Build and mark the moving part',`Make a light paper or cardboard part for this task. ${goal}. Attach it to the horn and mark the 75° and ${limit}° positions.`,'Move it by hand with the servo disconnected to check clearance.',source.assembly[0][3]];
      if(kind==='vision') project.assembly[1]=['Set up the camera target',`${goal}. Arrange three targets on a matte background, fix the camera position, and mark a crop around the test area.`,'Count the targets by hand before running the camera program.',source.assembly[1][3]];
      if(kind==='ratio') project.parts=[['12-tooth spur gear','1','Input gear'],[`${12*limit}-tooth spur gear`,'1','Driven gear'],...source.parts.slice(2)];
      const info={category,template,input,output,kind,limit};
      return {project,info};
    });
  });
}

export type ExpansionInfo = ReturnType<typeof expandProjects>[number]['info'];

export function configureProjectSource(info: ExpansionInfo, source: string) {
  switch(info.kind) {
    case 'angle':
      return source.replace(/joint\.write\(\d+\)/g, (line, offset:number) =>
        `joint.write(${source.slice(0,offset).includes("command == '1'") ? info.limit : 75})`);
    case 'distance': return source.replace('cm >= 20.0',`cm >= ${info.limit}.0`);
    case 'high': return source.replace('temperatureC > 28.0',`temperatureC > ${info.limit}.0`);
    case 'vision': return source.replace('gray, 180, 255',`gray, ${info.limit}, 255`);
    case 'timer': return source.replace('3000, 3000, 1000',`${info.limit*1000}, ${info.limit*1000}, 1000`);
    case 'low':
      if(info.template==='ambient-light') return source
        .replace('light < 300',`light < ${Math.round(info.limit*1023/100)}`)
        .replace('light > 450',`light > ${Math.round((info.limit+5)*1023/100)}`);
      return source.replace('int midpoint = (dry + damp) / 2;',`int midpoint = dry + (damp - dry) * ${info.limit}L / 100;`);
    default: return source;
  }
}

export function expansionDemo(info: ExpansionInfo, project: Build) {
  const {kind,limit}=info;
  const [before,after,initial,final]=({
    low:[`${limit+8}`,`${limit-8}`,'LED off','LED on'],
    high:[`${limit-4} °C`,`${limit+4} °C`,'Warning LED off','Warning LED on'],
    switch:['Released','Pressed','LED off','LED on'],
    angle:['75°',`${limit}°`,'At the first mark','At the target mark'],
    distance:[`${limit+15} cm`,`${limit-5} cm`,'Drive enabled','Wheels stopped'],
    ratio:['Crank stopped','Turn the crank','Both gears still',`Driven gear turns at 1/${limit} speed`],
    vision:['Separate targets','Touching targets','3 bright regions','2 bright regions'],
    timer:['Hold red','Start timer','Red light on',`Red ${limit}s · Green ${limit}s · Amber 1s`],
  })[kind];
  const [inputPart,processPart,outputPart]=({
    low:[1,0,3],high:[1,0,2],switch:[1,0,2],angle:[0,1,2],
    distance:[1,0,3],ratio:[3,0,1],vision:[2,0,1],timer:[0,0,1],
  })[kind];
  const story: [string,string,number][]=[
    ['Set the starting condition',project.outcome,inputPart],
    ['Change the input',`${info.input} changes from ${before} to ${after}.`,inputPart],
    ['Follow the response',project.parts[processPart][2],processPart],
    ['Check the result',project.test,outputPart],
  ];
  const readings: [string,string,boolean][]=[
    [before,initial,false],
    [after,'Input changed',false],
    [after,kind==='distance'?'Stop command sent':'Response starts',true],
    [after,final,true],
  ];
  return {story,readings,controls:[info.input,before,after,initial,final]};
}
