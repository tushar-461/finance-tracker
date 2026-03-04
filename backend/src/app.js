const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { config } = require("./config/env");
const { authLimiter, transactionLimiter, analyticsLimiter } = require("./middleware/rateLimit");
const { sanitizeBody } = require("./middleware/sanitize");
const { errorHandler, notFoundHandler } = require("./middleware/error");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl,
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(sanitizeBody);

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, message: "Finance Tracker API is healthy" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/transactions", transactionLimiter, transactionRoutes);
app.use("/api/analytics", analyticsLimiter, analyticsRoutes);
app.use("/api/users", userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = { app };