import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Mock data for initial demo
  const MOCK_AIRCRAFT = [
    { id: "AE58A1", type: "air", category: "B-52H", name: "BRIG01", lat: 35.212, lon: 139.456, altitude: 9448, speed: 450, heading: 85, timestamp: new Date().toISOString() },
    { id: "AE01A2", type: "air", category: "RC-135", name: "JAKE11", lat: 50.1, lon: 15.2, altitude: 8000, speed: 400, heading: 120, timestamp: new Date().toISOString() },
    { id: "AE4D03", type: "air", category: "P-8A", name: "LANCER5", lat: 25.5, lon: 125.2, altitude: 5000, speed: 380, heading: 240, timestamp: new Date().toISOString() },
  ];

  const MOCK_SHIPS = [
    { id: "368926000", type: "sea", category: "Carrier", name: "USS GERALD R FORD", lat: 36.967, lon: -76.320, speed: 18, heading: 270, status: "Underway", timestamp: new Date().toISOString() },
    { id: "367000001", type: "sea", category: "Carrier", name: "USS RONALD REAGAN", lat: 34.6, lon: 139.8, speed: 22, heading: 180, status: "Operating", timestamp: new Date().toISOString() },
  ];

  app.get("/api/v1/targets/realtime", (req, res) => {
    res.json({ targets: [...MOCK_AIRCRAFT, ...MOCK_SHIPS] });
  });

  app.get("/api/v1/targets/:id/track", (req, res) => {
    const { id } = req.params;
    const { range } = req.query; // 'day', '7d', '30d'
    
    // Generate simple mock trail
    const points = [];
    const count = range === 'day' ? 96 : range === '7d' ? 150 : 300; // 15-min intervals for day
    const target = [...MOCK_AIRCRAFT, ...MOCK_SHIPS].find(t => t.id === id);
    
    if (target) {
      for (let i = 0; i < count; i++) {
        points.push({
          timestamp: new Date(Date.now() - i * (range === 'day' ? 900000 : 3600000)).toISOString(),
          lat: target.lat + (Math.random() - 0.5) * (count / 100),
          lon: target.lon + (Math.random() - 0.5) * (count / 100),
          altitude: ('altitude' in target) ? (target as any).altitude : 0,
          speed: target.speed
        });
      }
    }
    res.json({ track: points.reverse() });
  });

  // Proxy Cesium assets from node_modules for local dev without complex copy plugin
  app.use('/cesium', express.static(path.join(process.cwd(), 'node_modules/cesium/Build/Cesium')));

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production serving
    const distPath = path.join(process.cwd(), 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
