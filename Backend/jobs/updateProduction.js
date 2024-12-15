const pool = require('../config/db');

async function updateProduction() {
  try {
    const usersResult = await pool.query('SELECT id FROM users');
    const userIds = usersResult.rows.map(row => row.id);

    for (const userId of userIds) {
      console.log('Updating production for user:', userId); // Debugging-Log

      const productionResult = await pool.query(`
        SELECT pr.resource_id, SUM(pr.production_rate * ub.quantity) AS total_production
        FROM user_buildings ub
        JOIN production_rates pr ON ub.building_id = pr.building_id
        WHERE ub.user_id = $1
        GROUP BY pr.resource_id
      `, [userId]);

      const updatePromises = productionResult.rows.map(row => {
        return pool.query(`
          INSERT INTO user_resources (user_id, resource_id, amount)
          VALUES ($1, $2, $3)
          ON CONFLICT (user_id, resource_id)
          DO UPDATE SET amount = user_resources.amount + EXCLUDED.amount
        `, [userId, row.resource_id, row.total_production]);
      });

      await Promise.all(updatePromises);

      console.log('Production updated for user:', userId); // Debugging-Log
    }

    // Benachrichtigung an das Frontend senden
    notifyFrontend();
  } catch (err) {
    console.error('Error updating production:', err);
  }
}

function notifyFrontend() {
  // Hier kannst du eine WebSocket-Verbindung oder eine andere Methode verwenden, um das Frontend zu benachrichtigen
  // Beispiel: WebSocket-Nachricht senden
  if (global.websocket) {
    global.websocket.send(JSON.stringify({ type: 'productionUpdated' }));
  }
}

module.exports = updateProduction;