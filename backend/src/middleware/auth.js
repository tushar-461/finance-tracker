const { verifyToken } = require("../utils/jwt");
const { HttpError } = require("../utils/httpError");

function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      throw new HttpError(401, "Authentication required.");
    }

    const payload = verifyToken(token);
    req.user = {
      id: payload.sub,
      role: payload.role,
    };
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return next(new HttpError(401, "Invalid or expired token."));
    }
    return next(error);
  }
}

module.exports = { requireAuth };