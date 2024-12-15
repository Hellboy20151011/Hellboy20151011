document.addEventListener('DOMContentLoaded', async () => {
  const username = localStorage.getItem('username');
  const token = localStorage.getItem('token');
  if (!username || !token) {
    window.location.href = 'index.html';
    return;
  }

  const usernameElement = document.getElementById('username');
  if (usernameElement) {
    usernameElement.textContent = username;
  } else {
    console.error('Element with ID "username" not found');
  }

  document.getElementById('logout').addEventListener('click', () => {
    localStorage.removeItem('username');
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  });

  async function loadEnergyData() {
    try {
      const response = await fetch('/api/energy', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('Energy data:', data); // Debugging-Log
        const tableBody = document.getElementById('energy-data-body');
        tableBody.innerHTML = '';

        data.forEach(energy => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${energy.id}</td>
            <td>${energy.capacity}</td>
            <td>${energy.production}</td>
            <td>${energy.consumption}</td>
          `;
          tableBody.appendChild(row);
        });
        console.log('Updated energy data table'); // Debugging-Log
      } else if (response.status === 403) {
        console.error('Token expired or invalid. Redirecting to login.');
        localStorage.removeItem('username');
        localStorage.removeItem('token');
        window.location.href = 'index.html';
      } else {
        console.error('Failed to load energy data:', response.statusText);
      }
    } catch (err) {
      console.error('Error fetching energy data:', err);
    }
  }

  document.getElementById('build-power-plant').addEventListener('click', async () => {
    try {
      const response = await fetch('/api/build-power-plant', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ buildingId: 2 }) // Beispiel-Building-ID für das Kraftwerk
      });

      if (response.ok) {
        console.log('Power Plant built successfully');
        loadEnergyData(); // Aktualisiere die Energiedaten
      } else {
        console.error('Failed to build power plant:', response.statusText);
      }
    } catch (err) {
      console.error('Error building power plant:', err);
    }
  });

  function updateServerTime() {
    const serverTimeElement = document.getElementById('server-time');
    if (serverTimeElement) {
      const now = new Date();
      serverTimeElement.textContent = `Serverzeit: ${now.toLocaleTimeString()}`;
    }
  }

  await loadEnergyData();
  updateServerTime();
  setInterval(updateServerTime, 1000);
});