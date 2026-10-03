// Local Natural Language Query Parser ("Ask JalDristi")

export function parseNaturalLanguageQuery(input = "") {
  const query = input.trim().toLowerCase();
  if (!query) {
    return {
      interpreted: false,
      message: "Please enter a query (e.g. 'Show temperature at 100 m', 'Show salinity', or 'Show model difference')."
    };
  }

  const result = {
    interpreted: false,
    variable: null,
    depth: null,
    layers: {},
    platformFilter: null,
    region: null,
    coordinates: null,
    tempThreshold: null,
    message: ""
  };

  let matchedAny = false;

  // 1. Detect Variable
  if (query.includes("temp") || query.includes("temperature") || query.includes("sst")) {
    result.variable = "temperature";
    matchedAny = true;
  } else if (query.includes("salin") || query.includes("salt") || query.includes("psu")) {
    result.variable = "salinity";
    matchedAny = true;
  } else if (query.includes("speed") || query.includes("velocity")) {
    result.variable = "current_speed";
    result.layers.currents = true;
    matchedAny = true;
  } else if (query.includes("current") || query.includes("stream") || query.includes("flow")) {
    result.variable = "current_speed";
    result.layers.currents = true;
    matchedAny = true;
  } else if (query.includes("direction") || query.includes("angle")) {
    result.variable = "current_direction";
    matchedAny = true;
  }

  // 2. Detect Depth
  const depthMatch = query.match(/(?:depth|at|level)?\s*(\d+)\s*(?:m|meters|meter)?\b/);
  if (depthMatch) {
    const val = parseInt(depthMatch[1], 10);
    if ([0, 10, 50, 100, 250, 500].includes(val)) {
      result.depth = val;
      matchedAny = true;
    } else if (val < 25) {
      result.depth = 10;
      matchedAny = true;
    } else if (val < 75) {
      result.depth = 50;
      matchedAny = true;
    } else if (val < 175) {
      result.depth = 100;
      matchedAny = true;
    } else if (val < 375) {
      result.depth = 250;
      matchedAny = true;
    } else {
      result.depth = 500;
      matchedAny = true;
    }
  }
  if (query.includes("surface") || query.includes("surface layer")) {
    result.depth = 0;
    matchedAny = true;
  }

  // 3. Detect Model Error / Anomaly
  if (query.includes("error") || query.includes("difference") || query.includes("anomal") || query.includes("bias") || query.includes("delta")) {
    result.layers.difference = true;
    result.variable = "difference";
    matchedAny = true;
  }

  // 4. Detect Layer Toggles
  if (query.includes("observation") || query.includes("in-situ") || query.includes("insitu")) {
    result.layers.observations = true;
    matchedAny = true;
  }
  if (query.includes("model") && !query.includes("error")) {
    result.layers.model = true;
    matchedAny = true;
  }

  // 5. Detect Platform Type
  if (query.includes("argo") || query.includes("float")) {
    result.platformFilter = "argo";
    result.layers.observations = true;
    matchedAny = true;
  } else if (query.includes("buoy") || query.includes("rama") || query.includes("omni")) {
    result.platformFilter = "buoy";
    result.layers.observations = true;
    matchedAny = true;
  } else if (query.includes("vessel") || query.includes("ship") || query.includes("cruise") || query.includes("kanya")) {
    result.platformFilter = "vessel";
    result.layers.observations = true;
    matchedAny = true;
  } else if (query.includes("station") || query.includes("coastal") || query.includes("mooring")) {
    result.platformFilter = "station";
    result.layers.observations = true;
    matchedAny = true;
  }

  // 6. Detect Geographic Regions
  if (query.includes("arabian sea") || query.includes("arabian")) {
    result.region = { name: "Arabian Sea", lat: 15.0, lon: 65.0, zoom: 2500000 };
    matchedAny = true;
  } else if (query.includes("bay of bengal") || query.includes("bengal") || query.includes("bob")) {
    result.region = { name: "Bay of Bengal", lat: 14.0, lon: 87.0, zoom: 2500000 };
    matchedAny = true;
  } else if (query.includes("equator") || query.includes("equatorial")) {
    result.region = { name: "Equatorial Indian Ocean", lat: 0.0, lon: 78.0, zoom: 3500000 };
    matchedAny = true;
  } else if (query.includes("indian ocean")) {
    result.region = { name: "All Indian Ocean", lat: 6.0, lon: 76.0, zoom: 5000000 };
    matchedAny = true;
  }

  // 7. Detect Coordinates (e.g., "12N 72E", "12.34, 72.18", "lat 15 lon 68")
  const coordMatch = query.match(/(-?\d+\.?\d*)\s*(?:°|deg)?\s*([ns])?,?\s*(-?\d+\.?\d*)\s*(?:°|deg)?\s*([ew])?/i);
  if (coordMatch && coordMatch[1] && coordMatch[3]) {
    let lat = parseFloat(coordMatch[1]);
    let lon = parseFloat(coordMatch[3]);
    if (coordMatch[2] && coordMatch[2].toLowerCase() === 's') lat = -lat;
    if (coordMatch[4] && coordMatch[4].toLowerCase() === 'w') lon = -lon;
    if (!isNaN(lat) && !isNaN(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180) {
      result.coordinates = { lat, lon };
      matchedAny = true;
    }
  }

  // 8. Detect Thresholds (e.g. "temperature above 30", "temp > 28")
  const threshMatch = query.match(/(?:above|greater than|>)\s*(\d+\.?\d*)/);
  if (threshMatch) {
    result.tempThreshold = { operator: '>', value: parseFloat(threshMatch[1]) };
    matchedAny = true;
  }

  if (!matchedAny) {
    return {
      interpreted: false,
      message: "I couldn't interpret that query. Try: 'Show temperature at 100 m', 'Show model error', or 'Show Arabian Sea buoys'."
    };
  }

  // Construct friendly execution feedback
  const appliedActions = [];
  if (result.variable) appliedActions.push(`Variable: ${result.variable.toUpperCase()}`);
  if (result.depth !== null) appliedActions.push(`Depth: ${result.depth} m`);
  if (result.layers.difference) appliedActions.push(`Layer: Model-Observation Difference`);
  if (result.layers.currents) appliedActions.push(`Layer: Animated Currents`);
  if (result.platformFilter) appliedActions.push(`Platform: ${result.platformFilter}`);
  if (result.region) appliedActions.push(`Navigating to: ${result.region.name}`);
  if (result.coordinates) appliedActions.push(`Target: ${result.coordinates.lat}°, ${result.coordinates.lon}°`);

  result.interpreted = true;
  result.message = `Query executed: ${appliedActions.join(' | ')}`;
  return result;
}
