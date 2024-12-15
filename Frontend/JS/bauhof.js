document.addEventListener('DOMContentLoaded', async () => {
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  if (!username || !token) {
    window.location.href = 'index.html';
    return;
  }

  document.getElementById('username').textContent = username;

  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });

  async function loadAllBuildings() {
    const response = await fetch('/api/all-buildings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      console.log('All buildings data:', data); // Debugging-Log
      const buildingsList = document.getElementById('buildings-list');
      buildingsList.innerHTML = '';
      data.forEach(building => {
        const buildingDiv = document.createElement('div');
        buildingDiv.className = 'building';
        buildingDiv.innerHTML = `
          <h3>${building.name}</h3>
          <p>${building.description}</p>
          <button class="build-button" data-building-id="${building.id}">Bauen</button>
        `;
        buildingsList.appendChild(buildingDiv);
      });

      document.querySelectorAll('.build-button').forEach(button => {
        button.addEventListener('click', async (e) => {
          const buildingId = e.target.getAttribute('data-building-id');
          await buildBuilding(buildingId);
        });
      });
    } else if (response.status === 403) {
      console.error('Token expired or invalid. Redirecting to login.');
      localStorage.removeItem('username');
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    } else {
      console.error('Failed to load buildings:', response.statusText);
    }
  }

  async function buildBuilding(buildingId) {
    const response = await fetch('/api/build', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ buildingId })
    });
    if (response.ok) {
      const data = await response.json();
      console.log('Building built:', data); // Debugging-Log
      alert(`Gebäude ${data.name} gebaut!`);
      loadResources(); // Aktualisiere die Ressourcenanzeige
      loadEnergy(); // Aktualisiere die Energieanzeige
    } else {
      const error = await response.text();
      console.error('Failed to build building:', error);
      alert(`Gebäude konnte nicht gebaut werden: ${error}`);
    }
  }

  async function loadResources() {
    const response = await fetch('/api/resources', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      console.log('Resources data:', data); // Debugging-Log
      document.getElementById('resource-money').textContent = `Geld: ${data.geld || 0}`;
      document.getElementById('resource-metal').textContent = `Metall: ${data.metall || 0}`;
      document.getElementById('resource-wood').textContent = `Holz: ${data.holz || 0}`;
      document.getElementById('resource-stone').textContent = `Stein: ${data.stein || 0}`;
      document.getElementById('resource-fuel').textContent = `Treibstoff: ${data.treibstoff || 0}`;
      console.log('Updated resource elements'); // Debugging-Log
    } else if (response.status === 403) {
      console.error('Token expired or invalid. Redirecting to login.');
      localStorage.removeItem('username');
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    } else {
      console.error('Failed to load resources:', response.statusText);
    }
  }

  async function loadEnergy() {
    const response = await fetch('/api/energy', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      console.log('Energy data:', data); // Debugging-Log
      document.getElementById('resource-energy').textContent = `Energie: ${data.capacity || 0}`;
      console.log('Updated energy element'); // Debugging-Log
    } else if (response.status === 403) {
      console.error('Token expired or invalid. Redirecting to login.');
      localStorage.removeItem('username');
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    } else {
      console.error('Failed to load energy:', response.statusText);
    }
  }

  const fetchEnergyData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/energy', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const energyData = await response.json();
        const tableBody = document.getElementById('energy-table-body');
        tableBody.innerHTML = '';

        energyData.forEach(energy => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${energy.id}</td>
            <td>${energy.capacity}</td>
            <td>${energy.production}</td>
            <td>${energy.consumption}</td>
          `;
          tableBody.appendChild(row);
        });
      } else {
        console.error('Failed to fetch energy data:', response.statusText);
      }
    } catch (err) {
      console.error('Error fetching energy data:', err);
    }
  };

  document.getElementById('build-power-plant').addEventListener('click', async () => {
    try {
      const response = await fetch('http://localhost:3000/api/build-power-plant', { // Korrigierter Pfad
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ buildingId: 2 }) // Beispiel-Building-ID für das Kraftwerk
      });

      if (response.ok) {
        console.log('Power Plant built successfully');
        fetchEnergyData(); // Aktualisiere die Energiedaten
      } else {
        console.error('Failed to build power plant:', response.statusText);
      }
    } catch (err) {
      console.error('Error building power plant:', err);
    }
  });

  loadAllBuildings();
  loadResources();
  loadEnergy();
  fetchEnergyData();
});