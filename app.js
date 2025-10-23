const { pool } = require('./db');

async function main() {
  const { rows } = await pool.query('SELECT id, name, price, quantity FROM products ORDER BY id');
  console.table(rows);

  const ins = await pool.query(
    'INSERT INTO products (name, price, quantity) VALUES ($1,$2,$3) RETURNING *',
    ['keyboard', 19.99, 50]
  );
  console.log('Inserted:', ins.rows[0]);

  const upd = await pool.query(
    'UPDATE products SET price = $1 WHERE id = $2 RETURNING *',
    [24.99, ins.rows[0].id]
  );
  console.log('Updated:', upd.rows[0]);

  const del = await pool.query(
    'DELETE FROM products WHERE id = $1 RETURNING id',
    [ins.rows[0].id]
  );
  console.log('Deleted:', del.rows[0]);

  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
