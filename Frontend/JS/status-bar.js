document.addEventListener('DOMContentLoaded', async () => {
  console.log('status-bar.js loaded'); // Debugging-Log
  const token = localStorage.getItem('token');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  async function loadResources() {
    try {
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
    } catch (err) {
      console.error('Error fetching resources:', err);
    }
  }

  function updateServerTime() {
    const serverTimeElement = document.getElementById('server-time');
    if (serverTimeElement) {
      const now = new Date();
      serverTimeElement.textContent = `Serverzeit: ${now.toLocaleTimeString()}`;
    }
  }

  await loadResources();
  updateServerTime();
  setInterval(updateServerTime, 1000);
});