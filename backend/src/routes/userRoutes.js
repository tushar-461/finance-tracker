const express = require("express");
const { listUsers } = require("../controllers/userController");
const { requireAuth } = require("../middleware/auth");
const { allowRoles } = require("../middleware/rbac");

const router = express.Router();

router.get("/", requireAuth, allowRoles("admin"), listUsers);

module.exports = router;