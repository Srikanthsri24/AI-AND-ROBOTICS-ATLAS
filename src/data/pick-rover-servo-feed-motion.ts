import { CatmullRomCurve3 } from 'three';
import { pickServoSupplyLeadRoute } from './pick-rover-servo-supply-leads';
const ease = (v: number) => { const t = Math.max(0, Math.min(1, v)); return t * t * (3 - 2 * t); };
const routes = [0, 1].map(i => {
  const r = pickServoSupplyLeadRoute(i);
  r.curve.arcLengthDivisions = 1000;
  return { ...r, length: r.curve.getLength() };
});
/** Open the terminal, insert copper, close its clamp, then seat the source plug.
 * Both outputs remain off. The service loop pays out without scaling a wire. */
export function pickServoFeedMotion(index: number, progress: number) {
  const r = routes[index];
  if (!r || !Number.isFinite(progress) || progress < 0 || progress > 1)
    throw new RangeError('Invalid servo supply placement');
  const release = progress < .15 ? ease(progress / .15) : 1 - ease((progress - .55) / .15);
  const tipOffset = -8 * (1 - ease((progress - .15) / .4));
  const sourceOffset = 12 * (1 - ease((progress - .7) / .3));
  if (progress === 1) return { curve: r.curve, release: 0, tipOffset: 0, sourceOffset: 0, length: r.length };
  const build = (laneOffset: number) => {
    const points = r.curve.points.map(p => p.clone());
    points[0].z += sourceOffset;
    points[1].z += sourceOffset;
    points[2].x += laneOffset;
    points[3].x += laneOffset;
    points[6].z += tipOffset;
    points[7].z += tipOffset;
    const curve = new CatmullRomCurve3(points, false, 'catmullrom', .03);
    curve.arcLengthDivisions = 1000;
    return curve;
  };
  let low = -30, high = 15;
  if (build(low).getLength() < r.length || build(high).getLength() > r.length)
    throw new Error('Servo supply service slack exhausted');
  let curve = build(0);
  for (let n = 0; n < 25; n++) {
    const lane = (low + high) / 2;
    curve = build(lane);
    if (curve.getLength() > r.length) low = lane;
    else high = lane;
  }
  return { curve, release, tipOffset, sourceOffset, length: r.length };
}
