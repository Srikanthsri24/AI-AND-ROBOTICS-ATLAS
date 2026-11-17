import type { Build } from './guided-projects';

export const rocketLab: Build = {
  id:'directory-7',
  title:'DIY Water Rocket Launcher',
  outcome:'Run a virtual launch and measure how changing the launch angle affects height, time in the air and landing distance.',
  parts:[
    ['Virtual bottle rocket','1','Follows a curved path once its initial push ends.'],
    ['Virtual launch stand','1','Sets the starting angle on a level field.'],
    ['Marked landing field','1','Measures horizontal distance from the launch line.'],
  ],
  assembly:[
    ['Identify the launch direction','Open the virtual stand in the part viewer. Locate the platform and the tilt axis. In the flight lab, 0° means horizontal and 90° means vertical.','Explain which direction the bottle initially moves at 30° and at 60°.',[1,0]],
    ['Set the measurement origin','Inspect the landing field. Use the launch line as the zero mark and measure distance along the field in the direction the rocket travels.','Use the horizontal ground distance instead of the length of the curved flight path.',[2,1]],
    ['Choose a fair comparison','Use the same initial speed and ground level for each simulated launch. Compare 30°, 45° and 60° before trying other angles.','Change only the angle between trials. Predict which angle will go highest and which will travel farthest.',[0,1,2]],
  ],
  wiring:[
    ['Launch angle and fixed initial speed','Horizontal and vertical velocity','Set the initial components of motion'],
    ['Vertical velocity and gravity','Height over time','Find the peak and first return to ground level'],
    ['Horizontal velocity and flight time','Landing marker','Measure range along the ground'],
  ],
  test:'Run 30°, 45° and 60° launches without changing the starting speed. Record the height, airtime and range. Compare the 30° and 60° range values and explain why their height values differ.',
  demo:['Launch angle','30°','60°','Lower, shorter flight','Higher, longer flight at the same ideal range'],
};

export const rocketLabSpeed=12;
const gravity=9.81;

export function flightAt(angle:number) {
  const radians=angle*Math.PI/180;
  const vx=rocketLabSpeed*Math.cos(radians);
  const vy=rocketLabSpeed*Math.sin(radians);
  const time=2*vy/gravity;
  return {angle,time,height:vy*vy/(2*gravity),range:vx*time,vx,vy};
}

export function flightPoint(flight:ReturnType<typeof flightAt>,time:number) {
  return [flight.vx*time,Math.max(0,flight.vy*time-gravity*time*time/2)] as const;
}

export const rocketLabProgram = {
  filename:'virtual_water_rocket.py',
  setup:'Compare the script’s printed values with the browser trial table. The model starts after the initial push and assumes a level field, constant gravity, and zero drag.',
  source:`"""Compare three virtual water rocket launches."""
import math

SPEED = ${rocketLabSpeed}
GRAVITY = ${gravity}

def trajectory(angle):
    radians = math.radians(angle)
    vx = SPEED * math.cos(radians)
    vy = SPEED * math.sin(radians)
    airtime = 2 * vy / GRAVITY
    height = vy ** 2 / (2 * GRAVITY)
    return height, airtime, vx * airtime

if __name__ == "__main__":
    print("Angle    Height    Airtime     Range")
    for angle in (30, 45, 60):
        height, time, distance = trajectory(angle)
        print(f"{angle:>3}°     {height:>5.2f} m   {time:>5.2f} s   {distance:>5.2f} m")
    assert math.isclose(trajectory(30)[2], trajectory(60)[2])
    assert trajectory(45)[2] > trajectory(30)[2]
`,
};
