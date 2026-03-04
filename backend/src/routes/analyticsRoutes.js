const express = require("express");
const { getSummary, getCategories } = require("../controllers/analyticsController");
const { requireAuth } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");

const router = express.Router();

router.use(requireAuth);

router.get("/summary", allowRoles("admin", "user", "read-only"), getSummary);
router.get("/categories", allowRoles("admin", "user", "read-only"), getCategories);

module.exports = router;