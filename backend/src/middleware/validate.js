const { validationResult } = require("express-validator");

function validateRequest(req, _res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next({ status: 400, message: errors.array()[0].msg });
  }
  return next();
}

module.exports = { validateRequest };