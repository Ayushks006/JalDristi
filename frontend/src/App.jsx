import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/common/Header';
import StatsBar from './components/common/StatsBar';
import LandingHero from './components/common/LandingHero';
import SidebarNav from './components/panels/SidebarNav';
import ControlPanel from './components/panels/ControlPanel';
import GlobeViewer from './components/3d/GlobeViewer';
import CurrentParticleCanvas from './components/3d/CurrentParticleCanvas';
import ObservationDetail from './components/panels/ObservationDetail';
import ModelValidation from './components/panels/ModelValidation';
import AnalyticsPanel from './components/panels/AnalyticsPanel';
import DataSourcesPanel from './components/panels/DataSourcesPanel';
import AboutModal from './components/panels/AboutModal';
import AskJalDristi from './components/panels/AskJalDristi';
import UploadModal from './components/panels/UploadModal';
import LocationInspectCard from './components/panels/LocationInspectCard';
import ObservationsModal from './components/panels/ObservationsModal';
import DepthSlider from './components/controls/DepthSlider';
import DepthTransitionOverlay from './components/controls/DepthTransitionOverlay';
import TimeController from './components/controls/TimeController';
import DemoStoryTour from './components/controls/DemoStoryTour';
import { oceanDataService } from './services/oceanDataService';

