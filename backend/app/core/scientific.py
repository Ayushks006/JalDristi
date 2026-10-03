import numpy as np
import pandas as pd
import math
from typing import Dict, List, Any, Optional

# Standard depth levels in meters
STANDARD_DEPTHS = [0, 10, 50, 100, 250, 500]

# Standard timestamps for the 4D timeline (SIH 2026 scenario: late September)
TIMESTAMPS = [
    "2026-09-20T00:00:00Z",
    "2026-09-21T06:00:00Z",
    "2026-09-22T12:00:00Z",
    "2026-09-23T18:00:00Z",
    "2026-09-24T12:00:00Z",
    "2026-09-25T18:00:00Z",
]

def generate_indian_ocean_model_grid(depth: float = 0, time_idx: int = 0) -> List[Dict[str, Any]]:
    """
    Generate a 2D spatial slice of numerical ocean model data for a given depth and time step.
    Resolution: 2.0 degree grid covering the North & Equatorial Indian Ocean (50°E-100°E, 10°S-25°N).
    Simulates realistic physics:
    - Warm pool in East Indian Ocean & BoB
    - Upwelling cooler tongue along Oman/Somali coast
    - Northern Arabian Sea high salinity vs Bay of Bengal low salinity river plume
    - Southwest monsoon gyres with strong western boundary currents
    """
    lats = np.arange(-10.0, 26.0, 2.0)
    lons = np.arange(50.0, 101.0, 2.0)
    
    # Time wave phase
    t_phase = time_idx * 0.25
    
    # Depth attenuation factors (thermocline dynamics)
    # At surface (0m): warm (~28-30°C). At 100m: thermocline (~18-22°C). At 500m: deep water (~8-10°C).
    depth_t_factor = math.exp(-depth / 150.0)
    base_t_deep = 6.5 + 4.0 * math.exp(-depth / 400.0)
    
    grid = []
    
    for lat in lats:
        for lon in lons:
            # Skip high continental land points (simplified land mask)
            # India landmass: ~8°N to 26°N and 73°E to 86°E roughly
            if lat > 9.0 and 74.0 < lon < 85.0 and lat > (9.0 + (lon - 74.0) * 0.8):
                continue
            # Arabian Peninsula / Middle East mask
            if lat > 14.0 and lon < 60.0:
                continue
            # Horn of Africa mask
            if lat > 2.0 and lat < 12.0 and lon < 51.5:
                continue

            # Temperature calculation
            # Latitude gradient + warm pool east of 80°E
            lat_effect = -0.15 * abs(lat - 4.0)
            lon_effect = 0.04 * (lon - 75.0)
            
            # Upwelling along western Arabian Sea (cooler surface)
            is_arabian_sea = (lat > 5.0 and lon < 72.0)
            upwelling = -2.2 * math.exp(-((lat - 15.0)**2 + (lon - 56.0)**2) / 40.0) if is_arabian_sea else 0.0
            
            # Dynamic mesoscale eddy wave
            eddy = 0.6 * math.sin(lat * 0.3 + t_phase) * math.cos(lon * 0.25 - t_phase)
            
            sst = 28.5 + lat_effect + lon_effect + upwelling + eddy
            temp = base_t_deep + (sst - base_t_deep) * depth_t_factor
            temp = round(float(temp), 2)
            
            # Salinity calculation (PSU)
            # Arabian Sea: high evaporation (~35.8-36.7 PSU)
            # Bay of Bengal: river runoff (~31.5-33.5 PSU)
            # Deep ocean: uniform (~34.8 PSU)
            if is_arabian_sea:
                surf_sal = 36.4 + 0.3 * math.sin(lat * 0.2)
            elif lon >= 78.0 and lat > 8.0: # Bay of Bengal
                surf_sal = 32.2 + 0.08 * (lon - 78.0) - 0.15 * (lat - 8.0)
            else:
                surf_sal = 34.9 + 0.02 * (lon - 75.0)
                
            sal_deep = 34.75
            sal = sal_deep + (surf_sal - sal_deep) * math.exp(-depth / 180.0)
            sal = round(float(sal), 2)
            
            # Ocean Currents (u: Eastward, v: Northward in m/s)
            # Summer monsoon circulation: Eastward Equatorial Jet & clockwise gyre
            dist_from_equator = abs(lat)
            eq_jet = 0.85 * math.exp(-(dist_from_equator**2) / 18.0)
            
            # Somali current jet along coast
            somali_jet_v = 1.1 * math.exp(-((lat - 8.0)**2 + (lon - 53.0)**2) / 30.0)
            
            u = eq_jet + 0.2 * math.sin(lat * 0.4 + t_phase) + 0.1 * math.cos(lon * 0.3)
            v = somali_jet_v + 0.25 * math.cos(lat * 0.35 + t_phase) - 0.15 * math.sin(lon * 0.25)
            
            # Velocity decays with depth
            u = round(float(u * math.exp(-depth / 120.0)), 2)
            v = round(float(v * math.exp(-depth / 120.0)), 2)
            
            current_speed = round(float(math.sqrt(u**2 + v**2)), 2)
            current_dir = round(float((math.degrees(math.atan2(u, v)) + 360) % 360), 1)

            grid.append({
                "lat": round(float(lat), 2),
                "lon": round(float(lon), 2),
                "depth": depth,
                "time": TIMESTAMPS[time_idx],
                "temperature": temp,
                "salinity": sal,
                "current_u": u,
                "current_v": v,
                "current_speed": current_speed,
                "current_direction": current_dir,
            })
            
    return grid

