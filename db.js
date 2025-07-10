const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'web-back',
  password: 'qwe123',
  port: 5432,
});

module.exports = pool;
