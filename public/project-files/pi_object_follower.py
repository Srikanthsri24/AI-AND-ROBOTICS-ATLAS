"""OpenCV orange marker follower. Start in preview mode, then test wheels on a stand."""
import argparse

def decide(center, width):
    if width < 14:
        return b"S", "Lost"
    if width >= 100:
        return b"S", "Hold"
    if center < 142:
        return b"L", "Left"
    if center > 178:
        return b"R", "Right"
    return b"F", "Forward"

def locate(cv2, frame):
    hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
    mask = cv2.inRange(hsv, (5, 120, 100), (24, 255, 255))
    contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    largest = max(contours, key=cv2.contourArea, default=None)
    return cv2.boundingRect(largest) if largest is not None and cv2.contourArea(largest) >= 120 else None

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--camera", type=int, default=0)
    parser.add_argument("--port", help="Uno serial device. Omit for camera preview only.")
    args = parser.parse_args()
    import cv2
    capture = cv2.VideoCapture(args.camera)
    link = None
    try:
        if not capture.isOpened():
            raise SystemExit("Could not open the camera.")
        if args.port:
            import serial
            from time import sleep
            link = serial.Serial(args.port, 115200, write_timeout=.25)
            sleep(2)
        while True:
            ok, frame = capture.read()
            if not ok:
                break
            frame = cv2.resize(frame, (320, 240))
            box = locate(cv2, frame)
            command, label = b"S", "Lost"
            if box:
                x, y, width, height = box
                command, label = decide(x + width/2, width)
                cv2.rectangle(frame, (x,y), (x+width,y+height), (55,240,160), 2)
            if link:
                link.write(command)
            cv2.line(frame, (160,0), (160,240), (255,255,255), 1)
            cv2.putText(frame, label, (8,22), cv2.FONT_HERSHEY_SIMPLEX, .6, (255,255,255), 2)
            cv2.imshow("Atlas follower", frame)
            if cv2.waitKey(1) & 255 in (27, ord("q")):
                break
    finally:
        try:
            if link:
                try:
                    link.write(b"S")
                finally:
                    link.close()
        finally:
            capture.release()
            cv2.destroyAllWindows()

if __name__ == "__main__":
    main()