def generate_indian_ocean_observations(depth: float = 0, time_idx: int = 0) -> List[Dict[str, Any]]:
    """
    Generate realistic in-situ observation platforms in the Indian Ocean:
    - Argo Profiling Floats
    - RAMA / INCOIS OMNI Moored Ocean Buoys
    - Research Vessels (ORV Sagar Kanya, R/V Roger Revelle)
    - Coastal Ocean Stations
    Each observation includes real measured values, co-located numerical model predictions,
    precomputed differences, sensor quality flags, and full vertical depth profiles.
    """
    np.random.seed(42 + time_idx * 7)
    
    platforms = [
        # Moored Buoys (RAMA / INCOIS OMNI - fixed critical stations)
        {"id": "BUOY-OMNI-BD08", "type": "buoy", "name": "INCOIS OMNI BD08 (Bay of Bengal)", "lat": 18.15, "lon": 89.65},
        {"id": "BUOY-OMNI-BD10", "type": "buoy", "name": "INCOIS OMNI BD10 (Cent. BoB)", "lat": 14.02, "lon": 86.84},
        {"id": "BUOY-OMNI-AD01", "type": "buoy", "name": "INCOIS OMNI AD01 (North Arabian Sea)", "lat": 18.50, "lon": 67.45},
        {"id": "BUOY-OMNI-AD07", "type": "buoy", "name": "INCOIS OMNI AD07 (East Arabian Sea)", "lat": 14.92, "lon": 69.18},
        {"id": "BUOY-RAMA-EQ01", "type": "buoy", "name": "RAMA Equatorial Flux Mooring", "lat": 0.00, "lon": 80.50},
        {"id": "BUOY-RAMA-EQ02", "type": "buoy", "name": "RAMA SW Indian Ocean Mooring", "lat": -8.00, "lon": 67.00},
        {"id": "BUOY-RAMA-AS01", "type": "buoy", "name": "RAMA Arabian Sea Central", "lat": 12.00, "lon": 65.00},
        
        # Coastal & Island Ocean Stations
        {"id": "STN-IN-COCHIN", "type": "station", "name": "Cochin Oceanographic Stn", "lat": 9.96, "lon": 76.24},
        {"id": "STN-IN-CHENNAI", "type": "station", "name": "Chennai Coastal Marine Stn", "lat": 13.08, "lon": 80.30},
        {"id": "STN-IN-PORTBLAIR", "type": "station", "name": "Port Blair Andaman Stn", "lat": 11.62, "lon": 92.72},
        {"id": "STN-IN-KARWAR", "type": "station", "name": "Karwar Marine Observation Stn", "lat": 14.80, "lon": 74.12},
        {"id": "STN-IN-MANGALORE", "type": "station", "name": "Mangalore Deep Mooring Stn", "lat": 12.87, "lon": 74.82},
        {"id": "STN-MV-MALE", "type": "station", "name": "Maldives Marine Research Stn", "lat": 4.17, "lon": 73.51},
        
        # Research Vessels (Cruising routes)
        {"id": "VESSEL-SAGAR-KANYA", "type": "vessel", "name": "ORV Sagar Kanya (Cruise SK-412)", "lat": 11.20 + time_idx * 0.4, "lon": 71.80 + time_idx * 0.35},
        {"id": "VESSEL-ROGER-REVELLE", "type": "vessel", "name": "R/V Roger Revelle (MISO-BOB)", "lat": 8.50 - time_idx * 0.3, "lon": 84.20 + time_idx * 0.2},
        {"id": "VESSEL-SAGAR-NIDHI", "type": "vessel", "name": "ORV Sagar Nidhi (INCOIS Tech)", "lat": 16.40 - time_idx * 0.25, "lon": 82.80 - time_idx * 0.3},
    ]
    
    # Generate 35 realistic active Argo floats distributed across the basin
    argo_seeds = [
        (15.2, 64.5), (17.8, 62.1), (13.5, 68.2), (11.0, 66.8), (8.2, 70.4),
        (5.5, 63.8), (2.1, 66.2), (-2.4, 62.5), (-6.8, 60.1), (-8.5, 71.3),
        (-4.0, 77.5), (1.5, 78.2), (6.0, 78.5), (9.8, 77.2), (7.5, 82.4),
        (10.2, 85.1), (13.4, 84.0), (16.2, 87.5), (18.8, 88.0), (15.5, 91.2),
        (12.1, 90.8), (8.4, 89.2), (4.5, 88.0), (1.0, 89.5), (-3.2, 86.4),
        (-7.1, 85.0), (-5.5, 93.0), (0.5, 94.2), (5.2, 95.8), (9.5, 96.2),
        (13.1, 94.5), (19.5, 70.1), (16.8, 71.5), (20.5, 65.2), (18.1, 72.0)
    ]
    
    for i, (base_lat, base_lon) in enumerate(argo_seeds):
        # Argo floats drift with time (~0.05 to 0.1 deg per time step)
        drift_lat = base_lat + 0.08 * math.sin(i * 1.3 + time_idx * 0.5)
        drift_lon = base_lon + 0.09 * math.cos(i * 0.9 + time_idx * 0.4)
        platforms.append({
            "id": f"ARGO-IN-{5906000 + i}",
            "type": "argo",
            "name": f"Argo Float WMO {5906000 + i}",
            "lat": round(drift_lat, 3),
            "lon": round(drift_lon, 3),
        })

    observations = []
    
    for p in platforms:
        plat_lat = p["lat"]
        plat_lon = p["lon"]
        
        # Calculate co-located numerical model baseline
        depth_factor = math.exp(-depth / 150.0)
        base_t_deep = 6.5 + 4.0 * math.exp(-depth / 400.0)
        lat_effect = -0.15 * abs(plat_lat - 4.0)
        lon_effect = 0.04 * (plat_lon - 75.0)
        upwelling = -2.2 * math.exp(-((plat_lat - 15.0)**2 + (plat_lon - 56.0)**2) / 40.0) if (plat_lat > 5.0 and plat_lon < 72.0) else 0.0
        model_sst = 28.5 + lat_effect + lon_effect + upwelling + 0.6 * math.sin(plat_lat * 0.3 + time_idx * 0.25) * math.cos(plat_lon * 0.25 - time_idx * 0.25)
        model_temp = round(float(base_t_deep + (model_sst - base_t_deep) * depth_factor), 2)
        
        # Co-located model salinity
        if plat_lat > 5.0 and plat_lon < 72.0:
            model_surf_sal = 36.4 + 0.3 * math.sin(plat_lat * 0.2)
        elif plat_lon >= 78.0 and plat_lat > 8.0:
            model_surf_sal = 32.2 + 0.08 * (plat_lon - 78.0) - 0.15 * (plat_lat - 8.0)
        else:
            model_surf_sal = 34.9 + 0.02 * (plat_lon - 75.0)
        model_sal = round(float(34.75 + (model_surf_sal - 34.75) * math.exp(-depth / 180.0)), 2)
        
        # Real in-situ measurement with realistic physical discrepancy (model error)
        # Mesoscale eddy discrepancy or model bias
        anomaly_bias = 0.45 * math.sin(plat_lat * 0.7 + plat_lon * 0.5) + np.random.normal(0.05, 0.25)
        observed_temp = round(float(model_temp + anomaly_bias), 2)
        temp_difference = round(float(observed_temp - model_temp), 2)
        
        sal_anomaly = 0.12 * math.cos(plat_lon * 0.4) + np.random.normal(0, 0.08)
        observed_sal = round(float(model_sal + sal_anomaly), 2)
        sal_difference = round(float(observed_sal - model_sal), 2)
        
        # Quality flag (1=Good, 2=Moderate, 3=Poor)
        q_rand = np.random.rand()
        if q_rand > 0.15:
            q_flag = "Good"
            q_code = 1
        elif q_rand > 0.05:
            q_flag = "Moderate"
            q_code = 2
        else:
            q_flag = "Poor"
            q_code = 3
            
        # Generate complete vertical CTD profile (0m to 500m)
        depth_profile = []
        for d in STANDARD_DEPTHS:
            d_fact = math.exp(-d / 150.0)
            d_t_deep = 6.5 + 4.0 * math.exp(-d / 400.0)
            m_t = round(float(d_t_deep + (model_sst - d_t_deep) * d_fact), 2)
            o_t = round(float(m_t + anomaly_bias * math.exp(-d / 200.0) + np.random.normal(0, 0.1)), 2)
            
            m_s = round(float(34.75 + (model_surf_sal - 34.75) * math.exp(-d / 180.0)), 2)
            o_s = round(float(m_s + sal_anomaly * math.exp(-d / 220.0)), 2)
            
            depth_profile.append({
                "depth": d,
                "model_temp": m_t,
                "observed_temp": o_t,
                "temp_diff": round(float(o_t - m_t), 2),
                "model_sal": m_s,
                "observed_sal": o_s,
                "sal_diff": round(float(o_s - m_s), 2)
            })

        observations.append({
            "id": p["id"],
            "platform_type": p["type"],
            "name": p["name"],
            "lat": plat_lat,
            "lon": plat_lon,
            "depth": depth,
            "time": TIMESTAMPS[time_idx],
            "observed_temperature": observed_temp,
            "model_temperature": model_temp,
            "temperature_difference": temp_difference,
            "observed_salinity": observed_sal,
            "model_salinity": model_sal,
            "salinity_difference": sal_difference,
            "quality_flag": q_flag,
            "quality_code": q_code,
            "depth_profile": depth_profile,
            "source": "In-situ Ocean Observation (Demo)",
        })
        
    return observations