export default function App() {
  // Navigation & View Modes
  const [activeTab, setActiveTab] = useState('explorer');
  const [viewMode, setViewMode] = useState('3D');
  const [isLandingOpen, setIsLandingOpen] = useState(true);

  // Core 4D Dimensions
  const [variable, setVariable] = useState('temperature');
  const [depth, setDepth] = useState(0);
  const [timeIdx, setTimeIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Data & Layers State
  const [dataSource, setDataSource] = useState('demo');
  const [layers, setLayers] = useState({
    model: true,
    observations: true,
    difference: false,
    currents: false,
    depth3D: false,
  });

  // Filters & Targets
  const [platformFilter, setPlatformFilter] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [targetLocation, setTargetLocation] = useState(null);

  // Selections & Inspections
  const [selectedObservation, setSelectedObservation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [cesiumViewer, setCesiumViewer] = useState(null);

  // Modals & Panels
  const [isAskVisionOpen, setIsAskVisionOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDemoTourActive, setIsDemoTourActive] = useState(false);

  // Data storage
  const [modelData, setModelData] = useState([]);
  const [observations, setObservations] = useState([]);
  const [stats, setStats] = useState(null);

  // Load ocean data whenever depth, timeIdx, or dataSource changes
  const loadData = useCallback(async () => {
    try {
      const pFilter = platformFilter === 'all' ? null : platformFilter;
      const [grid, obs] = await Promise.all([
        oceanDataService.fetchModelGrid(depth, timeIdx, variable),
        oceanDataService.fetchObservations(depth, timeIdx, pFilter)
      ]);

      setModelData(grid);
      setObservations(obs);

      const computedStats = await oceanDataService.fetchDashboardStats(depth, timeIdx, grid, obs);
      setStats(computedStats);
    } catch (err) {
      console.error("Error loading ocean data:", err);
    }
  }, [depth, timeIdx, variable, dataSource, platformFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Layer Toggle
  const handleToggleLayer = (layerId) => {
    setLayers(prev => {
      const updated = { ...prev, [layerId]: !prev[layerId] };
      // If user enables difference layer, ensure variable or difference representation activates
      return updated;
    });
  };

  // Region Selection Fly-To
  const handleSelectRegion = (regId) => {
    setSelectedRegion(regId);
    if (regId === 'arabian_sea') {
      setTargetLocation({ lat: 15.0, lon: 65.0, zoom: 2500000 });
    } else if (regId === 'bay_of_bengal') {
      setTargetLocation({ lat: 14.0, lon: 87.0, zoom: 2500000 });
    } else if (regId === 'equatorial_io') {
      setTargetLocation({ lat: 0.0, lon: 78.0, zoom: 3500000 });
    } else if (regId === 'south_io') {
      setTargetLocation({ lat: -8.0, lon: 70.0, zoom: 3500000 });
    } else {
      setTargetLocation({ lat: 6.0, lon: 76.0, zoom: 6000000 });
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setVariable('temperature');
    setDepth(0);
    setTimeIdx(0);
    setIsPlaying(false);
    setPlatformFilter('all');
    setSelectedRegion('all');
    setLayers({
      model: true,
      observations: true,
      difference: false,
      currents: false,
      depth3D: false,
    });
    setTargetLocation({ lat: 6.0, lon: 76.0, zoom: 6000000 });
    setSelectedObservation(null);
    setSelectedLocation(null);
  };

  // Handle Natural Language Query execution
  const handleExecuteNLP = (action) => {
    if (action.variable) setVariable(action.variable);
    if (action.depth !== null) setDepth(action.depth);
    if (action.platformFilter) setPlatformFilter(action.platformFilter);
    if (action.layers) {
      setLayers(prev => ({ ...prev, ...action.layers }));
    }
    if (action.coordinates) {
      setTargetLocation({ lat: action.coordinates.lat, lon: action.coordinates.lon, zoom: 2000000 });
    } else if (action.region) {
      setTargetLocation(action.region);
    }
  };

  // Handle Uploaded Dataset
  const handleDatasetLoaded = (dataset) => {
    oceanDataService.setUploadedData(dataset);
    setDataSource('uploaded');
    loadData();
  };

  // Handle Location Click on Globe
  const handleLocationClick = ({ lat, lon }) => {
    // Find nearest observation
    let nearestObs = null;
    let minDistObs = Infinity;
    observations.forEach(o => {
      const dist = Math.hypot(o.lat - lat, o.lon - lon);
      if (dist < minDistObs) {
        minDistObs = dist;
        nearestObs = o;
      }
    });

    // Find nearest model point
    let nearestModel = null;
    let minDistMod = Infinity;
    modelData.forEach(m => {
      const dist = Math.hypot(m.lat - lat, m.lon - lon);
      if (dist < minDistMod) {
        minDistMod = dist;
        nearestModel = m;
      }
    });

    setSelectedLocation({
      lat,
      lon,
      nearestObs: minDistObs < 4.0 ? nearestObs : null,
      nearestModel: minDistMod < 3.0 ? nearestModel : null
    });
  };

  // Apply tour configuration
  const handleApplyTourConfig = (cfg) => {
    if (!cfg) return;
    if (cfg.variable) setVariable(cfg.variable);
    if (cfg.depth !== undefined) setDepth(cfg.depth);
    if (cfg.layers) setLayers(prev => ({ ...prev, ...cfg.layers }));
    if (cfg.location) setTargetLocation(cfg.location);
    if (cfg.isPlaying !== undefined) setIsPlaying(cfg.isPlaying);
  };

  const handleSelectObsById = (obsId) => {
    const found = observations.find(o => o.id === obsId);
    if (found) setSelectedObservation(found);
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-ocean-950 font-sans text-slate-100">
      {/* Top Header */}
      <Header
        observations={observations}
        onNavigateLocation={setTargetLocation}
        onSelectObservation={setSelectedObservation}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAskVision={() => setIsAskVisionOpen(true)}
        onOpenDemoTour={() => setIsDemoTourActive(true)}
        isDemoTourActive={isDemoTourActive}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar Navigation */}
        <SidebarNav
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          onOpenDemoMode={() => setIsDemoTourActive(true)}
          isDemoModeActive={isDemoTourActive}
        />

        {/* Center Main Visualization Area (Globe + Overlays) */}
        <main className="flex-1 relative overflow-hidden flex flex-col">
          {/* 3D Earth Globe Engine */}
          <GlobeViewer
            modelData={modelData}
            observations={observations}
            variable={variable}
            depth={depth}
            layers={layers}
            viewMode={viewMode}
            onSelectObservation={setSelectedObservation}
            onLocationClick={handleLocationClick}
            targetLocation={targetLocation}
            selectedObservation={selectedObservation}
            onViewerReady={setCesiumViewer}
          />

          {/* Dynamic Vector Current Particle Canvas Overlay */}
          <CurrentParticleCanvas
            enabled={layers.currents}
            modelData={modelData}
            depth={depth}
            cesiumViewer={cesiumViewer}
          />

          {/* Animated Water Column Depth Transition Sonar */}
          <DepthTransitionOverlay depth={depth} />

          {/* Floating Depth Slider (Left side above bottom timeline) */}
          <div className="absolute bottom-20 left-4 z-20 w-64">
            <DepthSlider
              depth={depth}
              onChangeDepth={setDepth}
            />
          </div>

          {/* Floating 4D Time Controller (Bottom Center) */}
          <div className="absolute bottom-4 inset-x-0 z-20 flex justify-center px-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-2xl">
              <TimeController
                timeIdx={timeIdx}
                onChangeTimeIdx={setTimeIdx}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(p => !p)}
              />
            </div>
          </div>
        </main>

        {/* Right Dynamic Data & Control Panel */}
        <ControlPanel
          variable={variable}
          onSelectVariable={setVariable}
          dataSource={dataSource}
          onSelectDataSource={setDataSource}
          layers={layers}
          onToggleLayer={handleToggleLayer}
          viewMode={viewMode}
          onToggleViewMode={setViewMode}
          depth={depth}
          platformFilter={platformFilter}
          onSelectPlatformFilter={setPlatformFilter}
          selectedRegion={selectedRegion}
          onSelectRegion={handleSelectRegion}
          onResetFilters={handleResetFilters}
          onOpenUpload={() => setIsUploadOpen(true)}
        />
      </div>

      {/* Bottom Dynamic Statistics Bar */}
      <StatsBar stats={stats} />

      {/* Floating Modals & Drawers */}

      {/* 1. Clicked Observation Detail CTD Profile Drawer */}
      {selectedObservation && (
        <ObservationDetail
          observation={selectedObservation}
          onClose={() => setSelectedObservation(null)}
        />
      )}

      {/* 2. Selected Arbitrary Location Inspection Card */}
      {selectedLocation && !selectedObservation && (
        <LocationInspectCard
          locationData={selectedLocation}
          depth={depth}
          onClose={() => setSelectedLocation(null)}
          onCompare={(obs) => {
            if (obs && obs.id) setSelectedObservation(obs);
            setSelectedLocation(null);
          }}
        />
      )}

      {/* Observations Registry Modal */}
      {activeTab === 'observations' && (
        <ObservationsModal
          observations={observations}
          depth={depth}
          onSelectObservation={setSelectedObservation}
          onFlyToLocation={setTargetLocation}
          onClose={() => setActiveTab('explorer')}
        />
      )}

      {/* 3. Model Validation Full Dashboard */}
      {activeTab === 'validation' && (
        <ModelValidation
          observations={observations}
          depth={depth}
          variable={variable}
          onClose={() => setActiveTab('explorer')}
        />
      )}

      {/* 4. Analytics Panel */}
      {activeTab === 'analytics' && (
        <AnalyticsPanel
          modelData={modelData}
          observations={observations}
          depth={depth}
          onClose={() => setActiveTab('explorer')}
        />
      )}

      {/* 5. Data Sources Panel */}
      {activeTab === 'datasources' && (
        <DataSourcesPanel
          onClose={() => setActiveTab('explorer')}
        />
      )}

      {/* 6. About Page Modal */}
      {activeTab === 'about' && (
        <AboutModal
          onClose={() => setActiveTab('explorer')}
        />
      )}

      {/* 7. Ask JalDristi Natural Language Query Modal */}
      {isAskVisionOpen && (
        <AskJalDristi
          onExecuteQuery={handleExecuteNLP}
          onClose={() => setIsAskVisionOpen(false)}
        />
      )}

      {/* 8. Dataset Upload Modal */}
      {isUploadOpen && (
        <UploadModal
          onDatasetLoaded={handleDatasetLoaded}
          onClose={() => setIsUploadOpen(false)}
        />
      )}

      {/* 9. Hackathon Demo Story Tour */}
      {isDemoTourActive && (
        <DemoStoryTour
          onApplyConfig={handleApplyTourConfig}
          onSelectObsById={handleSelectObsById}
          onClose={() => setIsDemoTourActive(false)}
        />
      )}

      {/* 10. Welcome Landing Hero Screen */}
      {isLandingOpen && (
        <LandingHero
          onLaunch={() => setIsLandingOpen(false)}
          onLaunchDemo={() => {
            setIsLandingOpen(false);
            setIsDemoTourActive(true);
          }}
        />
      )}
    </div>
  );
}
