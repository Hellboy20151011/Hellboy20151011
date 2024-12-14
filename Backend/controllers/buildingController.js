const pool = require('../config/db');

exports.getBuildings = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM buildings');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};