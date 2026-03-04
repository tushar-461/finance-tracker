const { pool } = require("../config/db");
const { cacheDelPattern } = require("../utils/cache");
const { HttpError } = require("../utils/httpError");

function canAccessTransaction(user, transactionUserId) {
  return user.role === "admin" || user.id === transactionUserId;
}

async function listTransactions(req, res, next) {
  try {
    const { id, role } = req.user;
    const { search = "", category = "" } = req.query;

    let query = `
      SELECT id, user_id, date, type, category, amount, note, created_at
      FROM transactions
      WHERE 1=1
    `;
    const params = [];

    if (role !== "admin") {
      params.push(id);
      query += ` AND user_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (note ILIKE $${params.length} OR category ILIKE $${params.length})`;
    }

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }

    query += " ORDER BY date DESC, created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
}

async function createTransaction(req, res, next) {
  try {
    const { id: userId } = req.user;
    const { date, type, category, amount, note } = req.body;

    const result = await pool.query(
      `INSERT INTO transactions (user_id, date, type, category, amount, note)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, user_id, date, type, category, amount, note, created_at`,
      [userId, date, type, category, amount, note],
    );

    await cacheDelPattern(`analytics:${userId}:*`);
    await cacheDelPattern("categories:*");

    res.status(201).json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function updateTransaction(req, res, next) {
  try {
    const { id: userId, role } = req.user;
    const { id: transactionId } = req.params;
    const { date, type, category, amount, note } = req.body;

    const existing = await pool.query(
      "SELECT id, user_id FROM transactions WHERE id = $1",
      [transactionId],
    );

    if (!existing.rows.length) {
      throw new HttpError(404, "Transaction not found.");
    }

    const transaction = existing.rows[0];
    if (!canAccessTransaction({ id: userId, role }, transaction.user_id)) {
      throw new HttpError(403, "Not allowed to update this transaction.");
    }

    const result = await pool.query(
      `UPDATE transactions
       SET date = $1, type = $2, category = $3, amount = $4, note = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING id, user_id, date, type, category, amount, note, updated_at`,
      [date, type, category, amount, note, transactionId],
    );

    await cacheDelPattern(`analytics:${transaction.user_id}:*`);
    await cacheDelPattern("categories:*");

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
}

async function deleteTransaction(req, res, next) {
  try {
    const { id: userId, role } = req.user;
    const { id: transactionId } = req.params;

    const existing = await pool.query(
      "SELECT id, user_id FROM transactions WHERE id = $1",
      [transactionId],
    );

    if (!existing.rows.length) {
      throw new HttpError(404, "Transaction not found.");
    }

    const transaction = existing.rows[0];
    if (!canAccessTransaction({ id: userId, role }, transaction.user_id)) {
      throw new HttpError(403, "Not allowed to delete this transaction.");
    }

    await pool.query("DELETE FROM transactions WHERE id = $1", [transactionId]);

    await cacheDelPattern(`analytics:${transaction.user_id}:*`);
    await cacheDelPattern("categories:*");

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
};