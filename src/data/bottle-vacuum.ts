import type { Build } from './guided-projects';

export const bottleVacuum: Build = {
  id:'directory-6',
  title:'DIY Vacuum Cleaner Using a Recycled Plastic Bottle',
  outcome:'Turn a clean, wide-neck PET bottle into a hand-powered vacuum for dry paper scraps. Compare pickup with a clear filter, a partially covered filter and a leaking cap.',
  parts:[
    ['Reused clear PET bottle and cap','1','A stiff, transparent bottle collects the scraps. Use a wide screw cap with enough flat area for two separate tube ports.'],
    ['Clear vinyl tubing','2 lengths','The long pickup tube brings air and scraps into the bottle. The short outlet tube connects the mesh-covered port to the pump inlet.'],
    ['One-way squeeze bulb pump','1','Check valves direct air out through the exhaust on squeeze and draw air from the bottle as the bulb expands. Use a clean, unused bulb that moves air in the arrow direction.'],
    ['Coarse filter mesh','1 small piece','Cover the bottle end of the outlet tube with mesh. It keeps the paper in the bottle and lets air reach the pump. Secure it around the tube with a small cable tie.'],
    ['Rubber port grommets','2','Hold the tubes tightly in the lid. Match the inner diameter to your tube outside diameter and the groove to the lid thickness.'],
  ],
  assembly:[
    ['Prepare the bottle and lid','Wash and dry a stiff, wide-neck food or drink bottle. Mark two holes far enough apart for the grommets and clear of the lid’s sealing rim. Ask an adult to drill the removed lid on a scrap backing block and deburr the holes.','The grommets seat flat. The cap still screws down fully and its original rim seal is intact.',[0,4]],
    ['Route the pickup tube','Press the longer clear tube through one grommet. Angle its inner end slightly downward into the bottle, leaving clearance from the wall. Leave enough tube outside to reach your tray without kinking.','A single paper scrap passes freely through the tube. Keep every scrap smaller than the tube’s inside diameter.',[0,1,4]],
    ['Fit the protected pump outlet','Fit a short tube in the other grommet with its bottle end just inside the lid. Form a loose mesh pouch over that end and tie it behind the mouth. Keep the active mesh area wider than the tube opening.','The mesh cannot slip into the tube, and the pickup path opens into the bottle independently of the mesh.',[1,3,4]],
    ['Connect and check the bulb','Connect the short tube to the bulb inlet. The flow arrow points away from the bottle toward the open exhaust. Tighten the cap and support the bottle on a tray so it cannot roll.','On squeeze, a light strip near the exhaust flutters outward. On release, a strip held near the pickup tube pulls inward.',[0,1,2]],
  ],
  wiring:[
    ['Pickup nozzle','Long inlet tube → bottle chamber','Carries incoming air and paper scraps'],
    ['Collection chamber','Mesh on the outlet port','Separates the paper from the moving air'],
    ['Mesh-covered outlet','Short hose → bulb inlet','Passes filtered air into the expanding bulb'],
    ['Bulb outlet valve','Open exhaust to the room','Releases air when the bulb is squeezed'],
  ],
  test:'Use six equal dry paper scraps and six slow squeeze-and-release cycles per condition. Keep the nozzle distance and stroke speed the same. Try a sealed cap with clear mesh, then temporarily cover part of the mesh and repeat. Finally, restore the clear mesh and loosen the cap slightly. Record how many scraps enter the bottle. Confirm that paper stays on the bottle side of the mesh. Stop if the bottle walls buckle.',
  demo:['Filter and seal','Restricted','Clear and sealed','Pickup is reduced','Scraps enter the bottle while air goes through the pump'],
};

export const vacuumTrials = [
  {condition:'Clear mesh, tight cap',expected:'Strongest nozzle pickup of the three trials.'},
  {condition:'Partially covered mesh, tight cap',expected:'Slower pickup because air meets more resistance at the outlet.'},
  {condition:'Clear mesh, loose cap',expected:'Weaker pickup because some air enters around the cap instead of through the nozzle.'},
];

export const vacuumTrialSheet = [
  'Condition,Paper scraps at start,Full pump cycles,Paper scraps collected,Observations',
  ...vacuumTrials.map(({condition})=>`"${condition}",6,6,,`),
].join('\n')+'\n';
