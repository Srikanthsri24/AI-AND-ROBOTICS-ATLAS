"""Save snapshots from the ESP32-CAM USB serial link."""
import argparse
import base64
import binascii
from datetime import datetime
from pathlib import Path

MAX_LINE = 44000


def decode_jpeg(payload):
    jpeg = base64.b64decode(payload, validate=True)
    if not jpeg.startswith(b"\xff\xd8") or not jpeg.endswith(b"\xff\xd9"):
        raise ValueError("JPEG framing is incomplete")
    return jpeg


def collect(connection, folder):
    folder.mkdir(parents=True, exist_ok=True)
    while True:
        line = connection.read_until(size=MAX_LINE)
        if not line.endswith(b"\n"):
            if line:
                print("Skipped an incomplete serial line.", flush=True)
            continue
        if line.startswith(b"JPEG "):
            try:
                jpeg = decode_jpeg(line[5:].strip())
            except (ValueError, binascii.Error) as error:
                print(f"Skipped a damaged snapshot: {error}", flush=True)
                continue
            stamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            name = folder / f"tilt_{stamp}.jpg"
            name.write_bytes(jpeg)
            print(f"Saved {name}", flush=True)
        elif line.startswith((b"TILT ", b"ERROR ", b"READY")):
            print(line.decode("ascii", errors="replace").strip(), flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("port", help="Use the same USB serial port listed in Arduino IDE")
    parser.add_argument("--output", default="snapshots", type=Path)
    args = parser.parse_args()
    import serial

    try:
        with serial.Serial(args.port, baudrate=115200, timeout=10) as connection:
            collect(connection, args.output)
    except KeyboardInterrupt:
        print("Stopped.")
