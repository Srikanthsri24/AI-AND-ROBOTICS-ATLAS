import { CatmullRomCurve3, Vector3 } from 'three';
import { pickWheelSupplyRoute } from './pick-rover-wheel-supply-leads';

const routes = [0, 1].map(index => {
  const route = pickWheelSupplyRoute(index);
  route.curve.arcLengthDivisions = 1000;
  return { ...route, length: route.curve.getLength() };
});

/** Prepared battery lead: the soldered source end stays fixed while the
 * female plug lowers onto VM/GND1. Rear service slack pays out into the bend. */
export function pickWheelSupplyFeed(index: number, progress: number) {
  const route = routes[index];
  if (!route || !Number.isFinite(progress) || progress < 0 || progress > 1)
    throw new RangeError('Invalid wheel supply placement');
  const eased = progress * progress * (3 - 2 * progress);
  const lift = 25 * (1 - eased);
  const plug = new Vector3(route.pin[0], route.pin[1] - 2.75 + lift, route.pin[2]);
  if (progress === 1) return { curve: route.curve, plug, length: route.length };
  const build = (rear: number) => {
    const points = route.curve.points.map(p => p.clone());
    points[3].z = rear;
    points[4].z = rear;
    for (const n of [6, 7, 8]) points[n].y += lift;
    const curve = new CatmullRomCurve3(points, false, 'catmullrom', .03);
    curve.arcLengthDivisions = 1000;
    return curve;
  };
  let low = 160, high = 235;
  if (build(low).getLength() > route.length || build(high).getLength() < route.length)
    throw new Error('Wheel supply service slack exhausted');
  let curve = build(low);
  for (let n = 0; n < 25; n++) {
    const rear = (low + high) / 2;
    curve = build(rear);
    if (curve.getLength() > route.length) high = rear;
    else low = rear;
  }
  return { curve, plug, length: route.length };
}
