const pool = require('../config/db');

exports.buildPowerPlant = async (userId, buildingId) => {
  try {
    console.log(`Building Power Plant with ID: ${buildingId}`); // Debugging-Log

    // Überprüfe die Ressourcenanforderungen
    const buildingResult = await pool.query('SELECT * FROM buildings WHERE id = $1', [buildingId]);
    const building = buildingResult.rows[0];

    console.log('Building data:', building); // Debugging-Log

    const userResourcesResult = await pool.query(`
      SELECT ur.resource_id, ur.amount, r.name
      FROM user_resources ur
      JOIN resources r ON ur.resource_id = r.id
      WHERE ur.user_id = $1
    `, [userId]);
    const userResources = userResourcesResult.rows.reduce((acc, row) => {
      acc[row.name.toLowerCase()] = parseInt(row.amount, 10); // Konvertiere die Werte in Zahlen
      return acc;
    }, {});

    console.log('User resources:', userResources); // Debugging-Log

    if (!building) {
      throw new Error('Invalid building data');
    }

    // Überprüfe, ob genügend Ressourcen verfügbar sind
    const requiredResources = {
      holz: parseInt(building.cost_wood, 10),  // Konvertiere die Werte in Zahlen
      stein: parseInt(building.cost_stone, 10), // Konvertiere die Werte in Zahlen
      metall: parseInt(building.cost_metal, 10), // Konvertiere die Werte in Zahlen
      geld: parseInt(building.cost_money, 10)  // Konvertiere die Werte in Zahlen
    };

    if (building.cost_fuel) {
      requiredResources.treibstoff = parseInt(building.cost_fuel, 10); // Konvertiere die Werte in Zahlen
    }

    console.log('Required resources:', requiredResources); // Debugging-Log

    for (const [resource, amount] of Object.entries(requiredResources)) {
      if (userResources[resource] < amount) {
        console.log(`Not enough ${resource}: required ${amount}, available ${userResources[resource]}`); // Debugging-Log
        throw new Error(`Not enough ${resource}`);
      }
    }

    // Verbrauche die Ressourcen
    for (const [resource, amount] of Object.entries(requiredResources)) {
      console.log(`Updating ${resource}: deducting ${amount}`); // Debugging-Log
      const updateResult = await pool.query(`
        UPDATE user_resources
        SET amount = amount - $1
        WHERE user_id = $2 AND resource_id = (
          SELECT id FROM resources WHERE LOWER(name) = LOWER($3)
        )
      `, [amount, userId, resource]);
      console.log(`Updated ${resource}: deducted ${amount}, result: ${updateResult.rowCount}`); // Debugging-Log
      if (updateResult.rowCount === 0) {
        throw new Error(`Failed to update ${resource}`);
      }
    }

    // Aktualisiere die Energieproduktion
    const energyUpdateResult = await pool.query('UPDATE energy SET production = production + $1 WHERE user_id = $2', [building.power_production, userId]);
    console.log('Updated energy production:', energyUpdateResult.rowCount); // Debugging-Log

    // Füge das Gebäude hinzu oder aktualisiere die Menge
    const result = await pool.query(`
      INSERT INTO user_buildings (user_id, building_id, quantity)
      VALUES ($1, $2, 1)
      ON CONFLICT (user_id, building_id)
      DO UPDATE SET quantity = user_buildings.quantity + 1, last_updated = CURRENT_TIMESTAMP
      RETURNING *
    `, [userId, buildingId]);

    console.log('Power Plant built:', result.rows[0]); // Debugging-Log

    return result.rows[0];
  } catch (err) {
    console.error('Error building power plant:', err); // Debugging-Log
    throw err;
  }
};