const { getDb } = require("../db/connection");

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) {
        return reject(error);
      }

      resolve({
        lastID: this.lastID,
        changes: this.changes,
      });
    });
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => {
      if (error) {
        return reject(error);
      }

      resolve(row || null);
    });
  });
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) {
        return reject(error);
      }

      resolve(rows || []);
    });
  });
}

function closeDb(db) {
  return new Promise((resolve) => {
    db.close(() => resolve());
  });
}

async function listCustomerAddresses(id_cliente) {
  const db = getDb();

  try {
    return await all(
      db,
      `SELECT
         id_direccion,
         id_cliente,
         alias,
         destinatario,
         telefono,
         direccion_linea_1,
         direccion_linea_2,
         ciudad,
         provincia,
         codigo_postal,
         pais,
         referencia,
         es_principal,
         estado,
         created_at,
         updated_at
       FROM cliente_direccion
       WHERE id_cliente = ?
         AND estado = 1
       ORDER BY es_principal DESC,
                updated_at DESC,
                id_direccion DESC`,
      [id_cliente]
    );
  } finally {
    await closeDb(db);
  }
}

async function getCustomerAddressById(
  id_cliente,
  id_direccion,
  includeInactive = false
) {
  const db = getDb();

  try {
    const stateClause = includeInactive
      ? ""
      : "AND estado = 1";

    return await get(
      db,
      `SELECT
         id_direccion,
         id_cliente,
         alias,
         destinatario,
         telefono,
         direccion_linea_1,
         direccion_linea_2,
         ciudad,
         provincia,
         codigo_postal,
         pais,
         referencia,
         es_principal,
         estado,
         created_at,
         updated_at
       FROM cliente_direccion
       WHERE id_cliente = ?
         AND id_direccion = ?
         ${stateClause}
       LIMIT 1`,
      [id_cliente, id_direccion]
    );
  } finally {
    await closeDb(db);
  }
}

async function createCustomerAddress(
  id_cliente,
  address
) {
  const db = getDb();

  try {
    await run(db, "BEGIN IMMEDIATE TRANSACTION");

    const activeCountRow = await get(
      db,
      `SELECT COUNT(*) AS total
       FROM cliente_direccion
       WHERE id_cliente = ?
         AND estado = 1`,
      [id_cliente]
    );

    const isFirstAddress =
      Number(activeCountRow?.total || 0) === 0;

    const shouldBeDefault =
      isFirstAddress ||
      Number(address.es_principal) === 1;

    if (shouldBeDefault) {
      await run(
        db,
        `UPDATE cliente_direccion
         SET es_principal = 0,
             updated_at = datetime('now')
         WHERE id_cliente = ?
           AND estado = 1`,
        [id_cliente]
      );
    }

    const result = await run(
      db,
      `INSERT INTO cliente_direccion(
         id_cliente,
         alias,
         destinatario,
         telefono,
         direccion_linea_1,
         direccion_linea_2,
         ciudad,
         provincia,
         codigo_postal,
         pais,
         referencia,
         es_principal,
         estado,
         created_at,
         updated_at
       )
       VALUES (
         ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
         ?, 1, datetime('now'), datetime('now')
       )`,
      [
        id_cliente,
        address.alias,
        address.destinatario,
        address.telefono,
        address.direccion_linea_1,
        address.direccion_linea_2,
        address.ciudad,
        address.provincia,
        address.codigo_postal,
        address.pais,
        address.referencia,
        shouldBeDefault ? 1 : 0,
      ]
    );

    await run(db, "COMMIT");

    return await getCustomerAddressById(
      id_cliente,
      result.lastID
    );
  } catch (error) {
    try {
      await run(db, "ROLLBACK");
    } catch {
      // Se conserva el error original.
    }

    throw error;
  } finally {
    await closeDb(db);
  }
}

