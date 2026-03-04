const { app } = require("./app");
const { config } = require("./config/env");
const { pool } = require("./config/db");
const { connectRedis } = require("./config/redis");

async function start() {
  try {
    await pool.query("SELECT 1");
    await connectRedis();

    app.listen(config.port, () => {
      console.log(`API running on port ${config.port}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

start();