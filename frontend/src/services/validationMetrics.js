// Scientific oceanographic model validation metrics calculations

export function computeValidationMetrics(observations = []) {
  if (!observations || observations.length === 0) {
    return {
      count: 0,
      mae: 0.0,
      rmse: 0.0,
      mean_bias: 0.0,
      correlation: 0.0,
      histogram: [],
      error_std: 0.0
    };
  }

  const diffs = observations.map(o => o.temperature_difference || 0);
  const obsVals = observations.map(o => o.observed_temperature || 0);
  const modVals = observations.map(o => o.model_temperature || 0);
  const n = diffs.length;

  // MAE: Mean Absolute Error
  const sumAbsDiff = diffs.reduce((acc, d) => acc + Math.abs(d), 0);
  const mae = Number((sumAbsDiff / n).toFixed(3));

  // RMSE: Root Mean Square Error
  const sumSqDiff = diffs.reduce((acc, d) => acc + d * d, 0);
  const rmse = Number((Math.sqrt(sumSqDiff / n)).toFixed(3));

  // Mean Bias
  const sumDiff = diffs.reduce((acc, d) => acc + d, 0);
  const mean_bias = Number((sumDiff / n).toFixed(3));

  // Standard deviation of errors
  const variance = diffs.reduce((acc, d) => acc + Math.pow(d - mean_bias, 2), 0) / n;
  const error_std = Number(Math.sqrt(variance).toFixed(3));

  // Pearson Correlation
  const meanObs = obsVals.reduce((a, b) => a + b, 0) / n;
  const meanMod = modVals.reduce((a, b) => a + b, 0) / n;
  let num = 0, den1 = 0, den2 = 0;
  for (let i = 0; i < n; i++) {
    const dobs = obsVals[i] - meanObs;
    const dmod = modVals[i] - meanMod;
    num += dobs * dmod;
    den1 += dobs * dobs;
    den2 += dmod * dmod;
  }
  const correlation = (den1 > 0 && den2 > 0) ? Number((num / Math.sqrt(den1 * den2)).toFixed(3)) : 1.0;

  // Binned Error Histogram (-2.0°C to +2.0°C)
  const bins = [
    { min: -2.0, max: -1.5, label: "-2.0 to -1.5°C" },
    { min: -1.5, max: -1.0, label: "-1.5 to -1.0°C" },
    { min: -1.0, max: -0.5, label: "-1.0 to -0.5°C" },
    { min: -0.5, max: 0.0, label: "-0.5 to 0.0°C" },
    { min: 0.0, max: 0.5, label: "0.0 to +0.5°C" },
    { min: 0.5, max: 1.0, label: "+0.5 to +1.0°C" },
    { min: 1.0, max: 1.5, label: "+1.0 to +1.5°C" },
    { min: 1.5, max: 2.0, label: "+1.5 to +2.0°C" },
  ];

  const histogram = bins.map(b => {
    const count = diffs.filter(d => d >= b.min && d < b.max).length;
    return {
      range: b.label,
      count,
      min: b.min,
      max: b.max
    };
  });

  return {
    count: n,
    mae,
    rmse,
    mean_bias,
    correlation,
    error_std,
    histogram
  };
}
