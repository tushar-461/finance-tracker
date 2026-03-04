const express = require("express");
const { body } = require("express-validator");
const { register, login } = require("../controllers/authController");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name must be at least 2 characters."),
    body("email").isEmail().withMessage("Email must be valid."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters."),
    body("role")
      .optional()
      .isIn(["admin", "user", "read-only"])
      .withMessage("Role is invalid."),
  ],
  validateRequest,
  register,
);

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Email must be valid."),
    body("password").notEmpty().withMessage("Password is required."),
  ],
  validateRequest,
  login,
);

module.exports = router;