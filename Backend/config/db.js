const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'browsergame_1',
  password: 'Arkona123!',
  port: 5432,
});

module.exports = pool;