const pool = require('../config/db');

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

exports.buildBuilding = async (req, res) => {
  try {
    const userId = req.userId;
    const { buildingId } = req.body;

    const result = await pool.query(`
      INSERT INTO user_buildings (user_id, building_id, quantity)
      VALUES ($1, $2, 1)
      ON CONFLICT (user_id, building_id)
      DO UPDATE SET quantity = user_buildings.quantity + 1, last_updated = CURRENT_TIMESTAMP
      RETURNING *
    `, [userId, buildingId]);

    console.log('Building built:', result.rows[0]); // Debugging-Log

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};