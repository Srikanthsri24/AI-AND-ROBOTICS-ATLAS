import { bluetoothCar, bluetoothCarCommands, bluetoothCarPulseMs } from './bluetooth-car';
import type { Build } from './guided-projects';

export const esp32Car: Build = {
  id:'directory-2',
  title:'ESP32 Wi-Fi and Bluetooth-Controlled RC Car',
  outcome:'Drive a two-wheel rover from a local Wi-Fi page or an Android Bluetooth terminal. See how either link can control the same motors.',
  parts:[
    ['ESP32-DevKitC V4 (ESP32-WROOM-32E)','1','Hosts the Wi-Fi control page or receives Bluetooth Classic commands. Its GPIO pins control the motor driver.'],
    ['1 kΩ pull-down resistor','1','Holds the motor driver in standby while the ESP32 boots or resets.'],
    ...bluetoothCar.parts.slice(2).map(([name, quantity, purpose], index): Build['parts'][number] => [
      name, quantity, index === 0 ? 'Converts the ESP32’s 3.3 V control signals into motor current from the AA pack.'
        : index === 5 ? 'Powers the ESP32 through Micro USB during an untethered run.' : purpose,
    ]),
  ],
  assembly:[
    ['Fit and identify the drivetrain','Fit two 6 V geared motors and wheels to the chassis. Attach the caster at the rear. Label the left motor A and the right motor B.','The wheels turn freely and each pair of motor leads reaches the driver.',[3,4]],
    ['Mount the ESP32 and driver','Use insulated standoffs and face the ESP32 antenna outward. Leave room for the Micro USB plug. Keep the antenna clear of the battery holder and motor wires.','The ESP32 antenna extends past the chassis edge and the bottom of each PCB clears exposed metal.',[0,2,4]],
    ['Wire direction, speed and standby','Disconnect both supplies. Use 3V3 for driver VCC. Wire GPIO25 and GPIO26 to the speed inputs and wire the four direction inputs as shown below. Connect GPIO23 and the 1 kΩ pull-down to STBY.','The resistor joins STBY to GND. GPIO27 is available for the boot mode jumper.',[0,1,2,6]],
    ['Connect motor power and both channels','Wire motor A and motor B. Connect the switched AA positive to VM and AA negative to driver GND. Join ESP32 and driver grounds.','Check for reversed polarity and verify that each motor’s stall current is within the driver rating.',[2,3,5]],
    ['Set the control link and power up','Leave GPIO27 open for Wi-Fi or jumper it to GND for Bluetooth Classic. Set the jumper with both supplies off. Power the ESP32 over Micro USB, then switch on the AA pack with wheels raised.','Only the selected radio starts. Both wheels remain stationary until a valid command arrives.',[0,5,6,7]],
  ],
  wiring:[
    ['ESP32 3V3','TB6612 VCC','3.3 V logic supply'],
    ['GPIO25 / GPIO26','PWMA / PWMB','Left / right speed'],
    ['GPIO32 / GPIO33','AIN1 / AIN2','Left motor direction'],
    ['GPIO18 / GPIO19','BIN1 / BIN2','Right motor direction'],
    ['GPIO23','STBY','Active-high driver enable'],
    ['STBY','1 kΩ resistor → GND','Keeps driver disabled at boot'],
    ['GPIO27','Open for Wi-Fi / GND for Bluetooth','Mode read at startup'],
    ['A outputs / B outputs','Left / right motor','Motor current'],
    ['AA positive through switch','VM / Vmotor','Motor supply'],
    ['AA negative, ESP32 GND','Driver GND','Common ground'],
    ['Computer or 5 V USB power bank','ESP32 Micro USB port','Controller supply'],
  ],
  test:'On a stand, start in Wi-Fi mode and verify Forward, Reverse, Pivot left, Pivot right and Stop. Switch off Wi-Fi on your phone immediately after sending Forward and verify the driver disables within 850 ms from the last command. Power off, fit the GPIO27 jumper and repeat in Bluetooth mode with Android. Check wheel direction before trying the car untethered on a clear floor.',
  demo:bluetoothCar.demo,
};

