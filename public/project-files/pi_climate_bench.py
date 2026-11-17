"""Read an SHT31-D at 0x44 and save snapshots with a GPIO17 pushbutton."""
import argparse
import csv
from datetime import datetime
from pathlib import Path
from time import sleep

SENSOR_ADDRESS = 0x44
BUTTON_PIN = 17
LED_PIN = 27


def crc8(data):
    crc = 0xFF
    for byte in data:
        crc ^= byte
        for _ in range(8):
            crc = ((crc << 1) ^ (0x31 if crc & 0x80 else 0)) & 0xFF
    return crc


def decode(frame):
    if len(frame) != 6 or crc8(frame[:2]) != frame[2] or crc8(frame[3:5]) != frame[5]:
        raise ValueError("SHT31 frame failed its CRC check")
    temperature = -45 + 175 * int.from_bytes(frame[:2], "big") / 65535
    humidity = 100 * int.from_bytes(frame[3:5], "big") / 65535
    return temperature, humidity


def save_reading(path, reading):
    with path.open("a+", newline="", encoding="utf-8") as stream:
        writer = csv.writer(stream)
        if stream.tell() == 0:
            writer.writerow(("time", "temperature_c", "relative_humidity_pct"))
        timestamp = datetime.now().astimezone().isoformat(timespec="seconds")
        writer.writerow((timestamp, f"{reading[0]:.2f}", f"{reading[1]:.2f}"))


def self_test():
    from tempfile import TemporaryDirectory

    if crc8(bytes.fromhex("BEEF")) != 0x92:
        raise AssertionError("CRC reference vector failed")
    frame = bytes.fromhex("BEEF92000081")
    reading = decode(frame)
    if not (85.51 < reading[0] < 85.53 and reading[1] == 0):
        raise AssertionError(f"Unexpected conversion: {reading}")
    try:
        decode(bytes.fromhex("BEEF93000081"))
    except ValueError:
        pass
    else:
        raise AssertionError("Damaged frame passed CRC")
    with TemporaryDirectory() as folder:
        path = Path(folder) / "climate_log.csv"
        save_reading(path, reading)
        save_reading(path, reading)
        rows = list(csv.reader(path.read_text().splitlines()))
        if len(rows) != 3 or rows[2][1:] != ["85.52", "0.00"]:
            raise AssertionError(rows)
    print("CRC, conversion, fault rejection and CSV append checks passed.")


def run(threshold, log_path):
    from gpiozero import Button, LED
    from gpiozero.pins.lgpio import LGPIOFactory
    from smbus2 import SMBus, i2c_msg
    from threading import Event, Lock

    factory = LGPIOFactory()
    lock = Lock()
    pending = Event()
    with SMBus(1) as bus, Button(BUTTON_PIN, pull_up=True, bounce_time=0.05,
                               pin_factory=factory) as button, LED(LED_PIN, pin_factory=factory) as led:
        def pressed():
            with lock:
                pending.set()

        button.when_pressed = pressed
        try:
            while True:
                try:
                    bus.i2c_rdwr(i2c_msg.write(SENSOR_ADDRESS, [0x24, 0x00]))
                    sleep(0.02)
                    reply = i2c_msg.read(SENSOR_ADDRESS, 6)
                    bus.i2c_rdwr(reply)
                    reading = decode(bytes(reply))
                except (OSError, ValueError) as error:
                    reading = None
                    led.off()
                    print(f"Sensor unavailable: {error}")
                else:
                    led.value = reading[0] >= threshold
                    print(f"{reading[0]:.2f} °C | {reading[1]:.2f}% RH | LED {'on' if led.value else 'off'}")

                with lock:
                    capture = pending.is_set()
                    pending.clear()
                if capture:
                    if reading is None:
                        print("Capture skipped: no valid sample")
                    else:
                        save_reading(log_path, reading)
                        print(f"Saved sample to {log_path}")
                sleep(0.5)
        finally:
            led.off()
            button.when_pressed = None


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--threshold", type=float, default=28.0)
    parser.add_argument("--log", type=Path, default=Path("climate_log.csv"))
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        self_test()
    else:
        try:
            run(args.threshold, args.log)
        except KeyboardInterrupt:
            print("\nStopped.")
