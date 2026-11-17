"""Raspberry Pi dry-bin monitor. Install pyserial for the live serial input."""
import argparse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from threading import Lock, Thread
from time import monotonic

def fill_from_gap(gap, empty, full):
    if gap is None or not 100 <= gap <= 4000:
        return None
    return max(0, min(100, (empty-gap)*100/(empty-full)))

class Readings:
    def __init__(self, empty, full):
        self.empty, self.full = empty, full
        self.lock = Lock()
        self.gap, self.time = None, None

    def update(self, line):
        try:
            gap = None if line == "NO_ECHO" else int(line)
        except ValueError:
            return
        with self.lock:
            self.gap, self.time = gap, monotonic()

    def snapshot(self):
        with self.lock:
            gap, received = self.gap, self.time
        if received is None or monotonic()-received >= 3:
            return {"state":"Stale","gap_mm":None,"fill_percent":None}
        fill = fill_from_gap(gap, self.empty, self.full)
        if fill is None:
            return {"state":"Sensor unavailable","gap_mm":None,"fill_percent":None}
        return {"state":"Collect" if fill >= 80 else "Space remaining",
                "gap_mm":gap,"fill_percent":round(fill,1)}

def read_serial(link, readings):
    try:
        while True:
            line = link.readline().decode("ascii", errors="replace").strip()
            if line:
                readings.update(line)
    except OSError:
        # The last packet expires. Restart after reconnecting the device.
        return

PAGE = """<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width">
<title>Atlas bin monitor</title>
<style>body{font:1rem system-ui;max-width:38rem;margin:2rem auto;padding:0 1rem;background:#eef5f7;color:#1d3547}main{padding:1.3rem;border-radius:1rem;background:white}</style>
<h1>Atlas bin monitor</h1><main><p id="state" role="status">Waiting for data…</p><p id="reading"></p></main>
<script>
const state=document.querySelector('#state'),reading=document.querySelector('#reading');
async function refresh(){
 try{
  const response=await fetch('/reading',{cache:'no-store'});
  if(!response.ok)throw Error();
  const data=await response.json();
  state.textContent=data.state;
  reading.textContent=data.fill_percent===null?'No current fill estimate':data.fill_percent+'% full · '+data.gap_mm+' mm gap';
 }catch{state.textContent='Dashboard disconnected';reading.textContent='';}
 setTimeout(refresh,700);
}
refresh();
</script>"""

def handler_for(readings):
    class Handler(BaseHTTPRequestHandler):
        def do_GET(self):
            if self.path == "/reading":
                body = json.dumps(readings.snapshot()).encode()
                mime = "application/json"
            elif self.path == "/":
                body = PAGE.encode()
                mime = "text/html; charset=utf-8"
            else:
                self.send_error(404)
                return
            self.send_response(200)
            self.send_header("Content-Type", mime)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            self.wfile.write(body)
    return Handler

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--serial",required=True)
    parser.add_argument("--empty",type=int,default=500)
    parser.add_argument("--full",type=int,default=120)
    args = parser.parse_args()
    if not 100 <= args.full < args.empty <= 4000:
        parser.error("Use reference distances with 100 ≤ full < empty ≤ 4000 mm")
    import serial
    readings = Readings(args.empty,args.full)
    with serial.Serial(args.serial,115200,timeout=1) as link:
        Thread(target=read_serial,args=(link,readings),daemon=True).start()
        with ThreadingHTTPServer(("127.0.0.1",5056),handler_for(readings)) as server:
            print("Dashboard: http://127.0.0.1:5056/",flush=True)
            server.serve_forever()

if __name__ == "__main__":
    main()
