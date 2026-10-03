import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { getColorForValue, getVariableBounds } from '../../services/colorScales';
import { Compass, RotateCcw, ZoomIn, ZoomOut, Layers, Globe, Navigation2, Sun, Moon, Map } from 'lucide-react';

// Free open basemap imagery providers (Zero API keys required!)
const BASEMAPS = {
  satellite: {
    id: 'satellite',
    name: 'Realistic Earth Satellite',
    label: 'Satellite (True Earth)',
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    credit: 'ESRI, Maxar, Earthstar Geographics'
  },
  esriOcean: {
    id: 'esriOcean',
    name: 'ESRI Ocean Bathymetry',
    label: 'Ocean Bathymetry',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
    credit: 'ESRI, GEBCO, NOAA, National Geographic'
  },
  cartoDark: {
    id: 'cartoDark',
    name: 'CartoDB Dark Ocean',
    label: 'Dark Ocean',
    url: 'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
    credit: 'CartoDB & OpenStreetMap'
  },
  topo: {
    id: 'topo',
    name: 'Topographic World',
    label: 'Topographic',
    url: 'https://services.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    credit: 'ESRI & USGS'
  }
};

export default function GlobeViewer({
  modelData = [],
  observations = [],
  variable = 'temperature',
  depth = 0,
  layers = { model: true, observations: true, difference: false, currents: false, depth3D: false },
  viewMode = '3D', // '3D' | '2D'
  onSelectObservation,
  onLocationClick,
  targetLocation = null,
  activeFilter = null,
  selectedObservation = null,
  onViewerReady = null
}) {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const primitivesRef = useRef({
    modelPoints: null,
    obsEntities: [],
    depthColumns: [],
    selectedHalo: null
  });

  const [isLoading, setIsLoading] = useState(true);
  const [hoveredEntity, setHoveredEntity] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [activeBasemap, setActiveBasemap] = useState('satellite');
  const [sunLighting, setSunLighting] = useState(false);
  const [showBasemapMenu, setShowBasemapMenu] = useState(false);

  // Initialize Cesium Viewer once
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    // Disables Ion warning tokens
    Cesium.Ion.defaultAccessToken = '';

    const provider = new Cesium.UrlTemplateImageryProvider({
      url: BASEMAPS.satellite.url,
      maximumLevel: 12,
      credit: BASEMAPS.satellite.credit
    });

    const viewer = new Cesium.Viewer(containerRef.current, {
      imageryProvider: provider,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      sceneModePicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      infoBox: false,
      selectionIndicator: false,
      shouldAnimate: true,
      contextOptions: {
        webgl: {
          alpha: true,
          preserveDrawingBuffer: true
        }
      }
    });

    // Configure realistic Earth environment
    const scene = viewer.scene;
    scene.globe.baseColor = Cesium.Color.fromCssColorString('#020617');
    scene.globe.enableLighting = false;
    scene.globe.depthTestAgainstTerrain = false;
    scene.globe.showGroundAtmosphere = true;

    if (scene.skyAtmosphere) {
      scene.skyAtmosphere.show = true;
      scene.skyAtmosphere.brightnessShift = 0.05;
      scene.skyAtmosphere.saturationShift = 0.2;
    }

    // Default camera focus on the Indian Ocean basin with smooth view
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(77.0, 8.0, 7500000),
      orientation: {
        heading: Cesium.Math.toRadians(0),
        pitch: Cesium.Math.toRadians(-88),
        roll: 0
      },
      duration: 1.8
    });

    viewerRef.current = viewer;
    setIsLoading(false);

    if (onViewerReady) {
      onViewerReady(viewer);
    }

    // Setup raycast click and hover handlers
    const handler = new Cesium.ScreenSpaceEventHandler(scene.canvas);

    // Click on globe
    handler.setInputAction((movement) => {
      const pickedObject = scene.pick(movement.position);

      if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id._obsData) {
        if (onSelectObservation) onSelectObservation(pickedObject.id._obsData);
        return;
      }

      // If clicked on water/globe, compute coordinates
      const ray = viewer.camera.getPickRay(movement.position);
      const cartesian = scene.globe.pick(ray, scene);
      if (cartesian) {
        const cartographic = Cesium.Cartographic.fromCartesian(cartesian);
        const lat = Number(Cesium.Math.toDegrees(cartographic.latitude).toFixed(3));
        const lon = Number(Cesium.Math.toDegrees(cartographic.longitude).toFixed(3));

        if (onLocationClick) {
          onLocationClick({ lat, lon });
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    // Hover tooltip
    handler.setInputAction((movement) => {
      const pickedObject = scene.pick(movement.endPosition);
      if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id._obsData) {
        setHoveredEntity(pickedObject.id._obsData);
        setTooltipPos({ x: movement.endPosition.x + 12, y: movement.endPosition.y + 12 });
      } else {
        setHoveredEntity(null);
      }
    }, Cesium.ScreenSpaceEventType.MOUSE_MOVE);

    return () => {
      handler.destroy();
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []);

  // Handle Basemap Switcher
  const handleSwitchBasemap = (key) => {
    if (!viewerRef.current || !BASEMAPS[key]) return;
    const viewer = viewerRef.current;
    const layers = viewer.imageryLayers;
    layers.removeAll();
    const provider = new Cesium.UrlTemplateImageryProvider({
      url: BASEMAPS[key].url,
      maximumLevel: 12,
      credit: BASEMAPS[key].credit
    });
    layers.addImageryProvider(provider);
    setActiveBasemap(key);
    setShowBasemapMenu(false);
  };

  // Handle Sun Lighting Toggle
  const handleToggleSunLighting = () => {
    if (!viewerRef.current) return;
    const next = !sunLighting;
    viewerRef.current.scene.globe.enableLighting = next;
    setSunLighting(next);
  };

  // Camera Navigation Actions (Requirement 5)
  const flyToGlobalView = () => {
    if (!viewerRef.current) return;
    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(75.0, 12.0, 22000000),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0
      },
      duration: 2.0
    });
  };

  const flyToIndianOcean = () => {
    if (!viewerRef.current) return;
    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(77.0, 8.0, 7500000),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-88),
        roll: 0
      },
      duration: 1.8
    });
  };

  const flyToSelectedRegion = () => {
    if (!viewerRef.current) return;
    const lon = targetLocation?.lon ?? (selectedObservation ? selectedObservation.lon : 72.0);
    const lat = targetLocation?.lat ?? (selectedObservation ? selectedObservation.lat : 14.0);
    const zoom = targetLocation?.zoom ?? 3000000;
    viewerRef.current.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(lon, lat, zoom),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-85),
        roll: 0
      },
      duration: 1.8
    });
  };

  const handleZoomIn = () => {
    if (!viewerRef.current) return;
    viewerRef.current.camera.zoomIn(1500000);
  };

  const handleZoomOut = () => {
    if (!viewerRef.current) return;
    viewerRef.current.camera.zoomOut(1500000);
  };

  // Handle 2D vs 3D View Mode Morphing
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const scene = viewer.scene;

    if (viewMode === '2D' && scene.mode !== Cesium.SceneMode.SCENE2D) {
      scene.morphTo2D(1.0);
    } else if (viewMode === '3D' && scene.mode !== Cesium.SceneMode.SCENE3D) {
      scene.morphTo3D(1.0);
    }
  }, [viewMode]);

  // Handle Fly-To navigation commands
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !targetLocation) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        targetLocation.lon,
        targetLocation.lat,
        targetLocation.zoom || 2800000
      ),
      duration: 1.8
    });
  }, [targetLocation]);

  // Render Numerical Model Grid Layer as Continuous Spatial Ocean Field (Requirement 11)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;
    const scene = viewer.scene;

    // Remove previous model primitives
    if (primitivesRef.current.modelPoints) {
      scene.primitives.remove(primitivesRef.current.modelPoints);
      primitivesRef.current.modelPoints = null;
    }

    if (!layers.model || !modelData || modelData.length === 0) return;

    const pointCollection = new Cesium.PointPrimitiveCollection();
    const bounds = getVariableBounds(variable, depth);

    modelData.forEach((pt) => {
      let val = pt[variable];
      if (layers.difference && pt.temperature_difference !== undefined) {
        val = pt.temperature_difference;
      }
      if (val === undefined || val === null) val = pt.temperature;

      const varForColor = layers.difference ? 'difference' : variable;
      const col = getColorForValue(varForColor, val, bounds.min, bounds.max, 0.72);

      // Render with smooth blended footprint for continuous ocean surface field
      pointCollection.add({
        position: Cesium.Cartesian3.fromDegrees(pt.lon, pt.lat, 1200),
        pixelSize: 26,
        color: Cesium.Color.fromRgba((col.r << 24) | (col.g << 16) | (col.b << 8) | Math.round(col.alpha * 255)),
        outlineColor: Cesium.Color.fromRgba((col.r << 24) | (col.g << 16) | (col.b << 8) | 70),
        outlineWidth: 4.0,
      });
    });

    scene.primitives.add(pointCollection);
    primitivesRef.current.modelPoints = pointCollection;
  }, [modelData, variable, depth, layers.model, layers.difference]);

  // Render In-Situ Observation Markers (Requirement 12)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    // Remove existing observation entities
    primitivesRef.current.obsEntities.forEach(ent => viewer.entities.remove(ent));
    primitivesRef.current.obsEntities = [];

    if (!layers.observations || !observations || observations.length === 0) return;

    observations.forEach((obs) => {
      const isSelected = selectedObservation && selectedObservation.id === obs.id;

      // Platform styling with distinct scientific glyphs
      let markerColor = '#00f2fe';
      let iconSvg = '';

      if (obs.platform_type === 'argo') {
        // Argo: Glowing circular ring
        markerColor = '#00f2fe';
        iconSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="17" fill="${markerColor}" fill-opacity="${isSelected ? 0.45 : 0.2}" stroke="${markerColor}" stroke-width="${isSelected ? 2.5 : 1.5}" stroke-dasharray="2 2" />
            <circle cx="20" cy="20" r="8" fill="${markerColor}" stroke="#ffffff" stroke-width="2" />
            <circle cx="20" cy="20" r="3" fill="#ffffff" />
          </svg>
        `;
      } else if (obs.platform_type === 'buoy') {
        // Moored Buoy: Glowing diamond
        markerColor = '#f59e0b';
        iconSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,4 36,20 20,36 4,20" fill="${markerColor}" fill-opacity="${isSelected ? 0.45 : 0.2}" stroke="${markerColor}" stroke-width="${isSelected ? 2.5 : 1.5}" stroke-dasharray="2 2" />
            <polygon points="20,10 30,20 20,30 10,20" fill="${markerColor}" stroke="#ffffff" stroke-width="2" />
            <circle cx="20" cy="20" r="3" fill="#ffffff" />
          </svg>
        `;
      } else if (obs.platform_type === 'vessel') {
        // Research Vessel: Glowing triangle
        markerColor = '#ec4899';
        iconSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <polygon points="20,5 37,34 3,34" fill="${markerColor}" fill-opacity="${isSelected ? 0.45 : 0.2}" stroke="${markerColor}" stroke-width="${isSelected ? 2.5 : 1.5}" />
            <polygon points="20,13 31,31 9,31" fill="${markerColor}" stroke="#ffffff" stroke-width="2" />
            <circle cx="20" cy="24" r="3" fill="#ffffff" />
          </svg>
        `;
      } else {
        // Coastal Marine Station: Glowing square
        markerColor = '#10b981';
        iconSvg = `
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
            <rect x="5" y="5" width="30" height="30" rx="3" fill="${markerColor}" fill-opacity="${isSelected ? 0.45 : 0.2}" stroke="${markerColor}" stroke-width="${isSelected ? 2.5 : 1.5}" stroke-dasharray="2 2" />
            <rect x="11" y="11" width="18" height="18" rx="2" fill="${markerColor}" stroke="#ffffff" stroke-width="2" />
            <circle cx="20" cy="20" r="3" fill="#ffffff" />
          </svg>
        `;
      }

      // If difference layer is active, color markers by delta
      if (layers.difference) {
        const diffVal = obs.temperature_difference || 0;
        const col = getColorForValue('difference', diffVal, -2.0, 2.0);
        markerColor = col.hex;
      }

      const entity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(obs.lon, obs.lat, 3500),
        billboard: {
          image: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(iconSvg),
          verticalOrigin: Cesium.VerticalOrigin.CENTER,
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          width: isSelected ? 42 : 32,
          height: isSelected ? 42 : 32,
          scaleByDistance: new Cesium.NearFarScalar(1.5e6, 1.3, 1.5e7, 0.65)
        },
        label: {
          text: obs.id.split('-').slice(0, 2).join('-'),
          font: isSelected ? 'bold 11px JetBrains Mono, monospace' : '10px JetBrains Mono, monospace',
          fillColor: isSelected ? Cesium.Color.fromCssColorString('#38bdf8') : Cesium.Color.fromCssColorString('#e2e8f0'),
          outlineColor: Cesium.Color.fromCssColorString('#020617'),
          outlineWidth: 2.5,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -25),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0.0, 4.5e6)
        }
      });

      entity._obsData = obs;
      primitivesRef.current.obsEntities.push(entity);
    });
  }, [observations, layers.observations, layers.difference, variable, depth, selectedObservation]);

  // Render 3D Depth Columns (3D Depth Mode)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    // Remove existing depth columns
    primitivesRef.current.depthColumns.forEach(ent => viewer.entities.remove(ent));
    primitivesRef.current.depthColumns = [];

    if (!layers.depth3D || !observations || observations.length === 0) return;

    observations.slice(0, 28).forEach((obs) => {
      const heightAbove = 2000;
      const maxExtrusion = 450000;
      const currentDepthExtrusion = (depth / 500.0) * maxExtrusion;

      const columnEntity = viewer.entities.add({
        polyline: {
          positions: [
            Cesium.Cartesian3.fromDegrees(obs.lon, obs.lat, heightAbove),
            Cesium.Cartesian3.fromDegrees(obs.lon, obs.lat, heightAbove + maxExtrusion)
          ],
          width: 2.5,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString('#00f2fe').withAlpha(0.65),
            dashLength: 12.0
          })
        }
      });

      // Depth level indicator sphere
      const sphereEntity = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(obs.lon, obs.lat, heightAbove + currentDepthExtrusion),
        point: {
          pixelSize: 9,
          color: Cesium.Color.fromCssColorString('#38bdf8'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2.0
        }
      });

      primitivesRef.current.depthColumns.push(columnEntity, sphereEntity);
    });
  }, [observations, layers.depth3D, depth]);

  return (
    <div className="relative w-full h-full bg-ocean-950 overflow-hidden select-none">
      {/* Cesium Mount Container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Professional Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-ocean-950/95 backdrop-blur-md flex flex-col items-center justify-center z-50">
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 border-4 border-cyan-glow/20 rounded-full animate-ping"></div>
            <div className="absolute inset-0 border-4 border-t-cyan-glow border-r-cyan-glow border-b-transparent border-l-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-xl font-bold tracking-wider text-cyan-glow font-mono">INITIALIZING JALDRISTI 3D ENGINE</h2>
          <p className="text-xs font-mono text-slate-400 mt-1">Configuring digital Earth & Indian Ocean hydrodynamic datasets...</p>
        </div>
      )}

      {/* Top Left Navigation Bar: GLOBAL VIEW | INDIAN OCEAN | SELECTED REGION (Requirement 5) */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-1 bg-ocean-950/90 backdrop-blur-xl border border-cyan-glow/40 rounded-xl p-1 shadow-2xl">
          <button
            onClick={flyToGlobalView}
            title="Global Earth View"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-slate-200 hover:text-cyan-glow hover:bg-ocean-800/70 transition-all"
          >
            <Globe className="w-3.5 h-3.5 text-cyan-glow" />
            <span>GLOBAL VIEW</span>
          </button>

          <div className="h-4 w-px bg-navy-border" />

          <button
            onClick={flyToIndianOcean}
            title="Focus Indian Ocean Basin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-amber-300 hover:text-amber-200 hover:bg-ocean-800/70 transition-all"
          >
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>INDIAN OCEAN</span>
          </button>

          <div className="h-4 w-px bg-navy-border" />

          <button
            onClick={flyToSelectedRegion}
            title="Fly to Selected Observation / Region"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold text-emerald-300 hover:text-emerald-200 hover:bg-ocean-800/70 transition-all"
          >
            <Navigation2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>SELECTED REGION</span>
          </button>
        </div>

        {/* Second Row: Basemap Switcher & Sun Lighting & Zoom Controls */}
        <div className="flex items-center gap-2">
          {/* Basemap Switcher Menu */}
          <div className="relative">
            <button
              onClick={() => setShowBasemapMenu(!showBasemapMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-ocean-950/90 backdrop-blur-md border border-navy-border hover:border-cyan-glow/40 text-xs font-mono text-slate-300 hover:text-cyan-glow transition-all shadow-md"
            >
              <Map className="w-3.5 h-3.5 text-cyan-glow" />
              <span>{BASEMAPS[activeBasemap].label}</span>
            </button>

            {showBasemapMenu && (
              <div className="absolute left-0 top-full mt-1.5 w-48 bg-ocean-950/95 backdrop-blur-2xl border border-cyan-glow/40 rounded-xl p-1.5 shadow-2xl z-30 space-y-1 animate-in fade-in zoom-in-95 duration-100">
                {Object.values(BASEMAPS).map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleSwitchBasemap(b.id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors flex items-center justify-between ${
                      activeBasemap === b.id
                        ? 'bg-cyan-glow/20 text-cyan-glow font-bold border border-cyan-glow/40'
                        : 'text-slate-300 hover:bg-ocean-800/60'
                    }`}
                  >
                    <span>{b.label}</span>
                    {activeBasemap === b.id && <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sun Lighting Day/Night Toggle */}
          <button
            onClick={handleToggleSunLighting}
            title={sunLighting ? "Switch to Ambient Lighting" : "Switch to Realistic Sun Shading / Day-Night Terminator"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-mono transition-all shadow-md ${
              sunLighting
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold'
                : 'bg-ocean-950/90 border-navy-border text-slate-400 hover:text-slate-200'
            }`}
          >
            {sunLighting ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-400" />}
            <span className="hidden sm:inline">{sunLighting ? 'Solar Shading' : 'Ambient'}</span>
          </button>

          {/* Zoom & Reset Buttons */}
          <div className="flex items-center bg-ocean-950/90 backdrop-blur-md border border-navy-border rounded-lg p-0.5 shadow-md">
            <button
              onClick={handleZoomIn}
              title="Zoom In"
              className="p-1.5 text-slate-300 hover:text-cyan-glow hover:bg-ocean-800/60 rounded transition-all"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleZoomOut}
              title="Zoom Out"
              className="p-1.5 text-slate-300 hover:text-cyan-glow hover:bg-ocean-800/60 rounded transition-all"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={flyToIndianOcean}
              title="Reset View"
              className="p-1.5 text-slate-300 hover:text-cyan-glow hover:bg-ocean-800/60 rounded transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Observation Hover Tooltip */}
      {hoveredEntity && (
        <div
          className="absolute z-40 pointer-events-none bg-ocean-950/95 backdrop-blur-md border border-cyan-glow/50 rounded-lg p-3 shadow-2xl text-xs font-sans text-slate-100 min-w-[220px] transform -translate-x-1/2 -translate-y-full mb-3"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="flex items-center justify-between border-b border-cyan-glow/20 pb-1.5 mb-2">
            <span className="font-bold text-cyan-glow font-mono tracking-wide">{hoveredEntity.id}</span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-ocean-800 text-slate-300 border border-slate-700">
              {hoveredEntity.platform_type}
            </span>
          </div>

          <div className="space-y-1 font-mono text-[11px]">
            <div className="text-slate-400 truncate">{hoveredEntity.name}</div>
            <div className="flex justify-between text-slate-300">
              <span>Location:</span>
              <span className="text-slate-100">{hoveredEntity.lat}°N, {hoveredEntity.lon}°E</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Depth:</span>
              <span className="text-slate-100">{hoveredEntity.depth} m</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-1">
              <span className="text-cyan-muted">Observed Temp:</span>
              <span className="font-bold text-cyan-glow">{hoveredEntity.observed_temperature} °C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Model Temp:</span>
              <span className="text-slate-300">{hoveredEntity.model_temperature} °C</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Difference:</span>
              <span className={hoveredEntity.temperature_difference >= 0 ? "text-amber-400 font-bold" : "text-blue-400 font-bold"}>
                {hoveredEntity.temperature_difference > 0 ? `+${hoveredEntity.temperature_difference}` : hoveredEntity.temperature_difference} °C
              </span>
            </div>
          </div>

          <div className="mt-2 pt-1.5 border-t border-slate-800 text-[10px] text-center text-cyan-muted font-mono">
            Click marker to inspect depth profile
          </div>
        </div>
      )}
    </div>
  );
}
