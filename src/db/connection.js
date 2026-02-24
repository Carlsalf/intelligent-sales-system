const sqlite3 = require("sqlite3").verbose();

function getDb() {
  const dbPath = process.env.DB_PATH || "./src/db/database.sqlite";
  return new sqlite3.Database(dbPath);
}

module.exports = { getDb };
