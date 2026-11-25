/** Authored educational cutaway in metres; not a measured or certified mine installation. */
export type MinePoint = [number, number, number];
export const mineTunnel = { length: 7.2, clearWidth: 2.4, springY: 1.15, archRadius: 1.2, ribDepth: .12, ribThickness: .09, ductRadius: .16, ductY: 1.81, ductZ: -.67 };
export const mineRibs = [-3.15, -2.1, -1.05, 0, 1.05, 2.1, 3.15];
export const mineStations = [
  { key: 'entry', name: 'Entry', at: [-2.4, .1, .55] as MinePoint },
  { key: 'face', name: 'Working face', at: [2.35, .1, .55] as MinePoint },
] as const;
export const mineMechanicalParts = [
  ['mine-base', 'Cutaway mine plinth', 'The tabletop section separates entry and working-face locations so students can trace the two independent sources.', 'This is an authored training environment, not a scale survey of a real mine.'],
  ['mine-floor', 'Tunnel walkway', 'The clear walkway links the two source locations without placing equipment in the walking route.', 'Each synthetic station stands at the side of this route. The source names must stay separate in every copied record.'],
  ['mine-rock', 'Cutaway rock wall', 'The rear wall gives depth and location to the tunnel while the front remains open for inspection.', 'The open front is a teaching cutaway. Neither rock shape nor colour represents measured geology.'],
  ['mine-rib-feet', 'Support foot plates', 'Paired plates locate each rib at the sides of the tunnel.', 'The arched rib seats on both plates. These illustrative supports are not structural engineering specifications.'],
  ['mine-ribs', 'Arched tunnel supports', 'Seven open horseshoe supports make the passage visible without a solid box hiding the stations.', 'Each one spans the same clear width and sits on its own pair of foot plates.'],
  ['mine-duct', 'Illustrative ventilation duct', 'The open-ended duct shows a possible air route above the stations.', 'The fictional ventilation index is an input to the rule, not airflow calculated from this duct.'],
  ['mine-duct-collars', 'Duct support collars', 'Separate collars secure the duct to the upper supports while keeping its bore open.', 'The collars surround the tube; no support crosses the open air passage.'],
  ['mine-duct-hangers', 'Duct hanger rods', 'Short rods connect the outside of the collars to the upper support structure.', 'Hangers stop at the outer collar surface rather than blocking the tube.'],
  ['mine-entry-pad', 'Entry station mounting pad', 'The first station has a dedicated side mounting point near the entry.', 'Only the entry source belongs here. Changing the working face must leave these readings unchanged.'],
  ['mine-face-pad', 'Working-face station mounting pad', 'The second station occupies its own mounting point near the far end.', 'The scenarios change this source independently; both stations feed the local alarm evaluation.'],
] as const;
export function mineArchOuterY(z: number) { return mineTunnel.springY + Math.sqrt(Math.max(0, (mineTunnel.archRadius + mineTunnel.ribThickness) ** 2 - z ** 2)); }
export const mineDuctHangerBottom = mineTunnel.ductY + mineTunnel.ductRadius + .025;
export const mineDuctHangerTop = mineArchOuterY(mineTunnel.ductZ) - .015;
