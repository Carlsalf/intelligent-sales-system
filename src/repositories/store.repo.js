const { getDb } = require("../db/connection");

function listProducts({ search = "", categoryId = null } = {}) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    const conditions = ["p.estado = 1", "c.estado = 1"];
    const params = [];

    if (search) {
      const normalizedProductName = `
        LOWER(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(p.nombre, 'á', 'a'),
                    'é', 'e'
                  ),
                  'í', 'i'
                ),
                'ó', 'o'
              ),
              'ú', 'u'
            ),
            'ñ', 'n'
          )
        )
      `;

      const normalizedCategoryName = `
        LOWER(
          REPLACE(
            REPLACE(
              REPLACE(
                REPLACE(
                  REPLACE(
                    REPLACE(c.nombre, 'á', 'a'),
                    'é', 'e'
                  ),
                  'í', 'i'
                ),
                'ó', 'o'
              ),
              'ú', 'u'
            ),
            'ñ', 'n'
          )
        )
      `;

      conditions.push(
        `(${normalizedProductName} LIKE ? OR ${normalizedCategoryName} LIKE ?)`
      );

      const term = `%${search}%`;
      params.push(term, term);
    }

    if (categoryId) {
      conditions.push("p.id_categoria = ?");
      params.push(categoryId);
    }

    const sql = `
      SELECT
        p.id_producto AS id,
        p.nombre,
        p.precio,
        p.id_categoria,
        c.nombre AS categoria,
        NULL AS descripcion,
        NULL AS imagen_url
      FROM producto p
      INNER JOIN categoria c
        ON c.id_categoria = p.id_categoria
      WHERE ${conditions.join(" AND ")}
      ORDER BY p.nombre ASC
    `;

    db.all(sql, params, (error, rows) => {
      db.close();

      if (error) return reject(error);
      resolve(rows || []);
    });
  });
}

function findProductById(id_producto) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.get(
      `SELECT
         p.id_producto AS id,
         p.nombre,
         p.precio,
         p.id_categoria,
         c.nombre AS categoria,
         NULL AS descripcion,
         NULL AS imagen_url
       FROM producto p
       INNER JOIN categoria c
         ON c.id_categoria = p.id_categoria
       WHERE p.id_producto = ?
         AND p.estado = 1
         AND c.estado = 1`,
      [id_producto],
      (error, row) => {
        db.close();

        if (error) return reject(error);
        resolve(row || null);
      }
    );
  });
}

function listCategories() {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.all(
      `SELECT
         c.id_categoria AS id,
         c.nombre,
         COUNT(p.id_producto) AS cantidad_productos
       FROM categoria c
       LEFT JOIN producto p
         ON p.id_categoria = c.id_categoria
        AND p.estado = 1
       WHERE c.estado = 1
       GROUP BY c.id_categoria, c.nombre
       ORDER BY c.nombre ASC`,
      [],
      (error, rows) => {
        db.close();

        if (error) return reject(error);
        resolve(rows || []);
      }
    );
  });
}

module.exports = {
  listProducts,
  findProductById,
  listCategories,
};
