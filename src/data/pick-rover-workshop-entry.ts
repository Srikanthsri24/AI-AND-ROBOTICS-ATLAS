import{pickMechanicalAssembly}from'./pick-rover-assembly';import{pickUnloadedInitial,pickUnloadedReferences}from'./pick-rover-unloaded-calibration';
export function pickWorkshopAssemblyReady(state:{step:number;progress:number;running:boolean;completedThrough:number}|null){const last=pickMechanicalAssembly.length-1;return state!==null&&state.step===last&&state.progress===1&&!state.running&&state.completedThrough===last;}
/** Assembly renders the two bare outputs at A. Preserve those unpowered poses
 * on entry, without recording, inspecting, configuring or energizing anything. */
export function pickUnloadedFromPlacedRig(){return{...pickUnloadedInitial(),angles:pickUnloadedReferences.map(r=>r.angles[0])as[number,number]};}
