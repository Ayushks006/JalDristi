from fastapi import APIRouter, Query
from typing import Optional, List, Dict, Any
from app.core.scientific import (
    generate_indian_ocean_model_grid,
    generate_indian_ocean_observations,
    calculate_validation_metrics,
    STANDARD_DEPTHS,
    TIMESTAMPS
)

router = APIRouter(prefix="/ocean", tags=["Ocean Data"])

@router.get("/config")
def get_ocean_config():
    """Returns available depth levels, timestamps, and regions."""
    return {
        "depths": STANDARD_DEPTHS,
        "timestamps": TIMESTAMPS,
        "variables": [
            {"id": "temperature", "name": "Temperature", "unit": "°C", "min": 5.0, "max": 32.0},
            {"id": "salinity", "name": "Salinity", "unit": "PSU", "min": 31.0, "max": 37.0},
            {"id": "current_speed", "name": "Current Speed", "unit": "m/s", "min": 0.0, "max": 2.5},
            {"id": "current_direction", "name": "Current Direction", "unit": "°", "min": 0, "max": 360},
        ],
        "regions": [
            {"id": "indian_ocean", "name": "All Indian Ocean", "lat": 6.0, "lon": 76.0, "zoom": 5000000},
            {"id": "arabian_sea", "name": "Arabian Sea", "lat": 15.0, "lon": 65.0, "zoom": 2500000},
            {"id": "bay_of_bengal", "name": "Bay of Bengal", "lat": 14.0, "lon": 87.0, "zoom": 2500000},
            {"id": "equatorial_io", "name": "Equatorial Indian Ocean", "lat": 0.0, "lon": 78.0, "zoom": 3500000},
            {"id": "south_io", "name": "South Indian Ocean", "lat": -8.0, "lon": 70.0, "zoom": 3500000},
        ]
    }

@router.get("/model")
def get_numerical_model(
    depth: float = Query(0, description="Depth level in meters"),
    time_idx: int = Query(0, description="Time index (0 to 5)"),
    variable: str = Query("temperature", description="Variable to query")
):
    """Retrieve 2D numerical ocean model slice at selected depth and time."""
    time_idx = max(0, min(time_idx, len(TIMESTAMPS) - 1))
    grid = generate_indian_ocean_model_grid(depth=depth, time_idx=time_idx)
    return {
        "depth": depth,
        "time": TIMESTAMPS[time_idx],
        "count": len(grid),
        "variable": variable,
        "data": grid,
        "is_demo": True,
        "dataset_name": "Indian Ocean High-Res Numerical Model (Demo)"
    }

@router.get("/observations")
def get_observations(
    depth: float = Query(0, description="Depth level in meters"),
    time_idx: int = Query(0, description="Time index (0 to 5)"),
    platform_type: Optional[str] = Query(None, description="Filter: argo, buoy, vessel, station")
):
    """Retrieve in-situ observations with co-located model predictions and CTD profiles."""
    time_idx = max(0, min(time_idx, len(TIMESTAMPS) - 1))
    obs = generate_indian_ocean_observations(depth=depth, time_idx=time_idx)
    
    if platform_type:
        obs = [o for o in obs if o["platform_type"].lower() == platform_type.lower()]
        
    return {
        "depth": depth,
        "time": TIMESTAMPS[time_idx],
        "count": len(obs),
        "data": obs,
        "is_demo": True,
        "dataset_name": "In-situ Ocean Platforms (Argo, RAMA, OMNI, RVs)"
    }

@router.get("/validation")
def get_validation_stats(
    depth: float = Query(0, description="Depth level in meters"),
    time_idx: int = Query(0, description="Time index (0 to 5)")
):
    """Calculate validation metrics between numerical model and in-situ observations."""
    time_idx = max(0, min(time_idx, len(TIMESTAMPS) - 1))
    obs = generate_indian_ocean_observations(depth=depth, time_idx=time_idx)
    metrics = calculate_validation_metrics(obs)
    metrics["depth"] = depth
    metrics["time"] = TIMESTAMPS[time_idx]
    metrics["formula_reference"] = {
        "MAE": "Mean Absolute Error: sum(|Observed - Model|) / N",
        "RMSE": "Root Mean Square Error: sqrt(sum((Observed - Model)^2) / N)",
        "Mean_Bias": "Mean Discrepancy: sum(Observed - Model) / N"
    }
    return metrics

@router.get("/stats")
def get_summary_statistics(
    depth: float = Query(0, description="Depth level in meters"),
    time_idx: int = Query(0, description="Time index (0 to 5)")
):
    """Summary metrics for the dashboard header/footer stats bar."""
    time_idx = max(0, min(time_idx, len(TIMESTAMPS) - 1))
    grid = generate_indian_ocean_model_grid(depth=depth, time_idx=time_idx)
    obs = generate_indian_ocean_observations(depth=depth, time_idx=time_idx)
    metrics = calculate_validation_metrics(obs)
    
    avg_temp = round(sum(g["temperature"] for g in grid) / len(grid), 1) if grid else 28.0
    avg_sal = round(sum(g["salinity"] for g in grid) / len(grid), 2) if grid else 35.0
    
    return {
        "observation_count": len(obs),
        "model_point_count": len(grid),
        "average_temperature": avg_temp,
        "average_salinity": avg_sal,
        "mae": metrics["mae"],
        "rmse": metrics["rmse"],
        "mean_bias": metrics["mean_bias"],
        "last_update": TIMESTAMPS[time_idx],
        "status": "Operational",
        "active_data_source": "Demo Dataset (Indian Ocean Prototype)"
    }
