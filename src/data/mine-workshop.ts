import { entryReading, mineAlarm, mineRules, type MineReading } from './mine-safety';

export type MineAlarm = ReturnType<typeof mineAlarm>;
export type MineInputs = { entry: MineReading; face: MineReading; link: boolean };
export type MinePacket = { sequence: number; receivedMs: number; entry: MineReading; face: MineReading; alarm: MineAlarm };
export type MineSession = { nowMs: number; nextPacketMs: number; sequence: number; running: boolean; local: MineAlarm; packet: MinePacket | null };
/** Authored browser publication cadence; the supplied Python replay has no live transport. */
export const minePublicationMs = 500;
export const mineDefaultInputs: MineInputs = { entry: { ...entryReading }, face: { gas: 22, ventilation: 72 }, link: true };
export const mineInitial = (): MineSession => ({ nowMs: 0, nextPacketMs: 0, sequence: 0, running: false, local: 'Normal', packet: null });
function index(value: number | null) { return value !== null && Number.isFinite(value) && value >= 0 && value <= 100 ? value : null; }
export function mineReading(reading: MineReading): MineReading { return { gas: index(reading.gas), ventilation: index(reading.ventilation) }; }
export function mineAdvance(previous: MineSession, elapsedMs: number, input: MineInputs): MineSession {
  if (!Number.isSafeInteger(elapsedMs) || elapsedMs < 0 || !Number.isSafeInteger(previous.nowMs + elapsedMs)) throw Error('Advance by a non-negative safe integer number of model milliseconds.');
  if (!previous.running) return previous;
  const entry = mineReading(input.entry), face = mineReading(input.face), local = mineAlarm([entry, face]);
  const nowMs = previous.nowMs + elapsedMs;
  let packet = previous.packet, sequence = previous.sequence, nextPacketMs = previous.nextPacketMs;
  // The last crossed publication boundary is enough: every sample in this interval has the supplied inputs.
  if (nextPacketMs <= nowMs) {
    const count = Math.floor((nowMs - nextPacketMs) / minePublicationMs) + 1;
    const latest = nextPacketMs + (count - 1) * minePublicationMs;
    if (input.link) { sequence += count; packet = { sequence, receivedMs: latest, entry: { ...entry }, face: { ...face }, alarm: local }; }
    nextPacketMs += count * minePublicationMs;
  }
  return { ...previous, nowMs, nextPacketMs, sequence, local, packet };
}
export function mineRemote(session: MineSession) {
  if (!session.packet) return { status: 'Waiting' as const, ageMs: null, packet: null };
  const ageMs = session.nowMs - session.packet.receivedMs;
  return { status: ageMs >= mineRules.staleMs ? 'Stale' as const : 'Fresh' as const, ageMs, packet: session.packet };
}
export function mineBeaconState(session: MineSession) {
  return { color: session.local === 'Alarm' ? '#f45465' : session.local === 'Sensor fault' ? '#f4b64f' : '#35ca99', pulseHz: session.local === 'Alarm' ? 2 : session.local === 'Sensor fault' ? 1 : 0 };
}
export const mineLesson = [
  { name: 'Trace the two sources', face: { gas: 22, ventilation: 72 }, link: true, explanation: 'The entry and working face keep separate readings. Both are normal. Trace each station to the local rule unit, then follow its copied record to the remote console.' },
  { name: 'Raise the face gas index', face: { gas: 84, ventilation: 72 }, link: true, explanation: 'Only the working-face gas index changes. At 70 or above the local beacon reports Alarm. The unchanged entry reading must remain 18, not copy the face reading.' },
  { name: 'Lose a reading', face: { gas: null, ventilation: 72 }, link: true, explanation: 'A missing gas reading is not zero. With no known alarm, the local rule reports Sensor fault and the amber teaching beacon identifies the unavailable input.' },
  { name: 'Keep the known alarm', face: { gas: null, ventilation: 19 }, link: true, explanation: 'Ventilation at 19 is a known alarm even though gas is missing. Alarm has priority over Sensor fault; missing information must not hide the condition we already know.' },
  { name: 'Break telemetry, restore local normal', face: { gas: 22, ventilation: 72 }, link: false, explanation: 'The local beacon returns to Normal. The remote console retains its last Alarm record and becomes Stale after three seconds. A lost link does not freeze local evaluation.' },
  { name: 'Restore telemetry', face: { gas: 22, ventilation: 72 }, link: true, explanation: 'The next copied record updates both remote source readings and its timestamp together. Fresh means a recent record; it does not mean the environment is normal.' },
] satisfies { name: string; face: MineReading; link: boolean; explanation: string }[];
