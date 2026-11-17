#include <WiFi.h>
#include <WebServer.h>
#include "esp_camera.h"
#include "esp_heap_caps.h"

constexpr char ssid[] = "Atlas-Door-Camera";
constexpr char password[] = "change-this-classroom-key";
constexpr gpio_num_t contactPin = GPIO_NUM_13;
constexpr size_t imageCapacity = 65536;
constexpr unsigned long debounceMs = 50;
constexpr unsigned long captureDelayMs = 300;

WebServer server(80);
uint8_t *image = nullptr;
size_t imageSize = 0;
unsigned long rawSince = 0, openedAt = 0, events = 0;
bool rawOpen = false, doorOpen = false, capturePending = false, cameraOK = false;
bool failed = false;

const char dashboard[] PROGMEM = R"HTML(
<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Atlas Door Camera</title>
<style>
body{background:#eef4f9;color:#182b42;font:1rem system-ui;margin:2rem auto;padding:0 1rem;max-width:34rem}
main{padding:1rem;background:white;border-radius:1rem}img{display:block;max-width:100%;margin-top:1rem}img[hidden]{display:none}
</style>
<h1>Atlas Door Camera</h1><main><p id="status" role="status">Connecting…</p>
<p id="count">Successful captures: 0</p><img id="latest" alt="Latest model doorway capture" hidden></main>
<script>
const statusLine=document.getElementById('status');
const count=document.getElementById('count');
const latest=document.getElementById('latest');
let lastEvent=0;
async function poll(){
 try{
   const response=await fetch('/state',{cache:'no-store'});
   if(!response.ok) throw Error();
   const state=await response.json();
   statusLine.textContent=!state.ready?'Camera unavailable':state.pending?'Door open · Taking a still':state.failed?'Capture failed · Check camera and close the door to retry':state.open?'Door open · Close to rearm':'Door closed · Ready';
   count.textContent='Successful captures: '+state.events;
   if(state.events>0&&lastEvent!==state.events){latest.src='/latest.jpg?event='+state.events+'&t='+Date.now();latest.hidden=false;}
   if(state.events===0){latest.hidden=true;latest.removeAttribute('src');}
   lastEvent=state.events;
 }catch{statusLine.textContent='Disconnected · Rejoin the model camera Wi-Fi';}
 setTimeout(poll,700);
}
poll();
</script></html>
)HTML";

esp_err_t startCamera() {
  camera_config_t config = {};
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = 5;
  config.pin_d1 = 18;
  config.pin_d2 = 19;
  config.pin_d3 = 21;
  config.pin_d4 = 36;
  config.pin_d5 = 39;
  config.pin_d6 = 34;
  config.pin_d7 = 35;
  config.pin_xclk = 0;
  config.pin_pclk = 22;
  config.pin_vsync = 25;
  config.pin_href = 23;
  config.pin_sccb_sda = 26;
  config.pin_sccb_scl = 27;
  config.pin_pwdn = 32;
  config.pin_reset = -1;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size = FRAMESIZE_QVGA;
  config.jpeg_quality = 16;
  config.fb_count = 1;
  config.fb_location = CAMERA_FB_IN_PSRAM;
  config.grab_mode = CAMERA_GRAB_WHEN_EMPTY;
  return esp_camera_init(&config);
}

void capture() {
  if (!cameraOK) { failed = true; return; }
  // A single-buffer camera can have an older frame waiting. Release it first.
  if (auto *old = esp_camera_fb_get()) esp_camera_fb_return(old);
  auto *frame = esp_camera_fb_get();
  failed = !frame || frame->format != PIXFORMAT_JPEG || frame->len == 0 || frame->len > imageCapacity;
  if (!failed) {
    memcpy(image, frame->buf, frame->len);
    imageSize = frame->len;
    events++;
  }
  if (frame) esp_camera_fb_return(frame);
}

void sendState() {
  char json[128];
  snprintf(json, sizeof(json), "{\"open\":%s,\"pending\":%s,\"ready\":%s,\"failed\":%s,\"events\":%lu}",
           doorOpen?"true":"false",capturePending?"true":"false",cameraOK?"true":"false",failed?"true":"false",events);
  server.sendHeader("Cache-Control","no-store");
  server.send(200,"application/json",json);
}

void setup() {
  Serial.begin(115200);
  pinMode(contactPin,INPUT_PULLUP);
  rawOpen = doorOpen = digitalRead(contactPin) == HIGH;
  rawSince = millis();
  if (psramFound()) {
    image = static_cast<uint8_t*>(heap_caps_malloc(imageCapacity,MALLOC_CAP_SPIRAM));
    cameraOK = image && startCamera() == ESP_OK;
  }
  WiFi.mode(WIFI_AP);
  if (!WiFi.softAP(ssid,password)) { Serial.println("Wi-Fi startup failed"); return; }
  Serial.print("Dashboard: http://");
  Serial.println(WiFi.softAPIP());
  server.on("/",HTTP_GET,[]{server.send_P(200,"text/html",dashboard);});
  server.on("/state",HTTP_GET,sendState);
  server.on("/latest.jpg",HTTP_GET,[]{
    if (!imageSize) { server.send(404,"text/plain","No snapshot yet"); return; }
    server.sendHeader("Cache-Control","no-store");
    server.send_P(200,"image/jpeg",reinterpret_cast<const char*>(image),imageSize);
  });
  server.begin();
}

void loop() {
  const unsigned long now = millis();
  const bool open = digitalRead(contactPin) == HIGH;
  if (open != rawOpen) { rawOpen = open; rawSince = now; }
  if (doorOpen != rawOpen && now - rawSince >= debounceMs) {
    doorOpen = rawOpen;
    if (doorOpen) { openedAt = now; capturePending = true; failed = false; }
  }
  if (capturePending && now - openedAt >= captureDelayMs) {
    capturePending = false;
    if (doorOpen) capture();
  }
  server.handleClient();
}
