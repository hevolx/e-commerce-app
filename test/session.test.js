const pool = require('../db/pool.js');

describe('Session store', () => {
  afterAll(async () => {
    await pool.end();
  });

  it('has a session table in the database', async () => {
    const result = await pool.query(
      "SELECT to_regclass('public.session') AS table"
    );

    expect(result.rows[0].table).toBe('session');
  });
});
