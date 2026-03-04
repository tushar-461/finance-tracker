const { HttpError } = require("../utils/httpError");

function allowRoles(...roles) {
  return (req, _res, next) => {
    if (!req.user) {
      return next(new HttpError(401, "Authentication required."));
    }

    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, "You are not allowed to perform this action."));
    }

    return next();
  };
}

module.exports = { allowRoles };