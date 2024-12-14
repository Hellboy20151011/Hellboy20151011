const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const authRoutes = require('./routes/authRoutes');
const buildingRoutes = require('./routes/buildingRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const energyRoutes = require('./routes/energyRoutes');

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api', buildingRoutes);
app.use('/api', resourceRoutes);
app.use('/api', energyRoutes);

// Statische Dateien aus dem frontend-Ordner bereitstellen
app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});