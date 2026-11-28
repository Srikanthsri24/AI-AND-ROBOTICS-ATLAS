import { raArmDriverInitial, raArmDriverPower, raArmDriverConfigure50, raArmDriverWrite, raArmDriverOutputs, type RaArmDriver } from './rover-arm-driver';
import { pickRoverTeachingCalibration } from './pick-rover-rig';
import { pickRoverRig } from './pick-rover-motion';
import { pickGripperPose } from './pick-rover-gripper';
export type CalibrationChannel = 0 | 1;
export type CalibrationReference = 0 | 1;
export const pickUnloadedReferences = [
  { name: 'Lift', channel: 0, requests: [1440, 1560], angles: [pickRoverRig.lowAngle, pickRoverRig.highAngle], shaft: 'pick-lift-servo-shaft' },
  { name: 'Gripper', channel: 1, requests: [1450, 1550], angles: [0, -pickGripperPose(pickRoverRig.closedGap).pinionAngle], shaft: 'pick-grip-servo-shaft' },
] as const;
export type PickUnloadedCalibration = { logic: boolean; servo: boolean; inspected: readonly [boolean, boolean]; angles: readonly [number, number]; records: readonly [readonly [number | null, number | null], readonly [number | null, number | null]]; driver: RaArmDriver; writeId: number; returning: boolean };
const bus = (s: PickUnloadedCalibration) => ({ unoPowered: s.logic, ground: true, sda: true, scl: true, address40: true });
export function pickUnloadedInitial(): PickUnloadedCalibration {
  return { logic: false, servo: false, inspected: [false, false], angles: pickUnloadedReferences.map(r => (r.angles[0] + r.angles[1]) / 2) as [number, number], records: [[null, null], [null, null]], driver: raArmDriverInitial(), writeId: 0, returning: false };
}
export function pickUnloadedInspect(s: PickUnloadedCalibration, channel: CalibrationChannel): PickUnloadedCalibration {
  const inspected = [...s.inspected] as [boolean, boolean]; inspected[channel] = true; return { ...s, inspected };
}
export function pickUnloadedPower(s: PickUnloadedCalibration, source: 'logic' | 'servo', on: boolean): PickUnloadedCalibration {
  if (on && !s.inspected.every(Boolean)) throw new Error('Inspect both unloaded output splines first');
  if (source === 'servo') { if (on && !s.logic) throw new Error('Logic must be powered before servo power'); return { ...s, servo: on }; }
  let driver = raArmDriverPower(s.driver, on);
  if (on) driver = raArmDriverConfigure50(driver, { ...bus(s), unoPowered: true });
  return { ...s, logic: on, driver };
}
export function pickUnloadedOutputs(s: PickUnloadedCalibration) {
  return raArmDriverOutputs(s.driver, { servoSupply: s.servo, outputEnabled: true, leads: Array.from({ length: 6 }, () => ({ signal: true, power: true, ground: true })) }).slice(0, 2);
}
function command(s: PickUnloadedCalibration, channel: CalibrationChannel, reference: CalibrationReference) {
  const id = s.writeId + 1;
  return { ...s, writeId: id, driver: raArmDriverWrite(s.driver, bus(s), { id, atUs: id * 20000, kind: 'servo', channel, pulseUs: pickUnloadedReferences[channel].requests[reference] }) };
}
export function pickUnloadedRequest(s: PickUnloadedCalibration, channel: CalibrationChannel, reference: CalibrationReference): PickUnloadedCalibration {
  if (!s.logic || !s.servo || !s.inspected.every(Boolean)) throw new Error('Inspect the unloaded shafts and enable both required sources');
  return { ...command(s, channel, reference), returning: false };
}
export function pickUnloadedAdvance(s: PickUnloadedCalibration, ms: number): PickUnloadedCalibration {
  if (!Number.isFinite(ms) || ms < 0 || ms > 60000) throw new RangeError('Invalid calibration time');
  const outputs = pickUnloadedOutputs(s);
  const angles = s.angles.map((angle, i) => {
    const out = outputs[i], c = pickRoverTeachingCalibration[i], r = pickUnloadedReferences[i];
    if (out.status !== 'tracking' || out.pulseUs === null) return angle;
    const fraction = (out.pulseUs - c.pulseA) / (c.pulseB - c.pulseA);
    if (fraction < -1e-6 || fraction > 1 + 1e-6) return angle;
    const target = r.angles[0] + Math.max(0, Math.min(1, fraction)) * (r.angles[1] - r.angles[0]);
    return target + (angle - target) * Math.exp(-ms / pickRoverRig.servoResponseMs);
  }) as [number, number];
  return { ...s, angles };
}
export function pickUnloadedCanRecord(s: PickUnloadedCalibration, channel: CalibrationChannel, reference: CalibrationReference) {
  const c = pickRoverTeachingCalibration[channel], pulse = reference ? c.pulseB : c.pulseA, out = pickUnloadedOutputs(s)[channel];
  return s.logic && s.servo && out.status === 'tracking' && out.pulseUs !== null && Math.abs(out.pulseUs - pulse) < .01 && Math.abs(s.angles[channel] - pickUnloadedReferences[channel].angles[reference]) < .002 && (reference === 0 || s.records[channel][0] !== null);
}
export function pickUnloadedRecord(s: PickUnloadedCalibration, channel: CalibrationChannel, reference: CalibrationReference): PickUnloadedCalibration {
  if (!pickUnloadedCanRecord(s, channel, reference)) throw new Error('Send the reference and wait for the unloaded shaft to settle');
  const records = s.records.map(r => [...r]) as [[number | null, number | null], [number | null, number | null]];
  records[channel][reference] = pickUnloadedOutputs(s)[channel].pulseUs;
  return { ...s, records };
}
export function pickUnloadedReturn(s: PickUnloadedCalibration): PickUnloadedCalibration {
  if (!s.logic || !s.servo || s.records.some(r => r.some(p => p === null))) throw new Error('Record both references for both servos first');
  return { ...command(command(s, 0, 0), 1, 0), returning: true };
}
export function pickUnloadedAtReference(s: PickUnloadedCalibration) {
  return s.returning && s.records.every(r => r.every(p => p !== null)) && s.angles.every((a, i) => Math.abs(a - pickUnloadedReferences[i].angles[0]) < .002);
}
export function pickUnloadedReady(s: PickUnloadedCalibration) {
  return !s.logic && !s.servo && pickUnloadedAtReference(s);
}
