const { Pool } = require('pg');
const { DB } = require('./config');

const pool = new Pool({
  user: DB.PGUSER,
  host: DB.PGHOST,
  database: DB.PGDATABASE,
  password: DB.PGPASSWORD,
  pgsslmode: DB.PGSSLMODE,
  pgchannelbinding: DB.PGCHANNELBINDING,
  port: DB.PGPORT
});

module.exports = pool;
