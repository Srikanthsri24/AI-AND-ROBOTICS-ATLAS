import { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, CircuitBoard, Code2, Copy, Download, Pause, Play, RotateCcw, Save, SkipForward } from 'lucide-react';
import CircuitLab from './CircuitLab';
import LabWorkbench from './LabWorkbench';
import { workshopLabs, type WorkshopLab } from '../data/workshop-labs';
import { distinctLabs, type BenchPart } from '../data/distinct-labs';
import { hardwareFamilies } from '../data/hardware';
import { resolveExperiment, type Reading } from './lab-experiments';
import { download } from './state';
import '../styles/circuit-workshop.css';

const guideRoutes: Record<number, string> = {2:'components',3:'controllers',4:'sensors',5:'robots',6:'anatomy'};
const instructions: Record<string,[string,string,string]> = {
  blink: ['A timed LED indicates controller activity.','Panel indicators give operators a quick way to distinguish standby from a running program.','Run with 330 Ω, then try 680 Ω. Current should fall, while the blink interval stays the same.'],
  button: ['A switch pulls a normally high input to ground.','Door, pedal and panel switches use this pattern to produce a defined digital state.','Press and release the switch on the bench. Compare the D2 logic level with the LED state.'],
  traffic: ['A timed state machine controls three outputs.','Model crossings and status indicators use mutually exclusive phases.','Step from red to green to amber. Then change one phase duration and time the next cycle.'],
  buzzer: ['A comparator turns a measured value into a binary alarm.','Equipment prototypes can warn when a level, pressure or light reading crosses a limit.','Set the input one count below the threshold, then increase it to the threshold. Compare the buzzer state.'],
  ultrasonic: ['The echo duration estimates the distance to a target.','Parking aids and tank headspace monitors use reflected sound to estimate clearance.','Set the echo to 1,000 µs at 20 °C. Expect about 17.2 cm. Set the echo to zero to see how a timeout is handled.'],
  servo: ['Pulse width communicates a requested servo angle.','Camera brackets, pointers and lightweight gates use this pattern for repeatable positioning.','Set a 90° target and run the sweep. The horn moves between home and target, with a 1,500 µs pulse at the target.'],
  temperature: ['An ADC converts the TMP36 voltage into a digital code.','Environmental loggers use a sensor transfer function to turn voltage into a temperature estimate.','Set 25 °C and compare the ADC code at two reference voltages. The sensor voltage should stay at 0.750 V.'],
  iot: ['A sampled value travels from a virtual device into a chart.','Greenhouses and equipment cabinets use telemetry to track trends and flag threshold crossings.','Run several steps, then move the threshold below the current temperature. Compare the alert and export the trace.'],
  motor: ['PWM changes the fraction of each cycle that the motor driver applies power.','Conveyors and fans use duty commands to adjust their drive. Actual speed also depends on load and motor characteristics.','Set 50% duty with a 6 V supply. Expect 3 V ideal average. Disable the driver and confirm the shaft stops.'],
  avoidance: ['The controller checks distance and measurement validity before issuing a motion command.','Indoor mobile robots use range checks when approaching shelves and obstacles.','Set a distance just above the threshold, lower it below the threshold, then mark it invalid. Compare Forward, Stop & Replan, and Stop.'],
};
const image = (id: string) => `./images/lab-illustrations/${id}.webp`;
const partNotes: Record<string, [string, string, string]> = {
  blink: ['Provides the voltage across the series path.', 'Limits current through the LED when the output is high.', 'Emits light while forward current flows. The return path closes the circuit.'],
  button: ['Connects D2 to ground when pressed.', 'The internal pull-up holds D2 high when the switch is open.', 'The sketch drives the built-in LED high when D2 reads low.'],
  traffic: ['Holds each state for its configured duration.', 'Transitions in order from red to green to amber.', 'The active phase enables one lamp on D8, D9 or D10.'],
  buzzer: ['Represents the analog reading from a sensor or potentiometer.', 'Compares the ADC reading with the configured threshold.', 'The controller enables the buzzer through a driver when the threshold is reached.'],
  ultrasonic: ['The echo output represents the time for sound to reach the target and return.', 'Multiplies echo time by the estimated speed of sound, then divides by two.', 'Reports the calculated distance or flags a missing echo.'],
  servo: ['Sets the requested position between 0° and 180°.', 'Maps the command to a pulse on the servo signal line.', 'The horn shows the requested angle. Actual travel depends on the servo and load.'],
  temperature: ['Models an analog output of 0.5 V plus 10 mV per °C.', 'Converts sensor voltage to one of 1,024 codes using the selected reference.', 'Converts the quantized voltage back to a temperature.'],
  iot: ['Generates a temperature sample for the virtual device.', 'Adds a sequence number so readings can be tracked in order.', 'Plots recent samples and compares the latest reading with the threshold.'],
  motor: ['Sets the fraction of each cycle that the driver is commanded on.', 'Applies the motor supply during the on portion while enabled.', 'Receives the switched supply. The result reports ideal average voltage.'],
  avoidance: ['Supplies the measured distance and a validity flag.', 'Stops on an invalid reading or requests replanning inside the stop threshold.', 'Shows the bounded command that the controller would pass to a drive stage.'],
};

