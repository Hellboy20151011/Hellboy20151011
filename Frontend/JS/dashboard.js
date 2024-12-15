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

  async function loadBuildings() {
    const response = await fetch('/api/buildings', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      console.log('Buildings data:', data); // Debugging-Log
      const tableBody = document.getElementById('buildings-table-body');
      tableBody.innerHTML = '';

      data.forEach(building => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${building.name}</td>
          <td>${building.description}</td>
          <td>${building.quantity}</td>
        `;
        tableBody.appendChild(row);
      });
      console.log('Updated buildings table'); // Debugging-Log
    } else if (response.status === 403) {
      console.error('Token expired or invalid. Redirecting to login.');
      localStorage.removeItem('username');
      localStorage.removeItem('token');
      window.location.href = 'index.html';
    } else {
      console.error('Failed to load buildings:', response.statusText);
    }
  }

  await loadBuildings();
});