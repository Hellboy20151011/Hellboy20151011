

const pool = require('../config/db');

exports.getEnergy = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Fetching energy for user:', userId); // Debugging-Log

    const result = await pool.query(`
      SELECT capacity, production, consumption
      FROM energy
      WHERE user_id = $1
    `, [userId]);

    console.log('Energy query result:', result.rows); // Debugging-Log

    if (result.rows.length > 0) {
      const energy = result.rows[0];
      const energyData = {
        capacity: energy.capacity
      };
      res.json(energyData);
    } else {
      res.json({ capacity: 0, production: 0, consumption: 0, netEnergy: 0 });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};