const express = require('express');
const router = express.Router();
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'browsergame_1',
  password: 'Arkona123!',
  port: 5432,
});

const secretKey = 'your_secret_key';

// Middleware to extract userId from token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, secretKey, (err, user) => {
    if (err) return res.sendStatus(403);
    req.userId = user.userId;
    next();
  });
};

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await pool.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, hashedPassword]);
    res.status(201).send('User registered');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      return res.status(400).send('User not found');
    }

    const user = result.rows[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(400).send('Invalid password');
    }

    const token = jwt.sign({ userId: user.id }, secretKey, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/buildings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM buildings');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

router.get('/resources', authenticateToken, async (req, res) => {
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
});

module.exports = router;