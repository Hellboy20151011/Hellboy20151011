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

  async function loadBuildings() {
    const response = await fetch('/api/buildings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      console.log('Buildings data:', data); // Debugging-Log
      const buildingsTableBody = document.getElementById('buildings-table').querySelector('tbody');
      buildingsTableBody.innerHTML = '';
      data.forEach(building => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${building.name}</td>
          <td>${building.quantity}</td>
        `;
        buildingsTableBody.appendChild(row);
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
  loadBuildings();
});