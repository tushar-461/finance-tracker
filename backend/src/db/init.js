const fs = require("fs");
const path = require("path");
const { pool } = require("../config/db");

async function init() {
  const schemaPath = path.resolve(__dirname, "schema.sql");
  const sql = fs.readFileSync(schemaPath, "utf-8");

  try {
    await pool.query(sql);
    console.log("Database schema initialized.");
  } catch (error) {
    console.error("Schema init failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

init();