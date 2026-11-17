"""Run a local portrait trial and send a grant only for a clear match."""
import argparse
from pathlib import Path
import subprocess
import time

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--port", required=True)
parser.add_argument("sample", choices=["amara", "basil", "cleo", "mixed", "visitor"])
args = parser.parse_args()
result = subprocess.run(["node", str(Path(__file__).with_name("pi_face_lock_console.mjs")), args.sample], check=False)
if result.returncode != 0:
    print("No serial grant sent.")
    raise SystemExit(result.returncode)

import serial
with serial.Serial(args.port, 115200, timeout=2, write_timeout=1) as link:
    # Opening many Uno USB serial adapters resets the board.
    time.sleep(2)
    link.reset_input_buffer()
    link.write(b"G")
    response = link.readline().decode("ascii", errors="replace").strip()
    if response != "Granted":
        raise SystemExit("The Arduino did not acknowledge the grant.")
    print("Arduino acknowledged the latch grant.")
