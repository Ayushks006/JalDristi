// Client-Side High-Fidelity Indian Ocean Demo Dataset Generator

export const STANDARD_DEPTHS = [0, 10, 50, 100, 250, 500];

export const TIMESTAMPS = [
  "2026-09-20T00:00:00Z",
  "2026-09-21T06:00:00Z",
  "2026-09-22T12:00:00Z",
  "2026-09-23T18:00:00Z",
  "2026-09-24T12:00:00Z",
  "2026-09-25T18:00:00Z",
];

export function generateClientModelGrid(depth = 0, timeIdx = 0) {
  const lats = [];
  for (let lat = -10.0; lat <= 26.0; lat += 2.0) lats.push(lat);
  const lons = [];
  for (let lon = 50.0; lon <= 100.0; lon += 2.0) lons.push(lon);

  const tPhase = timeIdx * 0.25;
  const depthFactor = Math.exp(-depth / 150.0);
  const baseTDeep = 6.5 + 4.0 * Math.exp(-depth / 400.0);

  const grid = [];

  for (const lat of lats) {
    for (const lon of lons) {
      // Land masking for Indian Subcontinent & Arabian Peninsula
      if (lat > 9.0 && lon > 74.0 && lon < 85.0 && lat > (9.0 + (lon - 74.0) * 0.8)) continue;
      if (lat > 14.0 && lon < 60.0) continue;
      if (lat > 2.0 && lat < 12.0 && lon < 51.5) continue;

      const latEffect = -0.15 * Math.abs(lat - 4.0);
      const lonEffect = 0.04 * (lon - 75.0);
      const isArabianSea = (lat > 5.0 && lon < 72.0);
      const upwelling = isArabianSea ? -2.2 * Math.exp(-((lat - 15.0) ** 2 + (lon - 56.0) ** 2) / 40.0) : 0.0;
      const eddy = 0.6 * Math.sin(lat * 0.3 + tPhase) * Math.cos(lon * 0.25 - tPhase);

      const sst = 28.5 + latEffect + lonEffect + upwelling + eddy;
      const temp = Number((baseTDeep + (sst - baseTDeep) * depthFactor).toFixed(2));

      let surfSal = 34.9 + 0.02 * (lon - 75.0);
      if (isArabianSea) {
        surfSal = 36.4 + 0.3 * Math.sin(lat * 0.2);
      } else if (lon >= 78.0 && lat > 8.0) {
        surfSal = 32.2 + 0.08 * (lon - 78.0) - 0.15 * (lat - 8.0);
      }
      const sal = Number((34.75 + (surfSal - 34.75) * Math.exp(-depth / 180.0)).toFixed(2));

      const distEq = Math.abs(lat);
      const eqJet = 0.85 * Math.exp(-(distEq ** 2) / 18.0);
      const somaliJet = 1.1 * Math.exp(-((lat - 8.0) ** 2 + (lon - 53.0) ** 2) / 30.0);

      const uRaw = eqJet + 0.2 * Math.sin(lat * 0.4 + tPhase) + 0.1 * Math.cos(lon * 0.3);
      const vRaw = somaliJet + 0.25 * Math.cos(lat * 0.35 + tPhase) - 0.15 * Math.sin(lon * 0.25);

      const current_u = Number((uRaw * Math.exp(-depth / 120.0)).toFixed(2));
      const current_v = Number((vRaw * Math.exp(-depth / 120.0)).toFixed(2));
      const current_speed = Number(Math.sqrt(current_u ** 2 + current_v ** 2).toFixed(2));
      const current_direction = Number(((Math.atan2(current_u, current_v) * (180 / Math.PI) + 360) % 360).toFixed(1));

      grid.push({
        lat: Number(lat.toFixed(2)),
        lon: Number(lon.toFixed(2)),
        depth,
        time: TIMESTAMPS[timeIdx],
        temperature: temp,
        salinity: sal,
        current_u,
        current_v,
        current_speed,
        current_direction,
      });
    }
  }

  return grid;
}

