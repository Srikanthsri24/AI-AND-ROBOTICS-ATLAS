import type { Build } from './guided-projects';

export const lidarMicroDrone: Build = {
  id:'directory-5',
  title:'LiDAR Micro Drone with Proximity Sensing',
  outcome:'Assemble a Crazyflie micro drone with two ranging decks, measure a wall on the bench, and use those readings to test a forward-stop flight rule.',
  parts:[
    ['Crazyflie 2.1+ kit','1','The flight controller reads the deck sensors. The kit supplies the frame, motors, battery and long deck headers.'],
    ['Bitcraze Multi-ranger deck','1','Its front time-of-flight sensor reports the distance to a wall. The other sensors provide additional directional measurements.'],
    ['Bitcraze Flow deck V2','1','A downward optical flow sensor estimates motion over the floor. A downward time-of-flight sensor measures height.'],
    ['Crazyradio 2.0 USB dongle','1','Carries live range readings from the drone to a computer running the Python bench program.'],
  ],
  assembly:[
    ['Identify the nose and deck headers','Locate the front markings on the flight controller and both decks. Switch off the drone, unplug the battery and remove all propellers for the bench test. Seat the long expansion headers evenly.','Both header rows are straight and fully seated. Set the propellers aside for this project’s bench work.',[0,1,2]],
    ['Install the downward Flow deck','Fit the Flow deck beneath the controller. Align its front marking with the nose and leave the optical window facing down. Support the frame on open-sided blocks if needed so the window stays clear.','You can see both downward sensor windows from below. The deck’s board and mounting feet sit square.',[0,2]],
    ['Install the upper Multi-ranger deck','Seat the Multi-ranger above the controller with the front sensor pointing through the nose and its top sensor facing up. Check for offset pins before reconnecting the battery.','Both deck rows engage the headers without force, and no battery wire crosses the front sensor.',[0,1]],
    ['Set up the ranging bench','Connect the Crazyradio to the computer. Put the drone on the bench and set a large matte card perpendicular to the front sensor. Mark 35, 45, 55 and 75 cm from the front sensor face.','The card intersects the front sensor’s view at every mark. The drone stays stationary throughout testing.',[1,3]],
  ],
  wiring:[
    ['Multi-ranger deck','Upper Crazyflie expansion headers','I²C time-of-flight measurements, including range.front'],
    ['Flow deck V2','Lower Crazyflie expansion headers','Downward optical flow and range.zrange'],
    ['Crazyradio 2.0','Computer USB','Host receives telemetry over the radio link'],
    ['Crazyflie kit battery','Crazyflie battery connector','Onboard power after both decks are seated'],
  ],
  test:'With propellers removed, place the matte card at 75 cm, then 35 cm, then 45 cm and finally 55 cm. Expect Advance, Hold, Hold and Advance in that order. Remove the card or point toward an open area beyond the sensor limit and check that an invalid sample requests Hold. On the browser demo, repeat the experiment while the drone approaches the wall.',
  demo:['Front range','Clear','Close','Advance is permitted','Hold position'],
};

export const lidarFlightLimits={stopMm:400,resumeMm:500,invalidMm:8000};

export function proximityDecision(distanceMm:number|null, advancing:boolean) {
  if(distanceMm===null || distanceMm<=0 || distanceMm>=lidarFlightLimits.invalidMm) return false;
  return advancing ? distanceMm > lidarFlightLimits.stopMm : distanceMm >= lidarFlightLimits.resumeMm;
}

export const lidarBenchProgram = {
  filename:'micro_drone_proximity.py',
  setup:'Run the no-hardware self-test before connecting the drone. In the Bitcraze client, confirm that the drone is visible, identify its radio URI and ensure its firmware detects both decks. Disconnect the client before running the Python live logger. Keep the propellers removed throughout the bench trial.',
  source:`"""Read Crazyflie range telemetry and print a proposed motion decision."""
import argparse
import time
from queue import Empty, Full, Queue

STOP_MM = ${lidarFlightLimits.stopMm}
RESUME_MM = ${lidarFlightLimits.resumeMm}
INVALID_MM = ${lidarFlightLimits.invalidMm}
FRESH_SECONDS = 0.45

def decide(distance_mm, advancing):
    if distance_mm is None or not 0 < distance_mm < INVALID_MM:
        return False
    return distance_mm > STOP_MM if advancing else distance_mm >= RESUME_MM

def show(distance_mm, advancing):
    valid = distance_mm is not None and 0 < distance_mm < INVALID_MM
    reading = f"{distance_mm} mm" if valid else "no valid return"
    print(f"{reading:>16}  {'ADVANCE' if advancing else 'HOLD'}")

def self_test():
    advancing = False
    for sample, expected in [(750, True), (400, False), (450, False),
                             (500, True), (450, True), (8000, False),
                             (0, False), (None, False)]:
        advancing = decide(sample, advancing)
        assert advancing == expected
        show(sample, advancing)
    print("All eight proximity checks passed.")

def read_bench(uri, seconds):
    import cflib.crtp
    from cflib.crazyflie import Crazyflie
    from cflib.crazyflie.log import LogConfig
    from cflib.crazyflie.syncCrazyflie import SyncCrazyflie

    samples = Queue(maxsize=1)

    def on_sample(_timestamp, data, _config):
        item = (time.monotonic(), data["range.front"])
        try:
            samples.get_nowait()
        except Empty:
            pass
        try:
            samples.put_nowait(item)
        except Full:
            pass

    cflib.crtp.init_drivers()
    with SyncCrazyflie(uri, cf=Crazyflie()) as connection:
        config = LogConfig(name="Front range", period_in_ms=100)
        config.add_variable("range.front", "uint16_t")
        config.data_received_cb.add_callback(on_sample)
        connection.cf.log.add_config(config)
        config.start()
        advancing = False
        end = time.monotonic() + seconds
        try:
            while time.monotonic() < end:
                try:
                    timestamp, distance_mm = samples.get(timeout=FRESH_SECONDS)
                    if time.monotonic() - timestamp > FRESH_SECONDS:
                        distance_mm = None
                except Empty:
                    distance_mm = None
                advancing = decide(distance_mm, advancing)
                show(distance_mm, advancing)
        finally:
            config.delete()

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--uri", help="Crazyflie radio URI for a bench trial")
    parser.add_argument("--seconds", type=int, default=30)
    args = parser.parse_args()
    if args.seconds < 1:
        parser.error("--seconds must be at least 1")
    if args.uri:
        try:
            read_bench(args.uri, args.seconds)
        except KeyboardInterrupt:
            print("Bench trial stopped.")
        except (ImportError, KeyError, RuntimeError, OSError) as error:
            parser.exit(1, f"Bench connection or range log unavailable: {error}\\n")
    else:
        self_test()

if __name__ == "__main__":
    main()
`,
};
