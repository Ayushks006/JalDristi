# JalDristi
### Interactive 3D Ocean Intelligence & Visualization Platform
**Smart India Hackathon (SIH 2026) Prototype**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-6.x-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![CesiumJS](https://img.shields.io/badge/CesiumJS-1.125-00BFFF?logo=cesium&logoColor=white)](https://cesium.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://python.org/)

---

## 1. Problem Statement & Background

### Official SIH Problem Statement
> **"Develop a web-based interactive 3D visualization platform that integrates numerical ocean model outputs and in-situ observations."**

### Problem Description
Marine research institutes, national oceanographic bodies (e.g., INCOIS, MoES, NOAA), and climate researchers face a fundamental operational challenge: **oceanographic data is severely fragmented**.
- **Numerical Ocean Circulation Models** (e.g., HYCOM, ROMS, MOM6, INCOIS-GODAS) generate continuous, high-dimensional 4D gridded forecasts (temperature, salinity, currents, water density) across latitude, longitude, depth, and time.
- **In-Situ Observational Systems** (autonomous Argo profiling floats, moored RAMA/OMNI buoys, research vessels, and coastal tide gauges) record discrete, sparse, high-accuracy ground-truth measurements.
- Traditional oceanographic tools (static Python/Jupyter scripts, Ferret, Panoply) lack fluid 3D/4D spatial interaction, making simultaneous co-location, model-vs-observation comparison, and anomaly detection slow and disjointed.

---

## 2. The Solution: JalDristi

**JalDristi** (*जल दृष्टि* — Ocean Sight) is an open-source, web-based 3D ocean intelligence platform engineered to bridge numerical model outputs with real-world in-situ observations on an interactive 3D Earth globe across space, depth, and time.

### Core Capabilities
1. **Interactive 3D Earth Globe**: Realistic Earth satellite imagery (ESRI World Imagery) showing all global continents, ocean basins, atmospheric glow, solar day/night shading, and multiple basemap styles (Satellite, Bathymetry, Dark Ocean, Topographic).
2. **Multi-Variable Exploration**: Sea Surface Temperature (SST, °C), Salinity (PSU), Current Speed (m/s), and Current Direction.
3. **4D Spatio-Temporal Navigation**: Water depth slider from surface (0 m) down to 500 m with animated sonar transitions, paired with an interactive 4D time-lapse playback controller.
4. **Ocean Dynamics (Currents Layer)**: Geographically projected particle streamlines advecting in real-time across the globe driven by ocean surface and sub-surface $u, v$ velocity vectors.
5. **Automated Co-Location & Validation**: Real-time statistical engine calculating **MAE (Mean Absolute Error)**, **RMSE (Root Mean Square Error)**, **Mean Bias**, and **Pearson Correlation ($r$)**.
6. **Diverging Anomaly Layer**: Color-graded error visualization (-2°C to +2°C) highlighting numerical forecast biases.
7. **In-Situ Platforms & CTD Vertical Profiling**: Clickable observation platforms (Argo floats with drift trajectory simulation, RAMA/OMNI moored buoys, research vessels) displaying interactive temperature and salinity vs. depth profiles and depth cross-sections.
8. **"Ask JalDristi" NLP Console**: Local, in-browser natural-language query parser understanding spatio-temporal and oceanographic commands with zero paid API dependencies.
9. **Custom Data Ingestion**: Drag-and-drop CSV and JSON parser with auto-column mapping and instant 3D projection.
10. **Zero Paid Dependencies & Full Client Fallback**: Operates fully offline or standalone via high-fidelity Indian Ocean simulations and connects seamlessly to live FastAPI backends or public NOAA ERDDAP gateways.

---

## 3. System Architecture

```
                               ┌────────────────────────────────────────────────────────┐
                               │                       JalDristi                        │
                               │           (SIH 2026 Web-Based 4D Platform)             │
                               └──────────────────────────┬─────────────────────────────┘
                                                          │
                   ┌──────────────────────────────────────┴──────────────────────────────────────┐
                   ▼                                                                            ▼
┌──────────────────────────────────────┐                                     ┌─────────────────────────────────────┐
│          Frontend (Client)           │                                     │          Backend (API Server)       │
│  • React 18 + Vite 6                 │                                     │  • Python 3.10+ / 3.13 + FastAPI    │
│  • CesiumJS 3D/2D Earth Engine       │                                     │  • NumPy, Pandas, xarray            │
│  • Tailwind CSS Glassmorphism        │                                     │  • NOAA ERDDAP Proxy & Parser       │
│  • Recharts / Canvas CTD Profiles    │                                     │  • CSV / JSON Data Ingestion        │
│  • Vector Particle Current Advection │                                     │  • Model vs Observation Math Engine │
│  • "Ask JalDristi" Local NLP Engine  │                                     │  • Uvicorn ASGI Server              │
└──────────────────────────────────────┘                                     └─────────────────────────────────────┘
```

---

## 4. Technology Stack

### Frontend
- **Framework**: React 18 with Vite 6
- **3D / 2D Globe Engine**: CesiumJS 1.125
- **Styling**: Tailwind CSS with custom deep navy and cyan glow glassmorphism
- **Charts & Visualizations**: Recharts & HTML5 2D Canvas Streamlines
- **Icons**: Lucide React
- **HTTP Client**: Native Fetch API with timeout fallbacks & `VITE_API_URL` support

### Backend
- **Framework**: Python 3.10+ with FastAPI
- **ASGI Server**: Uvicorn
- **Scientific Computing**: NumPy, Pandas, xarray
- **Network & Validation**: HTTPX, Pydantic v2, Python-Multipart

### Data Protocols & Formats
- NetCDF-4, CSV, JSON
- NOAA ERDDAP 2.23 protocol
- Open Basemaps: ESRI World Imagery, ESRI Ocean Bathymetry, CartoDB Dark Matter, OpenStreetMap

---

## 5. Mathematical & Scientific Formulation

### 1. Mean Absolute Error (MAE)
$$\text{MAE} = \frac{1}{N} \sum_{i=1}^{N} \left| \text{Observed}_i - \text{Model}_i \right|$$

### 2. Root Mean Square Error (RMSE)
$$\text{RMSE} = \sqrt{\frac{1}{N} \sum_{i=1}^{N} \left( \text{Observed}_i - \text{Model}_i \right)^2}$$

### 3. Mean Bias Error
$$\text{Bias} = \frac{1}{N} \sum_{i=1}^{N} \left( \text{Observed}_i - \text{Model}_i \right)$$

### 4. Ocean Current Speed & Direction
$$\text{Speed} = \sqrt{u^2 + v^2} \quad (\text{m/s})$$
$$\theta = \left( \text{atan2}(u, v) \times \frac{180}{\pi} + 360 \right) \pmod{360} \quad (\text{degrees})$$

---

## 6. Directory Structure

```
JalDristi/
├── .github/
│   └── workflows/
│       └── deploy-pages.yml                 # Automated GitHub Pages CI/CD workflow
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── 3d/
│   │   │   │   ├── GlobeViewer.jsx          # Cesium 3D/2D Earth viewer & basemap switcher
│   │   │   │   └── CurrentParticleCanvas.jsx # Vector streamline particle advection
│   │   │   ├── panels/
│   │   │   │   ├── SidebarNav.jsx           # Left navigation bar
│   │   │   │   ├── ControlPanel.jsx         # Layer toggles & variable selector
│   │   │   │   ├── ObservationDetail.jsx    # CTD profile & depth ladder drawer
│   │   │   │   ├── ModelValidation.jsx      # Scientific validation dashboard
│   │   │   │   ├── AnalyticsPanel.jsx       # Basin-scale zonal analytics
│   │   │   │   ├── AskJalDristi.jsx         # Local NLP query console
│   │   │   │   ├── UploadModal.jsx          # Dataset upload & parser
│   │   │   │   ├── LocationInspectCard.jsx  # Globe click inspector
│   │   │   │   ├── DataSourcesPanel.jsx     # ERDDAP & Argo reference
│   │   │   │   └── AboutModal.jsx           # SIH project overview
│   │   │   ├── controls/
│   │   │   │   ├── DepthSlider.jsx          # 0m to 500m depth slider
│   │   │   │   ├── DepthTransitionOverlay.jsx # Water column descent sonar scan
│   │   │   │   ├── TimeController.jsx       # 4D timeline with play/pause
│   │   │   │   ├── SearchBar.jsx            # Coords & platform search
│   │   │   │   └── DemoStoryTour.jsx        # 10-step hackathon judges tour
│   │   │   └── common/
│   │   │       ├── Header.jsx               # Top header bar
│   │   │       ├── StatsBar.jsx             # Bottom live telemetry bar
│   │   │       └── LandingHero.jsx          # Welcome hero modal
│   │   ├── services/
│   │   │   ├── colorScales.js               # Turbo, Haline & Anomaly scales
│   │   │   ├── demoDataGenerator.js         # High-fidelity Indian Ocean simulation
│   │   │   ├── oceanDataService.js          # Multi-source data broker
│   │   │   ├── validationMetrics.js         # MAE, RMSE, Bias calculator
│   │   │   └── nlpQueryParser.js            # Offline NLP query engine
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── package.json
│   ├── .env.example
│   ├── vite.config.js
│   └── tailwind.config.js
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes_ocean.py              # Model, observations, validation
│   │   │   ├── routes_erddap.py             # Public ERDDAP gateway
│   │   │   └── routes_upload.py             # CSV / JSON ingestion
│   │   ├── core/
│   │   │   ├── config.py
│   │   │   └── scientific.py                # NumPy/Pandas/xarray algorithms
│   │   └── main.py                          # FastAPI application
│   ├── requirements.txt
│   └── run_server.py
├── sample_data/
│   ├── sample_argo_profiles.csv             # Ready-to-test Argo CSV
│   └── sample_buoy_timeseries.csv           # Ready-to-test Buoy CSV
├── start_backend.bat                        # Portable 1-click Windows backend launcher
├── start_frontend.bat                       # Portable 1-click Windows frontend launcher
├── start_all.bat                            # Master 1-click full-stack launcher
├── .gitignore                               # Comprehensive root gitignore
├── LICENSE                                  # MIT License
└── README.md
```

---

## 7. Installation & Quick Start

### Prerequisites
- Node.js (v18+ or v20+)
- Python (3.10+)

### Running Locally (1-Click on Windows)
Double-click `start_all.bat` in the project root directory:
```powershell
.\start_all.bat
```
This launches both the FastAPI backend and React frontend and opens your default browser at `http://localhost:5173`.

---

### Manual Setup Instructions

#### 1. Backend Setup
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate   # On Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
python run_server.py
```
Backend API will be live at `http://127.0.0.1:8000`. Interactive documentation: `http://127.0.0.1:8000/docs`.

#### 2. Frontend Setup
```powershell
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 8. Hackathon Demonstration Guide (for Judges)

When presenting to evaluators, click the golden **"DEMO MODE"** button in the header or sidebar to trigger the automated guided tour:

1. **Step 1 — Explore Numerical Ocean Model**:
   Observes continuous sea surface temperature field across the Indian Ocean (Arabian Sea, Bay of Bengal, and Equatorial zone) with realistic upwelling along the western coast.
2. **Step 2 — Overlay In-Situ Platforms**:
   Synchronizes real autonomous platforms: Argo profiling floats (cyan pulsing circles), RAMA & INCOIS OMNI moored buoys (amber diamonds), research vessels (magenta), and coastal stations (emerald).
3. **Step 3 — Inspect Platform Telemetry**:
   Targets buoy `BUOY-OMNI-AD07` in the Arabian Sea, showing co-located observed vs. model temperatures ($+0.32^\circ\text{C}$ difference).
4. **Step 4 — CTD Vertical Profiles**:
   Inspects the temperature and salinity vs. depth curves from surface down to 500m depth, highlighting the ocean thermocline.
5. **Step 5 — Diverging Anomaly Layer**:
   Enables the model error layer (-2°C to +2°C) with diverging color gradients (blue: cool bias, red: warm bias, green: optimal agreement).
6. **Step 6 — 3D Sub-surface Depth Slices**:
   Moves depth slider to 100m, revealing deep cold water circulation and sub-surface current jets with animated sonar descent.
7. **Step 7 — Ocean Dynamics (Currents Layer)**:
   Enables dynamic particle streamlines advecting according to actual vector velocity ($u, v$) on the 3D globe.
8. **Step 8 — 4D Temporal Evolution**:
   Starts continuous 4D time playback across late September 2026, visualizing eddy propagation and platform drift.
9. **Step 9 — "Ask JalDristi" Natural Language Query**:
   Executes offline conversational queries (e.g., *"Show temperature at 100m"*, *"Show Argo floats"*, *"Show model error"*).

---

## 9. Natural Language Query Examples ("Ask JalDristi")

Test the built-in offline NLP engine by typing any of the following into the search bar or "Ask JalDristi" console:
- `"Show temperature at 100 m"`
- `"Show salinity"`
- `"Show model error"`
- `"Show currents"`
- `"Show observations near 12N 72E"`
- `"Show Arabian Sea buoys"`
- `"Show Argo floats"`

---

## 10. License & Team

Developed for the **Smart India Hackathon 2026 (SIH 2026)**.
- **Repository**: [https://github.com/Ayushks006/JalDristi](https://github.com/Ayushks006/JalDristi)
- **License**: [MIT](LICENSE)
