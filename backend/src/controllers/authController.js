const bcrypt = require("bcryptjs");
const { pool } = require("../config/db");
const { signToken } = require("../utils/jwt");
const { HttpError } = require("../utils/httpError");

async function register(req, res, next) {
  try {
    const { name, email, password, role = "user" } = req.body;

    const roleValue = ["admin", "user", "read-only"].includes(role) ? role : "user";

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length) {
      throw new HttpError(409, "Email already exists.");
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash, roleValue],
    );

    res.status(201).json({ user: result.rows[0] });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `SELECT id, name, email, role, password_hash
       FROM users
       WHERE email = $1`,
      [email],
    );

    const user = result.rows[0];
    if (!user) {
      throw new HttpError(401, "Invalid credentials.");
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      throw new HttpError(401, "Invalid credentials.");
    }

    const token = signToken(user);

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
};