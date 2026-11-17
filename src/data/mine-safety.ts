import type { Build } from './guided-projects';

export const mineSafety:Build={
  id:'directory-12',
  title:'IoT-Based Coal Mine Safety Monitoring and Alerting System',
  outcome:'Use synthetic readings in a virtual mine to test a local alarm and a remote dashboard when conditions change or telemetry drops.',
  parts:[
    ['Virtual tunnel stations','2','Generate independent synthetic gas and ventilation readings for the entry and working face.'],
    ['Virtual local alarm','1','Reports the strongest current condition using the tunnel beacon and its status label.'],
    ['Virtual telemetry dashboard','1','Displays the last received sample and marks it stale when packets stop arriving.'],
  ],
  assembly:[
    ['Locate the two stations','Inspect the entry and working-face stations. Give each station its own source name so a reading can be traced to its location.','Confirm that changing the face reading leaves the entry reading at its baseline.',[0]],
    ['Map readings to the local beacon','Connect the synthetic readings to the alarm rules in the map below. Use the gas and ventilation indices to choose Normal or Alarm. Missing readings must report Sensor fault unless a valid reading already triggers Alarm.','Predict the beacon state for a high gas index, low ventilation and a missing sample.',[0,1]],
    ['Set up the remote dashboard','Send a copy of each sample to the dashboard. Keep its timestamp with the reading and mark it stale after three seconds without a packet.','A lost network link changes only the remote state. The local alarm still follows current readings.',[1,2]],
  ],
  wiring:[
    ['Entry and working-face stations','Local alarm rules','Evaluate each station independently'],
    ['Local alarm and source readings','Virtual network link','Publish the current state with the sample time'],
    ['Last sample timestamp','Remote dashboard','Use a three-second stale timeout'],
  ],
  test:'Start at baseline, then try elevated gas, low ventilation and a missing face sample. Confirm that a known alarm takes priority over a sensor fault. Break the network link and change the local condition. After three seconds, expect the remote result to read Stale while the local beacon still responds.',
  demo:['Working-face scenario','Baseline','Elevated gas','Local normal','Local alarm and a dashboard update'],
};

export const mineRules={gasAlarm:70,ventilationAlarm:30,staleMs:3000};
export type MineReading={gas:number|null;ventilation:number|null};
export const entryReading:MineReading={gas:18,ventilation:76};
export const mineScenarios=[
  {name:'Baseline',gas:22,ventilation:72},
  {name:'Elevated gas',gas:84,ventilation:72},
  {name:'Low ventilation',gas:22,ventilation:19},
  {name:'Missing gas reading',gas:null,ventilation:72},
  {name:'Alarm plus missing reading',gas:null,ventilation:19},
] satisfies (MineReading & {name:string})[];

export function mineAlarm(readings:MineReading[]) {
  if(readings.some(({gas,ventilation})=>(gas!==null&&gas>=mineRules.gasAlarm)||(ventilation!==null&&ventilation<=mineRules.ventilationAlarm))) return 'Alarm';
  if(readings.some(({gas,ventilation})=>gas===null||ventilation===null)) return 'Sensor fault';
  return 'Normal';
}

export const mineProgram={
  filename:'mine_alert_training.py',
  setup:'Compare the Python output with the browser scenarios. The inputs and thresholds are fictional training indices on a 0–100 scale.',
  source:`"""Replay synthetic tunnel sensor data and a network outage."""
GAS_ALARM = ${mineRules.gasAlarm}
VENTILATION_ALARM = ${mineRules.ventilationAlarm}
STALE_MS = ${mineRules.staleMs}
ENTRY = (${entryReading.gas}, ${entryReading.ventilation})

def local_alarm(readings):
    if any((gas is not None and gas >= GAS_ALARM) or
           (vent is not None and vent <= VENTILATION_ALARM)
           for gas, vent in readings):
        return "Alarm"
    if any(gas is None or vent is None for gas, vent in readings):
        return "Sensor fault"
    return "Normal"

def dashboard(now_ms, last_packet_ms, last_state):
    return "Stale" if now_ms - last_packet_ms >= STALE_MS else last_state

if __name__ == "__main__":
    cases = [
        ("Baseline", (22, 72), "Normal"),
        ("Elevated gas", (84, 72), "Alarm"),
        ("Low ventilation", (22, 19), "Alarm"),
        ("Missing gas reading", (None, 72), "Sensor fault"),
        ("Alarm plus missing reading", (None, 19), "Alarm"),
    ]
    for label, face, expected in cases:
        result = local_alarm([ENTRY, face])
        assert result == expected
        print(f"{label}: {result}")
    assert local_alarm([ENTRY, (GAS_ALARM, 72)]) == "Alarm"
    assert local_alarm([ENTRY, (22, VENTILATION_ALARM)]) == "Alarm"
    assert dashboard(2999, 0, "Normal") == "Normal"
    assert dashboard(3000, 0, "Normal") == "Stale"
    print("Network outage at 3000 ms: Stale")
`,
};
