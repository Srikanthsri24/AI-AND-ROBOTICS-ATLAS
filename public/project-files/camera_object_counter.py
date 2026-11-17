"""Count bright connected regions in a centered camera crop or image."""
import argparse
import sys

import cv2
import numpy as np


def count_regions(frame, cutoff, minimum_area):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    _, mask = cv2.threshold(gray, cutoff, 255, cv2.THRESH_BINARY)
    count, _, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
    boxes = [tuple(map(int, stats[index])) for index in range(1, count)
             if stats[index, cv2.CC_STAT_AREA] >= minimum_area]
    return mask, sorted(boxes)


def test_detector():
    image = np.full((210, 320, 3), 30, dtype=np.uint8)
    assert len(count_regions(image, 150, 80)[1]) == 0
    for x in (65, 145, 230):
        cv2.circle(image, (x, 100), 22, (225, 225, 225), -1)
    image[2:4, 2:4] = 255
    assert len(count_regions(image, 150, 80)[1]) == 3
    cv2.rectangle(image, (65, 95), (145, 105), (225, 225, 225), -1)
    assert len(count_regions(image, 150, 80)[1]) == 2
    assert len(count_regions(image, 230, 80)[1]) == 0
    print("Detector checks passed: empty, three separated, touching, and high cutoff.")


def display(frame, cutoff, minimum_area):
    mask, boxes = count_regions(frame, cutoff, minimum_area)
    result = frame.copy()
    for index, (x, y, w, h, _area) in enumerate(boxes, start=1):
        cv2.rectangle(result, (x, y), (x + w - 1, y + h - 1), (60, 200, 90), 2)
        cv2.putText(result, str(index), (x, max(13, y - 3)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.45, (60, 200, 90), 1)
    cv2.putText(result, f"Regions: {len(boxes)}", (8, 18),
                cv2.FONT_HERSHEY_SIMPLEX, 0.48, (60, 200, 90), 1)
    cv2.imshow("Counted regions", result)
    cv2.imshow("Binary mask", mask)


def center_crop(frame):
    height, width = frame.shape[:2]
    y_margin, x_margin = height // 10, width // 10
    field = frame[y_margin:height-y_margin, x_margin:width-x_margin]
    return cv2.resize(field, (320, 210), interpolation=cv2.INTER_AREA)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--camera", type=int, default=0, help="Device index")
    parser.add_argument("--image", help="Use a local still image instead of a webcam")
    parser.add_argument("--threshold", type=int, default=150)
    parser.add_argument("--minimum-area", type=int, default=80)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if not 0 <= args.threshold <= 255 or args.minimum_area < 1:
        parser.error("Threshold must be 0–255 and minimum area at least 1.")
    if args.self_test:
        test_detector()
        return 0
    camera = None
    try:
        if args.image:
            frame = cv2.imread(args.image)
            if frame is None:
                parser.error("The local image could not be opened.")
            display(center_crop(frame), args.threshold, args.minimum_area)
            cv2.waitKey(0)
            return 0
        camera = cv2.VideoCapture(args.camera)
        if not camera.isOpened():
            print("Could not open camera. Check the device index and camera permission.", file=sys.stderr)
            return 1
        while True:
            ok, frame = camera.read()
            if not ok:
                print("Could not read a camera frame.", file=sys.stderr)
                return 1
            display(center_crop(frame), args.threshold, args.minimum_area)
            if cv2.waitKey(25) & 0xFF in (ord("q"), 27):
                return 0
    finally:
        if camera is not None:
            camera.release()
        cv2.destroyAllWindows()


if __name__ == "__main__":
    sys.exit(main())
