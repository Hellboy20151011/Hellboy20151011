const pool = require('../config/db');
const buildingModel = require('../models/buildingModel');

exports.getUserBuildings = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Fetching buildings for user:', userId); // Debugging-Log

    const result = await pool.query(`
      SELECT b.name, b.description, ub.quantity, ub.created_at, ub.last_updated
      FROM user_buildings ub
      JOIN buildings b ON ub.building_id = b.id
      WHERE ub.user_id = $1
    `, [userId]);

    console.log('User buildings query result:', result.rows); // Debugging-Log

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.getAllBuildings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM buildings');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

exports.buildPowerPlant = async (req, res) => {
  try {
    const userId = req.userId;
    const { buildingId } = req.body;

    const result = await buildingModel.buildPowerPlant(userId, buildingId);

    res.json(result);
  } catch (err) {
    console.error('Error building power plant:', err); // Debugging-Log
    res.status(500).send('Server error');
  }
};

exports.updateProduction = async (req, res) => {
  try {
    const userId = req.userId;
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

    res.sendStatus(200);
  } catch (err) {
    console.error('Error updating production:', err); // Debugging-Log
    res.status(500).send('Server error');
  }
};