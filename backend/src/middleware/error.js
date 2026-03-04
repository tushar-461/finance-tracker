function notFoundHandler(_req, _res, next) {
  next({ status: 404, message: "Route not found." });
}

function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;
  const message = error.message || "Internal server error.";

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({ message });
}

module.exports = { notFoundHandler, errorHandler };