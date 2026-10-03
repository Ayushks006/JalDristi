// Scientific oceanographic color palettes

export const PALETTES = {
  temperature: [
    { stop: 0.0, color: [20, 40, 160], hex: '#1428a0', label: '8°C' },
    { stop: 0.2, color: [0, 150, 220], hex: '#0096dc', label: '14°C' },
    { stop: 0.4, color: [30, 200, 180], hex: '#1ec8b4', label: '20°C' },
    { stop: 0.6, color: [120, 220, 80], hex: '#78dc50', label: '24°C' },
    { stop: 0.8, color: [255, 200, 40], hex: '#ffc828', label: '28°C' },
    { stop: 1.0, color: [230, 40, 40], hex: '#e62828', label: '31°C' },
  ],
  salinity: [
    { stop: 0.0, color: [180, 240, 255], hex: '#b4f0ff', label: '31.5 PSU' },
    { stop: 0.3, color: [80, 200, 220], hex: '#50c8dc', label: '33.0 PSU' },
    { stop: 0.6, color: [20, 130, 190], hex: '#1482be', label: '34.8 PSU' },
    { stop: 0.85, color: [15, 75, 160], hex: '#0f4ba0', label: '35.8 PSU' },
    { stop: 1.0, color: [10, 30, 100], hex: '#0a1e64', label: '36.8 PSU' },
  ],
  current_speed: [
    { stop: 0.0, color: [15, 30, 70], hex: '#0f1e46', label: '0.0 m/s' },
    { stop: 0.25, color: [20, 120, 180], hex: '#1478b4', label: '0.5 m/s' },
    { stop: 0.5, color: [0, 220, 200], hex: '#00dcc8', label: '1.0 m/s' },
    { stop: 0.75, color: [240, 190, 40], hex: '#f0be28', label: '1.5 m/s' },
    { stop: 1.0, color: [255, 60, 30], hex: '#ff3c1e', label: '2.2 m/s' },
  ],
  difference: [
    { stop: 0.0, color: [30, 80, 230], hex: '#1e50e6', label: '-2.0°C' },
    { stop: 0.25, color: [0, 180, 240], hex: '#00b4f0', label: '-1.0°C' },
    { stop: 0.5, color: [34, 197, 94], hex: '#22c55e', label: '0.0°C' },
    { stop: 0.75, color: [245, 158, 11], hex: '#f59e0b', label: '+1.0°C' },
    { stop: 1.0, color: [239, 68, 68], hex: '#ef4444', label: '+2.0°C' },
  ]
};

export function getVariableBounds(variable, depth = 0) {
  // Adjust min/max based on depth level
  if (variable === 'temperature') {
    if (depth >= 400) return { min: 6.0, max: 12.0, unit: '°C' };
    if (depth >= 200) return { min: 10.0, max: 18.0, unit: '°C' };
    if (depth >= 80) return { min: 18.0, max: 26.0, unit: '°C' };
    return { min: 24.0, max: 31.5, unit: '°C' };
  }
  if (variable === 'salinity') {
    return { min: 31.5, max: 36.8, unit: 'PSU' };
  }
  if (variable === 'current_speed') {
    return { min: 0.0, max: 2.0, unit: 'm/s' };
  }
  if (variable === 'difference') {
    return { min: -2.0, max: 2.0, unit: '°C' };
  }
  return { min: 0, max: 100, unit: '' };
}

export function getColorForValue(variable, value, min, max, alpha = 0.85) {
  const palette = PALETTES[variable] || PALETTES.temperature;
  const clamped = Math.max(min, Math.min(max, value));
  const norm = (max === min) ? 0.5 : (clamped - min) / (max - min);

  // Find bounding stops
  let lower = palette[0];
  let upper = palette[palette.length - 1];

  for (let i = 0; i < palette.length - 1; i++) {
    if (norm >= palette[i].stop && norm <= palette[i + 1].stop) {
      lower = palette[i];
      upper = palette[i + 1];
      break;
    }
  }

  const range = upper.stop - lower.stop;
  const t = range === 0 ? 0 : (norm - lower.stop) / range;

  const r = Math.round(lower.color[0] + t * (upper.color[0] - lower.color[0]));
  const g = Math.round(lower.color[1] + t * (upper.color[1] - lower.color[1]));
  const b = Math.round(lower.color[2] + t * (upper.color[2] - lower.color[2]));

  return {
    r, g, b, alpha,
    rgba: `rgba(${r}, ${g}, ${b}, ${alpha})`,
    hex: `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
  };
}
