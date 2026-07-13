const { getDb } = require("../db/connection");

function getCustomerAccountByEmail(email) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.get(
      `SELECT
         cc.id_cliente_cuenta,
         cc.id_cliente,
         cc.email,
         cc.password_hash,
         cc.estado AS cuenta_estado,
         cc.email_verificado,
         cc.ultimo_acceso,
         cc.created_at,
         cc.updated_at,
         c.nombre,
         c.documento,
         c.telefono,
         c.estado AS cliente_estado
       FROM cliente_cuenta cc
       INNER JOIN cliente c
         ON c.id_cliente = cc.id_cliente
       WHERE lower(cc.email) = lower(?)
       LIMIT 1`,
      [email],
      (error, row) => {
        db.close();

        if (error) return reject(error);
        resolve(row || null);
      }
    );
  });
}

function getCustomerAccountById(id_cliente) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.get(
      `SELECT
         cc.id_cliente_cuenta,
         cc.id_cliente,
         cc.email,
         cc.estado AS cuenta_estado,
         cc.email_verificado,
         cc.ultimo_acceso,
         cc.created_at,
         cc.updated_at,
         c.nombre,
         c.documento,
         c.telefono,
         c.estado AS cliente_estado
       FROM cliente_cuenta cc
       INNER JOIN cliente c
         ON c.id_cliente = cc.id_cliente
       WHERE cc.id_cliente = ?
       LIMIT 1`,
      [id_cliente],
      (error, row) => {
        db.close();

        if (error) return reject(error);
        resolve(row || null);
      }
    );
  });
}

function createCustomerIdentity({
  nombre,
  documento,
  telefono,
  email,
  password_hash,
}) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      db.run("BEGIN TRANSACTION");

      db.run(
        `INSERT INTO cliente(
           nombre,
           documento,
           telefono,
           email,
           estado,
           created_at,
           updated_at
         )
         VALUES (?, ?, ?, ?, 1, datetime('now'), datetime('now'))`,
        [
          nombre,
          documento || null,
          telefono || null,
          email,
        ],
        function (clientError) {
          if (clientError) {
            return db.run("ROLLBACK", () => {
              db.close();
              reject(clientError);
            });
          }

          const id_cliente = this.lastID;

          db.run(
            `INSERT INTO cliente_cuenta(
               id_cliente,
               email,
               password_hash,
               estado,
               email_verificado,
               created_at,
               updated_at
             )
             VALUES (?, ?, ?, 1, 0, datetime('now'), datetime('now'))`,
            [id_cliente, email, password_hash],
            function (accountError) {
              if (accountError) {
                return db.run("ROLLBACK", () => {
                  db.close();
                  reject(accountError);
                });
              }

              const id_cliente_cuenta = this.lastID;

              db.run("COMMIT", (commitError) => {
                db.close();

                if (commitError) return reject(commitError);

                resolve({
                  id_cliente,
                  id_cliente_cuenta,
                  nombre,
                  documento: documento || null,
                  telefono: telefono || null,
                  email,
                  estado: 1,
                  email_verificado: 0,
                });
              });
            }
          );
        }
      );
    });
  });
}

function updateCustomerLastAccess(id_cliente_cuenta) {
  const db = getDb();

  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE cliente_cuenta
       SET ultimo_acceso = datetime('now'),
           updated_at = datetime('now')
       WHERE id_cliente_cuenta = ?`,
      [id_cliente_cuenta],
      function (error) {
        const changes = this?.changes || 0;
        db.close();

        if (error) return reject(error);

        resolve({
          updated: changes > 0,
          id_cliente_cuenta,
        });
      }
    );
  });
}

module.exports = {
  getCustomerAccountByEmail,
  getCustomerAccountById,
  createCustomerIdentity,
  updateCustomerLastAccess,
};
