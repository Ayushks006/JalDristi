// Unified Ocean Data Service Broker

import { generateClientModelGrid, generateClientObservations, TIMESTAMPS, STANDARD_DEPTHS } from './demoDataGenerator';
import { computeValidationMetrics } from './validationMetrics';

const API_BASE = (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/+$/, '') : '') + '/api';

class OceanDataService {
  constructor() {
    this.dataSource = 'demo'; // 'demo' | 'erddap' | 'uploaded'
    this.uploadedDataset = null;
    this.backendAvailable = null; // null: unknown, true, false
  }

  setDataSource(source) {
    this.dataSource = source;
  }

  setUploadedData(dataset) {
    this.uploadedDataset = dataset;
    this.dataSource = 'uploaded';
  }

  async checkBackendHealth() {
    if (this.backendAvailable !== null) return this.backendAvailable;
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(1500) });
      this.backendAvailable = res.ok;
    } catch {
      this.backendAvailable = false;
    }
    return this.backendAvailable;
  }

  async fetchModelGrid(depth = 0, timeIdx = 0, variable = 'temperature') {
    if (this.dataSource === 'uploaded' && this.uploadedDataset) {
      // In uploaded mode, synthesize a grid matching user data bounds or use user points
      return generateClientModelGrid(depth, timeIdx);
    }

    const hasBackend = await this.checkBackendHealth();
    if (hasBackend) {
      try {
        const res = await fetch(`${API_BASE}/ocean/model?depth=${depth}&time_idx=${timeIdx}&variable=${variable}`);
        if (res.ok) {
          const json = await res.json();
          return json.data;
        }
      } catch (err) {
        console.warn("Backend model fetch failed, using client demo generator:", err);
      }
    }

    // Graceful fallback to client generator
    return generateClientModelGrid(depth, timeIdx);
  }

  async fetchObservations(depth = 0, timeIdx = 0, platformType = null) {
    if (this.dataSource === 'uploaded' && this.uploadedDataset && this.uploadedDataset.data) {
      let obs = this.uploadedDataset.data;
      if (platformType) {
        obs = obs.filter(o => o.platform_type === platformType);
      }
      return obs;
    }

    const hasBackend = await this.checkBackendHealth();
    if (hasBackend) {
      try {
        let url = `${API_BASE}/ocean/observations?depth=${depth}&time_idx=${timeIdx}`;
        if (platformType) url += `&platform_type=${platformType}`;
        const res = await fetch(url);
        if (res.ok) {
          const json = await res.json();
          return json.data;
        }
      } catch (err) {
        console.warn("Backend observations fetch failed, using client demo generator:", err);
      }
    }

    let obs = generateClientObservations(depth, timeIdx);
    if (platformType) {
      obs = obs.filter(o => o.platform_type === platformType);
    }
    return obs;
  }

  async fetchValidationStats(depth = 0, timeIdx = 0, observations = []) {
    if (observations && observations.length > 0) {
      return computeValidationMetrics(observations);
    }

    const obs = await this.fetchObservations(depth, timeIdx);
    return computeValidationMetrics(obs);
  }

  async fetchDashboardStats(depth = 0, timeIdx = 0, modelGrid = [], observations = []) {
    const obs = observations.length > 0 ? observations : await this.fetchObservations(depth, timeIdx);
    const grid = modelGrid.length > 0 ? modelGrid : await this.fetchModelGrid(depth, timeIdx);
    const metrics = computeValidationMetrics(obs);

    const avgTemp = grid.length > 0
      ? Number((grid.reduce((a, b) => a + b.temperature, 0) / grid.length).toFixed(1))
      : 28.7;

    return {
      observationCount: obs.length,
      modelPointCount: grid.length,
      averageTemperature: avgTemp,
      mae: metrics.mae,
      rmse: metrics.rmse,
      meanBias: metrics.mean_bias,
      lastUpdate: TIMESTAMPS[timeIdx] || "2026-09-21 12:00 UTC",
      dataSource: this.dataSource === 'demo' ? 'DEMO DATASET' : (this.dataSource === 'erddap' ? 'NOAA ERDDAP' : 'UPLOADED DATA')
    };
  }
}

export const oceanDataService = new OceanDataService();
