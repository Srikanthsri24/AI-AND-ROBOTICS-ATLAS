import { Curve, Vector3 } from 'three';
import { pickLiftCableRoutes, pickLiftCableSeat } from './pick-rover-lift-cable';
const count = 1000;
const ease = (n: number) => { const t = Math.max(0, Math.min(1, n)); return t * t * (3 - 2 * t); };
const weights = Array.from({ length: count + 1 }, (_, n) => {
  const t = n / count;
  return { lift: ease((t - .45) / .55), slack: t <= .15 || t >= .7 ? 0 : Math.sin(Math.PI * (t - .15) / .55) ** 2 };
});
const routes = pickLiftCableRoutes.map(route => {
  const points = route.curve.getPoints(count);
  return { ...route, points, length: points.slice(1).reduce((sum, p, i) => sum + p.distanceTo(points[i]), 0) };
});
class InsertedConductor extends Curve<Vector3> {
  constructor(readonly points: Vector3[], readonly lift: number, readonly slack: number) { super(); this.arcLengthDivisions = count; }
  getPoint(t: number, target = new Vector3()) {
    const f = Math.max(0, Math.min(count, t * count)), n = Math.min(count - 1, Math.floor(f)), blend = f - n;
    target.copy(this.points[n]).lerp(this.points[n + 1], blend);
    target.x += this.slack * (weights[n].slack + (weights[n + 1].slack - weights[n].slack) * blend);
    target.y += this.lift * (weights[n].lift + (weights[n + 1].lift - weights[n].lift) * blend);
    return target;
  }
}
/** Fixed servo exit, flexible three-conductor service bend, upright CH0 plug.
 * Each conductor pays out its own existing slack rather than stretching. */
export function pickLiftCableInsertion(progress: number) {
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new RangeError('Invalid lift connector insertion');
  const lift = 8 * (1 - ease(progress));
  const conductors = routes.map(route => {
    if (progress === 1) return { wire: route.wire, curve: new InsertedConductor(route.points, 0, 0), length: route.length };
    const length = (slack: number) => {
      let sum = 0;
      for (let n = 1; n <= count; n++) {
        const p = route.points[n], q = route.points[n - 1];
        sum += Math.hypot(p.x - q.x + slack * (weights[n].slack - weights[n - 1].slack), p.y - q.y + lift * (weights[n].lift - weights[n - 1].lift), p.z - q.z);
      }
      return sum;
    };
    let low = -40, high = 0;
    while (high < 20 && length(high) > route.length) high += .25;
    if (length(low) < route.length || length(high) > route.length) throw new Error('Lift cable service slack exhausted '+JSON.stringify({wire:route.wire.id,target:route.length,low:length(low),high:length(high),zero:length(0),progress}));
    let slack = 0;
    for (let n = 0; n < 25; n++) { slack = (low + high) / 2; if (length(slack) > route.length) low = slack; else high = slack; }
    return { wire: route.wire, curve: new InsertedConductor(route.points, lift, slack), length: route.length };
  });
  return { conductors, lift, seat: [pickLiftCableSeat[0], pickLiftCableSeat[1] + lift, pickLiftCableSeat[2]] as const };
}
