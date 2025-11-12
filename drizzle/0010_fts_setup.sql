-- Migration number: 0010 --------------------------------------------------------------------------------

-- 1. Create the FTS5 virtual table for products
CREATE VIRTUAL TABLE IF NOT EXISTS productos_fts USING fts5(
  codigoBarra,
  descripcion,
  categoria,
  marca,
  modelo,
  content='productos',      -- The actual content is in the 'productos' table
  content_rowid='id'      -- The 'id' column of 'productos' maps to the rowid
);

-- 2. Create triggers to keep the FTS table synchronized with the productos table

-- After a new product is INSERTed
CREATE TRIGGER IF NOT EXISTS productos_ai AFTER INSERT ON productos BEGIN
  INSERT INTO productos_fts(rowid, codigoBarra, descripcion, categoria, marca, modelo)
  VALUES (new.id, new.codigoBarra, new.descripcion, new.categoria, new.marca, new.modelo);
END;

-- After a product is DELETEd
CREATE TRIGGER IF NOT EXISTS productos_ad AFTER DELETE ON productos BEGIN
  INSERT INTO productos_fts(productos_fts, rowid, codigoBarra, descripcion, categoria, marca, modelo)
  VALUES ('delete', old.id, old.codigoBarra, old.descripcion, old.categoria, old.marca, old.modelo);
END;

-- After a product is UPDATEd
CREATE TRIGGER IF NOT EXISTS productos_au AFTER UPDATE ON productos BEGIN
  INSERT INTO productos_fts(productos_fts, rowid, codigoBarra, descripcion, categoria, marca, modelo)
  VALUES ('delete', old.id, old.codigoBarra, old.descripcion, old.categoria, old.marca, old.modelo);
  INSERT INTO productos_fts(rowid, codigoBarra, descripcion, categoria, marca, modelo)
  VALUES (new.id, new.codigoBarra, new.descripcion, new.categoria, new.marca, new.modelo);
END;