async function updateCustomerAddress(
  id_cliente,
  id_direccion,
  address
) {
  const db = getDb();

  try {
    await run(db, "BEGIN IMMEDIATE TRANSACTION");

    const current = await get(
      db,
      `SELECT
         id_direccion,
         es_principal,
         estado
       FROM cliente_direccion
       WHERE id_cliente = ?
         AND id_direccion = ?
       LIMIT 1`,
      [id_cliente, id_direccion]
    );

    if (!current || Number(current.estado) !== 1) {
      const error = new Error(
        "Dirección no encontrada."
      );
      error.status = 404;
      error.code = "CUSTOMER_ADDRESS_NOT_FOUND";
      throw error;
    }

    const shouldBeDefault =
      Number(address.es_principal) === 1;

    if (shouldBeDefault) {
      await run(
        db,
        `UPDATE cliente_direccion
         SET es_principal = 0,
             updated_at = datetime('now')
         WHERE id_cliente = ?
           AND estado = 1`,
        [id_cliente]
      );
    }

    const result = await run(
      db,
      `UPDATE cliente_direccion
       SET alias = ?,
           destinatario = ?,
           telefono = ?,
           direccion_linea_1 = ?,
           direccion_linea_2 = ?,
           ciudad = ?,
           provincia = ?,
           codigo_postal = ?,
           pais = ?,
           referencia = ?,
           es_principal = ?,
           updated_at = datetime('now')
       WHERE id_cliente = ?
         AND id_direccion = ?
         AND estado = 1`,
      [
        address.alias,
        address.destinatario,
        address.telefono,
        address.direccion_linea_1,
        address.direccion_linea_2,
        address.ciudad,
        address.provincia,
        address.codigo_postal,
        address.pais,
        address.referencia,
        shouldBeDefault
          ? 1
          : Number(current.es_principal) === 1
            ? 1
            : 0,
        id_cliente,
        id_direccion,
      ]
    );

    if (result.changes !== 1) {
      const error = new Error(
        "No fue posible actualizar la dirección."
      );
      error.status = 409;
      error.code = "CUSTOMER_ADDRESS_UPDATE_FAILED";
      throw error;
    }

    await run(db, "COMMIT");

    return await getCustomerAddressById(
      id_cliente,
      id_direccion
    );
  } catch (error) {
    try {
      await run(db, "ROLLBACK");
    } catch {
      // Se conserva el error original.
    }

    throw error;
  } finally {
    await closeDb(db);
  }
}

async function setDefaultCustomerAddress(
  id_cliente,
  id_direccion
) {
  const db = getDb();

  try {
    await run(db, "BEGIN IMMEDIATE TRANSACTION");

    const current = await get(
      db,
      `SELECT id_direccion
       FROM cliente_direccion
       WHERE id_cliente = ?
         AND id_direccion = ?
         AND estado = 1
       LIMIT 1`,
      [id_cliente, id_direccion]
    );

    if (!current) {
      const error = new Error(
        "Dirección no encontrada."
      );
      error.status = 404;
      error.code = "CUSTOMER_ADDRESS_NOT_FOUND";
      throw error;
    }

    await run(
      db,
      `UPDATE cliente_direccion
       SET es_principal = 0,
           updated_at = datetime('now')
       WHERE id_cliente = ?
         AND estado = 1`,
      [id_cliente]
    );

    await run(
      db,
      `UPDATE cliente_direccion
       SET es_principal = 1,
           updated_at = datetime('now')
       WHERE id_cliente = ?
         AND id_direccion = ?
         AND estado = 1`,
      [id_cliente, id_direccion]
    );

    await run(db, "COMMIT");

    return await getCustomerAddressById(
      id_cliente,
      id_direccion
    );
  } catch (error) {
    try {
      await run(db, "ROLLBACK");
    } catch {
      // Se conserva el error original.
    }

    throw error;
  } finally {
    await closeDb(db);
  }
}

async function deactivateCustomerAddress(
  id_cliente,
  id_direccion
) {
  const db = getDb();

  try {
    await run(db, "BEGIN IMMEDIATE TRANSACTION");

    const current = await get(
      db,
      `SELECT
         id_direccion,
         es_principal,
         estado
       FROM cliente_direccion
       WHERE id_cliente = ?
         AND id_direccion = ?
       LIMIT 1`,
      [id_cliente, id_direccion]
    );

    if (!current || Number(current.estado) !== 1) {
      const error = new Error(
        "Dirección no encontrada."
      );
      error.status = 404;
      error.code = "CUSTOMER_ADDRESS_NOT_FOUND";
      throw error;
    }

    await run(
      db,
      `UPDATE cliente_direccion
       SET estado = 0,
           es_principal = 0,
           updated_at = datetime('now')
       WHERE id_cliente = ?
         AND id_direccion = ?
         AND estado = 1`,
      [id_cliente, id_direccion]
    );

    if (Number(current.es_principal) === 1) {
      const replacement = await get(
        db,
        `SELECT id_direccion
         FROM cliente_direccion
         WHERE id_cliente = ?
           AND estado = 1
         ORDER BY updated_at DESC,
                  id_direccion DESC
         LIMIT 1`,
        [id_cliente]
      );

      if (replacement) {
        await run(
          db,
          `UPDATE cliente_direccion
           SET es_principal = 1,
               updated_at = datetime('now')
           WHERE id_cliente = ?
             AND id_direccion = ?`,
          [
            id_cliente,
            replacement.id_direccion,
          ]
        );
      }
    }

    await run(db, "COMMIT");

    return {
      id_direccion,
      deactivated: true,
    };
  } catch (error) {
    try {
      await run(db, "ROLLBACK");
    } catch {
      // Se conserva el error original.
    }

    throw error;
  } finally {
    await closeDb(db);
  }
}

module.exports = {
  listCustomerAddresses,
  getCustomerAddressById,
  createCustomerAddress,
  updateCustomerAddress,
  setDefaultCustomerAddress,
  deactivateCustomerAddress,
};