export function generateClientObservations(depth = 0, timeIdx = 0) {
  const platforms = [
    // Moored Buoys (RAMA / INCOIS OMNI)
    { id: "BUOY-OMNI-BD08", type: "buoy", name: "INCOIS OMNI BD08 (Bay of Bengal)", lat: 18.15, lon: 89.65 },
    { id: "BUOY-OMNI-BD10", type: "buoy", name: "INCOIS OMNI BD10 (Cent. BoB)", lat: 14.02, lon: 86.84 },
    { id: "BUOY-OMNI-AD01", type: "buoy", name: "INCOIS OMNI AD01 (North Arabian Sea)", lat: 18.50, lon: 67.45 },
    { id: "BUOY-OMNI-AD07", type: "buoy", name: "INCOIS OMNI AD07 (East Arabian Sea)", lat: 14.92, lon: 69.18 },
    { id: "BUOY-RAMA-EQ01", type: "buoy", name: "RAMA Equatorial Flux Mooring", lat: 0.00, lon: 80.50 },
    { id: "BUOY-RAMA-EQ02", type: "buoy", name: "RAMA SW Indian Ocean Mooring", lat: -8.00, lon: 67.00 },
    { id: "BUOY-RAMA-AS01", type: "buoy", name: "RAMA Arabian Sea Central", lat: 12.00, lon: 65.00 },

    // Coastal Marine Stations
    { id: "STN-IN-COCHIN", type: "station", name: "Cochin Oceanographic Stn", lat: 9.96, lon: 76.24 },
    { id: "STN-IN-CHENNAI", type: "station", name: "Chennai Coastal Marine Stn", lat: 13.08, lon: 80.30 },
    { id: "STN-IN-PORTBLAIR", type: "station", name: "Port Blair Marine Stn", lat: 11.62, lon: 92.72 },
    { id: "STN-IN-KARWAR", type: "station", name: "Karwar Marine Stn", lat: 14.80, lon: 74.12 },
    { id: "STN-IN-MANGALORE", type: "station", name: "Mangalore Deep Stn", lat: 12.87, lon: 74.82 },
    { id: "STN-MV-MALE", type: "station", name: "Maldives Ocean Stn", lat: 4.17, lon: 73.51 },

    // Research Vessels
    { id: "VESSEL-SAGAR-KANYA", type: "vessel", name: "ORV Sagar Kanya (SK-412)", lat: 11.20 + timeIdx * 0.4, lon: 71.80 + timeIdx * 0.35 },
    { id: "VESSEL-ROGER-REVELLE", type: "vessel", name: "R/V Roger Revelle (MISO-BOB)", lat: 8.50 - timeIdx * 0.3, lon: 84.20 + timeIdx * 0.2 },
    { id: "VESSEL-SAGAR-NIDHI", type: "vessel", name: "ORV Sagar Nidhi (INCOIS)", lat: 16.40 - timeIdx * 0.25, lon: 82.80 - timeIdx * 0.3 },
  ];

  // Argo Profiling Floats
  const argoSeeds = [
    [15.2, 64.5], [17.8, 62.1], [13.5, 68.2], [11.0, 66.8], [8.2, 70.4],
    [5.5, 63.8], [2.1, 66.2], [-2.4, 62.5], [-6.8, 60.1], [-8.5, 71.3],
    [-4.0, 77.5], [1.5, 78.2], [6.0, 78.5], [9.8, 77.2], [7.5, 82.4],
    [10.2, 85.1], [13.4, 84.0], [16.2, 87.5], [18.8, 88.0], [15.5, 91.2],
    [12.1, 90.8], [8.4, 89.2], [4.5, 88.0], [1.0, 89.5], [-3.2, 86.4],
    [-7.1, 85.0], [-5.5, 93.0], [0.5, 94.2], [5.2, 95.8], [9.5, 96.2],
    [13.1, 94.5], [19.5, 70.1], [16.8, 71.5], [20.5, 65.2], [18.1, 72.0]
  ];

  argoSeeds.forEach(([baseLat, baseLon], i) => {
    const driftLat = baseLat + 0.08 * Math.sin(i * 1.3 + timeIdx * 0.5);
    const driftLon = baseLon + 0.09 * Math.cos(i * 0.9 + timeIdx * 0.4);
    platforms.push({
      id: `ARGO-IN-${5906000 + i}`,
      type: "argo",
      name: `Argo Float WMO ${5906000 + i}`,
      lat: Number(driftLat.toFixed(3)),
      lon: Number(driftLon.toFixed(3)),
    });
  });

  const observations = [];

  platforms.forEach((p, idx) => {
    const lat = p.lat;
    const lon = p.lon;

    const depthFactor = Math.exp(-depth / 150.0);
    const baseTDeep = 6.5 + 4.0 * Math.exp(-depth / 400.0);
    const latEffect = -0.15 * Math.abs(lat - 4.0);
    const lonEffect = 0.04 * (lon - 75.0);
    const isArabianSea = (lat > 5.0 && lon < 72.0);
    const upwelling = isArabianSea ? -2.2 * Math.exp(-((lat - 15.0) ** 2 + (lon - 56.0) ** 2) / 40.0) : 0.0;
    const modelSST = 28.5 + latEffect + lonEffect + upwelling + 0.6 * Math.sin(lat * 0.3 + timeIdx * 0.25) * Math.cos(lon * 0.25 - timeIdx * 0.25);
    const modelTemp = Number((baseTDeep + (modelSST - baseTDeep) * depthFactor).toFixed(2));

    let modelSurfSal = 34.9 + 0.02 * (lon - 75.0);
    if (isArabianSea) modelSurfSal = 36.4 + 0.3 * Math.sin(lat * 0.2);
    else if (lon >= 78.0 && lat > 8.0) modelSurfSal = 32.2 + 0.08 * (lon - 78.0) - 0.15 * (lat - 8.0);
    const modelSal = Number((34.75 + (modelSurfSal - 34.75) * Math.exp(-depth / 180.0)).toFixed(2));

    // Realistic physical discrepancy
    const biasSeed = Math.sin(lat * 0.7 + lon * 0.5 + idx * 0.3);
    const anomalyBias = 0.45 * biasSeed + ((idx % 5) - 2) * 0.12;
    const observedTemp = Number((modelTemp + anomalyBias).toFixed(2));
    const tempDiff = Number((observedTemp - modelTemp).toFixed(2));

    const salAnomaly = Number((0.15 * Math.cos(lon * 0.4) + ((idx % 3) - 1) * 0.05).toFixed(2));
    const observedSal = Number((modelSal + salAnomaly).toFixed(2));
    const salDiff = Number((observedSal - modelSal).toFixed(2));

    let qualityFlag = "Good";
    let qualityCode = 1;
    if (idx % 8 === 0) { qualityFlag = "Moderate"; qualityCode = 2; }
    else if (idx === 14) { qualityFlag = "Poor"; qualityCode = 3; }

    // Complete CTD profile across standard depths
    const depthProfile = STANDARD_DEPTHS.map((d) => {
      const dFact = Math.exp(-d / 150.0);
      const dDeep = 6.5 + 4.0 * Math.exp(-d / 400.0);
      const mT = Number((dDeep + (modelSST - dDeep) * dFact).toFixed(2));
      const oT = Number((mT + anomalyBias * Math.exp(-d / 200.0) + 0.05 * Math.sin(d)).toFixed(2));
      const mS = Number((34.75 + (modelSurfSal - 34.75) * Math.exp(-d / 180.0)).toFixed(2));
      const oS = Number((mS + salAnomaly * Math.exp(-d / 220.0)).toFixed(2));

      return {
        depth: d,
        model_temp: mT,
        observed_temp: oT,
        temp_diff: Number((oT - mT).toFixed(2)),
        model_sal: mS,
        observed_sal: oS,
        sal_diff: Number((oS - mS).toFixed(2)),
      };
    });

    observations.push({
      id: p.id,
      platform_type: p.type,
      name: p.name,
      lat,
      lon,
      depth,
      time: TIMESTAMPS[timeIdx],
      observed_temperature: observedTemp,
      model_temperature: modelTemp,
      temperature_difference: tempDiff,
      observed_salinity: observedSal,
      model_salinity: modelSal,
      salinity_difference: salDiff,
      quality_flag: qualityFlag,
      quality_code: qualityCode,
      depth_profile: depthProfile,
      source: "In-situ Ocean Observation (Demo)",
    });
  });

  return observations;
}
