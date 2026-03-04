const { pool } = require("../config/db");
const { cacheGet, cacheSet } = require("../utils/cache");

function currentAndPreviousYear() {
  const year = new Date().getFullYear();
  return [year - 1, year];
}

async function getSummary(req, res, next) {
  try {
    const { id: userId } = req.user;
    const cacheKey = `analytics:${userId}:summary`;

    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.json({ ...cached, cached: true });
    }

    const trendQuery = await pool.query(
      `SELECT TO_CHAR(date_trunc('month', date), 'Mon') AS month,
              SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END)::float AS income,
              SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END)::float AS expense
       FROM transactions
       WHERE user_id = $1
       GROUP BY date_trunc('month', date)
       ORDER BY date_trunc('month', date)`,
      [userId],
    );

    const categoryQuery = await pool.query(
      `SELECT category AS name, SUM(amount)::float AS value
       FROM transactions
       WHERE user_id = $1 AND type = 'expense'
       GROUP BY category
       ORDER BY value DESC`,
      [userId],
    );

    const [prevYear, currentYear] = currentAndPreviousYear();
    const yearlyQuery = await pool.query(
      `SELECT EXTRACT(YEAR FROM date)::int::text AS year, SUM(amount)::float AS amount
       FROM transactions
       WHERE user_id = $1
         AND EXTRACT(YEAR FROM date) = ANY($2::int[])
         AND type = 'expense'
       GROUP BY EXTRACT(YEAR FROM date)
       ORDER BY year`,
      [userId, [prevYear, currentYear]],
    );

    const data = {
      trend: trendQuery.rows,
      categoryBreakdown: categoryQuery.rows,
      yearly: yearlyQuery.rows,
      cached: false,
    };

    await cacheSet(cacheKey, data, 15 * 60);

    return res.json(data);
  } catch (error) {
    return next(error);
  }
}

async function getCategories(req, res, next) {
  try {
    const cacheKey = "categories:list";
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.json({ categories: cached, cached: true });
    }

    const result = await pool.query(
      `SELECT DISTINCT category
       FROM transactions
       ORDER BY category ASC`,
    );

    const categories = result.rows.map((row) => row.category);
    await cacheSet(cacheKey, categories, 60 * 60);

    return res.json({ categories, cached: false });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getSummary,
  getCategories,
};