def calculate_validation_metrics(observations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculate scientific validation statistics:
    - MAE (Mean Absolute Error): sum(|Obs - Model|) / N
    - RMSE (Root Mean Square Error): sqrt(sum((Obs - Model)^2) / N)
    - Mean Bias: sum(Obs - Model) / N
    - Pearson Correlation (r)
    - Error distribution bins (-2 to +2 °C)
    """
    if not observations:
        return {
            "count": 0,
            "mae": 0.0,
            "rmse": 0.0,
            "mean_bias": 0.0,
            "correlation": 0.0,
            "histogram": []
        }
        
    diffs = np.array([o["temperature_difference"] for o in observations], dtype=float)
    obs_vals = np.array([o["observed_temperature"] for o in observations], dtype=float)
    mod_vals = np.array([o["model_temperature"] for o in observations], dtype=float)
    
    mae = float(np.mean(np.abs(diffs)))
    rmse = float(np.sqrt(np.mean(diffs**2)))
    bias = float(np.mean(diffs))
    
    # Correlation
    if len(obs_vals) > 1 and np.std(obs_vals) > 0 and np.std(mod_vals) > 0:
        corr = float(np.corrcoef(obs_vals, mod_vals)[0, 1])
    else:
        corr = 1.0

    # Error distribution histogram between -2.0 and +2.0
    bins = [-2.0, -1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0]
    hist, bin_edges = np.histogram(diffs, bins=bins)
    
    histogram = []
    for i in range(len(hist)):
        label = f"{bin_edges[i]:+.1f} to {bin_edges[i+1]:+.1f}°C"
        histogram.append({
            "range": label,
            "count": int(hist[i]),
            "min": float(bin_edges[i]),
            "max": float(bin_edges[i+1])
        })
        
    return {
        "count": len(observations),
        "mae": round(mae, 3),
        "rmse": round(rmse, 3),
        "mean_bias": round(bias, 3),
        "correlation": round(corr, 3),
        "histogram": histogram
    }
