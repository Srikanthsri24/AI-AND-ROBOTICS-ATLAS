import { CatmullRomCurve3 } from 'three';
import { pickUsbPose } from './pick-rover-usb';
const reference = pickUsbPose();
reference.curve.arcLengthDivisions = 1000;
const length = reference.curve.getLength();
const ease = (value: number) => { const t = Math.max(0, Math.min(1, value)); return t * t * (3 - 2 * t); };
/** Seat USB-B at the Uno before USB-A at the switched-off source.
 * Both boots stay attached; the outboard loop pays out at constant length. */
export function pickUsbInsertion(progress: number) {
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new RangeError('Invalid USB insertion');
  const unoWithdrawal = 12 * (1 - ease(progress * 2));
  const bankWithdrawal = 12 * (1 - ease((progress - .5) * 2));
  const pose = pickUsbPose(unoWithdrawal, bankWithdrawal);
  const build = (offset: number) => {
    const points = pose.curve.points.map(p => p.clone());
    points[2].x += offset;
    points[3].x += offset;
    const curve = new CatmullRomCurve3(points, false, 'centripetal');
    curve.arcLengthDivisions = 1000;
    return curve;
  };
  let low = -45, high = 15;
  if (build(low).getLength() < length || build(high).getLength() > length)
    throw new Error('USB service loop cannot accommodate connector travel');
  let curve = build(0);
  for (let n = 0; n < 25; n++) {
    const middle = (low + high) / 2;
    curve = build(middle);
    if (curve.getLength() > length) low = middle;
    else high = middle;
  }
  return { ...pose, curve, length, unoWithdrawal, bankWithdrawal };
}
