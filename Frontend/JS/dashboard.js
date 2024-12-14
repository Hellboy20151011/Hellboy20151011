document.addEventListener('DOMContentLoaded', () => {
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

  async function loadBuildings() {
    const response = await fetch('/api/buildings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      const buildingsList = document.getElementById('buildings-list');
      buildingsList.innerHTML = '';
      data.forEach(building => {
        const buildingDiv = document.createElement('div');
        buildingDiv.className = 'building';
        buildingDiv.innerHTML = `
          <h3>${building.name}</h3>
          <p>${building.description}</p>
          <p>Kosten Geld: ${building.cost_money}</p>
          <p>Kosten Metall: ${building.cost_metal}</p>
          <p>Kosten Holz: ${building.cost_wood}</p>
        `;
        buildingsList.appendChild(buildingDiv);
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

  loadResources();
  loadEnergy();
  loadBuildings();
});