import React, { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';

export default function CurrentParticleCanvas({
  enabled = false,
  modelData = [],
  depth = 0,
  cesiumViewer = null
}) {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    if (!enabled) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Resize canvas to match display size
    const resize = () => {
      if (!canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Initialize 350 geographic particles distributed across the Indian Ocean basin
    const particleCount = 380;
    const particles = [];

    // Basin boundaries: Indian Ocean (Arabian Sea, Bay of Bengal, Equatorial IO)
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        lat: -12.0 + Math.random() * 36.0,
        lon: 50.0 + Math.random() * 48.0,
        prevScreenX: null,
        prevScreenY: null,
        age: Math.floor(Math.random() * 90),
        maxAge: 70 + Math.random() * 50,
        speed: 0.7 + Math.random() * 0.9,
      });
    }
    particlesRef.current = particles;

    // Fast spatial velocity lookup based on modelData (or physical U/V if modelData loaded)
    const getUV = (lat, lon) => {
      // Find nearest grid point in modelData if available
      if (modelData && modelData.length > 0) {
        let nearest = null;
        let minDistSq = Infinity;
        for (let i = 0; i < modelData.length; i++) {
          const pt = modelData[i];
          const dSq = (pt.lat - lat) ** 2 + (pt.lon - lon) ** 2;
          if (dSq < minDistSq) {
            minDistSq = dSq;
            nearest = pt;
            if (dSq < 2.0) break; // Close enough for fast loop
          }
        }
        if (nearest && nearest.current_u !== undefined && nearest.current_v !== undefined) {
          return {
            u: nearest.current_u,
            v: nearest.current_v,
            speed: nearest.current_speed || Math.hypot(nearest.current_u, nearest.current_v)
          };
        }
      }

      // Physical fallback: Indian Ocean dynamics (Somali jet, Equatorial jet, Monsoon gyres)
      const distEq = Math.abs(lat);
      const eqJet = 0.9 * Math.exp(-(distEq ** 2) / 16.0);
      const somaliJet = (lat > 2.0 && lat < 18.0 && lon > 48.0 && lon < 62.0)
        ? 1.3 * Math.exp(-((lat - 9.0) ** 2 + (lon - 54.0) ** 2) / 25.0)
        : 0.0;

      const u = eqJet + 0.25 * Math.sin(lat * 0.3) + 0.1 * Math.cos(lon * 0.25);
      const v = somaliJet + 0.3 * Math.cos(lat * 0.3) - 0.1 * Math.sin(lon * 0.2);
      const speed = Math.hypot(u, v);
      return { u, v, speed };
    };

    let lastTime = performance.now();

    const animate = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.08);
      lastTime = now;

      // Semi-transparent fade to produce smooth particle streamline trails
      ctx.fillStyle = 'rgba(2, 6, 23, 0.14)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Depth attenuation factor (current speed decays with depth)
      const depthFactor = Math.max(0.18, Math.exp(-depth / 140.0));

      const viewer = cesiumViewer;
      const scene = viewer ? viewer.scene : null;
      let occluder = null;
      if (viewer && scene && viewer.camera) {
        try {
          occluder = new Cesium.EllipsoidalOccluder(Cesium.Ellipsoid.WGS84, viewer.camera.position);
        } catch (e) {
          // Camera position might be initializing
        }
      }

      particles.forEach((p) => {
        const vel = getUV(p.lat, p.lon);
        const actualSpeed = vel.speed * p.speed * depthFactor;

        // Advect particle geographically across lat/lon
        const cosLat = Math.cos(p.lat * (Math.PI / 180));
        const dtDeg = 0.055;
        p.lon += (vel.u / Math.max(0.2, cosLat)) * dtDeg * actualSpeed;
        p.lat += vel.v * dtDeg * actualSpeed;
        p.age += 1;

        let screenX = null;
        let screenY = null;
        let isVisibleOnEarth = false;

        if (scene && occluder) {
          try {
            const cartesian = Cesium.Cartesian3.fromDegrees(p.lon, p.lat, 2500);
            isVisibleOnEarth = occluder.isPointVisible(cartesian);
            if (isVisibleOnEarth) {
              const winPos = Cesium.SceneTransforms.wgs84ToWindowCoordinates(scene, cartesian);
              if (winPos) {
                screenX = winPos.x;
                screenY = winPos.y;
              }
            }
          } catch (e) {
            // Coordinate projection safety fallback
          }
        } else {
          // Fallback if Cesium viewer not yet attached
          const relX = (p.lon - 50.0) / 50.0;
          const relY = 1.0 - ((p.lat + 12.0) / 38.0);
          screenX = relX * canvas.width;
          screenY = relY * canvas.height;
          isVisibleOnEarth = true;
        }

        // Draw particle stroke
        if (
          isVisibleOnEarth &&
          screenX !== null &&
          screenY !== null &&
          screenX >= 0 &&
          screenX <= canvas.width &&
          screenY >= 0 &&
          screenY <= canvas.height
        ) {
          if (p.prevScreenX !== null && p.prevScreenY !== null) {
            const distJump = Math.hypot(screenX - p.prevScreenX, screenY - p.prevScreenY);
            // Ignore camera jump glitches
            if (distJump < 80) {
              const alpha = Math.sin((p.age / p.maxAge) * Math.PI) * 0.9;

              let strokeColor = '#00f2fe';
              if (actualSpeed > 1.1) strokeColor = '#f59e0b'; // Amber for fast currents
              else if (actualSpeed > 0.6) strokeColor = '#2dd4bf'; // Teal
              else strokeColor = '#38bdf8'; // Sky blue

              ctx.strokeStyle = strokeColor;
              ctx.globalAlpha = Math.max(0.1, alpha);
              ctx.lineWidth = 1.8;
              ctx.beginPath();
              ctx.moveTo(p.prevScreenX, p.prevScreenY);
              ctx.lineTo(screenX, screenY);
              ctx.stroke();
            }
          }

          p.prevScreenX = screenX;
          p.prevScreenY = screenY;
        } else {
          p.prevScreenX = null;
          p.prevScreenY = null;
        }

        // Respawn particle if expired or drifted outside Indian Ocean basin
        if (
          p.age > p.maxAge ||
          p.lon < 45.0 ||
          p.lon > 105.0 ||
          p.lat < -15.0 ||
          p.lat > 28.0
        ) {
          p.lat = -10.0 + Math.random() * 34.0;
          p.lon = 52.0 + Math.random() * 46.0;
          p.age = 0;
          p.prevScreenX = null;
          p.prevScreenY = null;
        }
      });

      ctx.globalAlpha = 1.0;
      animFrameRef.current = requestAnimationFrame(animate);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [enabled, depth, modelData, cesiumViewer]);

  if (!enabled) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10 select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ mixBlendMode: 'screen' }}
      />
      {/* Transparency badge for current flow */}
      <div className="absolute top-4 right-84 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-ocean-950/85 backdrop-blur-md border border-cyan-glow/30 text-[10px] font-mono text-cyan-glow shadow-md">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-glow animate-ping" />
        <span>OCEAN CURRENTS: U/V ADVECTION (DEMO CURRENT FLOW)</span>
      </div>
    </div>
  );
}
