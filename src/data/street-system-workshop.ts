import { lampsOn } from './street-light';
import {streetShadeCoverage} from './street-system-shade';

/** Three separate D5/D6/D7 circuits; faults never change the sketch's command. */
export interface StreetSystemSettings {
  usb: boolean;
  ambient: number;
  shade: number;
  sensorConnected: boolean;
  returns: readonly [boolean, boolean, boolean];
  outputs: readonly [boolean, boolean, boolean];
}
export interface StreetSystemState {
  nowMs: number;
  untilSampleMs: number;
  command: boolean;
  raw: number | null;
  rows: readonly { atMs: number; raw: number; command: boolean }[];
}
export const streetSystemDefaults: StreetSystemSettings = {
  usb: false, ambient: 100, shade: 0, sensorConnected: true,
  returns: [true, true, true], outputs: [true, true, true],
};
export function streetSystemInitial(): StreetSystemState {
  return { nowMs: 0, untilSampleMs: 0, command: false, raw: null, rows: [] };
}
export function streetSystemRaw(ambient: number, shade: number): number {
  if (![ambient, shade].every(Number.isFinite) || ambient < 0 || ambient > 100 || shade < 0 || shade > 100)
    throw new RangeError('Ambient light and shade must be between 0 and 100.');
  // Authored divider response, not a lux measurement or a measured LDR curve.
  return Math.round(180 + 640 * ambient / 100 * (1 - streetShadeCoverage(shade) / 100));
}
export function streetSystemAdvance(state: StreetSystemState, elapsedMs: number, settings: StreetSystemSettings): StreetSystemState {
  if (!Number.isFinite(elapsedMs) || elapsedMs < 0) throw new RangeError('Elapsed time must be finite and nonnegative.');
  const raw = streetSystemRaw(settings.ambient, settings.shade);
  const end = state.nowMs + elapsedMs;
  if (!settings.usb) return { nowMs: end, untilSampleMs: 0, command: false, raw: null, rows: [] };
  // An open analogue input floats: do not invent a deterministic sensor reading.
  if (!settings.sensorConnected) return { ...state, nowMs: end, raw: null, untilSampleMs: 0 };
  let command = state.command;
  let until = state.untilSampleMs;
  let time = state.nowMs;
  const rows = [...state.rows];
  while (until <= end - time) {
    time += until;
    command = lampsOn(raw, command);
    rows.push(Object.freeze({ atMs: time, raw, command }));
    until = 100;
  }
  return { nowMs: end, untilSampleMs: until - (end - time), command, raw, rows: rows.slice(-100) };
}
export function streetSystemLamps(state: StreetSystemState, settings: StreetSystemSettings): readonly (boolean | null)[] {
  return settings.outputs.map((connected, index) => {
    if (!settings.usb || !connected || !settings.returns[index]) return false;
    return settings.sensorConnected ? state.command : null;
  });
}
export function streetSystemSerial(row: StreetSystemState['rows'][number]): string {
  return `A0 = ${row.raw} | LAMPS ${row.command ? 'ON' : 'OFF'}`;
}
