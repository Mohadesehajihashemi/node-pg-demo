const express = require('express');
const { pool } = require('./db');

const app = express();
app.use(express.json());

app.get('/products', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, name, price, quantity FROM products ORDER BY id'
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: 'internal_error' });
  }
});

app.post('/products', async (req, res) => {
  try {
    const { name, price, quantity = 0 } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO products (name, price, quantity) VALUES ($1,$2,$3) RETURNING *',
      [name, price, quantity]
    );
    res.status(201).json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: 'bad_request' });
  }
});

app.patch('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [];
    const values = [];
    let i = 1;

    for (const k of ['name','price','quantity']) {
      if (req.body[k] !== undefined) {
        fields.push(`${k} = $${i++}`);
        values.push(req.body[k]);
      }
    }
    if (!fields.length) return res.status(400).json({ error: 'no_fields' });
    values.push(id);

    const sql = `UPDATE products SET ${fields.join(', ')} WHERE id = $${i} RETURNING *`;
    const { rows } = await pool.query(sql, values);
    if (!rows.length) return res.status(404).json({ error: 'not_found' });
    res.json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: 'bad_request' });
  }
});

app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      'DELETE FROM products WHERE id = $1 RETURNING id',
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'not_found' });
    res.json({ deleted: rows[0].id });
  } catch (e) {
    res.status(400).json({ error: 'bad_request' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`API listening on :${port}`);
});
