INSERT INTO products (name, price, quantity) VALUES
('notebook', 29.90, 100),
('mouse', 12.50, 200)
ON CONFLICT DO NOTHING;