export default function CircuitWorkshop({ entry, view }: { entry: string | null; view?: string | null }) {
  const selected = workshopLabs.find(lab => lab.id === entry) ?? workshopLabs[0];
  const [filter, setFilter] = useState('All labs');
  const [search, setSearch] = useState('');
  const [playground, setPlayground] = useState(false);
  const categories = ['All labs', ...new Set(workshopLabs.map(lab => lab.category))];
  const visible = workshopLabs.filter(lab => (filter === 'All labs' || lab.category === filter)
    && `${lab.title} ${lab.description}`.toLowerCase().includes(search.trim().toLowerCase()));
  function openLab(id: string) {
    location.hash = `#/circuit-lab/${id}`;
  }

  return <div className="ws-page cwl">
    <header className="cwl-header">
      <div><span className="cwl-kicker"><CircuitBoard size={16}/> ATLAS LABORATORY</span>
        <h1>Circuit &amp; Code Laboratory</h1>
        <p>Explore {workshopLabs.length} labs. Trace the signal, change the inputs, and inspect the result.</p>
      </div>
      <button type="button" aria-pressed={playground} onClick={() => setPlayground(value => !value)}>
        {playground ? 'Back to guided labs' : 'Open wiring playground'} <ArrowUpRight size={16}/>
      </button>
    </header>
    {playground ? <CircuitLab/> : <div className="cwl-layout">
      <aside className="cwl-library">
        <label>Experiment library
          <select value={filter} onChange={event => setFilter(event.target.value)}>
            {categories.map(category => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label>Search labs<input type="search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Try servo or temperature"/></label>
        <p className="cwl-match-count" role="status">{visible.length} of {workshopLabs.length} labs</p>
        <nav aria-label="Guided laboratories">
          {visible.map(lab =>
            <button key={lab.id} aria-current={selected.id === lab.id ? 'true' : undefined} onClick={() => openLab(lab.id)}>
              {lab.bench ? <span className="cwl-lab-index" aria-hidden="true">{String(workshopLabs.indexOf(lab) + 1).padStart(3, '0')}</span> : <img src={image(lab.id)} alt="" width="48" height="40" loading="lazy"/>}
              <span>{lab.title}<small>{lab.category}</small></span>
            </button>
          )}
        </nav>
        {visible.length === 0 && <p className="cwl-match-count">No labs match this search.</p>}
      </aside>
      <LabWorkspace key={selected.id} lab={selected} initialTab={view}/>
    </div>}
  </div>;
}

function LabWorkspace({ lab, initialTab }: { lab: WorkshopLab; initialTab?: string | null }) {
  const tabs = ['Experiment', 'Code', 'Guide', 'Instructions'];
  const [tab, setTab] = useState(() => tabs.find(name => name.toLowerCase() === initialTab) ?? 'Experiment');
  function openTab(name: string) {
    setTab(name);
    history.replaceState(history.state, '', `#/circuit-lab/${lab.id}/${name.toLowerCase()}`);
  }
  const bench = lab.bench ?? lab.id;
  const model = distinctLabs[lab.id];
  const [what, why, example] = model ? [
    `${model.parts.map(part => part.label).join(' → ')}. The measured result is ${model.output.toLowerCase()}.`,
    '',
    `Run from the starting settings and observe ${model.output.toLowerCase()} over several ticks. Reset, change ${model.input.toLowerCase()}, and compare at the same tick.`,
  ] : instructions[bench];
  const experiment = resolveExperiment(lab.id);
  const startingInputs = Object.fromEntries(experiment.controls.map(control =>
    [control.key, lab.preset?.[control.key] ?? control.initial]));
  const firstReading = experiment.read(startingInputs, 0, lab.flag ?? experiment.toggle?.initial ?? false);
  const comparison = model && experiment.controls.flatMap(control =>
    [...new Set([control.min, control.max])].flatMap(value => Array.from({length: 13}, (_, tick) => {
      const baseline = experiment.read(startingInputs, tick, false);
      const changed = experiment.read({...startingInputs, [control.key]: value}, tick, false);
      return {control, value, tick, baseline, changed};
    }))).find(example => example.baseline.value !== example.changed.value);
  return <article className="cwl-workspace">
    <header className="cwl-lab-heading">
      <div><span className="cwl-kicker">{lab.category}</span><h2>{lab.title}</h2><p>{lab.description}</p></div>
    </header>
    <nav className="cwl-tabs" aria-label="Lab view">
      {tabs.map(name => <button key={name} aria-pressed={tab === name} onClick={() => openTab(name)}>{name}</button>)}
    </nav>
    <section hidden={tab !== 'Experiment'}><Simulation lab={lab}/></section>
    <section hidden={tab !== 'Code'}><SourceNotebook lab={lab}/></section>
    <section className="cwl-guide" hidden={tab !== 'Guide'}>
      <h3>What you’ll learn</h3><p>{lab.learn}</p>
      <ol>{lab.setup.map(step => <li key={step}>{step}</li>)}</ol>
      <h3>Connected Atlas guides</h3>
      <div className="cwl-actions">{lab.families.map(id => {
        const family = hardwareFamilies.find(item => item.id === id);
        return family && <a key={id} href={`#/${guideRoutes[family.module]}/${id}?lab=${lab.id}`}>
          {family.title}<ArrowUpRight size={14}/>
        </a>;
      })}</div>
    </section>
    <section className="cwl-guide cwl-instructions" hidden={tab !== 'Instructions'}>
      <h3>What it does</h3><p>{what}</p>
      <h3>Why it matters</h3><p>{lab.learn}</p>
      <h3>Where you’d use it</h3><p>{lab.where ? `This lab models ${lab.where}.` : why}</p>
      <h3>Try it in the lab</h3>
      {lab.bench && <p><strong>Starting result · {firstReading.value}</strong><br/>{firstReading.detail}</p>}
      <p>{comparison ? `At tick ${comparison.tick}, the starting settings give ${comparison.baseline.value}. Change ${comparison.control.label.toLowerCase()} to ${comparison.value}, keep the other settings the same, and compare at the same tick. Expect ${comparison.changed.value}.` : example}</p>
      <h3>Model limits</h3><p>{lab.model}</p>
    </section>
  </article>;
}

const partRoles: Record<string, string> = {
  switch: 'Opens or closes a signal path to represent a physical contact.',
  clock: 'Provides the time reference used to count ticks or time a transition.',
  supply: 'Provides the voltage used for the modeled measurement.',
  resistor: 'Restricts current and dissipates electrical energy as heat.',
  led: 'Lights when the modeled output enables it.',
  buzzer: 'Converts the alert command into a vibration, shown on the bench.',
  pressure: 'Converts force on a surface into a pressure reading.',
  soil: 'Represents a moisture-sensitive probe whose reading feeds the rule.',
  light: 'Provides a reading that changes with the simulated light level.',
  ultrasonic: 'Uses the time between a sound pulse and its echo to estimate range.',
  temperature: 'Converts temperature into a measurement the controller can use.',
  radio: 'Represents the link that carries samples to the receiver.',
  meter: 'Displays a modeled measurement on a dial.',
  display: 'Shows the value produced by the experiment.',
  servo: 'Rotates to a commanded position and moves the attached linkage.',
  driver: 'Receives a control command and represents the stage that switches the load.',
  motor: 'Turns the shaft that drives the mechanical load.',
  fan: 'Uses the rotating impeller to move air.',
  conveyor: 'Carries items past the sensing or sorting station.',
  target: 'Represents the physical object, surface, or boundary being measured.',
  tank: 'Represents the vessel or liquid surface involved in the measurement.',
  camera: 'Pans with the actuator to point the camera in a new direction.',
  gate: 'Changes position in response to the drive command.',
  rover: 'Represents the mobile base receiving the motion decision.',
  heater: 'Represents the heat source or thermal load in the setup.',
  traffic: 'Shows which signal phase is active.',
  knob: 'Provides an adjustable input to the circuit.',
  gripper: 'Moves the jaws to the requested opening within the travel limit.',
};

function describePart(parts: BenchPart[], index: number, output: string) {
  const { shape } = parts[index];
  const next = parts[index + 1]?.label;
  const previous = parts[index - 1]?.label;
  const paired = parts.length === 3 && parts[0].shape === parts[1].shape
    && ['switch','clock','pressure','temperature','supply','ultrasonic'].includes(parts[0].shape);
  const connection = paired
    ? index < 2 ? `Its value feeds ${parts[2].label} alongside ${parts[1-index].label}.`
      : `Uses both ${parts[0].label} and ${parts[1].label} to show ${output.toLowerCase()}.`
    : previous && next ? `Receives a signal from ${previous} and connects to ${next}.`
      : next ? `Its output connects to ${next}.`
      : `Receives the result from ${previous}.`;
  return `${partRoles[shape] ?? 'Processes the incoming value using this experiment’s rule.'} ${connection}`;
}

function Simulation({ lab }: { lab: WorkshopLab }) {
  const bench = lab.bench ?? lab.id;
  const experiment = resolveExperiment(lab.id);
  const initialInputs = () => Object.fromEntries(experiment.controls.map(control => [control.key, lab.preset?.[control.key] ?? control.initial]));
  const [inputs, setInputs] = useState(initialInputs);
  const [flag, setFlag] = useState(lab.flag ?? experiment.toggle?.initial ?? false);
  const [running, setRunning] = useState(false);
  const [tick, setTick] = useState(0);
  const [part, setPart] = useState(0);
  const [samples, setSamples] = useState<Reading[]>([]);
  const result = experiment.read(inputs, tick, flag);
  const blocked = result.value === 'Overcurrent';

  useEffect(() => {
    if (!running || blocked) return;
    const timeout = window.setTimeout(() => {
      const next = tick + 1;
      setTick(next);
      setSamples(history => [...history.slice(-59), experiment.read(inputs, next, flag)]);
    }, experiment.interval?.(tick, inputs) ?? 1000);
    return () => window.clearTimeout(timeout);
  }, [running, blocked, tick, experiment, inputs, flag]);

  function changeInputs(next: Record<string, number>) {
    setInputs(next);
    const nextReading = experiment.read(next, tick, flag);
    if (nextReading.value === 'Overcurrent') setRunning(false);
    if (bench !== 'iot') setSamples(history => [...history.slice(-59), nextReading]);
  }

  function changeFlag(checked: boolean) {
    setFlag(checked);
    setSamples(history => [...history.slice(-59), experiment.read(inputs, tick, checked)]);
  }

  function step() {
    const next = tick + 1;
    setTick(next);
    setSamples(history => [...history.slice(-59), experiment.read(inputs, next, flag)]);
  }

  function reset() {
    setRunning(false);
    setInputs(initialInputs());
    setFlag(lab.flag ?? experiment.toggle?.initial ?? false);
    setTick(0);
    setPart(0);
    setSamples([]);
  }

  return <div className="cwl-simulation">
    <div className="cwl-toolbar">
      <div className="cwl-actions">
        <button className="cwl-primary" disabled={blocked} onClick={() => {
          if (!running && samples.length === 0) setSamples([result]);
          setRunning(value => !value);
        }}>{running ? <Pause size={16}/> : <Play size={16}/>} {running ? 'Pause' : 'Run'}</button>
        <button disabled={running || blocked} onClick={step}><SkipForward size={16}/> Step</button>
        <button onClick={reset}><RotateCcw size={15}/> Reset</button>
      </div>
      <span className={running ? 'cwl-state active' : 'cwl-state'}>{blocked ? 'Check inputs' : running ? 'Running' : 'Ready'}</span>
    </div>
    <div className="cwl-bench">
      <section className="cwl-stage" aria-label="Interactive signal flow">
        <LabWorkbench lab={lab.id} result={result} inputs={inputs} running={running}
          powered={!blocked && (running || samples.length > 0)} tick={tick} selected={part}
          onSelect={setPart} onSwitch={() => changeFlag(!flag)}/>
        <div className="cwl-part"><strong>{experiment.parts[part]}</strong><p>{distinctLabs[lab.id] ? describePart(distinctLabs[lab.id].parts, part, distinctLabs[lab.id].output) : partNotes[bench][part]}</p></div>
        <div className="cwl-result">
          <span className="cwl-kicker">OUTPUT</span>
          <strong data-testid="lab-output">{result.value}</strong>
          <p>{result.detail}</p>
        </div>
      </section>
      <aside className="cwl-controls">
        <h3>Inputs</h3>
        {experiment.controls.map(control => <label key={control.key}>
          <span>{control.label}<output>{inputs[control.key]} {control.unit}</output></span>
          <input type="range" aria-label={control.label} min={control.min} max={control.max} step={control.step}
            value={inputs[control.key]} onChange={event => changeInputs({ ...inputs, [control.key]: Number(event.target.value) })}/>
        </label>)}
        {experiment.toggle && <label className="cwl-toggle">
          <input type="checkbox" checked={flag} onChange={event => changeFlag(event.target.checked)}/>{experiment.toggle.label}
        </label>}
        <p className="cwl-model">{lab.model}</p>
      </aside>
    </div>
    <details className="lab-trace-details"><summary>Output trace and CSV</summary><Trace samples={samples} lab={lab.id}/></details>
  </div>;
}

function Trace({ samples, lab }: { samples: Reading[]; lab: string }) {
  const values = samples.map(sample => sample.sample);
  const min = Math.min(...values);
  const span = Math.max(Math.max(...values) - min, 1);
  const points = values.map((value, index) => `${8 + index / Math.max(values.length - 1, 1) * 484},${64 - (value - min) / span * 52}`).join(' ');
  return <section className="cwl-trace">
    <header><h3><Activity size={17}/> Output trace</h3>
      <button disabled={!samples.length} onClick={() => download(`atlas-${lab}-trace.csv`,
        ['sample,value,unit', ...samples.map((sample, index) => `${index + 1},${sample.sample},${sample.unit}`)].join('\n'), 'text/csv')}>
        <Download size={15}/> Export CSV
      </button>
    </header>
    {samples.length > 0 ? <>
      <svg viewBox="0 0 500 72" role="img" aria-label={`Recent ${samples.at(-1)?.unit} readings`}>
        <path d="M8 64H492 M8 38H492 M8 12H492" stroke="currentColor" opacity=".16"/>
        {samples.length === 1 ? <circle cx="8" cy="64" r="3" fill="currentColor"/> :
          <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke"/>}
      </svg>
      <p>{samples.length} recent {samples.length === 1 ? 'sample' : 'samples'} · {samples.at(-1)?.unit}</p>
    </> : <p>Run or step the experiment to collect readings.</p>}
  </section>;
}

function SourceNotebook({ lab }: { lab: WorkshopLab }) {
  const key = `atlas-lab-code-${lab.id}`;
  const [source, setSource] = useState(() => {
    try { return localStorage.getItem(key) ?? lab.code; } catch { return lab.code; }
  });
  const [status, setStatus] = useState('');
  return <div className="cwl-code">
    <h3><Code2 size={18}/> Source notebook</h3>
    <p>{lab.language}. The simulator runs the lab’s browser model independently of the editable source.</p>
    <textarea aria-label={`${lab.title} source code`} spellCheck={false} maxLength={200000} value={source} onChange={event => setSource(event.target.value)}/>
    <div className="cwl-actions">
      <button onClick={() => {
        try { localStorage.setItem(key, source); setStatus('Source saved to this browser.'); }
        catch { setStatus('Browser storage is unavailable. Use Download to save a copy.'); }
      }}><Save size={15}/> Save</button>
      <button onClick={() => download(`atlas-${lab.id}.${lab.bench ? 'js' : lab.id === 'iot' ? 'py' : 'ino'}`, source)}><Download size={15}/> Download</button>
      <button onClick={async () => {
        try { await navigator.clipboard.writeText(source); setStatus('Source copied.'); }
        catch { setStatus('Clipboard is unavailable. Use Download to save a copy.'); }
      }}><Copy size={15}/> Copy</button>
      <button onClick={() => { setSource(lab.code); setStatus('Example restored in the editor.'); }}><RotateCcw size={15}/> Restore example</button>
    </div>
    {status && <p role="status">{status}</p>}
  </div>;
}
