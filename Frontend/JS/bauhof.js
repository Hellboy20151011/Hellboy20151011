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
    } else {
      console.error('Failed to build building:', response.statusText);
      alert('Gebäude konnte nicht gebaut werden.');
    }
  }

  loadAllBuildings();
});