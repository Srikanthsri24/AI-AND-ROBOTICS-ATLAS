import { distinctLabs } from "../data/distinct-labs.ts";
import { acousticDistance, ledCurrent, roverDecision, tmp36Reading } from '../data/workshop-labs.ts';

type Control = { key: string; label: string; min: number; max: number; step: number; initial: number; unit: string };
const slider = (key: string, label: string, min: number, max: number, initial: number, unit = '', step = 1): Control =>
  ({ key, label, min, max, initial, unit, step });

type Experiment = {
  parts: string[];
  wires: string[];
  controls: Control[];
  toggle?: { label: string; initial: boolean };
  interval?: (tick: number, inputs: Inputs) => number;
  read: (inputs: Inputs, tick: number, flag: boolean) => Reading;
};
type Inputs = Record<string, number>;
export type Reading = { value: string; detail: string; active: boolean; sample: number; unit: string };
const reading = (value: string, detail: string, active: boolean, sample: number, unit: string): Reading =>
  ({ value, detail, active, sample, unit });

export const experiments: Record<string, Experiment> = {
  blink: {
    parts: ['DC supply', 'Series resistor', 'Red LED'], wires: ['Supply → resistor', 'Resistor → LED'],
    controls: [slider('voltage', 'Supply voltage', 2, 9, 5, 'V', .1), slider('resistance', 'Series resistance', 100, 1000, 330, 'Ω', 10), slider('period', 'On / off interval', 100, 2000, 500, 'ms', 50)],
    interval: (_, i) => i.period,
    read: (i, tick) => {
      const current = ledCurrent(i.voltage, i.resistance);
      if (current > 20) return reading('Overcurrent', 'Predicted current exceeds 20 mA. Increase the series resistance or reduce the supply voltage.', false, 0, 'mA');
      const active = tick % 2 === 0 && current > 0;
      return reading(`${active ? current.toFixed(2) : '0.00'} mA`, `LED ${active ? 'on' : 'off'} · ${current.toFixed(2)} mA when driven high`, active, active ? current : 0, 'mA');
    },
  },
  button: {
    parts: ['Push button', 'D2 with pull-up', 'Built-in LED'], wires: ['Switch → D2', 'Controller → LED'],
    controls: [], toggle: { label: 'Press virtual button', initial: false },
    read: (_, __, pressed) => reading(pressed ? 'LED on' : 'LED off', pressed ? 'D2 is LOW because the switch connects it to ground.' : 'D2 is HIGH through the internal pull-up.', pressed, Number(pressed), 'logic'),
  },
  traffic: {
    parts: ['Phase timer', 'State sequencer', 'Signal lamps'], wires: ['Timer → sequencer', 'Sequencer → lamps'],
    controls: [slider('red', 'Red duration', 1, 10, 3, 's'), slider('green', 'Green duration', 1, 10, 3, 's'), slider('amber', 'Amber duration', 1, 5, 1, 's')],
    interval: (tick, i) => i[['red', 'green', 'amber'][tick % 3]] * 1000,
    read: (i, tick) => {
      const phase = tick % 3;
      const name = ['Red', 'Green', 'Amber'][phase];
      return reading(name, `${i[name.toLowerCase()]} s · Next phase: ${['green', 'amber', 'red'][phase]}.`, true, phase, 'phase');
    },
  },
  buzzer: {
    parts: ['Analog input A0', 'Threshold rule', 'Active buzzer driver'], wires: ['Input → threshold rule', 'Rule → buzzer driver'],
    controls: [slider('input', 'ADC input', 0, 1023, 500), slider('threshold', 'Alarm threshold', 0, 1023, 600)],
    read: (i) => reading(i.input >= i.threshold ? 'Alert active' : 'Quiet', `ADC code ${i.input} · Alarm activates at ${i.threshold} or above.`, i.input >= i.threshold, Number(i.input >= i.threshold), 'logic'),
  },
  ultrasonic: {
    parts: ['Echo pulse', 'Time-of-flight calculation', 'Distance reading'], wires: ['Echo → calculation', 'Calculation → display'],
    controls: [slider('echo', 'Echo duration', 0, 24000, 1000, 'µs', 10), slider('ambient', 'Air temperature', -10, 45, 20, '°C')],
    read: (i) => {
      const distance = acousticDistance(i.echo, i.ambient);
      return reading(i.echo ? `${distance.toFixed(1)} cm` : 'No valid echo', i.echo ? 'Distance is half the round-trip acoustic path.' : 'A zero-duration pulse indicates a timeout.', i.echo > 0, distance, 'cm');
    },
  },
  servo: {
    parts: ['Angle command', 'Pulse generator', 'Servo horn'], wires: ['Angle → pulse generator', 'Signal → servo'],
    controls: [slider('angle', 'Target angle', 0, 180, 90, '°')],
    toggle: { label: 'Sweep between 0° and target', initial: true },
    read: (i, tick, sweep) => {
      const angle = sweep && tick % 2 ? 0 : i.angle;
      return reading(`${angle}°`, `${Math.round(1000 + angle / 180 * 1000)} µs command pulse.`, true, angle, '°');
    },
  },
  temperature: {
    parts: ['TMP36 model', '10-bit ADC', 'Temperature estimate'], wires: ['Sensor → ADC', 'ADC → conversion'],
    controls: [slider('temp', 'Input temperature', -40, 125, 24, '°C'), slider('reference', 'ADC reference', 2.5, 5, 5, 'V', .1)],
    read: (i) => {
      const r = tmp36Reading(i.temp, i.reference);
      return reading(`${r.estimated.toFixed(1)} °C`, `${r.volts.toFixed(3)} V · ADC ${r.code} / 1023 · error ${(r.estimated - i.temp).toFixed(2)} °C.`, true, r.estimated, '°C');
    },
  },
  iot: {
    parts: ['Virtual ESP32', 'Telemetry stream', 'Threshold dashboard'], wires: ['Device → stream', 'Stream → dashboard'],
    controls: [slider('baseline', 'Temperature baseline', 0, 45, 24, '°C', .5), slider('threshold', 'Alert threshold', 0, 50, 26, '°C', .5)],
    read: (i, tick) => {
      const sample = Math.round((i.baseline + Math.sin(tick * .7) * 2.5) * 10) / 10;
      return reading(`${sample.toFixed(1)} °C`, `esp32-demo · packet ${tick + 1} · ${sample >= i.threshold ? 'Threshold reached' : 'Below threshold'}`, sample >= i.threshold, sample, '°C');
    },
  },
  motor: {
    parts: ['PWM output', 'Motor driver', 'DC motor'], wires: ['PWM → driver', 'Driver → motor'],
    controls: [slider('duty', 'PWM duty cycle', 0, 100, 50, '%'), slider('voltage', 'Motor supply', 3, 12, 6, 'V', .5)],
    toggle: { label: 'Enable motor driver', initial: true },
    read: (i, _, enabled) => {
      const average = enabled ? i.voltage * i.duty / 100 : 0;
      return reading(`${average.toFixed(2)} V`, enabled ? `${i.duty}% duty · Ideal average voltage at the motor.` : 'Driver disabled. No voltage applied.', average > 0, average, 'V');
    },
  },
  avoidance: {
    parts: ['Range sensor', 'Validity & range rule', 'Rover command'], wires: ['Range → decision rule', 'Decision → drive command'],
    controls: [slider('distance', 'Obstacle distance', 0, 100, 35, 'cm'), slider('threshold', 'Stop threshold', 5, 75, 20, 'cm')],
    toggle: { label: 'Valid range reading', initial: true },
    read: (i, _, valid) => {
      const forward = valid && i.distance >= i.threshold;
      return reading(roverDecision(valid, i.distance, i.threshold), `${i.distance} cm measured · ${i.threshold} cm stop threshold.`, forward, Number(forward), 'command');
    },
  },
};

