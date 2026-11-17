// Illustrative classifier with fixed coefficients for a fictional motor.
export const staleAfterSeconds = 30;

export function runInference(reading, model, now, id) {
  const observed = Date.parse(reading.capturedAt);
  if (typeof now !== 'number' || !Number.isFinite(now) || !Number.isFinite(observed) || observed > now
      || typeof reading.source !== 'string' || !reading.source.trim()) {
    return { id, reading, modelId: model.id, observed, generatedAt: now, error: 'The source or sample timestamp is invalid.' };
  }
  if (!Number.isFinite(reading.vibration) || reading.vibration < 0 || reading.vibration > 5
      || !Number.isFinite(reading.temperature) || reading.temperature < 0 || reading.temperature > 100) {
    return { id, reading, modelId: model.id, observed, generatedAt: now, error: 'A sensor value is missing or outside the sample range.' };
  }
  const logit = model.bias + model.vibrationWeight * reading.vibration
    + model.temperatureWeight * (reading.temperature - model.baselineTemperature);
  const score = 1 / (1 + Math.exp(-logit));
  return {
    id, reading, modelId: model.id, observed, generatedAt: now,
    score, prediction: score >= model.threshold ? 'Inspect motor' : 'Continue observation',
  };
}

export function resultStatus(result, now) {
  if (result.error) return 'Invalid';
  return (now - result.observed) / 1000 > staleAfterSeconds ? 'Stale' : 'Fresh';
}

export function reviewResult(result, now) {
  if (resultStatus(result, now) !== 'Fresh') throw new Error('Review requires a fresh, valid result.');
  return { ...result, reviewedAt: now };
}
