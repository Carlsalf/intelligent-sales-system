require("dotenv").config();
const app = require("./app");
const { initDb } = require("./db/init");

const PORT = process.env.PORT || 3001;

(async () => {
  await initDb();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();
