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

  // Hier können Sie weitere Funktionen für die Seite "Bauhof" hinzufügen
});