export function resolveExperiment(id: string): Experiment {
  return scenarioExperiments[id] ?? experiments[id];
}

const scenarioExperiments = Object.fromEntries(Object.entries(distinctLabs).map(([id, model]) => {
  const { input, second, output, unit, a, b, evaluate } = model;
  const binary = (name: string) => /enable|state|contact|presence|contestant|switch|jog input|manual stop|acknowledge key|held input|dock sensor|guard closed/i.test(name);
  const primary = slider('a', input, 0, binary(input) && a <= 1 ? 1 : 10, a);
  const controls = second === '—' ? [primary] : [primary, slider('b', second, 0, binary(second) && b <= 1 ? 1 : 10, b)];
  const experiment: Experiment = {
    parts: model.parts.map(part => part.label),
    wires: [],
    controls,
    interval: () => 650,
    read: (inputs, tick) => {
      const sample = evaluate(inputs.a, inputs.b ?? b, tick);
      const value = unit === 'logic' ? (sample ? 'On' : 'Off') : `${Number(sample.toFixed(2))} ${unit}`;
      return reading(value, `${output} · ${input}: ${inputs.a}${inputs.b === undefined ? '' : ` · ${second}: ${inputs.b}`} · Tick ${tick}`, sample > 0, sample, unit);
    },
  };
  return [id, experiment];
}));