const buttonMarkup = bluetoothCarCommands.map(({key,label})=>`<button data-command="${key}">${label}</button>`).join('');
export const esp32CarProgram = {
  filename:'esp32_dual_link_rover.ino',
  setup:'With the motor supply off, replace CHANGE-ME-123 in the sketch with your own Wi-Fi password of at least eight characters. In Wi-Fi mode, join the Atlas-Rover network, stay connected if the phone reports no internet, and open http://192.168.4.1. In Bluetooth mode, pair an Android phone with Atlas-Rover-BT and connect using a Bluetooth Classic SPP terminal. Use Wi-Fi mode on iPhone. Send F, B, L, R or S in Bluetooth mode. Raise the wheels before switching on motor power.',
  source:`#include <WiFi.h>
#include <WebServer.h>
#include <BluetoothSerial.h>
#include <freertos/FreeRTOS.h>
#include <freertos/queue.h>
#include <freertos/task.h>

const int PWM_A = 25, PWM_B = 26, STANDBY = 23, MODE = 27;
const int AIN1 = 32, AIN2 = 33, BIN1 = 18, BIN2 = 19;
const int SPEED = 110;
const unsigned long PULSE_MS = ${bluetoothCarPulseMs};
const char WIFI_PASSWORD[] = "CHANGE-ME-123";

WebServer server(80);
BluetoothSerial radio;
bool bluetoothMode = false;
QueueHandle_t commands = nullptr;

const char PAGE[] = R"HTML(
<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Atlas Rover</title>
<style>body{font:18px system-ui;margin:2rem;max-width:30rem}
button{padding:1rem;margin:.25rem;font:inherit}</style>
<h1>Atlas Rover</h1><p>Each command runs for up to 850 ms.</p>
${buttonMarkup}
<p id="status" role="status"></p>
<script>
document.querySelectorAll('button').forEach(b => {
  b.onclick = async () => {
    const status = document.getElementById('status');
    try {
      const response = await fetch('/drive?command=' + b.dataset.command,
        {method:'POST'});
      status.textContent = response.ok ? 'Sent ' + b.textContent : 'Command rejected';
    } catch { status.textContent = 'Connection lost'; }
  };
});
</script></html>
)HTML";

void wheel(int pwm, int pin1, int pin2, int direction) {
  digitalWrite(pin1, direction > 0);
  digitalWrite(pin2, direction < 0);
  analogWrite(pwm, direction == 0 ? 0 : SPEED);
}

void drive(int left, int right) {
  digitalWrite(STANDBY, LOW);
  wheel(PWM_A, AIN1, AIN2, left);
  wheel(PWM_B, BIN1, BIN2, right);
  digitalWrite(STANDBY, left != 0 || right != 0 ? HIGH : LOW);
}

void applyCommand(char key) {
  switch (key) {
${bluetoothCarCommands.map(({key,left,right})=>`    case '${key}': drive(${left}, ${right}); break;`).join('\n')}
    default: drive(0, 0); break;
  }
}

void motorTask(void *) {
  for (;;) {
    char key;
    const bool received = xQueueReceive(commands, &key, pdMS_TO_TICKS(PULSE_MS)) == pdTRUE;
    applyCommand(received ? key : 'S');
  }
}

bool submitCommand(char key) {
  const bool valid = key != '\\0' && strchr("FBLRS", key) != nullptr;
  const char requested = valid ? key : 'S';
  xQueueOverwrite(commands, &requested);
  return valid;
}

void setup() {
  pinMode(STANDBY, OUTPUT);
  digitalWrite(STANDBY, LOW);
  const int pins[] = {PWM_A, PWM_B, AIN1, AIN2, BIN1, BIN2};
  for (int pin : pins) pinMode(pin, OUTPUT);
  drive(0, 0);
  commands = xQueueCreate(1, sizeof(char));
  if (commands == nullptr || xTaskCreate(motorTask, "rover-motors", 3072,
      nullptr, 2, nullptr) != pdPASS) return;
  pinMode(MODE, INPUT_PULLUP);
  bluetoothMode = digitalRead(MODE) == LOW;
  if (bluetoothMode) {
    radio.begin("Atlas-Rover-BT");
  } else if (strcmp(WIFI_PASSWORD, "CHANGE-ME-123") != 0 &&
             WiFi.softAP("Atlas-Rover", WIFI_PASSWORD, 1, false, 1)) {
    server.on("/", HTTP_GET, [] { server.send(200, "text/html", PAGE); });
    server.on("/drive", HTTP_POST, [] {
      const String input = server.arg("command");
      const bool accepted = submitCommand(input.length() == 1 ? input[0] : '\\0');
      server.send(accepted ? 204 : 400, "text/plain", "");
    });
    server.begin();
  }
}

void loop() {
  if (bluetoothMode) {
    if (radio.available()) {
      const char key = radio.read();
      if (key != '\\r' && key != '\\n') submitCommand(key);
    }
  } else {
    server.handleClient();
  }
  delay(1);
}
`,
};
