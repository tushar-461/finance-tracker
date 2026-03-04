const { pool } = require("../config/db");

async function listUsers(_req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, created_at
       FROM users
       ORDER BY created_at DESC`,
    );

    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

module.exports = { listUsers };