import type { Build } from './guided-projects';

export const missionLimits={min:0,max:120,stationLongitude:60,contactHalfWidth:25};

export function stationInView(longitude:number) {
  return Math.abs(longitude-missionLimits.stationLongitude)<=missionLimits.contactHalfWidth;
}

export const weatherCubeSat:Build={
  id:'directory-15',
  title:'Weather Imaging CubeSat',
  outcome:'Plan a virtual imaging pass, capture a clear or cloudy frame, and deliver it to a model ground station when the link comes into view.',
  parts:[
    ['Virtual CubeSat bus','1','Holds the memory, camera and solar-panel model. The mission keeps one captured frame onboard at a time.'],
    ['Virtual weather camera','1','Looks down toward Earth to collect an image. The lab uses a NASA basemap with simulated clouds.'],
    ['Virtual ground station','1','Receives the saved frame inside the model contact window.'],
  ],
  assembly:[
    ['Identify the spacecraft and camera','Rotate the CubeSat and locate its camera face. In the mission lab, select Earth-facing to point it toward the surface.','The camera footprint points down to Earth when Earth-facing is selected.',[0,1]],
    ['Plan the pass','Locate the ground station at 60° E on the equator. This teaching model uses a contact window from 35° E through 85° E. Move the satellite before and after that window.','Predict why a captured image can be stored outside contact but cannot yet reach the ground.',[0,2]],
    ['Set up two weather frames','Use the live camera to observe the same location first with the clear setting and then with added cloud cover. Save time and cloud metadata with each transmitted image.','The clear setting reveals more surface detail. The ground station receives the original captured settings even if you change the camera afterward.',[1,2]],
  ],
  wiring:[
    ['Earth-facing camera and current longitude','Capture footprint and image metadata','Set what the camera sees'],
    ['Successful capture','Single-frame onboard buffer','Retain the original scene until transmission'],
    ['Position within contact window','Ground station archive','Receive the stored frame and free the onboard buffer'],
  ],
  test:'At 0° E with the camera Earth-facing, capture a clear frame. Check that downlink is unavailable. Change cloud cover and move to 60° E, then downlink. The received image should still show the clear conditions and original longitude. Return to 0° E and capture a cloudy frame. Downlink it at 60° E and compare the two received images of the same location.',
  demo:['Downlink contact','Outside contact','In contact','Frame stays onboard','Frame can be sent to the station'],
};

export const cubeSatProgram={
  filename:'weather_cubesat_replay.py',
  setup:'The Python exercise uses the same contact window as the browser. Compare the printed archive with the capture, store, and downlink sequence you run in the mission lab.',
  source:`"""Replay a classroom CubeSat imaging pass."""
from dataclasses import dataclass

STATION = ${missionLimits.stationLongitude}
WINDOW = ${missionLimits.contactHalfWidth}

@dataclass(frozen=True)
class Frame:
    longitude: int
    cloud_percent: int

def in_contact(longitude):
    return abs(longitude - STATION) <= WINDOW

def capture(longitude, clouds, earth_facing, onboard=None):
    return Frame(longitude, clouds) if earth_facing and onboard is None else onboard

def downlink(onboard, longitude, archive):
    if onboard is None or not in_contact(longitude):
        return onboard
    archive.append(onboard)
    return None

if __name__ == "__main__":
    archive = []
    assert capture(0, 0, False) is None
    onboard = capture(0, 0, True)
    assert capture(40, 80, True, onboard) == Frame(0, 0)
    assert downlink(onboard, 34, archive) is onboard
    assert downlink(onboard, 60, archive) is None
    assert archive[0] == Frame(0, 0)
    assert in_contact(35) and in_contact(85) and not in_contact(86)
    assert downlink(capture(0, 80, True), 60, archive) is None
    for frame in archive:
        print(f"Received: {frame.longitude}°E, cloud cover setting {frame.cloud_percent}%")
`,
};
