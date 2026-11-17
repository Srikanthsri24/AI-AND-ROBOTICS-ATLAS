"""Local Flask endpoint for the Atlas simulated fruit-sensor project."""
import csv
import math
from pathlib import Path
from flask import Flask, jsonify, request

app = Flask(__name__)
app.config["MAX_CONTENT_LENGTH"] = 4096

def read_samples(path):
    with path.open(newline="", encoding="utf-8") as file:
        return [
            (row["split"], float(row["color"]), float(row["firmness"]), float(row["brix"]))
            for row in csv.DictReader(file)
        ]

def fit(rows):
    count = len(rows)
    mc, mf, my = (sum(row[index] for row in rows) / count for index in (1, 2, 3))
    cc = ff = cf = cy = fy = 0.0
    for _, color, firmness, brix in rows:
        c, f, y = color - mc, firmness - mf, brix - my
        cc += c * c
        ff += f * f
        cf += c * f
        cy += c * y
        fy += f * y
    determinant = cc * ff - cf * cf
    if determinant <= 1e-9:
        raise ValueError("Training needs independent variation in both sensors.")
    bc = (cy * ff - fy * cf) / determinant
    bf = (fy * cc - cy * cf) / determinant
    return my - bc * mc - bf * mf, bc, bf

samples = read_samples(Path(__file__).with_name("fruit_samples.csv"))
training = [row for row in samples if row[0] == "train"]
held_out = [row for row in samples if row[0] == "test"]
intercept, color_coef, firmness_coef = fit(training)
ranges = [(min(row[index] for row in training), max(row[index] for row in training)) for index in (1, 2)]

def estimate(color, firmness):
    return intercept + color_coef * color + firmness_coef * firmness

@app.get("/")
def index():
    errors = [abs(estimate(color, firmness) - actual) for _, color, firmness, actual in held_out]
    return jsonify(training_rows=len(training), held_out_rows=len(held_out),
                   held_out_mae_brix=round(sum(errors) / len(errors), 4))

@app.post("/predict")
def predict():
    packet = request.get_json(silent=True)
    if not isinstance(packet, dict):
        return jsonify(error="Send a JSON object with color and firmness"), 400
    values = [packet.get(field) for field in ("color", "firmness")]
    if any(type(value) not in (int, float) or not 0 <= value <= 100 or not math.isfinite(value)
           for value in values):
        return jsonify(error="Both sensor readings must be numeric and within 0–100"), 400
    outside = any(not low <= value <= high for value, (low, high) in zip(values, ranges))
    return jsonify(predicted_brix=round(estimate(*values), 4), outside_training_range=outside)

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5055)
