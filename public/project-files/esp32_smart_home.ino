#include <WiFi.h>
#include <WebServer.h>

constexpr char networkName[] = "Atlas-Model-Home";
constexpr char networkPassword[] = "change-this-classroom-key";
constexpr uint8_t roomPin = 25, porchPin = 26, lightPin = 34;
constexpr int porchOnAt = 1200, porchOffAt = 1600;

WebServer server(80);
bool roomOn = false, porchOn = false, automatic = false;
int light = 0;
unsigned long lastSample = 0;

const char page[] PROGMEM = R"HTML(
<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Atlas Model Home</title>
<style>
body{font:1rem system-ui;margin:auto;padding:1.5rem;max-width:36rem;background:#eef4f9;color:#172844}
section{background:white;border-radius:1rem;padding:1rem;margin:.8rem 0}
button{font:inherit;padding:.65rem;margin:.25rem;background:#5233a8;color:white;border:0;border-radius:.5rem;cursor:pointer}
button:disabled{opacity:.65;cursor:default} button:focus-visible{outline:3px solid #275cba;outline-offset:2px}
</style>
<h1>Atlas Model Home</h1>
<p id="connection" role="status">Connecting to the ESP32…</p>
<section><h2>Room <output id="room"></output></h2>
<button data-key="room" data-value="on">Room on</button>
<button data-key="room" data-value="off">Room off</button></section>
<section><h2>Porch <output id="porch"></output></h2>
<button data-key="porch" data-value="on">Manual on</button>
<button data-key="porch" data-value="off">Manual off</button>
<button data-key="porch" data-value="auto">Auto night light</button>
<p>Light reading <output id="light"></output> / 4095</p>
</section>
<script>
const connection = document.querySelector('#connection');
let pending = false;
async function update(body) {
  if (pending) return;
  pending = true;
  try {
    const response = await fetch('/state', body ? {method:'POST',body} : {cache:'no-store'});
    if (!response.ok) throw new Error('Request failed');
    const data = await response.json();
    document.querySelector('#room').textContent = data.room ? 'On' : 'Off';
    document.querySelector('#porch').textContent = (data.porch ? 'On' : 'Off') + (data.auto ? ' (Auto)' : ' (Manual)');
    document.querySelector('#light').textContent = data.light;
    connection.textContent = 'Connected to ESP32';
  } catch {
    connection.textContent = 'Connection lost. Rejoin the model home Wi-Fi to refresh.';
  } finally {
    pending = false;
  }
}
document.querySelectorAll('button').forEach(button=>{
  button.addEventListener('click',async ()=>{
    while (pending) await new Promise(resolve=>setTimeout(resolve,30));
    await update(new URLSearchParams([[button.dataset.key,button.dataset.value]]));
  });
});
update();
setInterval(update,1000);
</script></html>
)HTML";

void applyOutputs() {
  if (automatic) {
    if (light <= porchOnAt) porchOn = true;
    if (light >= porchOffAt) porchOn = false;
  }
  digitalWrite(roomPin, roomOn);
  digitalWrite(porchPin, porchOn);
}

void sendState() {
  char state[100];
  snprintf(state, sizeof(state), "{\"room\":%s,\"porch\":%s,\"auto\":%s,\"light\":%d}",
           roomOn ? "true" : "false", porchOn ? "true" : "false",
           automatic ? "true" : "false", light);
  server.sendHeader("Cache-Control", "no-store");
  server.send(200, "application/json", state);
}

void acceptCommand() {
  if (server.args() != 1) { server.send(400, "text/plain", "Invalid command"); return; }
  const String key = server.argName(0);
  const String value = server.arg(0);
  if (key == "room" && (value == "on" || value == "off")) {
    roomOn = value == "on";
  } else if (key == "porch" && (value == "on" || value == "off" || value == "auto")) {
    automatic = value == "auto";
    if (!automatic) porchOn = value == "on";
  } else {
    server.send(400, "text/plain", "Invalid command");
    return;
  }
  applyOutputs();
  sendState();
}

void setup() {
  Serial.begin(115200);
  pinMode(roomPin, OUTPUT);
  pinMode(porchPin, OUTPUT);
  analogReadResolution(12);
  analogSetPinAttenuation(lightPin, ADC_11db);
  light = analogRead(lightPin);
  applyOutputs();
  WiFi.mode(WIFI_AP);
  if (!WiFi.softAP(networkName, networkPassword)) {
    Serial.println("Unable to start model Wi-Fi");
    return;
  }
  Serial.print("Dashboard: http://");
  Serial.println(WiFi.softAPIP());
  server.on("/", HTTP_GET, [] { server.send_P(200, "text/html", page); });
  server.on("/state", HTTP_GET, sendState);
  server.on("/state", HTTP_POST, acceptCommand);
  server.begin();
}

void loop() {
  if (millis() - lastSample >= 100) {
    lastSample = millis();
    unsigned int total = 0;
    for (int i = 0; i < 8; i++) total += analogRead(lightPin);
    light = total / 8;
    applyOutputs();
  }
  server.handleClient();
}
