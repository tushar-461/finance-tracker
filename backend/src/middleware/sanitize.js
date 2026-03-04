const xss = require("xss");

function sanitize(value) {
  if (typeof value === "string") {
    return xss(value.trim());
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitize(item));
  }

  if (value && typeof value === "object") {
    return Object.entries(value).reduce((acc, [key, current]) => {
      acc[key] = sanitize(current);
      return acc;
    }, {});
  }

  return value;
}

function sanitizeBody(req, _res, next) {
  if (req.body && typeof req.body === "object") {
    req.body = sanitize(req.body);
  }
  next();
}

module.exports = { sanitizeBody };