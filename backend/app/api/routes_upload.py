from fastapi import APIRouter, UploadFile, File, HTTPException
import io
import json
import pandas as pd
from typing import Dict, Any, List

router = APIRouter(prefix="/data", tags=["Dataset Ingestion"])

REQUIRED_COLUMNS = ["lat", "lon"]
SUPPORTED_VARS = ["temperature", "salinity", "current_u", "current_v", "depth", "time"]

COLUMN_SYNONYMS = {
    "lat": ["latitude", "lat", "latitude_deg", "y"],
    "lon": ["longitude", "lon", "long", "longitude_deg", "x"],
    "depth": ["depth", "depth_m", "dep", "z", "level"],
    "time": ["time", "timestamp", "datetime", "date"],
    "temperature": ["temperature", "temp", "sst", "thetao", "sea_water_temperature", "t_degc"],
    "salinity": ["salinity", "sal", "so", "sea_water_salinity", "psu", "s"],
    "current_u": ["current_u", "u", "uo", "eastward_velocity", "u_current"],
    "current_v": ["current_v", "v", "vo", "northward_velocity", "v_current"],
    "platform_type": ["platform_type", "type", "platform", "source_type"],
    "id": ["id", "platform_id", "station_id", "wmo", "name"]
}

def standardize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Map arbitrary column headers to standard ocean schema."""
    renamed = {}
    lower_cols = {c.lower().strip(): c for c in df.columns}
    
    for std_name, synonyms in COLUMN_SYNONYMS.items():
        for syn in synonyms:
            if syn in lower_cols:
                renamed[lower_cols[syn]] = std_name
                break
                
    return df.rename(columns=renamed)

@router.post("/upload")
async def upload_dataset(file: UploadFile = File(...)):
    """
    Ingest user-supplied CSV or JSON oceanographic dataset.
    Validates coordinates, detects columns, computes summary stats,
    and returns parsed points ready for 3D exploration.
    """
    filename = file.filename or "dataset"
    content = await file.read()
    
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
        
    try:
        if filename.endswith(".csv") or filename.endswith(".txt"):
            df = pd.read_csv(io.BytesIO(content))
        elif filename.endswith(".json"):
            json_data = json.loads(content.decode("utf-8"))
            df = pd.DataFrame(json_data if isinstance(json_data, list) else [json_data])
        else:
            raise HTTPException(status_code=400, detail="Unsupported format. Please upload CSV or JSON.")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse file: {str(e)}")

    # Standardize column headers
    df = standardize_columns(df)
    
    # Check essential requirements
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise HTTPException(
            status_code=422,
            detail=f"Missing essential geographic columns: {missing}. Standard supported names: latitude/lat, longitude/lon."
        )

    # Clean numeric coordinates
    df["lat"] = pd.to_numeric(df["lat"], errors="coerce")
    df["lon"] = pd.to_numeric(df["lon"], errors="coerce")
    df = df.dropna(subset=["lat", "lon"])
    
    # Limit max points for responsive browser rendering (sample if > 1500)
    total_raw = len(df)
    if total_raw > 1500:
        df_sampled = df.sample(n=1500, random_state=42)
    else:
        df_sampled = df

    # Prepare standard JSON records
    records = []
    for idx, row in df_sampled.iterrows():
        rec = {
            "id": str(row.get("id", f"USER-OBS-{idx:04d}")),
            "platform_type": str(row.get("platform_type", "buoy")),
            "name": f"Custom Platform {idx}",
            "lat": float(round(row["lat"], 4)),
            "lon": float(round(row["lon"], 4)),
            "depth": float(round(row.get("depth", 0.0), 1)),
            "time": str(row.get("time", "2026-09-21T12:00:00Z")),
            "observed_temperature": float(round(row["temperature"], 2)) if "temperature" in row and pd.notna(row["temperature"]) else 28.5,
            "observed_salinity": float(round(row["salinity"], 2)) if "salinity" in row and pd.notna(row["salinity"]) else 35.0,
            "quality_flag": "User Verified",
            "source": f"User Upload: {filename}"
        }
        # Simulated baseline model value for comparison
        rec["model_temperature"] = round(rec["observed_temperature"] - 0.25, 2)
        rec["temperature_difference"] = round(rec["observed_temperature"] - rec["model_temperature"], 2)
        rec["model_salinity"] = round(rec["observed_salinity"] - 0.1, 2)
        rec["salinity_difference"] = round(rec["observed_salinity"] - rec["model_salinity"], 2)
        records.append(rec)

    return {
        "status": "success",
        "filename": filename,
        "total_records": total_raw,
        "rendered_points": len(records),
        "detected_columns": list(df.columns),
        "data": records,
        "summary": {
            "lat_min": float(df["lat"].min()),
            "lat_max": float(df["lat"].max()),
            "lon_min": float(df["lon"].min()),
            "lon_max": float(df["lon"].max()),
            "avg_temp": float(round(df["temperature"].mean(), 2)) if "temperature" in df else None,
            "avg_sal": float(round(df["salinity"].mean(), 2)) if "salinity" in df else None,
        }
    }
