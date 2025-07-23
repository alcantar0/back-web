const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_cFVzdf5rwtn2@ep-wild-snow-afq9te4v-pooler.c-2.us-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: false // use true + config se for banco na nuvem com SSL
});

module.exports = pool;