"""Offline push-to-talk console for the Atlas voice rover."""
import argparse
import json
import re
from pathlib import Path

COMMANDS = {
    "rover forward": b"F",
    "rover reverse": b"B",
    "rover left": b"L",
    "rover right": b"R",
    "rover stop": b"S",
}

def command_for(text):
    phrase = " ".join(re.sub(r"[.!?]+$", "", text.strip().lower()).split())
    return COMMANDS.get(phrase)

def recognize(model, rate, chunks):
    from vosk import KaldiRecognizer
    recognizer = KaldiRecognizer(model, rate, json.dumps([*COMMANDS, "[unk]"]))
    recognizer.SetWords(True)
    words = []
    for data in chunks:
        if recognizer.AcceptWaveform(data):
            words.extend(json.loads(recognizer.Result()).get("result", []))
    words.extend(json.loads(recognizer.FinalResult()).get("result", []))
    phrase = " ".join(word["word"] for word in words)
    confident = bool(words) and all(word.get("conf", 0) >= 0.6 for word in words)
    return phrase, confident

def listen(model, device, seconds=2.3):
    import sounddevice as sd
    chunks = []
    rate = int(sd.query_devices(device, "input")["default_samplerate"])
    # Start a fresh window for each button press so a phrase is sent only once.
    def capture(data, _frames, _time, status):
        if not status:
            chunks.append(bytes(data))

    with sd.RawInputStream(device=device, samplerate=rate, blocksize=0,
                           dtype="int16", channels=1, callback=capture):
        print("Listening now…", flush=True)
        sd.sleep(int(seconds * 1000))
    return recognize(model, rate, chunks)

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--model", type=Path)
    parser.add_argument("--port", help="USB or outgoing Bluetooth serial port")
    parser.add_argument("--device", help="Microphone name or device index")
    parser.add_argument("--phrase", help="Print one text-to-command test without opening hardware")
    args = parser.parse_args()
    if args.phrase is not None:
        command = command_for(args.phrase)
        print(command.decode() if command else "Unknown phrase")
        return
    if not args.model or not args.model.is_dir() or not args.port:
        parser.error("Provide --model with the extracted Vosk directory and --port.")
    import serial
    from vosk import Model
    model = Model(str(args.model))
    device = int(args.device) if args.device and args.device.isdecimal() else args.device
    with serial.Serial(args.port, 115200, write_timeout=0.5) as link:
        try:
            print("Enter listens for one phrase. Type s then Enter to stop, or q to quit.")
            while True:
                action = input("> ").strip().lower()
                if action == "q":
                    break
                if action == "s":
                    link.write(b"S")
                    continue
                if action:
                    continue
                phrase, confident = listen(model, device)
                command = command_for(phrase) if confident else None
                if command is None:
                    print(f"Heard {phrase!r} · no command sent")
                    continue
                link.write(command)
                print(f"Heard {phrase!r} → sent {command.decode()}")
        except KeyboardInterrupt:
            pass
        finally:
            try:
                link.write(b"S")
            except serial.SerialException:
                pass

if __name__ == "__main__":
    main()
