const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const adminController = require("../controllers/adminController");

const router = express.Router();

router.use(requireAuth, requireAdmin);
router.get("/users", adminController.listUsers);
router.delete("/users/:userId", adminController.removeUser);
router.get("/analytics", adminController.getAnalytics);

module.exports = router;
