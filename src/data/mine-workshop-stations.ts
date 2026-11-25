import { mineStations, type MinePoint } from './mine-workshop-layout';
import { mineReading, mineRemote, type MineInputs, type MineSession } from './mine-workshop';
export const mineRuleAt:MinePoint=[0,.02,1.4], mineConsoleAt:MinePoint=[-1.45,.02,1.4],mineBeaconAt:MinePoint=[1.45,.02,1.4];
export const mineStationParts=mineStations.flatMap(({key,name})=>[
 [`mine-${key}-pedestal`,`${name} station pedestal`,'The separate foot, stem and equipment saddle support this illustrated source at the side of the walkway.','The pedestal sits on its named mounting pad. It does not produce a reading.'],
 [`mine-${key}-housing`,`${name} source enclosure`,'An authored enclosure represents this virtual station. Its two labelled displays expose the independent synthetic inputs.','This guide supplies fictional 0–100 indices, not a physical gas sensor, ADC wiring or calibrated detector.'],
 [`mine-${key}-fasteners`,`${name} faceplate screws`,'Four recessed screw heads secure the separate front faceplate to the enclosure.','The housing, plate and screws assemble in that order; use the source label to identify the station.'],
 [`mine-${key}-gas`,`${name} gas-index display`,'Shows the gas index from this source, with MISSING shown explicitly when unavailable. The training alarm boundary is 70.','Only a valid gas index at or above 70 triggers this rule. Missing is not zero; the other valid readings still participate.'],
 [`mine-${key}-vent`,`${name} ventilation-index display`,'Shows the independent fictional ventilation index. At or below 30 it triggers Alarm.','This index is entered in the browser; it is not computed airflow, fan speed or gas concentration.'],
 [`mine-${key}-source-port`,`${name} logical source output`,'The illustrated outlet marks where this named pair of values enters the teaching signal path.','The dashed animated route is a logical data path, not a specified electrical cable or connector.'],
 [`mine-${key}-source-name`,`${name} source identity plate`,'A visible permanent source label keeps the entry and working-face readings distinguishable.','Both source names and values travel together in the copied remote record.'],
]);
export const mineStationSystemParts=[
 ['mine-equipment-shelf','Front instrument shelf','Supports the local rule unit, beacon and remote console outside the open walkway.','The teaching cutaway keeps these devices visible while their logical paths remain traceable.'],
 ['mine-rule-body','Local rule-unit enclosure','An illustrated local unit collects both source pairs and evaluates the strongest known condition.','Alarm takes priority over Sensor fault. The remote console never controls this local decision.'],
 ['mine-rule-display','Local rule display','Shows the current combined condition and the two exact training thresholds.','Gas ≥ 70 or ventilation ≤ 30 triggers Alarm. If there is no known alarm, any missing input reports Sensor fault.'],
 ['mine-rule-ports','Local logical input and copy ports','Two labelled input mouths distinguish entry and working face; a third marks the outgoing copy.','These authored open ports explain direction. They are not hardware pinouts or a real browser network connection.'],
 ['mine-rule-keys','Local teaching control keys','The raised labelled keycaps make the training console recognisable. Use the accessible page controls to change scenarios.','The illustrated keys do not upload firmware or operate a real alarm system.'],
 ['mine-beacon-base','Local beacon base','Supports the teaching beacon next to the local rule unit.','Its state follows current local evaluation even when the remote link is lost.'],
 ['mine-beacon-cage','Beacon guard rods','Four separate rods protect the lens while leaving its emitted colour visible.','The rods connect the base to the cap and remain outside the lens.'],
 ['mine-beacon-lens','Local status beacon lens','Green means Normal, red means Alarm, and amber means Sensor fault in this teaching model.','Red pulses twice and amber once per model second; pause freezes the animation. These authored cues supplement the written state.'],
 ['mine-beacon-cap','Beacon top cap','A separate rim and cap close the guard above the lens.','The cap seats after the lens and guard during assembly.'],
 ['mine-console-stand','Remote console stand','A tilting support and broad foot hold the remote display above its keyboard.','This console illustrates a remote observer; it does not drive the local beacon.'],
 ['mine-console-body','Remote console enclosure','Frames the illustrated remote dashboard and its last copied record.','The display keeps old values when the logical link stops. It must not silently replace them with current local readings.'],
 ['mine-console-keys','Remote console keyboard','Individually shaped keycaps and touchpad give the observer station a recognisable working surface.','Use the page controls to disconnect or restore the teaching link. No real connection is made.'],
 ['mine-console-screen','Remote record and freshness screen','Shows the copied entry/face values, local condition at receipt, timestamp and age.','At age ≥ 3000 ms the record is Stale. Fresh describes recency, not whether the recorded condition is safe or normal.'],
 ['mine-path-entry','Entry logical data route','Moving markers trace the entry pair toward the local rule unit.','A dashed path represents data flow, not a powered wire. The entry source remains independent of face scenarios.'],
 ['mine-path-face','Working-face logical data route','Moving markers trace the face pair toward the local rule unit.','The known alarm/missing-reading priority is evaluated locally after both sources arrive.'],
 ['mine-path-remote','Copied-record logical route','Moving markers show a copy travelling from the local rule unit to the remote observer.','A broken route stops new remote records only. The retained record ages while local evaluation continues.'],
] as const;
export function mineDisplay(value:number|null){return value===null?'MISSING':Number.isInteger(value)?String(value):value.toFixed(1);}
export function mineStationDisplay(input:MineInputs, key:'entry'|'face') {const r=mineReading(input[key]);return{gas:mineDisplay(r.gas),vent:mineDisplay(r.ventilation),reading:r};}
export function mineConsoleLines(session:MineSession){const r=mineRemote(session),p=r.packet;return{status:r.status,lines:p?[
 `ENTRY  ${mineDisplay(p.entry.gas)} / ${mineDisplay(p.entry.ventilation)}`,
 `FACE   ${mineDisplay(p.face.gas)} / ${mineDisplay(p.face.ventilation)}`,
 p.alarm.toUpperCase(),
 `AT ${p.receivedMs} ms · AGE ${r.ageMs} ms`,
 ]:['NO COPIED RECORD','ENTRY / FACE: WAITING','LOCAL RULE REMAINS INDEPENDENT','']};}
export const mineLogicalRoutes = [
 {id:'mine-path-entry',points:[[-2.4,.71,.707],[-2.4,.71,.9],[-2,.25,1.02],[-.32,.25,1.02],[-.22,.23,1.231]] as MinePoint[]},
 {id:'mine-path-face',points:[[2.35,.71,.707],[2.35,.71,.9],[1.95,.25,1.02],[.32,.25,1.02],[.22,.23,1.231]] as MinePoint[]},
 {id:'mine-path-remote',points:[[-.454,.23,1.4],[-.65,.23,1.4],[-.8,.18,1.35],[-.931,.12,1.35]] as MinePoint[]},
];
