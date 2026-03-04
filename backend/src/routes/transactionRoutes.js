const express = require("express");
const { body, param } = require("express-validator");
const {
  listTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");
const { requireAuth } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");
const { validateRequest } = require("../middleware/validate");

const router = express.Router();

router.use(requireAuth);

router.get("/", allowRoles("admin", "user", "read-only"), listTransactions);

router.post(
  "/",
  allowRoles("admin", "user"),
  [
    body("date").isISO8601().withMessage("Date must be valid."),
    body("type").isIn(["income", "expense"]).withMessage("Type must be income or expense."),
    body("category").trim().notEmpty().withMessage("Category is required."),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0."),
    body("note").trim().notEmpty().withMessage("Note is required."),
  ],
  validateRequest,
  createTransaction,
);

router.put(
  "/:id",
  allowRoles("admin", "user"),
  [
    param("id").isUUID().withMessage("Transaction id must be a UUID."),
    body("date").isISO8601().withMessage("Date must be valid."),
    body("type").isIn(["income", "expense"]).withMessage("Type must be income or expense."),
    body("category").trim().notEmpty().withMessage("Category is required."),
    body("amount").isFloat({ gt: 0 }).withMessage("Amount must be greater than 0."),
    body("note").trim().notEmpty().withMessage("Note is required."),
  ],
  validateRequest,
  updateTransaction,
);

router.delete(
  "/:id",
  allowRoles("admin", "user"),
  [param("id").isUUID().withMessage("Transaction id must be a UUID.")],
  validateRequest,
  deleteTransaction,
);

module.exports = router;