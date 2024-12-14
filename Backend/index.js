const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const apiRoutes = require(`./Routes/api`);

app.use(express.json());
app.use('/api', apiRoutes);

// Statische Dateien aus dem frontend-Ordner bereitstellen
app.use(express.static(path.join(__dirname, '../frontend')));

app.listen(port, () => {
  console.log(`Backend server is running at http://localhost:${port}`);
});