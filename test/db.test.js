const pool = require('../db/pool.js');

describe('Database connection', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('can connect to the database and run a query', async () => {
    const result = await pool.query('SELECT 1 AS result');

    expect(result.rows[0].result).toBe(1);
  });
});
