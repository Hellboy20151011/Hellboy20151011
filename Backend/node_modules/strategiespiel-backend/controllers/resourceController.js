const pool = require('../config/db');

exports.getResources = async (req, res) => {
  try {
    const userId = req.userId;
    console.log('Fetching resources for user:', userId); // Debugging-Log
    const result = await pool.query(`
      SELECT r.name, ur.amount
      FROM user_resources ur
      JOIN resources r ON ur.resource_id = r.id
      WHERE ur.user_id = $1
    `, [userId]);

    console.log('Query result:', result.rows); // Debugging-Log

    const resources = result.rows.reduce((acc, row) => {
      acc[row.name.toLowerCase()] = row.amount;
      return acc;
    }, {});

    console.log('Resources:', resources); // Debugging-Log

    res.json(resources);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};