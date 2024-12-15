const express = require('express');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const app = express();
const port = 3000;
const authRoutes = require('./routes/authRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const energyRoutes = require('./routes/energyRoutes');
const updateProduction = require('./jobs/updateProduction');

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', buildingRoutes);
app.use('/api', resourceRoutes);
app.use('/api', energyRoutes);

// Zeitserver-Endpunkt
app.get('/api/time', (req, res) => {
    const currentTime = new Date();
    res.json({ currentTime: currentTime.toISOString() });
});

// Statische Dateien aus dem frontend-Ordner bereitstellen
app.use(express.static(path.join(__dirname, '../frontend')));

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  global.websocket = ws;
  ws.on('close', () => {
    console.log('Client disconnected');
    global.websocket = null;
  });
});

server.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});

// Ressourcenproduktion alle 30 Sekunden aktualisieren
setInterval(() => {
  const now = new Date();
  const seconds = now.getSeconds();
  if (seconds === 0 || seconds === 30) {
    updateProduction();
  }
}, 1000);