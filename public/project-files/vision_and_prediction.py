"""Count connected image regions or fit a rover stopping-distance model."""
import argparse
from collections import deque
import csv
import math
from pathlib import Path
from statistics import mean


def read_pgm(path):
    tokens = " ".join(line.split("#", 1)[0] for line in path.read_text().splitlines()).split()
    if len(tokens) < 4 or tokens[0] != "P2":
        raise ValueError("Use an ASCII PGM image (P2).")
    width, height, max_value = map(int, tokens[1:4])
    values = list(map(int, tokens[4:]))
    if width < 1 or height < 1 or max_value != 255 or len(values) != width * height:
        raise ValueError("PGM dimensions or maximum value are invalid.")
    if any(not 0 <= value <= 255 for value in values):
        raise ValueError("Pixels must be in the range 0 to 255.")
    return [values[i:i + width] for i in range(0, len(values), width)]


def label_regions(grid, threshold):
    height, width = len(grid), len(grid[0])
    labels = [[0] * width for _ in grid]
    count = 0
    for y in range(height):
        for x in range(width):
            if grid[y][x] < threshold or labels[y][x]:
                continue
            count += 1
            labels[y][x] = count
            queue = deque([(y, x)])
            while queue:
                row, col = queue.popleft()
                for r, c in ((row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)):
                    if 0 <= r < height and 0 <= c < width and grid[r][c] >= threshold and not labels[r][c]:
                        labels[r][c] = count
                        queue.append((r, c))
    return labels, count


def fit_line(train):
    if len(train) < 2:
        raise ValueError("At least two training pairs are needed.")
    x_avg = mean(speed for speed, _ in train)
    y_avg = mean(distance for _, distance in train)
    spread = sum((speed - x_avg) ** 2 for speed, _ in train)
    if not spread:
        raise ValueError("Training speeds must vary.")
    slope = sum((speed - x_avg) * (distance - y_avg) for speed, distance in train) / spread
    return slope, y_avg - slope * x_avg


def run_model(path, speed):
    rows = {"train": [], "test": []}
    with path.open(newline="") as file:
        for row in csv.DictReader(file):
            sample = float(row["speed_cm_s"]), float(row["stop_cm"])
            if row["split"] not in rows or any(not math.isfinite(value) for value in sample):
                raise ValueError("Each row needs finite numbers and a train or test split.")
            rows[row["split"]].append(sample)
    train, holdout = rows["train"], rows["test"]
    if not holdout:
        raise ValueError("At least one held-out test row is needed.")
    slope, intercept = fit_line(train)
    predict = lambda value: slope * value + intercept
    error = mean(abs(distance - predict(measured_speed)) for measured_speed, distance in holdout)
    print(f"Prediction at {speed:g} cm/s: {predict(speed):.2f} cm")
    print(f"Mean absolute error on held-out rows: {error:.2f} cm")
    low, high = min(x for x, _ in train), max(x for x, _ in train)
    if not low <= speed <= high:
        print(f"Outside the training range ({low:g}–{high:g} cm/s).")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    subparsers = parser.add_subparsers(dest="task", required=True)
    vision = subparsers.add_parser("vision")
    vision.add_argument("file", type=Path)
    vision.add_argument("--threshold", type=int, default=140)
    model = subparsers.add_parser("predict")
    model.add_argument("file", type=Path)
    model.add_argument("--speed", type=float, default=35)
    args = parser.parse_args()
    try:
        if args.task == "vision":
            if not 0 <= args.threshold <= 255:
                raise ValueError("Threshold must be between 0 and 255.")
            labels, count = label_regions(read_pgm(args.file), args.threshold)
            print(f"Connected regions: {count}")
            for row in labels:
                print(" ".join(str(value) if value else "." for value in row))
        else:
            if not math.isfinite(args.speed) or args.speed < 0:
                raise ValueError("Speed must be a finite, nonnegative number.")
            run_model(args.file, args.speed)
    except (OSError, KeyError, ValueError) as error:
        parser.error(str(error))


if __name__ == "__main__":
    main()
